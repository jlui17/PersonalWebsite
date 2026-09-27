# Writing a pane

How we work out what a pane says, in what order, and in what words. It came out of the pass over panes 1 to 5, and the start of pane 6, on 2026-09-26. The rules themselves are in `AGENTS.md` under "Design principles" and "Voice"; this file holds where a new fact goes, the order of work, the shape a pane ends up with, a checklist that points back to those rules, and the panes as worked examples. Justin's words are quoted as he typed them.

## Where a new fact goes

Each pane has one job. Put a new fact in the pane whose job it is, and give it one brief mention anywhere else it comes up. A topic that cannot hold a pane of its own folds into the pane it tells something about: "i don't think there's anything interesting about my place to have a full section on it, but maybe like it can go into section five because that's telling a bit about me" (the old "My place" became part of "What I'm up to", and later its desk and coffee corner went and the shoes moved to pane 1).

| Pane | Its job | What lives there |
|---|---|---|
| 1 Hello | Who he is at a glance | His work in plain words, the traits that say the most about him (he nerds out over small details, he automates things that don't need it), fun facts, the photo, where he moved from, his links |
| 2 My people | The people he loves | One card per person: what they are like, then what they mean to him |
| 3 My agents | His two AI agents | What each one does for him, how they started, their names and characters, how he works with them, and "Future side quests", the list of what he wants to build with them next |
| 4 My future plans | Where he hopes life goes | One plan per block, each finishing "In the future, I want to…", with the reason in his words |
| 5 What I'm up to | What his life looks like these days | The status sign (learning, building, saving up for), what he is doing that he would not have done before San Francisco, the experiments with his coworkers, and a normal week |
| 6 Things I've built | His projects | One entry per project with the story behind it, in the order he sets |

## Who edits what

When a session on the words and a session on the design run at the same time: "if it's wording changes, i want u to make the change. if it's design and other things, i want the other agent to edit it." The session on the words edits every worded string, also inside `src/designs/panes/` (hover lines, labels, aria text); the design session edits layout, type, sprites and everything else. Both share one working tree:

- Exactly one session owns a push to `main`; settle which one before anyone moves it.
- Check `git status` before you edit a file. If the other session has uncommitted edits in it, ask it to checkpoint-commit first (`git add -p` is interactive and not available). Commit at once, by path; never `git add -A`.
- A new export that nothing reads yet is safe to commit first; then ask the design session to render it. A change to the shape of an export that a design already reads goes to the design session before you commit, so the reader changes in the same commit.
- After every change in length (a block added, a paragraph grown), ask the design session to re-measure the fit at 1280x800 and 1920x1080. The number of blocks shapes the layout: story blocks flow in two columns balanced by height, so an odd number can leave a hole, and about five blocks is as much as 1280x800 takes before the scroll reaches half a screen.

## The order of work

1. **Say what the pane is about** and the one or two things every visitor must take from it. Give every fact a rank: skim or detail: "for each pane, we need to figure out what the pane is about and what information we want to convey and what level each information should be at."
2. **Make the first pass yourself, on the whole pane**: the card, the hook, the headings and every body, run through the checklist below. He hands it over this way: "give ur best try at it. use ur own taste along with mine."
3. **If the pane looks bare, interview him** (next section). Fill it with his stories, not with more list lines.
4. **Show every new or changed sentence word for word**, with guesses marked, then the built page. He reacts to the page: "i'd like to see it on the preview first before we continue iterating".
5. **Apply his edits directly.** He sends them as a quoted line and its replacement ("> Looking after the server our games run on" then "Building games that my GF and I play together"). Check whether the change makes another line on the screen repeat it, and fix that too. When his message is cut off ("5", "put the go"), say what you read it as and ask for the rest.
6. **Fix the same defect everywhere in the pane**: one example he names means the whole class.

## When a pane looks bare: the interview

"the page looks quite bare. lets figure out how to fill the space ab it more ... think about what would help, and interview me for info to put on the pane". What worked for pane 3: say in two lines what is missing (stories, not tasks), then ask short numbered questions he can answer in any order, "rambling is fine". The ones that produced blocks:

- How did it start, and why? (became "I started with one agent and ended up with two")
- How do you use it or talk to it? (merged with how he splits the work into "I hand them jobs, mostly over Discord")
- Why the name, and what is it like? (became "I named them after my high school nickname")
- What comes next? (became the "Future side quests" list)
- What has it made? (became one brief list line, because pane 6 already tells the story)

Turn each answer into a block the same day, show it, and let the next answers arrive in their own time. Questions he skipped ("a recent moment", "a funny mistake") are fine to leave.

## When a pane doesn't speak to him: restart from what is true now

"some of this info it out of date, or i dont want it to be on this page, and this page just doesnt feel right ... someone reading it doesnt get a good idea of what im doing these days." Rewording does not fix that; the content is wrong. What worked for pane 5:

1. Say in a few lines why the pane fails as a picture of him (it was three kinds of thing glued together).
2. Offer three or four far-apart shapes for the pane, your pick first, each with its weak part.
3. Ask short numbered questions about what is true now, and ask directly what is out of date or unwanted on the current pane.
4. Build from his answers. Cut what he names, move what belongs elsewhere (the shoes went to pane 1 as a fun fact), and re-imagine the one thing he keeps in the new shape (the espresso setup became the status line "saving up for · A Varia VS6 espresso grinder").

## The shape of a pane

```
card (right column)            open pane
  Title   · invite phrase ›      # Title            [sprite]
  card line                      hook (plain, one short breath)
                                 ### I ... (fun)     [photo or scene]
                                 details (plain, a few fun words)
                                 ### I ...
                                 details
                                 quiet last line (links, small facts)
```

- `sections.<key>` holds `title`, `trailer` (the card line), `hook`, an optional `more`, and `invite`. A card shows `trailer ?? hook`, so a section without a `trailer` yet shows its hook on its card. The invite can name what is inside ("Meet luibot and luibuilder").
- `more` goes when the blocks below say the same (panes 1, 2 and 3 all dropped it).
- A block that the hook already covers gets no `###` (pane 1's work paragraph).
- A block can hold a paragraph and a list, as long as they share no fact: the paragraph tells one story, the list holds the rest (each agent in pane 3).
- A living list he keeps up to date gets a plain title, a quiet note beside it that says what the list is, and one line per item ("Future side quests", "Ideas I plan to build with them"). A line that is done moves to where the finished things live.

## Checklist

Each line points to its rule in `AGENTS.md` where one exists.

- The card and the open pane share no wording, and they are on screen together ("A section's card and its open section complement each other").
- No fact shows twice on one screen: count the pane plus the whole card column ("No fact twice on a screen").
- A thing another pane tells in full gets one brief mention here, not its own block: puzzlewithme in pane 3 is one list line, because pane 6 tells its story ("we can just give a really brief summary").
- Two short blocks about related things become one ("I think these two can be combined").
- A skimmer who reads only the `#`, the hook and the `###`s knows what the pane holds ("Two heading levels").
- The hook is a short, natural opener that does not sum up the blocks: "Meet my AI agents.", "In the future, I want to…" ("Each piece of text a skimmer sees has one job").
- The card line reads like the other card lines: one sentence in his voice, mostly "I" with a verb. A noun list or a from-to phrase was rejected as not "aligned with the other card lines".
- Every `###` follows "Two heading levels" in `AGENTS.md`: an "I" sentence and the fun version over a block of sentences, with its three exceptions (people, a hook ending in "…", a list), no skim line repeats it, and the first sentence under it says something new.
- Every sentence is complete, and sentences that belong together are joined by "but" or "so" ("Simple, straightforward, complete sentences"). A run of adjectives goes in one clause: "She's so kind, sweet, and beautiful." replaced "She's so kind and sweet, and she's beautiful."
- A person's details start with what they are like, then what they mean to him: "for my gf, the details should start off with how kind and nice she is."
- His words for feelings and character stay his: "more emotionally aware", "snarky, fun, playful", "pragmatic and straightforward".
- A stranger understands every word without stopping: no work jargon (infra, scaling, VPS, triaging), no bare tool names ("into a Google Sheet"), and a code only when its full name is on screen beside it ("SFO" under "San Francisco"). Explain a name only when the point needs it: OpenClaw got one sentence because the story starts with it, Palworld got none ("Say what a thing does, in plain terms").
- A name is explained plainly when the section is about it: "so luibot means he's my personal bot" replaced "basically my little robot assistant".
- Every sentence traces to his words or `src/content.js`, and guesses are marked when you show him ("Never claim more than he said").
- Labels, numbers and chrome words do a job: pane 1's "01", "02" and pane 2's tags ("Role model" over "She's my role model ...") went because they repeated the heading; a robot's hover line says something in his character ("Already on it.", "Got an idea?"), never the name printed beside him.
- The largest gap between two blocks is measured, and no side of the pane is left empty ("Use the space, and never by stretching").
- A routine or a set of tasks is a list in the order they happen, not a paragraph ("it's describing what i do. maybe a list?"); a story stays a paragraph ("Structure a section from what its content is").
- Everything on a "right now" part is still true, and its date is today's when you change it. When in doubt, ask him what is out of date ("Live details").
- A phrase he calls "a bit much" gets the plainer word: "so many opportunities there" replaced "so much work for me there".

## Pane 1, before and after

| Before | After | Why, in his words where he gave them |
|---|---|---|
| The card repeated the pane's hook word for word | Card trailer "I build AI simulations for work and automate way too much for fun." | "they should stop saying the same thing ... they should compliment each other" |
| Card title "hello" | "Hello" | "lets keep consistency" with "My people", "My agents" |
| "Hi, I'm Lui." | "Hi, I'm Justin." | His call |
| "I build simulations and evals at Scorecard." | "At Scorecard, I build simulations where AI agents practice real-world tasks." | "Practice what? ... 1-2 words that indicate what they're practicing would be good" |
| Facts row: San Francisco, Scorecard, Vancouver | "YVR → SFO" in the last line, above GitHub and LinkedIn | His format; the hook already says San Francisco and Scorecard, and the codes keep San Francisco to once on the screen |
| Numbered paragraphs "01", "02" | One `###` per block | "for each section, they should have a '###' header that summarizes the details that follow it" |
| `### Flight simulators, but for AI agents` | No `###` over the work block | "the main header already covers it" |
| "Dialing in espresso, custom keyboards, the right pair of shoes, or why ..." | "Some of those things are espresso, custom keyboards, and finding the right pair of shoes." | "the 2nd sentence is not a complete sentence" |
| "My budget sorts itself into a Google Sheet" | "I track my budget and have spending reports made for me automatically, but I don't actually read the reports." | "ppl dont know what it is, so we just need to describe it in plain terms" |
| "I handle the infra, scaling, and simulations." | "I also build the systems that run the simulations, and I make sure they keep working as they grow." | Same rule: the reader should not have to think |
| "Minecraft and Palworld (a game like Pokémon)" | "Minecraft and Palworld" | "it's not really important" |
| "Once everything runs by itself, ..." | "But once everything runs by itself, ..." | "the But continues the last sentence and makes it flow better" |
| Photo below the text, right side empty | Photo on the right beside the blocks, 14% dimmer, in a thin mat | "too much dead space on the right side of the pane"; the photo "hurts the eyes compared to the theme" |
| Caption "the three of us" | "me, Truffle, and my GF" | His wording |

## Panes 2 and 3, what changed

| Pane | Before | After | Why |
|---|---|---|---|
| 2 | "The most dependable and honest person I know." | "He's the most dependable and honest person I know." | Complete sentences; the person is the subject (he said no to "I" headings here) |
| 2 | A tag over each card ("Role model", "Est. 2017") | No tags | Each repeated the heading under it |
| 2 | "She built everything from the ground up." | "She's an accountant and runs her own business, which she built from the ground up." | "built what?"; he gave the fact |
| 2 | Her card opened with what she does for him | It opens with what she is like, then what she means to him | "the details should start off with how kind and nice she is" |
| 2 | Her card spanned the whole pane | Centred, as wide as its text | "it doesn't have to take up the whole horizontal space" |
| 3 | Each agent's paragraph repeated his list | The paragraph tells one story, the list the rest | No fact twice on a screen |
| 3 | Two columns and a bare bottom half | Three story blocks from an interview, and a "Future side quests" list | "the page looks quite bare ... interview me" |
| 3 | A block about puzzlewithme | One list line | "we also describe it in pane 6, so we can just give a really brief summary" |
| 3 | "I split the work" and "I message them on Discord" | One block, "I hand them jobs, mostly over Discord" | "I think these two can be combined" |
| 3 | "I keep a list of what I want them to do next" | "Future side quests" with "Ideas I plan to build with them" beside it | "something like future endeavors", then "Future side quests" |
| 3 | Hover line "Hi, I'm luibot" | "Already on it." | It repeated his printed name; the new line is in his snarky, proactive character |

## Panes 4 and 5, what changed

| Pane | Before | After | Why |
|---|---|---|---|
| 4 | "In the future, I want to live in New York and Japan, and then have a farm." | "In the future, I want to…", with each heading finishing it ("Live in New York with my girlfriend.") | "feels more natural and doesnt repeat so much of the content of the pane" |
| 4 | "I want us to actually live there for a while." (the whole Japan paragraph) | Why Japan, in his words, then "I don't want it to be just a trip." | It repeated its heading; he gave the reasons when asked |
| 4 | "Start a family farm with lots of dogs after tech." | "Start a family farm with all kinds of animals.", and the paragraph says he might work remotely from the farm or in farming tech | "it's not just dogs ... it's notj ust after tech" |
| 4 | Card "New York, Japan, and one day a farm full of dogs and robots." | "I hope to see New York, Japan, and one day my own farm." | His opening |
| 5 | A status table (brewing, watching, cooking), the desk, the shoes, and an "also" list of eight | A status sign (learning, building, saving up for), two story blocks, and a normal week | "someone reading it doesnt get a good idea of what im doing these days" |
| 5 | The week as one paragraph | Two lists, weekdays and weekends, in the order the day goes | "there's a better, more visual format than a block of text ... maybe a list?" |

## Still open

- **What makes a card an invitation.** His examples, as `<Card>, <Trailer line>, <Invite phrase>`: "hello, I tinker with agents, automation, and brew espresso., learn more about me" and "my agents, I have Openclaw agents running around, meet Luibot and Luibuilder". The working reading: a specific, slightly surprising detail the pane pays off, with the topic plain enough that an uninterested reader knows to skip.
- **Capital letters for the agents.** He writes "Luibot" and "Luibuilder"; the site writes them in lowercase. Not answered yet.
- **Pane 6** still needs its full pass: a trailer, its hook, and the plain-terms check of the four older projects ("this goes for all sentences across the entire site"). mdnote and slk were added and the order set.
