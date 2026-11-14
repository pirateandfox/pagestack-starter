// Cloudflare Pages Function: POST /api/form. The live site's send function; see
// src/lib/form-server.ts for what it does and the settings it reads.
import { handleForm, type FormEnv } from '../../src/lib/form-server';

export const onRequestPost = ({ request, env }: { request: Request; env: FormEnv }) => handleForm(request, env, 'send');
