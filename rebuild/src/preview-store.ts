import {recipeSchema,shoppingListSchema,type Recipe,type ShoppingList} from './domain';
import {mergeIngredients} from './shopping';
const key='pralinen-local-recipe-preview-v1';
const ingredient=(id:string,name:string,amount:number)=>({id,name,amount,unit:'g',section:'Füllung',notes:''});
function initial():{recipes:Recipe[];lists:ShoppingList[]} {
  return {recipes:[{id:'demo-himbeer',...recipeSchema.parse({title:'Himbeer-Ganache · Beispiel',praline:'Himbeer',yieldAmount:'30 Pralinen',ingredients:'',ingredientRows:[ingredient('choc','Schokolade, zartbitter',200),ingredient('fruit','Himbeerpüree',100)],method:'Schokolade fein hacken. Warmes Fruchtpüree unterrühren und die Ganache abkühlen lassen.',notes:'Erfundene Beispieldaten zum Testen der neuen Ansichten.'})},{id:'demo-karamell',...recipeSchema.parse({title:'Karamell-Ganache · Beispiel',praline:'Karamell',yieldAmount:'30 Pralinen',ingredients:'',ingredientRows:[ingredient('choc','Schokolade, zartbitter',150),ingredient('cream','Sahne',100)],method:'Beispiel für die Zubereitung.',notes:'Zusammen mit Himbeer ergibt diese Liste 350 g Zartbitterschokolade.'})}],lists:[{id:'demo-list',...shoppingListSchema.parse({title:'Test-Einkauf',year:new Date().getFullYear(),items:[],extras:'',equipment:'',notes:'Lokale Testliste',ordering:'',warnings:[]})}]};
}
export function previewRecipes():Recipe[] {return read().recipes;}
function read():ReturnType<typeof initial> {try{return JSON.parse(localStorage.getItem(key)??'null')??initial();}catch{return initial();}}
export function previewRequest(url:string,options:RequestInit):unknown {
  const data=read(),method=options.method??'GET',parts=url.split('/'),id=parts[4];
  if(url==='/api/admin/recipes'&&method==='GET')return data.recipes;
  if(url==='/api/admin/shopping-lists'&&method==='GET')return data.lists;
  const body=JSON.parse(String(options.body??'{}'));
  if(parts[3]==='recipes'&&method==='PUT') {
    const recipe={id,...recipeSchema.parse(body)};data.recipes=[...data.recipes.filter(r=>r.id!==id),recipe];localStorage.setItem(key,JSON.stringify(data));return {success:true};
  }
  if(parts[3]==='shopping-lists') {
    const old=data.lists.find(l=>l.id===id);
    if(old&&body.revision!==old.revision)throw new Error('Die Liste wurde inzwischen geändert. Bitte erneut öffnen.');
    let list:ShoppingList;
    if(method==='POST'&&parts[5]==='recipes') {
      const recipe=data.recipes.find(r=>r.id===body.recipeId);
      if(!old||!recipe)throw new Error('Rezept oder Liste nicht gefunden.');
      list={...old,...shoppingListSchema.parse({...old,items:mergeIngredients(old.items,recipe.ingredientRows)}),revision:old.revision+1};
    } else if(method==='PUT')list={id,...shoppingListSchema.parse(body),revision:(old?.revision??0)+1};
    else throw new Error('Vorschau-Anfrage nicht unterstützt.');
    data.lists=[...data.lists.filter(l=>l.id!==id),list];localStorage.setItem(key,JSON.stringify(data));return list;
  }
  throw new Error('Vorschau-Anfrage nicht unterstützt.');
}
