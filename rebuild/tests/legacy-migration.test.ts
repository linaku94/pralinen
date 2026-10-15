import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Miniflare } from 'miniflare';
import { readFile } from 'node:fs/promises';
// @ts-expect-error Migration scripts are plain JavaScript shared with the CLI.
import { prepareLegacyImport } from '../scripts/legacy-feedback.mjs';

const doc = (id:string, fields:Record<string,unknown>) => ({ id, sourcePath:`projects/pralinen-daac0/databases/(default)/documents/pralinen/${id}`, fields });
const source = { project:'pralinen-daac0', documents:[doc('old',{ name:"O'Neil", timeStamp:'2025-01-02T10:12:13.123Z', bestePraline:'Karlsruhe', schlechtestePraline:'', freitext:"Danke; '); DROP TABLE user; --\nSchön!", password:'DO-NOT-MIGRATE' }),doc('new',{ timeStamp:'2026-02-03T11:23:34.567Z', bestePraline:'Matcha', schlechtestePraline:'Kaktus-Eis', freitext:'' })] };
let mf:Miniflare; let db:D1Database;
beforeAll(async () => {
  mf = new Miniflare({ modules:true, script:'export default { fetch(){ return new Response("test"); } };', compatibilityDate:'2026-05-01', d1Databases:{ DB:'legacy-migration-test' } });
  db = await mf.getD1Database('DB') as unknown as D1Database;
  for (const filename of ['0001_schema.sql','0002_content.sql','0004_legacy_feedback_imports.sql']) await db.exec((await readFile(new URL(`../migrations/${filename}`,import.meta.url),'utf8')).replaceAll('\n',' '));
});
afterAll(async () => { await mf?.dispose(); });
describe('legacy migration', () => {
  it('maps Christmas seasons without changing original labels or timestamps; excludes passwords', () => {
    const plan = prepareLegacyImport(source);
    expect(plan.counts).toEqual({ 2024:1,2025:1 });
    expect(plan.rows[0]).toMatchObject({ name:"O'Neil", createdAt:'2025-01-02 10:12:13.123', answers:{ bestePraline:'Karlsruhe' } });
    expect(plan.rows[1].answers.schlechtestePraline).toBe('Kaktus-Eis');
    expect(plan.sql).not.toContain('DO-NOT-MIGRATE');
    expect(plan.sql).not.toContain('password');
  });
  it('halts for ambiguous dates, incompatible flavours, explicit mismatches or duplicate IDs', () => {
    for (const fields of [{ timeStamp:'2025-08-01T00:00:00Z' },{ timeStamp:'2025-01-01T00:00:00Z', bestePraline:'Matcha' },{ timeStamp:'2025-01-01T00:00:00Z', year:2025 },{ timeStamp:'invalid' }]) expect(() => prepareLegacyImport({ project:source.project, documents:[doc('bad',fields)] })).toThrow();
    expect(() => prepareLegacyImport({ ...source, documents:[source.documents[0],source.documents[0]] })).toThrow();
  });
  it('imports once, preserves quotes/newlines, and leaves history closed and private', async () => {
    const plan = prepareLegacyImport(source);
    for (let run=0;run<2;run++) await db.batch(plan.sql.trim().split('\n').map((s:string) => db.prepare(s)));
    expect(await db.prepare('SELECT COUNT(*) AS total FROM submissions').first()).toEqual({ total:2 });
    expect(await db.prepare('SELECT COUNT(*) AS total FROM legacy_feedback_imports').first()).toEqual({ total:2 });
    const row = await db.prepare('SELECT name,answers,created_at FROM submissions WHERE id = ?').bind(plan.rows[0].id).first<{ name:string; answers:string; created_at:string }>();
    expect(row?.name).toBe("O'Neil");
    expect(JSON.parse(row!.answers).freitext).toBe(source.documents[0].fields.freitext);
    expect(row?.created_at).toBe('2025-01-02 10:12:13.123');
    const qs = await db.prepare('SELECT status,locked FROM questionnaires').all();
    expect(qs.results).toEqual([{ status:'closed',locked:1 },{ status:'closed',locked:1 }]);
    expect(await db.prepare('SELECT COUNT(*) AS total FROM user').first()).toEqual({ total:0 });
  });
  it('refuses changed source on a repeat import', async () => {
    const changed = structuredClone(source); changed.documents[0].fields.freitext = 'changed';
    const plan = prepareLegacyImport(changed);
    await expect(db.batch(plan.sql.trim().split('\n').map((s:string) => db.prepare(s)))).rejects.toThrow();
    const row = await db.prepare('SELECT answers FROM submissions WHERE id = ?').bind(plan.rows[0].id).first<{ answers:string }>();
    expect(JSON.parse(row!.answers).freitext).toBe(source.documents[0].fields.freitext);
  });
});
