// Contrast checks for theme colours (WCAG 2 ratio). Used by the all-blocks page, by Base to pick
// a readable text colour for a custom accent, and by `npm run check:contrast`. No imports, so
// Node can run it directly.

/** #rgb, #rrggbb (alpha ignored) or rgb()/rgba() to [r, g, b] 0–255. Anything else: null. */
export function parseColor(raw: string | undefined): [number, number, number] | null {
  const s = String(raw ?? '').trim().toLowerCase();
  let m = s.match(/^#([0-9a-f]{3,4})$/);
  if (m) return [0, 1, 2].map((i) => parseInt(m![1][i] + m![1][i], 16)) as [number, number, number];
  m = s.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/);
  if (m) return [0, 2, 4].map((i) => parseInt(m![1].slice(i, i + 2), 16)) as [number, number, number];
  m = s.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/);
  if (m) return [+m[1], +m[2], +m[3]];
  if (s === 'white') return [255, 255, 255];
  if (s === 'black') return [0, 0, 0];
  return null;
}

function luminance([r, g, b]: [number, number, number]): number {
  const ch = (v: number) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

/** Contrast ratio between two colours, 1 to 21. Null if either can't be read. */
export function contrast(a: string | undefined, b: string | undefined): number | null {
  const x = parseColor(a), y = parseColor(b);
  if (!x || !y) return null;
  const [hi, lo] = [luminance(x), luminance(y)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
}

/** Of the candidates, the one that reads best on `bg`. */
export function bestOn(bg: string, candidates = ['#ffffff', '#111111']): string {
  return candidates.reduce((best, c) => ((contrast(c, bg) ?? 0) > (contrast(best, bg) ?? 0) ? c : best));
}

/** The `--name: value;` pairs in a theme's `:root { }` block. */
export function themeVars(css: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of css.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)) out[m[1]] = m[2].trim();
  return out;
}

/**
 * The pairs that matter, with the minimum each needs: 4.5 for body text, 3 for large text and
 * for things like the accent used as a link or a tick. `vars` is a theme's variables with any
 * Theme settings applied on top.
 */
export const PAIRS: { fg: string; bg: string; min: number; what: string }[] = [
  { fg: 'color-ink', bg: 'color-bg', min: 4.5, what: 'Text on the page' },
  { fg: 'color-ink', bg: 'color-surface', min: 4.5, what: 'Text on muted sections and cards' },
  { fg: 'color-muted', bg: 'color-bg', min: 4.5, what: 'Secondary text on the page' },
  { fg: 'color-muted', bg: 'color-surface', min: 4.5, what: 'Secondary text on muted sections' },
  { fg: 'color-accent-ink', bg: 'color-accent', min: 4.5, what: 'Text on the accent (buttons, accent sections, the announcement bar)' },
  { fg: 'color-accent', bg: 'color-bg', min: 3, what: 'The accent as links and highlights on the page' },
  { fg: 'color-accent', bg: 'color-surface', min: 3, what: 'The accent as links and highlights on muted sections' },
  { fg: 'color-inverse-ink', bg: 'color-inverse-bg', min: 4.5, what: 'Text on dark (inverse) sections' },
];

export interface ContrastIssue { what: string; fg: string; bg: string; ratio: number; min: number }

export function checkTheme(vars: Record<string, string>): ContrastIssue[] {
  const issues: ContrastIssue[] = [];
  for (const p of PAIRS) {
    const ratio = contrast(vars[p.fg], vars[p.bg]);
    if (ratio !== null && ratio < p.min) issues.push({ what: p.what, fg: vars[p.fg], bg: vars[p.bg], ratio: Math.round(ratio * 100) / 100, min: p.min });
  }
  return issues;
}

/** Theme settings (src/data/theme.json) applied over a theme's variables, as Base does it. */
export function withSettings(vars: Record<string, string>, settings: { accent?: string; accentInk?: string }): Record<string, string> {
  const out = { ...vars };
  if (settings.accent && parseColor(settings.accent)) {
    out['color-accent'] = settings.accent;
    out['color-accent-ink'] = settings.accentInk && parseColor(settings.accentInk) ? settings.accentInk : bestOn(settings.accent);
  } else if (settings.accentInk && parseColor(settings.accentInk)) {
    out['color-accent-ink'] = settings.accentInk;
  }
  return out;
}
