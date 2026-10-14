import { useState, type FormEvent } from 'react';
import { type Questionnaire } from './domain';
import { api } from './api';

export function SurveyForm({ questionnaire: q, preview = false }: { questionnaire: Questionnaire; preview?: boolean }) {
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [name,setName] = useState(''); const [busy,setBusy] = useState(false); const [error,setError] = useState(''); const [done,setDone] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (preview) return;
    setBusy(true); setError('');
    try { await api(`/api/surveys/${q.token}/responses`, { method: 'POST', body: JSON.stringify({ name, answers }) }); setDone(true); }
    catch(e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  if (done) return <div className="thank-you" role="status"><span>♡</span><h2>Danke fürs Probieren!</h2><p>Deine Rückmeldung ist angekommen. Sie ist nur für unser Pralinenteam sichtbar.</p></div>;
  return <form className="panel survey-form" onSubmit={submit}><label>Dein Name <span className="muted">(freiwillig)</span><input value={name} onChange={e => setName(e.target.value)} maxLength={100} autoComplete="given-name"/></label>{q.questions.map((question,i) => <fieldset key={question.id}><legend><span className="question-number">{String(i+1).padStart(2,'0')}</span>{question.label} {question.required && <span aria-label="Pflichtfeld">*</span>}</legend>{question.type === 'text' ? <textarea required={question.required} maxLength={3000} rows={4} value={answers[question.id] ?? ''} onChange={e => setAnswers({ ...answers, [question.id]: e.target.value })}/> : <div className={`answer-options ${question.type === 'rating' ? 'rating-options' : ''}`}>{(question.type === 'rating' ? ['1','2','3','4','5'] : question.options).map(option => <label className={`answer ${String(answers[question.id]) === option ? 'selected' : ''}`} key={option}><input type="radio" name={question.id} value={option} required={question.required} checked={String(answers[question.id]) === option} onChange={() => setAnswers({ ...answers, [question.id]: question.type === 'rating' ? Number(option) : option })}/><span>{option}</span></label>)}</div>}{question.type === 'rating' && <p className="muted">1 = wenig begeistert · 5 = absoluter Lieblingsmoment</p>}</fieldset>)}<p className="muted">* Pflichtfeld. Deine Antworten sehen ausschließlich die eingeladenen Admins. Der Name ist freiwillig.</p>{error && <p className="notice error" role="alert">{error}</p>}<button className="button" disabled={busy || preview}>{preview ? 'Vorschau – keine Antworten speichern' : busy ? 'Wird abgeschickt …' : 'Rückmeldung abschicken ↗'}</button></form>;
}
