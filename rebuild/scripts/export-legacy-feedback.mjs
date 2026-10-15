import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Restrict fields at the Firestore API, so passwords are never downloaded.
const allowed = ['name', 'bestePraline', 'schlechtestePraline', 'freitext', 'timeStamp', 'year', 'collectionId', 'collection', 'questionnaireId'];
function decode(value) {
  if ('stringValue' in value) return value.stringValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue.values ?? []).map(decode);
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue.fields ?? {}).map(([k,v]) => [k,decode(v)]));
  throw new Error('Unsupported Firestore value. Export stopped.');
}
const root = fileURLToPath(new URL('../', import.meta.url));
const output = process.argv[2] ?? path.join(root, '.migration', `firestore-feedback-${new Date().toISOString().replaceAll(':','-')}.json`);
const project = JSON.parse(await (await import('node:fs/promises')).readFile(new URL('../../.firebaserc',import.meta.url),'utf8')).projects.default;
const documents = []; let pageToken;
do {
  const url = new URL(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/pralinen`);
  url.searchParams.set('pageSize','300');
  for (const field of allowed) url.searchParams.append('mask.fieldPaths',field);
  if (pageToken) url.searchParams.set('pageToken',pageToken);
  const response = await fetch(url, { signal:AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Firestore read failed (${response.status}); use an authorized export if rules prohibit reads.`);
  const page = await response.json();
  for (const doc of page.documents ?? []) documents.push({ id:doc.name.split('/').at(-1), sourcePath:doc.name, createTime:doc.createTime, updateTime:doc.updateTime, fields:Object.fromEntries(Object.entries(doc.fields ?? {}).filter(([k]) => allowed.includes(k)).map(([k,v]) => [k,decode(v)])) });
  pageToken = page.nextPageToken;
} while(pageToken);
await mkdir(path.dirname(output),{ recursive:true, mode:0o700 });
await writeFile(output,JSON.stringify({ project, exportedAt:new Date().toISOString(), documents },null,2)+'\n',{ flag:'wx',mode:0o600 });
const months = {}; const flavours = {}; let missingTimestamp = 0; const explicitCollections = {};
for (const { fields:f } of documents) {
  const value = f.timeStamp;
  const date = typeof value === 'string' ? new Date(value) : typeof value?.seconds === 'number' ? new Date(value.seconds*1000) : null;
  if (date && !Number.isNaN(date.getTime())) { const month = date.toISOString().slice(0,7); months[month] = (months[month] ?? 0)+1; } else missingTimestamp++;
  for (const label of [f.bestePraline,f.schlechtestePraline]) if (typeof label === 'string') flavours[label] = (flavours[label] ?? 0)+1;
  for (const field of ['year','collectionId','collection','questionnaireId']) if (f[field] !== undefined) explicitCollections[field]=(explicitCollections[field] ?? 0)+1;
}
console.log(JSON.stringify({ output, count:documents.length, months, missingTimestamp, flavours, explicitCollections },null,2));
