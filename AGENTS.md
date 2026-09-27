# AGENTS.md - PersonalWebsite

Justin's personal site (justinlui.dev). It is about who Justin is, not a portfolio: the people he loves, what he's into, and a few things he's built. He's a developer at heart, so the site should feel built with care, but it must never read as a resume.

## Tech stack

React 19 + Vite, single page, no router. Styling is plain CSS: the design's own stylesheets (`src/designs/panes/panes.css`, and `scenes/scenes.css` beside it) on top of the reset in `src/index.css`. Hosting is Cloudflare Pages, project `justinlui-site`, connected to this GitHub repo: pushing `main` builds `npm run build` and publishes `dist`. Live at justinlui.dev and www.justinlui.dev; justinlui-site.pages.dev is the project subdomain. Inspect it with `bunx cf pages projects get justinlui-site` (run `cf auth login` first). Keep the project name `justinlui-site`; the reason is in `docs/design-process.md` under "Shipping to main".

**Every pushed branch is public.** Cloudflare builds it as a preview at `<branch>.justinlui-site.pages.dev`. Branch new work from `main`. On a machine that has them, never push the local branch `redesign-options` or the tags `glass-prototype` and `spec-sheet-evolved-prototype`: their history is not for publishing. Read "Shipping to main" before you push anything.

```bash
npm start       # dev server (localhost:5173)
npm run build   # production build
```

## The design: panes

The site is **one calm, keyboard-friendly tool window**: one section is open at a time, the others wait as cards, and his sprite walks along the bottom to whatever the visitor selects. He asked for "fun. yet a calm design", "calm yet fun and interactive", with interactions that are "really subtle things that feel very crafted". From the design interview:

- He's a self-described **"overaller"**, a generalist, so no section is the odd one out: a project, his dog and his mom get the same treatment.
- **Warm, not sterile.** He tried a stricter, more minimal version of the old site and asked for warmer. The window looks like a tool, and the sentences in it stay openly sincere.
- **Photos stay minimal**: the one photo, in pane 1.

Justin's words for the parts. Use them in code, docs and messages, and invent no others:

- **Pane**: the main area at the upper left that shows one section. "Pane 3" is the agents section open there.
- **Pathway**: the strip along the bottom where his sprite walks ("because it's like me walking along it").
- **Step**: one station on the pathway, one per section. "Step 1" is where he holds the shoeboxes and "step 2" is where he pets Truffle.
- **Card**: a section's box in the right column, with its title, card line and invite ("the card on the right").
- **Select a step**: navigate to it by any means (a key, a click, the search), so that its section shows in the pane and his sprite walks to it.

### Where things live

- In `src/designs/panes/`, `index.jsx` + `panes.css` are the page, `stage.js` moves him, Truffle, the ball and luibot along the pathway, and `scenes/` is what happens inside the open panes (read `scenes/README.md` first). A change to `stage.js` is a change to every scene, so it gets the tour in `docs/design-process.md` ("Shipping to main"). The sprite sheets are in `src/sprites/`.
- The routes and overrides (`/#agents`, `?hour=0..23`, `/?design=sprites`) are in `docs/design-process.md` under "Checking a design by hand".

### Palette

All colours are CSS variables at the top of `panes.css`; change them there and nowhere else. Two are written out a second time and must stay equal: `theme-color` in `index.html` is `--pn-bar` (`#2b251e`), and the `html, body` background in `panes.css` is `--pn-ground` (`#28221b`).

- **One palette, a dark warm ground, no light mode.** His words for the ground: "like a medium-light roast espresso" and "i want to stray away from dark + orange". It is clearly brown, never near-black.

### Live details

- `SFClock` in the title bar ticks in `America/Los_Angeles`.
- The **status sign** at the top of pane 5 shows `lately.status` (learning / building / saving up for). **Bump `lately.updated` whenever a line changes**; a stale date under a "live" readout defeats it.

## Design principles

Most of these come from something Justin said or rejected, and `docs/design-review.md` has his words in full. "(reviewers')" marks a reviewer finding he has not contradicted. "Open:" marks a question he has not settled; do not decide it for him. "The coordinator" in these docs is the main agent session that ran the `panes` redesign.

- **Calm and fun live in different places.** Calm is the layout, the type and the rest state: one place for the eye to start, an obvious next place, and nothing in the layout moves until the visitor acts (small sprite loops are fine). Fun is the sprites and small crafted interactions, and he wants more of it: "i'd even like the sprites to be interacting/playful even more".
- **"Noisy" means too much information at one rank, mostly not motion.** He called two designs where nothing moved "a little too noisy" because "we're just throwing everything at them at the same time". Noise is many blocks at one rank, several lines shown up front, a label on everything, or chrome that competes with him.
- **Two reading levels, and a greased reading order.** Make the order we intend the most natural path for the eye (he calls this greasing): "for skimmable information, the users eyes will naturally gravitate to it. and for details, the users will have to intentionally look at it." The skim level is who he is, what he does for work, and one plain sentence per section, large and in a clear order, so a visitor who only skims still gets his personality. The detail level is everything else: smaller and quieter, or behind an expand that opens in place and visibly shows that it opens.
- **A section's card and its open section complement each other.** The card gives "a really brief summary of what the pane's contents are", in words that are "fun and creative", so a visitor can go in or skip it, and the pane says the thing itself. They share facts but not wording, because both show on one screen. Up front, and nothing else: the card's title, card line and invite, and the pane's `#` title, hook and `###`s. Paragraphs, lists and cards are detail. What each piece says is under Voice.
- **Two heading levels, like `#` and `###` in Markdown.** The `#` title, then a `###` over each block of details "that summarizes the details that follow it", so a skimmer who reads the `#`, the hook and the `###`s knows what each block holds. How a `###` is worded is in `docs/writing-a-pane.md` ("How a `###` is worded"). Each rank sits visibly one step below the last, by size, weight and colour: "maybe it's smaller and the color is a little more faded ... and the font is different". Sizes follow importance (reviewers'): project names set larger than the section heads read as a portfolio.
- **Use the space, and never by stretching.** "i did not mean to like stretch things out because now there's just like gaps i meant more to like fill it in with visuals". Fill a blank area with real things: a sprite scene, a prop, the photo, a sub-heading, grouping, a larger size, a wider measure, or more of his own content (`docs/writing-a-pane.md` has the interview for a bare pane). Content flows from the top in one rhythm. Small and medium gaps are fine, and so is room left at the end: "we don't actually have to use the full thing". He rejects a medium-to-big blank band between two blocks, so never use `justify-content: space-between`, a `flex: 1` spacer, `margin-top: auto` or a block pinned to the bottom. The pane's gaps are the `--pn-gap-*` tokens in `panes.css`, which grow with the pane up to a cap and never make a fitting pane scroll. Change a gap there; past the caps, a larger size or more content is his call. Measure the largest gap between two blocks and report it.
- **Shape the layout to the container.** A tall area wants stacked blocks and a wide area can take columns: "there's too much space here because the three sections are side by side".
- **Structure a section from what its content is, not from the layout it had.** Ask what the items are and which relationships between them are real. Use only the categories, ranks and order he gave, and one grammar inside one block. "What I'm up to" was rejected as a list beside cards ("the list + cards don't compliment each other") and again as three place categories we made up ("anchored way too much on the original design"). A routine becomes a list in the order it happens (`docs/writing-a-pane.md`).
- **A rule line must do a job, and so must every label, control and state**: "if there's no like really good or strong design reason or purpose ... we should just keep all of them expanded and not have the choice" (a card that collapsed when selected). A control says what it does in plain words, with a visual cue, to a visitor who is not a developer. A rule line's jobs so far (reviewers'): mark a section, carry a sprite's feet, separate table rows. When a design grows out of an older one, justify every rule again: "multiple horizontal line separators that don't need to be there, but i think you carried them over from the previous design".
- **Consistency is a value he names**: "lets keep consistency" (one lowercase title among capitalised ones), "make the spacing more consistent", "it should remain consistent" (an arm longer in one pose than in another). One grammar, one rhythm, one capitalisation, one arm length.
- **No sprite pose twice on a page**: "you have the sprite of me lying down, which is also the same as me lying down at the bottom". No fact twice on a screen either (reviewers').
- **Two font families, split by reading level, and no third**, not even for an arrow or a key glyph: draw those. "one for headers, buttons, invitations on the cards, basically all things a user should see when they skim. then another font for the details." The skim family is JetBrains Mono (`--pn-font-head`) and the detail family is Instrument Sans (`--pn-font-body`). Head-family text gets its size only from the role tokens at the top of `panes.css` (`--pn-h1`, `--pn-lead`, `--pn-h3`, `--pn-label`, ...). He rejected a tall, condensed, high-contrast display serif outright: "i really don't like that style of font".
- **Colour.** Amber is for focus and attention and blue is for links. Meaning carried by colour uses blue against yellow or orange, never red against green, and is backed by a label or a shape: the two robots are blue against orange, and focus, links and live dots also get a shape or a label. Small text clears 4.5:1 on every surface it sits on (reviewers').

## Sprites

Pixel sprites of Justin in his straw hat, Truffle, the robots luibot and luibuilder, and a few props live in `src/sprites/`. They are where the fun lives: "i just like the playfulness of the sprites. the rest is a bit noisy." When a design uses them:

- **A sprite in almost every section, doing something that belongs to that section**: "i'd like my sprite to be in almost all the sections, doing something unique to each section". Characters interacting beats a solo loop.
- **A sprite is refined over several rounds, never shipped from its first draft.** "this detail about refining the sprites into something that's smooth and subtle yet shows that there's a lot of thought put into them, that's really key to the design principles of this website." At least two rounds: draw it, look at it on the page at true size, then add the small details that tie it to its animation and its place (the feed that shrinks as the hen eats; Truffle pawing his leg, a "very key trait" of hers).
- **A touch is a touch.** The hand overlaps the thing it acts on, and the thing reacts on that contact frame: "my hands are not actually on the chair"; "it kind of looks like he's just waving his hand and then the toggle gets flipped". Both times the art was fine, so diagnose staging, then timing, then art, on the real page, before anyone redraws (`src/sprites/README.md`, Part 2).
- **Every change of place is a visible move, and nothing appears or vanishes from nowhere.** His sprite walks the whole way at one pace, Truffle wakes and walks over, and the robots beam, because "the agents floating around is a bit noisy": "anything larger than a small shift in position should be a teleportation". One beam-out and one beam-in per move is our rule, not his. Open: on leaving pane 3 the robots vanish with the pane and beam in on the pathway, though he asked for "going up into the pane and going down back down". A prop drawn inside an action's art (the boxes in `carry`) vanishes when another pose plays, so check a new pose against every state where he holds or sits in something.
- **Quiet and crafted.** Single calm gestures, loops that run only while on screen, one busy loop per screenful. Vary where a scene starts: "i always walk in left to right. like maybe i can just start in in the middle". A sprite that has come to a place stays there until the visitor gives it a reason to move: "too much moving around".
- **A sprite stands on a line the layout already has, at a whole-number scale, in a box reserved for its largest pose, and never over text** (the last is the coordinator's default, not his words).
- **Ask before adding a person to the cast.** He asked for sprites of "just me and truffle" and added the robots later.
- Read `src/sprites/README.md` before you draw or change a sheet, and before you place a sprite beside another sprite, a prop or a rule. It holds the art rules with the rejection behind each, and the staging rules: the ink outline vanishes on a dark page (`--sprite-outline`), and a one-shot is stepped by the design and always ends in a pose.

## Voice

- Warm, first-person, conversational. Humor in sentences is gentle and sincere; the deadpan lives in small labels (field names, tags), never in headings or paragraphs.
- **Specific over generic**: real names, real gear, real numbers ("Episode 1070 is my favourite", not "I like anime and coffee").
- Projects speak through stories with people in them ("helped my friends get into classes"), never metrics or resume verbs ("leveraging", "optimized").
- Personal details (relationships, quirks, the dog) are first-class content, not filler.
- **Each piece of text a skimmer sees has one job**, in this order of rank:
  - **Title**: what the section is, in plain words ("when i am skimming it, i don't need to think about what it means").
  - **Card line** (`trailer`, on the card in the right column): a fun, specific sentence in his voice that makes a stranger want to open the pane, mostly one "I" sentence with a verb ("I have two OpenClaw agents running around."). A list of nouns introduces nothing; pane 2's list of his people is the exception.
  - **Invite**: the few words on the way in; it can name what is inside ("Meet luibot and luibuilder").
  - **Hook** (the first line of the open pane): a short, natural opener that leaves the telling to the blocks ("Meet my AI agents."): "this kind of wording feels more natural and doesnt repeat so much of the content of the pane". One short sentence, or two. A hook ending in "…" is finished by each heading under it.
  - **`###`**: see "How a `###` is worded" in `docs/writing-a-pane.md`.
- **Super simple language, for a reader who has never heard of the thing**: "we should prefer to use like super, super simple language because i speak like that." Say what a thing does instead of naming its tool ("I track my budget and have spending reports made for me automatically", not "my budget sorts itself into a Google Sheet"), use no work jargon, and explain a name only when the point needs it. The reader should not have to think.
- **Simple, complete sentences**, even at the cost of a few words ("a tiny bit more verbosity in exchange for more fluid language"), joined by "but" or "so" where they belong together.
- **Plain first, then the fun one.** A plain word that leaves the reader asking "what?" gets one or two more words ("Practice what?").
- **Never claim more than he said.** Every sentence traces to his words or to `src/content.js`; add no feeling, habit, cause, number or link between two facts. Where his words are unclear, write what does not assert the unclear part, and ask him for a real fact to fill a gap. Show him every new sentence word for word, guesses marked, before it counts as done.
- **Read each line for who it leaves out**: "These are the people I love, and my dog Truffle." implied he does not love Truffle; it became "These are the people I love the most."
- Truffle is "She", and his girlfriend has no name on the site. Keep money details light (the coordinator's rule, which he read without objecting): what luibot does, with no amounts and no account or institution names.

## Editing content

All content lives as named exports in `src/content.js`, and the comment above each export gives its shape and its quirks; `panes` maps over them, so routine edits never touch markup. Reshape an export only after Justin has accepted the layout, and tell whoever builds the design before you commit the new shape, so its reader changes in the same commit. Read `docs/writing-a-pane.md` before you write, rework or add to a pane: it holds which pane a new fact belongs in, the order of work, a checklist and worked examples.

- **New section**: ask him where it goes in the order, then change all of these together, because the design assumes six: its `sections.<key>` in `src/content.js`; in `src/designs/panes/index.jsx`, an entry in `PANES` (id, step word, search keywords), its body in the `detail` object, its station and residents in `stretches()`, the number-key test (`/^[1-6]$/`) and the title bar's "1–6 jump" hint; the card column in `panes.css`, which is built so all six cards are always whole; the cards in `design-system/`; and every "pane N" or "step N" in the docs after its place, because the numbers follow the order.
- **New photo**: strip its EXIF before you commit it; the steps are in `docs/design-process.md` under "Shipping to main".

## How design work goes well here

Justin hands over taste ("use ur taste") and then rejects hard, looking at true size and zoomed in. He answers by looking: a pick between things he can see on the real page, or an exact sentence shown to him, gets an answer, and a question inside a status message does not. Ask him for facts only he knows and for picks, never for what the design should be, and give every other question a default that ships. He judges taste and reviewers check defects, because our rankings did not predict his picks (`docs/design-process.md`, "Showing him work").

- **Progress is what he can see on the page.** Wire each item into the page as soon as it exists, one item at a time, with a commit per item. After hours of art and reviews with nothing wired in, he had to ask: "am i missing something? like give me a status update and tell me what i'm missing".
- **One example means the whole class**: "using the space more creatively goes for all designs". Fix every instance of the same defect, tell him which class you assumed, and do not widen to new features. When his message opens with a general complaint and then names a detail, the opening is the scope. It holds for our own bugs too: one contact was placed from the wrong rows of the sheet, nobody swept the other contacts, and the same mistake reached him at the next one.
- **Nobody passes their own work**: not the builder, and not whoever wrote its brief. Finished work goes to fresh reviewers (`docs/design-review.md`), and motion is judged from ordered frames with logged positions, never from stills.
- Read `docs/design-process.md` before you brief a worker, show Justin options, check a design by hand, or push anything. It holds how to pass on his words (his instruction names an intent, not a layout), the restart after two failed patches, the routes and overrides, the widths (his own window is about 1440x1000, and his spacing asks all came from it), the ways into a scene, the browser traps, the shipping steps, and what nobody has verified yet.

## What to avoid

- Resume anything: timelines, "tools I use" stacks, skills grids, metrics-first project blurbs.
- Pure black, pure white, rotated or scrapbook elements, bouncy animation, a third font family, drop shadows (the search palette, which floats over the window, has the only one).
- More widgets. The clock and the status sign are the budget for instruments and readouts, and a third needs a reason as strong as theirs. Sprite scenes do not count: he asked for more of those.
