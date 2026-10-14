import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, NavLink, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from './api';
import { type Collection, type Questionnaire } from './domain';
import { Admin } from './admin';
import { SurveyForm } from './survey';
import { AdminPreview } from './preview';
import './style.css';

function App() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => { api<Collection[]>('/api/collections').then(setCollections).catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);
  const current = collections[0];
  return <><header className="site-header"><Link className="brand" to="/"><span className="brand-mark">p.</span><span>Pralinen<span className="brand-sub">AUS KARLSRUHE</span></span></Link><nav aria-label="Hauptnavigation"><NavLink to="/" end>Start</NavLink><NavLink to="/kollektionen">Kollektionen</NavLink><NavLink to="/makingof">Unsere Geschichte</NavLink></nav><Link className="admin-link" to="/admin">Admin <span aria-hidden="true">↗</span></Link></header><main>
    {error && <p role="alert" className="notice error">{error} <button onClick={() => location.reload()}>Erneut laden</button></p>}
    <Routes>
      <Route path="/" element={loading ? <Loading/> : <Home current={current}/>}/>
      <Route path="/kollektionen" element={<section className="page"><p className="eyebrow">UNSER KLEINES ARCHIV</p><h1>Jedes Jahr ein<br/><em>neuer Genuss.</em></h1><p className="lead">Unsere Kollektionen – von den ersten Versuchen bis zu neuen Lieblingssorten.</p>{loading ? <Loading/> : <div className="collection-grid">{collections.map(c => <Link className="collection-card" to={`/kollektionen/${c.slug}`} key={c.id}><img src={c.cover} alt={`Pralinen der ${c.title}`} loading="lazy"/><div><span className="eyebrow">{c.year} · {c.pralines.length} SORTEN</span><h2>{c.title} <span>↗</span></h2></div></Link>)}</div>}</section>}/>
      <Route path="/kollektionen/:slug" element={loading ? <Loading/> : <CollectionPage collections={collections}/>}/>
      <Route path="/pralinen" element={current ? <Navigate to={`/kollektionen/${current.slug}`} replace/> : <Loading/>}/>
      <Route path="/makingof" element={<Story/>}/>
      <Route path="/umfrage/:token" element={<Survey/>}/>
      <Route path="/umfrage" element={<section className="page narrow"><p className="eyebrow">DEINE MEINUNG ZÄHLT</p><h1>Ein kleiner<br/><em>Geschmackstest.</em></h1><p className="lead">Öffne den Umfragelink, den du zusammen mit deinen Pralinen bekommen hast. Jede Kollektion hat ihre eigene Umfrage.</p></section>}/>
      <Route path="/auswertung" element={<Navigate to="/admin/auswertung" replace/>}/>
      <Route path="/admin/*" element={<Admin/>}/>
      {import.meta.env.DEV && <Route path="/vorschau" element={<AdminPreview/>}/>}
      <Route path="*" element={<section className="page"><h1>Hier fehlt ein Stück.</h1><p>Diese Seite gibt es nicht.</p><Link className="button" to="/">Zur Startseite</Link></section>}/>
    </Routes></main><footer><Link className="brand footer-brand" to="/">Pralinen aus Karlsruhe</Link><p>Mit Liebe gemacht. Zum Teilen gedacht.</p><span>Chrissi · Isi · Lina</span></footer></>;
}
export function Loading() { return <p className="loading" role="status">Einen kleinen Moment …</p>; }
function Home({ current }: { current?: Collection }) {
  return <><section className="hero"><div className="hero-copy"><p className="eyebrow">HANDGEMACHT · MIT LIEBE · AUS KARLSRUHE</p><h1>Kleine Pralinen.<br/>Große <em>Freude.</em></h1><p>Wir sind Chrissi, Isi und Lina. Wir lieben es, Pralinen zu machen – und unseren Liebsten damit ein Lächeln zu schenken.</p><div className="actions"><Link className="button" to={current ? `/kollektionen/${current.slug}` : '/kollektionen'}>Kollektion entdecken <span>↗</span></Link><Link className="text-link" to="/makingof">Wer dahintersteckt →</Link></div><div className="hero-note"><span>✳</span><p>Keine Massenware.<br/><strong>Unsere kleine Weihnachtstradition.</strong></p></div></div><div className="hero-photo"><img src={current?.cover ?? '/images/2025/gruppenbild.jpg'} alt="Unsere handgemachten Pralinen"/><div className="photo-label"><span className="eyebrow">UNSERE AKTUELLE KOLLEKTION</span><strong>{current?.year ?? 'Pralinen'}</strong><span>Jedes Stück ein kleines Geschenk.</span></div></div></section><section className="intro-strip"><span>01 / MIT LIEBE GEMACHT</span><p>Ein bisschen Schokolade.<br/><em>Ganz viel Herz.</em></p><span>Seit 2021</span></section>{current && <section className="page home-selection"><div className="section-heading"><div><p className="eyebrow">DAS STECKT IN UNSERER BOX</p><h2>Für jeden einen<br/><em>Lieblingsmoment.</em></h2></div><Link className="text-link" to={`/kollektionen/${current.slug}`}>Alle Sorten entdecken ↗</Link></div><div className="praline-grid">{current.pralines.slice(0,3).map(p => <article className="praline-card" key={p.id}><img src={p.image} alt={p.name} loading="lazy"/><h3>{p.name}</h3><p>{p.description}</p></article>)}</div></section>}<section className="invitation"><p className="eyebrow">SCHON PROBIERT?</p><h2>Dein Lieblingsstück<br/><em>interessiert uns.</em></h2><p>Über den Umfragelink bei deinen Pralinen kannst du uns erzählen,<br/>was dir geschmeckt hat und was wir noch besser machen können.</p><Link className="text-link" to="/umfrage">So funktioniert’s →</Link></section></>;
}
function CollectionPage({ collections }: { collections: Collection[] }) {
  const { slug } = useParams();
  const c = collections.find(c => c.slug === slug);
  if (!c) return <section className="page"><h1>Kollektion nicht gefunden.</h1><Link to="/kollektionen">Zum Archiv</Link></section>;
  return <section className="page"><Link className="text-link" to="/kollektionen">← Alle Kollektionen</Link><div className="collection-heading"><div><p className="eyebrow">{c.year} · HANDGEMACHT IN KARLSRUHE</p><h1>{c.title}</h1><p className="lead">{c.description}</p></div><img src={c.cover} alt={c.title}/></div><div className="praline-grid">{c.pralines.map(p => <article className="praline-card" key={p.id}><img src={p.image} alt={p.name} loading="lazy"/><h2>{p.name}</h2><p>{p.description}</p></article>)}</div></section>;
}
function Story() { return <section className="page"><p className="eyebrow">CHRISSI · ISI · LINA</p><h1>Eine Küche.<br/>Drei Freundinnen.<br/><em>Ganz viel Schokolade.</em></h1><p className="lead">Aus der Freude am Selbermachen wurde unsere kleine Tradition: Pralinen für die Menschen, die uns am Herzen liegen.</p><div className="story-grid">{[['fuellen','Füllen'],['ummanteln','Ummanteln'],['verpacken','Verschenken']].map(([image,title],i) => <article key={image}><img src={`/images/2025/${image}.jpg`} alt={title} loading="lazy"/><p className="eyebrow">0{i+1} / {title.toUpperCase()}</p><h2>{title}</h2></article>)}</div><p className="lead">Wir probieren neue Füllungen, tüfteln an unseren Lieblingssorten und freuen uns jedes Jahr auf eure Rückmeldungen.</p></section>; }
function Survey() {
  const { token } = useParams();
  const [q,setQ] = useState<Questionnaire>(); const [error,setError] = useState('');
  useEffect(() => { setQ(undefined); setError(''); api<Questionnaire>(`/api/surveys/${token}`).then(setQ).catch(e => setError(e.message)); }, [token]);
  return <section className="page narrow">{error ? <div className="notice" role="alert">{error}</div> : !q ? <Loading/> : <><p className="eyebrow">DEINE MEINUNG ZÄHLT</p><h1>{q.title}</h1><p className="lead">{q.introduction}</p><SurveyForm questionnaire={q}/></>}</section>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><App/></BrowserRouter></React.StrictMode>);
