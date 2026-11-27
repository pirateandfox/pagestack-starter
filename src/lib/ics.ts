// Calendar files. A repeating event is written out date by date rather than as a repeat rule, so
// cancelled and moved dates come out right in every calendar app; a calendar that subscribes picks up
// later dates and changes. With a time zone in Site details, times are real moments. Without one they
// are floating (no zone) and show as written in whatever calendar opens them.
import site from '../data/site.json';
import type { Event } from './content';
import { siteNow, siteZone, toMoment } from './dates';
import { occurrences, repeats } from './recurrence';

const DAY = 86_400_000;
const digits = (d: Date) => d.toISOString().replace(/[-:]/g, '');
const day = (d: Date) => digits(d).slice(0, 8);
const utc = (d: Date) => `${digits(d).slice(0, 15)}Z`;
const stamp = (d: Date) => (siteZone ? utc(toMoment(d)) : digits(d).slice(0, 15));
const esc = (s = '') => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (c) => `\\${c}`);
/** Lines longer than 75 octets are folded, as the format requires. */
function fold(line: string) {
  const out: string[] = [];
  let cur = '', n = 0;
  for (const c of line) {
    const bytes = new TextEncoder().encode(c).length;
    if (n + bytes > 73) { out.push(cur); cur = ''; n = 0; }
    cur += c;
    n += bytes;
  }
  return [...out, cur].join('\r\n ');
}

/** A one-off's date, or a series' last two months and coming year. A finished series keeps its last date. */
function datesFor(d: Event['data']) {
  if (!repeats(d)) return occurrences(d, new Date(0), d.start);
  const now = +siteNow();
  const recent = occurrences(d, new Date(now - 60 * DAY), new Date(now + 366 * DAY));
  return recent.length ? recent : occurrences(d, new Date(0), new Date(now)).slice(-1);
}

/** A feed has a `name`, and tells calendars to check it twice a day. */
export function calendar(list: Event[], origin: URL | undefined, filename: string, name?: string) {
  const now = utc(new Date());
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${esc(site.name)}//Events//EN`, 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    ...(name ? [`X-WR-CALNAME:${esc(name)}`, siteZone && `X-WR-TIMEZONE:${siteZone}`, 'REFRESH-INTERVAL;VALUE=DURATION:PT12H'] : []),
    ...list.flatMap((e) => datesFor(e.data).flatMap((o) => {
      const d = e.data;
      return [
        'BEGIN:VEVENT',
        // Named by its usual date, so a date that moves is updated rather than added again.
        `UID:${e.id}${repeats(d) ? `-${day(o.usual)}` : ''}@${origin?.host ?? 'pagestack-starter'}`,
        `DTSTAMP:${now}`,
        ...(d.allDay
          ? [`DTSTART;VALUE=DATE:${day(o.start)}`, `DTEND;VALUE=DATE:${day(new Date(+o.end + DAY))}`]
          : [`DTSTART:${stamp(o.start)}`, `DTEND:${stamp(o.ends ?? new Date(+o.start + 3600_000))}`]),
        `SUMMARY:${esc((o.cancelled ? 'Cancelled: ' : '') + d.title)}`,
        o.cancelled && 'STATUS:CANCELLED',
        (o.note || d.description) && `DESCRIPTION:${esc([o.note, d.description].filter(Boolean).join('\n'))}`,
        (d.place || d.address) && `LOCATION:${esc([d.place, d.address].filter(Boolean).join(', '))}`,
        origin && `URL:${new URL(`/events/${e.id}/`, origin).href}`,
        'END:VEVENT',
      ];
    })),
    'END:VCALENDAR',
  ].filter(Boolean) as string[];
  return new Response(lines.map(fold).join('\r\n') + '\r\n', { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` } });
}
