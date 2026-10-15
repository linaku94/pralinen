import { readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { prepareLegacyImport } from './legacy-feedback.mjs';

const [sourceFile, receiptFile] = process.argv.slice(2);
if (!sourceFile || !receiptFile) throw new Error('Usage: node scripts/verify-legacy-import.mjs <private-export.json> <private-receipt.json>');
const plan = prepareLegacyImport(JSON.parse(await readFile(sourceFile,'utf8')));
async function query(sql) {
  const command = spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','d1','execute','pralinen','--remote','--command',sql,'--json'],{ encoding:'utf8',maxBuffer:10_000_000 });
  if (command.status !== 0) {
    await writeFile(receiptFile+'.error.json',JSON.stringify({ status:command.status,stderr:command.stderr,stdout:command.stdout }),{ mode:0o600 });
    throw new Error('D1 verification query failed. Diagnostics saved privately beside the receipt; response data has not been printed.');
  }
  return JSON.parse(command.stdout)[0].results;
}
const actualRows = await query("SELECT s.id,s.questionnaire_id,s.name,s.answers,s.created_at,l.source_path,l.source_hash FROM submissions s JOIN legacy_feedback_imports l ON l.submission_id=s.id WHERE instr(l.source_path, 'projects/pralinen-daac0/databases/(default)/documents/pralinen/') = 1");
const actualQuestionnaires = await query("SELECT id,collection_id,status,locked,questions FROM questionnaires WHERE id LIKE 'legacy-firestore-pralinen-daac0-%'");
if (actualRows.length !== plan.rows.length || actualQuestionnaires.length !== plan.questionnaires.length) throw new Error('Imported row/questionnaire counts differ from source.');
for (const expected of plan.rows) {
  const actual = actualRows.find(r => r.id === expected.id);
  if (!actual || actual.questionnaire_id !== expected.questionnaireId || actual.name !== expected.name || actual.created_at !== expected.createdAt || actual.source_path !== expected.sourcePath || actual.source_hash !== expected.sourceHash || JSON.stringify(JSON.parse(actual.answers)) !== JSON.stringify(expected.answers)) throw new Error(`Verification mismatch for source document ${expected.sourcePath.split('/').at(-1)}.`);
  if (Object.keys(JSON.parse(actual.answers)).some(key => !['bestePraline','schlechtestePraline','freitext'].includes(key))) throw new Error('Unexpected answer fields found.');
}
for (const expected of plan.questionnaires) {
  const actual = actualQuestionnaires.find(q => q.id === expected.id);
  if (!actual || actual.collection_id !== expected.collectionId || actual.status !== 'closed' || actual.locked !== 1 || JSON.stringify(JSON.parse(actual.questions)) !== JSON.stringify(expected.questions)) throw new Error('Historical questionnaire metadata differs from plan.');
}
const receipt = { verifiedAt:new Date().toISOString(), responsesVerified:plan.rows.length, byCollection:plan.counts, questionnairesClosed:true, exactNamesAnswersTimestamps:true, unknownAnswerFields:0 };
await writeFile(receiptFile,JSON.stringify(receipt,null,2)+'\n',{ mode:0o600 });
console.log(JSON.stringify(receipt,null,2));
