// Reading the articles and events collections, plus the small formatting helpers their pages and
// feed blocks share.
import { getCollection, type CollectionEntry } from 'astro:content';
import { liveEntries } from '@pirateandfox/pagestack/live';
import { articleSchema, eventSchema } from './schemas';

export type Article = CollectionEntry<'articles'>;
export type Event = CollectionEntry<'events'>;

/**
 * On the editor's server, pages listed in liveRoutes get what has been saved rather than the
 * snapshot the editor was built with; everywhere else this is plain getCollection, so the public
 * build stays static.
 */
async function load<C extends 'articles' | 'events'>(name: C, schema: { parse(d: unknown): any }): Promise<CollectionEntry<C>[]> {
  return ((await liveEntries(name, schema)) as CollectionEntry<C>[] | null) ?? getCollection(name);
}

/** Published articles, newest first. A future date is a scheduled post: it appears once that day is built. */
export async function articles(now = new Date()) {
  return (await load('articles', articleSchema)).filter((a) => !a.data.draft && a.data.date <= now).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Events, soonest first. `upcoming` keeps those not yet over when the site was built (see README: nightly rebuild). */
export async function events({ upcoming = true, now = new Date() } = {}) {
  const all = (await load('events', eventSchema)).filter((e) => !e.data.draft);
  const ends = (e: Event) => (e.data.end ?? endOfDay(e.data.start)).getTime();
  return all
    .filter((e) => !upcoming || ends(e) >= now.getTime())
    .sort((a, b) => a.data.start.getTime() - b.data.start.getTime());
}

const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

export const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
export const fmtTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(':00', '').replace(' AM', ' a.m.').replace(' PM', ' p.m.');
export const dayMonth = (d: Date) => ({ day: d.getDate(), month: d.toLocaleDateString('en-US', { month: 'short' }), weekday: d.toLocaleDateString('en-US', { weekday: 'short' }) });

/** "Thursday 4 December, 5–8 p.m." */
export function whenText(e: Event['data']) {
  const day = e.start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: e.start.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined });
  if (e.allDay) return e.end && e.end.toDateString() !== e.start.toDateString() ? `${day} to ${fmtDate(e.end)}` : day;
  const sameDay = e.end && e.end.toDateString() === e.start.toDateString();
  if (!e.end) return `${day}, ${fmtTime(e.start)}`;
  if (!sameDay) return `${day}, ${fmtTime(e.start)} to ${fmtDate(e.end)}`;
  const [a, b] = [fmtTime(e.start), fmtTime(e.end)];
  const suffix = / [ap]\.m\.$/;
  // "5–8 p.m." rather than "5 p.m.–8 p.m." when both ends share a.m. or p.m.
  return `${day}, ${a.match(suffix)?.[0] === b.match(suffix)?.[0] ? a.replace(suffix, '') : a}–${b}`;
}

/** A date as written, without converting to UTC: 2026-12-04T17:00, or 2026-12-04 for all-day. */
export const localIso = (d: Date, allDay = false) => (allDay ? d.toLocaleDateString('sv-SE') : `${d.toLocaleDateString('sv-SE')}T${d.toTimeString().slice(0, 5)}`);

export const readTime = (body?: string) => `${Math.max(1, Math.round((body ?? '').split(/\s+/).length / 230))} min read`;

/** The description, or the opening of the body, cut on a word boundary. */
export function excerpt(e: { data: { description?: string }; body?: string }, n = 160) {
  const text = (e.data.description || (e.body ?? '').replace(/^#+ .*$/gm, '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`>]/g, '')).replace(/\s+/g, ' ').trim();
  return text.length <= n ? text : text.slice(0, n - 1).replace(/[\s,;:.\-–—]+\S*$/, '') + '…';
}
