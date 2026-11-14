// Turns a pasted link into an address that can go in an <iframe>. Only https links are allowed,
// so an editor can't embed a javascript: or data: page. Known services get their embed form;
// anything else is used as is (booking pages and maps usually allow embedding).
export function embedSrc(raw: unknown): string {
  if (typeof raw !== 'string' || !raw.trim()) return '';
  let u: URL;
  try { u = new URL(raw.trim()); } catch { return ''; }
  if (u.protocol !== 'https:') return '';
  const host = u.hostname.replace(/^www\.|^m\./, '');
  const id = (s: string | null | undefined) => (s && /^[\w-]{6,20}$/.test(s) ? s : '');
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const v = id(u.searchParams.get('v')) || id(u.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1]);
    return v ? `https://www.youtube-nocookie.com/embed/${v}` : '';
  }
  if (host === 'youtu.be') { const v = id(u.pathname.slice(1)); return v ? `https://www.youtube-nocookie.com/embed/${v}` : ''; }
  if (host === 'vimeo.com') { const v = u.pathname.match(/^\/(\d+)/)?.[1]; return v ? `https://player.vimeo.com/video/${v}?dnt=1` : ''; }
  if (host === 'open.spotify.com' && !u.pathname.startsWith('/embed/')) return `https://open.spotify.com/embed${u.pathname}`;
  if (host === 'soundcloud.com') return `https://w.soundcloud.com/player/?url=${encodeURIComponent(u.href)}&visual=false`;
  if (host === 'calendly.com') { u.searchParams.set('hide_gdpr_banner', '1'); return u.href; }
  return u.href;
}

/** A Google Maps embed for a place or address; no API key needed. */
export function mapSrc(query: unknown): string {
  const q = typeof query === 'string' ? query.replace(/\s+/g, ' ').trim() : '';
  return q ? `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed` : '';
}
