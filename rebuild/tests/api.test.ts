import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { Miniflare } from 'miniflare';
import { readFile } from 'node:fs/promises';
import { createHmac } from 'node:crypto';
import app from '../worker/index';
import type { Env } from '../worker/auth';

let mf: Miniflare; let env: Env; let adminCookie: string; let outsiderCookie: string;
const secret = 'test-only-secret-with-more-than-32-characters';
function cookie(token: string) { return `better-auth.session_token=${encodeURIComponent(`${token}.${createHmac('sha256',secret).update(token).digest('base64')}`)}`; }
function request(path: string, options: RequestInit = {}, admin = false) {
  return app.fetch(new Request(`http://localhost:5173${path}`, { ...options, headers:{ Origin:'http://localhost:5173', ...(admin ? { Cookie:adminCookie } : {}), ...options.headers } }), env);
}
beforeAll(async () => {
  mf = new Miniflare({ modules:true, script:'export default { fetch() { return new Response("test"); } };', compatibilityDate:'2026-05-01', d1Databases:{ DB:'test-pralinen' } });
  const db = await mf.getD1Database('DB') as unknown as D1Database;
  for (const file of ['0001_schema.sql','0002_content.sql']) {
    const sql = await readFile(new URL(`../migrations/${file}`,import.meta.url),'utf8');
    await db.exec(sql.replaceAll('\n',' '));
  }
  env = { DB:db, APP_URL:'http://localhost:5173', ASSETS: { fetch: () => Promise.resolve(new Response('assets')) } as unknown as Fetcher, BETTER_AUTH_SECRET:secret, GOOGLE_CLIENT_ID:'test-client', GOOGLE_CLIENT_SECRET:'test-secret' };
  const now = Date.now();
  for (const [id,email] of [['admin','admin@example.test'],['outsider','outsider@example.test']]) {
    await db.prepare('INSERT INTO user (id,name,email,emailVerified,createdAt,updatedAt) VALUES (?,?,?,1,?,?)').bind(id,id,email,now,now).run();
    await db.prepare('INSERT INTO session (id,userId,token,expiresAt,createdAt,updatedAt) VALUES (?,?,?,?,?,?)').bind(id,id,`${id}-token`,now+3600000,now,now).run();
  }
  await db.prepare('INSERT INTO admin_invites (email) VALUES (?)').bind('admin@example.test').run();
  adminCookie = cookie('admin-token'); outsiderCookie = cookie('outsider-token');
});
afterAll(async () => { await mf?.dispose(); });

describe('private access', () => {
  it('denies unauthenticated reads, writes and exports', async () => {
    for (const path of ['/api/admin/recipes','/api/admin/collections','/api/admin/questionnaires','/api/admin/questionnaires/test/responses','/api/admin/questionnaires/test/export']) expect((await request(path)).status).toBe(401);
    expect((await request('/api/admin/collections/new', { method:'PUT', body:'{}' })).status).toBe(401);
  });
  it('rejects a valid session without an invitation and foreign-origin writes', async () => {
    expect((await request('/api/admin/recipes',{ headers:{ Cookie:outsiderCookie } })).status).toBe(403);
    expect((await request('/api/admin/recipes/new',{ method:'PUT', headers:{ Origin:'https://attacker.test' }, body:'{}' },true)).status).toBe(403);
  });
  it('allows invited admins and revokes access immediately when the invite is removed', async () => {
    expect((await request('/api/admin/recipes',{},true)).status).toBe(200);
    await env.DB.prepare('DELETE FROM admin_invites WHERE email = ?').bind('admin@example.test').run();
    expect((await request('/api/admin/recipes',{},true)).status).toBe(403);
    await env.DB.prepare('INSERT INTO admin_invites (email) VALUES (?)').bind('admin@example.test').run();
  });
});

describe('collection, recipe and questionnaire flow', () => {
  it('shows only published collections and persists private recipes', async () => {
    const collections = await (await request('/api/collections')).json() as { id:string }[];
    expect(collections).toHaveLength(5);
    const saved = await request('/api/admin/recipes/recipe', { method:'PUT', body:JSON.stringify({ title:'Himbeer', praline:'Himbeer', yieldAmount:'30 Stück', ingredients:'100 g Schokolade', method:'Schmelzen.', notes:'Test' }) },true);
    expect(saved.status).toBe(200);
    const recipes = await (await request('/api/admin/recipes',{},true)).json() as { title:string }[];
    expect(recipes[0].title).toBe('Himbeer');
  });
  it('accepts survey answers only when open and freezes opened questions', async () => {
    const q = { collectionId:'2025', title:'Testumfrage', introduction:'Test', status:'draft', questions:[{ id:'best', label:'Lieblingsstück?', type:'choice', required:true, options:['Himbeer','Kokos'] }] };
    expect((await request('/api/admin/questionnaires/test',{ method:'PUT', body:JSON.stringify(q) },true)).status).toBe(200);
    const rows = await (await request('/api/admin/questionnaires',{},true)).json() as { token:string }[];
    const token = rows[0].token;
    expect((await request(`/api/surveys/${token}`)).status).toBe(404);
    q.status = 'open';
    expect((await request('/api/admin/questionnaires/test',{ method:'PUT', body:JSON.stringify(q) },true)).status).toBe(200);
    expect((await request(`/api/surveys/${token}`)).status).toBe(200);
    expect((await request(`/api/surveys/${token}/responses`,{ method:'POST', body:JSON.stringify({ answers:{ best:'injected' } }) })).status).toBe(400);
    expect((await request(`/api/surveys/${token}/responses`,{ method:'POST', body:JSON.stringify({ answers:{ best:'Kokos' } }) })).status).toBe(201);
    const responses = await (await request('/api/admin/questionnaires/test/responses',{},true)).json() as { answers:Record<string,string> }[];
    expect(responses[0].answers.best).toBe('Kokos');
    expect((await request('/api/admin/questionnaires/test',{ method:'PUT', body:JSON.stringify({ ...q, questions:[{ ...q.questions[0], label:'Andere Frage' }] }) },true)).status).toBe(409);
    q.status = 'closed';
    expect((await request('/api/admin/questionnaires/test',{ method:'PUT', body:JSON.stringify(q) },true)).status).toBe(200);
    expect((await request(`/api/surveys/${token}/responses`,{ method:'POST', body:JSON.stringify({ answers:{ best:'Kokos' } }) })).status).toBe(404);
  });
});
