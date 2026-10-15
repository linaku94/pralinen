export const units=['g','kg','ml','l','Stück','Packung','Dose','Beutel','Glas','Flasche','Palette','TL','EL','Prise','Tropfen'] as const;
export function normalizeUnit(value:string):string {
  const key=value.normalize('NFKC').toLocaleLowerCase('de').replace(/\./g,'').replace(/\s+/g,' ').trim();
  return ({gramm:'g',kilogramm:'kg',milliliter:'ml',liter:'l',stueck:'stück',stk:'stück',pck:'packung',pkg:'packung',päckchen:'packung',packungen:'packung',teelöffel:'tl',esslöffel:'el'} as Record<string,string>)[key]??key;
}
export function standardUnit(value:string) {return units.find(unit=>normalizeUnit(unit)===normalizeUnit(value));}
