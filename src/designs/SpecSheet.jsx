import { useEffect, useState } from "react";
import "./spec-sheet.css";

const status = {
  updated: "2026-07-18",
  entries: [
    {
      label: "Watching",
      value: "One Piece",
      detail: "Episode 1070 is my favourite.",
    },
    {
      label: "Brewing",
      value: "Espresso at home",
      detail: "Breville Bambino Plus with a Baratza Encore. Dialing it in.",
    },
    {
      label: "Cooking",
      value: "My girlfriend's cookbook",
      detail: "Handwritten, cover to cover. She's the best.",
    },
  ],
};

const now = [
  "Trying cafés around SF",
  "Going out to eat and checking out festivals with friends",
  "Working out at my apartment gym",
  "Building random side quests",
  "Starting a Palworld server with my friends",
];

const people = [
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

const projects = [
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

function SFClock() {
  const [time, setTime] = useState(null);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour12: false,
          timeZone: "America/Los_Angeles",
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="spec-sheet__clock" aria-label="Current time in San Francisco">
      SF {time ?? "--:--:--"}
    </span>
  );
}

export default function SpecSheet() {
  return (
    <div className="spec-sheet">
      <main className="spec-sheet__page">
        <header className="spec-sheet__masthead">
          <div className="spec-sheet__masthead-name">
            <strong>Justin Lui</strong>
            <span className="spec-sheet__label">pronounced loo-wee</span>
          </div>
          <nav className="spec-sheet__masthead-nav" aria-label="Find Justin online">
            <a href="https://github.com/jlui17" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/jlui17" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <SFClock />
          </nav>
        </header>

        <section className="spec-sheet__hero">
          <div className="spec-sheet__hero-intro">
            <h1>Hi, I&rsquo;m Lui.</h1>
            <p>
              If there&rsquo;s something you should know about me, it&rsquo;s that I can nerd out
              over niche details for hours. Steph Curry&rsquo;s footwork, dialing in espresso,
              programming, or the right way to peek a specific angle in Valorant. Once
              I&rsquo;m interested, I&rsquo;ll obsess over the details and talk about them way
              longer than I meant to.
            </p>
            <p>
              For work, I&rsquo;m at{" "}
              <a
                className="spec-sheet__prose-link"
                href="https://www.scorecard.io/"
                target="_blank"
                rel="noreferrer"
              >
                Scorecard
              </a>
              , where I work across product and engineering and try a bunch of ideas to
              see what lands.
            </p>
          </div>

          <figure className="spec-sheet__figure">
            <img
              src="/images/justin-girlfriend-dog.jpeg"
              alt="Justin and his girlfriend taking a selfie with a sleepy dog"
            />
            <figcaption className="spec-sheet__label">fig. 01 — the three of us</figcaption>
            <dl className="spec-sheet__facts">
              <div>
                <dt className="spec-sheet__label">Currently in</dt>
                <dd>San Francisco</dd>
              </div>
              <div>
                <dt className="spec-sheet__label">Working at</dt>
                <dd>Scorecard</dd>
              </div>
              <div>
                <dt className="spec-sheet__label">Originally from</dt>
                <dd>Vancouver</dd>
              </div>
            </dl>
          </figure>
        </section>

        <section className="spec-sheet__status" aria-label="Current status">
          <div className="spec-sheet__status-head">
            <span className="spec-sheet__label">Status</span>
            <span className="spec-sheet__label">updated {status.updated}</span>
          </div>
          <div className="spec-sheet__status-rows">
            {status.entries.map((entry) => (
              <div key={entry.label}>
                <span className="spec-sheet__label">{entry.label}</span>
                <strong>{entry.value}</strong>
                <span>{entry.detail}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="spec-sheet__section" aria-labelledby="now-heading">
          <div className="spec-sheet__section-head">
            <span className="spec-sheet__label">01</span>
            <h2 id="now-heading">What I&rsquo;m up to</h2>
          </div>
          <div className="spec-sheet__now">
            <ul className="spec-sheet__now-list">
              {now.map((item, i) => (
                <li key={item}>
                  <span className="spec-sheet__label">{String(i + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ul>
            <aside className="spec-sheet__aside">
              <span className="spec-sheet__label">One random thing</span>
              <p>
                I&rsquo;m terrible at geography but weirdly good at directions. I can
                navigate you anywhere, but don&rsquo;t ask me what country we&rsquo;re in.
              </p>
            </aside>
          </div>
        </section>

        <section className="spec-sheet__section" aria-labelledby="people-heading">
          <div className="spec-sheet__section-head">
            <span className="spec-sheet__label">02</span>
            <h2 id="people-heading">The best people in my life</h2>
          </div>
          <div className="spec-sheet__people">
            {people.map((person) => (
              <article
                key={person.name}
                className={person.girlfriend ? "spec-sheet__person--girlfriend" : undefined}
              >
                <div>
                  <span className="spec-sheet__label">{person.name}</span>
                  <span className="spec-sheet__label">{person.tag}</span>
                </div>
                <h3>{person.heading}</h3>
                <p>{person.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="spec-sheet__section" aria-labelledby="projects-heading">
          <div className="spec-sheet__section-head">
            <span className="spec-sheet__label">03</span>
            <h2 id="projects-heading">Things I&rsquo;ve built</h2>
          </div>
          <ul className="spec-sheet__projects">
            {projects.map((project) => (
              <li className="spec-sheet__project" key={project.title}>
                <span className="spec-sheet__label">no. {project.number}</span>
                <div>
                  <div className="spec-sheet__project-meta">
                    <h3>
                      <a href={project.href} target="_blank" rel="noreferrer">
                        {project.title}
                      </a>
                    </h3>
                    <span className="spec-sheet__label">{project.tag}</span>
                  </div>
                  <p className="spec-sheet__project-kicker">{project.kicker}</p>
                  <p className="spec-sheet__project-story">{project.story}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <footer className="spec-sheet__footer">
          <span className="spec-sheet__label">That&rsquo;s all for now.</span>
          <span className="spec-sheet__label">Thanks for stopping by.</span>
        </footer>
      </main>
    </div>
  );
}
