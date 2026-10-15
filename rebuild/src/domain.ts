import { z } from 'zod';

const text = (max: number) => z.string().trim().max(max);
const image = z.string().regex(/^\/(?:images\/[a-zA-Z0-9_./-]+|api\/images\/[a-zA-Z0-9-]+)$/).max(300);
export const pralineSchema = z.object({ id: text(100).min(1), name: text(100).min(1), description: text(1000), image });
export const collectionSchema = z.object({
  slug: text(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), year: z.number().int().min(2000).max(2100),
  title: text(150).min(1), description: text(3000), cover: image, published: z.boolean(),
  pralines: z.array(pralineSchema).min(1).max(30)
}).refine(c => new Set(c.pralines.map(p => p.id)).size === c.pralines.length, 'Pralinen-IDs müssen eindeutig sein.');
export const questionSchema = z.object({
  id: text(100).min(1), label: text(250).min(1), type: z.enum(['choice', 'rating', 'text']), required: z.boolean(),
  options: z.array(text(100).min(1)).max(30)
}).refine(q => q.type !== 'choice' || (q.options.length >= 2 && new Set(q.options).size === q.options.length), 'Auswahlfragen brauchen mindestens zwei eindeutige Optionen.');
export const questionnaireSchema = z.object({
  collectionId: text(100).min(1), title: text(150).min(1), introduction: text(3000), status: z.enum(['draft', 'open', 'closed']),
  questions: z.array(questionSchema).min(1).max(20)
}).refine(q => new Set(q.questions.map(x => x.id)).size === q.questions.length, 'Fragen-IDs müssen eindeutig sein.');
export const ingredientSchema = z.object({
  id: text(100).min(1), name: text(250).min(1), amount: z.number().finite().nonnegative().nullable(),
  unit: text(80), section: text(100), notes: text(1500)
});
export const recipeDetailsSchema = z.object({
  ingredientRows: z.array(ingredientSchema).max(100).default([]),
  sourceReferences: text(5000).default(''), alternatives: text(10000).default(''),
  status: z.enum(['unrated','tested','not-recommended']).default('unrated'),
  warnings: z.array(text(1000)).max(30).default([])
});
export const recipeSchema = z.object({ title: text(150).min(1), praline: text(100), yieldAmount: text(100), ingredients: text(10000), method: text(20000), notes: text(10000) }).extend(recipeDetailsSchema.shape).refine(r => r.ingredients.length > 0 || r.ingredientRows.length > 0, 'Bitte mindestens eine Zutat angeben.');
export const shoppingListSchema = z.object({
  title: text(150).min(1), year: z.number().int().min(2000).max(2100),
  items: z.array(ingredientSchema).max(200), extras: text(10000), equipment: text(10000),
  notes: text(10000), ordering: text(5000), warnings: z.array(text(1000)).max(30)
});
export type SourceCell = { address: string; row: number; column: number; value: string | number | boolean | null; format?: string; formula?: string; comment?: string; link?: string };
export type SourceArchive = { sourceUrl?: string; sheetName?: string; cells?: SourceCell[] };
export type Ingredient = z.infer<typeof ingredientSchema>;
export type ShoppingList = z.infer<typeof shoppingListSchema> & { id: string; sourceArchive?: SourceArchive };
export type Praline = z.infer<typeof pralineSchema>;
export type Collection = z.infer<typeof collectionSchema> & { id: string };
export type Question = z.infer<typeof questionSchema>;
export type Questionnaire = z.infer<typeof questionnaireSchema> & { id: string; token: string; locked?: boolean };
export type Recipe = z.infer<typeof recipeSchema> & { id: string; sourceArchive?: SourceArchive };
export type Submission = { id: string; name: string; answers: Record<string, string | number>; createdAt: string };

export function validateAnswers(questions: Question[], input: unknown) {
  const parsed = z.object({ name: text(100).default(''), answers: z.record(z.string(), z.union([z.string().max(3000), z.number()])) }).strict().parse(input);
  const known = new Set(questions.map(q => q.id));
  if (Object.keys(parsed.answers).some(id => !known.has(id))) throw new Error('Unbekannte Frage.');
  const answers: Record<string, string | number> = {};
  for (const q of questions) {
    const value = parsed.answers[q.id];
    if (value === undefined || value === '') {
      if (q.required) throw new Error(`Bitte beantworte „${q.label}“.`);
      continue;
    }
    if (q.type === 'choice' && (typeof value !== 'string' || !q.options.includes(value))) throw new Error('Ungültige Auswahl.');
    if (q.type === 'rating' && (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 5)) throw new Error('Bewertungen müssen zwischen 1 und 5 liegen.');
    if (q.type === 'text' && typeof value !== 'string') throw new Error('Bitte Text eingeben.');
    if (q.required && typeof value === 'string' && !value.trim()) throw new Error('Pflichtfeld ist leer.');
    answers[q.id] = typeof value === 'string' ? value.trim() : value;
  }
  return { name: parsed.name, answers };
}

export function summarize(question: Question, submissions: Submission[]) {
  const values = submissions.map(s => s.answers[question.id]).filter(v => v !== undefined && v !== '');
  const labels = question.type === 'rating' ? ['1', '2', '3', '4', '5'] : question.options;
  return { count: values.length, average: question.type === 'rating' && values.length ? values.reduce<number>((sum, n) => sum + Number(n), 0) / values.length : null,
    counts: labels.map(label => ({ label, count: values.filter(v => String(v) === label).length })) };
}

export function csvExport(questions: Question[], submissions: Submission[]) {
  const escape = (value: unknown) => {
    let s = String(value ?? '');
    if (/^[\s]*[=+\-@]/.test(s)) s = `'${s}`;
    return `"${s.replaceAll('"', '""')}"`;
  };
  return '\uFEFF' + [['Zeitpunkt', 'Name', ...questions.map(q => q.label)], ...submissions.map(s => [s.createdAt, s.name, ...questions.map(q => s.answers[q.id])])].map(row => row.map(escape).join(';')).join('\r\n');
}
