import { useEffect, useRef, useState } from "react";
import "./coffee-bag.css";
import { now, people, projects, status } from "../../content";
import { Sprite } from "../../sprites/Sprite.jsx";

// A find wakes for `ms` then rests on its own, so hover, focus and a tap on a
// touch screen all behave the same: something quiet happens, then it's print again.
function useAwake(ms) {
  const [awake, setAwake] = useState(false);
  const timer = useRef();
  const wake = () => {
    clearTimeout(timer.current);
    setAwake(true);
    timer.current = setTimeout(() => setAwake(false), ms);
  };
  const rest = () => {
    clearTimeout(timer.current);
    setAwake(false);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  return { awake, wake, rest };
}

const findProps = ({ wake, rest }) => ({
  onPointerEnter: wake,
  onPointerLeave: rest,
  onFocus: wake,
  onBlur: rest,
  onClick: wake,
  tabIndex: 0,
});

// Typing the episode number anywhere on the page gets a cheer.
function useCheer() {
  const [cheer, setCheer] = useState(false);
  useEffect(() => {
    let typed = "";
    let timer;
    const onKey = (e) => {
      typed = (typed + e.key).slice(-4);
      if (typed !== "1070") return;
      typed = "";
      setCheer(true);
      clearTimeout(timer);
      timer = setTimeout(() => setCheer(false), 1800);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(timer);
    };
  }, []);
  return cheer;
}

function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.6 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

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
    <span className="cb-label cb-clock" aria-label="Current time in San Francisco">
      SF {time ?? "--:--:--"}
    </span>
  );
}

// The roaster's mascot. At rest he is printed in one ink and holds still;
// awake he is in full colour and does whatever the find asks.
function Mascot({ action, awake, scale = 2 }) {
  return (
    <span className={`cb-print ${awake ? "cb-print--awake" : ""}`}>
      <Sprite
        character="justin"
        action={action}
        outfit="overshirt"
        scale={scale}
        frame={awake ? undefined : 0}
      />
    </span>
  );
}

function TastingNotes({ cheer }) {
  const hat = useAwake(2400);
  const sip = useAwake(3000);
  const action = cheer ? "arms-up" : sip.awake ? "sip" : hat.awake ? "hat" : "idle";
  return (
    <section className="cb-tasting" aria-label="Current status">
      <div className="cb-tasting__head">
        <span className="cb-label">Tasting notes</span>
        <span className="cb-stamp" {...findProps(sip)}>
          <span className="cb-label">Roasted on</span>
          <span className="cb-stamp__date">{status.updated}</span>
        </span>
      </div>
      <dl className="cb-tasting__rows">
        {status.entries.map((entry) => (
          <div key={entry.label}>
            <dt className="cb-label">{entry.label}</dt>
            <dd>
              <strong>{entry.value}</strong>
              <span>{entry.detail}</span>
            </dd>
          </div>
        ))}
      </dl>
      <span className="cb-mascot" {...findProps(hat)}>
        <Mascot action={action} awake={cheer || hat.awake || sip.awake} />
      </span>
    </section>
  );
}

function Agents() {
  const agents = useAwake(4000);
  return (
    <span className="cb-agents" {...findProps(agents)}>
      {["luibot", "luibuilder"].map((robot) => (
        <span key={robot} className={`cb-print ${agents.awake ? "cb-print--awake" : ""}`}>
          <Sprite
            character={robot}
            action="idle"
            scale={2}
            frame={agents.awake ? undefined : 0}
          />
        </span>
      ))}
    </span>
  );
}

function EndScene({ cheer }) {
  const ref = useRef(null);
  const reached = useInView(ref);
  const ear = useAwake(1600);
  return (
    <span className="cb-scene" ref={ref} {...findProps(ear)}>
      <Mascot action={cheer ? "arms-up" : "sit"} awake={reached} scale={3} />
      <span className={`cb-print ${reached ? "cb-print--awake" : ""}`}>
        <Sprite
          character="truffle"
          action={ear.awake ? "ear" : "sleep"}
          scale={3}
          flip
          frame={reached ? undefined : 0}
        />
      </span>
    </span>
  );
}

export default function CoffeeBag() {
  const cheer = useCheer();
  return (
    <div className="cb">
      <main className="cb-page">
        <article className="cb-front">
          <span className="cb-valve" aria-hidden="true" />
          <header className="cb-masthead">
            <div className="cb-masthead__name">
              <span className="cb-brand">Justin Lui</span>
              <span className="cb-label">pronounced loo-wee</span>
            </div>
            <nav className="cb-masthead__nav" aria-label="Find Justin online">
              <a href="https://github.com/jlui17" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href="https://www.linkedin.com/in/jlui17" target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <SFClock />
            </nav>
          </header>

          <section className="cb-hero">
            <div className="cb-hero__intro">
              <h1>Hi, I&rsquo;m Lui.</h1>
              <p>
                If there&rsquo;s something you should know about me, it&rsquo;s that I can nerd
                out over niche details for hours. Steph Curry&rsquo;s footwork, dialing in
                espresso, programming, or the right way to peek a specific angle in Valorant.
                Once I&rsquo;m interested, I&rsquo;ll obsess over the details and talk about them
                way longer than I meant to.
              </p>
              <p>
                For work, I&rsquo;m at{" "}
                <a href="https://www.scorecard.io/" target="_blank" rel="noreferrer">
                  Scorecard
                </a>
                , where I work across product and engineering and try a bunch of ideas to see
                what lands.
              </p>
            </div>
            <figure className="cb-figure">
              <img
                src="/images/justin-girlfriend-dog.jpeg"
                alt="Justin and his girlfriend taking a selfie with a sleepy dog"
              />
              <figcaption className="cb-label">fig. 01 — the three of us</figcaption>
            </figure>
          </section>

          <dl className="cb-fields">
            <div>
              <dt className="cb-label">Origin</dt>
              <dd>Vancouver</dd>
            </div>
            <div>
              <dt className="cb-label">Currently</dt>
              <dd>San Francisco</dd>
            </div>
            <div>
              <dt className="cb-label">Working at</dt>
              <dd>Scorecard</dd>
            </div>
          </dl>

          <div className="cb-tear" aria-hidden="true" />

          <TastingNotes cheer={cheer} />
        </article>

        <section className="cb-section" aria-labelledby="now-heading">
          <div className="cb-section__head">
            <span className="cb-label">Process</span>
            <h2 id="now-heading">What I&rsquo;m up to</h2>
          </div>
          <div className="cb-now">
            <ul className="cb-card cb-now__list">
              {now.map((item) => (
                <li key={item}>
                  {item}
                  {item.includes("luibot") && <Agents />}
                </li>
              ))}
            </ul>
            <aside className="cb-card cb-aside">
              <span className="cb-label">One random thing</span>
              <p>
                I&rsquo;m terrible at geography but weirdly good at directions. I can navigate
                you anywhere, but don&rsquo;t ask me what country we&rsquo;re in.
              </p>
            </aside>
          </div>
        </section>

        <section className="cb-section" aria-labelledby="people-heading">
          <div className="cb-section__head">
            <span className="cb-label">The blend</span>
            <h2 id="people-heading">The best people in my life</h2>
          </div>
          <div className="cb-people">
            {people.map((person) => (
              <article
                key={person.name}
                className={`cb-card cb-person ${person.girlfriend ? "cb-card--banded" : ""}`}
              >
                <div className="cb-card__meta">
                  <span className="cb-label">{person.name}</span>
                  <span className="cb-label">{person.tag}</span>
                </div>
                <h3>{person.heading}</h3>
                <p>{person.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cb-section" aria-labelledby="projects-heading">
          <div className="cb-section__head">
            <span className="cb-label">Single lots</span>
            <h2 id="projects-heading">Things I&rsquo;ve built</h2>
          </div>
          <ul className="cb-projects">
            {projects.map((project) => (
              <li className="cb-card cb-project" key={project.title}>
                <div className="cb-card__meta">
                  <span className="cb-label">Lot {project.number}</span>
                  <span className="cb-label cb-tag">{project.tag}</span>
                </div>
                <h3>
                  <a href={project.href} target="_blank" rel="noreferrer">
                    {project.title}
                  </a>
                </h3>
                <p className="cb-project__kicker">{project.kicker}</p>
                <p>{project.story}</p>
              </li>
            ))}
          </ul>
        </section>

        <footer className="cb-card cb-footer">
          <div className="cb-footer__words">
            <span className="cb-label">That&rsquo;s all for now.</span>
            <span className="cb-label">Thanks for stopping by.</span>
          </div>
          <EndScene cheer={cheer} />
          <div className="cb-footer__code" aria-hidden="true">
            <span className="cb-barcode" />
            <span className="cb-label">1070 2017</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
