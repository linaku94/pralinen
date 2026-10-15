import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { prepareLegacyImport } from './legacy-feedback.mjs';

const [sourceFile, outputFile] = process.argv.slice(2);
if (!sourceFile || !outputFile) throw new Error('Usage: node scripts/prepare-legacy-import.mjs <private-export.json> <private-import.sql>');
const plan = prepareLegacyImport(JSON.parse(await readFile(sourceFile,'utf8')));
await mkdir(path.dirname(outputFile),{ recursive:true, mode:0o700 });
await writeFile(outputFile,plan.sql,{ flag:'wx', mode:0o600 });
console.log(JSON.stringify({ responses:plan.rows.length, collections:plan.counts, questionnaires:plan.questionnaires.length, status:'closed', output:outputFile, passwordsIncluded:false },null,2));
