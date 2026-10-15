import { describe,it,expect } from 'vitest';
import { recipeSchema, shoppingListSchema } from '../src/domain';
// @ts-expect-error The CLI mapper is plain JavaScript.
import { prepareRecipeWorkbook } from '../scripts/recipe-sheet.mjs';

const names=['Kokos','Himbeer','Karamell','Zitrone','Eierlikör','Mango','not again - Dubai','Gesamt 2024','Gesamt 2025'];
const sourceUrl='https://docs.google.com/spreadsheets/d/1_L74QspPGXlNcOkmElDR2GGqAYgtYQwo/edit?gid=1139085694';
// Synthetic data mirrors the source layout without putting private recipes into Git.
const allRows=[2,3,4,5,6,7,8,9,10,11,12];
const fixture={sourceUrl,sheets:names.map(name=>({name,cells:allRows.flatMap(row=>[
  {address:`A${row}`,row,column:1,value:row===3?0:row},
  {address:`B${row}`,row,column:2,value:'g'},
  {address:`C${row}`,row,column:3,value:`Zutat ${row}`}
]).concat([{address:'D1',row:1,column:4,value:'(60 Pralinen - Testquelle)'}])}))};
describe('recipe workbook import',()=>{
  it('preserves every source cell and stable IDs without inventing quantities or methods',()=>{
    const input=structuredClone(fixture);
    input.sheets[6].cells=input.sheets[6].cells.filter(c=>c.address!=='D1'&&c.address!=='A10');
    const plan=prepareRecipeWorkbook(input);
    const again=prepareRecipeWorkbook(input);
    expect(plan.recipes).toHaveLength(7);expect(plan.shoppingLists).toHaveLength(2);
    expect(plan.sourceCells).toBe(input.sheets.reduce((n,s)=>n+s.cells.length,0));
    expect(plan.recipes.map((r:{id:string})=>r.id)).toEqual(again.recipes.map((r:{id:string})=>r.id));
    expect(plan.recipes[0].method).toBe('');
    expect(plan.recipes[0].details.ingredientRows[0].amount).toBe(0);
    expect(plan.recipes[6].yieldAmount).toBe('');
    expect(plan.recipes[6].details.ingredientRows.find((r:{id:string})=>r.id==='row-10').amount).toBeNull();
    expect(plan.recipes[6].details.status).toBe('not-recommended');
    for(let i=0;i<7;i++)expect(plan.recipes[i].sourceArchive.cells).toEqual(input.sheets[i].cells);
    expect(plan.shoppingLists[1].details.warnings.join(' ')).toContain('Eierlikör-Formel');
  });
  it('refuses missing or unexpected source sheets',()=>{
    expect(()=>prepareRecipeWorkbook({...fixture,sheets:fixture.sheets.slice(1)})).toThrow();
    expect(()=>prepareRecipeWorkbook({...fixture,sourceUrl:'https://example.com'})).toThrow();
  });
});
describe('recipe editing',()=>{
  const base={title:'Test',praline:'Test',yieldAmount:'',ingredients:'',method:'',notes:''};
  const ingredient={id:'a',name:'Salz',amount:null,unit:'Prise',section:'Füllung',notes:''};
  it('accepts ingredient-only recipes, unknown amounts, zero and fractional quantities',()=>{
    for(const amount of [null,0,1.5])expect(recipeSchema.parse({...base,ingredientRows:[{...ingredient,amount}]}).ingredientRows[0].amount).toBe(amount);
    expect(()=>recipeSchema.parse({...base,ingredientRows:[{...ingredient,amount:-1}]})).toThrow();
    expect(()=>recipeSchema.parse(base)).toThrow();
  });
  it('keeps old text recipes compatible and validates shopping lists',()=>{
    expect(recipeSchema.parse({...base,ingredients:'100 g Schokolade'}).ingredientRows).toEqual([]);
    expect(shoppingListSchema.parse({title:'2025',year:2025,items:[ingredient],extras:'',equipment:'',notes:'',ordering:'',warnings:[]}).items[0].amount).toBeNull();
  });
});
