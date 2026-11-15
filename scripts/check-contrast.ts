// npm run check:contrast — checks every theme in public/themes, and the current Theme settings
// (src/data/theme.json) on top of the chosen theme, for text that would be hard to read.
// Warns; exits 1 only with --strict, so a brand pass can make it a gate.
import { readFileSync, readdirSync } from 'node:fs';
import { checkTheme, themeVars, withSettings } from '../src/lib/contrast.ts';

const dir = new URL('../public/themes/', import.meta.url);
const settings = JSON.parse(readFileSync(new URL('../src/data/theme.json', import.meta.url), 'utf8'));
let problems = 0;
const report = (label: string, vars: Record<string, string>) => {
  const issues = checkTheme(vars);
  problems += issues.length;
  console.log(issues.length ? `✗ ${label}` : `✓ ${label}`);
  for (const i of issues) console.log(`    ${i.what}: ${i.fg} on ${i.bg} is ${i.ratio}:1, needs ${i.min}:1`);
};
for (const f of readdirSync(dir).filter((f) => f.endsWith('.css')).sort()) {
  const vars = themeVars(readFileSync(new URL(f, dir), 'utf8'));
  report(`theme ${f.replace('.css', '')}`, vars);
  if (f === `${settings.theme || 'plain'}.css` && (settings.accent || settings.accentInk)) report(`theme ${f.replace('.css', '')} with your Theme settings`, withSettings(vars, settings));
}
if (problems && process.argv.includes('--strict')) process.exit(1);
