import {expect,it} from 'vitest';
import {mergeIngredients} from '../src/shopping';
import type {Ingredient} from '../src/domain';
const row=(patch:Partial<Ingredient>={}):Ingredient=>({id:'a',name:'Zartbitterschokolade',amount:100,unit:'g',section:'Füllung',notes:'Fein hacken',...patch});
it('combines ingredients across recipes and sections without changing the originals',()=>{
  const original=[{...row(),checked:true}];
  const merged=mergeIngredients(original,[row({id:'b',name:'  ZARTBITTERSCHOKOLADE ',unit:'Gramm',amount:200,section:'Hülle',notes:'Schmelzen'})]);
  expect(merged).toHaveLength(1);expect(merged[0]).toMatchObject({amount:300,checked:false,section:'Füllung / Hülle',notes:'Fein hacken\nSchmelzen'});
  expect(mergeIngredients(merged,[row()])[0]).toMatchObject({amount:400,section:'Füllung / Hülle',notes:'Fein hacken\nSchmelzen'});
  expect(original[0]).toMatchObject({amount:100,checked:true});
});
it('keeps unknown amounts, units and chocolate types separate, preserving zero',()=>{
  const merged=mergeIngredients([],[row(),row({id:'b',amount:null}),row({id:'c',unit:'ml'}),row({id:'d',name:'Weiße Schokolade'}),row({id:'e',amount:0}),row({id:'f',name:'Salz',amount:0})]);
  expect(merged).toHaveLength(5);expect(merged.map(i=>i.amount)).toEqual([100,null,100,100,0]);
  expect(new Set(merged.map(i=>i.id)).size).toBe(5);
});
it('avoids floating point artefacts in totals',()=>{
  expect(mergeIngredients([],[row({amount:0.1}),row({amount:0.2})])[0].amount).toBe(0.3);
});
