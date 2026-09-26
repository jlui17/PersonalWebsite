import { useEffect, useState } from "react";
import "./room.css";
import { now, people, projects, status } from "../../content";
import { Room, useMediaQuery } from "./Room.jsx";

const hourOverride = Number(new URLSearchParams(window.location.search).get("hour"));
const HOUR_OVERRIDDEN = Number.isInteger(hourOverride) && hourOverride >= 0 && hourOverride <= 23;

const sfParts = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "America/Los_Angeles",
});

// SF time, re-read every minute. `?hour=N` pins the hour so every phase of the
// room can be checked by hand; the minutes stay real.
function useSFTime() {
  const read = () => {
    const parts = Object.fromEntries(sfParts.formatToParts(new Date()).map((p) => [p.type, p.value]));
    return { hour: HOUR_OVERRIDDEN ? hourOverride : Number(parts.hour), minute: parts.minute };
  };
  const [time, setTime] = useState(read);
  useEffect(() => {
    const id = setInterval(() => setTime(read), 60_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

const clockLabel = ({ hour, minute }) =>
  `${hour % 12 === 0 ? 12 : hour % 12}:${minute} ${hour < 12 ? "am" : "pm"}`;

// Which object in the room each "What I'm up to" line belongs to.
const spotFor = (item) => {
  if (/caf|coffee|espresso/i.test(item)) return "counter:sip";
  if (/volleyball|tennis|gym/i.test(item)) return "door:idle";
  if (/agent|build|server|work/i.test(item)) return "desk:idle";
  return "door:idle";
};

const STATUS_SPOT = { Watching: "bed:sit", Brewing: "counter:sip", Cooking: "counter:idle" };

export default function RoomPage() {
  const time = useSFTime();
  const [target, setTarget] = useState(null);
  const [gesture, setGesture] = useState(null);
  const [truffleHover, setTruffleHover] = useState(false);
  const wide = useMediaQuery("(min-width: 1280px)");
  const hoverless = useMediaQuery("(hover: none)");
  const strip = !useMediaQuery("(min-width: 960px)");
  const followScroll = hoverless || strip;

  const pointAt = (el) => {
    setTarget(el.closest("[data-spot]")?.dataset.spot ?? null);
    setGesture(el.closest("[data-gesture]")?.dataset.gesture ?? null);
    setTruffleHover(Boolean(el.closest("[data-truffle]")));
  };

  // On phones and touch screens there is no hover, so the item in the middle of
  // the screen is the one he answers to.
  useEffect(() => {
    if (!followScroll) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setTarget(hit.target.dataset.spot);
      },
      { rootMargin: "-42% 0px -52% 0px" },
    );
    document.querySelectorAll(".room-page [data-spot]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [followScroll]);

  // Typing his favourite episode number gets both arms up.
  useEffect(() => {
    let typed = "";
    let reset;
    const onKey = (e) => {
      typed = (typed + e.key).slice(-4);
      if (typed !== "1070") return;
      setGesture("arms-up");
      clearTimeout(reset);
      reset = setTimeout(() => setGesture(null), 2500);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(reset);
    };
  }, []);

  return (
    <div
      className="room-page"
      onPointerOver={(e) => pointAt(e.target)}
      onPointerLeave={() => {
        setGesture(null);
        setTruffleHover(false);
      }}
      onFocus={(e) => pointAt(e.target)}
    >
      <header className="room-page__masthead">
        <p className="room-page__name">
          <strong data-gesture="hat">Justin Lui</strong>
          <span className="room-page__small">pronounced loo-wee</span>
        </p>
        <nav className="room-page__nav" aria-label="Find Justin online">
          <a href="https://github.com/jlui17" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/jlui17" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </nav>
      </header>

      <div className="room-page__columns">
        <aside className="room-page__room" aria-label="Justin's room, right now">
          <Room
            hour={time.hour}
            clock={clockLabel(time)}
            target={target}
            gesture={gesture}
            truffleHover={truffleHover}
            scale={wide ? 3 : 2}
            onTruffleHover={setTruffleHover}
            hint={
              followScroll
                ? "Scroll, and he'll go where you are."
                : "Point at something on the page and he'll walk over to it."
            }
          />
        </aside>

        <main className="room-page__reading">
          <section className="room-page__hero">
            <h1>Hi, I&rsquo;m Lui.</h1>
            <p>
              If there&rsquo;s something you should know about me, it&rsquo;s that I can nerd out over niche
              details for hours. Steph Curry&rsquo;s footwork, dialing in espresso, programming, or the right
              way to peek a specific angle in Valorant. Once I&rsquo;m interested, I&rsquo;ll obsess over the
              details and talk about them way longer than I meant to.
            </p>
            <p>
              For work, I&rsquo;m at{" "}
              <a href="https://www.scorecard.io/" target="_blank" rel="noreferrer">
                Scorecard
              </a>
              , where I work across product and engineering and try a bunch of ideas to see what lands.
            </p>
          </section>

          <figure className="room-page__figure" data-spot="bed:sit" data-truffle>
            <img
              src="/images/justin-girlfriend-dog.jpeg"
              alt="Justin and his girlfriend taking a selfie with a sleepy dog"
            />
            <figcaption className="room-page__small">the three of us</figcaption>
            <dl className="room-page__facts">
              <div>
                <dt>Currently in</dt>
                <dd>San Francisco</dd>
              </div>
              <div>
                <dt>Working at</dt>
                <dd>Scorecard</dd>
              </div>
              <div>
                <dt>Originally from</dt>
                <dd>Vancouver</dd>
              </div>
            </dl>
          </figure>

          <section className="room-page__status" aria-labelledby="status-heading">
            <div className="room-page__section-head">
              <h2 id="status-heading">Status</h2>
              <span className="room-page__small">updated {status.updated}</span>
            </div>
            <dl className="room-page__status-rows">
              {status.entries.map((entry) => (
                <div
                  key={entry.label}
                  className="room-page__hit"
                  data-spot={STATUS_SPOT[entry.label]}
                  tabIndex={0}
                >
                  <dt>{entry.label}</dt>
                  <dd>
                    <strong>{entry.value}</strong>
                    <span>{entry.detail}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="room-page__section" aria-labelledby="now-heading">
            <h2 id="now-heading">What I&rsquo;m up to</h2>
            <ul className="room-page__now">
              {now.map((item) => (
                <li key={item} className="room-page__hit" data-spot={spotFor(item)} tabIndex={0}>
                  {item}
                </li>
              ))}
            </ul>
            <aside className="room-page__random room-page__hit" data-spot="door:idle" tabIndex={0}>
              <span className="room-page__small">One random thing</span>
              <p>
                I&rsquo;m terrible at geography but weirdly good at directions. I can navigate you anywhere,
                but don&rsquo;t ask me what country we&rsquo;re in.
              </p>
            </aside>
          </section>

          <section className="room-page__section" aria-labelledby="people-heading" data-spot="bed:sit">
            <h2 id="people-heading">The best people in my life</h2>
            <div className="room-page__people">
              {people.map((person) => (
                <article
                  key={person.name}
                  className={
                    person.girlfriend
                      ? "room-page__person room-page__person--girlfriend"
                      : "room-page__person"
                  }
                  data-truffle={person.name === "Truffle" ? "" : undefined}
                >
                  <p className="room-page__small">
                    <strong>{person.name}</strong>
                    <span>{person.tag}</span>
                  </p>
                  <h3>{person.heading}</h3>
                  <p>{person.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="room-page__section" aria-labelledby="projects-heading" data-spot="desk:idle">
            <h2 id="projects-heading">Things I&rsquo;ve built</h2>
            <ul className="room-page__projects">
              {projects.map((project) => (
                <li key={project.title} className="room-page__project">
                  <p className="room-page__small">
                    <a href={project.href} target="_blank" rel="noreferrer">
                      {project.title}
                    </a>
                    <span>{project.tag}</span>
                  </p>
                  <h3>{project.kicker}</h3>
                  <p>{project.story}</p>
                </li>
              ))}
            </ul>
          </section>

          <footer className="room-page__footer room-page__hit" data-spot="bed:sleep" tabIndex={0}>
            <p>That&rsquo;s all for now. Thanks for stopping by.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
