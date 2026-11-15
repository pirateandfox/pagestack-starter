// npm run start-fresh             hides the sample business (Meridian), without losing it
// npm run start-fresh -- --delete  deletes it
//
// The same as Hide sample content / Delete sample content on the editor's Pages screen, for when
// you work in the terminal or with Claude. Sample content is what carries the mark: `"sample": true`
// in a page's JSON, `sample: true` in an article's or event's front matter. Editing a sample in the
// editor drops its mark, so it counts as yours from then on.
//
// Hide:
// - The sample home page moves to a hidden draft, src/content/pages/sample-home.json, and a short
//   placeholder home page takes its place (src/lib/sample-content.ts).
// - Other sample pages (Reference: every section) become drafts, if they aren't already.
// - Sample articles and events get `draft: true`: they stay in the editor for reference and leave
//   the public site.
// Delete: every sample page, article and event is removed; a sample home page is replaced the same way.
// Both clear the announcement bar (it advertised a sample event). Images are never touched.
// Running either twice does nothing the second time.
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { sampleGlobals, sampleHome } from '../src/lib/sample-content.ts';

const del = process.argv.includes('--delete');
const root = new URL('../', import.meta.url);
const at = (p: string) => new URL(p, root);
const json = (v: unknown) => JSON.stringify(v, null, 2) + '\n';
const done: string[] = [];
let found = 0; // samples seen, changed or not

// ---- pages ----
const pagesDir = 'src/content/pages';
const site = JSON.parse(readFileSync(at('src/data/site.json'), 'utf8'));
for (const f of readdirSync(at(pagesDir)).filter((f) => f.endsWith('.json'))) {
  const file = at(`${pagesDir}/${f}`);
  const page = JSON.parse(readFileSync(file, 'utf8'));
  if (page.sample !== true) continue;
  found++;
  const slug = f.slice(0, -5);
  if (slug === 'index') {
    if (!del) {
      let to = 'sample-home';
      for (let n = 2; existsSync(at(`${pagesDir}/${to}.json`)); n++) to = `sample-home-${n}`;
      writeFileSync(at(`${pagesDir}/${to}.json`), json({ ...page, title: `Sample: ${page.title}`, status: 'draft' }));
      done.push(`home page moved to ${pagesDir}/${to}.json (draft)`);
    }
    writeFileSync(file, json(sampleHome(site.name)));
    done.push('a placeholder home page is in its place');
  } else if (del) {
    rmSync(file);
    done.push(`deleted ${pagesDir}/${f}`);
  } else if (page.status !== 'draft') {
    writeFileSync(file, json({ ...page, status: 'draft' }));
    done.push(`${pagesDir}/${f} is now a draft`);
  }
}

// ---- articles and events ----
for (const dir of ['src/content/articles', 'src/content/events']) {
  let n = 0;
  for (const f of readdirSync(at(dir)).filter((f) => f.endsWith('.md'))) {
    const file = at(`${dir}/${f}`);
    const src = readFileSync(file, 'utf8');
    const m = src.match(/^---\n([\s\S]*?)\n---/);
    if (!m || !/^sample:\s*true\s*$/m.test(m[1])) continue;
    found++;
    if (del) { rmSync(file); n++; continue; }
    if (/^draft:\s*true\s*$/m.test(m[1])) continue;
    const front = /^draft:/m.test(m[1]) ? m[1].replace(/^draft:.*$/m, 'draft: true') : `${m[1]}\ndraft: true`;
    writeFileSync(file, src.replace(m[0], `---\n${front}\n---`));
    n++;
  }
  const what = dir.endsWith('articles') ? 'articles' : 'events';
  if (n) done.push(`${n} sample ${what} ${del ? 'deleted' : 'marked as drafts'}`);
}

// ---- settings ----
const reset = sampleGlobals.site;
if (Object.entries(reset).some(([k, v]) => site[k] !== v)) {
  writeFileSync(at('src/data/site.json'), json({ ...site, ...reset }));
  done.push('announcement bar cleared');
}

console.log(done.length ? done.map((d) => `✓ ${d}`).join('\n') : found ? `Nothing to do: the ${found} samples are already hidden. \`npm run start-fresh -- --delete\` removes them.` : 'Nothing to do: no sample content left.');
if (done.length && !del) console.log('\nThe samples are drafts now: open them in the editor to copy from. `npm run start-fresh -- --delete` removes them.');
console.log('\nNext: Site details (name, menu, footer) at /edit/global/site, then build your pages. See README.md.');
