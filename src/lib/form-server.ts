// The send function behind every form block and the newsletter block. Runs in two places:
//   functions/api/form.ts   on Cloudflare Pages, mode "send": emails and/or calls a webhook
//   src/editor/form-dev.ts  in `astro dev` and the editor, mode "log": prints to the terminal and
//                           sends nothing, so test entries never reach a real inbox or CRM
//
// Settings (Cloudflare Pages → Settings → Variables and Secrets), all optional, see README "Forms":
//   RESEND_API_KEY          send email through Resend (resend.com)
//   FORM_TO                 who gets the email; several separated by commas
//   FORM_FROM               the sender, on a domain verified in Resend, e.g. "Website <forms@example.com>"
//   FORM_WEBHOOK_URL        also (or instead) POST every form as JSON here: a CRM, Zapier, Make
//   NEWSLETTER_WEBHOOK_URL  where newsletter sign-ups go (Mailchimp, Kit, Buttondown via Zapier…);
//                           without it they are emailed like any other form
//   TURNSTILE_SECRET        check Cloudflare Turnstile; set with turnstileSiteKey in Site details
// Nothing is stored. With none of the sending settings, a form says it is not set up yet.
import site from '../data/site.json';

export interface FormEnv {
  RESEND_API_KEY?: string;
  FORM_TO?: string;
  FORM_FROM?: string;
  FORM_WEBHOOK_URL?: string;
  NEWSLETTER_WEBHOOK_URL?: string;
  TURNSTILE_SECRET?: string;
}

/** Names the form markup uses for itself; a field whose name would clash gets a suffix (see fieldName). */
export const RESERVED = ['form_name', 'page_url', 'submitted_at', 'website_url'];
const MIN_FILL_MS = 3000;
const MAX_BODY = 64 * 1024;
const MAX_FIELDS = 40;
const MAX_VALUE = 5000;
const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

class FormError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export async function handleForm(request: Request, env: FormEnv, mode: 'send' | 'log'): Promise<Response> {
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  try {
    const origin = request.headers.get('origin');
    if (origin && new URL(origin).host !== new URL(request.url).host) throw new FormError('Forbidden.', 403);
    if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY) throw new FormError('That is too much to send at once.', 413);

    const raw = await readBody(request);

    // Honeypot: people never see this field. Pretend it worked so the bot learns nothing.
    if (raw.website_url) return done(wantsJson, raw._next);

    // Too fast to be a person. Only checked when the page's script stamped the time (no-JS posts skip it).
    if (raw._t) {
      const t = Number(raw._t), now = Date.now();
      if (!Number.isFinite(t) || t > now + 60_000) throw new FormError('The form could not be checked. Please reload the page and try again.');
      if (now - t < MIN_FILL_MS) throw new FormError('That was quick. Please wait a moment and send it again.');
    }

    if (env.TURNSTILE_SECRET && mode === 'send') {
      const token = raw['cf-turnstile-response'];
      if (!token || !(await turnstileOk(env.TURNSTILE_SECRET, token, request.headers.get('cf-connecting-ip')))) throw new FormError('The spam check did not pass. Please try again.');
    }

    const kind = raw._kind === 'newsletter' ? 'newsletter' : 'form';
    const formName = clean(raw._form, 80) || (kind === 'newsletter' ? 'Newsletter' : 'Contact form');
    const labels = parseLabels(raw._labels);
    const fields: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) {
      if (k.startsWith('_') || k === 'website_url' || k === 'cf-turnstile-response') continue;
      if (!/^[a-z0-9_]{1,40}$/.test(k)) continue;
      if (Object.keys(fields).length >= MAX_FIELDS) break;
      fields[k] = clean(v, MAX_VALUE, true);
    }
    if (!Object.values(fields).some(Boolean)) throw new FormError('Please fill in the form before sending.');

    const emailKey = /^[a-z0-9_]{1,40}$/.test(raw._email ?? '') ? raw._email : Object.keys(fields).find((k) => k === 'email');
    const replyTo = emailKey ? fields[emailKey] : '';
    if (emailKey && replyTo && !EMAIL.test(replyTo)) throw new FormError('Please enter a valid email address.');
    if (kind === 'newsletter' && !replyTo) throw new FormError('Please enter your email address.');

    const page = pageUrl(raw._page, request);
    const submission = { form_name: formName, page_url: page, submitted_at: new Date().toISOString(), ...fields };

    if (mode === 'log') {
      const rows = Object.entries(fields).map(([k, v]) => `  ${(labels[k] || k).padEnd(22)} ${v.replace(/\n/g, '\n' + ' '.repeat(25))}`);
      console.log(`\n[form] ${formName} from ${page}: NOT SENT (dev or editor; only the live site sends)\n${rows.join('\n')}\n`);
      return done(wantsJson, raw._next);
    }

    const webhook = kind === 'newsletter' ? env.NEWSLETTER_WEBHOOK_URL || '' : env.FORM_WEBHOOK_URL || '';
    const canEmail = !!(env.RESEND_API_KEY && env.FORM_TO && env.FORM_FROM) && !(kind === 'newsletter' && webhook);
    if (!webhook && !canEmail) throw new FormError('This form is not connected yet. Please contact us another way for now.', 503);

    if (webhook) await post(webhook, { ...submission, labels });
    if (canEmail) await sendEmail(env, formName, page, fields, labels, replyTo);
    return done(wantsJson, raw._next);
  } catch (e) {
    const err = e instanceof FormError ? e : new FormError('Something went wrong and the message was not sent. Please try again.', 500);
    if (!(e instanceof FormError)) console.error('[form]', e);
    return wantsJson
      ? Response.json({ ok: false, error: err.message }, { status: err.status })
      : new Response(page('Not sent', `<p>${esc(err.message)}</p><p><a href="javascript:history.back()">Go back</a></p>`), { status: err.status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
}

async function readBody(request: Request): Promise<Record<string, string>> {
  const type = request.headers.get('content-type') ?? '';
  const text = await request.text();
  if (text.length > MAX_BODY) throw new FormError('That is too much to send at once.', 413);
  if (type.includes('application/json')) {
    const data = JSON.parse(text || '{}');
    return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v ?? '')]));
  }
  if (type.includes('multipart/form-data')) {
    const fd = await new Response(text, { headers: { 'content-type': type } }).formData();
    return fromPairs(fd.entries());
  }
  return fromPairs(new URLSearchParams(text).entries());
}

/** Repeated names (several ticked checkboxes) are joined with commas. */
function fromPairs(pairs: Iterable<[string, FormDataEntryValue]>) {
  const out: Record<string, string> = {};
  for (const [k, v] of pairs) if (typeof v === 'string') out[k] = k in out ? `${out[k]}, ${v}` : v;
  return out;
}

const clean = (v: unknown, max: number, multiline = false) => {
  let s = String(v ?? '').replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '');
  if (!multiline) s = s.replace(/\n/g, ' ');
  return s.trim().slice(0, max);
};

function parseLabels(raw?: string): Record<string, string> {
  try {
    const obj = JSON.parse(raw || '{}');
    return Object.fromEntries(Object.entries(obj).filter(([k, v]) => /^[a-z0-9_]{1,40}$/.test(k) && typeof v === 'string').slice(0, MAX_FIELDS).map(([k, v]) => [k, clean(v, 200)]));
  } catch { return {}; }
}

function pageUrl(raw: string | undefined, request: Request) {
  const base = new URL(request.url);
  try {
    const u = new URL(raw || '/', base);
    return u.host === base.host ? u.href.slice(0, 500) : base.origin + '/';
  } catch { return base.origin + '/'; }
}

/** Where a no-JS post lands afterwards: a path on this site only. */
const nextPath = (raw?: string) => (raw && /^\/(?!\/)[\w\-./]*$/.test(raw) ? raw : '/thanks/');

function done(json: boolean, next?: string) {
  return json ? Response.json({ ok: true }) : new Response(null, { status: 303, headers: { Location: nextPath(next) } });
}

async function post(url: string, body: unknown) {
  let res: Response;
  try {
    res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(10_000) });
  } catch { throw new FormError('We could not reach our mail system. Please try again in a moment.', 502); }
  if (!res.ok) throw new FormError('Our mail system did not accept the message. Please try again in a moment.', 502);
}

async function sendEmail(env: FormEnv, formName: string, page: string, fields: Record<string, string>, labels: Record<string, string>, replyTo: string) {
  const rows = Object.entries(fields).filter(([, v]) => v);
  const text = rows.map(([k, v]) => `${labels[k] || k}:\n${v}`).join('\n\n') + `\n\n—\nSent from ${page}`;
  const html = `<table style="font:15px/1.5 system-ui,sans-serif;border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#666;vertical-align:top;white-space:nowrap">${esc(labels[k] || k)}</td><td style="padding:6px 0">${esc(v).replace(/\n/g, '<br>')}</td></tr>`).join('')}</table><p style="font:13px system-ui,sans-serif;color:#888">Sent from <a href="${esc(page)}">${esc(page)}</a></p>`;
  let res: Response;
  try {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.FORM_FROM,
        to: env.FORM_TO!.split(',').map((s) => s.trim()).filter(Boolean),
        subject: `${formName}: ${site.name} website`,
        text, html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch { throw new FormError('We could not reach our mail system. Please try again in a moment.', 502); }
  if (!res.ok) {
    console.error('[form] Resend refused the email:', res.status, (await res.text()).slice(0, 300));
    throw new FormError('Our mail system did not accept the message. Please try again in a moment.', 502);
  }
}

async function turnstileOk(secret: string, token: string, ip: string | null) {
  const body = new FormData();
  body.set('secret', secret);
  body.set('response', token);
  if (ip) body.set('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body, signal: AbortSignal.timeout(8_000) });
    return ((await res.json()) as { success?: boolean }).success === true;
  } catch { return false; }
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const page = (title: string, body: string) => `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><body style="font:17px/1.6 system-ui,sans-serif;max-width:36rem;margin:15vh auto;padding:0 1.25rem"><h1 style="font-size:1.6rem">${esc(title)}</h1>${body}</body>`;
