import { useEffect, useState } from "react";
import "./spec-sheet.css";
import { now, people, projects, status } from "../content";

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
