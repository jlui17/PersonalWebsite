import { useEffect, useRef, useState } from "react";
import "./overworld.css";
import { now, people, projects, status } from "../../content";
import { Map, directions, stops } from "./Map.jsx";

// ?hour=0..23 pins the SF hour so day and night can be checked by hand.
const hourOverride = new URLSearchParams(window.location.search).get("hour");

const sfHour = () =>
  hourOverride !== null
    ? Number(hourOverride)
    : Number(
        new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          hourCycle: "h23",
          timeZone: "America/Los_Angeles",
        }).format(new Date()),
      );

// Two columns (map sticky on the left) from 1200px; below that the map sits on
// top and a strip under it stays on screen while reading.
const twoColumns = () => window.matchMedia("(min-width: 1200px)").matches;
const LOCK_TIMEOUT = 1500; // ms: a picked scroll that never lands gives up the lock
const SCROLL_BEAT = 1100; // ms after a pick below 1200px: he has visibly set off, the page follows

function SFClock({ hour }) {
  const [time, setTime] = useState(null);

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("en-US", { hour12: false, timeZone: "America/Los_Angeles" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const shown = time && `${String(hour).padStart(2, "0")}${time.slice(2, 5)}`;
  return (
    <span className="ow-clock" aria-label="Current time in San Francisco">
      SF {shown ?? "--:--"}
    </span>
  );
}

const SectionHead = ({ index, title, id }) => (
  <div className="ow__section-head">
    <span className="ow-label">
      {String(index + 1).padStart(2, "0")} · {stops[index].name}
    </span>
    <h2 id={id}>{title}</h2>
  </div>
);

export default function Overworld() {
  const [hour, setHour] = useState(sfHour);
  const [current, setCurrent] = useState(0);
  const [cheering, setCheering] = useState(false);
  const mapCol = useRef(null);
  const strip = useRef(null);
  const sections = useRef([]);
  // One source of truth for "where we are": `current`. A pick sets it and
  // scrolls; while that scroll is in flight (`lock`), the scroll reader is
  // ignored, so it cannot walk through every stop on the way. The lock ends
  // when the scroll lands, when the reader takes over (wheel, touch, keys),
  // or after a timeout.
  const lock = useRef(null);
  // Below 1200px the map is not sticky, so a pick made while the map is on
  // screen lets him set off first and scrolls to the section a beat later
  // (`pendingScroll`); he keeps walking and settles on his own. A second tap
  // on the same stop goes at once; a hand scroll cancels the beat, and the
  // picked stop then stands until the reader crosses another section head
  // (`held`), so a nudge does not send him back to Home.
  const pendingScroll = useRef(null);
  const held = useRef(null);
  const currentRef = useRef(current);
  currentRef.current = current;

  const night = hour >= 23 || hour < 6;
  const outfit = hour >= 6 && hour < 18 ? "overshirt" : "hoodie";

  useEffect(() => {
    const id = setInterval(() => setHour(sfHour()), 60_000);
    return () => clearInterval(id);
  }, []);

  const unlock = () => {
    if (!lock.current) return;
    clearTimeout(lock.current.timer);
    lock.current = null;
  };

  // The stop the reader is on: the last section whose head has passed the
  // reading line, 40% down the viewport. At the very bottom it is the last
  // stop, since the end is short.
  const readerAt = () => {
    const line = window.innerHeight * 0.4;
    const atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
    let at = 0;
    sections.current.forEach((el, i) => {
      if (el.getBoundingClientRect().top <= line) at = i;
    });
    return atEnd ? stops.length - 1 : at;
  };

  const cancelBeat = () => {
    if (!pendingScroll.current) return;
    clearTimeout(pendingScroll.current.timer);
    pendingScroll.current = null;
  };

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      if (lock.current) {
        if (Math.abs(window.scrollY - lock.current.top) > 2) return;
        // Landed: the picked stop stands until the reader scrolls again.
        unlock();
        return;
      }
      const at = readerAt();
      if (held.current) {
        if (at === held.current.readerAt) return;
        held.current = null;
      }
      setCurrent(at);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    // The reader taking the wheel ends a pick's lock.
    const onInput = (event) => {
      if (event.type === "keydown" && !["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) return;
      unlock();
      cancelBeat();
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("wheel", onInput, { passive: true });
    window.addEventListener("touchmove", onInput, { passive: true });
    window.addEventListener("keydown", onInput);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("wheel", onInput);
      window.removeEventListener("touchmove", onInput);
      window.removeEventListener("keydown", onInput);
      cancelAnimationFrame(frame);
    };
  }, []);

  const scrollTo = (top) => {
    unlock();
    lock.current = { top, timer: setTimeout(unlock, LOCK_TIMEOUT) };
    window.scrollTo({ top, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const scrollToSection = (i) => {
    held.current = null;
    const offset = twoColumns() ? 32 : strip.current.getBoundingClientRect().height + 16;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollTo(Math.min(max, sections.current[i].getBoundingClientRect().top + window.scrollY - offset));
  };

  const mapOnScreen = () => {
    const r = mapCol.current.getBoundingClientRect();
    return Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0) >= r.height / 2;
  };

  const pick = (i) => {
    const walkFirst =
      !twoColumns() && mapOnScreen() && !window.matchMedia("(prefers-reduced-motion: reduce)").matches && i !== currentRef.current;
    if (pendingScroll.current?.i === i) {
      cancelBeat();
      scrollToSection(i);
      return;
    }
    cancelBeat();
    setCurrent(i);
    if (!walkFirst) {
      scrollToSection(i);
      return;
    }
    held.current = { stop: i, readerAt: readerAt() };
    pendingScroll.current = {
      i,
      timer: setTimeout(() => {
        pendingScroll.current = null;
        scrollToSection(i);
      }, SCROLL_BEAT),
    };
  };

  // The strip's label goes back up to the map.
  const showMap = () => scrollTo(Math.max(0, mapCol.current.getBoundingClientRect().top + window.scrollY - 16));

  // Arrow keys walk to the next or previous stop; typing 1070 gets both arms up.
  useEffect(() => {
    let typed = "";
    const onKey = (event) => {
      if (event.target.closest("input, textarea")) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const c = currentRef.current;
        const next = Math.min(stops.length - 1, Math.max(0, c + (event.key === "ArrowRight" ? 1 : -1)));
        if (next !== c) pick(next);
        return;
      }
      typed = (typed + event.key).slice(-4);
      if (typed === "1070") {
        setCheering(true);
        setTimeout(() => setCheering(false), 1800);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const section = (i) => (el) => {
    sections.current[i] = el;
  };

  return (
    <div className="ow">
      <header className="ow__masthead">
        <div className="ow__name">
          <strong>Justin Lui</strong>
          <span className="ow-label">pronounced loo-wee</span>
        </div>
        <nav className="ow__links" aria-label="Find Justin online">
          <a href="https://github.com/jlui17" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/jlui17" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <SFClock hour={hour} />
        </nav>
      </header>

      <div className="ow__body">
        <div className="ow__map-col" ref={mapCol}>
          <figure className="ow__map-figure">
            <Map current={current} night={night} outfit={outfit} cheering={cheering} onPick={pick} />
            <figcaption>
              <span className="ow__map-directions">{directions[stops[current].id]}</span>
              <span className="ow-label ow__map-note">
                Not to scale. Not anywhere in particular.
                <span className="ow__map-keys"> Tap a stop, or use ← →.</span>
                <span className="ow__map-swipe"> Swipe the map. Tap a stop.</span>
              </span>
            </figcaption>
          </figure>
        </div>

        <main className="ow__reading">
          {/* Where am I, while the map is off screen: the stop, the way there,
              back and forth. Tapping the stop goes back up to the map. */}
          <div className="ow-strip" ref={strip}>
            <button type="button" className="ow-strip__where" onClick={showMap} aria-label={`On the map: ${stops[current].name}. Show the map`}>
              <span className="ow-map__here" />
              <span className="ow-label">
                {String(current + 1).padStart(2, "0")} · {stops[current].name}
              </span>
            </button>
            <span className="ow-strip__directions">{directions[stops[current].id]}</span>
            <span className="ow-strip__keys">
              <button type="button" onClick={() => pick(Math.max(0, current - 1))} disabled={current === 0} aria-label="Previous stop">
                ←
              </button>
              <button type="button" onClick={() => pick(Math.min(stops.length - 1, current + 1))} disabled={current === stops.length - 1} aria-label="Next stop">
                →
              </button>
            </span>
          </div>

          <section className="ow__section ow__section--home" id="home" ref={section(0)} aria-labelledby="home-heading">
            <div className="ow__hero">
              <div>
                <h1 id="home-heading">Hi, I&rsquo;m Lui.</h1>
                <p>
                  If there&rsquo;s something you should know about me, it&rsquo;s that I can nerd out over
                  niche details for hours. Steph Curry&rsquo;s footwork, dialing in espresso, programming,
                  or the right way to peek a specific angle in Valorant. Once I&rsquo;m interested,
                  I&rsquo;ll obsess over the details and talk about them way longer than I meant to.
                </p>
                <p>
                  For work, I&rsquo;m at{" "}
                  <a className="ow__prose-link" href="https://www.scorecard.io/" target="_blank" rel="noreferrer">
                    Scorecard
                  </a>
                  , where I work across product and engineering and try a bunch of ideas to see what
                  lands.
                </p>
              </div>
              <figure className="ow__photo">
                <img
                  src="/images/justin-girlfriend-dog.jpeg"
                  alt="Justin and his girlfriend taking a selfie with a sleepy dog"
                />
                <figcaption className="ow-label">fig. 01 — the three of us</figcaption>
              </figure>
            </div>
            <dl className="ow__facts">
              <div>
                <dt className="ow-label">Currently in</dt>
                <dd>San Francisco</dd>
              </div>
              <div>
                <dt className="ow-label">Working at</dt>
                <dd>Scorecard</dd>
              </div>
              <div>
                <dt className="ow-label">Originally from</dt>
                <dd>Vancouver</dd>
              </div>
            </dl>
          </section>

          <section className="ow__section" id="cafe" ref={section(1)} aria-labelledby="cafe-heading">
            <SectionHead index={1} id="cafe-heading" title="What&rsquo;s true right now" />
            <div className="ow__status">
              {status.entries.map((entry) => (
                <div key={entry.label}>
                  <span className="ow-label">{entry.label}</span>
                  <strong>{entry.value}</strong>
                  <span>{entry.detail}</span>
                </div>
              ))}
            </div>
            <span className="ow-label ow__updated">updated {status.updated}</span>
          </section>

          <section className="ow__section" id="court" ref={section(2)} aria-labelledby="court-heading">
            <SectionHead index={2} id="court-heading" title="What I&rsquo;m up to" />
            <ul className="ow__now">
              {now.map((item, i) => (
                <li key={item}>
                  <span className="ow-label">{String(i + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="ow__section" id="table" ref={section(3)} aria-labelledby="table-heading">
            <SectionHead index={3} id="table-heading" title="The best people in my life" />
            <div className="ow__people">
              {people.map((person) => (
                <article key={person.name} className={person.girlfriend ? "ow__person--girlfriend" : undefined}>
                  <div>
                    <span className="ow-label">{person.name}</span>
                    <span className="ow-label">{person.tag}</span>
                  </div>
                  <h3>{person.heading}</h3>
                  <p>{person.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="ow__section" id="workshop" ref={section(4)} aria-labelledby="workshop-heading">
            <SectionHead index={4} id="workshop-heading" title="Things I&rsquo;ve built" />
            <ul className="ow__projects">
              {projects.map((project) => (
                <li key={project.title}>
                  <div className="ow__project-meta">
                    <h3>
                      <a href={project.href} target="_blank" rel="noreferrer">
                        {project.title}
                      </a>
                    </h3>
                    <span className="ow-label">{project.tag}</span>
                  </div>
                  <p className="ow__project-kicker">{project.kicker}</p>
                  <p className="ow__project-story">{project.story}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="ow__section ow__section--end" id="mountains" ref={section(5)} aria-labelledby="mountains-heading">
            <SectionHead index={5} id="mountains-heading" title="That&rsquo;s all for now." />
            <aside className="ow__aside">
              <span className="ow-label">One random thing</span>
              <p>
                I&rsquo;m terrible at geography but weirdly good at directions. I can navigate you
                anywhere, but don&rsquo;t ask me what country we&rsquo;re in.
              </p>
            </aside>
            <footer className="ow__footer">
              <span className="ow-label">Thanks for stopping by.</span>
              <nav className="ow__links" aria-label="Find Justin online">
                <a href="https://github.com/jlui17" target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <a href="https://www.linkedin.com/in/jlui17" target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </nav>
            </footer>
          </section>
        </main>
      </div>
    </div>
  );
}
