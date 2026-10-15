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
  for (const file of ['0001_schema.sql','0002_content.sql','0005_recipe_workbook.sql','0006_recipe_shopping_modes.sql']) {
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
    for (const path of ['/api/admin/recipes','/api/admin/shopping-lists','/api/admin/collections','/api/admin/questionnaires','/api/admin/questionnaires/test/responses','/api/admin/questionnaires/test/export']) expect((await request(path)).status).toBe(401);
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
  it('round-trips structured recipe fields and preserves the immutable source archive', async () => {
    const base = { title:'Imported test',praline:'Test',yieldAmount:'60 Stück',ingredients:'',method:'',notes:'Original note',ingredientRows:[{ id:'zero',name:'Eierlikör',amount:0,unit:'ml',section:'Füllung',notes:'Prüfen' }],sourceReferences:'Testbuch',alternatives:'100 g Zucker',status:'not-recommended',warnings:['Menge prüfen'] };
    expect((await request('/api/admin/recipes/structured',{method:'PUT',body:JSON.stringify(base)},true)).status).toBe(200);
    const archive = {sheetName:'Testquelle',cells:[{address:'A1',row:1,column:1,value:0}]};
    await env.DB.prepare('UPDATE recipes SET source_archive = ? WHERE id = ?').bind(JSON.stringify(archive),'structured').run();
    // Simulate an older client: missing new fields must not erase imported details.
    expect((await request('/api/admin/recipes/structured',{method:'PUT',body:JSON.stringify({title:base.title,praline:base.praline,yieldAmount:base.yieldAmount,ingredients:'Existing text',method:'',notes:'Edited',sourceArchive:{sheetName:'tampered'}})},true)).status).toBe(200);
    const rows = await (await request('/api/admin/recipes',{},true)).json() as {id:string;ingredientRows:{amount:number}[];sourceArchive:unknown;status:string}[];
    expect(rows.find(r=>r.id==='structured')).not.toHaveProperty('status');
    expect(rows.find(r=>r.id==='structured')).toMatchObject({ingredientRows:[{amount:0}],sourceArchive:archive});
  });
  it('saves private shopping-list data with unknown and zero quantities intact', async () => {
    const list = {title:'Test list',year:2025,items:[{id:'a',name:'Matcha',amount:0,unit:'Dose',section:'Zutaten',notes:'Originalwert'},{id:'b',name:'Teigfäden',amount:null,unit:'',section:'Sonstiges',notes:''}],extras:'Frühstück',equipment:'Gitter',notes:'Notiz',ordering:'https://example.com',warnings:['Formel prüfen']};
    expect((await request('/api/admin/shopping-lists/list',{method:'PUT',body:JSON.stringify(list)},true)).status).toBe(200);
    const lists = await (await request('/api/admin/shopping-lists',{},true)).json() as {items:{amount:number|null}[]}[];
    expect(lists[0].items.map(i=>i.amount)).toEqual([0,null]);
    expect((await request('/api/admin/shopping-lists/list',{method:'PUT',headers:{Cookie:outsiderCookie},body:JSON.stringify(list)})).status).toBe(403);
  });
  it('adds recipes, persists checkmarks and rejects stale shopping-list writes', async () => {
    const ingredient={id:'choc',name:'Zartbitterschokolade',amount:100,unit:'g',section:'Füllung',notes:'Fein hacken'};
    const recipe={title:'Shopping test',praline:'',yieldAmount:'',ingredients:'',ingredientRows:[ingredient],method:'',notes:''};
    await request('/api/admin/recipes/shopping-test',{method:'PUT',body:JSON.stringify(recipe)},true);
    const initial={title:'New list',year:2026,items:[],extras:'',equipment:'',notes:'',ordering:'',warnings:[]};
    const created=await (await request('/api/admin/shopping-lists/new-list',{method:'PUT',body:JSON.stringify(initial)},true)).json() as Record<string,any>;
    expect(created.revision).toBe(1);
    const add=(revision:number,admin=true)=>request('/api/admin/shopping-lists/new-list/recipes',{method:'POST',body:JSON.stringify({recipeId:'shopping-test',revision})},admin);
    expect((await add(1,false)).status).toBe(401);
    const first=await (await add(1)).json() as Record<string,any>;
    expect(first.id).toBe(created.id);
    expect(first.items[0]).toMatchObject({amount:100,checked:false});
    const checked=await (await request('/api/admin/shopping-lists/new-list',{method:'PUT',body:JSON.stringify({...first,items:first.items.map((i:object)=>({...i,checked:true}))})},true)).json() as Record<string,any>;
    expect(checked.items[0].checked).toBe(true);
    expect((await add(first.revision)).status).toBe(409);
    const second=await request(`/api/admin/shopping-lists/${first.id}/recipes`,{method:'POST',body:JSON.stringify({recipeId:'shopping-test',revision:checked.revision})},true);
    expect(second.status).toBe(200);
    const combined=await second.json() as Record<string,any>;
    expect(combined.id).toBe(first.id);
    expect(combined.items).toHaveLength(1);expect(combined.items[0]).toMatchObject({amount:200,checked:false});
    expect((await request('/api/admin/shopping-lists/new-list',{method:'PUT',body:JSON.stringify(checked)},true)).status).toBe(409);
    const lists=await (await request('/api/admin/shopping-lists',{},true)).json() as Record<string,any>[];
    expect(lists.find(l=>l.id==='new-list')?.items[0].amount).toBe(200);
    expect((await request(`/api/admin/shopping-lists/${combined.id}`,{method:'PUT',body:JSON.stringify(combined)},true)).status).toBe(200);
  });
  it('shows only published collections and persists private recipes', async () => {
    const collections = await (await request('/api/collections')).json() as { id:string }[];
    expect(collections).toHaveLength(5);
    const saved = await request('/api/admin/recipes/recipe', { method:'PUT', body:JSON.stringify({ title:'Himbeer', praline:'Himbeer', yieldAmount:'30 Stück', ingredients:'100 g Schokolade', method:'Schmelzen.', notes:'Test' }) },true);
    expect(saved.status).toBe(200);
    const recipes = await (await request('/api/admin/recipes',{},true)).json() as { title:string }[];
    expect(recipes.some(r=>r.title==='Himbeer')).toBe(true);
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
