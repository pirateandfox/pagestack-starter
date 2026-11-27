// /events/<slug>.ics: the event as a calendar file, for "Add to calendar" (src/lib/ics.ts).
import type { APIRoute } from 'astro';
import { events, type Event } from '../../lib/content';
import { calendar } from '../../lib/ics';
import { repeats } from '../../lib/recurrence';

export async function getStaticPaths() {
  return (await events()).map((e) => ({ params: { slug: e.id }, props: { e } }));
}

export const GET: APIRoute = ({ props, site }) => {
  const { e } = props as { e: Event };
  return calendar([e], site, `${e.id}.ics`, repeats(e.data) ? e.data.title : undefined);
};
