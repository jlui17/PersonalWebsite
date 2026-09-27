# Design review

How finished design work on justinlui.dev gets reviewed. Hand this file to a fresh reviewer as its context. The reviewer also reads `AGENTS.md` (the design principles and the voice rules), `docs/design-process.md` (the routes), `docs/writing-a-pane.md` (the checklist for a pane's words) and `src/content.js` (the real content), and for sprite work `src/sprites/README.md`.

You review work made for Justin Lui's personal site. **Judge it the way he would.** You look, you measure and you write. You do not edit the repo and you do not fix anything.

Reviews run this way because softer ones failed. The coordinator (defined in `AGENTS.md`) passed three pieces on its own eye and Justin rejected each: a Truffle that read as a cat, an arms-up pose with four arms (gaps had been checked, hands had not been counted), and a side-view head. When six independent reviewers then looked at work the coordinator had passed, all six failed it: the coordinator had looked at stills, and the reviewers measured motion and drove the controls. Later, two prototypes were reviewed as calm because nothing moved, and he called both noisy. One design passed after four rounds and he did not like it. Those reviews measured craft well (feet on lines, contrast, focus order) and hardly looked at hierarchy. So a review here covers both, and **a soft pass is worse than a harsh fail**. An invented defect is no better.

## Who Justin is, for the purpose of taste

Use only two sources: what `src/content.js` publishes about him, and the taste he has stated, quoted below. Do not bring in any other fact about him, and do not invent one. Quotes are his own words, dictated, with the typos kept.

- **What he asked for.** "i want this to be fun. yet a calm design"; "like i like to have some interactivity, but they should be like really subtle things that feel very crafted"; "it should be fun, it should be interactive, shouldn't be like too chaotic or too crazy. i don't like that."
- **What a visitor should leave with.** "a very general gist of my personality, what i kind of do, and what i do for work, and some of the side projects that i've worked on".
- **The bar for finished work.** "the uis is smooth, the design is simple, but it's also fun and a bit creative and just works."
- **Tools and design he admires**: Ghostty, Zed, JetBrains Fleet. "i just like how like sleek all of these apps are, how functional they are"; "they're opinionated, yet they're very extensible"; "i do also like the design language of apple's liquid glass". On his own place: "clean and modern, but it also has a cozy feel to it". On the palette he handed the choice over: "latte is great, but use colors u think make sense based on what u have gatherd".
- **He looks closely**, at true size on the page and zoomed in, and he notices proportion, anatomy, motion and wording. He caught four arms, an off-centre hat and empty hooks after reviews had missed them.
- **Colour**: check the rule in `AGENTS.md` under "Design principles" (blue against yellow or orange, backed by a label or a shape).

## His rejections, verbatim, by topic

His taste is learned from what he rejected, so this list is the most useful part of the file. The rules drawn from these quotes are in `AGENTS.md`; this is the record of his words. A reviewer can only check for what is written here: when nothing here said "one focus at a time", nobody flagged the noise. **Add each new rejection when it arrives.**

**Noise and reading order** (about two prototypes that showed everything at once)
- "they're also like a little too noisy. like there's just too much going on. there's not like a visual flow to reading the website."
- In the design he preferred, "the viewer focuses on one thing at a time", and in the other two "we're just throwing everything at them at the same time."
- "use visual hierarchy to direct the attention of the viewer"; "if the viewer just skimmed my website they should be able to know like ... the general gist about me and the different sections"; "right now we just throw all the details at them and that's bad."
- About a design built as a lab notebook with dials and instruments: "i just like the playfulness of the sprites. the rest is a bit noisy."
- About a design themed as a game character sheet, with no more detail given: "i don't really like the character sheet".
- The two designs set aside when `panes` won: `glass` (Liquid Glass widgets), "glass is a cool concept, but i think not to my taste for now", and the warm spec sheet with sprite scenes, after "i think im heavily leaning towards the panes design".

**How much to show up front**
- "even like multiple lines is a little too much. if anything it should be like one line".
- "it's okay to have a one-line explanation that provides a little more detail than just like a header", but lower in the hierarchy: "something where they'll notice it, but it doesn't like distract them from reading the header".

**Hooks and titles**
- "i don't think the hooks that you use actually communicate anything". The hook under "Agents" read "luibot runs my errands. luibuilder builds my ideas.", and "the reader has to work hard to infer that oh i have agents". He wanted it to say something like "i have some open claw agents running around", followed by "a few words to like invite the" reader in.
- The title "Someday": "what do you mean someday?"; "we need words like future"; "when i am skimming it, i don't need to think about what it means."
- "we should prefer to use like super, super simple language because i speak like that."
- The people hook read "These are the people I love, and my dog Truffle.": "i also love truffle, this kind of implies i dont love truffle". It became "These are the people I love the most."
- A short label for the projects section: "step 7 should be called 'projects' instead of 'built'".

**Space**
- "you don't fill up the space until it looks awkward" (a widget with a label, a title, one sentence, and then a large hole above its links).
- "audit the space usage and fill it as much as makes sense without over cluttering it"; "basically be more creative with the space usage"; "using the space more creatively goes for all designs".
- "there's too much space here because the three sections are side by side" (three short columns at the top of a tall pane).
- Then, after the builders had stretched blocks apart to reach the bottom: "i did not mean to like stretch things out because now there's just like gaps i meant more to like fill it in with visuals"; "we don't actually have to use the full thing"; "medium sized small medium sized gaps are like fine"; "when it's like a medium to like a big gap, it's it just doesn't look good."

- Dead space beside the cards, said twice because the first fix was too small: "there's a bit of dead space to the right here. can we slighly shrink this", then "also there's still too much dead space on the right here".
- Content sitting tight at the top of a large pane, three asks in one hour, all from his own window of about 1440x1000: "make the spacing more consistent and i think it's enough content to make use of the full pane's space"; "i think pane 2 can be spaced out a bit more to fill the pane up more. add more veritcal spacing between sections"; "same for pane 6".
- A pane that was bare in content got small scenes, at his suggestion: "i think that section's a little bare, like in terms of the content, so we can add some like flair to it", with "subtle details to make it look a little fun but also not like detract from the design and the attention on the words". His own layout for one: "a floating sign above the buildings, saying new york, and then place the buildings in the middle of the sentence".

**Separators, controls and chrome**
- "too many separators in some sections. like for example, the very last section"; "multiple horizontal line separators that don't need to be there, but i think you carried them over from the previous design".
- The selected card collapsing in the right column: "i don't see any point. like if you can justify why ... then maybe keep it but if there's no like really good or strong design reason or purpose to do that then we should just keep all of them expanded and not have the choice to like change that and then instead like show which one's selected by having the same like border as the main pane does."
- A control labelled "only this": it "isn't clear enough" "about what it means. maybe add a visual queue and change the wording".
- A title-bar hint that listed vim keys: "not everyone that visits my sigh will be a dev and an even smaller part will have used vim".
- A focus ring that poked 1 to 2px out of a section's border: "fix this alignment issue too".

**Repeats**
- "you have the sprite of me lying down, which is also the same as me lying down at the bottom"; "we have a bunch of new sprites now."

**Section structure** (the "What I'm up to" section, twice)
- A numbered list beside status cards: "i don't think it's cohesive and the list + cards don't compliment each other".
- Then three columns by place: "this section now sucks more than when we started changing it"; "anchored way too much on the original design"; "if you have these vertical sections then the information should like kind of blend together underneath each category, but like they don't really".
- A section of its own for his place: "i don't think there's anything interesting about my place to have a full section on it". It was folded into "What I'm up to".

**Sprites in a design**
- "the desk legs blend in with the background ... so it looks like a floating desk i want it to have legs" (on a dark page).
- "i always walk in left to right. like maybe i can just start in in the middle".
- Truffle walked back to her place on her own: "too much moving around".
- The farm animals stood still: he asked for their animated sprites "so they aren't just starin".
- At the hello section, "my sprite can be waving instead of sleeping".
- At the coffee corner: "sometimes the wrong hand moves to use the coffee. like if the coffee stand is on my left, i move my right arm and vice versa."
- The desk appeared only when he sat at it: "i feel like the desk should remain at step 7 and then i walk to it and sit down in it" (the desk is at step 6 since the place section was folded).
- A sitting side view of him beside the h1: "id prefer if i was standing and waving occasionally".
- Generic idles: "for step 2, when im idling (not petting truffle), i think i should sleep instead. it matches truffles energy"; in pane 3, "instead of having the agents at the bottom, put them beside their name + desc". He also wanted scenes such as "brew coffee from my coffee stand and then pickup the coffee and drink it".
- A trip of more than one step was cut short: "my sprite teleports if the select step is > 1 away. i'd like for my sprite to just continue walking at the same pace". The reviewers had called the long walks too long.
- The robots flying across the screen: "the agents floating around is a bit noisy. like it's a quite distracting ... they kinda like light beam themselves to their spot". His rule: "anything larger than a small shift in position should be a teleportation and shift as in like, oh, it picks up the boxes and then places it on the stack, like that's a small shift".
- The robots popping between the pathway and pane 3 with no beam: "it would be really cool to ... use the animation during that teleportation instead. so that they're like going up into the pane and going down back down".
- The wrong hand again, at another step, because the first fix was not swept: "if ... the justin sprite goes from right to left back to the cow, then it's like raising the wrong hand".
- luibot's shoebox chore, which had been passed from stills: "it moves in the opposite direction and then the boxes teleport on top of the stack which does not look good".
- Truffle jumping to the pet spot: "she kind of just like teleports there, but like there should be an interaction ... she should like wake up and then like walk to me". What he asked for instead is "a very key feature or very key trait that she does, she's very spoiled ... she will like paw your leg".
- The chair out by default: "what i would like is for the chair to start tucked into the desk ... me always having to pull it out just makes consistency and it's a little cute interaction".
- The chair pull, which the coordinator had passed from the art strip: "when i'm pulling it out, my hands are not actually on the chair, so it makes it look a little weird ... take a closer look and make sure that it gets implemented well". The art was fine; he stood 22px too far left.
- The fix for the wrong hand mirrored the whole figure on arrival: "when i walk from right to left it is not smooth. like there's a bit of jitter towards the end".
- First-draft props: "can you like iterate it on it like once or twice and add some like nice details ... subtle yet nice details that like bring the animation and the sprites together".
- Two copies of him in one outfit on one screen: "for step 1, my sprite in the pane should be the hoodie one. the one on the pathway should be the overshirt one".
- luibuilder working at the right end of each rule: "when luibuilder teleports around, it should be doing those 'building' animations beside the titles, not to the far right".
- luibot at the status switch: "his hand goes in the air above the toggle. it kind of looks like he's just waving his hand and then the toggle gets flipped". The same cause as at the chair: a position taken from the wrong rows of the sheet (18px too high), and the sign lit after the arm was down.
- An expand animation that "looks a lil choppy": "try to make it as smooth as possible."

**Flow and wording in a pane** (panes 1 to 5, 2026-09-26; the before and after is in `docs/writing-a-pane.md`)
- What he means by flow: "when i say 'flow', i mean like the visual hierarchy that captures the readers attention and helps them read the content in the order we intend. there's a concept called 'greasing' for dating/game shows where the director of a dating show doesn't script any interactions, but they make it as easy and natural as possible for something to happen, and so it usually happens because it's the most natural path. i'd like to apply that concept here to each pane."
- "for the 1st pane, don't really see a flow. i think it's not obivous or intentional what information we want the user to know."
- The card repeating the open pane's hook: "they should stop saying the same thing, but i think there should be some overlap in info (not wording, although some is ok). like they should compliment each other."
- "I build simulations where AI agents practice": "Practice what? its kind of not obvious and the reader has to work hard to understand."
- A `###` over the work block: "I actually think we dont need this subheader. the main header already covers it".
- A `###` echoed by the sentence under it, and a fragment: "there's a bit too much overalp between the subheader and the first sentence here ... the 2nd sentence is not a complete sentence. i prefer simple, straightforward, complete sentences".
- "My budget sorts itself into a Google Sheet": "ppl dont know what it is, so we just need to describe it in plain terms ... it's too hard to understand without thinking about it. this goes for all sentences across the entire site."
- "(a game like Pokémon)": "it's not really important".
- Text in one column and the photo below it: "there's too much dead space on the right side of the pane".
- The photo on the dark page: "it's kind of bright and hurts the eyes compared to the theme".
- Pane 3 with two short columns and nothing under them: "the page looks quite bare".
- A block about puzzlewithme in pane 3 when pane 6 tells it: "we also describe it in pane 6, so we can just give a really brief summary. idk if it should be in its own block".
- Two short blocks side by side ("I split the work between them", "I message them on Discord"): "I think these two can be combined".
- The "Future side quests" list placed at the bottom right: "add the list to the top left instead of the botto mright".
- A list heading written as an "I" sentence ("I keep a list of what I want them to do next"): "it should be something like future endeavors".
- The girlfriend card spanning the whole pane: "it doesn't have to take up the whole horizontal space".
- Hooks that summed up the pane ("My AI agents are luibot and luibuilder, and I keep finding new things to hand them."): "Meet my AI agents" and "In the future, I want to..." instead, because "this kind of wording feels more natural and doesnt repeat so much of the content of the pane".
- "There's also so much work for me there": "a bit much for me".
- The farm heading "Start a family farm with lots of dogs after tech.": "it's not just dogs, it's all kinds of farm animals ... Also it's notj ust after tech."
- Pane 5 as a status table, the desk, the shoes and an "also" list: "some of this info it out of date, or i dont want it to be on this page, and this page just doesnt feel right ... someone reading it doesnt get a good idea of what im doing these days."
- A normal week written as a paragraph: "i feel like there's a better, more visual format than a block of text. it's describing what i do. maybe a list?"

**Type**
- The tall, condensed display serif used for every heading: "i really don't like the font used for higher visual hierarchy. i really don't like that style of font." He picked JetBrains Mono from four candidates shown on the real page. The coordinator and both reviewers had agreed on the serif.
- Three font families in one design: "i think there's like multiple font families here as well. i think i like to clean that up to just like two. like maybe buttons and headers use the same font and then like bodies of text use a different font?"

**Colour**
- A near-black ground with amber: "can u make the background of the theme a slighlty lighter brown. like a medium-light roast espresso. i want to stray away from dark + orange". From three candidates on the real page: "i like A, but slightly darker".

**Sprite art.** His rejections of the drawings (outline, arms, smile, side head, hat, Truffle, the walks, the animals) are quoted beside the rule each produced in `src/sprites/README.md`. The newest two are there as well: the waving arm that was "way too long", and the raised arm that was "basically not connected to my body lol" on a dark page. A sprite reviewer reads that file too.

**What he liked, to keep**
- One focus at a time, with a reading flow.
- The sprite play, and more of it: "i'd even like the sprites to be interacting/playful even more".
- Expanding in place: "there's an indicator that you can click on it and expand it and when you do then it shows more details. i think i like that".
- Less shown by default: "now you strip down the shown by default information, which is good."
- A plain list of four projects, each with one line and a short story, that filled its pane with no tricks: it "uses the space decently well".
- After the side head and the hat-tip arm were redrawn: "cool sprites look pretty good". Later: "i think the sprites for now ... are pretty good because we've refined them a bunch of times".
- The first interactions wired into the page: "okay, this is getting there."
- His hold and set-down of the shoeboxes: it "looks great".
- The chair: "i think the animation of me pulling out the chair and sitting in it is really cool".
- "the animation of me walking from left to right is very smooth".
- Characters doing small jobs for each other: "it's these kinds of interactions that show how much thought and care is put into a website like this."
- His picks: "ii think i like jetbrains mono." and, for the ground, "i like A, but slightly darker".
- Pane 3 as story blocks and a list: "ok this is fine".
- Before the ship: "the design and the website i think r just about ready."
- Built as he asked, with no reaction from him on record: the feed that halves as the hen eats, Truffle waking, walking over and pawing his leg, and the buildings inside the heading sentence with a floating sign.
- Seen by him with no objection on record, which is weaker than praise: the beam itself (he asked for it in more places), the status sign and its switch apart from the hand, the six cards with the amber border on the selected one, "Expand" and "Show all sections", the arrow and number key hint, the dimmed photo in its mat, and the final ground colour.

## How to inspect

The routes, the hour override, the widths and the traps (frozen background tabs) are in `docs/design-process.md` under "Checking a design by hand". On top of those:

1. **Cold read first.** Load the page at true size, skim for ten seconds, and write down what you understood and what felt off. For a sprite, write what he is doing and what it reads as. Only then open the code, the builder's notes and doubts, and any earlier review. Cold reads caught "a man sitting on a bench" (the kneel) and "two appliances on a plank" (the coffee corner) before a label could bias the reviewer.
2. **Test the hierarchy**, because earlier reviews did not. These tests are the coordinator's, and no review using them has been checked against his reaction yet.
   - Squint at the first screen. Is there one place to start and an obvious order?
   - What could a stranger say about him after five seconds?
   - Read only the large text aloud. Does a stranger know what each section is without thinking?
   - Count the words visible at first paint.
   - Measure the largest blank band between two blocks in every section, pane, widget and opened sheet, in px. Reviewers treated about 60px as safe and 100px and up as a band he will see; those numbers are theirs, not his.
   - Count the facts and the sprite poses that appear more than once.
   - Count the rule lines and name the job of each.
   - Trace every sentence to his words or to `src/content.js`. List each one that claims more.
3. **Measure motion and interaction.** Sample positions 100 to 300ms apart. Do fast in-and-out hovers, a second click mid-sequence, the keyboard, touch emulation and `prefers-reduced-motion`. Check that feet sit on their lines to the pixel at both widths and at several hours.
4. **Give evidence for every finding**: a screenshot path, a measurement, or a file and line. Treat "verified" in a code comment or a builder's note as unproven until you have seen it yourself.

## List A and list B

- **List A** is what Justin would reject or find ugly or silly. Only list A decides the verdict.
- **List B** is what could be nicer, one line each. List B never blocks. The split is what stopped endless polish rounds.
- Judge the builder's own doubts last, each as "fine", "list B" or "list A".
- Give a builder the finding and the goal, not the pixels. A reviewer's sketch is a minimum to improve on, never something to copy. The incidents are in `src/sprites/README.md` under "Method".
- Each round gets a fresh reviewer, so nobody defends an earlier verdict.

## The pair, for finished work

Justin asked that finished work is looked at by two reviewers on two different models who "work with each other to figure out like okay what works, what doesn't work, what are the smaller details that work, what could be sort of refined", and "you don't have to do like crazy, crazy loops". One reviewer runs on the coordinator's model and one on another model. If your brief names a partner file:

1. Look on your own first, and write your notes to your file before you open your partner's. Two independent reads are the point.
2. Read your partner's file. For each of their items, say that you agree, that you disagree (with fresh evidence from the live page, not from memory), or that it is smaller than they say. Append this to your file as a reply. If the partner's file never appears, say so and finish alone.
3. The reviewer whose brief says so writes the joint list, in three short parts. KEEP is what works and must not be lost. FIX is what does not work, and holds only items that both of you stand behind or that one of you has hard evidence for. REFINE is small details, one line each, ordered by how much nicer the page gets for the work. Note each open disagreement in one line for the coordinator. About twelve FIX and REFINE items at most; cut the weakest.
4. At most two rounds per piece, then the coordinator decides. Two is our limit, not a number of his.

Open: he asked for a reviewer loop "until it's good" after a hard rejection of his own likeness, and later for this light pair with no deep loops. The working reading is a deeper loop (capped, five rounds were used) only for a likeness he has rejected hard, and the pair for everything else. He has not confirmed that split. At the ship review the two models found mostly different defects (ten and three), which is the only evidence so far that the pair disagrees usefully.

## What to write

One Markdown file at the path your brief gives, with your screenshots saved beside it. Lead with `VERDICT: PASS` or `VERDICT: FAIL`. It is a PASS only if Justin, looking as closely as he does, would find nothing wrong or ugly. Then:

1. Your cold read, as you wrote it before reading anything else.
2. List A, most severe first. For each item: where (route, section, frame, viewport), what is wrong in plain words, the evidence, and the goal a fix must reach.
3. List B.
4. What is good and must be kept.
5. Fit to Justin: where the work uses what the site says about him, where it is generic, and a few ideas that come from `src/content.js`. No invented facts.
6. What you could not check, including whatever still applies from the standing list in `docs/design-process.md` ("Checking a design by hand").

Keep it tight: findings, not essays.
