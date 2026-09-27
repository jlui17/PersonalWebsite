# AGENTS.md - PersonalWebsite

Justin's personal site (justinlui.dev). It is about who Justin is, not a portfolio: the people he loves, what he's into, and a few things he's built. He's a developer at heart, so the site should feel built with care, but it must never read as a resume.

## Tech stack

React 19 + Vite, single page, no router. Styling is plain CSS: the design's own stylesheets (`src/designs/panes/panes.css`, and `scenes/scenes.css` beside it) on top of the reset in `src/index.css`. Hosting is Cloudflare Pages, project `justinlui-site`, connected to this GitHub repo: pushing `main` builds `npm run build` and publishes `dist`. Live at justinlui.dev and www.justinlui.dev; justinlui-site.pages.dev is the project subdomain. Inspect it with `bunx cf pages projects get justinlui-site` (run `cf auth login` first). Do not rename the project back to `justinlui`: a deployment stays reachable at `<hash>.<project>.pages.dev` for as long as a project of that name exists, and the old name is abandoned so that some earlier deployments stay unreachable.

```bash
npm start       # dev server (localhost:5173)
npm run build   # production build
```

## The design: panes

The site is **one calm, keyboard-friendly tool window**: one section is open at a time, the others wait as cards, and his sprite walks along the bottom to whatever the visitor selects. He asked for "fun. yet a calm design", "calm yet fun and interactive", with interactions that are "really subtle things that feel very crafted". From the design interview, these still hold:

- He's a self-described **"overaller"**, a generalist, so no section is the odd one out: a project, his dog and his mom get the same treatment.
- **Warm, not sterile.** He tried a stricter, more minimal version of the old site and asked for warmer. The window looks like a tool, and the sentences in it stay openly sincere.
- **Photos stay minimal**: the one photo, in pane 1.

Two earlier prototypes were set aside: the old warm spec sheet with sprite scenes, and `glass` (Liquid Glass widgets; not to his taste for now).

Justin's words for the parts of the design. Use them in code, docs and messages, and do not invent others:

- **Pane**: the main area at the upper left that shows the details of one section. "Pane 3" is the agents section open there.
- **Pathway**: the strip along the bottom where his sprite walks ("because it's like me walking along it").
- **Step**: one station on the pathway, one per section. "Step 1" is where he holds the shoeboxes and "step 2" is where he pets Truffle.
- **Card**: a section's box in the right column, with its title, card line and invite ("the card on the right").
- **Select a step**: navigate to it by any means (a key, a click, the search), so that its section shows in the pane and his sprite walks to it.

### Where things live

- In `src/designs/panes/`, `index.jsx` + `panes.css` are the page, `stage.js` moves him, Truffle and the ball along the pathway, and `scenes/` is what happens inside the open panes (read `scenes/README.md` first). The sprite sheets are in `src/sprites/`.
- The routes are `/`, a hash per step (`/#agents`), `?hour=0..23` to pin the San Francisco hour, and `/?design=sprites`, the sprite viewer. More is in `docs/design-process.md` under "Checking a design by hand".

### Palette

All colours are CSS variables at the top of `panes.css`; change them there and nowhere else. Two are written out a second time and must stay equal: `theme-color` in `index.html` is `--pn-bar` (`#2b251e`), and the `html, body` background in `panes.css` is `--pn-ground` (`#28221b`).

- **One palette, a dark warm ground, no light mode.** His words for the ground: "like a medium-light roast espresso" and "i want to stray away from dark + orange". It is clearly brown, never near-black.
- Amber is for focus and attention and blue is for links. The rule for meaning carried by colour is "Colour" under "Design principles".

### Live details

- `SFClock` in the title bar ticks in `America/Los_Angeles`.
- The **status sign** at the top of pane 5 shows `lately.status` (learning / building / saving up for). **Bump `lately.updated` whenever a line changes**; a stale date under a "live" readout defeats it.

## Design principles

These hold for every design of this site. Most come from something Justin said or rejected during the redesign, and `docs/design-review.md` quotes him in full. The ones marked "(reviewers')" are reviewer findings he has not contradicted. "Open:" marks a question he has not settled; do not decide it for him. "The coordinator" in these docs is the main agent session that ran the 2026-09 redesign.

- **Calm and fun live in different places.** Calm is the layout, the type and the rest state: one place for the eye to start, an obvious next place, and nothing in the layout moves or shifts until the visitor acts; small sprite loops are fine. Fun is the sprites and small crafted interactions, and he wants more of it: "i'd even like the sprites to be interacting/playful even more".
- **"Noisy" means too much information at one rank, mostly not motion.** Two prototypes where nothing moved were reviewed as calm, and he called them "a little too noisy" because "we're just throwing everything at them at the same time". Noise is many blocks at one rank, several lines shown up front, a mono label on everything, or chrome that competes with him.
- **Grease the reading order.** Like a dating-show director who scripts nothing but makes the wanted moment the easiest one, make the order we intend the most natural path for the eye. Before arranging a pane, decide what it is about, what every visitor must take from it, and which rank each fact gets: "for skimmable information, the users eyes will naturally gravitate to it. and for details, the users will have to intentionally look at it."
- **Two reading levels.** The skim level is who he is, what he does for work, and one plain sentence per section, large and in a clear order, so a visitor who only skims still gets his personality. The detail level is everything else: smaller and quieter, or behind an expand that opens in place and visibly shows that it opens. Open: whether a long scrolling page hides its details or only quiets them.
- **A section's card and its open section complement each other.** The card gives "a really brief summary of what the pane's contents are", in words that are "fun and creative", so a visitor can choose to go in or to skip it. The open section says the thing itself. They may share facts but not their wording, because both show on one screen. Open: what makes a card an invitation.
- **Up front, and nothing else: on the card, the title, a trailer line and the invite; in the open section, the `#` title, the hook and the `###`s.** The job of each is under Voice ("Each piece of text a skimmer sees has one job"). A quieter `more` line under the hook is optional; pane 1 dropped it once its `###`s said the same. The hook can be two short sentences, as in his own intro hook. Each rank sits visibly one step below the last, by size, colour and if it helps the face: "maybe it's smaller and the color is a little more faded ... and the font is different". Paragraphs, lists and cards belong to the detail level.
- **Two heading levels, like `#` and `###` in Markdown.** The section's `#` title, then a `###` over each block of details "that summarizes the details that follow it". A skimmer reads the `#`, the hook and the `###`s and knows what each block holds. A `###` over a block of sentences is an "I" sentence and the fun version ("I automate things that don't need it"; a lead-in such as "Fun fact:" is fine), and the details under it explain in plain terms with a few fun words mixed in. Three exceptions: in a pane about other people the person is the subject ("She's my role model for hard work and perseverance."; he said no to "I" headings in "My people"); under a hook that ends in "…" each heading finishes the hook ("Live in Japan with my girlfriend."); and a `###` over a list is a plain title ("Future side quests"). No skim line repeats a `###`, and a block the hook already covers gets no `###` ("the main header already covers it"). The first sentence under a `###` says something new, not the `###` again. The ranks step down by size, weight and colour, never by a third face.
- **Heading sizes follow importance (reviewers').** Project names set larger than the section heads made the projects the loudest thing after the h1, which is how a portfolio reads.
- **Use the space, and never by stretching.** "i did not mean to like stretch things out because now there's just like gaps i meant more to like fill it in with visuals". Fill a blank area with real things: a sprite scene, a prop, the photo, a sub-heading, grouping, a larger size or a wider measure. Content flows from the top with an even rhythm. Small and medium gaps are fine, and so is unused space at the end: "we don't actually have to use the full thing". A medium-to-big blank band between two blocks is what he rejects, so never reach the end of a container with `justify-content: space-between`, a `flex: 1` spacer, `margin-top: auto` or a block pinned to the bottom. Measure the largest gap between two blocks and report it. Reviewers treated about 60px as safe and 100px and up as a band he will see; those numbers are theirs, not his. The open pane's gaps are tokens in `panes.css` (`--pn-gap-*`) that grow with the pane's height up to a cap, and a fit guard in `index.jsx` (`--pn-fit`) never lets that growth make a fitting pane scroll, so change a gap through its token.
- **Shape the layout to the container.** A tall area wants stacked blocks and a wide area can take columns: "there's too much space here because the three sections are side by side".
- **Structure a section from what its content is, not from the layout it had.** Ask what the items are and which relationships between them are real. Use only the categories, ranks and order he gave, and one grammar inside one block. "What I'm up to" was rejected as a list beside cards ("the list + cards don't compliment each other") and again as three place categories we made up ("anchored way too much on the original design"). A paragraph that describes a routine or a set of tasks becomes a list in the order they happen: "it's describing what i do. maybe a list?"
- **A rule line must do a job.** The jobs so far (reviewers'): mark a section, carry a sprite's feet, separate table rows. Hairlines still do the structural work; the limit is on how many. When a design grows out of an older one, justify every rule again: "multiple horizontal line separators that don't need to be there, but i think you carried them over from the previous design".
- **No sprite pose twice on a page**: "you have the sprite of me lying down, which is also the same as me lying down at the bottom". No fact twice on a screen either (reviewers').
- **Two font families, split by reading level.** "one for headers, buttons, invitations on the cards, basically all things a user should see when they skim. then another font for the details." The skim family is JetBrains Mono (`--pn-font-head`) and the detail family is Instrument Sans (`--pn-font-body`). Text in the head family gets its size only from the role tokens at the top of `panes.css` (`--pn-h1`, `--pn-lead`, `--pn-h3`, `--pn-label`, ...), so change a size there and never on a rule. He picked the head face by looking at four far-apart candidates on the real page, and he rejected a tall, condensed, high-contrast display serif outright ("i really don't like that style of font"), so show candidates before you argue for one. No third family, not even for an arrow or a key glyph: draw those.
- **Colour.** Meaning carried by colour uses blue against yellow or orange, never red against green, and is backed by a label or a shape. Here that means the two robots are told apart as blue against orange, and focus, links and live dots also get a shape or a label. Small text clears 4.5:1 on every surface it sits on (reviewers').

## Sprites

Pixel sprites of Justin in his straw hat, Truffle, the robots luibot and luibuilder, and a few props live in `src/sprites/`. They are where the fun lives: "i just like the playfulness of the sprites. the rest is a bit noisy." When a design uses them:

- **A sprite in almost every section, doing something that belongs to that section**: "i'd like my sprite to be in almost all the sections, doing something unique to each section". A scene is part of the composition and one of the ways to fill space. Characters interacting beats a solo loop: petting Truffle, greeting the robots, "brew coffee from my coffee stand and then pickup the coffee and drink it".
- **A sprite is refined over several rounds, never shipped from its first draft.** "this detail about refining the sprites into something that's smooth and subtle yet shows that there's a lot of thought put into them, that's really key to the design principles of this website." A new sprite or prop gets at least two rounds: draw it, look at it on the page at true size, then add a few small details that show thought and that tie the sprite to its animation and its place (the hand that lands on the chair back, the paw that brushes down his shin, the feed that shrinks as the hen eats). The sprites he calls good are good "because we've refined them a bunch of times".
- **Quiet and crafted.** Single calm gestures, loops that run only while on screen, one busy loop per screenful. Keep walks short and vary where a scene starts: "i always walk in left to right. like maybe i can just start in in the middle". A sprite that has come to a place stays there until the visitor gives it a reason to move: "too much moving around".
- **A sprite stands on a line the layout already has, at a whole-number scale, in a box reserved for its largest pose, and never over text.** "Never over text" is the coordinator's default, not Justin's words.
- **Ask before adding a person to the cast.** He asked for sprites of "just me and truffle" and added the robots later.
- Read `src/sprites/README.md` before you draw or change a sheet, and before you place a sprite beside another sprite, a prop or a rule. It holds the art rules with the rejection behind each, and the staging rules. Two of those cost every prototype a round: on a dark page the ink outline vanishes (`--sprite-outline`), and a one-shot action such as taking a cup is stepped by the design, never left to a loop.

## Voice

- Warm, first-person, conversational. Humor is gentle and sincere, never ironic; the deadpan lives in the small labels (field names, tags), never in headings or sentences.
- **Specific over generic.** "Episode 1070 is my favourite" and "Breville Bambino Plus with a Baratza Encore" are the register; "I like anime and coffee" is not. Real names, real gear, real numbers.
- Projects speak through stories with people in them ("helped my friends get into classes"), never metrics or resume verbs ("leveraging", "optimized", "driving results").
- Personal details (relationships, quirks, the dog) are first-class content, not filler.
- **Each piece of text a skimmer sees has one job.** In `panes` a section shows these, in this order of rank:
  - **Title**: says what the section is, in plain words ("My future plans" replaced "Someday": "when i am skimming it, i don't need to think about what it means").
  - **Card line** (`trailer`, on the section's card in the right column): introduces the thing to a stranger in a fun, specific way: name it, say he has it, and give a detail that makes the reader want to see more ("I have two OpenClaw agents running around."). "luibot runs my errands. luibuilder builds my ideas." was rejected because "the reader has to work hard to infer that oh i have agents". Write a subject and a verb; a list of nouns introduces nothing.
  - **Invite**: the few words on the way in, and it can name what is inside ("Meet luibot and luibuilder").
  - **Hook** (the first line of the open pane): a short, natural opener that leaves the telling to the blocks under it ("Meet my AI agents.", "In the future, I want to…"): "this kind of wording feels more natural and doesnt repeat so much of the content of the pane". One short sentence, or two when one cannot hold it (pane 1's). A hook that ends in "…" is finished by each heading under it ("Live in New York with my girlfriend.").
  - **`###`**: the heading over each block; the rules are under "Two heading levels" above.
- **Super simple language, and say what a thing does for a reader who has never heard of it**: "we should prefer to use like super, super simple language because i speak like that." "My budget sorts itself into a Google Sheet" was rejected: "ppl dont know what it is, so we just need to describe it in plain terms". It became "I track my budget and have spending reports made for me automatically". The same goes for work words (infra, scaling). Explain a name only when the point needs it: "(a game like Pokémon)" after Palworld was cut as "not really important", because the point is the automating, not the game. His rule for every sentence on the site: the reader should not have to think to understand it.
- **Simple, straightforward, complete sentences**, even when it costs a few words: "I also rather have a tiny bit more verbosity in exchange for more fluid language". A fragment such as "Dialing in espresso, custom keyboards, or ..." was rejected for that. Join sentences that belong together with a small word such as "but" or "so": "the But continues the last sentence and makes it flow better."
- **Plain first, then the fun one.** "we should state the plain version, then elaborate with the fun one." A plain word that leaves the reader asking "what?" needs one or two more words: "I build simulations where AI agents practice" got "Practice what? ... 1-2 words that indicate what they're practicing would be good."
- **Never claim more than he said.** Every sentence traces to his words or to `src/content.js`. Add no feeling, habit, cause, number or link between two facts: "a report I actually read" claimed a habit he never mentioned and went back to "a report at the end". When his dictation is unclear, write the wording that does not assert the unclear part. When a removed fact leaves a gap, ask him for a real one. Show him every new sentence word for word, with guesses marked, before it counts as done.
- **Read each line for who it leaves out.** "These are the people I love, and my dog Truffle." got: "i also love truffle, this kind of implies i dont love truffle". It became "These are the people I love the most." Setting one name apart says something about that name.
- Check `src/content.js` before writing about anyone. Truffle is "She", and his girlfriend has no name on the site.
- Keep money details light: say what luibot does, with no amounts and no account or institution names.

## Editing content

All content lives as named exports in `src/content.js`; `panes` imports them and maps over them, so routine edits never touch markup. Reshape an export only after Justin has accepted the layout, and tell whoever builds the design before you commit the new shape, so its reader changes in the same commit. Read `docs/writing-a-pane.md` before you write, rework or add to a pane: it holds which pane a new fact belongs in, the order of work, a checklist, and worked examples.

- `sections`: per section, the skim strings `title`, `trailer`, `invite`, `hook` and an optional `more` (the job of each is under Voice).
- `intro` (pane 1): blocks of `{ heading, body }`, where `body` is strings and `{ text, href }` link parts, and `heading` is left out where the hook already covers the block.
- `people` (pane 2): `{ name, heading, body }`; `girlfriend: true` marks the one highlighted card.
- `agents`, `agentStory`, `agentRoadmap` (pane 3): each agent's `name`, `tag`, `heading`, `body` and `does` list (the pathway scene where he hands luibuilder an idea highlights the `does` line containing "idea", so keep that word in one line); the story blocks under them; and the "Future side quests" list (`{ heading, note, items: [{ agent, task }] }`) he keeps up to date.
- `someday` (pane 4): `{ tag, heading, body }`. Each heading finishes the hook "In the future, I want to…". Where the `tag` appears word for word in its heading, the place's picture sits inside the sentence; otherwise beside it.
- `lately` (pane 5): `{ updated, status, blocks, week }`: the sign's lines (`{ label, value }`, dated by `updated`, see "Live details"), the story blocks, and a normal week (`{ heading, days: [{ label, items }] }`).
- `projects` (pane 6): `{ title, href, tag, kicker, story }`, in the order he sets; `tag` is a short stamp, `kicker` one line, `story` a short paragraph with a person or a reason in it.

- **New person**: `heading` is one warm, complete sentence with the person as its subject; `body` says what they are like first, then what they mean to him.
- **New section**: ask him where it goes in the order. It needs a `sections.<key>` entry, an entry in `PANES` in `src/designs/panes/index.jsx` with its detail body, and a step on the pathway with a sprite scene (the design side's part). Pane numbers follow the order, so they shift.
- **New photo**: strip EXIF before committing. The build copies `public/` into the deploy verbatim, so a straight-from-iPhone photo publishes its GPS coordinates at meter precision. Drop the APP1 and APP13 JPEG segments and keep APP0/APP2, which removes the metadata without recompressing the image or losing the color profile. If something private does ship, fixing it in git is not enough: every past Pages deployment keeps serving its own copy at a permanent `<hash>.justinlui.pages.dev` URL, so the old deployments have to be deleted as well.

## How design work goes well here

Justin hands over taste ("use ur taste") and then rejects hard, looking at true size and zoomed in. Ask him for facts only he knows and for picks between things he can see, never for what the design should be.

- **His instruction names an intent, not a layout.** Quote him to the builder and write "I read that as ..." under the quote. Show him a mock of any mechanism you add before anyone builds it. His "use the space" was built as stretching and his "one sentence" as clever taglines, each exactly as briefed, and he rejected both.
- **One example means the whole class**: "using the space more creatively goes for all designs". Fix every instance of the same defect in every design, tell him which class you assumed, and do not widen to new features. When his message opens with a general complaint and then names a detail, the opening is the scope.
- **After two failed patches of the same section, pose or face, restart from the content.** A fresh agent with no tie to the current version writes down what the content is and why each version failed, then mocks several far-apart structures with the real strings at 1280 and 375. Show him the mocks before anyone builds. Two is our limit, not a number of his.
- **Nobody passes their own work**: not the builder, and not whoever wrote its brief. Finished work goes to fresh reviewers; `docs/design-review.md` holds the protocol and the context to hand them.
- Read `docs/design-process.md` before you brief a worker, show Justin options, or check a design by hand. It holds the routes and overrides (`?hour=`, the "Episode 1070" command), the widths, the browser traps, and what nobody has verified yet.

## What to avoid

- Resume anything: timelines, "tools I use" stacks, skills grids, metrics-first project blurbs.
- Pure black, pure white, rotated or scrapbook elements, bouncy animation, drop shadows (the search palette, which floats over the window, has the only one).
- More fonts ("Two font families" above).
- More widgets. The clock and the status sign are the budget for instruments and readouts, and a third needs a reason as strong as the first two. Sprite scenes do not count: he asked for more of those.
