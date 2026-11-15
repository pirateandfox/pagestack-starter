// npm run start-fresh: clears the sample business (Meridian) off your site, without losing it.
//
// - The sample home page becomes a hidden draft, src/content/pages/sample-home.json, and a short
//   placeholder home page takes its place.
// - The announcement bar is cleared (it advertised a sample event).
// - The sample articles and events are marked `draft: true`, so they stay in the editor for
//   reference but leave the public site.
// - src/content/pages/reference.json (every section, filled in) is already a hidden draft.
//
// Drafts can be opened and copied from in the editor; they are never built. Delete them whenever
// you like. Running this twice does nothing the second time.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const at = (p: string) => new URL(p, root);
const done: string[] = [];

const home = at('src/content/pages/index.json');
const sample = at('src/content/pages/sample-home.json');
if (existsSync(sample)) {
  console.log('Already done: src/content/pages/sample-home.json exists.');
} else {
  const page = JSON.parse(readFileSync(home, 'utf8'));
  writeFileSync(sample, JSON.stringify({ ...page, title: 'Reference: sample home page', status: 'draft' }, null, 2) + '\n');
  const site = JSON.parse(readFileSync(at('src/data/site.json'), 'utf8'));
  const fresh = {
    title: 'Home',
    sections: [
      {
        id: 'home-hero', type: 'hero',
        settings: { title: site.name, text: '<p>One or two sentences that say what you do and who it is for.</p>', layout: 'minimal', image: { src: '', alt: '' } },
        blocks: [{ id: 'home-btn', type: 'button', settings: { label: 'Get in touch', href: '/#contact', style: 'solid' } }],
      },
    ],
  };
  writeFileSync(home, JSON.stringify(fresh, null, 2) + '\n');
  // The sample announcement points at a sample event, which is about to become a draft.
  if (site.announcement) writeFileSync(at('src/data/site.json'), JSON.stringify({ ...site, announcement: '' }, null, 2) + '\n');
  done.push('home page moved to src/content/pages/sample-home.json (draft); a placeholder home page is in its place');
}

for (const dir of ['src/content/articles', 'src/content/events']) {
  let n = 0;
  for (const f of readdirSync(at(dir)).filter((f) => f.endsWith('.md'))) {
    const file = at(`${dir}/${f}`);
    const src = readFileSync(file, 'utf8');
    const m = src.match(/^---\n([\s\S]*?)\n---/);
    if (!m || /^draft:\s*true\s*$/m.test(m[1])) continue;
    const front = /^draft:/m.test(m[1]) ? m[1].replace(/^draft:.*$/m, 'draft: true') : `${m[1]}\ndraft: true`;
    writeFileSync(file, src.replace(m[0], `---\n${front}\n---`));
    n++;
  }
  if (n) done.push(`${n} sample ${dir.endsWith('articles') ? 'articles' : 'events'} marked as drafts`);
}

console.log(done.length ? done.map((d) => `✓ ${d}`).join('\n') : 'Nothing to do.');
console.log('\nNext: Site details (name, menu, footer) at /edit/global/site, then build your pages. See README.md.');
