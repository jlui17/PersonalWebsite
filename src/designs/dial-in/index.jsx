import { useEffect, useState } from "react";
import "./dial-in.css";
import { now, people, projects, status } from "../../content";
import { Sprite } from "../../sprites/Sprite.jsx";
import { GrindDial, LayersFigure, PeekSlider } from "./instruments.jsx";

// One notebook entry: the annotation in the margin column, the entry itself to
// the right of the margin rule.
function Entry({ margin, className, children, ...rest }) {
  return (
    <section className={`di-entry${className ? ` ${className}` : ""}`} {...rest}>
      <div className="di-entry__margin">{margin}</div>
      <div className="di-entry__body">{children}</div>
    </section>
  );
}

// luibot and luibuilder wave and say hi while the pointer is on them.
function Robot({ character }) {
  const [over, setOver] = useState(false);

  return (
    <span
      className="di-sprite di-robot"
      aria-hidden="true"
      onMouseEnter={() => setOver(true)}
      onMouseLeave={() => setOver(false)}
    >
      <Sprite character={character} action={over ? "wave" : "idle"} scale={1} />
      {over && <span className="di-label di-bubble">hi, I&rsquo;m {character}</span>}
    </span>
  );
}

// Truffle sleeps on the bottom rule of her page. The pointer entering the page
// lifts one ear; only the pointer on her gets her to sit up.
function TrufflePage({ person }) {
  const [near, setNear] = useState(false);
  const [over, setOver] = useState(false);

  return (
    <article
      className="di-person di-person--truffle"
      onMouseEnter={() => setNear(true)}
      onMouseLeave={() => setNear(false)}
    >
      <div className="di-person__tags">
        <span className="di-label">{person.name}</span>
        <span className="di-label">{person.tag}</span>
      </div>
      <h3>{person.heading}</h3>
      <p>{person.body}</p>
      <figure className="di-truffle">
        <figcaption className="di-label">
          fig. 02 &mdash; {over ? "awake, for now" : near ? "one ear up" : "asleep on the page"}
        </figcaption>
        <span
          className="di-sprite"
          aria-hidden="true"
          onMouseEnter={() => setOver(true)}
          onMouseLeave={() => setOver(false)}
        >
          <Sprite character="truffle" action={over ? "sit" : near ? "ear" : "sleep"} scale={1} flip />
        </span>
      </figure>
    </article>
  );
}

export default function DialIn() {
  const [outfit, setOutfit] = useState("overshirt");
  const [cheering, setCheering] = useState(false);

  useEffect(() => {
    let typed = "";
    const onKey = (event) => {
      typed = (typed + event.key).slice(-4);
      if (typed === "1070") {
        setCheering(true);
        setTimeout(() => setCheering(false), 1800);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="di">
      <main className="di-page">
        <header className="di-masthead">
          <div className="di-masthead__name">
            <strong>Justin Lui</strong>
            <span className="di-label">notes on what I&rsquo;m dialing in</span>
          </div>
          <nav className="di-masthead__nav" aria-label="Find Justin online">
            <a href="https://github.com/jlui17" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/jlui17" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </nav>
          <LayersFigure outfit={outfit} onChange={setOutfit} cheering={cheering} />
        </header>

        <Entry margin={<span className="di-label">01 &mdash; hello</span>} className="di-entry--hero">
          <div className="di-hero">
            <div className="di-hero__intro">
              <h1>Hi, I&rsquo;m Lui.</h1>
              <p>
                If there&rsquo;s something you should know about me, it&rsquo;s that I can nerd
                out over niche details for hours. Steph Curry&rsquo;s footwork, dialing in
                espresso, programming, or the right way to peek a specific angle in Valorant.
                Once I&rsquo;m interested, I&rsquo;ll obsess over the details and talk about
                them way longer than I meant to.
              </p>
              <p>
                For work, I&rsquo;m at{" "}
                <a className="di-link" href="https://www.scorecard.io/" target="_blank" rel="noreferrer">
                  Scorecard
                </a>
                , where I work across product and engineering and try a bunch of ideas to see
                what lands.
              </p>
            </div>
            <figure className="di-figure">
              <img
                src="/images/justin-girlfriend-dog.jpeg"
                alt="Justin and his girlfriend taking a selfie with a sleepy dog"
              />
              <figcaption className="di-label">fig. 01 &mdash; the three of us</figcaption>
              <dl className="di-facts">
                <div>
                  <dt className="di-label">currently in</dt>
                  <dd>San Francisco</dd>
                </div>
                <div>
                  <dt className="di-label">working at</dt>
                  <dd>Scorecard</dd>
                </div>
                <div>
                  <dt className="di-label">originally from</dt>
                  <dd>Vancouver</dd>
                </div>
              </dl>
            </figure>
          </div>
        </Entry>

        <Entry
          margin={
            <>
              <span className="di-label di-label--pen">currently</span>
              <span className="di-label di-label--pen">dialing in</span>
              <span className="di-label">updated {status.updated}</span>
            </>
          }
          aria-label="Current status"
        >
          <dl className="di-status">
            {status.entries.map((entry) => (
              <div key={entry.label}>
                <dt className="di-label">{entry.label}</dt>
                <dd>
                  <strong>{entry.value}</strong>
                  <span>{entry.detail}</span>
                </dd>
              </div>
            ))}
          </dl>
        </Entry>

        <Entry margin={<span className="di-label">02 &mdash; espresso</span>} aria-labelledby="espresso-heading">
          <h2 id="espresso-heading">Turn the grinder.</h2>
          <p className="di-kicker">
            The Encore has forty settings. Finer runs slower, coarser runs faster, and
            somewhere in the middle it stops tasting like a mistake.
          </p>
          <GrindDial outfit={outfit} cheering={cheering} />
          <p className="di-label di-footnote">
            the shot times are made up for the dial; the real ones change with every bag.
          </p>
        </Entry>

        <Entry margin={<span className="di-label">03 &mdash; in the margins</span>} aria-labelledby="now-heading">
          <h2 id="now-heading">What I&rsquo;m up to</h2>
          <div className="di-now">
            <ol className="di-now__list">
              {now.map((item, i) => (
                <li key={item}>
                  <span className="di-label">{String(i + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ol>
            <aside className="di-aside">
              <span className="di-label">one random thing</span>
              <p>
                I&rsquo;m terrible at geography but weirdly good at directions. I can navigate
                you anywhere, but don&rsquo;t ask me what country we&rsquo;re in.
              </p>
            </aside>
          </div>
        </Entry>

        <Entry margin={<span className="di-label">04 &mdash; the people</span>} aria-labelledby="people-heading">
          <h2 id="people-heading">The best people in my life</h2>
          <div className="di-people">
            {people.map((person) =>
              person.name === "Truffle" ? (
                <TrufflePage key={person.name} person={person} />
              ) : (
                <article
                  key={person.name}
                  className={`di-person${person.girlfriend ? " di-person--girlfriend" : ""}`}
                >
                  <div className="di-person__tags">
                    <span className="di-label">{person.name}</span>
                    <span className="di-label">{person.tag}</span>
                  </div>
                  <h3>
                    <span className="di-highlight">{person.heading}</span>
                  </h3>
                  <p>{person.body}</p>
                </article>
              ),
            )}
          </div>
        </Entry>

        <Entry margin={<span className="di-label">05 &mdash; an angle</span>} aria-labelledby="peek-heading">
          <h2 id="peek-heading">Peek the angle.</h2>
          <p className="di-kicker">
            In Valorant there&rsquo;s a right way to peek a specific angle. Swing out a little
            at a time and see how much of me shows.
          </p>
          <PeekSlider outfit={outfit} cheering={cheering} />
          <p className="di-label di-footnote">side-on, not to scale, no map in particular.</p>
        </Entry>

        <Entry margin={<span className="di-label">06 &mdash; finished entries</span>} aria-labelledby="projects-heading">
          <h2 id="projects-heading">Things I&rsquo;ve built</h2>
          <ul className="di-projects">
            {projects.map((project) => (
              <li className="di-project" key={project.title}>
                <div className="di-project__meta">
                  <span className="di-label">no. {project.number}</span>
                  <span className="di-label di-label--pen">{project.tag}</span>
                </div>
                <h3>
                  <a href={project.href} target="_blank" rel="noreferrer">
                    {project.title}
                  </a>
                </h3>
                <p className="di-project__kicker">{project.kicker}</p>
                <p className="di-project__story">{project.story}</p>
              </li>
            ))}
          </ul>
        </Entry>

        <footer className="di-end">
          <span className="di-sprite di-end__figure di-end__figure--left" aria-hidden="true">
            <Sprite character="justin" action="sit" outfit={outfit} scale={1} />
            <Sprite character="truffle" action="sit" scale={1} />
          </span>
          <span className="di-end__figure di-end__figure--right">
            <Robot character="luibot" />
            <Robot character="luibuilder" />
          </span>
          <div className="di-end__lines">
            <span className="di-label">that&rsquo;s the notebook so far. thanks for reading.</span>
            <span className="di-label">luibot and luibuilder, my own OpenClaw agents, say hi.</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
