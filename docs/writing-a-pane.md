# Writing a pane

How we work out what a pane says, in what order, and in what words. It came out of the pass over the hello, people, agents, future and now panes, and the start of the projects pane, on 2026-09-26; the projects joined the agents pane on 2026-10-07. The rules themselves are in `AGENTS.md` under "Design principles" and "Voice"; this file holds where a new fact goes, the order of work, the shape a pane ends up with, a checklist that points back to those rules, and the panes as worked examples. Justin's words are quoted as he typed them.

## Where a new fact goes

Each pane has one job. Put a new fact in the pane whose job it is, and give it one brief mention anywhere else it comes up. A topic that cannot hold a pane of its own folds into the pane it tells something about: "i don't think there's anything interesting about my place to have a full section on it, but maybe like it can go into section five because that's telling a bit about me" (the old "My place" became part of "What I'm up to", and later its desk and coffee corner went and the shoes moved to pane 1).

| Pane | Its job | What lives there |
|---|---|---|
| 1 Hello | Who he is at a glance | His work in plain words, the traits that say the most about him (he nerds out over small details, he automates things that don't need it), fun facts, the photo, where he moved from, his links |
| 2 Projects & Agents | What he builds: his two AI agents, then the things he has built ("kind of like a fun portfolio") | Each agent first (what he does for him, how he works with him, and in the same list what he plans to build with him next, each line marked "next"), then "Things I've built", one entry per project with the story behind it, in the order he sets |
| 3 Now and later | What his life looks like these days, then where he hopes it goes | First the now part: the status sign (learning, building, saving up for), what he is doing that he would not have done before San Francisco, the experiments with his coworkers, and a normal week. Then the future part, under "In the future, I want to…": one plan per block, each heading finishing that sentence, with the reason in his words |
| 4 My people | The people he loves | One card per person: what they are like, then what they mean to him |

## Who edits what

When a session on the words and a session on the design run at the same time: "if it's wording changes, i want u to make the change. if it's design and other things, i want the other agent to edit it." The session on the words edits every worded string, also inside `src/designs/panes/` (hover lines, labels, aria text); the design session edits layout, type, sprites and everything else. Both share one working tree:

- Exactly one session owns a push to `main`; settle which one before anyone moves it.
- Check `git status` before you edit a file. If the other session has uncommitted edits in it, ask it to checkpoint-commit first (`git add -p` is interactive and not available). Commit at once, by path; never `git add -A`.
- A new export that nothing reads yet is safe to commit first; then ask the design session to render it. A change to the shape of an export that a design already reads goes to the design session before you commit, so the reader changes in the same commit.
- After every change in length (a block added, a paragraph grown), ask the design session to re-measure the fit at 1280x800, 1920x1080 and his own window, about 1440x1000, where all his spacing asks came from. The number of blocks shapes the layout: story blocks flow in two columns balanced by height, so an odd number can leave a hole, and about five blocks is as much as 1280x800 takes before the scroll reaches half a screen.

## The order of work

1. **Say what the pane is about** and the one or two things every visitor must take from it. Give every fact a rank: skim or detail: "for each pane, we need to figure out what the pane is about and what information we want to convey and what level each information should be at."
2. **Make the first pass yourself, on the whole pane**: the card, the hook, the headings and every body, run through the checklist below. He hands it over this way: "give ur best try at it. use ur own taste along with mine."
3. **If the pane looks bare, interview him** (next section). Fill it with his stories, not with more list lines.
4. **Show every new or changed sentence word for word**, with guesses marked, then the built page. He reacts to the page: "i'd like to see it on the preview first before we continue iterating".
5. **Apply his edits directly.** He sends them as a quoted line and its replacement ("> Looking after the server our games run on" then "Building games that my GF and I play together"). Check whether the change makes another line on the screen repeat it, and fix that too. When his message is cut off ("5", "put the go"), say what you read it as and ask for the rest.
6. **Fix the same defect everywhere in the pane**: one example he names means the whole class.

## When a pane looks bare: the interview

"the page looks quite bare. lets figure out how to fill the space ab it more ... think about what would help, and interview me for info to put on the pane". What worked for the agents pane: say in two lines what is missing (stories, not tasks), then ask short numbered questions he can answer in any order, "rambling is fine". The ones that produced blocks:

- How did it start, and why? (became "I started with one agent and ended up with two", later cut with "Fun facts" when the projects joined the pane)
- How do you use it or talk to it? (merged with how he splits the work into "I hand them jobs, mostly over Discord")
- Why the name, and what is it like? (became "I named them after my high school nickname", cut with it)
- What comes next? (became the "Future side quests" list)
- What has it made? (became one brief list line, because the projects pane already told the story)

Turn each answer into a block the same day, show it, and let the next answers arrive in their own time. Questions he skipped ("a recent moment", "a funny mistake") are fine to leave.

## When a pane doesn't speak to him: restart from what is true now

"some of this info it out of date, or i dont want it to be on this page, and this page just doesnt feel right ... someone reading it doesnt get a good idea of what im doing these days." Rewording does not fix that; the content is wrong. What worked for the now pane:

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
- `more` goes when the blocks below say the same (hello, people, agents and projects all dropped it).
- A block that the hook already covers gets no `###` (pane 1's work paragraph).
- A block can hold a paragraph and a list, as long as they share no fact: the paragraph tells one story, the list holds the rest (each agent in pane 2).
- A living list he keeps up to date goes where its items belong, one line per item, and says what is not done yet by shape and a word, not by a heading of its own: each agent's side quests close his "what I hand him" list, each with a hollow box and a small "next" tag ("somehow combine current responsibilities with future side quests"). A side quest that is done loses its tag and moves up among the lines he has now.
- A part after a pane's first opens under a hairline with a plain title and the quiet note beside it, the same grammar as the living list: pane 2's "Things I've built" with "I like building small tools for people I know." (the projects pane's old hook). Pane 3's future part opens with the future pane's old hook, "In the future, I want to…", as its title, and each plan's heading finishes it (the two panes became one on 2026-10-08, at his pick).

## How a `###` is worded

- Over a block of sentences, a `###` is an "I" sentence and the fun version ("I automate things that don't need it"; a lead-in such as "Fun fact:" is fine), and the details under it explain in plain terms with a few fun words mixed in.
- Three exceptions. In a pane about other people, the person is the subject ("She's my role model for hard work and perseverance."; he said no to "I" headings in "My people"). Under a hook or a part's title that ends in "…", each heading finishes it ("Live in Japan with my girlfriend."). Over a list, a `###` is a plain title ("Things I've built" over the projects).
- No skim line repeats a `###`, and a block the hook already covers gets none ("the main header already covers it"). The first sentence under a `###` says something new, not the `###` again ("there's a bit too much overalp between the subheader and the first sentence here").

## Checklist

Each line points to its rule in `AGENTS.md` where one exists.

- The card and the open pane share no wording, and they are on screen together ("A section's card and its open section complement each other").
- No fact shows twice on one screen: count the pane plus the whole card column ("No fact twice on a screen").
- A thing another pane tells in full gets one brief mention here, not its own block: puzzlewithme was one list line in the agents pane while the projects pane told its story ("we can just give a really brief summary").
- Two short blocks about related things become one ("I think these two can be combined").
- A skimmer who reads only the `#`, the hook and the `###`s knows what the pane holds ("Two heading levels").
- The hook is a short, natural opener that does not sum up the blocks: "Meet my AI agents.", "In the future, I want to…" ("Each piece of text a skimmer sees has one job").
- The card line reads like the other card lines: one sentence in his voice, mostly "I" with a verb. A noun list or a from-to phrase was rejected as not "aligned with the other card lines".
- Every `###` follows "How a `###` is worded" above.
- Every sentence is complete, and sentences that belong together are joined by "but" or "so" ("Simple, complete sentences"). A run of adjectives goes in one clause: "She's so kind, sweet, and beautiful." replaced "She's so kind and sweet, and she's beautiful."
- A person's details start with what they are like, then what they mean to him: "for my gf, the details should start off with how kind and nice she is."
- His words for feelings and character stay his: "more emotionally aware", "snarky, fun, playful", "pragmatic and straightforward".
- A stranger understands every word without stopping: no work jargon (infra, scaling, VPS, triaging), no bare tool names ("into a Google Sheet"), and a code only when its full name is on screen beside it ("SFO" under "San Francisco"). Explain a name only when the point needs it: OpenClaw got one sentence because the story starts with it, Palworld got none ("Super simple language, for a reader who has never heard of the thing").
- A name is explained plainly when the section is about it: "so luibot means he's my personal bot" replaced "basically my little robot assistant".
- Every sentence traces to his words or `src/content.js`, and guesses are marked when you show him ("Never claim more than he said").
- Labels, numbers and chrome words do a job: pane 1's "01", "02" and the people cards' tags ("Role model" over "She's my role model ...") went because they repeated the heading; a robot's hover line says something in his character ("Already on it.", "Got an idea?"), never the name printed beside him; and a control says what it does in plain words ("only this" became "Expand": "isn't clear enough about what it means").
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

## My people and My agents, what changed

| Pane | Before | After | Why |
|---|---|---|---|
| people | "The most dependable and honest person I know." | "He's the most dependable and honest person I know." | Complete sentences; the person is the subject (he said no to "I" headings here) |
| people | A tag over each card ("Role model", "Est. 2017") | No tags | Each repeated the heading under it |
| people | "She built everything from the ground up." | "She's an accountant and runs her own business, which she built from the ground up." | "built what?"; he gave the fact |
| people | Her card opened with what she does for him | It opens with what she is like, then what she means to him | "the details should start off with how kind and nice she is" |
| people | Her card spanned the whole pane | Centred, as wide as its text | "it doesn't have to take up the whole horizontal space" |
| agents | Each agent's paragraph repeated his list | The paragraph tells one story, the list the rest | No fact twice on a screen |
| agents | Two columns and a bare bottom half | Three story blocks from an interview, and a "Future side quests" list | "the page looks quite bare ... interview me" |
| agents | A block about puzzlewithme | One list line | "we also describe it in pane 6, so we can just give a really brief summary" |
| agents | "I split the work" and "I message them on Discord" | One block, "I hand them jobs, mostly over Discord" | "I think these two can be combined" |
| agents | "I keep a list of what I want them to do next" | "Future side quests" with "Ideas I plan to build with them" beside it | "something like future endeavors", then "Future side quests" |
| agents | Hover line "Hi, I'm luibot" | "Already on it." | It repeated his printed name; the new line is in his snarky, proactive character |

## My future plans and What I'm up to, what changed

| Pane | Before | After | Why |
|---|---|---|---|
| future | "In the future, I want to live in New York and Japan, and then have a farm." | "In the future, I want to…", with each heading finishing it ("Live in New York with my girlfriend.") | "feels more natural and doesnt repeat so much of the content of the pane" |
| future | "I want us to actually live there for a while." (the whole Japan paragraph) | Why Japan, in his words, then "I don't want it to be just a trip." | It repeated its heading; he gave the reasons when asked |
| future | "Start a family farm with lots of dogs after tech." | "Start a family farm with all kinds of animals.", and the paragraph says he might work remotely from the farm or in farming tech | "it's not just dogs ... it's notj ust after tech" |
| future | Card "New York, Japan, and one day a farm full of dogs and robots." | "I hope to see New York, Japan, and one day my own farm." | His opening |
| now | A status table (brewing, watching, cooking), the desk, the shoes, and an "also" list of eight | A status sign (learning, building, saving up for), two story blocks, and a normal week | "someone reading it doesnt get a good idea of what im doing these days" |
| now | The week as one paragraph | Two lists, weekdays and weekends, in the order the day goes | "there's a better, more visual format than a block of text ... maybe a list?" |

## Still open

- **Pane 3's card** ("Now and later", since the now and future panes became one on 2026-10-08) keeps the now pane's line and invite, which name only the now part. The future pane's line ("I hope to see New York, Japan, and one day my own farm.") and invite ("See the plan") went with its card.
- **The now pane's card line** is a noun list ("Silly AI experiments, Japanese workbooks, and a lot of Trader Joe’s."), against the card-line rule. He asked for something "more fun", then "snarky", and has not picked a replacement yet. The projects never got a card line for the same reason.
- **Pane 2, since the projects joined it.** Its title is "Projects & Agents", his pick (the hash stays `#agents`); the agents still come first inside it. Its card keeps the agents' line and invite, which name only the agents. luibuilder's list line "Building puzzlewithme, ..." went when the projects joined (Justin: "drop one"); the project keeps the story. `?agents=a` and `?agents=b` are two ways to rank the robots' names above everything else; he has not picked.

- **What makes a card an invitation.** His examples, as `<Card>, <Trailer line>, <Invite phrase>`: "hello, I tinker with agents, automation, and brew espresso., learn more about me" and "my agents, I have Openclaw agents running around, meet Luibot and Luibuilder". The working reading: a specific, slightly surprising detail the pane pays off, with the topic plain enough that an uninterested reader knows to skip.
- **Capital letters for the agents.** He writes "Luibot" and "Luibuilder"; the site writes them in lowercase. Not answered yet.
- **The projects** (pane 2's last part) still need their full pass: the plain-terms check of the four older projects ("this goes for all sentences across the entire site"). mdnote and slk were added and the order set.
