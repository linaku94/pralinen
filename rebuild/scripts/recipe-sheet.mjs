import { createHash } from 'node:crypto';

const sourceDocument = '1_L74QspPGXlNcOkmElDR2GGqAYgtYQwo';
const hash = value => createHash('sha256').update(value).digest('hex');
const quote = value => { if(String(value).includes('\0'))throw new Error('NUL character requires manual review.');return `'${String(value).replaceAll("'","''")}'`; };
const specs = [
  { sheet:'Kokos', title:'Kokos-Praline', filling:[3,4,5,6,7], coating:[9,10,11], notes:['B16','B18'] },
  { sheet:'Himbeer', title:'Himbeer-Praline', filling:[2,3,4], coating:[6,7], notes:['A11','A12','A13'] },
  { sheet:'Karamell', title:'Karamell-Praline', filling:[2,3,4,5], coating:[9,10], notes:[], method:['A16','A17','A18','A19'], alternatives:['H6','H7','H8','H9'] },
  { sheet:'Zitrone', title:'Zitronen-Praline', filling:[2,3,4], coating:[6,7], notes:['G5','A11'] },
  { sheet:'Eierlikör', title:'Eierlikör-Praline', filling:[2,3,4], coating:[6,7], notes:['B10'], references:['B13'], warnings:['Eierlikör ist in der Quelle ausdrücklich mit 0 ml angegeben. Bitte vor der Zubereitung prüfen.'] },
  { sheet:'Mango', title:'Mango-Praline', filling:[2,3,4,5], coating:[7,8], notes:['A11','B11'] },
  { sheet:'not again - Dubai', title:'Dubai-Praline', filling:[2], coating:[5,6,10,11,12], notes:['A15'], status:'not-recommended', warnings:['Die Quelle bewertet diesen Versuch als „nicht überzeugend“.','Für Pistazien, Blattgold und Teigfäden fehlen Mengen; die Stückzahl des Rezepts ist nicht ausdrücklich angegeben.'] }
];

export function prepareRecipeWorkbook(workbook) {
  if(!Array.isArray(workbook.sheets)||workbook.sheets.length!==9||!workbook.sourceUrl?.includes(`/spreadsheets/d/${sourceDocument}/`)) throw new Error('Unexpected workbook; review mapping before importing.');
  if(new Set(workbook.sheets.map(s=>s.name)).size!==9)throw new Error('Duplicate worksheet names.');
  const recipes=[]; const shoppingLists=[]; const sourceKeys=[];
  const find = name => { const sheet=workbook.sheets.find(s=>s.name===name);if(!sheet)throw new Error(`Missing sheet ${name}`);return sheet; };
  const archive = sheet => ({ sourceUrl:workbook.sourceUrl,sheetName:sheet.name,cells:sheet.cells });
  function access(sheet) {
    const cells=new Map(sheet.cells.map(c=>[c.address,c]));
    if(cells.size!==sheet.cells.length)throw new Error('Duplicate source cell.');
    const get = address => cells.get(address)?.value ?? '';
    const join = addresses => addresses.map(get).filter(v=>v!=='').join('\n');
    function ingredient(row,section,notes='') {
      const name=get(`C${row}`);const raw=get(`A${row}`);
      if(typeof name!=='string'||!name)throw new Error(`Missing ingredient on ${sheet.name}:${row}`);
      if(raw!==''&&(typeof raw!=='number'||!Number.isFinite(raw)||raw<0))throw new Error(`Unexpected quantity on ${sheet.name}:${row}`);
      return { id:`row-${row}`,name,amount:raw===''?null:raw,unit:String(get(`B${row}`)),section,notes };
    }
    return {get,join,ingredient};
  }
  for(const spec of specs) {
    const sheet=find(spec.sheet);const {get,join,ingredient}=access(sheet);
    const sourceReferences=join(['D1',...(spec.references??[])]);
    const count=String(get('D1')).match(/\((\d+) Pralinen/);
    const warnings=[...(spec.warnings??[])];
    if(!spec.method)warnings.push('In der Tabelle ist keine vollständige Zubereitung angegeben.');
    const details={ ingredientRows:[...spec.filling.map(r=>ingredient(r,'Füllung',String(get(`E${r}`)))),...spec.coating.map(r=>ingredient(r,'Hülle und Dekoration',String(get(`E${r}`))))],sourceReferences,alternatives:join(spec.alternatives??[]),status:spec.status??'unrated',warnings };
    recipes.push({id:`sheet-recipe-${hash(sourceDocument+':'+spec.sheet).slice(0,32)}`,title:spec.title,praline:spec.sheet==='not again - Dubai'?'Dubai':spec.sheet,yieldAmount:count?`${count[1]} Pralinen`:'',ingredients:'',method:join(spec.method??[]),notes:join(spec.notes),details,sourceArchive:archive(sheet)});
    sourceKeys.push({key:`${sourceDocument}:${spec.sheet}`,kind:'recipe',targetId:recipes.at(-1).id,hash:hash(JSON.stringify(sheet))});
  }
  for(const year of [2024,2025]) {
    const sheet=find(`Gesamt ${year}`);const {get,join,ingredient}=access(sheet);
    const rows=sheet.cells.filter(c=>c.column===3&&c.row>=3&&c.row<=25&&typeof c.value==='string').map(c=>c.row);
    const warnings=['Importierter Tabellenstand; Mengen werden nicht automatisch aus den Rezepten neu berechnet.','Sahne wird in den Rezepten teils in g, teils in ml erfasst. Die Einkaufsliste summiert sie ohne Umrechnung; der Quellenwert wurde unverändert übernommen.'];
    if(year===2025) warnings.push('Die Matcha-Menge 0 wird in der Quelle weiterhin aus einer Eierlikör-Formel berechnet. Es gibt kein Matcha-Rezeptblatt.','Die Nebenüberschrift „Sonstiges 2024:“ steht auch im Blatt Gesamt 2025.');
    const extras=[String(get('H2'))];
    for(let row=3;row<=17;row++){if(get(`H${row}`)!=='')extras.push([get(`G${row}`),get(`H${row}`)].filter(v=>v!=='').join(' '));if(get(`I${row}`)!=='')extras.push(String(get(`I${row}`)));}
    const details={items:rows.map(r=>ingredient(r,r>=24?'Hohlkörper':'Zutaten',[get(`D${r}`),get(`F${r}`)].filter(v=>v!=='').join('\n'))),extras:extras.join('\n'),equipment:join(['A34','A35']),notes:join(['A29','A30']),ordering:join(['A27']),warnings};
    shoppingLists.push({id:`sheet-shopping-${hash(sourceDocument+':'+sheet.name).slice(0,32)}`,title:`Einkaufsliste ${year}`,year,details,sourceArchive:archive(sheet)});
    sourceKeys.push({key:`${sourceDocument}:${sheet.name}`,kind:'shopping-list',targetId:shoppingLists.at(-1).id,hash:hash(JSON.stringify(sheet))});
  }
  const statements=[];
  for(const r of recipes) statements.push(`INSERT INTO recipes (id,title,praline,yield_amount,ingredients,method,notes,details,source_archive) VALUES (${[r.id,r.title,r.praline,r.yieldAmount,r.ingredients,r.method,r.notes,JSON.stringify(r.details),JSON.stringify(r.sourceArchive)].map(quote).join(',')}) ON CONFLICT(id) DO NOTHING;`);
  for(const s of shoppingLists)statements.push(`INSERT INTO shopping_lists (id,title,year,details,source_archive) VALUES (${[s.id,s.title,s.year,JSON.stringify(s.details),JSON.stringify(s.sourceArchive)].map(quote).join(',')}) ON CONFLICT(id) DO NOTHING;`);
  for(const row of sourceKeys)statements.push(`INSERT INTO recipe_sheet_imports (source_key,target_id,kind,source_hash) VALUES (${[row.key,row.targetId,row.kind,row.hash].map(quote).join(',')}) ON CONFLICT(source_key) DO UPDATE SET source_hash=CASE WHEN recipe_sheet_imports.source_hash=excluded.source_hash THEN recipe_sheet_imports.source_hash ELSE NULL END;`);
  return {recipes,shoppingLists,sourceKeys,sourceCells:workbook.sheets.reduce((n,s)=>n+s.cells.length,0),sql:statements.join('\n')+'\n'};
}
