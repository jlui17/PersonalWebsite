import { useEffect, useRef, useState } from "react";
import "./day-in-sf.css";
import { now, people, projects, status } from "../../content";
import { day, partAt } from "./day.js";
import Stage from "./Stage.jsx";

const hourParam = new URLSearchParams(window.location.search).get("hour");

// San Francisco's wall clock, as a Date whose local fields are SF's. `?hour=N`
// swaps in that hour so the "right now" marker can be checked by hand.
function sfNow() {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  if (hourParam !== null) d.setHours(Number(hourParam));
  return d;
}

const partNow = () => {
  const d = sfNow();
  return partAt(d.getHours() + d.getMinutes() / 60);
};

// The `now` items, each at the hour it happens. Indices into content.now.
const lately = {
  work: [6, 7],
  lunch: [0, 1],
  quests: [3],
  sport: [5, 2],
  onepiece: [4],
};

const entry = (label) => status.entries.find((e) => e.label === label);

function Clock({ onPart }) {
  const [time, setTime] = useState(null);

  useEffect(() => {
    const tick = () => {
      setTime(sfNow().toLocaleTimeString("en-US", { hourCycle: "h23" }));
      onPart(partNow());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [onPart]);

  return (
    <span className="dsf-clock" aria-label="Current time in San Francisco">
      SF {time ?? "--:--:--"}
    </span>
  );
}

function Part({ part, here, className, children }) {
  return (
    <section
      className={className ? `dsf-part ${className}` : "dsf-part"}
      data-day={part.id}
      aria-label={`${part.time}, ${part.caption}`}
    >
      <div className="dsf-when">
        <time className="dsf-time" dateTime={part.time}>
          {part.time}
        </time>
        <p className="dsf-caption">{part.caption}</p>
        {here && <p className="dsf-here">SF is here right now</p>}
      </div>
      <div className="dsf-body">{children}</div>
    </section>
  );
}

function Readout({ label }) {
  const e = entry(label);
  return (
    <div className="dsf-readout">
      <span className="dsf-label dsf-label--accent">{e.label}</span>
      <h2>{e.value}</h2>
      <p>{e.detail}</p>
      <span className="dsf-label dsf-label--updated">updated {status.updated}</span>
    </div>
  );
}

function Lately({ id }) {
  return (
    <div className="dsf-lately">
      <span className="dsf-label dsf-label--accent">Lately</span>
      <ul>
        {lately[id].map((i) => (
          <li key={i}>{now[i]}</li>
        ))}
      </ul>
    </div>
  );
}

const external = { target: "_blank", rel: "noreferrer" };

export default function DayInSF() {
  const rootRef = useRef(null);
  const [here, setHere] = useState(partNow);

  return (
    <div className="dsf" ref={rootRef} data-light={day[0].light}>
      <div className="dsf-page">
        <header className="dsf-masthead">
          <div className="dsf-name">
            <strong>Justin Lui</strong>
            <span className="dsf-label">pronounced loo-wee</span>
          </div>
          <nav className="dsf-nav" aria-label="Find Justin online">
            <a href="https://github.com/jlui17" {...external}>
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/jlui17" {...external}>
              LinkedIn
            </a>
            <Clock onPart={setHere} />
          </nav>
        </header>

        <Part part={day[0]} here={here === 0} className="dsf-part--hero">
          <div className="dsf-hero">
            <div className="dsf-hero-intro">
              <h1>Hi, I&rsquo;m Lui.</h1>
              <p>
                If there&rsquo;s something you should know about me, it&rsquo;s that I can nerd out
                over niche details for hours. Steph Curry&rsquo;s footwork, dialing in espresso,
                programming, or the right way to peek a specific angle in Valorant. Once
                I&rsquo;m interested, I&rsquo;ll obsess over the details and talk about them way
                longer than I meant to.
              </p>
            </div>
            <figure className="dsf-figure">
              <img
                src="/images/justin-girlfriend-dog.jpeg"
                alt="Justin and his girlfriend taking a selfie with a sleepy dog"
              />
              <figcaption className="dsf-label">fig. 01 — the three of us</figcaption>
              <dl className="dsf-facts">
                <div>
                  <dt className="dsf-label">Currently in</dt>
                  <dd>San Francisco</dd>
                </div>
                <div>
                  <dt className="dsf-label">Working at</dt>
                  <dd>Scorecard</dd>
                </div>
                <div>
                  <dt className="dsf-label">Originally from</dt>
                  <dd>Vancouver</dd>
                </div>
              </dl>
            </figure>
          </div>
        </Part>

        <Part part={day[1]} here={here === 1}>
          <Readout label="Brewing" />
        </Part>

        <Part part={day[2]} here={here === 2}>
          <p className="dsf-prose">
            For work, I&rsquo;m at{" "}
            <a href="https://www.scorecard.io/" {...external}>
              Scorecard
            </a>
            , where I work across product and engineering and try a bunch of ideas to see
            what lands.
          </p>
          <Lately id="work" />
        </Part>

        <Part part={day[3]} here={here === 3}>
          <Lately id="lunch" />
          <aside className="dsf-aside">
            <span className="dsf-label dsf-label--accent">One random thing</span>
            <p>
              I&rsquo;m terrible at geography but weirdly good at directions. I can navigate
              you anywhere, but don&rsquo;t ask me what country we&rsquo;re in.
            </p>
          </aside>
        </Part>

        <Part part={day[4]} here={here === 4}>
          <Lately id="quests" />
          <h2 className="dsf-h2">Things I&rsquo;ve built</h2>
          <ul className="dsf-projects">
            {projects.map((project) => (
              <li className="dsf-project" key={project.title}>
                <span className="dsf-label">{project.number}</span>
                <div>
                  <div className="dsf-project-meta">
                    <h3>
                      <a href={project.href} {...external}>
                        {project.title}
                      </a>
                    </h3>
                    <span className="dsf-label dsf-label--accent">{project.tag}</span>
                  </div>
                  <p className="dsf-kicker">{project.kicker}</p>
                  <p className="dsf-story">{project.story}</p>
                </div>
              </li>
            ))}
          </ul>
        </Part>

        <Part part={day[5]} here={here === 5}>
          <Lately id="sport" />
        </Part>

        <Part part={day[6]} here={here === 6}>
          <Readout label="Cooking" />
        </Part>

        <Part part={day[7]} here={here === 7}>
          <h2 className="dsf-h2">The best people in my life</h2>
          <div className="dsf-people">
            {people.map((person) => (
              <article
                key={person.name}
                className={person.girlfriend ? "dsf-person dsf-person--girlfriend" : "dsf-person"}
              >
                <div className="dsf-person-who">
                  <span className="dsf-label">{person.name}</span>
                  <span className="dsf-label">{person.tag}</span>
                </div>
                <div>
                  <h3>{person.heading}</h3>
                  <p>{person.body}</p>
                </div>
              </article>
            ))}
          </div>
        </Part>

        <Part part={day[8]} here={here === 8}>
          <Readout label="Watching" />
          <Lately id="onepiece" />
        </Part>

        <Part part={day[9]} here={here === 9} className="dsf-part--last">
          <footer className="dsf-footer">
            <span className="dsf-label">That&rsquo;s all for now.</span>
            <span className="dsf-label">Thanks for stopping by.</span>
          </footer>
        </Part>
      </div>

      <Stage rootRef={rootRef} />
    </div>
  );
}
