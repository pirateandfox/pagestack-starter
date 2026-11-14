// The themes in public/themes, and the font pairings the Theme settings can swap in.
export const themes = [
  { value: 'plain', label: 'Plain' },
  { value: 'editorial', label: 'Editorial' },
  { value: 'soft', label: 'Soft' },
];

/** Font pairings that can override a theme's own. `url` is a Google Fonts stylesheet. */
export const fontPairings: Record<string, { label: string; url: string; display: string; body: string; weight: number }> = {
  geist: { label: 'Geist (clean sans)', url: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap', display: '"Geist", system-ui, sans-serif', body: '"Geist", system-ui, sans-serif', weight: 600 },
  newsreader: { label: 'Newsreader + Instrument Sans (editorial)', url: 'https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Instrument+Sans:wght@400;500;600&display=swap', display: '"Newsreader", Georgia, serif', body: '"Instrument Sans", system-ui, sans-serif', weight: 400 },
  jakarta: { label: 'Plus Jakarta Sans (friendly)', url: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap', display: '"Plus Jakarta Sans", system-ui, sans-serif', body: '"Plus Jakarta Sans", system-ui, sans-serif', weight: 700 },
  syne: { label: 'Syne + Inter Tight (bold)', url: 'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter+Tight:wght@400;500;600&display=swap', display: '"Syne", system-ui, sans-serif', body: '"Inter Tight", system-ui, sans-serif', weight: 700 },
  cormorant: { label: 'Cormorant + Karla (elegant)', url: 'https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,500;0,600;1,500&family=Karla:wght@400;500;600&display=swap', display: '"Cormorant", Georgia, serif', body: '"Karla", system-ui, sans-serif', weight: 500 },
};
