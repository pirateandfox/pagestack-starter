// Dates on the site are clock times at the venue, as written: 5 p.m. is 5 p.m. whatever machine
// builds the site. A Date here holds that clock time in its UTC fields, so always read it with
// getUTC…() or timeZone: 'UTC', never getHours() or a bare toLocaleString(), which would use the
// build machine's zone. The site's own time zone matters in one place: what time it is now.
import site from '../data/site.json';

/** Site details → Time zone. Blank means the build machine's (on most hosts UTC, unless TZ is set). */
const timeZone = (site as { timeZone?: string }).timeZone?.trim() || undefined;

let clock: Intl.DateTimeFormat;
try {
  clock = new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
} catch {
  throw new Error(`"${timeZone}" isn't a time zone. Set "timeZone" in src/data/site.json to a name like "America/New_York".`);
}

/** The clock time at the venue at a real moment. */
function clockTime(moment: Date): Date {
  const p = Object.fromEntries(clock.formatToParts(moment).map((x) => [x.type, Number(x.value)]));
  return new Date(Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second));
}

/** Now, at the venue. Compare event and article dates with this, not with new Date(). */
export const siteNow = () => clockTime(new Date());

/**
 * A date from front matter, as written. With or without a time, with or without seconds:
 *   2026-10-02   2026-12-04T17:00   2026-12-04T17:00:00   2026-12-04 17:00
 * YAML reads some of these as a Date, already with the written time in its UTC fields; the rest
 * arrive as text. Text with a zone (…T17:00-05:00) is a real moment, so it becomes the venue's
 * time. Leave zones off: YAML turns one with seconds into a UTC Date before it gets here.
 * Anything else is returned untouched, for the schema to accept or reject.
 */
export function localDate(v: unknown): unknown {
  if (typeof v !== 'string') return v;
  const s = v.trim();
  const iso = /^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?))?\s*(Z|[+-]\d{2}:?\d{2})?$/i.exec(s);
  if (!iso) {
    // Written out, such as "December 4, 2026 5:00 PM".
    const d = new Date(`${s} UTC`);
    return isNaN(+d) ? v : d;
  }
  const [, day, time = '00:00', zone] = iso;
  const d = new Date(`${day}T${time}${zone && iso[2] ? zone.toUpperCase() : 'Z'}`);
  if (isNaN(+d)) return v;
  return zone && iso[2] ? clockTime(d) : d;
}
