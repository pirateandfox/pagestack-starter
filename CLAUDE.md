# Working on a PageStack starter site

This is an Astro site with a PageStack editor. The public site is static. Pages are JSON in the
repo, articles and events are Markdown, and the look is one theme file of CSS variables. The site
owner edits it in the browser at `/edit`; you work on the same files.

There are three jobs, each with its own recipe below:

1. **Brand pass**: make it look like the business.
2. **Build pass**: make the pages, with the business's real words.
3. **New block**: only when nothing in the library will do.

## Never

- **Never send a real form submission.** Forms only send on the live site (`functions/api/form.ts`).
  In dev and the editor they print to the terminal and are marked NOT SENT. Don't set
  `RESEND_API_KEY` or webhook variables locally to "test" them.
- **Never put a colour, font or pixel size in a block's options or in page JSON.** Blocks offer
  named choices (background `default / muted / accent / inverse`, spacing
  `normal / compact / roomy / none`), and themes decide what those look like.
- **Never edit `node_modules`**, including `@pirateandfox/pagestack`. If PageStack itself needs
  changing, say so.
- **Never deploy, push or publish** unless you're asked to.
- **Never use lorem ipsum.** If the business hasn't given you the words, write plausible ones in
  their voice and list them as "needs checking" in your report.
- **Never invent facts a customer would rely on**, such as prices, opening hours, registration
  numbers, awards, reviews or quotes. Use clear placeholders: `$00`, `(555) 000-0000`, `0:00`,
  `[Customer name]`, `[Publication]`. List every one in your report. If the brief explicitly says
  you may invent something (sample prices, say), do it, and list those too.

## Commands

| | |
|---|---|
| `npm run dev` | The site at http://localhost:4321 (pick another port with `npm run dev -- --port 4400`), with `/blocks`: every block, one after another, with a theme switcher. |
| `npm run dev:editor` | The same, with the editor at `/edit` (storage: the working tree). |
| `npm run check:contrast` | Checks every theme, and the Theme settings, for hard-to-read colour pairs. Add `--strict` to fail on one. |
| `npm run build` | The public site in `dist/`. `/blocks` and the dev form endpoint aren't in it. |

Forms ignore a submission sent less than three seconds after the page loaded, which is a spam
check. When you test a form by script, wait a few seconds first, and only ever post to your own
dev server.

After adding `src/content.config.ts` or changing a date or schema in `src/lib/schemas.ts`, delete
`.astro/data-store.json` and restart the dev server.

## Where things are

| Path | What it is |
|---|---|
| `public/themes/<name>.css` | A theme: CSS variables only. |
| `src/data/themes.ts` | The list of themes, and the font pairings Theme settings can swap in. |
| `src/data/theme.json` | Theme settings: the chosen theme, plus accent, fonts, corners, buttons and spacing. Edited at `/edit/global/theme`. |
| `src/data/site.json` | Name, tagline, announcement bar, menu, header button, address, phone, email, footer links, and the titles and intros of the Journal and Events pages. Edited at `/edit/global/site`. A blank address, phone or email leaves it out of the footer. |
| `src/content/pages/*.json` | One page each. `index.json` is `/`, and `about.json` is `/about/`. |
| `src/content/articles/*.md` | Journal articles, listed at `/journal/`. |
| `src/content/events/*.md` | Events, listed at `/events/`. Each has an "Add to calendar" file. |
| `src/sections/schema.ts` | Every block's fields. **Read this before writing page JSON.** |
| `src/sections/index.ts` | Presets (the "Add section" library and `/blocks`), page templates, globals, collections. |
| `src/sections/*.astro` | One component per block. `components.ts` maps types to components. |
| `src/styles/base.css` | Layout, type, buttons, header and footer. It reads theme variables and names no colours. |
| `src/styles/blocks.css` | Every block's styles, the same way. |
| `src/scripts/site.ts` | The little interaction there is: tabs, slideshow, lightbox, pricing switch, forms. |
| `public/images/` | Images. The starter ships SVG placeholders. |

---

## 1. Brand pass

**Input:** the business's name and what it does, plus whatever brand material exists (logo,
colours, fonts, photos, a site to look at). With nothing to go on, choose a direction yourself and
say what you chose.

**Steps:**

1. **Pick the closest theme as a base.**
   - `plain`: neutral sans, near-black accent, soft corners.
   - `editorial`: serif headings, warm paper, square corners, oxblood accent.
   - `soft`: rounded, warm, sage accent, pill buttons.
2. **Write the new theme.** Copy the base to `public/themes/<brand>.css` and change the variables.
   Every theme sets the same list, documented at the top of `src/styles/base.css`:
   - colours: `--color-bg`, `--color-surface`, `--color-ink`, `--color-muted`, `--color-line`,
     `--color-accent`, `--color-accent-ink`, `--color-inverse-bg`, `--color-inverse-ink`;
   - type: `--font-display`, `--font-body`, `--weight-display`, `--tracking-display`,
     `--leading-display`, `--case-display`;
   - corners: `--radius`, `--radius-button`.
3. **Set the fonts.** Load them with one `@import` of a Google Fonts URL at the top of the theme.
   Use one pairing at most, and two weights each where you can.
4. **Keep the colours restrained.** Use one accent plus neutrals. `--color-surface` is a quiet
   step off the background, not a second brand colour. `--color-inverse-bg` is usually the ink
   colour.
5. **Register the theme and select it.** Add it to `themes` in `src/data/themes.ts`, then set
   `"theme"` in `src/data/theme.json`. Leave the other Theme settings blank: those are for the
   owner to adjust later.
6. **Fill in the site details.** Set the name, tagline, menu, header button, address, phone,
   email and footer links in `src/data/site.json`. Turn the announcement off (`""`) unless
   there's something to announce.
7. **Change the favicon.** Replace `public/favicon.svg` with a simple mark in the brand colours.
8. **Run `npm run check:contrast`.** Fix every line it reports; don't just turn the numbers off.
9. **Check every block in the new theme.** Open `/blocks?theme=<brand>` at desktop width and at
   375px. Look for:
   - text that's hard to read;
   - buttons on accent and inverse sections;
   - headings that wrap badly in the display font;
   - anything wider than the screen.

   If a block looks wrong, fix it with a variable in the theme first. Change `blocks.css` only
   when the problem is in the block itself, and then the fix must work in every theme: check
   `plain`, `editorial` and `soft` as well.

**Done when:**
- the contrast check is clean;
- `/blocks` looks right in the new theme at both widths;
- the three original themes still look right.

## 2. Build pass

**Input:** what the business needs from its site (a brief, an old site, a conversation).

**Steps:**

1. **Plan the pages before writing any.** For each page, list its sections using block names from
   `/blocks`. Most small sites need:
   - Home;
   - About;
   - one page per main service or offer, or one Services page;
   - Contact.

   Add Journal and Events only if the business will keep them up. Use the blocks people expect:

   | For | Use |
   |---|---|
   | Dishes | `menu` |
   | Weekly classes | `timetable` |
   | Dated events | `events` |
   | Plans | `pricing` |
   | Rooms or products | `products` |
   | Practice areas | `cards` |
   | Results | `case-study` |
   | Staff | `team` (and a `profile` per person if each needs a page) |
   | How it works | `features` with style `numbered` (the "Steps" preset) |
   | Product screenshot | `hero` with layout `stacked` |
   | Press quotes | `testimonials` with no photos |
   | Opening hours without a map | `map` with map set to `none` |

2. **Write each page as `src/content/pages/<slug>.json`:**
   ```json
   {
     "title": "About",
     "description": "One sentence for search results.",
     "sections": [
       { "id": "about-head", "type": "page-header", "settings": { "title": "About us", "intro": "<p>…</p>" } },
       { "id": "about-team", "type": "team", "settings": { "title": "The team", "background": "muted" }, "blocks": [
         { "id": "about-p1", "type": "person", "settings": { "name": "…", "role": "…", "image": { "src": "/images/person-1.svg", "alt": "…" } } }
       ] }
     ]
   }
   ```
   - Field names and options come from `src/sections/schema.ts`. A section's `blocks` may only
     hold the types its schema lists.
   - Leave out any setting that should keep its default.
   - **Items need their fields written out** (plans, dishes, people, cards). Their parent draws
     them without filling in defaults.
   - Ids are any short string, unique within the page.
   - Rich-text fields hold simple HTML: `<p>`, `<a>`, `<strong>`, `<em>`, `<ul>`.
   - Headings may use `<em>` and `<strong>`.
3. **Make the rhythm work.** Vary the backgrounds (`default`, then `muted`, then `default`), and
   use at most one `accent` or `inverse` section per page, usually the closing call to action.
4. **Link pages together.** Header links and the header button go in `site.json`. Use anchors
   (`"anchor": "contact"` on a section, then link to `/#contact`) for one-page sites.
5. **Images.**
   - If the owner gave photos, put them in `public/images/` (resized to 2000px wide at most) and
     write alt text that says what the picture shows.
   - Otherwise use the placeholders, write the alt text for the photo that belongs there, and
     list every place that needs a real one.
   - Leave the starter's own images in `public/images/`: the presets and `/blocks` use them.
6. **Embeds.** Use a real link from the brief, or leave `url` blank: a blank embed shows nothing on
   the site and a placeholder in the editor. Never paste a made-up link; it shows someone else's
   page or an error.
7. **Articles and events.** Write them as Markdown with front matter that matches
   `src/lib/schemas.ts` (see the samples). Dates are local: `2027-03-14`, or
   `2027-03-14T19:30` for events.
8. **Remove the starter's sample business.** Replace every Meridian article and event, the
   Journal and Events titles and intros in `site.json`, and the wording of `thanks.json`. Then
   search for leftovers: `grep -ri "meridian\|studio\|harbour" src` (some hits in presets are
   fine; nothing on a real page should mention them).
   - **If the site has no journal or no events**, take it out of `site.json`'s menu and leave one
     article or event in the folder with `draft: true`. That keeps the build quiet, and the list
     page stays unlinked and empty. To remove it completely, delete `src/pages/<journal|events>/`,
     its entry in `src/content.config.ts` and in `collections` in `src/sections/index.ts`, and the
     feed presets that point to it.
9. **Check the build.** Run `npm run build`; it must finish with no errors. Then look at every
   page at desktop width and at 375px.

**Report back with:**
- the pages made;
- the theme;
- every placeholder or invented fact that needs checking;
- every gap where no block fitted and what you did about it.

## 3. New block

Add a block only when no block or preset can do the job, even with a different background or
layout option. Often the right fix is a new **option** or **preset** on an existing block.

**Steps:**

1. **Add the schema** in `src/sections/schema.ts`:
   - a `label`, a one-line `description`, a `category` and some `keywords`;
   - the title field first, written with `heading()`;
   - named `select` options for anything visual;
   - `...section()` for background, spacing and anchor.

   For repeated items:
   - list their types in `blocks`;
   - define each item with `item()` (hidden from the inserter);
   - pick the field the List View shows (the item's first inline text field).
2. **Write the component** as `src/sections/<Name>.astro`, copying the pattern of a similar
   block (`Services.astro` is a short one):
   - wrap it in `<Sec node={node} edit={edit} class="…">`, which gives the background, spacing,
     anchor and editor markers, and use `<SecHead s={s} edit={edit} />` for a standard title,
     eyebrow and intro;
   - for each item, set `const ie = child(edit, i)`, then put `{...nodeAttrs(ie, it)}` on its
     element and `{...fieldAttrs(ie, 'name', 'text' | 'richtext' | 'image')}` on each field the
     owner can click to edit;
   - render headings and rich text with `set:html`;
   - in the editor (`edit` set), show every state at once (all tabs, all slides) and make links
     do nothing.
3. **Register it** in `src/sections/components.ts`.
4. **Style it** in `src/styles/blocks.css`, under its own comment heading:
   - use only theme variables;
   - make it work at 375px;
   - keep keyboard focus visible.
5. **Add interaction only if it's needed.** Put it in `src/scripts/site.ts` as a delegated
   handler on `document`, so it survives the editor redrawing the page. The page must still make
   sense without JavaScript.
6. **Add at least one preset** in `src/sections/index.ts`, filled with real-sounding content, in
   the right place in the order.
7. **Check it:**
   - in all three themes and the brand theme at `/blocks?theme=…`;
   - at 375px;
   - in the editor (`npm run dev:editor`): add it, edit each field, reorder its items, undo;
   - with `npm run build`.

## Writing for the site

- Use the business's voice: short sentences and plain words.
- Headings say something specific ("Fixed fees, agreed at the start"), not just name a topic
  ("Our pricing").
- Buttons say what happens ("Book a table", "Get a quote"). Avoid "Learn more" and "Submit".
- Write prices, dates and times the way locals write them.
