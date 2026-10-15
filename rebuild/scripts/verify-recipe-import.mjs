import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const [planFile,receiptFile]=process.argv.slice(2);
if(!planFile||!receiptFile)throw new Error('Usage: node scripts/verify-recipe-import.mjs <private-plan.json> <private-receipt.json>');
const plan=JSON.parse(await readFile(planFile,'utf8'));
async function query(sql){
  const r=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','d1','execute','pralinen','--remote','--command',sql,'--json'],{encoding:'utf8',maxBuffer:10_000_000});
  if(r.status!==0){await writeFile(receiptFile+'.error.json',JSON.stringify({stdout:r.stdout,stderr:r.stderr}),{mode:0o600});throw new Error('Verification query failed; diagnostics were saved privately.');}
  return JSON.parse(r.stdout)[0].results;
}
const recipes=await query("SELECT r.* FROM recipes r JOIN recipe_sheet_imports i ON i.target_id=r.id WHERE i.kind='recipe'");
const shopping=await query("SELECT s.* FROM shopping_lists s JOIN recipe_sheet_imports i ON i.target_id=s.id WHERE i.kind='shopping-list'");
const ledger=await query('SELECT source_key,target_id,kind,source_hash FROM recipe_sheet_imports');
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
let cells=0;
for(const expected of plan.recipes){
  const actual=recipes.find(r=>r.id===expected.id);
  if(!actual||!['title','praline','ingredients','method','notes'].every(k=>actual[k]===expected[k])||actual.yield_amount!==expected.yieldAmount||!equal(JSON.parse(actual.details),expected.details)||!equal(JSON.parse(actual.source_archive),expected.sourceArchive))throw new Error('Recipe verification mismatch.');
  cells+=JSON.parse(actual.source_archive).cells.length;
}
for(const expected of plan.shoppingLists){
  const actual=shopping.find(s=>s.id===expected.id);
  if(!actual||actual.title!==expected.title||actual.year!==expected.year||!equal(JSON.parse(actual.details),expected.details)||!equal(JSON.parse(actual.source_archive),expected.sourceArchive))throw new Error('Shopping-list verification mismatch.');
  cells+=JSON.parse(actual.source_archive).cells.length;
}
for(const expected of plan.sourceKeys){const actual=ledger.find(i=>i.source_key===expected.key);if(!actual||actual.target_id!==expected.targetId||actual.kind!==expected.kind||actual.source_hash!==expected.hash)throw new Error('Import tracking verification mismatch.');}
if(recipes.length!==plan.recipes.length||shopping.length!==plan.shoppingLists.length||cells!==plan.sourceCells)throw new Error('Import count mismatch.');
const receipt={verifiedAt:new Date().toISOString(),recipes:recipes.length,shoppingLists:shopping.length,sourceCellsVerified:cells,allFieldsMatch:true};
await writeFile(receiptFile,JSON.stringify(receipt,null,2)+'\n',{mode:0o600});console.log(JSON.stringify(receipt,null,2));
