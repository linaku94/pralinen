import { readdir, readFile, writeFile, cp, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const target = fileURLToPath(new URL('../', import.meta.url));
await mkdir(path.join(target, 'public/images'), { recursive: true });
await cp(path.join(root, 'src/lib/assets'), path.join(target, 'public/images'), { recursive: true });
const collections = [];
for (const year of [2021, 2022, 2023, 2024, 2025]) {
  const source = await readFile(path.join(root, year === 2025 ? 'src/routes/pralinen/+page.svelte' : `src/routes/kollektionen/${year}/+page.svelte`), 'utf8');
  const images = Object.fromEntries([...source.matchAll(/import (\w+) from '\$lib\/assets\/([^']+)'/g)].map(m => [m[1], `/images/${m[2]}`]));
  const pralines = [...source.matchAll(/<Praline picture=\{(\w+)\} name='([^']+)' description='([^']+)'/g)].map((m, i) => ({ id: `${year}-${i}`, name: year === 2024 && m[1] === 'Kaktus' ? 'Kaktus' : m[2], description: m[3], image: images[m[1]] }));
  const files = await readdir(path.join(root, `src/lib/assets/${year}`));
  const cover = files.find(n => /^gruppen/.test(n)) ?? files.find(n => n.startsWith('karlsruhe')) ?? files[0];
  collections.push({ id: String(year), slug: String(year), year, title: `Kollektion ${year}`, description: year === 2025 ? 'Sechs kleine Glücksmomente. Von fruchtiger Himbeere bis zu unserem neuen Matcha: mit Liebe von Chrissi, Isi und Lina gemacht.' : 'Unsere handgemachten Lieblingsstücke aus diesem Jahr. Eine kleine Reise durch die Pralinenküche.', cover: `/images/${year}/${cover}`, published: true, pralines });
}
const sql = s => `'${String(s).replaceAll("'", "''")}'`;
const inserts = collections.map(c => `INSERT INTO collections (id, slug, year, title, description, cover, published, pralines) VALUES (${[c.id,c.slug,c.year,c.title,c.description,c.cover,1,JSON.stringify(c.pralines)].map(sql).join(',')}) ON CONFLICT(id) DO NOTHING;`);
await writeFile(path.join(target, 'migrations/0002_content.sql'), inserts.join('\n') + '\n');
await writeFile(path.join(target, 'src/imported-collections.json'), JSON.stringify(collections, null, 2) + '\n');
console.log(`Imported ${collections.length} collections and copied existing photos. No questionnaires or historical responses were invented.`);
