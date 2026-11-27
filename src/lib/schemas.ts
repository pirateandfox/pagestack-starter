// Collection schemas, shared by content.config.ts (the build) and src/lib/content.ts (the editor's
// live list pages, which parse what the editor has saved with the same rules).
import { z } from 'astro/zod';
import { localDate } from './dates';

/** The venue's local time, as written (see dates.ts). */
const date = z.preprocess(localDate, z.coerce.date());
/** A date that may be missing. The editor leaves one that has been cleared as ''. */
const optionalDate = z.preprocess((v) => (v === '' || v === null ? undefined : localDate(v)), z.coerce.date().optional());
/** A changed date of a repeating event. `date` is the day it would usually be. */
const exception = z.object({
  date,
  change: z.preprocess((v) => v || 'cancelled', z.enum(['cancelled', 'moved', 'skipped'])),
  start: optionalDate,
  end: optionalDate,
  note: z.string().optional(),
});

export const articleSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date,
  author: z.string().optional(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

export const eventSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  /** Start, with a time (the editor's date field stores local time as written). */
  start: date,
  end: optionalDate,
  /** All-day events show no time. */
  allDay: z.boolean().default(false),
  /** How it repeats (lib/recurrence.ts). The rest of these only count when it does. */
  repeat: z.preprocess((v) => v || 'none', z.enum(['none', 'weekly', 'biweekly', 'monthly-date', 'monthly-weekday'])),
  alsoOn: z.array(z.string()).nullish().transform((v) => v ?? []),
  until: optionalDate,
  /** A row added in the editor but not given a date yet is left out rather than failing the build. */
  exceptions: z.preprocess((v) => (Array.isArray(v) ? v.filter((x) => x?.date) : []), z.array(exception)),
  place: z.string().optional(),
  address: z.string().optional(),
  online: z.string().optional(),
  tickets: z.string().optional(),
  price: z.string().optional(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  draft: z.boolean().default(false),
});
