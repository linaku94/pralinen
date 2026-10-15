import { useState } from 'react';
import { RecipeBook } from './recipes';
import { previewRecipes } from './preview-store';
import { Evaluation } from './admin';
import { SurveyForm } from './survey';
import type { Collection, Questionnaire, Submission } from './domain';
import imported from './imported-collections.json';

const collections: Collection[] = imported;
const questionnaire: Questionnaire = { id:'demo', token:'demo', collectionId:'2025', title:'Geschmackstest · Kollektion 2025', introduction:'Welche Praline ist dein Lieblingsstück? Wir freuen uns über deine Meinung.', status:'open', locked:true, questions:[
  { id:'best', label:'Welche Praline hat dir am besten geschmeckt?', type:'choice', required:true, options:collections[4].pralines.map(p => p.name) },
  { id:'improve', label:'Welche Praline könnte noch besser werden?', type:'choice', required:false, options:collections[4].pralines.map(p => p.name) },
  { id:'rating', label:'Wie hat dir die Kollektion insgesamt gefallen?', type:'rating', required:false, options:[] },
  { id:'comment', label:'Was möchtest du uns noch sagen?', type:'text', required:false, options:[] }
] };
const responses: Submission[] = Array.from({ length:12 }, (_,i) => ({ id:`demo-${i}`, name:`Testgast ${i+1}`, createdAt:`2026-10-14 ${String(10 + i % 5).padStart(2,'0')}:00:00`, answers:{ best:['Himbeer','Karamell','Himbeer','Matcha','Zitrone','Kokos'][i%6], improve:['Kaktus','Matcha','Kokos'][i%3], rating:i%4 === 0 ? 4 : 5, comment:i%3 === 0 ? 'Beispielantwort: Die Himbeerfüllung war mein Lieblingsstück!' : '' } }));
export function AdminPreview() {
  const [recipes,setRecipes]=useState(previewRecipes);
  const [tab,setTab] = useState('recipes');
  return <section className="page admin-page"><p className="eyebrow">LOKALE VORSCHAU</p><h1>Ein Blick in<br/><em>die Pralinenwerkstatt.</em></h1><p className="notice">Dies ist eine Vorschau mit erfundenen Beispieldaten. Sie liest keine echten Rückmeldungen. Rezept- und Einkaufslistenänderungen werden nur in diesem Browser gespeichert; die Live-Website bleibt unverändert. Der echte Adminbereich benötigt die Google-Anmeldung.</p><nav className="admin-tabs" aria-label="Vorschaubereiche"><button className="secondary" onClick={() => setTab('evaluation')}>Auswertung</button><button className="secondary" onClick={() => setTab('survey')}>Umfrage</button><button className="secondary" onClick={() => setTab('recipes')}>Rezeptbuch</button></nav>{tab === 'evaluation' && <Evaluation questionnaires={[questionnaire]} collections={collections} demo={responses}/>} {tab === 'survey' && <div className="narrow"><h2>{questionnaire.title}</h2><p>{questionnaire.introduction}</p><SurveyForm questionnaire={questionnaire} preview/></div>}{tab === 'recipes' && <RecipeBook items={recipes} reload={async()=>setRecipes(previewRecipes())}/>}</section>;
}
