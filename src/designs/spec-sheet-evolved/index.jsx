import { useEffect, useRef, useState } from "react";
import "./evo.css";
import { now, people, projects, status } from "../../content";
import { Sprite } from "../../sprites/Sprite.jsx";
import ballSheet from "./ball.js";

// ?hour=0..23 pins the SF hour so each time of day can be checked by hand. It
// pins the clock's hour too, so a screenshot stays coherent.
const hourOverride = new URLSearchParams(window.location.search).get("hour");

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// A sprite reacts while a mouse is over it; on a touch screen a tap toggles it
// and a tap anywhere else ends it. Returns the state, the props to spread on
// the element (the ref included), and a `release` that ends a tap, for when
// one tappable thing sits inside another.
function useHoverOrTap() {
  const el = useRef(null);
  const pointer = useRef("mouse");
  const [over, setOver] = useState(false);
  const [tapped, setTapped] = useState(false);

  useEffect(() => {
    if (!tapped) return undefined;
    // Capture phase, so it runs before the sprite under the finger re-renders
    // and the tapped rect is still in the tree.
    const release = (event) => {
      if (!el.current?.contains(event.target)) setTapped(false);
    };
    document.addEventListener("pointerdown", release, true);
    return () => document.removeEventListener("pointerdown", release, true);
  }, [tapped]);

  const mouse = (event) => event.pointerType === "mouse";
  return [
    over || tapped,
    {
      ref: el,
      onPointerEnter: (event) => mouse(event) && setOver(true),
      onPointerLeave: (event) => mouse(event) && setOver(false),
      onPointerDown: (event) => {
        pointer.current = event.pointerType;
      },
      // Toggle on click, not pointerdown: a scroll that starts on the sprite
      // fires pointerdown but never a click, so a pan is never a tap.
      onClick: () => pointer.current === "mouse" || setTapped((on) => !on),
    },
    () => setTapped(false),
  ];
}

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

const timeOfDay = (hour) =>
  hour >= 23 || hour < 6 ? "night" : hour < 11 ? "morning" : hour < 18 ? "day" : "evening";

function useSFHour() {
  const [hour, setHour] = useState(sfHour);

  useEffect(() => {
    const id = setInterval(() => setHour(sfHour()), 60_000);
    return () => clearInterval(id);
  }, []);

  return hour;
}

function SFClock({ hour }) {
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

  const shown = time && `${String(hour).padStart(2, "0")}${time.slice(2)}`;

  return (
    <span className="evo__clock" aria-label="Current time in San Francisco">
      SF {shown ? shown.slice(0, 5) : "--:--"}
      <span className="evo__clock-seconds">{shown ? shown.slice(5) : ":--"}</span>
    </span>
  );
}

// Justin at the right end of the masthead rule. The SF hour picks his pose and
// layer: espresso in the morning, standing through the day, sitting on the
// rule in the evening, asleep on it at night. Hovering or tapping his name
// tips the hat; typing 1070 gets both arms up.
const poseFor = { morning: "sip", day: "idle", evening: "sit", night: "sleep" };

function MastheadFigure({ part, outfit, tipping, cheering }) {
  const action = cheering
    ? "arms-up"
    : tipping && part !== "night"
      ? "hat"
      : poseFor[part];

  return (
    <span className="evo__sprite evo__masthead-figure" aria-hidden="true">
      <Sprite character="justin" action={action} outfit={outfit} scale={1} />
    </span>
  );
}

function Pixels({ sheet, action, frame = 0 }) {
  const rows = sheet.actions[action].frames[frame];
  return (
    <svg
      width={rows[0].length}
      height={rows.length}
      viewBox={`0 0 ${rows[0].length} ${rows.length}`}
      shapeRendering="crispEdges"
    >
      {rows.flatMap((row, y) =>
        [...row].map(
          (ch, x) =>
            sheet.palette[ch] && (
              <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" fill={sheet.palette[ch]} />
            ),
        ),
      )}
    </svg>
  );
}

// luibot and luibuilder wave and say hi while the pointer is on them. Sprite
// holds the wave's first frame (arm up) under prefers-reduced-motion.
function Robot({ character, className }) {
  const [over, props] = useHoverOrTap();

  return (
    <span className={`evo__sprite evo__reacts ${className}`} aria-hidden="true" {...props}>
      <Sprite character={character} action={over ? "wave" : "idle"} scale={1} />
      {over && <span className="evo__label evo__bubble">Hi, I&rsquo;m {character}</span>}
    </span>
  );
}

// The ball's spin is read off its position each animation frame, one turn per
// circumference (10px times pi) of travel, so however the evo-roll travel
// eases the spin cannot skid or run on. The turns are rounded to a whole
// number over the travel (within half a turn in eleven), so the roll ends on
// frame 0, the resting frame, with no jump at the stop. Under
// prefers-reduced-motion there is no travel, so no spin.
function useRollFrame(ball, rolling) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!rolling || reducedMotion()) return undefined;
    const { length: frames } = ballSheet.actions.roll.frames;
    const distance = ball.current.parentElement.clientWidth - 36 - 10 - 8; // as in evo-roll
    const turns = Math.round(distance / (Math.PI * 10));
    const sync = () =>
      setFrame(Math.round((ball.current.offsetLeft / distance) * turns * frames) % frames);
    let id = requestAnimationFrame(function tick() {
      sync();
      id = requestAnimationFrame(tick);
    });
    const stop = () => {
      cancelAnimationFrame(id);
      sync();
    };
    ball.current.addEventListener("animationend", stop);
    return () => {
      cancelAnimationFrame(id);
      ball.current?.removeEventListener("animationend", stop);
    };
  }, [ball, rolling]);

  return frame;
}

// Truffle sleeps on her card's bottom rule. The cursor entering the card lifts
// one ear; only the cursor on her (or a tap) gets her to sit up. On touch a
// tap on her and a tap on the card are one choice: tapping one drops the
// other, so a second tap on her puts her back to sleep, not to the ear. The
// first time the card scrolls into view a ball rolls up to her nose, and she
// stays asleep.
function TruffleCard({ person }) {
  const [near, cardProps, dropEar] = useHoverOrTap();
  const [over, truffleProps, dropSit] = useHoverOrTap();
  const [ballRolled, setBallRolled] = useState(false);
  const ball = useRef(null);
  const rollFrame = useRollFrame(ball, ballRolled);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setBallRolled(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(cardProps.ref.current);
    return () => observer.disconnect();
  }, [cardProps.ref]);

  return (
    <article
      className="evo__person--truffle"
      {...cardProps}
      onClick={(event) => {
        dropSit();
        cardProps.onClick(event);
      }}
    >
      <div>
        <span className="evo__label">{person.name}</span>
        <span className="evo__label">{person.tag}</span>
      </div>
      <h3>{person.heading}</h3>
      <p>{person.body}</p>
      <figure className="evo__truffle-figure">
        <figcaption className="evo__label">
          fig. 02 — {over ? "awake, briefly" : "asleep, as usual"}
        </figcaption>
        <span
          ref={ball}
          className={`evo__sprite evo__ball${ballRolled ? " evo__ball--rolling" : ""}`}
          aria-hidden="true"
        >
          <Pixels sheet={ballSheet} action="roll" frame={rollFrame} />
        </span>
        <span
          className="evo__sprite evo__reacts"
          aria-hidden="true"
          {...truffleProps}
          onClick={(event) => {
            event.stopPropagation();
            dropEar();
            truffleProps.onClick(event);
          }}
        >
          <Sprite character="truffle" action={over ? "sit" : near ? "ear" : "sleep"} scale={1} flip />
        </span>
      </figure>
    </article>
  );
}

export default function SpecSheetEvolved() {
  const hour = useSFHour();
  const part = timeOfDay(hour);
  const outfit = part === "morning" || part === "day" ? "overshirt" : "hoodie";
  const [tipping, nameProps] = useHoverOrTap();
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
    <div className="evo">
      <main className="evo__page">
        <header className={`evo__masthead evo__masthead--${part}`}>
          <div className="evo__masthead-name">
            <strong className="evo__reacts" {...nameProps}>
              Justin Lui
            </strong>
            <span className="evo__label">pronounced loo-wee</span>
          </div>
          <nav className="evo__masthead-nav" aria-label="Find Justin online">
            <a href="https://github.com/jlui17" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/jlui17" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <SFClock hour={hour} />
          </nav>
          <MastheadFigure part={part} outfit={outfit} tipping={tipping} cheering={cheering} />
        </header>

        <section className="evo__hero">
          <div className="evo__hero-intro">
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
                className="evo__prose-link"
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

          <figure className="evo__figure">
            <img
              src="/images/justin-girlfriend-dog.jpeg"
              alt="Justin and his girlfriend taking a selfie with a sleepy dog"
            />
            <figcaption className="evo__label">fig. 01 — the three of us</figcaption>
            <dl className="evo__facts">
              <div>
                <dt className="evo__label">Currently in</dt>
                <dd>San Francisco</dd>
              </div>
              <div>
                <dt className="evo__label">Working at</dt>
                <dd>Scorecard</dd>
              </div>
              <div>
                <dt className="evo__label">Originally from</dt>
                <dd>Vancouver</dd>
              </div>
            </dl>
          </figure>
        </section>

        <section className="evo__status" aria-label="Current status">
          <div className="evo__status-head">
            <span className="evo__label">Status</span>
            <span className="evo__label evo__updated">
              updated {status.updated}
              <Robot character="luibot" className="evo__luibot" />
            </span>
          </div>
          <div className="evo__status-rows">
            {status.entries.map((entry) => (
              <div key={entry.label}>
                <span className="evo__label">{entry.label}</span>
                <strong>{entry.value}</strong>
                <span>{entry.detail}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="evo__section" aria-labelledby="now-heading">
          <div className="evo__section-head">
            <span className="evo__label">01</span>
            <h2 id="now-heading">What I&rsquo;m up to</h2>
          </div>
          <div className="evo__now">
            <ul className="evo__now-list">
              {now.map((item, i) => (
                <li key={item}>
                  <span className="evo__label">{String(i + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ul>
            <aside className="evo__aside">
              <span className="evo__label">One random thing</span>
              <p>
                I&rsquo;m terrible at geography but weirdly good at directions. I can
                navigate you anywhere, but don&rsquo;t ask me what country we&rsquo;re in.
              </p>
            </aside>
          </div>
        </section>

        <section className="evo__section" aria-labelledby="people-heading">
          <div className="evo__section-head">
            <span className="evo__label">02</span>
            <h2 id="people-heading">The best people in my life</h2>
          </div>
          <div className="evo__people">
            {people.map((person) =>
              person.name === "Truffle" ? (
                <TruffleCard key={person.name} person={person} />
              ) : (
                <article
                  key={person.name}
                  className={person.girlfriend ? "evo__person--girlfriend" : undefined}
                >
                  <div>
                    <span className="evo__label">{person.name}</span>
                    <span className="evo__label">{person.tag}</span>
                  </div>
                  <h3>{person.heading}</h3>
                  <p>{person.body}</p>
                </article>
              ),
            )}
          </div>
        </section>

        <section className="evo__section" aria-labelledby="projects-heading">
          <div className="evo__section-head">
            <span className="evo__label">03</span>
            <h2 id="projects-heading">Things I&rsquo;ve built</h2>
          </div>
          <ul className="evo__projects">
            {projects.map((project) => (
              <li className="evo__project" key={project.title}>
                <span className="evo__label">no. {project.number}</span>
                <div>
                  <div className="evo__project-meta">
                    <h3>
                      <a href={project.href} target="_blank" rel="noreferrer">
                        {project.title}
                      </a>
                    </h3>
                    <span className="evo__label">{project.tag}</span>
                  </div>
                  <p className="evo__project-kicker">{project.kicker}</p>
                  <p className="evo__project-story">{project.story}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <footer className="evo__footer">
          <span className="evo__sprite evo__footer-figure evo__footer-figure--left" aria-hidden="true">
            <Sprite character="justin" action="sit" outfit={outfit} scale={1} />
            <Sprite character="truffle" action="sit" scale={1} />
          </span>
          <Robot character="luibuilder" className="evo__footer-figure evo__footer-figure--right" />
          <span className="evo__label">That&rsquo;s all for now.</span>
          <span className="evo__label">Thanks for stopping by.</span>
        </footer>
      </main>
    </div>
  );
}
