import {expect,it} from 'vitest';
import {normalizeUnit,standardUnit} from '../src/units';
import {mergeIngredients} from '../src/shopping';
it('recognizes old unit aliases without treating different units as interchangeable',()=>{
  expect(standardUnit('Pck.')).toBe('Packung');expect(standardUnit('Stk.')).toBe('Stück');
  expect(normalizeUnit('Gramm')).toBe('g');expect(normalizeUnit('kg')).not.toBe(normalizeUnit('g'));
  expect(standardUnit('Bund')).toBeUndefined();expect(normalizeUnit('')).toBe('');
});
it('combines pack aliases and preserves manual custom-unit and unitless items',()=>{
  const item={id:'manual',name:'Backpapier',amount:2,unit:'Pck.',section:'',notes:'Für die Bleche',checked:true};
  const merged=mergeIngredients([item],[{...item,id:'recipe',amount:1,unit:'Packung'}]);
  expect(merged).toHaveLength(1);expect(merged[0]).toMatchObject({id:'manual',amount:3,checked:false,notes:'Für die Bleche'});
  expect(mergeIngredients([],[{...item,unit:'Bund'},{...item,unit:''}]).map(i=>i.unit)).toEqual(['Bund','']);
});
