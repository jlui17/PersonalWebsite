// The hello paragraphs under the h1. Each paragraph is an array of parts: a
// string, or { text, href } for a link inside the sentence.
export const intro = [
  [
    "If there’s something you should know about me, it’s that I can nerd out over niche details for hours. Dialing in espresso, custom keyboards, the right pair of shoes, or why episode 1070 of One Piece is my favourite. Once I’m interested, I’ll obsess over the details and talk about them way longer than I meant to.",
  ],
  [
    "For work, I’m at ",
    { text: "Scorecard", href: "https://www.scorecard.io/" },
    ", where I work across product and engineering to build RL environments. I handle the infra, scaling, and simulations. At home I have two agents of my own, luibot and luibuilder, and I keep finding new things to hand them.",
  ],
];

export const facts = [
  { label: "Currently in", value: "San Francisco" },
  { label: "Working at", value: "Scorecard" },
  { label: "Originally from", value: "Vancouver" },
];

// What he is up to right now: eleven things, three of which he has more to say
// about. An entry is { value } or, for the live ones (watching / brewing /
// cooking), { label, value, detail }. Bump `updated` whenever an entry changes:
// a stale date under a live readout defeats it.
export const upTo = {
  updated: "2026-07-18",
  entries: [
    { value: "Just started playing volleyball and tennis in SF" },
    { value: "Trying cafés around SF" },
    { value: "Going out to eat and checking out festivals with friends" },
    { value: "Working out at my apartment gym" },
    {
      label: "Brewing",
      value: "Espresso at home",
      detail: "Breville Bambino Plus with a Baratza Encore. Dialing it in.",
    },
    {
      label: "Watching",
      value: "One Piece",
      detail: "Episode 1070 is my favourite.",
    },
    {
      label: "Cooking",
      value: "My girlfriend's cookbook",
      detail: "Handwritten, cover to cover. She's the best.",
    },
    { value: "Automating my life with my own OpenClaw agents, luibot and luibuilder" },
    { value: "Building random side quests" },
    { value: "Starting a Palworld server with my friends" },
    { value: "Running a lot of experiments with agents at work" },
  ],
};

// Flat views of `upTo` for the designs that read a plain list and a status
// readout: `now` is every plain entry, `status` the live ones with the date.
export const now = upTo.entries.filter((entry) => !entry.label).map((entry) => entry.value);
export const status = {
  updated: upTo.updated,
  entries: upTo.entries.filter((entry) => entry.label),
};

// The one random thing, a footnote under the hero's facts.
export const randomThing =
  "I’m terrible at geography but weirdly good at directions. I can navigate you anywhere, but don’t ask me what country we’re in.";

export const people = [
  {
    name: "My mom",
    tag: "Role model",
    heading: "My role model for hard work and perseverance.",
    body: "She built everything from the ground up. She's detailed, incredibly resilient, and always willing to do the thankless work.",
  },
  {
    name: "My dad",
    tag: "Most dependable",
    heading: "The most dependable and honest person I know.",
    body: "Sometimes a little too honest. I try to be as real with the people I care about as he is, but maybe a bit gentler.",
  },
  {
    name: "Andrea",
    tag: "Little sister · NYC",
    heading: "My little sister was made for New York.",
    body: "I look up to her because she moved to New York, chased what she wanted, and made it happen. She's a huge part of why I finally chased my own dream of working at a startup in San Francisco, and she helped me land at Scorecard.",
  },
  {
    name: "Truffle",
    tag: "Est. 2017",
    heading: "My best friend since 2017.",
    body: "She's my spoiled, squishy, and very sweet French Bulldog.",
  },
  {
    name: "My girlfriend",
    tag: "Best friend",
    heading: "My best friend and the most thoughtful person I know.",
    body: "She makes me kinder, healthier, and better at living on my own. We support each other through work and everything else, and I'm a better person because of her.",
    girlfriend: true,
  },
];

export const agents = [
  {
    name: "luibot",
    tag: "The main one",
    heading: "The agent I talk to most, about almost everything.",
    body: "luibot does my research. He sorts every transaction into my own categories as it comes in, so my budget ends up in a Google Sheet with a report at the end. He orders my DoorDash and is learning what I like. He also helps me think through investments and triages my email.",
    does: [
      "Research",
      "Sorting my transactions into my own categories, into a Google Sheet",
      "Ordering my DoorDash and learning my preferences",
      "Thinking through investments with me",
      "Triaging my email",
    ],
  },
  {
    name: "luibuilder",
    tag: "Coding agent",
    heading: "I tell him I have an idea, and he goes off and builds it.",
    body: "luibuilder is my coding agent. He built the games my girlfriend and I play together since we're long distance, and he looks after the VPS they run on. Same with my other side projects. It's nice having an agent floating around that I can just hand an idea to.",
    does: [
      "Building my side projects",
      "Building the games my girlfriend and I play",
      "Looking after the VPS they run on",
      "Keeping the games running while we're long distance",
      "Taking an idea and running with it",
    ],
  },
];

// The corners of his place people tend to recognize.
export const home = [
  {
    tag: "The desk",
    heading: "Clean and modern, with a cozy feel.",
    body: "A custom PC, custom keyboards, a nice chair and monitor, and a few One Piece stuffies and knick-knacks keeping me company. It's one of the things people recognize me for.",
  },
  {
    tag: "The shoes",
    heading: "There are a lot of shoes here.",
    body: "I used to be into buying and selling shoes and streetwear. I don't anymore, but the shoes stayed.",
  },
  {
    tag: "The coffee corner",
    heading: "A Breville Bambino Plus and a Baratza Encore.",
    body: "The other thing people recognize me for. I'm still dialing it in, and I'm okay with that.",
  },
];

// Where he hopes life goes.
export const someday = [
  {
    tag: "New York",
    heading: "Live in New York with my girlfriend.",
    body: "My sister Andrea is already there. I want a stretch of my life there too.",
  },
  {
    tag: "Japan",
    heading: "Live in Japan with my girlfriend.",
    body: "I want us to actually live there for a while.",
  },
  {
    tag: "The farm",
    heading: "After tech, a family-run farm with lots of dogs.",
    body: "Cows, chickens, sheep, pigs, and vegetables too. The plan is to spend my days automating every part of it with robots, which is where luibot and luibuilder come in.",
  },
];

export const projects = [
  {
    number: "01",
    title: "puzzlewithme",
    href: "https://github.com/jlui17/puzzlewithme",
    tag: "Made for us",
    kicker: "A jigsaw puzzle app for my girlfriend, my friends, and me.",
    story:
      "My girlfriend and I are long distance now, and online jigsaw puzzles became one of the things we do together. We wanted to make puzzles from personal photos, but we didn't want to upload them somewhere without knowing how they were stored or used. So I built my own version where I know exactly what happens to them.",
  },
  {
    number: "02",
    title: "VLMPrototype",
    href: "https://github.com/jlui17/VLMPrototype",
    tag: "Video + AI",
    kicker: "I left a system design interview wanting to try the idea myself.",
    story:
      "The idea was to upload a video, ask questions about it in plain English, and get answers back. It was mostly a way to learn how video querying with AI could work by building it myself.",
  },
  {
    number: "03",
    title: "w2fhr",
    href: "https://github.com/jlui17/w2fhr",
    tag: "Richmond Night Market",
    kicker: "I built the software I wished we had at the night market.",
    story:
      "When I became an assistant manager at the Richmond Night Market, scheduling, payroll, and onboarding were spread across Excel, Google Sheets, and a few HR apps. I asked my boss if I could build one place for all of it. It still runs every season and saves the team a couple grand a month.",
  },
  {
    number: "04",
    title: "LetMeInUBC-2.0",
    href: "https://github.com/jlui17/LetMeInUBC-2.0",
    tag: "Special delivery: a seat",
    kicker: "A small project that helped my friends get into the classes they wanted.",
    story:
      "My friend Kelvin had a script that registered him when a UBC course opened up. We hosted it so other people could use it, then changed it to email alerts because nobody wants to give a random app their school password. I learned how to keep something running in the cloud, and a few friends got into classes they needed.",
  },
];

// How each section introduces itself to a reader who only skims, in plain
// words: `title` names it, `hook` is the one sentence shown up front, `more`
// is one quieter line under it, `invite` labels the way in to the details.
// Keyed by the export each entry introduces.
export const sections = {
  intro: {
    title: "Hi, I’m Lui.",
    hook: "I’m a founding engineer in San Francisco. I build simulations and evals at Scorecard.",
    more: "I get really into small details, like espresso, keyboards, shoes, and One Piece.",
    invite: "More about me",
  },
  now: {
    title: "What I’m up to",
    hook: "Right now I’m trying new cafés and playing volleyball and tennis.",
    more: "I’m also watching One Piece, making espresso, and cooking from my girlfriend’s cookbook.",
    invite: "See what I’m up to",
  },
  people: {
    title: "My people",
    hook: "These are the people I love the most.",
    more: "My mom, my dad, my sister Andrea, my girlfriend, and my dog Truffle.",
    invite: "Meet them",
  },
  agents: {
    title: "My agents",
    hook: "I have two OpenClaw agents running around.",
    more: "luibot does my research, my budget, and my email. luibuilder builds my side projects.",
    invite: "See what they do",
  },
  home: {
    title: "My place",
    hook: "My place is clean and modern, but cozy.",
    more: "People know me for my desk, my coffee setup, and all my shoes.",
    invite: "Look around",
  },
  someday: {
    title: "My future plans",
    hook: "In the future, I want to live in New York and Japan, and then have a farm.",
    more: "A family farm with lots of dogs, cows, and chickens, where I automate everything with robots.",
    invite: "See the plan",
  },
  projects: {
    title: "Things I’ve built",
    hook: "I like building small tools for people I know.",
    more: "A puzzle app for my girlfriend and me, and tools for my friends and my old job.",
    invite: "See the projects",
  },
};
