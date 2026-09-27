// The hello blocks under the h1: each has a `heading` (the ### that says what
// the block is about; left out where the hook already says it) and a `body`,
// an array of parts: a string, or { text, href } for a link inside the sentence.
export const intro = [
  {
    // no heading: the hook above already says what this block is about
    body: [
      "From coding to research to managing vending machines, I build worlds where AI agents go to complete tasks. The data from those tasks is used to help AI learn and get better. At ",
      { text: "Scorecard", href: "https://www.scorecard.io/" },
      ", I work on both product and engineering. I also build the systems that run the simulations, and I make sure they keep working as they grow.",
    ],
  },
  {
    heading: "I nerd out over small details",
    body: [
      "Once I’m interested in something, I can talk about it for hours, way longer than I meant to. Some of those things are espresso, custom keyboards, and finding the right pair of shoes. I can also tell you why episode 1070 of the anime One Piece is my favourite.",
    ],
  },
  {
    heading: "I automate things that don’t need it",
    body: [
      "I track my budget and have spending reports made for me automatically, but I don’t actually read the reports. I do the same thing in video games. In Minecraft and Palworld, I spend 95% of my time building farms that collect food and resources on their own, so it pays off in the long run. But once everything runs by itself, I get bored and quit. I know it’s overkill. I don’t do it for the result. I do it because I like the challenge of figuring out how the whole system works, and that takes a lot of research into the details.",
    ],
  },
  {
    heading: "Fun fact: I’m terrible at geography but weirdly good at directions",
    body: ["I can navigate you anywhere, but don’t ask me what the capital of a country is or where a city is on a map."],
  },
  {
    heading: "Fun fact: I own a lot of shoes",
    body: ["I used to be into buying and selling shoes and streetwear. I don’t anymore, but the shoes stayed."],
  },
];

export const people = [
  {
    name: "My mom",
    heading: "She’s my role model for hard work and perseverance.",
    body: "She’s an accountant and runs her own business, which she built from the ground up. She’s detailed, incredibly resilient, and always willing to do the thankless work.",
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
    body: "She’s so kind, sweet, and beautiful. She communicates well, and she’s super responsible. Being with her makes me kinder, healthier, and more emotionally aware. We support each other through work and everything else, and I’m a better person because of her.",
    girlfriend: true,
  },
];

export const agents = [
  {
    name: "luibot",
    tag: "The main one",
    heading: "I talk to him the most, about almost everything.",
    body: "He orders my food on DoorDash, and he’s learning what I like.",
    does: [
      "Doing my research",
      "Tracking my spending and making budget reports",
      "Thinking through investments with me",
      "Sorting through my email",
    ],
  },
  {
    name: "luibuilder",
    tag: "Coding agent",
    heading: "I tell him I have an idea, and he goes off and builds it.",
    body: "He’s my systems thinker, with a different way of thinking and a different personality from luibot.",
    // the pathway's idea beat points at the line that says "idea"
    does: ["Turning my ideas into side projects", "Building puzzlewithme, an online puzzle game my GF and I play together"],
  },
];

// The story of the two agents, told under their columns in pane 3: each block
// has a `heading` (the ### over it) and a `body`, like the hello blocks.
export const agentStory = [
  {
    heading: "I started with one agent and ended up with two",
    body: "I’ve always been into automation and making my life easier. OpenClaw lets you run your own AI agents, and when it came out, I saw all the cool things people were doing with it. So I rented a server and set up luibot. As I built more things, my projects needed their own kind of thinking, so I set up luibuilder for them.",
  },
  {
    heading: "I named them after my high school nickname",
    body: "My friends from high school called me Lui, so luibot means he’s my personal bot. He’s snarky, fun, and playful, and he likes to jump in and help without being asked. luibuilder got his name the same way, with “builder” because he codes and builds my projects. He’s pragmatic and straightforward.",
  },
  {
    heading: "I hand them jobs, mostly over Discord",
    body: "They work together. Anything that needs to know about me personally goes to luibot, and anything about coding or building goes to luibuilder. I started out talking to them on Discord, and I still do for quick things. For longer and deeper tasks, I use the OpenClaw web app, which has gotten so much better lately.",
  },
];

// Pane 3's third part: the things Justin wants his agents to do next, one
// line each, in the order he adds them. He keeps this list up to date as he
// builds with them; a line that is done moves into that agent's `does`.
export const agentRoadmap = {
  heading: "Future side quests",
  // the few words beside the heading that say what the list is
  note: "Ideas I plan to build with them",
  items: [
    { agent: "luibot", task: "Finding the trends in my monthly spending reports" },
    { agent: "luibot", task: "Writing reports on my investments" },
    { agent: "luibuilder", task: "Doing some robotics experiments with me" },
    { agent: "luibuilder", task: "Designing parts for a 3D printer I want to get, for those robotics experiments" },
  ],
};

// Pane 5, what he is up to these days: a small status sign (`status`, the
// things that change month to month, dated by `updated`: bump it whenever a
// line changes), the story under it (`blocks`, like the hello blocks) and a
// normal week (`week`).
export const lately = {
  updated: "2026-09-26",
  status: [
    { label: "Learning", value: "Japanese, with workbooks" },
    { label: "Building", value: "mdnote, puzzlewithme, and slk" },
    { label: "Saving up for", value: "A Varia VS6 espresso grinder" },
  ],
  blocks: [
    {
      heading: "I’m doing things I never would have in Vancouver",
      body: [
        "I’m surrounded by people who think up the same silly experiments I do, so now we actually build them together. I put a lot more time and money into them than I would have back home. Even when a project seems hard, I just go do it. This is exactly what I came to San Francisco for.",
      ],
    },
    {
      heading: "I’m training a Pokémon AI with my coworkers",
      body: [
        "We’re running an AI agent that gets better at competitive Pokémon on its own, and you can ",
        { text: "follow along here", href: "https://pokemon-viewer-production.up.railway.app/stats" },
        ". We’ve also talked about hooking up cameras and sensors so an agent can manage our office snack cabinet, and about agents that water our plants using moisture sensors. They’re silly and unnecessary, but they’re fun.",
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
          "Go to work and build things with my coworkers",
          "Pick up groceries from the Trader Joe’s nearby",
          "Cook dinner",
          "Talk with my girlfriend for the rest of the night",
          "Work on side projects late into the night",
          "Get dinner with friends one night a week",
        ],
      },
      {
        label: "Weekends",
        items: [
          "Explore the city with friends",
          "Head out to places like San Mateo for good Chinese food",
          "Get dinner with friends again",
          "Save one day for a date with my girlfriend",
        ],
      },
    ],
  },
};

// Where he hopes life goes. Each heading finishes the pane's hook, "In the
// future, I want to…", so it starts with a verb and no "I want to". `tag` is
// the place's name on its sign: where it appears word for word in the heading,
// the place's picture sits inside the sentence there; otherwise beside it.
export const someday = [
  {
    tag: "New York",
    heading: "Live in New York with my girlfriend.",
    body: "New York has so much history and culture, and it has everything you could ask for. People there are hustlers, and they’re straightforward and honest. I’d rather people be genuine than polite. There are also so many opportunities there, and getting around is easy, which really matters to me. It’s also nice that my sister Andrea is already there.",
  },
  {
    tag: "Japan",
    heading: "Live in Japan with my girlfriend.",
    body: "My girlfriend is from Japan, and I love Japanese food and culture. The country has so much to offer, so I don’t want it to be just a trip. I want us to stay there for a while.",
  },
  {
    tag: "The farm",
    heading: "Start a family farm with all kinds of animals.",
    body: "I’ve always been an animal person, so I want to be surrounded by dogs, cows, chickens, sheep, and pigs. I’m from Vancouver, where there’s so much nature, so I’ve always loved the outdoors. My girlfriend really wants a farm too, so she can grow fresh vegetables, fruits, and flowers. And ever since I spent endless hours in Minecraft as a kid, I’ve been drawn to farming and automation problems. I plan to spend my days automating every part of the farm with robots, which is where luibot and luibuilder come in. It doesn’t have to wait until I’m done with tech, either. I might work remotely and live on the farm, or I might work in farming tech, and I’d like to do both.",
  },
];

export const projects = [
  {
    title: "puzzlewithme",
    href: "https://github.com/jlui17/puzzlewithme",
    tag: "Made for us",
    kicker: "A jigsaw puzzle app for my girlfriend, my friends, and me.",
    story:
      "My girlfriend and I are long distance now, and online jigsaw puzzles became one of the things we do together. We wanted to make puzzles from personal photos, but we didn’t want to upload them somewhere without knowing how they were stored or used. So I built my own version where I know exactly what happens to them.",
  },
  {
    title: "mdnote",
    href: "https://github.com/jlui17/mdnote",
    tag: "Notes for my agents",
    kicker: "I highlight what I want changed, and my coding agent changes it.",
    story:
      "When I work on a document with a coding agent, I used to type directions like “in the third paragraph, change this.” With mdnote, I highlight the exact words in the document and leave a note. The agent reads my notes and makes the edits.",
  },
  {
    title: "slk",
    href: "https://github.com/jlui17/slk",
    tag: "My own Slack",
    kicker: "I took a Slack app that runs in the terminal and made it my own.",
    story:
      "slk started as someone else’s open-source project. I made it a lot faster, customized it to the way I work, and connected it to the tools I use to run my AI coding agents.",
  },
  {
    title: "VLMPrototype",
    href: "https://github.com/jlui17/VLMPrototype",
    tag: "Video + AI",
    kicker: "I left a system design interview wanting to try the idea myself.",
    story:
      "The idea was to upload a video, ask questions about it in plain English, and get answers back. It was mostly a way to learn how video querying with AI could work by building it myself.",
  },
  {
    title: "w2fhr",
    href: "https://github.com/jlui17/w2fhr",
    tag: "Richmond Night Market",
    kicker: "I built the software I wished we had at the night market.",
    story:
      "When I became an assistant manager at the Richmond Night Market, scheduling, payroll, and onboarding were spread across Excel, Google Sheets, and a few HR apps. I asked my boss if I could build one place for all of it. It still runs every season and saves the team a couple grand a month.",
  },
  {
    title: "LetMeInUBC-2.0",
    href: "https://github.com/jlui17/LetMeInUBC-2.0",
    tag: "Special delivery: a seat",
    kicker: "A small project that helped my friends get into the classes they wanted.",
    story:
      "My friend Kelvin had a script that registered him when a UBC course opened up. We hosted it so other people could use it, then changed it to email alerts because nobody wants to give a random app their school password. I learned how to keep something running in the cloud, and a few friends got into classes they needed.",
  },
];

// How each section introduces itself to a reader who only skims, in plain
// words: `title` names it, `trailer` is its card's line, `invite` labels the
// way in, `hook` is the short first line of the open pane, and `more` is an
// optional quieter line under it. The job of each is in AGENTS.md under Voice.
// `projects` has no `trailer` yet, so its card shows its hook. Keyed by section.
export const sections = {
  intro: {
    title: "Hi, I’m Justin.",
    trailer: "I build AI simulations for work and automate way too much for fun.",
    hook: "I’m a founding engineer in San Francisco. At Scorecard, I build simulations where AI agents practice real-world tasks.",
    invite: "Learn more about me",
  },
  now: {
    title: "What I’m up to",
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
  agents: {
    title: "My agents",
    trailer: "I have two OpenClaw agents running around.",
    hook: "Meet my AI agents.",
    invite: "Meet luibot and luibuilder",
  },
  someday: {
    title: "My future plans",
    trailer: "I hope to see New York, Japan, and one day my own farm.",
    hook: "In the future, I want to…",
    invite: "See the plan",
  },
  projects: {
    title: "Things I’ve built",
    hook: "I like building small tools for people I know.",
    more: "A puzzle app for my girlfriend and me, and tools for my friends and my old job.",
    invite: "See the projects",
  },
};
