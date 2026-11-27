// Reading the articles and events collections, plus the small formatting helpers their pages and
// feed blocks share.
import { getCollection, type CollectionEntry } from 'astro:content';
import { liveEntries } from '@pirateandfox/pagestack/live';
import { siteNow } from './dates';
import { occurrences, repeats, repeatText, type Occurrence } from './recurrence';
import { articleSchema, eventSchema } from './schemas';

export type Article = CollectionEntry<'articles'>;
export type Event = CollectionEntry<'events'>;
/** One date of an event: an event that repeats has many. */
export interface EventDate extends Occurrence { e: Event }

/**
 * On the editor's server, pages listed in liveRoutes get what has been saved rather than the
 * snapshot the editor was built with; everywhere else this is plain getCollection, so the public
 * build stays static.
 */
async function load<C extends 'articles' | 'events'>(name: C, schema: { parse(d: unknown): any }): Promise<CollectionEntry<C>[]> {
  return ((await liveEntries(name, schema)) as CollectionEntry<C>[] | null) ?? getCollection(name);
}

/** Published articles, newest first. A future date is a scheduled post: it appears once that day is built. */
export async function articles(now = siteNow()) {
  return (await load('articles', articleSchema)).filter((a) => !a.data.draft && a.data.date <= now).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Every published event, over or not. One that repeats is one entry: eventDates() gives its dates. */
export const events = async () => (await load('events', eventSchema)).filter((e) => !e.data.draft);

const DAY = 86_400_000;
/** How far ahead a repeating event is listed. Other events are listed however far off they are. */
export const AHEAD = 92 * DAY;
const FOREVER = new Date(Date.UTC(9999, 0, 1));

/** The dates of one event not over by `now`, soonest first: `ahead` limits one that repeats. */
export const datesOf = (e: Event['data'], now = siteNow(), ahead = AHEAD) => occurrences(e, now, repeats(e) ? new Date(+now + ahead) : FOREVER);

const byDate = (a: EventDate, b: EventDate) => +a.start - +b.start || a.e.data.title.localeCompare(b.e.data.title);

/** Every date to come, soonest first, as of when the site was built (see README: nightly rebuild). */
export const eventDates = async (now = siteNow()) => (await events()).flatMap((e) => datesOf(e.data, now).map((o) => ({ ...o, e }))).sort(byDate);

/**
 * The first few dates, for a feed. `once` gives an event that repeats one place, at its next date
 * that is on. Some `hidden` ones follow: site.ts brings them in as dates end between rebuilds.
 */
export async function feedDates(limit: number, once: boolean, now = siteNow()): Promise<(EventDate & { hidden: boolean })[]> {
  const all = !once ? await eventDates(now) : (await events()).flatMap((e) => {
    // A year ahead, so a series that starts next spring is still announced.
    const dates = datesOf(e.data, now, 366 * DAY);
    const on = dates.filter((o) => !o.cancelled);
    return (!repeats(e.data) ? dates : on.length ? on.slice(0, 10) : dates.slice(0, 1)).map((o) => ({ ...o, e }));
  }).sort(byDate);
  const seen = new Set<string>();
  let shown = 0, last = -1;
  const rows = all.map((o, i) => {
    const hidden = shown >= limit || (once && seen.has(o.e.id));
    if (!hidden) { seen.add(o.e.id); shown++; last = i; }
    return { ...o, hidden };
  });
  return rows.slice(0, last + 9);
}

const sameDate = (a: Date, b: Date) => localIso(a, true) === localIso(b, true);

export const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
export const fmtTime = (d: Date) => d.toLocaleTimeString('en-US', { timeZone: 'UTC', hour: 'numeric', minute: '2-digit' }).replace(':00', '').replace(' AM', ' a.m.').replace(' PM', ' p.m.');
export const dayMonth = (d: Date) => ({ day: d.getUTCDate(), month: d.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short' }), weekday: d.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short' }) });

type When = { start: Date; ends?: Date };

/** "Thursday, December 4, 5–8 p.m." for one date of an event. */
export function whenText(o: When, allDay = false) {
  const day = o.start.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric', year: o.start.getUTCFullYear() !== siteNow().getUTCFullYear() ? 'numeric' : undefined });
  if (o.ends && !sameDate(o.ends, o.start)) return allDay ? `${day} to ${fmtDate(o.ends)}` : `${day}, ${fmtTime(o.start)} to ${fmtDate(o.ends)}`;
  return allDay ? day : `${day}, ${hours(o)}`;
}

/** "5–8 p.m.": the times of something that ends the day it starts, or just when it starts. */
function hours({ start, ends }: When) {
  const a = fmtTime(start);
  if (!ends || !sameDate(ends, start)) return a;
  const b = fmtTime(ends);
  const suffix = / [ap]\.m\.$/;
  // "5–8 p.m." rather than "5 p.m.–8 p.m." when both ends share a.m. or p.m.
  return `${a.match(suffix)?.[0] === b.match(suffix)?.[0] ? a.replace(suffix, '') : a}–${b}`;
}

/** "Every Tuesday and Thursday, 6:30–8 p.m., until March 25, 2027". Blank for a one-off. */
export function seriesText(e: Event['data']) {
  if (!repeats(e)) return '';
  return [repeatText(e), !e.allDay && hours({ start: e.start, ends: e.end && +e.end > +e.start ? e.end : undefined }), e.until && `until ${fmtDate(e.until)}`].filter(Boolean).join(', ');
}

/** What to flag on a changed date. A moved one is a new time if it is still on its usual day. */
export const flagText = (o: Occurrence) => (o.cancelled ? 'Cancelled' : !o.moved ? '' : sameDate(o.start, o.usual) ? 'New time' : 'New date');

/** When a date is over, for site.ts to compare with the time at the venue. */
export const overAt = (o: Occurrence) => o.end.toISOString().slice(0, 19);

/** A date as written, with no zone: 2026-12-04T17:00, or 2026-12-04 for all-day. */
export const localIso = (d: Date, allDay = false) => d.toISOString().slice(0, allDay ? 10 : 16);

export const readTime = (body?: string) => `${Math.max(1, Math.round((body ?? '').split(/\s+/).length / 230))} min read`;

/** The description, or the opening of the body, cut on a word boundary. */
export function excerpt(e: { data: { description?: string }; body?: string }, n = 160) {
  const text = (e.data.description || (e.body ?? '').replace(/^#+ .*$/gm, '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`>]/g, '')).replace(/\s+/g, ' ').trim();
  return text.length <= n ? text : text.slice(0, n - 1).replace(/[\s,;:.\-–—]+\S*$/, '') + '…';
}
