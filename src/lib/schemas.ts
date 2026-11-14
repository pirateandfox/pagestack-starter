// Collection schemas, shared by content.config.ts (the build) and src/lib/content.ts (the editor's
// live list pages, which parse what the editor has saved with the same rules).
import { z } from 'astro/zod';

/**
 * Dates are the venue's local time, as written. A bare day (2026-10-02, which YAML and Date both
 * read as midnight UTC) becomes local midnight, so it never shows as the day before; a date with a
 * time and no zone (2026-12-04T17:00) is already local.
 */
export function localDate(v: unknown): unknown {
  if (v instanceof Date && !isNaN(+v) && v.getUTCHours() === 0 && v.getUTCMinutes() === 0 && v.getUTCSeconds() === 0) return new Date(v.getUTCFullYear(), v.getUTCMonth(), v.getUTCDate());
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v.trim())) return new Date(`${v.trim()}T00:00`);
  return v;
}
const date = z.preprocess(localDate, z.coerce.date());

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
  end: date.optional(),
  /** All-day events show no time. */
  allDay: z.boolean().default(false),
  place: z.string().optional(),
  address: z.string().optional(),
  online: z.string().optional(),
  tickets: z.string().optional(),
  price: z.string().optional(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  draft: z.boolean().default(false),
});
