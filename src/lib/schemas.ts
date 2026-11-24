// Collection schemas, shared by content.config.ts (the build) and src/lib/content.ts (the editor's
// live list pages, which parse what the editor has saved with the same rules).
import { z } from 'astro/zod';
import { localDate } from './dates';

/** The venue's local time, as written (see dates.ts). */
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
