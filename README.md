# PageStack starter

A small-business website you can edit like WordPress, that stays a fast static site.
Built on [Astro](https://astro.build) and [PageStack](https://github.com/pirateandfox/pagestack):
pages are made of blocks you add, move and type into, and everything you edit is saved as files
in this repo.

It ships as **Meridian**, an invented architecture studio, so every block has real-looking
content. Replace it with yours.

## Start

```sh
npm install
npm run dev            # the site, at http://localhost:4321
npm run dev:editor     # the site plus the editor, at http://localhost:4321/edit
```

The editor saves straight into `src/` while you develop. Commit what you want to keep.

## What's in it

- **48 ready-made sections from 31 blocks**, in groups: Openers, Text and media, Explain, Offer,
  Proof, People, Feeds, Act. See them all at **`/blocks`** (dev and editor only): one page, every
  block, a labelled bar above each, and a theme switcher. Work on that page when giving the site a
  new look.
- **Three themes**: Plain, Editorial and Soft (`public/themes/*.css`). A theme is one file of
  colours, fonts and corners; the blocks use nothing else. **Site settings → Theme** picks one and
  overrides the accent colour, fonts, corners, button shape and spacing. A custom accent with no
  text colour gets white or near-black, whichever reads better. `npm run check:contrast` checks
  every theme and your settings for hard-to-read colours, and `/blocks` shows the same warnings.
- **Instructions for Claude** in `CLAUDE.md`: a brand pass (a new theme from a brand), a build
  pass (pages from a brief, real words, no lorem ipsum) and a recipe for adding a block.
- **Journal and Events**: folders of Markdown (`src/content/articles`, `src/content/events`),
  edited in the editor on their real page. `/journal/` and `/events/` list them, each has its own
  page, events have an **Add to calendar** file, and both carry search-engine markup. The
  **Articles feed** and **Events feed** blocks put the latest on any page.
- **Forms** that email you or send to your CRM (below).

## Forms

The **Form** block (fields you add in the editor: text, email, phone, message, dropdown,
choose-one, tick box, date, number) and the **Newsletter sign-up** block post to one small send
function, `functions/api/form.ts`, which runs on Cloudflare Pages. It stores nothing.

**While developing and in the editor, nothing is sent.** Submissions are printed in the terminal,
so test entries never reach a real inbox or CRM.

On the live site, until it is set up, a form says it isn't connected yet. To set it up (about ten
minutes), add these in **Cloudflare → your Pages project → Settings → Variables and Secrets**:

| Variable | What it is |
|---|---|
| `RESEND_API_KEY` | From [resend.com](https://resend.com) (free for 3,000 emails a month). Add your domain there and the DNS records it shows, then create an API key. |
| `FORM_TO` | Who receives form emails. Several, separated by commas. |
| `FORM_FROM` | The sender, on the domain you verified: `Website <forms@yourdomain.com>` |
| `FORM_WEBHOOK_URL` | Optional. Also (or instead of email) send every form as JSON to a CRM, Zapier or Make. |
| `NEWSLETTER_WEBHOOK_URL` | Optional. Where sign-ups go (Mailchimp, Kit, Buttondown, usually through Zapier or Make). Without it they are emailed. |
| `TURNSTILE_SECRET` | Optional spam check. Create a [Turnstile](https://developers.cloudflare.com/turnstile/) widget, put its site key in **Site settings → Site details → Turnstile site key** and its secret here. |

Redeploy after adding them. Replies to a form email go to the address the person typed.

The webhook body is flat, so a CRM can map it field by field:

```json
{ "form_name": "Contact form", "page_url": "https://…/", "submitted_at": "2026-11-14T21:09:26Z",
  "your_name": "Ana", "email": "ana@example.com", "tell_us_about_it": "…",
  "labels": { "your_name": "Your name", "email": "Email", "tell_us_about_it": "Tell us about it" } }
```

Field names come from the labels (`Wedding date` → `wedding_date`). Spam protection: a hidden
honeypot field, a too-fast-to-be-human check, a same-site check, and Turnstile if you set it up.
Without JavaScript a form still works: it posts and lands on `/thanks/` (a normal page you can
edit).

## Nightly rebuild

The site is static, so "upcoming events" and "published articles" are worked out when it is built.
A nightly rebuild keeps them right: past events drop off, and an article dated in the future
appears on its day.

1. Cloudflare → your Pages project → **Settings → Builds → Deploy hooks → Add** (the branch your
   live site builds from). Copy the URL.
2. GitHub → this repo → **Settings → Secrets and variables → Actions → New repository secret**:
   `CF_DEPLOY_HOOK`, with that URL.

`.github/workflows/nightly-rebuild.yml` then calls it every night. Without the secret it does
nothing.

## Deploy

Cloudflare Pages, connected to this repo: build command `npm run build`, output `dist`. The
`functions/` folder is picked up automatically. For an editor your client can use online
(passkey login, saves to GitHub), see the
[PageStack README](https://github.com/pirateandfox/pagestack#readme).

## Where things are

```
public/themes/           one CSS file per theme (variables only)
src/styles/              base.css (layout, type, buttons), blocks.css (every block)
src/sections/schema.ts   every block's fields: what the editor shows
src/sections/index.ts    the block library (presets), templates, site settings, collections
src/sections/*.astro     one component per block
src/content/pages/       pages, one JSON file each (index.json is the home page)
src/content/articles/    journal articles (Markdown)
src/content/events/      events (Markdown)
src/data/                site details and theme settings
src/lib/form-server.ts   the send function's logic
src/editor/              /blocks, editor previews, the dev-only form route
scripts/check-contrast.ts  npm run check:contrast
CLAUDE.md                how Claude should brand, build and extend the site
```

## License

MIT
