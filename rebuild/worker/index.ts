import { Hono } from 'hono';
import { configured, createAuth, type Env } from './auth';
import { collectionSchema, questionnaireSchema, recipeSchema, recipeDetailsSchema, shoppingListSchema, validateAnswers, csvExport, type Question, type Submission } from '../src/domain';
import { ZodError, z } from 'zod';
import { mergeIngredients } from '../src/shopping';

const app = new Hono<{ Bindings: Env }>();
const decodeCollection = (r: Record<string, unknown>) => ({ ...r, published: !!r.published, pralines: JSON.parse(String(r.pralines)) });
const decodeQuestionnaire = (r: Record<string, unknown>) => ({ id: r.id, collectionId: r.collection_id, title: r.title, introduction: r.introduction, status: r.status, token: r.token, locked: !!r.locked, questions: JSON.parse(String(r.questions)) });
const decodeRecipe = (r: Record<string, unknown>) => ({ id:r.id,title:r.title,praline:r.praline,ingredients:r.ingredients,method:r.method,notes:r.notes, ...recipeDetailsSchema.parse(JSON.parse(String(r.details ?? '{}'))), yieldAmount: r.yield_amount, sourceArchive:JSON.parse(String(r.source_archive ?? '{}')) });
const decodeShoppingList = (r: Record<string, unknown>) => ({ id:String(r.id), ...shoppingListSchema.parse({ ...JSON.parse(String(r.details)), title:r.title, year:r.year, revision:r.revision }), sourceArchive:JSON.parse(String(r.source_archive ?? '{}')) });
const decodeSubmission = (r: Record<string, unknown>): Submission => ({ id: String(r.id), name: String(r.name), answers: JSON.parse(String(r.answers)), createdAt: String(r.created_at) });

app.use('/api/*', async (c, next) => {
  c.header('Cache-Control', 'no-store');
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Referrer-Policy', 'no-referrer');
  if (!['GET', 'HEAD'].includes(c.req.method) && c.req.header('Origin') !== new URL(c.env.APP_URL).origin) return c.json({ error: 'Anfrage von einer fremden Website abgelehnt.' }, 403);
  if (Number(c.req.header('Content-Length') ?? 0) > 600_000) return c.json({ error: 'Datei oder Anfrage zu groß.' }, 413);
  await next();
});
app.onError((e, c) => {
  if (e instanceof ZodError) return c.json({ error: e.issues[0]?.message ?? 'Ungültige Eingabe.' }, 400);
  console.error('API request failed', e.name);
  return c.json({ error: 'Die Anfrage konnte nicht verarbeitet werden. Bitte später erneut versuchen.' }, 500);
});
async function jsonBody(request: Request) {
  const raw = await request.text();
  if (raw.length > 60_000) throw new ZodError([{ code: 'custom', path: [], message: 'Anfrage zu groß.' }]);
  try { return JSON.parse(raw); } catch { throw new ZodError([{ code: 'custom', path: [], message: 'Ungültiges JSON.' }]); }
}

app.on(['GET', 'POST'], '/api/auth/*', c => {
  if (!configured(c.env)) return c.json({ error: 'Google-Anmeldung ist noch nicht eingerichtet.' }, 503);
  return createAuth(c.env).handler(c.req.raw);
});
app.get('/api/session', async c => {
  if (!configured(c.env)) return c.json({ user: null, configured: false });
  const session = await createAuth(c.env).api.getSession({ headers: c.req.raw.headers });
  const invited = session?.user.emailVerified && await c.env.DB.prepare('SELECT email FROM admin_invites WHERE email = ?').bind(session.user.email).first();
  return c.json({ configured: true, user: invited && session ? { name: session.user.name, email: session.user.email } : null });
});
app.use('/api/admin/*', async (c, next) => {
  if (!configured(c.env)) return c.json({ error: 'Google-Anmeldung ist noch nicht eingerichtet.' }, 503);
  const session = await createAuth(c.env).api.getSession({ headers: c.req.raw.headers });
  if (!session?.user.emailVerified) return c.json({ error: 'Bitte als Admin anmelden.' }, 401);
  const invited = await c.env.DB.prepare('SELECT email FROM admin_invites WHERE email = ?').bind(session.user.email).first();
  if (!invited) return c.json({ error: 'Dieses Konto hat keinen Admin-Zugang.' }, 403);
  await next();
});
app.get('/api/collections', async c => {
  const { results } = await c.env.DB.prepare('SELECT * FROM collections WHERE published = 1 ORDER BY year DESC').all();
  return c.json(results.map(decodeCollection));
});
app.get('/api/images/:id', async c => {
  const image = await c.env.DB.prepare('SELECT bytes, content_type FROM images WHERE id = ?').bind(c.req.param('id')).first<{ bytes: ArrayBuffer; content_type: string }>();
  if (!image) return c.notFound();
  return new Response(new Uint8Array(image.bytes), { headers: { 'Content-Type': image.content_type, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' } });
});
app.get('/api/surveys/:token', async c => {
  const r = await c.env.DB.prepare('SELECT q.* FROM questionnaires q JOIN collections c ON q.collection_id = c.id WHERE q.token = ? AND q.status = ? AND c.published = 1').bind(c.req.param('token'), 'open').first();
  if (!r) return c.json({ error: 'Diese Umfrage ist noch nicht geöffnet oder bereits geschlossen.' }, 404);
  return c.json(decodeQuestionnaire(r));
});
app.post('/api/surveys/:token/responses', async c => {
  const r = await c.env.DB.prepare('SELECT q.* FROM questionnaires q JOIN collections c ON q.collection_id = c.id WHERE q.token = ? AND q.status = ? AND c.published = 1').bind(c.req.param('token'), 'open').first();
  if (!r) return c.json({ error: 'Diese Umfrage ist nicht geöffnet.' }, 404);
  let valid;
  try { valid = validateAnswers(JSON.parse(String(r.questions)), await jsonBody(c.req.raw)); }
  catch (e) { return c.json({ error: e instanceof Error ? e.message : 'Ungültige Antworten.' }, 400); }
  const hour = Math.floor(Date.now() / 3_600_000);
  const fingerprint = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${c.req.header('CF-Connecting-IP') ?? 'local'}:${hour}`));
  const key = Array.from(new Uint8Array(fingerprint)).map(n => n.toString(16).padStart(2, '0')).join('');
  const expires = (hour + 1) * 3_600_000;
  const count = await c.env.DB.prepare('INSERT INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1 RETURNING count').bind(key, expires).first<{ count: number }>();
  if (!count || count.count > 15) return c.json({ error: 'Zu viele Antworten. Bitte in einer Stunde erneut versuchen.' }, 429);
  await c.env.DB.prepare('DELETE FROM rate_limits WHERE expires_at < ?').bind(Date.now()).run();
  // Check status again as part of the insert so closing a survey also blocks in-flight submissions.
  const saved = await c.env.DB.prepare("INSERT INTO submissions (id, questionnaire_id, name, answers) SELECT ?, q.id, ?, ? FROM questionnaires q JOIN collections c ON q.collection_id = c.id WHERE q.id = ? AND q.status = 'open' AND c.published = 1 AND (SELECT COUNT(*) FROM submissions WHERE questionnaire_id = q.id) < 10000").bind(crypto.randomUUID(), valid.name, JSON.stringify(valid.answers), r.id).run();
  if (!saved.meta.changes) return c.json({ error: 'Die Umfrage nimmt keine weiteren Antworten an.' }, 409);
  return c.json({ success: true }, 201);
});

app.get('/api/admin/collections', async c => {
  const { results } = await c.env.DB.prepare('SELECT * FROM collections ORDER BY year DESC').all();
  return c.json(results.map(decodeCollection));
});
app.put('/api/admin/collections/:id', async c => {
  const v = collectionSchema.parse(await jsonBody(c.req.raw));
  const duplicate = await c.env.DB.prepare('SELECT id FROM collections WHERE slug = ? AND id != ?').bind(v.slug, c.req.param('id')).first();
  if (duplicate) return c.json({ error: 'Diese URL wird bereits verwendet.' }, 409);
  await c.env.DB.prepare('INSERT INTO collections (id, slug, year, title, description, cover, published, pralines) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, year=excluded.year, title=excluded.title, description=excluded.description, cover=excluded.cover, published=excluded.published, pralines=excluded.pralines, updated_at=CURRENT_TIMESTAMP').bind(c.req.param('id'), v.slug, v.year, v.title, v.description, v.cover, Number(v.published), JSON.stringify(v.pralines)).run();
  return c.json({ success: true });
});
app.post('/api/admin/images', async c => {
  const bytes = new Uint8Array(await c.req.raw.arrayBuffer());
  if (bytes.length > 512_000) return c.json({ error: 'Bitte das Bild auf höchstens 500 KB verkleinern.' }, 413);
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = [137,80,78,71,13,10,26,10].every((n, i) => bytes[i] === n);
  const webp = new TextDecoder().decode(bytes.slice(0,4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8,12)) === 'WEBP';
  if (!jpeg && !png && !webp) return c.json({ error: 'Bitte ein JPG-, PNG- oder WebP-Bild auswählen.' }, 400);
  const id = crypto.randomUUID();
  const saved = await c.env.DB.prepare('INSERT INTO images (id, content_type, bytes) SELECT ?, ?, ? WHERE (SELECT COALESCE(SUM(length(bytes)), 0) FROM images) + ? <= 25000000').bind(id, jpeg ? 'image/jpeg' : png ? 'image/png' : 'image/webp', bytes.buffer, bytes.length).run();
  if (!saved.meta.changes) return c.json({ error: 'Der Bildspeicher ist voll (25 MB). Bitte vorhandene Bilder wiederverwenden.' }, 409);
  return c.json({ url: `/api/images/${id}` }, 201);
});
app.get('/api/admin/questionnaires', async c => {
  const { results } = await c.env.DB.prepare('SELECT * FROM questionnaires ORDER BY created_at DESC').all();
  return c.json(results.map(decodeQuestionnaire));
});
app.put('/api/admin/questionnaires/:id', async c => {
  const v = questionnaireSchema.parse(await jsonBody(c.req.raw));
  const collection = await c.env.DB.prepare('SELECT id, published FROM collections WHERE id = ?').bind(v.collectionId).first();
  if (!collection) return c.json({ error: 'Kollektion nicht gefunden.' }, 400);
  if (v.status === 'open' && !collection.published) return c.json({ error: 'Bitte zuerst die Kollektion veröffentlichen.' }, 400);
  const existing = await c.env.DB.prepare('SELECT * FROM questionnaires WHERE id = ?').bind(c.req.param('id')).first();
  if (existing && existing.locked && (String(existing.questions) !== JSON.stringify(v.questions) || existing.collection_id !== v.collectionId)) return c.json({ error: 'Geöffnete Umfragen behalten ihre Fragen. Bitte eine neue Umfrage erstellen.' }, 409);
  await c.env.DB.prepare('INSERT INTO questionnaires (id, collection_id, title, introduction, status, token, questions, locked) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET title=excluded.title, introduction=excluded.introduction, status=excluded.status, collection_id=excluded.collection_id, questions=excluded.questions, locked=MAX(questionnaires.locked,excluded.locked)').bind(c.req.param('id'), v.collectionId, v.title, v.introduction, v.status, existing?.token ?? crypto.randomUUID(), JSON.stringify(v.questions), Number(v.status !== 'draft')).run();
  return c.json({ success: true });
});
app.get('/api/admin/questionnaires/:id/responses', async c => {
  const { results } = await c.env.DB.prepare('SELECT * FROM submissions WHERE questionnaire_id = ? ORDER BY created_at DESC').bind(c.req.param('id')).all();
  return c.json(results.map(decodeSubmission));
});
app.get('/api/admin/questionnaires/:id/export', async c => {
  const q = await c.env.DB.prepare('SELECT questions FROM questionnaires WHERE id = ?').bind(c.req.param('id')).first<{ questions: string }>();
  if (!q) return c.notFound();
  const { results } = await c.env.DB.prepare('SELECT * FROM submissions WHERE questionnaire_id = ? ORDER BY created_at DESC').bind(c.req.param('id')).all();
  return new Response(csvExport(JSON.parse(q.questions) as Question[], results.map(decodeSubmission)), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="pralinen-auswertung.csv"', 'Cache-Control': 'no-store' } });
});
app.get('/api/admin/recipes', async c => {
  const { results } = await c.env.DB.prepare('SELECT * FROM recipes ORDER BY title').all();
  return c.json(results.map(decodeRecipe));
});
app.put('/api/admin/recipes/:id', async c => {
  const old = await c.env.DB.prepare('SELECT details FROM recipes WHERE id = ?').bind(c.req.param('id')).first<{details:string}>();
  const body = await jsonBody(c.req.raw);
  const v = recipeSchema.parse({ ...JSON.parse(old?.details ?? '{}'), ...body });
  const details = recipeDetailsSchema.parse(v);
  await c.env.DB.prepare('INSERT INTO recipes (id, title, praline, yield_amount, ingredients, method, notes,details) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET title=excluded.title, praline=excluded.praline, yield_amount=excluded.yield_amount, ingredients=excluded.ingredients, method=excluded.method, notes=excluded.notes, details=excluded.details, updated_at=CURRENT_TIMESTAMP').bind(c.req.param('id'), v.title, v.praline, v.yieldAmount, v.ingredients, v.method, v.notes,JSON.stringify(details)).run();
  return c.json({ success: true });
});
app.get('/api/admin/shopping-lists', async c => {
  const { results } = await c.env.DB.prepare('SELECT * FROM shopping_lists ORDER BY year DESC,title').all();
  return c.json(results.map(decodeShoppingList));
});
app.put('/api/admin/shopping-lists/:id', async c => {
  const v = shoppingListSchema.parse(await jsonBody(c.req.raw));
  const { title,year,revision,...details } = v;
  const result=await c.env.DB.prepare('INSERT INTO shopping_lists (id,title,year,details,revision) VALUES (?,?,?,?,1) ON CONFLICT(id) DO UPDATE SET title=excluded.title, year=excluded.year, details=excluded.details, revision=shopping_lists.revision+1, updated_at=CURRENT_TIMESTAMP WHERE shopping_lists.revision=?').bind(c.req.param('id'),title,year,JSON.stringify(details),revision).run();
  if(!result.meta.changes) return c.json({error:'Die Liste wurde inzwischen geändert. Bitte erneut öffnen und Änderungen übernehmen.'},409);
  return c.json(decodeShoppingList((await c.env.DB.prepare('SELECT * FROM shopping_lists WHERE id=?').bind(c.req.param('id')).first())!));
});
app.post('/api/admin/shopping-lists/:id/recipes', async c => {
  const {recipeId,revision}=z.object({recipeId:z.string().min(1).max(100),revision:z.number().int().nonnegative()}).parse(await jsonBody(c.req.raw));
  const row=await c.env.DB.prepare('SELECT * FROM shopping_lists WHERE id=?').bind(c.req.param('id')).first();
  const recipeRow=await c.env.DB.prepare('SELECT * FROM recipes WHERE id=?').bind(recipeId).first();
  if(!row||!recipeRow)return c.notFound();
  const list=decodeShoppingList(row),recipe=decodeRecipe(recipeRow);
  if(!recipe.ingredientRows.length)return c.json({error:'Bitte zuerst strukturierte Zutaten zum Rezept hinzufügen.'},400);
  const merged=shoppingListSchema.parse({...list,items:mergeIngredients(list.items,recipe.ingredientRows)});
  const {title: _title,year: _year,revision: _revision,...details}=merged;
  const result=await c.env.DB.prepare('UPDATE shopping_lists SET details=?, revision=revision+1, updated_at=CURRENT_TIMESTAMP WHERE id=? AND revision=?').bind(JSON.stringify(details),c.req.param('id'),revision).run();
  if(!result.meta.changes)return c.json({error:'Die Liste wurde inzwischen geändert. Bitte erneut öffnen.'},409);
  return c.json({...list,...merged,revision:revision+1});
});
app.all('/api/*', c => c.json({ error: 'Nicht gefunden.' }, 404));
app.get('*', c => c.env.ASSETS.fetch(c.req.raw));
export default app;
