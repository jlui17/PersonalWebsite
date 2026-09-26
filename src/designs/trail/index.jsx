import "./trail.css";
import { now, people, projects, status } from "../../content";
import { Sprite } from "../../sprites/Sprite.jsx";
import { Companions, ELEVATION, formatElevation } from "./Companions.jsx";

// Posted elevations for each marker on the way up. Ordinal: the page climbs.
const posts = {
  trailhead: ELEVATION.trailhead,
  status: 386,
  now: 512,
  people: 704,
  projects: 918,
  summit: ELEVATION.summit,
};

function Post({ elevation, name }) {
  return (
    <div className="trail__post">
      <span className="trail__mono trail__post-elev">{formatElevation(elevation)}</span>
      <span className="trail__mono">{name}</span>
    </div>
  );
}

// The letters are shuffled; the needle points true. Vancouver is almost exactly
// north of San Francisco (bearing 358°), so it sits a hair left of straight up.
function Compass() {
  return (
    <figure className="trail__compass">
      <svg viewBox="0 0 84 84" role="img" aria-label="A compass whose letters are wrong but whose needle points to Vancouver">
        <circle className="trail__compass-ring" cx="42" cy="42" r="34" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            className="trail__compass-tick"
            x1="42"
            y1="9"
            x2="42"
            y2={deg % 90 === 0 ? 14 : 12}
            transform={`rotate(${deg} 42 42)`}
          />
        ))}
        <g className="trail__compass-letters" textAnchor="middle" dominantBaseline="central">
          <text x="42" y="19">W</text>
          <text x="65" y="42">N</text>
          <text x="42" y="65">E</text>
          <text x="19" y="42">S</text>
        </g>
        <g className="trail__compass-needle">
          <polygon points="42,24 45,42 39,42" fill="var(--tr-needle-north)" />
          <polygon points="42,60 45,42 39,42" fill="var(--tr-needle-south)" />
        </g>
        <circle cx="42" cy="42" r="2" fill="var(--tr-ink)" />
      </svg>
      <figcaption className="trail__mono">
        The letters are wrong. The needle isn&rsquo;t: that&rsquo;s Vancouver, about 1,280 km
        north.
      </figcaption>
    </figure>
  );
}

function SummitView() {
  return (
    <svg className="trail__summit-view" viewBox="0 0 640 120" preserveAspectRatio="none" aria-hidden="true">
      <polygon
        points="0,120 0,78 60,52 130,66 210,30 280,58 350,44 430,70 500,50 580,74 640,60 640,120"
        fill="var(--tr-pine-far)"
      />
      <polygon
        points="0,120 0,96 80,74 150,90 230,62 300,84 380,68 470,94 540,80 640,98 640,120"
        fill="var(--tr-pine-mid)"
      />
      <polygon
        points="0,120 0,108 70,100 160,110 240,96 330,108 420,98 520,112 600,104 640,110 640,120"
        fill="var(--tr-pine)"
      />
    </svg>
  );
}

export default function Trail() {
  return (
    <div className="trail">
      <main className="trail__page">
        <header className="trail__masthead">
          <div className="trail__name">
            <span>Justin Lui</span>
            <span className="trail__mono">pronounced loo-wee</span>
          </div>
          <nav className="trail__links" aria-label="Find Justin online">
            <a href="https://github.com/jlui17" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/jlui17" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </nav>
        </header>

        <section className="trail__section" aria-label="Trailhead">
          <Post elevation={posts.trailhead} name="trailhead" />
          <div className="trail__hero">
            <div>
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
            <figure className="trail__figure">
              <img
                src="/images/justin-girlfriend-dog.jpeg"
                alt="Justin and his girlfriend taking a selfie with a sleepy dog"
              />
              <figcaption className="trail__mono">fig. 01, the three of us</figcaption>
              <dl className="trail__facts">
                <div>
                  <dt className="trail__mono">Currently in</dt>
                  <dd>San Francisco</dd>
                </div>
                <div>
                  <dt className="trail__mono">Working at</dt>
                  <dd>Scorecard</dd>
                </div>
                <div>
                  <dt className="trail__mono">Originally from</dt>
                  <dd>Vancouver</dd>
                </div>
              </dl>
            </figure>
          </div>
        </section>

        <section className="trail__section" aria-label="Current status">
          <Post elevation={posts.status} name="right now" />
          <div className="trail__status">
            <div className="trail__status-head">
              <span className="trail__mono">Status</span>
              <span className="trail__mono">updated {status.updated}</span>
            </div>
            <div className="trail__status-rows">
              {status.entries.map((entry) => (
                <div key={entry.label}>
                  <span className="trail__mono">{entry.label}</span>
                  <strong>{entry.value}</strong>
                  <span>{entry.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="trail__section" aria-labelledby="now-heading">
          <Post elevation={posts.now} name="the bend" />
          <div>
            <h2 id="now-heading">What I&rsquo;m up to</h2>
            <div className="trail__now">
              <ul className="trail__now-list">
                {now.map((item) => (
                  <li key={item}>
                    {item}
                    {item.includes("luibot") && (
                      <span className="trail__robots">
                        <Sprite character="luibot" action="idle" scale={2} />
                        <Sprite character="luibuilder" action="idle" scale={2} />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <aside className="trail__aside">
                <span className="trail__mono">One random thing</span>
                <p>
                  I&rsquo;m terrible at geography but weirdly good at directions. I can navigate
                  you anywhere, but don&rsquo;t ask me what country we&rsquo;re in.
                </p>
                <Compass />
              </aside>
            </div>
          </div>
        </section>

        <section className="trail__section" aria-labelledby="people-heading">
          <Post elevation={posts.people} name="warm things" />
          <div>
            <h2 id="people-heading">The best people in my life</h2>
            <div className="trail__people">
              {people.map((person) => (
                <article
                  key={person.name}
                  className={`trail__person${person.girlfriend ? " trail__person--girlfriend" : ""}`}
                >
                  <div className="trail__person-tags">
                    <span className="trail__mono">{person.name}</span>
                    <span className="trail__mono">{person.tag}</span>
                  </div>
                  <h3>{person.heading}</h3>
                  <p>{person.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="trail__section" aria-labelledby="projects-heading">
          <Post elevation={posts.projects} name="switchbacks" />
          <div>
            <h2 id="projects-heading">Things I&rsquo;ve built</h2>
            <ul className="trail__projects">
              {projects.map((project) => (
                <li className="trail__project" key={project.title}>
                  <div className="trail__project-meta">
                    <h3>
                      <a href={project.href} target="_blank" rel="noreferrer">
                        {project.title}
                      </a>
                    </h3>
                    <span className="trail__mono">{project.tag}</span>
                  </div>
                  <p className="trail__project-kicker">{project.kicker}</p>
                  <p className="trail__project-story">{project.story}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <footer className="trail__section trail__summit">
          <Post elevation={posts.summit} name="summit" />
          <div>
            <SummitView />
            <p className="trail__summit-sign">
              That&rsquo;s all for now. Thanks for stopping by.
            </p>
            <div className="trail__summit-note trail__mono">
              <span>Elevations borrowed from the Grouse Grind, back home.</span>
              <span>{formatElevation(ELEVATION.summit - ELEVATION.trailhead)} climbed</span>
            </div>
          </div>
        </footer>
      </main>
      <Companions />
    </div>
  );
}
