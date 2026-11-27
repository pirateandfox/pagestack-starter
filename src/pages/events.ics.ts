// /events.ics: every event, for "Subscribe to the calendar" (src/lib/ics.ts).
import type { APIRoute } from 'astro';
import info from '../data/site.json';
import { events } from '../lib/content';
import { calendar } from '../lib/ics';

export const GET: APIRoute = async ({ site }) => calendar(await events(), site, 'events.ics', `${info.name}: ${info.eventsTitle}`);
