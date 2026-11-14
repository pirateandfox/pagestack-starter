// POST /api/form while developing and in the editor: the same checks as the live site, but the
// submission is printed to the terminal (or the editor's logs) and nothing is sent. Added by the
// starter's integration in astro.config.mjs; never part of the public build.
import type { APIRoute } from 'astro';
import { handleForm } from '../lib/form-server';

export const prerender = false;
export const POST: APIRoute = ({ request }) => handleForm(request, {}, 'log');
