# AGENTS.md - PersonalWebsite

Justin's personal site (justinlui.dev). It is about who Justin is, not a portfolio: the people he loves, what he's into, and a few things he's built. He's a developer at heart, so the site should feel built with care, but it must never read as a resume.

## Tech stack

React 19 + Vite, single page, no router. Tailwind is installed but the active design uses plain CSS (`src/designs/spec-sheet.css`). Hosting is Cloudflare Pages, project `justinlui-site`, connected to this GitHub repo: pushing `main` builds `npm run build` and publishes `dist`. Live at justinlui.dev and www.justinlui.dev; justinlui-site.pages.dev is the project subdomain. Inspect it with `bunx cf pages projects get justinlui-site` (run `cf auth login` first). Do not rename the project back to `justinlui`: a deployment stays reachable at `<hash>.<project>.pages.dev` for as long as a project of that name exists, and the old name is abandoned so that some earlier deployments stay unreachable.

```bash
npm start       # dev server (localhost:5173)
npm run build   # production build
```

## The design: warm spec sheet

The concept is **a lovingly-written product page where the product is Justin**, borrowed from specialty coffee-gear brands (Fellow-style spec cards). It came out of a design interview with him; the answers that shaped it, and that future changes should stay true to:

- He's a self-described **"overaller"**, a generalist. The spec-card treatment is the point: the same card holds a project, an espresso setup, his dog, and his mom, so no section feels like the odd one out.
- **Warm, not minimal-sterile, not deadpan.** He tried a stricter oat/Inter version (commit `d5030e6`) and asked for warmer and less minimal; that produced the current latte palette, Fraunces, and tinted cards. The mono labels carry the "spec" framing; the sentences under them stay openly sincere.
- **A few live details, not an interactive toy.** The SF clock and the status readout are the interactivity budget. Micro-interactions stay quiet: underlines draw in, cards lift 1px. Nothing bouncy.
- **Photos stay minimal**: the one hero photo, treated like a product shot with a mono caption.

### Active design

`src/designs/SpecSheet.jsx` + `spec-sheet.css`, rendered by default. The previous postcard design (`PostcardWall.jsx`) is legacy, kept reachable at `/?design=postcard` via the toggle in `src/App.jsx` until Justin retires it; when it goes, also drop Quicksand and Inter from the font link in `index.html`.

### Palette

All colors are CSS variables at the top of `spec-sheet.css`; change them there, nowhere else.

- `--ss-bg: #f3e8d8` latte background, deliberately dimmer than white so the site doesn't blind a dark-mode visitor at night. There is no dark mode; this one palette is the compromise. Keep `theme-color` in `index.html` in sync with it.
- `--ss-ink` espresso brown (never pure black), `--ss-accent` copper, `--ss-tint`/`--ss-tint-deep` card fills one and two steps deeper than the page. The deep tint is reserved for the girlfriend card, the one deliberate highlight.
- Hairline rules (`--ss-line`, `--ss-line-strong`) do the structural work. No drop shadows, no rotations.

### Type

Three faces, three jobs. Don't let them swap roles:

- **Fraunces** (soft serif): display only. The h1, section headings, and the people-card statements. This is where the warmth lives.
- **DM Sans**: body and UI text. Chosen over Inter because Inter read too tech-bro to Justin; anything softer (Quicksand) reads juvenile.
- **IBM Plex Mono**: the `spec-sheet__label` class only. Uppercase, letter-spaced, small. This single class is the entire "technical" voice of the site: section numbers, field names (`CURRENTLY IN`), figure captions, card tags (`EST. 2017`), project tags.

### Live details

- `SFClock` in the masthead ticks in `America/Los_Angeles`.
- The **status readout** (`status` in `src/content.js`) is the "what's true right now" panel: watching / brewing / cooking, whatever fits. **Bump `status.updated` whenever an entry changes**; a stale date under a "live" readout defeats the panel.

## Voice

- Warm, first-person, conversational. Humor is gentle and sincere, never ironic; the deadpan lives in the mono labels, not the sentences.
- **Specific over generic.** "Episode 1070 is my favourite" and "Breville Bambino Plus with a Baratza Encore" are the register; "I like anime and coffee" is not. Real names, real gear, real numbers.
- Projects speak through stories with people in them ("helped my friends get into classes"), never metrics or resume verbs ("leveraging", "optimized", "driving results").
- Personal details (relationships, quirks, the dog) are first-class content, not filler.

## Editing content

All content lives as named exports in `src/content.js` (`status`, `now`, `people`, `projects`); `SpecSheet.jsx` imports them and maps over them, so routine edits never touch markup.

- **New project**: add to `projects` with `number`, `title`, `href`, `tag` (short mono stamp, sentence-cased by CSS), `kicker` (one-line hook), `story` (a short paragraph with a person or reason in it).
- **New person**: add to `people` with `name`, `tag`, `heading` (one warm declarative sentence, rendered in Fraunces), `body`.
- **New section**: follow the existing pattern — `spec-sheet__section-head` with the next two-digit number in a `spec-sheet__label` plus a Fraunces h2 — and renumber nothing (numbers are ordinal, append only).
- **New photo**: strip EXIF before committing. The build copies `public/` into the deploy verbatim, so a straight-from-iPhone photo publishes its GPS coordinates at meter precision. Drop the APP1 and APP13 JPEG segments and keep APP0/APP2, which removes the metadata without recompressing the image or losing the color profile. If something private does ship, fixing it in git is not enough: every past Pages deployment keeps serving its own copy at a permanent `<hash>.justinlui.pages.dev` URL, so the old deployments have to be deleted as well.

## What to avoid

- Resume anything: timelines, "tools I use" stacks, metrics-first project blurbs.
- Pure black, pure white, drop shadows, rotated/scrapbook elements, bouncy animation.
- More fonts, or existing fonts outside their roles above.
- More widgets. Two live details is the budget; a third needs a reason as strong as the first two.
