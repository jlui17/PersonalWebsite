# justinlui.dev design system

This is the design system for Justin Lui's personal site. It captures the site's chosen design, the warm spec sheet, so that anything generated with it looks like his site and not like a template. Everything in it comes from the site's own code (`src/designs/spec-sheet-evolved/evo.css`) and its design notes; nothing here is invented.

## The concept

A lovingly-written product page where the product is Justin. The look is borrowed from specialty coffee-gear spec cards: one column, hairline rules, small uppercase mono labels, and openly sincere sentences under them. The same card treatment holds a project, an espresso setup, his dog, and his mom, so no part of his life reads as the odd one out.

Warm, not minimal-sterile, not deadpan. The mono labels carry the "spec" framing; the sentences stay warm and first-person. It is about who Justin is, never a portfolio or a resume.

## Who Justin is

Justin Lui (pronounced loo-wee) is an engineer at Scorecard in San Francisco, originally from Vancouver, a self-described generalist who nerds out over niche details: Steph Curry's footwork, dialing in espresso, One Piece, Valorant.
The site is about the people he loves (his mom, his dad, his sister Andrea, his girlfriend, his French Bulldog Truffle), what he is into right now, and a few things he has built.

## Files

- `tokens.css`: every token as a CSS custom property on `:root`, plus the base classes (`evo__page`, `evo__label`, `evo__display`, `evo__body`, `evo__prose-link`, `evo__rule`, `evo__sprite`). Variable names match the site's code (`--ss-*`).
- `previews/`: the foundation cards: colours, type, spacing and rules, motion.
- `components/`: one card per component, with the site's real copy.
- `sprites/`: the pixel sprites as static SVGs, one file per character, action and frame.
- `pages/`: full-page compositions.

Every preview links `../tokens.css` and the Google Fonts stylesheet for the three faces; there are no other external assets.

## Palette

One palette, no dark mode. The latte background is deliberately dimmer than white so a dark-mode visitor at night is not blinded; that single palette is the compromise. Change colours in `tokens.css` and nowhere else.

| Token | Value | Job |
| --- | --- | --- |
| `--ss-bg` | `#f3e8d8` | The page. Also the speech bubble fill. Keep `theme-color` in sync with it. |
| `--ss-ink` | `#33291f` | Espresso text: headings, values, links, the masthead name. Never pure black. |
| `--ss-muted` | `#6f6357` | Secondary text: labels, body copy under a heading, the clock. |
| `--ss-accent` | `#a5642f` | Copper. Section numbers, the word STATUS, project tags, link hover. A label colour, never a body colour. |
| `--ss-line` | `rgba(51, 41, 31, 0.18)` | Hairline: row dividers, card borders, inner grid lines. |
| `--ss-line-strong` | `rgba(51, 41, 31, 0.45)` | Strong hairline: masthead, section heads, the photo frame, the status box, the footer. Sprites stand on these. |
| `--ss-tint` | `#ecdec7` | Card fill, one step deeper than the page. |
| `--ss-tint-deep` | `#e7d5b8` | Two steps deeper. Reserved for the girlfriend card, the one deliberate highlight. |
| `--ss-glow` | `rgba(196, 132, 72, 0.14)` | A faint warm radial at the page's top-left corner, layered over `--ss-bg`. |
| `--ss-sprite-ink` | `#1e1711` | Outline ink of every pixel sprite. Not for text. |

Justin is red-green colourblind. Meaning is never carried by colour alone; when it is carried by colour at all, use blue against yellow or orange, never red against green, and back it with a label or a shape. The site itself puts no meaning on colour: copper marks a label as structural, and that is all.

## Type

Three faces, three jobs. Do not let them swap roles, and do not add a fourth.

- **Fraunces** (soft serif, `--ss-serif`): display only. The h1 (`Hi, I'm Lui.`), section headings, and the people-card statements. This is where the warmth lives. Weights 480 (h1), 520 (h2), 500 (h3).
- **DM Sans** (`--ss-sans`): body and UI text, including project titles and the masthead name. Chosen over Inter, which read too tech-bro; anything softer reads juvenile. Weights 400 body, 550 for links, kickers and fact values, 600 for status values, 620 for project titles, 650 for the masthead name.
- **IBM Plex Mono** (`--ss-mono`): the `evo__label` class only. 0.68rem, weight 500, letter-spacing 0.14em, uppercase, muted. This one class is the entire technical voice of the site: section numbers (`01`), field names (`CURRENTLY IN`), figure captions (`FIG. 01 — THE THREE OF US`), card tags (`EST. 2017`), project numbers (`NO. 01`) and tags (`MADE FOR US`). The nav links and the clock are the same face at 0.72rem with 0.08em tracking. The robots' bubble is the label without the uppercasing, because their names are lowercase.

The type scale is in `tokens.css` as `--ss-text-*`; the preview `previews/type.html` shows every step with real copy. Body copy is 1rem at 1.75 leading on a 34rem measure; the copy under a heading is muted, the heading itself is ink.

## Spacing and rules

One column, `min(100% - 2.5rem, 880px)`, centred; the gutter narrows to 1.5rem under 720px, which is also where every grid drops to one column. The page has 3rem top and bottom; each numbered section opens 4.5rem below the last, and its content starts 2.25rem under the section head's rule.

Hairline rules do the structural work: 1px, in `--ss-line` for rows and card borders and `--ss-line-strong` where a section closes. Cards are tint-filled with a 6px radius (`--ss-radius`), which softens the box without reading as a pill. No drop shadows, no rotations, no pure white.

## Components

Each has a card in `components/`, built with the same class names as the site.

- **Masthead** (`masthead.html`): the name, "pronounced loo-wee" in mono, the mono nav (GitHub, LinkedIn), and the SF clock with muted seconds, closed by a strong rule. Justin stands at the rule's right end; his pose follows the SF hour (espresso in the morning, standing through the day, sitting in the evening, asleep at night), and hovering the name tips his hat. Use once, at the top.
- **Hero** (`hero.html`): the Fraunces h1 and the muted intro on the left; on the right the one photo treated like a product shot, with a strong hairline frame, a mono caption (`fig. 01 — the three of us`) and the fact rows (`CURRENTLY IN / San Francisco`). Photos stay minimal: this is the only one.
- **Status readout** (`status-readout.html`): the "what's true right now" panel. A strong-lined tint box, STATUS in copper, the updated date, three equal columns (watching, brewing, cooking). luibot stands on the head's rule. Bump the date whenever an entry changes; a stale date under a live readout defeats the panel.
- **Section head** (`section-head.html`): a two-digit ordinal in copper mono and a Fraunces h2 over a strong rule. Numbers are ordinal and append-only: a new section takes the next number, nothing is renumbered.
- **Now list and aside** (`now-list.html`): numbered rows on soft rules, and a tinted aside for one random thing.
- **People card** (`people-card.html`): the spec card. Name and tag in mono, one warm Fraunces statement, a muted line of body. Two per row. The girlfriend card spans both columns and takes the deep tint, the only highlight on the page. Truffle's card gives up its bottom padding so she can sleep on its bottom rule, captioned `fig. 02 — asleep, as usual`, with a tennis ball she ignored.
- **Project** (`project.html`): `no. 01` in mono, a DM Sans title that links out, a copper tag, a one-line kicker and a short story with a person in it. Soft rule between projects. No metrics, no resume verbs.
- **Footer** (`footer.html`): two mono labels under a strong rule. Justin and Truffle sit on the rule at the left, luibuilder stands at the right.
- **Links** (`links.html`): one idea in three sizes. A prose link is always underlined 1px and warms to copper on hover; a nav link and a project title draw their underline in from the left (1px and 2px) and turn copper.
- **Speech bubble** (`bubble.html`): while the pointer is on a robot it waves and says `Hi, I'm luibot` in a hairline box on page colour, anchored to its right edge so it grows leftward. Absolute, so nothing shifts; it fades in over 120ms.

## Interaction budget

Quiet. Underlines draw in (200ms and 220ms), cards lift one pixel and their border steps up to the strong line (180ms), the bubble fades in (120ms). Nothing bounces, nothing moves until it is touched, and everything respects `prefers-reduced-motion`. The SF clock and the status readout are the two live details, and that is the whole budget: a third needs a reason as strong as the first two. The site is a page with a few live details, not an interactive toy.

## Pixel sprites

Five characters, drawn as pixel art and rendered at exactly 1 CSS px per sprite px with crisp edges (`shape-rendering="crispEdges"`, `image-rendering: pixelated`). Every outline is `--ss-sprite-ink`, `#1e1711`. The hairline rules are the ground they stand on: each figure is positioned with its bottom pixel row on a rule, so it reads as a mark on the sheet rather than a mascot floating over it.

- `justin-overshirt-*` and `justin-hoodie-*`: Justin in his two outfits (overshirt in the morning and day, hoodie in the evening and at night). Actions: `idle`, `walk`, `sip`, `hat`, `arms-up` (36 by 62 px), `sit` (52 by 52), `sleep` (64 by 28).
- `truffle-*`: the dog. `sleep` and `ear` (36 by 20), `sit` (24 by 24), `walk` and `trot` (34 by 26).
- `luibot-*`: the robot on the status readout. `idle` and `wave` (28 by 32).
- `luibuilder-*`: the robot at the footer. `idle` and `wave` (30 by 34).

The files are static SVGs in `sprites/`, named `<character>-<action>-<frame>.svg`, for example `sprites/justin-overshirt-idle-0.svg`. Place one with an `img` at its own pixel width and height inside an `evo__sprite`. A sprite that reacts to the pointer says so with the cursor and nothing else: no tooltip, no motion until it is touched.

## Voice

- Warm, first-person, conversational. Humour is gentle and sincere, never ironic. The deadpan lives in the mono labels, not the sentences.
- Specific over generic. "Episode 1070 is my favourite" and "Breville Bambino Plus with a Baratza Encore" are the register; "I like anime and coffee" is not. Real names, real gear, real numbers.
- Projects speak through stories with people in them ("helped my friends get into classes"), never metrics or resume verbs.
- Personal details (relationships, quirks, the dog) are first-class content, not filler.
- Labels are short and factual: a field name, a figure number, a tag, a date.
- Use the site's real copy from `src/content.js`. Never lorem ipsum, never an invented fact about Justin.

## What to avoid

- Resume anything: timelines, "tools I use" stacks, metrics-first project blurbs.
- Pure black, pure white, drop shadows, rotated or scrapbook elements, bouncy animation.
- More fonts, or the existing fonts outside their roles.
- More widgets. Two live details is the budget.
- A dark mode. The one latte palette is the deliberate compromise.
- Meaning on colour alone, or red against green.
- The deep tint anywhere but the girlfriend card.
