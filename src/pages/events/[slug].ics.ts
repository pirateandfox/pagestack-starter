// /events/<slug>.ics: the event as a calendar file, for "Add to calendar". Times are floating
// (no zone), so they show as written in whatever calendar opens them.
import type { APIRoute } from 'astro';
import site from '../../data/site.json';
import { events, type Event } from '../../lib/content';

export async function getStaticPaths() {
  return (await events({ upcoming: false })).map((e) => ({ params: { slug: e.id }, props: { e } }));
}

const pad = (n: number) => String(n).padStart(2, '0');
const day = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
const stamp = (d: Date) => `${day(d)}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00`;
const esc = (s = '') => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (c) => `\\${c}`);
/** Lines longer than 75 octets are folded, as the format requires. */
const fold = (line: string) => line.match(/.{1,73}/gu)!.join('\r\n ');

export const GET: APIRoute = ({ props, site: origin }) => {
  const { e } = props as { e: Event };
  const d = e.data;
  const nextDay = (x: Date) => new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate() + 1));
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${esc(site.name)}//Events//EN`, 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${e.id}@${origin?.host ?? 'pagestack-starter'}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    ...(d.allDay
      ? [`DTSTART;VALUE=DATE:${day(d.start)}`, `DTEND;VALUE=DATE:${day(nextDay(d.end ?? d.start))}`]
      : [`DTSTART:${stamp(d.start)}`, `DTEND:${stamp(d.end ?? new Date(d.start.getTime() + 3600_000))}`]),
    `SUMMARY:${esc(d.title)}`,
    d.description && `DESCRIPTION:${esc(d.description)}`,
    (d.place || d.address) && `LOCATION:${esc([d.place, d.address].filter(Boolean).join(', '))}`,
    origin && `URL:${new URL(`/events/${e.id}/`, origin).href}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean) as string[];
  return new Response(lines.map(fold).join('\r\n') + '\r\n', { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': `attachment; filename="${e.id}.ics"` } });
};
