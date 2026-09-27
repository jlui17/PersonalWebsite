# justinlui.dev design system

This is the design system for Justin Lui's personal site, in its `panes` design. Anything made with it should look like his site and not like a template. Everything here is read from the site's code (`src/designs/panes/`, `src/sprites/`, `src/content.js`). Nothing is invented.

`AGENTS.md` at the root of the repo holds the rest, and it wins where the two disagree: the design principles, the voice, the sprite rules, what to avoid, and Justin's words for the parts (pane, pathway, step, select a step, card). Read it first. This file holds only what a generator needs on top of it.

## The concept

The site is one calm tool window. A **pane** at the upper left shows one section. A column of **cards** on the right lists all six sections, each with a plain title and one line. The **pathway** runs along the bottom: his pixel sprite walks along it between **steps**, one step per section. Selecting a step, by a key, a click or the search, opens its section in the pane and sends him walking to it. A title bar on top holds his name, the search and a live clock in San Francisco time.

Calm is the layout, the type and the rest state: nothing in the layout moves until the visitor acts. Fun is the sprites. The site is about who Justin is, never a portfolio or a resume.

Justin is a founding engineer at Scorecard in San Francisco, originally from Vancouver. The six sections are hello, his people (his mom, his dad, his sister Andrea, his girlfriend, and Truffle, his French Bulldog), his two AI agents luibot and luibuilder, his future plans, what he is up to, and things he has built. Every fact about him comes from `src/content.js`, and the previews here carry the real strings. Never use lorem ipsum, and never invent a fact about him.

## Files

- `tokens.css`: every token as a CSS custom property, with the site's names (`--pn-*`, `--sprite-outline`). It mirrors `src/designs/panes/panes.css`, which is the source.
- `components.css`: the rules of the parts, copied from `panes.css` and `scenes/scenes.css` with the site's class names (`pn__*`, `pn-*`). A page needs both files.
- `previews/`: the foundation cards: `colors.html`, `type.html`, `spacing.html`.
- `components/`: one card per part, built from the site's class names and real strings.
- `pages/home.html`: the whole window with step 1 selected. `pages/assets/` holds the one photo. It has no EXIF data, so do not replace it with another file.
- `sprites/`: the pixel sprites as static SVGs, with their own `README.md` and an `index.html` that lists them all.
- `check.mjs` and `sprites/export.mjs`: the two scripts under "Keeping it in line with the site".

Every page links `../tokens.css`, `../components.css` and the Google Fonts stylesheet for the two families. There are no other outside assets.

## Palette

One dark palette, and no light mode. The ground is a dark roast coffee brown, never black. The surfaces and hairlines are that brown mixed towards cream (`#fbf4e6`): bar 1.4%, surface 3.3%, raised 7%, line 10.8%, strong line 17.8%.

| Token | Value | Job |
| --- | --- | --- |
| `--pn-ground` | `#28221b` | The window behind everything. |
| `--pn-bar` | `#2b251e` | The title bar, the pathway and the step bar. |
| `--pn-surface` | `#2f2922` | The pane, the cards, the search button. |
| `--pn-raised` | `#373129` | The search box, the photo's mat, a robot's speech bubble. |
| `--pn-line` | `#3f3931` | Hairlines: card borders, the rule between a pane's parts. |
| `--pn-line-strong` | `#4e473f` | The rules sprites stand on, button borders, the bar beside a list line. |
| `--pn-ink` | `#ece5d8` | Titles, hooks, headings, values. |
| `--pn-ink-2` | `#c3b9a9` | Names on cards, a project's one-line summary. |
| `--pn-muted` | `#afa494` | Paragraphs, list lines, labels. |
| `--pn-dim` | `#9d9080` | The quietest text: a card's invite, step numbers. 4.6:1 on the surface, so no text goes below it. |
| `--pn-faint` | `#746e64` | Decoration only: hollow dots, an unlit switch. Never text. |
| `--pn-amber` | `#e8ab55` | Focus and attention: the open pane's border, the selected card and step, lit dots, the focus ring. |
| `--pn-amber-dim` | `rgba(232, 171, 85, 0.12)` | The one tinted card (his girlfriend's) and the selected row of the search box. |
| `--pn-blue` | `#93c2ee` | Links, always with an underline or a drawn arrow. |
| `--sprite-outline` | `#463d33` | The outer outline of every pixel sprite on this ground. Not for anything else. |
| `--pn-photo-dim` | `0.87` | The photo's brightness, so nothing in it outshines the heading's ink. |

**The colour rule.** Meaning carried by colour uses blue against yellow or orange, never red against green, and it is always backed by a label or a shape. Here that means: the two robots are told apart as blue against orange and by name, the selected step has a bar under it, a selected or lit dot is filled where the others are hollow, a link is underlined or has an arrow, and the status sign says "on" or "off". Small text clears 4.5:1 on every surface it sits on.

## Type

Two families, split by reading level, and no third: not even for an arrow or a key glyph, which are drawn as small SVGs. The ranks step down by size, weight and colour.

**JetBrains Mono** (`--pn-font-head`, weights 400 and 500) is everything a visitor sees when they skim: titles, hooks, headings, labels, buttons, the cards, the step bar, the clock. Each role is a whole `font` token with a tracking token beside it.

| Role token | Font | Tracking | Used for |
| --- | --- | --- | --- |
| `--pn-h1` | 500 34px/1.1 (30px on a phone) | -0.04em | The first pane's title. Used once. |
| `--pn-lead` | 400 19px/1.4 (17.5px under 900px), 46ch | -0.02em | The open pane's hook. |
| `--pn-h3-large` | 500 16.5px/1.35, 48ch | -0.015em | The headings of the future plans. |
| `--pn-h3` | 500 15px/1.4 | -0.015em | A pane's "###" over a block of details, and card headings. |
| `--pn-ui-large` | 500 14.5px/1.3 | -0.01em | Project and agent names, the search box's input. |
| `--pn-fold-hook` | 500 14px/1.3 | -0.01em | The one line on a card. |
| `--pn-ui` | 500 13px/1.3 | -0.01em | Names on cards, his name in the title bar, search rows, the status sign's values. |
| `--pn-label`, `--pn-sign` | 500 11.5px/1 (10.5px in a phone's step bar) | 0 | All small chrome: tags, captions, buttons, hints, the clock, the step bar, the words on the drawn sign boards. |

**Instrument Sans** (`--pn-font-body`, weight 400) is the details: the sentences under a heading. The window's base is 15px/1.6. Paragraphs are 14px in `--pn-muted` on a 62ch measure. The quieter line under a hook is 14px on 60ch. A project's one-line summary is 14.5px in `--pn-ink-2`. List lines and project stories are 13.5px.

## Spacing

The window is a grid of four rows: the title bar (`--pn-title-h`, 40px), the workspace, the pathway (`--pn-pathway-h`, 68px: the tallest pose is 62px) and the step bar (`--pn-bar-h`, 30px). The window never scrolls as a whole. The pane's body scrolls, and its last lines fade when there is more below. The workspace has 10px of padding and a 10px gap. The cards take `--pn-stack-w` (424px, at most half the width) and sit 4px apart with `--pn-fold-pad` inside. The pane takes the rest, and its body has 24px 26px of padding. Corners are `--pn-radius` (6px), and buttons inside take 4px. Every border and rule is 1px. Columns inside a pane are 32px apart.

Inside a pane, content flows from the top with one rhythm. Nothing is stretched, spread or pinned to the bottom, and room left at the end stays empty. The first number is the step in a 1280x800 window. In a taller pane all the steps grow together by one rule (`--pn-rise`), up to the second number, and no step between two things passes 48px.

| Token | Step | Between |
| --- | --- | --- |
| `--pn-gap-above-rule` | 26px to 42px | The end of a part and the hairline that opens the next. |
| `--pn-gap-below-rule` | 22px to 38px | That hairline and the part's first line. |
| `--pn-gap-hook` | 18px to 34px | The hook (or the quieter line under it) and the first part. |
| `--pn-gap-block` | 18px to 34px | Block and block, in every column. |
| `--pn-line-pad` | 5px to 7px | Over and under each line of a list. |
| `--pn-gap-heading` | 4px to 8px | A "###" and its text. |

These tokens live on `.pn__pane-body`, which is a size container, so the pane needs a height of its own. In the window it gets one from the grid. The component cards set one by hand.

## Components

Each part has a card in `components/`. Use the class names as they are.

- **Window** (`pages/home.html`): `.panes` is the root. It sets the ground, the ink and the base font, and lays out the four rows. `html` and `body` take the ground colour too, and `theme-color` is the bar's `#2b251e`.
- **Title bar** (`titlebar.html`): `.pn__titlebar` with `.pn__title-name` (his name and "pronounced loo-wee" as a `.pn__label`), the search button `.pn__palette-button` with its `.pn__kbd` key, and `.pn__title-right` with two `.pn__hint`s and the `.pn__clock`. The hints hide on touch screens and under 900px.
- **Card** (`card.html`): `.pn__stack` holds six `.pn__fold` buttons. Each has a `.pn__fold-head` (a `.pn__dot`, the number `.pn__pane-index`, the `.pn__fold-title` and the `.pn__fold-invite` with a `.pn__chevron`) and one `.pn__fold-hook` line. The selected card has `aria-current="true"`: amber border, filled dot, amber title, no invite.
- **Pane** (`pane.html`): `.pn__pane` with a `.pn__pane-head` (the `.pn__pane-title` button and the `.pn__expand` button) and a scrolling `.pn__pane-body`. The body opens with the hook `.pn__lead` and sometimes a quieter `.pn__more`. `data-more` on the body fades its last lines.
- **Blocks** (`pane.html`, `pages/home.html`): `.pn__block` is a `.pn__h3` over a paragraph. `.pn__blocks` stacks them in one column. `.pn__story` opens a new part under a hairline and sets them in two columns that keep their reading order. `.pn__link` is a link inside a sentence.
- **Lists** (`pane.html`): `.pn__does` is a `.pn__label` over a list whose lines each take a small bar, amber on the line with `aria-current="true"`. `.pn__week` with `.pn__week-days` sets one such list per day. `.pn__roadmap` is a to-do list whose lines start with a `.pn__roadmap-agent` name and a small square, blue for luibot and amber for luibuilder.
- **Agent** (`pane.html`): `.pn__agents` holds two `.pn__agent` columns. The `.pn__agent-head` has the name, a tag and the robot (`.pn-robot`), who stands on the head's rule and speaks in a `.pn-robot__bubble`.
- **People cards** (`people.html`): `.pn__people` holds `.pn__card`s, each a `.pn__card-name`, a heading and a paragraph. `.pn__card--tinted` with `.pn__people-wide` is his girlfriend's card, the one highlight. `.pn__card-live` is Truffle's live label.
- **Projects** (`projects.html`): `.pn__projects` holds `.pn__project`s. Each has a `.pn__project-head` with the blue `.pn__project-title` link, a drawn `.pn__arrow--out` and a tag, then a `.pn__project-kicker` and a `.pn__project-story`.
- **Status sign** (`status-sign.html`): `.pn-upto` holds the `.pn-upto__sign`: a status line with the date and the switch (`.pn-sign__switch`), then one `.pn-upto__line` per thing. `data-lit` lights it. It is the one live readout, so bump its date whenever a line changes.
- **Pathway and step bar** (`pathway.html`): `.pn__stage` is the strip, with one `.pn__stretch` per step, `.pn__prop` for the things that live there and `.pn__actor` for Justin, Truffle and the ball. luibot is on his own layer, `.pn__bot`. The site places all of these from script, and the static pages place them in CSS from each step's number. Under it, `.pn__statusbar` holds the `.pn__segment` buttons, and the selected one has `aria-current="true"`.
- **Search** (`search.html`): `.pn__palette` with its input, a list of `.pn__option` rows that each name their kind, and a foot with the keys. It is the one floating layer and the one shadow.
- **Hello** (`pages/home.html`): `.pn__hello-title` sets the `.pn__h1` with his sprite beside it (`.pn-hello`) on one rule. `.pn__hello-body` puts the blocks beside the `.pn__photo` and the quiet `.pn__hello-foot` lines.

Left out: the future plans pane, whose pictures sit inside its headings at offsets the site measures in script, luibuilder's spot among the projects, and the robots' beam. Their sprites are all in `sprites/`.

## Motion

Nothing in the layout moves until the visitor acts, and hover and selected states change at once, with no transition. What does move is small: a pane's body fades in over 220ms as it opens and rises 4px, the status sign's colours change over 200ms, and the photo brightens under a pointer. The sprites carry the rest, in single calm gestures. Everything is still under `prefers-reduced-motion`, and the page is still complete.

## Pixel sprites

The cast is Justin in his straw hat (two outfits), Truffle, the robots luibot and luibuilder, and the props of each step. They are drawn at one CSS px per sprite px, never scaled to fit and never smoothed. A sprite stands on a line the layout already has, in a box reserved for its largest pose, and never over text.

On this dark ground the sprites' ink (`#1e1711`) is nearly the colour of the page, so an ink outline would vanish and parts joined only by ink would float. The site paints the outer outline of every sprite in `--sprite-outline` (`#463d33`), a soft brown just lighter than the ground, and leaves interior lines, eyes and noses in ink. The SVGs in `sprites/` have that colour written into them, so they are for this ground only. Every fill of a prop reads at 3:1 or better against the ground, because nothing can rely on its outline here.

The files are named `<character>-<action>-<frame>.svg`, with `<character>-<action>.svg` as the animated version. `sprites/README.md` has the placing rules and `sprites/index.html` lists every action.

## Keeping it in line with the site

The site's code is the source, and this folder is a copy.

- `node design-system/check.mjs` compares `tokens.css` and `components.css` with `panes.css` and `scenes.css`, and fails with a list when a value has drifted. Run it after any change to those files.
- `node design-system/sprites/export.mjs` writes every SVG and `sprites/index.html` again from the sheets. Run it after a sheet changes. It removes the SVGs of sprites that no longer exist.
- The strings in the cards are copies of `src/content.js`. When a string changes there, change it in the cards too. The status sign's date is `lately.updated`.
