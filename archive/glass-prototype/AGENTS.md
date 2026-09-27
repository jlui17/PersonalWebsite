# AGENTS.md - PersonalWebsite

Justin's personal site (justinlui.dev). It is about who Justin is, not a portfolio: the people he loves, what he's into, and a few things he's built. He's a developer at heart, so the site should feel built with care, but it must never read as a resume.

## Tech stack

React 19 + Vite, single page, no router. Styling is plain CSS: the active design's own stylesheet (`src/designs/spec-sheet.css`) on top of the reset and base typography in `src/index.css`. Hosting is Cloudflare Pages, project `justinlui-site`, connected to this GitHub repo: pushing `main` builds `npm run build` and publishes `dist`. Live at justinlui.dev and www.justinlui.dev; justinlui-site.pages.dev is the project subdomain. Inspect it with `bunx cf pages projects get justinlui-site` (run `cf auth login` first). Do not rename the project back to `justinlui`: a deployment stays reachable at `<hash>.<project>.pages.dev` for as long as a project of that name exists, and the old name is abandoned so that some earlier deployments stay unreachable.

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

### Redesign in progress (note dated 2026-09-26)

This section describes the design that is live on `main`. The branch `redesign-options` holds three prototypes, `spec-sheet-evolved`, `panes` and `glass`, each in `src/designs/<name>/` and reachable at `/?design=<name>`. Justin has not chosen one, and they will change, so they are not described here. "Design principles", "Sprites" and "Voice" below hold for whichever design wins; where they disagree with this section, they are newer and they win. Until he chooses, ask him which designs a new section goes into.

When he chooses, clean up in the same change: delete the other prototype directories, remove the prototype routing (the `import.meta.glob` block) from `src/App.jsx` and render the winner by default, retire `SpecSheet.jsx` if the winner replaces it, bring `design-system/` in line with the winner, rewrite this section for it, and delete this note.

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
- The **status readout** (the labelled entries of `upTo` in `src/content.js`) is the "what's true right now" panel: watching / brewing / cooking, whatever fits. **Bump `upTo.updated` whenever an entry changes**; a stale date under a "live" readout defeats the panel.

## Design principles

These hold for every design of this site. Most come from something Justin said or rejected during the redesign, and `docs/design-review.md` quotes him in full. The ones marked "(reviewers')" are reviewer findings he has not contradicted. "The coordinator" in these docs is the main agent session that ran the 2026-09 redesign.

- **Calm and fun live in different places.** Calm is the layout, the type and the rest state: one place for the eye to start, an obvious next place, and nothing in the layout moves or shifts until the visitor acts; small sprite loops are fine. Fun is the sprites and small crafted interactions, and he wants more of it: "i'd even like the sprites to be interacting/playful even more".
- **"Noisy" means too much information at one rank, mostly not motion.** Two prototypes where nothing moved were reviewed as calm, and he called them "a little too noisy" because "we're just throwing everything at them at the same time". Noise is many blocks at one rank, several lines shown up front, a mono label on everything, or chrome that competes with him.
- **Two reading levels.** The skim level is who he is, what he does for work, and one plain sentence per section, large and in a clear order, so a visitor who only skims still gets his personality. The detail level is everything else: smaller and quieter, or behind an expand that opens in place and visibly shows that it opens. Open: whether a long scrolling page hides its details or only quiets them.
- **Up front: the title, the one sentence (`hook`), one quieter line (`more`) and the few words on the way in (`invite`), and nothing else.** The one sentence can be two short ones, as in his own intro hook. Each rank sits visibly one step below the last, by size, colour and if it helps the face: "maybe it's smaller and the color is a little more faded ... and the font is different". Paragraphs, lists and cards belong to the detail level.
- **Heading sizes follow importance (reviewers').** Project names set larger than the section heads made the projects the loudest thing after the h1, which is how a portfolio reads.
- **Use the space, and never by stretching.** "i did not mean to like stretch things out because now there's just like gaps i meant more to like fill it in with visuals". Fill a blank area with real things: a sprite scene, a prop, the photo, a sub-heading, grouping, a larger size or a wider measure. Content flows from the top with an even rhythm. Small and medium gaps are fine, and so is unused space at the end: "we don't actually have to use the full thing". A medium-to-big blank band between two blocks is what he rejects, so never reach the end of a container with `justify-content: space-between`, a `flex: 1` spacer, `margin-top: auto` or a block pinned to the bottom. Measure the largest gap between two blocks and report it. Reviewers treated about 60px as safe and 100px and up as a band he will see; those numbers are theirs, not his.
- **Shape the layout to the container.** A tall area wants stacked blocks and a wide area can take columns: "there's too much space here because the three sections are side by side".
- **Structure a section from what its content is, not from the layout it had.** Ask what the items are and which relationships between them are real. Use only the categories, ranks and order he gave, and one grammar inside one block. "What I'm up to" was rejected as a list beside cards ("the list + cards don't compliment each other") and again as three place categories we made up ("anchored way too much on the original design").
- **A rule line must do a job.** The jobs so far (reviewers'): mark a section, carry a sprite's feet, separate table rows. Hairlines still do the structural work; the limit is on how many. When a design grows out of an older one, justify every rule again: "multiple horizontal line separators that don't need to be there, but i think you carried them over from the previous design".
- **No sprite pose twice on a page**: "you have the sprite of me lying down, which is also the same as me lying down at the bottom". No fact twice on a screen either (reviewers').
- **Every design keeps the three type roles** under "Type": a display face, a sans, and a mono for labels only. A new design also resets, inside its own root class, the colour and size that `src/index.css` puts on `p, li, a, button`; twice a heading came out in the old site's ink.
- **Colour.** Meaning carried by colour uses blue against yellow or orange, never red against green, and is backed by a label or a shape. Here that means the two robots are told apart as blue against orange, and focus, links and live dots also get a shape or a label. Small text clears 4.5:1 on every surface it sits on (reviewers').

## Sprites

Pixel sprites of Justin in his straw hat, Truffle, the robots luibot and luibuilder, and a few props live in `src/sprites/`. They are where the fun lives: "i just like the playfulness of the sprites. the rest is a bit noisy." When a design uses them:

- **A sprite in almost every section, doing something that belongs to that section**: "i'd like my sprite to be in almost all the sections, doing something unique to each section". A scene is part of the composition and one of the ways to fill space. Characters interacting beats a solo loop: petting Truffle, greeting the robots, "brew coffee from my coffee stand and then pickup the coffee and drink it".
- **Quiet and crafted.** Single calm gestures, loops that run only while on screen, one busy loop per screenful. Keep walks short and vary where a scene starts: "i always walk in left to right. like maybe i can just start in in the middle". A sprite that has come to a place stays there until the visitor gives it a reason to move: "too much moving around".
- **A sprite stands on a line the layout already has, at a whole-number scale, in a box reserved for its largest pose, and never over text.** "Never over text" is the coordinator's default, not Justin's words.
- **Ask before adding a person to the cast.** He asked for sprites of "just me and truffle" and added the robots later.
- Read `src/sprites/README.md` before you draw or change a sheet, and before you place a sprite beside another sprite, a prop or a rule. It holds the art rules with the rejection behind each, and the staging rules. Two of those cost every prototype a round: on a dark page the ink outline vanishes (`--sprite-outline`), and a one-shot action such as taking a cup is stepped by the design, never left to a loop.

## Voice

- Warm, first-person, conversational. Humor is gentle and sincere, never ironic; the deadpan lives in the mono labels, not the sentences.
- **Specific over generic.** "Episode 1070 is my favourite" and "Breville Bambino Plus with a Baratza Encore" are the register; "I like anime and coffee" is not. Real names, real gear, real numbers.
- Projects speak through stories with people in them ("helped my friends get into classes"), never metrics or resume verbs ("leveraging", "optimized", "driving results").
- Personal details (relationships, quirks, the dog) are first-class content, not filler.
- **A title says what the section is, in plain words.** "My future plans" replaced "Someday": "when i am skimming it, i don't need to think about what it means."
- **A hook introduces the thing to a stranger.** Name it, say he has it, say what it does, then add a few words that invite the reader in. "luibot runs my errands. luibuilder builds my ideas." was rejected because "the reader has to work hard to infer that oh i have agents"; "I have two OpenClaw agents running around." replaced it. A list of nouns does not introduce anything, so write a subject and a verb.
- **Super simple language**: "we should prefer to use like super, super simple language because i speak like that."
- **Never claim more than he said.** Every sentence traces to his words or to `src/content.js`. Add no feeling, habit, cause, number or link between two facts: "a report I actually read" claimed a habit he never mentioned and went back to "a report at the end". When his dictation is unclear, write the wording that does not assert the unclear part. When a removed fact leaves a gap, ask him for a real one. Show him every new sentence word for word, with guesses marked as guesses, before it counts as done.
- **Read each line for who it leaves out.** "These are the people I love, and my dog Truffle." got: "i also love truffle, this kind of implies i dont love truffle". It became "These are the people I love the most." Setting one name apart says something about that name.
- Check `src/content.js` before writing about anyone. Truffle is "She", and his girlfriend has no name on the site.
- Keep money details light: say what luibot does, with no amounts and no account or institution names. This is the coordinator's rule; Justin read the copy and did not object.

## Editing content

All content lives as named exports in `src/content.js` (`intro`, `facts`, `upTo`, `people`, `agents`, `home`, `someday`, `projects`, `sections`); the designs import them and map over them, so routine edits never touch markup. Keep a layout experiment in the component: reshape `src/content.js` only after Justin has accepted the layout.

- **Intro and facts**: `intro` is the hello paragraphs (each an array of strings and `{ text, href }` link parts); `facts` is the label/value rows under the hero photo; `randomThing` is the one-line footnote under them.
- **What I'm up to**: `upTo` is `{ updated, entries }`, one flat list. An entry is `{ value }`, or `{ label, value, detail }` for the live ones (watching / brewing / cooking). **Bump `upTo.updated` whenever an entry changes**; a stale date under a live readout defeats it. `now` (the plain values, in list order) and `status` (the live entries with the date) are flat views derived from it. The evolved design puts the live entries on its rail in its own fixed order and the rest under it in list order, so the list's order is what the visitor reads.
- **Titles and skim lines**: `sections` holds, per section, a plain-words `title`, a one-sentence `hook` (the skim line under the heading), a quieter `more` line and an `invite` (the few words on the way in to the details). The wording rules are under Voice.
- **Agents, home, someday**: `agents` (luibot and luibuilder: `name`, `tag`, `heading`, `body`, `does` list), `home` (the desk, the shoes, the coffee corner) and `someday` (New York, Japan, the farm) share the people-card shape (`tag`, `heading`, `body`).

- **New project**: add to `projects` with `number`, `title`, `href`, `tag` (short mono stamp, sentence-cased by CSS), `kicker` (one-line hook), `story` (a short paragraph with a person or reason in it).
- **New person**: add to `people` with `name`, `tag`, `heading` (one warm declarative sentence, rendered in Fraunces), `body`.
- **New section**: follow the existing pattern — `spec-sheet__section-head` with the next two-digit number in a `spec-sheet__label` plus a Fraunces h2 — and renumber nothing (numbers are ordinal, append only).
- **New photo**: strip EXIF before committing. The build copies `public/` into the deploy verbatim, so a straight-from-iPhone photo publishes its GPS coordinates at meter precision. Drop the APP1 and APP13 JPEG segments and keep APP0/APP2, which removes the metadata without recompressing the image or losing the color profile. If something private does ship, fixing it in git is not enough: every past Pages deployment keeps serving its own copy at a permanent `<hash>.justinlui.pages.dev` URL, so the old deployments have to be deleted as well.

## How design work goes well here

Justin hands over taste ("use ur taste") and then rejects hard, looking at true size and zoomed in. Ask him for facts only he knows and for picks between things he can see, never for what the design should be.

- **His instruction names an intent, not a layout.** Quote him to the builder and write "I read that as ..." under the quote. Show him a mock of any mechanism you add before anyone builds it. His "use the space" was built as stretching and his "one sentence" as clever taglines, each exactly as briefed, and he rejected both.
- **One example means the whole class**: "using the space more creatively goes for all designs". Fix every instance of the same defect in every design, tell him which class you assumed, and do not widen to new features. When his message opens with a general complaint and then names a detail, the opening is the scope.
- **After two failed patches of the same section, pose or face, restart from the content.** A fresh agent with no tie to the current version writes down what the content is and why each version failed, then mocks several far-apart structures with the real strings at 1280 and 375. Show him the mocks before anyone builds. Two is our limit, not a number of his.
- **Nobody passes their own work**: not the builder, and not whoever wrote its brief. Finished work goes to fresh reviewers; `docs/design-review.md` holds the protocol and the context to hand them.
- Read `docs/design-process.md` before you brief a worker, show Justin options, or check a design by hand. It holds the routes and overrides (`/?design=<name>`, `&hour=`, `1070`), the widths, the browser traps, and what nobody has verified yet.

## What to avoid

- Resume anything: timelines, "tools I use" stacks, skills grids, metrics-first project blurbs.
- Pure black, pure white, drop shadows, rotated/scrapbook elements, bouncy animation.
- More fonts, or existing fonts outside their roles above.
- More widgets. The clock and the status readout are the budget for instruments and readouts, and a third needs a reason as strong as the first two. Sprite scenes do not count: he asked for more of those. Open: whether the budget of two survives the redesign.
