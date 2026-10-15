import { readFile,writeFile } from 'node:fs/promises';
import { prepareRecipeWorkbook } from './recipe-sheet.mjs';
const [sourceFile,sqlFile,planFile]=process.argv.slice(2);
if(!sourceFile||!sqlFile||!planFile)throw new Error('Usage: node scripts/prepare-recipe-import.mjs <private-source.json> <private-import.sql> <private-plan.json>');
const plan=prepareRecipeWorkbook(JSON.parse(await readFile(sourceFile,'utf8')));
await writeFile(sqlFile,plan.sql,{flag:'wx',mode:0o600});
await writeFile(planFile,JSON.stringify({...plan,sql:undefined},null,2)+'\n',{flag:'wx',mode:0o600});
console.log(JSON.stringify({recipes:plan.recipes.length,shoppingLists:plan.shoppingLists.length,sourceCellsPreserved:plan.sourceCells},null,2));
