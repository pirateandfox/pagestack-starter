# PageStack starter

A small-business website you can edit like WordPress, that stays a fast static site.

Built on [Astro](https://astro.build) and [PageStack](https://github.com/pirateandfox/pagestack).
Pages are made of blocks you add, move and type into, and everything you edit is saved as files
in this repo. It ships as **Meridian**, an invented architecture studio, so every block arrives
with real-looking content instead of lorem ipsum.

## Why we built it

At [Pirate & Fox](https://pirateandfox.com) we build sites for small businesses: restaurants,
studios, practices, trades, nonprofits, bands. Most of them want the same two things:

- **To change their own site without calling us.** The WordPress block editor got that right:
  click a section, type, drag it somewhere else. People already know how it works.
- **A site that just keeps working.** No database, plugin updates, hacked admin page or slow
  hosting bill. A static site does that: plain files on a CDN, fast and close to free.

PageStack gives a static Astro site a block editor, and this starter gives PageStack a site
worth editing:

- 31 blocks, in 48 ready-made variations;
- three themes;
- journal and events from Markdown;
- forms that really send.

We tested the block list by planning ten real kinds of business against it (a restaurant, a
dentist, a yoga studio, a plumber, a law firm, a wedding photographer, a nonprofit, a software
product, a band and a hotel) and added whatever was missing.

It's also built to work with [Claude Code](https://claude.com/claude-code). Everything is plain
files, and [`CLAUDE.md`](CLAUDE.md) holds the recipes: brand it, build it, add a block. Two of the
ten businesses were built start to finish from those instructions alone, and the problems they
found are fixed here.

## Start

Click **Use this template** on GitHub, or clone it:

```sh
git clone https://github.com/pirateandfox/pagestack-starter my-site
cd my-site
npm install
npm run dev:editor     # the site plus the editor: http://localhost:4321/edit
```

`npm run dev` runs the site without the editor. In development the editor saves straight into
`src/`, so commit what you want to keep. Needs Node 22.23 or later.

## How to use it

Five steps, in this order. Each one can be done in the editor or handed to Claude ("do the brand
pass in CLAUDE.md for …").

### 1. Brand it

Pick a look first, so every page you build after it already looks right.

- **Quick:** in the editor, open **Site settings → Theme**. Choose Plain, Editorial or Soft, then
  set your accent colour, a font pairing, corners, button shape and spacing.
- **Your own theme:** copy the closest file in `public/themes/` to `public/themes/yourbrand.css`.
  Change its colours, fonts and corners (about twenty variables), then add it to
  `src/data/themes.ts`. The blocks use nothing else, so every one follows.
- **Check it:**
  - open **`/blocks`**, which shows every section in your theme with a switcher at the top;
  - look at it at phone width too;
  - run `npm run check:contrast` to catch hard-to-read colours.

### 2. Do your header and footer

**Site settings → Site details** holds:

- the business name, tagline, menu links and the header button;
- the announcement bar (blank turns it off);
- the address, phone, email and footer links (blank ones are left out);
- what the Journal and Events pages are called, e.g. "News" or "What's on".

Replace `public/favicon.svg` with your mark.

### 3. Move our sections to a hidden page for reference

```sh
npm run start-fresh
```

This clears Meridian off your site without throwing it away:

- the sample home page becomes a hidden draft (**Reference: sample home page**);
- the sample articles and events become drafts;
- the announcement bar is cleared;
- a one-line placeholder takes over the home page.

There is also **Reference: every section**, a hidden page with all 48 sections filled in. Drafts
show in the editor's page list but are never published, so you can open them, copy what you need
and delete them when you're done.

### 4. Build your site

In the editor:

- **Add page** offers templates: Blank, Service page, Contact page.
- **Add section** offers the whole library, grouped (Openers, Explain, Offer, Proof, People,
  Feeds, Act). Every section arrives filled in; type over it.
- Click any text on the page to edit it in place. Images, links and options are in the sidebar.
- Write journal articles and events under **Journal** and **Events**. The feed sections show the
  latest on any page.

**With Claude:** give it your brief and say "do the build pass in CLAUDE.md". It writes the page
files with your real wording and lists every placeholder it had to leave (prices, hours, photos)
for you to check.

### 5. Connect the forms and go live

Deploy to Cloudflare Pages (see **Deploy**), then:

- add the form settings (see **Forms**) so messages reach your inbox or CRM;
- optionally set up the nightly rebuild, so past events drop off on their own.

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
src/content/pages/reference.json   hidden draft: every section, for reference
src/editor/              /blocks, editor previews, the dev-only form route
scripts/check-contrast.ts  npm run check:contrast
scripts/start-fresh.ts   npm run start-fresh
CLAUDE.md                how Claude should brand, build and extend the site
```

## License

MIT. See [LICENSE](LICENSE). Use it for your own sites and your clients'.
