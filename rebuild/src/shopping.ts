import type { Ingredient, ShoppingList } from './domain';

// Deliberately conservative: quantities in g and ml are never added together.
function nameKey(value:string) { return value.normalize('NFKC').toLocaleLowerCase('de').replace(/[.,]/g,' ').replace(/\s+/g,' ').trim(); }
function unitKey(value:string) {
  const key=nameKey(value);
  return ({ gramm:'g', milliliter:'ml', stück:'stück', stueck:'stück', stk:'stück', kilogramm:'kg' } as Record<string,string>)[key] ?? key;
}
export function mergeIngredients(existing:ShoppingList['items'], incoming:Ingredient[]):ShoppingList['items'] {
  const result=structuredClone(existing);
  for(const row of incoming) {
    // Unknown amounts stay separate from quantified amounts, so a total never hides missing data.
    const match=result.find(i=>nameKey(i.name)===nameKey(row.name)&&unitKey(i.unit)===unitKey(row.unit)&&(i.amount===null)===(row.amount===null));
    if(match) {
      if(match.amount!==null&&row.amount!==null) match.amount=Math.round((match.amount+row.amount)*1e9)/1e9;
      match.notes=[...new Set([...match.notes.split('\n'),...row.notes.split('\n')].filter(Boolean))].join('\n');
      match.section=[...new Set([...match.section.split(' / '),...row.section.split(' / ')].filter(Boolean))].join(' / ');
      match.checked=false;
    } else result.push({...row,id:crypto.randomUUID(),checked:false});
  }
  return result;
}
