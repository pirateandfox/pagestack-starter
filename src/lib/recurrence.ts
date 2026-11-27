// Repeating events: the dates a rule makes. Pure, with no imports, so Node can run the tests directly.
//
// Every Date here is a clock time at the venue held in UTC fields (see dates.ts), so adding days is
// plain arithmetic and daylight saving can't move an event: noon stays noon.
export type Repeat = 'none' | 'weekly' | 'biweekly' | 'monthly-date' | 'monthly-weekday';
export const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
export interface Exception { date: Date; change: 'cancelled' | 'moved' | 'skipped'; start?: Date; end?: Date; note?: string }
export interface Rule { start: Date; end?: Date; allDay?: boolean; repeat?: Repeat; alsoOn?: string[]; until?: Date; exceptions?: Exception[] }
/**
 * One date. `usual` is when the rule puts it, so it names the date even if it has moved. `end` is when
 * it counts as over; `ends` is the same when the event gives an end, and absent when it doesn't.
 */
export interface Occurrence { usual: Date; start: Date; end: Date; ends?: Date; cancelled?: boolean; moved?: boolean; note?: string }

export const repeats = (rule: Pick<Rule, 'repeat'>) => (rule.repeat ?? 'none') !== 'none';

const DAY = 86_400_000;
const midnight = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
const sameDay = (a: Date, b: Date) => midnight(a) === midnight(b);
const endOfDay = (d: Date) => new Date(midnight(d) + DAY - 1000);

/** When an occurrence counts as over: its end, or the end of its day if it has none or is all day. */
function ending(start: Date, rule: Rule): Date {
  if (rule.allDay) return endOfDay(rule.end && +rule.end > +rule.start ? new Date(midnight(start) + (midnight(rule.end) - midnight(rule.start))) : start);
  return rule.end && +rule.end > +rule.start ? new Date(+start + (+rule.end - +rule.start)) : endOfDay(start);
}

/** Start of every date in the series, in order, before exceptions. Ends by `until`, else by `to`. */
function* starts(rule: Rule, to: Date): Generator<Date> {
  const s = rule.start, stop = Math.min(+to, rule.until ? +endOfDay(rule.until) : Infinity);
  const repeat = rule.repeat ?? 'none';
  if (repeat === 'none') { if (+s <= +to) yield s; return; }
  const time = +s - midnight(s);
  if (repeat === 'weekly' || repeat === 'biweekly') {
    const days = [...new Set([s.getUTCDay(), ...(rule.alsoOn ?? []).map((x) => DAYS.indexOf(x as any)).filter((i) => i >= 0)])].sort((a, b) => a - b);
    const sunday = midnight(s) - s.getUTCDay() * DAY;
    for (let w = 0; ; w += repeat === 'weekly' ? 1 : 2) {
      for (const d of days) {
        const at = sunday + (w * 7 + d) * DAY + time;
        if (at < +s) continue;
        if (at > stop) return;
        yield new Date(at);
      }
    }
  }
  const y = s.getUTCFullYear(), m = s.getUTCMonth(), dom = s.getUTCDate(), nth = Math.ceil(dom / 7);
  for (let i = 0; ; i++) {
    const first = new Date(Date.UTC(y, m + i, 1)), len = new Date(Date.UTC(y, m + i + 1, 0)).getUTCDate();
    if (+first > stop) return;
    let day: number;
    if (repeat === 'monthly-date') { if (dom > len) continue; day = dom; } // the 31st: months without one are skipped
    else {
      day = 1 + ((s.getUTCDay() - first.getUTCDay() + 7) % 7) + (nth - 1) * 7;
      if (nth === 5) while (day > len) day -= 7; // a 5th weekday means the last one
    }
    const at = Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), day) + time;
    if (at > stop) return;
    if (at >= +s) yield new Date(at);
  }
}

/** Occurrences not over by `from` that start by `to`, soonest first. */
export function occurrences(rule: Rule, from: Date, to: Date): Occurrence[] {
  const out: Occurrence[] = [];
  // Look past `to`: an exception may move a later date earlier. Nothing moves by more than 60 days.
  const reach = new Date(+to + 60 * DAY);
  for (const s of starts(rule, reach)) {
    // The editor hides this list for a one-off but keeps what is in it.
    const x = !repeats(rule) ? undefined : rule.exceptions?.find((e) => sameDay(e.date, s));
    if (x?.change === 'skipped') continue; // never took place: not listed at all
    const at = (start: Date, own?: Date): Occurrence => {
      const end = own && +own > +start ? (rule.allDay ? endOfDay(own) : own) : ending(start, rule);
      const stated = (own && +own > +start) || (rule.end && +rule.end > +rule.start);
      return { usual: s, start, end, ...(stated ? { ends: end } : {}) };
    };
    let o = at(s);
    if (x?.change === 'cancelled') o = { ...o, cancelled: true, note: x.note };
    else if (x) {
      const start = x.start ?? s;
      o = { ...at(start, x.end), moved: +start !== +s, note: x.note };
    }
    if (+o.end >= +from && +o.start <= +to) out.push(o);
  }
  return out.sort((a, b) => +a.start - +b.start);
}

/** "Every Tuesday and Thursday", "Third Wednesday of the month"… Blank for a one-off. */
export function repeatText(rule: Rule): string {
  const name = (i: number) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i];
  const s = rule.start;
  switch (rule.repeat ?? 'none') {
    case 'weekly': case 'biweekly': {
      const days = [...new Set([s.getUTCDay(), ...(rule.alsoOn ?? []).map((x) => DAYS.indexOf(x as any)).filter((i) => i >= 0)])].sort((a, b) => a - b).map(name);
      return `${rule.repeat === 'weekly' ? 'Every' : 'Every other'} ${days.length > 1 ? days.slice(0, -1).join(', ') + ' and ' + days.at(-1) : days[0]}`;
    }
    case 'monthly-date': return `Monthly on day ${s.getUTCDate()}`;
    case 'monthly-weekday': return `${['First', 'Second', 'Third', 'Fourth', 'Last'][Math.ceil(s.getUTCDate() / 7) - 1]} ${name(s.getUTCDay())} of the month`;
    default: return '';
  }
}
