// The hello blocks under the h1: each has a `heading` (the ### that says what
// the block is about; left out where the hook already says it) and a `body`,
// an array of parts: a string, or { text, href } for a link inside the sentence.
export const intro = [
  {
    // no heading: the hook above already says what this block is about
    body: [
      "From coding to research to managing vending machines, I build worlds where AI agents go to complete tasks. The data from those tasks is used to help AI learn and get better. At ",
      { text: "Scorecard", href: "https://www.scorecard.io/" },
      ", I work on both product and engineering.",
    ],
  },
  {
    // no heading: it reads as a second paragraph of the hello
    body: [
      "I can talk about espresso and custom keyboards for hours. I can also tell you why episode 1070 of the anime One Piece is my favourite.",
    ],
  },
  {
    heading: "I automate things that don’t need it",
    body: [
      "I track my budget and have spending reports made for me automatically, but I don’t actually read the reports. I do the same thing in video games. In Minecraft and Palworld, I spend 95% of my time building farms that collect food and resources on their own. But once everything runs by itself, I get bored and quit. I do it because I like the challenge of figuring out how the whole system works, and that takes a lot of research into the details.",
    ],
  },
  {
    heading: "Fun fact: I’m terrible at geography but weirdly good at directions",
    body: [],
  },
  {
    heading: "Fun fact: I own a lot of shoes",
    body: ["I used to be into buying and selling shoes and streetwear. I don’t anymore, but the shoes stayed."],
  },
];

// Pane 4, one card per person: `heading` is one warm, complete sentence with
// the person as its subject, `body` what they are like and then what they mean
// to him. `girlfriend: true` marks the one highlighted card.
export const people = [
  {
    name: "My mom",
    heading: "She’s my role model for hard work and perseverance.",
    body: "She’s an accountant and runs her own business, which she built from the ground up.",
  },
  {
    name: "My dad",
    heading: "He’s the most dependable and honest person I know.",
    body: "He’s sometimes a little too honest. I try to be as real as he is with the people I care about, but maybe a bit gentler.",
  },
  {
    name: "Andrea",
    heading: "My little sister was made for New York.",
    body: "I look up to her because she moved to New York, chased what she wanted, and made it happen. She’s a huge part of why I finally chased my own dream of working at a startup in San Francisco. She also helped me get my job at Scorecard.",
  },
  {
    name: "Truffle",
    heading: "She’s been my best friend since 2017.",
    body: "She’s my spoiled, squishy, and very sweet French Bulldog.",
  },
  {
    name: "My girlfriend",
    heading: "She’s my best friend and the most thoughtful person I know.",
    body: "Being with her makes me kinder, healthier, and more emotionally aware.",
    girlfriend: true,
  },
];

// Pane 2 opens with his agents, one block each: a short `tag` beside the name,
// a `heading`, a `body` with one story, and the `does` list with the rest (no
// fact in both). `does` is one list per agent, in two parts: first what he
// does for Justin now (a plain string each), then his side quests, the things
// Justin plans to build with him next (`{ text, next: true }`), in the order
// Justin adds them. Justin keeps it up to date; a side quest that is done
// loses its `next` and moves up among the strings.
export const agents = [
  {
    name: "luibot",
    tag: "The main one",
    heading: "I talk to him the most, about almost everything.",
    body: "He orders my food on DoorDash, and he’s learning what I like.",
    does: [
      "Doing my research",
      "Thinking through investments with me",
      "Sorting through my email",
    ],
  },
  {
    name: "luibuilder",
    tag: "Coding agent",
    heading: "I tell him I have an idea, and he goes off and builds it.",
    does: [
      { text: "Doing some robotics experiments with me", next: true },
      { text: "Designing parts for a 3D printer I want to get, for those robotics experiments", next: true },
    ],
  },
];

// Pane 3's first part, what he is up to these days: a small status sign
// (`status`, the things that change month to month, dated by `updated`: bump
// it whenever a line changes), the story under it (`blocks`, like the hello
// blocks) and a normal week (`week`).
export const lately = {
  updated: "2026-10-03",
  status: [
    { label: "Learning", value: "Japanese, with workbooks" },
    { label: "Saving up for a", value: "Varia VS6 espresso grinder" },
  ],
  blocks: [
    {
      heading: "I’m doing things I never would have in Vancouver",
      body: [
        "I’m surrounded by people who think up the same silly experiments I do, so now we actually build them together. Even when a project seems hard, I just go do it.",
      ],
    },
    {
      heading: "I’m training a Pokémon AI with my coworkers",
      body: [
        "We’re running an AI agent that gets better at competitive Pokémon on its own, and you can ",
        { text: "follow along here", href: "https://pokemon-viewer-production.up.railway.app/stats" },
        ". We’ve also talked about hooking up cameras and sensors so an agent can manage our office snack cabinet, and about agents that water our plants using moisture sensors.",
      ],
    },
  ],
  // A normal week, as two short lists in the order the day or weekend goes.
  week: {
    heading: "My week usually goes like this",
    days: [
      {
        label: "Weekdays",
        items: [
          "Pick up groceries from the Trader Joe’s nearby",
          "Talk with my girlfriend for the rest of the night",
          "Work on side projects late into the night",
        ],
      },
      {
        label: "Weekends",
        items: [
          "Head out to places like San Mateo for good Chinese food",
          "Save one day for a date with my girlfriend",
        ],
      },
    ],
  },
};

// Pane 3's second part, where he hopes life goes: `somedayHead.heading` opens
// it (it was the hook of a pane of its own), and each plan's heading finishes
// it, so it starts with a verb and no "I want to". `tag` is the place's name
// on its sign: where it appears word for word in the heading, the place's
// picture sits inside the sentence there; otherwise beside it.
export const somedayHead = {
  heading: "In the future, I want to…",
};

export const someday = [
  {
    tag: "New York",
    heading: "Live in New York with my girlfriend.",
    body: "People there are hustlers, and they’re straightforward and honest. I’d rather people be genuine than polite. There are also so many opportunities there, and getting around is easy, which really matters to me.",
  },
  {
    tag: "Japan",
    heading: "Live in Japan with my girlfriend.",
    body: "My girlfriend is from Japan.",
  },
  {
    tag: "The farm",
    heading: "Start a family farm with all kinds of animals.",
    body: "I’ve always been an animal person, so I want to be surrounded by dogs, cows, chickens, sheep, and pigs. I’m from Vancouver, where there’s so much nature, so I’ve always loved the outdoors. My girlfriend really wants a farm too, so she can grow fresh vegetables, fruits, and flowers. I plan to spend my days automating every part of the farm with robots, which is where luibot and luibuilder come in. It doesn’t have to wait until I’m done with tech, either. I might work remotely and live on the farm, or I might work in farming tech, and I’d like to do both.",
  },
];

// Pane 2's last part, the things he has built: `projectsHead` is its heading
// and the few words beside it. `projects` is in the
// order he sets: `tag` is a short stamp, `kicker` says what the
// thing is in a few words (no period), and `story` is a short paragraph with
// the person or the reason behind it.
export const projectsHead = {
  heading: "Things I’ve built",
  note: "I like building small tools for people I know.",
};

export const projects = [
  {
    title: "puzzlewithme",
    href: "https://github.com/jlui17/puzzlewithme",
    tag: "Made for us",
    kicker: "Self-hosted online jigsaw puzzles",
    story:
      "My girlfriend and I are long distance now, and online jigsaw puzzles became one of the things we do together. We wanted puzzles made from our own photos, so I built a version where I know exactly what happens to them. My friends play on it too.",
  },
  {
    title: "mdnote",
    href: "https://github.com/jlui17/mdnote",
    tag: "Notes for my agents",
    kicker: "Markdown viewer + annotations",
    story:
      "I used to tell my coding agent things like “in the third paragraph, change this.” Now I highlight the words, leave a note, and send it to my agent. It’s inspired by hunk.",
  },
  {
    title: "slk",
    href: "https://github.com/jlui17/slk",
    tag: "My own Slack",
    kicker: "Slack TUI + Herdr",
    story:
      "It started as someone else’s open-source project. I made it a lot faster and connected it to the tools I use to run my AI coding agents.",
  },
  {
    title: "VLMPrototype",
    href: "https://github.com/jlui17/VLMPrototype",
    tag: "Video + AI",
    kicker: "Ask questions about a video in plain English",
    story:
      "I left a system design interview wanting to try the idea myself.",
  },
  {
    title: "w2fhr",
    href: "https://github.com/jlui17/w2fhr",
    tag: "Richmond Night Market",
    kicker: "Scheduling, payroll, and onboarding in one place",
    story:
      "I built the software I wished we had when I was an assistant manager at the night market. It still runs every season and saves the team a couple grand a month.",
  },
  {
    title: "LetMeInUBC-2.0",
    href: "https://github.com/jlui17/LetMeInUBC-2.0",
    tag: "Special delivery: a seat",
    kicker: "Email alerts when a UBC class has open seats",
    story:
      "My friend Kelvin had a script that signed him up when a class opened up. We hosted it for other people and switched it to email alerts, so nobody had to give us their school password. It helped my friends get into the classes they wanted.",
  },
];

// How each section introduces itself to a reader who only skims, in plain
// words: `title` names it, `hook` is the short first line of the open pane,
// and `more` is an optional quieter line under it. `trailer` (its card's line)
// and `invite` (the card's way in) show nowhere since the card column went on
// 2026-10-09. The job of each is in AGENTS.md under Voice.
// `agents` has no hook: pane 2 opens on the robots' names. Keyed by section.
export const sections = {
  intro: {
    title: "Hi, I’m Justin.",
    trailer: "I build AI simulations for work and automate way too much for fun.",
    hook: "I’m a founding engineer in San Francisco. At Scorecard, I build simulations where AI agents practice real-world tasks.",
    invite: "Learn more about me",
  },
  // what he is up to these days, then his future plans, in one pane
  now: {
    title: "Now and later",
    trailer: "Silly AI experiments, Japanese workbooks, and a lot of Trader Joe’s.",
    hook: "Since moving to San Francisco, I’ve been a lot more ambitious.",
    invite: "See what I’m up to",
  },
  people: {
    title: "My people",
    trailer: "My parents, my little sister, my girlfriend, and a French Bulldog named Truffle.",
    hook: "These are the people I love the most.",
    invite: "Meet them",
  },
  // his agents, their side quests and the things he has built, in one pane
  agents: {
    title: "Projects & Agents",
    trailer: "I have two OpenClaw agents running around.",
    invite: "Meet luibot and luibuilder",
  },
};
