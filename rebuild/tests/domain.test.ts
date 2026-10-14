import { describe, expect, it } from 'vitest';
import { validateAnswers, summarize, csvExport, type Question, type Submission } from '../src/domain';
const questions: Question[] = [{ id:'best', label:'Lieblingsstück', type:'choice', required:true, options:['Himbeer','Kokos'] }, { id:'rating', label:'Bewertung', type:'rating', required:false, options:[] }, { id:'comment', label:'Notiz', type:'text', required:false, options:[] }];
describe('questionnaire responses', () => {
  it('rejects missing required answers, injected options and unknown questions', () => {
    for (const answers of [{}, { best:'Matcha' }, { best:'Kokos', injected:'secret' }]) expect(() => validateAnswers(questions,{ answers })).toThrow();
  });
  it('accepts anonymous feedback and validates ratings and text', () => {
    expect(validateAnswers(questions, { answers:{ best:'Kokos', rating:5, comment:' lecker ' } })).toEqual({ name:'', answers:{ best:'Kokos', rating:5, comment:'lecker' } });
    for (const rating of [0,6,2.5,'5']) expect(() => validateAnswers(questions, { answers:{ best:'Kokos', rating } })).toThrow();
    expect(() => validateAnswers(questions, { answers:{ best:'Kokos', comment:'x'.repeat(3001) } })).toThrow();
  });
});
describe('evaluation', () => {
  const responses: Submission[] = [{ id:'a', name:'=SUM(A1:A3)', answers:{ best:'Himbeer', rating:5, comment:'"gut"; danke' }, createdAt:'2026-10-14 12:00:00' }, { id:'b', name:'', answers:{ best:'Kokos', rating:3 }, createdAt:'2026-10-14 13:00:00' }, { id:'c', name:'', answers:{ best:'Himbeer' }, createdAt:'2026-10-14 14:00:00' }];
  it('uses answered questions as denominator and preserves empty states', () => {
    expect(summarize(questions[0],responses).counts).toEqual([{ label:'Himbeer', count:2 }, { label:'Kokos', count:1 }]);
    expect(summarize(questions[1],responses)).toMatchObject({ count:2, average:4 });
    expect(summarize(questions[1],[])).toMatchObject({ count:0, average:null });
  });
  it('exports missing values, escapes quotes and neutralizes spreadsheet formulas', () => {
    const csv = csvExport(questions,responses);
    expect(csv).toContain('"\'=SUM(A1:A3)"');
    expect(csv).toContain('""gut""; danke');
    expect(csv).toContain('"Kokos";"3";""');
  });
});
