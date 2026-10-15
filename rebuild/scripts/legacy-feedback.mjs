import { createHash, randomUUID } from 'node:crypto';

const cohorts = [
  { year:2024, start:'2024-12-01T00:00:00Z', end:'2025-04-01T00:00:00Z', options:['Karamell','Kaktus-Eis','Karlsruhe','Eierlikör','Zitrone','Kokos','Himbeer'] },
  { year:2025, start:'2025-12-01T00:00:00Z', end:'2026-03-01T00:00:00Z', options:['Karamell','Kaktus-Eis','Matcha','Zitrone','Kokos','Himbeer'] }
];
const hash = value => createHash('sha256').update(value).digest('hex');
const sql = value => {
  if (String(value).includes('\0')) throw new Error('NUL character in source. Manual review required.');
  return `'${String(value).replaceAll("'", "''")}'`;
};
export function legacyQuestions(options) {
  return [
    { id:'bestePraline', label:'Welche Praline hat dir am besten geschmeckt?', type:'choice', required:false, options },
    { id:'schlechtestePraline', label:'Welche Praline könnte noch besser werden?', type:'choice', required:false, options },
    { id:'freitext', label:'Was ich euch noch sagen möchte', type:'text', required:false, options:[] }
  ];
}

// Explicit, verified collection windows; unexpected dates/options halt the whole plan.
export function prepareLegacyImport(source) {
  if (source.project !== 'pralinen-daac0' || !Array.isArray(source.documents)) throw new Error('Unexpected source project/export format.');
  const seen = new Set(); const rows = []; const counts = {};
  for (const doc of source.documents) {
    const prefix = `projects/${source.project}/databases/(default)/documents/pralinen/`;
    if (typeof doc.id !== 'string' || !doc.id || doc.sourcePath !== prefix + doc.id || seen.has(doc.sourcePath)) throw new Error('Invalid or duplicate source document identity.');
    seen.add(doc.sourcePath);
    const f = doc.fields;
    if (!f || typeof f.timeStamp !== 'string' || Number.isNaN(Date.parse(f.timeStamp))) throw new Error(`Invalid timestamp on document ${doc.id}. Manual mapping required.`);
    const timestamp = new Date(f.timeStamp);
    const cohort = cohorts.find(c => timestamp >= new Date(c.start) && timestamp < new Date(c.end));
    if (!cohort) throw new Error(`Unmapped timestamp on document ${doc.id}. Manual mapping required.`);
    const explicit = f.collectionId ?? f.year ?? f.collection;
    if (explicit !== undefined && String(explicit) !== String(cohort.year)) throw new Error(`Conflicting collection on document ${doc.id}.`);
    if (f.questionnaireId !== undefined) throw new Error(`Explicit questionnaire on document ${doc.id} requires manual mapping.`);
    const answers = {};
    for (const key of ['bestePraline','schlechtestePraline','freitext']) {
      const value = f[key] ?? '';
      if (typeof value !== 'string') throw new Error(`Invalid ${key} on document ${doc.id}.`);
      if (key !== 'freitext' && value && !cohort.options.includes(value)) throw new Error(`Unexpected flavour on document ${doc.id}; refusing to guess its collection.`);
      if (value) answers[key] = value;
    }
    const name = f.name ?? '';
    if (typeof name !== 'string') throw new Error(`Invalid name on document ${doc.id}.`);
    const createdAt = timestamp.toISOString().replace('T',' ').replace('Z','');
    const questionnaireId = `legacy-firestore-${source.project}-${cohort.year}`;
    const id = `legacy-firestore-${hash(doc.sourcePath)}`;
    const sourceHash = hash(JSON.stringify({ name, answers, createdAt, questionnaireId }));
    // Only whitelisted content is kept; unknown fields and passwords never enter the plan.
    rows.push({ id, questionnaireId, name, answers, createdAt, sourcePath:doc.sourcePath, sourceHash });
    counts[cohort.year] = (counts[cohort.year] ?? 0)+1;
  }
  const questionnaires = cohorts.filter(c => counts[c.year]).map(c => ({ id:`legacy-firestore-${source.project}-${c.year}`, collectionId:String(c.year), title:`Umfrage ${c.year} · aus Firebase`, introduction:'Historische Rückmeldungen aus der ursprünglichen Firebase-Umfrage. Originale Antworttexte und Zeitpunkte wurden übernommen.', token:randomUUID(), questions:legacyQuestions(c.options) }));
  const statements = questionnaires.map(q => `INSERT INTO questionnaires (id,collection_id,title,introduction,status,token,questions,locked) VALUES (${[q.id,q.collectionId,q.title,q.introduction,'closed',q.token,JSON.stringify(q.questions),1].map(sql).join(',')}) ON CONFLICT(id) DO NOTHING;`);
  for (const r of rows) {
    statements.push(`INSERT INTO submissions (id,questionnaire_id,name,answers,created_at) VALUES (${[r.id,r.questionnaireId,r.name,JSON.stringify(r.answers),r.createdAt].map(sql).join(',')}) ON CONFLICT(id) DO NOTHING;`);
    // Replays are safe. Changed source data fails instead of overwriting admin data.
    statements.push(`INSERT INTO legacy_feedback_imports (source_path,submission_id,source_hash) VALUES (${[r.sourcePath,r.id,r.sourceHash].map(sql).join(',')}) ON CONFLICT(source_path) DO UPDATE SET source_hash=CASE WHEN legacy_feedback_imports.source_hash=excluded.source_hash THEN legacy_feedback_imports.source_hash ELSE NULL END;`);
  }
  return { rows, questionnaires, counts, sql:statements.join('\n')+'\n' };
}
