import { useEffect, useRef, useState } from "react";
import "./evo.css";
import {
  agents,
  facts,
  home,
  intro,
  now,
  people,
  projects,
  someday,
  status,
} from "../../content";
import { characters, Sprite } from "../../sprites/Sprite.jsx";
import ballSheet from "./ball.js";

// ?hour=0..23 pins the SF hour so each time of day can be checked by hand. It
// pins the clock's hour too, so a screenshot stays coherent.
const hourOverride = new URLSearchParams(window.location.search).get("hour");

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The sprite artist is adding these three Justin actions. Each is staged by
// name so the sheet drops in without a code change; until it lands, the
// nearest existing pose stands in.
const staged = (action, fallback) => (action in characters.justin.actions ? action : fallback);
const TYPE = staged("type", "sit");
const PET = staged("pet", "sit");
const CARRY = staged("carry", "idle");

// Canvas of an action, in on-page px at scale 1. Boxes are reserved from it so
// a pose change never moves the text around a sprite.
const canvas = (character, action) => {
  const [rows] = characters[character].actions[action].frames;
  return { width: rows[0].length, height: rows.length };
};

// Inline CSS vars for the box a figure needs, read by the rules that pad text
// away from it and size its ground.
const figureVars = (character, ...actions) => {
  const sizes = actions.map((action) => canvas(character, action));
  return {
    "--evo-figure-w": `${Math.max(...sizes.map((s) => s.width))}px`,
    "--evo-figure-h": `${Math.max(...sizes.map((s) => s.height))}px`,
  };
};

// A sprite reacts while a mouse is over it, while it has keyboard focus, or,
// on a touch screen, after a tap until a tap anywhere else. Returns the state,
// the props to spread on the element (the ref included), and a `release` that
// ends a tap, for when one tappable thing sits inside another.
function useHoverOrTap() {
  const el = useRef(null);
  const pointer = useRef("mouse");
  const [over, setOver] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [focused, setFocused] = useState(false);

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
    over || tapped || focused,
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
      // Keyboard focus only: a mouse click also focuses a button, and that
      // must not hold the reaction after the mouse has left.
      onFocus: (event) => setFocused(event.target.matches(":focus-visible")),
      onBlur: () => setFocused(false),
    },
    () => setTapped(false),
  ];
}

// True while the element is on screen. Looping sprites hold their rest frame
// off screen, so only the figure the reader has reached is moving.
function useOnScreen(ref, threshold = 0) {
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return onScreen;
}

// True once the element has been on screen, and stays true.
function useSeen(ref, threshold) {
  const onScreen = useOnScreen(ref, threshold);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (onScreen) setSeen(true);
  }, [onScreen]);
  return seen;
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

// A looping sprite that only runs while on screen; off screen it holds frame 0.
function Figure({ character, action, outfit, flip, className }) {
  const el = useRef(null);
  const onScreen = useOnScreen(el);

  return (
    <span ref={el} className={`evo__sprite ${className}`} aria-hidden="true">
      <Sprite
        character={character}
        action={action}
        outfit={outfit}
        scale={1}
        flip={flip}
        frame={onScreen ? undefined : 0}
      />
    </span>
  );
}

// Justin stands on the h1's baseline, after his name. The SF hour picks the
// pose: standing through the morning and day, sitting in the evening, asleep
// at night. Hovering, tapping or focusing him tips the hat (not while he
// sleeps); typing 1070 gets both arms up. The box is the largest of his poses
// so the heading never reflows when he changes.
const poseFor = { morning: "idle", day: "idle", evening: "sit", night: "sleep" };

function HeroFigure({ part, outfit, cheering }) {
  const [tipping, props] = useHoverOrTap();
  const asleep = part === "night";
  const action = cheering ? "arms-up" : tipping && !asleep ? "hat" : poseFor[part];

  return (
    <span className="evo__hero-figure" style={figureVars("justin", "idle", "sit", "sleep")}>
      <button
        type="button"
        className="evo__sprite evo__reacts"
        aria-label="Say hi to Justin"
        disabled={asleep}
        {...props}
      >
        <Sprite character="justin" action={action} outfit={outfit} scale={1} />
      </button>
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

// luibot and luibuilder stand on their card's bottom rule, blink now and then,
// and wave and say hi while the pointer (or focus) is on them. luibuilder's
// wave is a hat tip that plays once and holds. Sprite holds the wave's first
// frame under prefers-reduced-motion.
function Robot({ character }) {
  const [over, props] = useHoverOrTap();
  const onScreen = useOnScreen(props.ref);

  return (
    <button
      type="button"
      className="evo__sprite evo__reacts evo__robot"
      aria-label={`Say hi to ${character}`}
      {...props}
    >
      <Sprite
        character={character}
        action={over ? "wave" : "idle"}
        scale={1}
        frame={onScreen ? undefined : 0}
      />
      {over && <span className="evo__label evo__bubble">Hi, I&rsquo;m {character}</span>}
    </button>
  );
}

// The ball's spin is read off its position each animation frame, one turn per
// circumference (10px times pi) of travel, so however the travel eases the
// spin cannot skid or run on, and it turns the other way when the ball rolls
// back. The turns are rounded to a whole number over the travel (within half
// a turn in eleven), so every roll ends on frame 0, the resting frame, with no
// jump at the stop. Under prefers-reduced-motion there is no travel, so no
// spin.
function useRollFrame(ball, rolling, distance) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!rolling || reducedMotion()) return undefined;
    const { length: frames } = ballSheet.actions.roll.frames;
    const turns = Math.round(distance() / (Math.PI * 10));
    const sync = () =>
      setFrame(Math.round((ball.current.offsetLeft / distance()) * turns * frames) % frames);
    let id = requestAnimationFrame(function tick() {
      sync();
      id = requestAnimationFrame(tick);
    });
    return () => {
      cancelAnimationFrame(id);
      sync();
    };
  }, [ball, rolling, distance]);

  return frame;
}

// Truffle sleeps on her card's bottom rule with Justin kneeling behind her,
// petting: both face left, her back under his hand. The cursor entering the
// card lifts one ear; only the cursor on her (or a tap) gets her to sit up. On
// touch a tap on her and a tap on the card are one choice: tapping one drops
// the other, so a second tap on her puts her back to sleep, not to the ear.
// The first time the card scrolls into view a ball rolls up to her nose, and
// she stays asleep. Clicking the ball rolls it away to the card's edge, and
// back again; she ignores it either way.
const BALL_WIDTH = ballSheet.actions.roll.frames[0][0].length;
const TRUFFLE_SLEEP = canvas("truffle", "sleep");
// His hand's tip is 2px in from the pet canvas's leading edge, so her rump
// ends 2px inside his canvas, under the hand; the hand rides above her back.
const PET_REACH = 2;
const BALL_GAP = 8; // the ball stops this short of her nose

function TruffleCard({ person, outfit }) {
  const [near, cardProps, dropEar] = useHoverOrTap();
  const [over, truffleProps, dropSit] = useHoverOrTap();
  const seen = useSeen(cardProps.ref, 0.6);
  const [ballAtTruffle, setBallAtTruffle] = useState(false);
  const [rolling, setRolling] = useState(false);
  const ball = useRef(null);
  const pet = canvas("justin", PET);
  // The ball's run, from the card's left edge to her nose: the same sum as
  // --evo-ball-end in evo.css.
  const distance = () =>
    ball.current.parentElement.clientWidth -
    pet.width +
    PET_REACH -
    TRUFFLE_SLEEP.width -
    BALL_WIDTH -
    BALL_GAP;
  const rollFrame = useRollFrame(ball, rolling, distance);
  const still = reducedMotion();

  const roll = () => {
    setBallAtTruffle((at) => !at);
    if (!still) setRolling(true);
  };

  useEffect(() => {
    if (seen) roll();
  }, [seen]);

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
      <figure
        className="evo__truffle-figure"
        style={{ "--evo-pet-w": `${pet.width}px`, "--evo-pet-reach": `${PET_REACH}px` }}
      >
        <figcaption className="evo__label">
          fig. 02 — {over ? "awake, briefly" : "asleep, as usual"}
        </figcaption>
        <button
          type="button"
          ref={ball}
          className={`evo__sprite evo__reacts evo__ball${ballAtTruffle ? " evo__ball--at-truffle" : ""}`}
          aria-label="Roll the ball"
          disabled={rolling || still}
          onClick={(event) => {
            event.stopPropagation();
            roll();
          }}
          onTransitionEnd={(event) => event.propertyName === "left" && setRolling(false)}
        >
          <Pixels sheet={ballSheet} action="roll" frame={rollFrame} />
        </button>
        <button
          type="button"
          className="evo__sprite evo__reacts evo__truffle"
          aria-label="Wake Truffle"
          {...truffleProps}
          onClick={(event) => {
            event.stopPropagation();
            dropEar();
            truffleProps.onClick(event);
          }}
        >
          <Sprite character="truffle" action={over ? "sit" : near ? "ear" : "sleep"} scale={1} flip />
        </button>
        <Figure character="justin" action={PET} outfit={outfit} flip className="evo__pet-figure" />
      </figure>
    </article>
  );
}

// A walker's frames advance by distance: one frame per `stride` px of travel,
// read off its position each animation frame, so its feet never slide.
function useWalkFrame(el, walking, start, action) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!walking) return undefined;
    const { stride, frames } = action;
    let id = requestAnimationFrame(function tick() {
      setFrame(Math.floor((el.current.offsetLeft - start) / stride) % frames.length);
      id = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(id);
  }, [el, walking, start, action]);

  return frame;
}

// Someone walking along the farm's rule from `start` until the `rest` pose
// stands at `end` (both left offsets), at the pace the sheet gives (stride px
// per frame, interval ms per frame). A rest pose with a narrower canvas is
// centred on where the walking one stopped. Under prefers-reduced-motion they
// are already there.
function Walker({ character, action, rest, outfit, go, start, end }) {
  const el = useRef(null);
  const [arrived, setArrived] = useState(false);
  const sheet = characters[character].actions[action];
  const still = reducedMotion();
  const done = arrived || (go && still);
  const walking = go && !done;
  const frame = useWalkFrame(el, walking, start, sheet);
  const walkEnd =
    end - Math.round((canvas(character, action).width - canvas(character, rest).width) / 2);
  const duration = ((walkEnd - start) / sheet.stride) * sheet.interval;

  return (
    <span
      ref={el}
      className={`evo__sprite evo__walker${walking ? " evo__walker--going" : ""}`}
      style={{
        left: done ? end : go ? walkEnd : start,
        transitionDuration: `${duration}ms`,
      }}
      onTransitionEnd={(event) => event.propertyName === "left" && setArrived(true)}
      aria-hidden="true"
    >
      <Sprite
        character={character}
        action={done ? rest : action}
        outfit={outfit}
        scale={1}
        frame={walking ? frame : done ? undefined : 0}
      />
    </span>
  );
}

// Under the farm: Truffle trots ahead and sits at the far end; Justin walks
// after her and stands beside her. They wait at the left until the ground is
// fully on screen, then set off; the ground's width is read once, then.
const WALK_GAP = 8; // between Justin and Truffle when they arrive

function FarmWalk({ outfit }) {
  const ground = useRef(null);
  const seen = useSeen(ground, 1);
  const [width, setWidth] = useState(0);
  const justin = canvas("justin", "idle");
  const truffle = canvas("truffle", "sit");

  useEffect(() => {
    if (seen) setWidth(ground.current.clientWidth);
  }, [seen]);

  return (
    <div
      ref={ground}
      className="evo__farm-ground"
      style={figureVars("justin", "walk", "idle")}
      aria-hidden="true"
    >
      <Walker
        character="justin"
        action="walk"
        rest="idle"
        outfit={outfit}
        go={width > 0}
        start={0}
        end={width - truffle.width - WALK_GAP - justin.width}
      />
      <Walker
        character="truffle"
        action="trot"
        rest="sit"
        go={width > 0}
        start={justin.width + WALK_GAP}
        end={width - truffle.width}
      />
    </div>
  );
}

export default function SpecSheetEvolved() {
  const hour = useSFHour();
  const part = timeOfDay(hour);
  const outfit = part === "morning" || part === "day" ? "overshirt" : "hoodie";
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
        <header className="evo__masthead">
          <div className="evo__masthead-name">
            <strong>Justin Lui</strong>
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
        </header>

        <section className="evo__hero">
          <div className="evo__hero-intro">
            <h1>
              Hi, I&rsquo;m{" "}
              <span className="evo__nowrap">
                Lui.
                <HeroFigure part={part} outfit={outfit} cheering={cheering} />
              </span>
            </h1>
            {intro.map((paragraph, i) => (
              <p key={i}>
                {paragraph.map((piece, j) =>
                  typeof piece === "string" ? (
                    piece
                  ) : (
                    <a
                      key={j}
                      className="evo__prose-link"
                      href={piece.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {piece.text}
                    </a>
                  ),
                )}
              </p>
            ))}
          </div>

          <figure className="evo__figure">
            <img
              src="/images/justin-girlfriend-dog.jpeg"
              alt="Justin and his girlfriend taking a selfie with a sleepy dog"
            />
            <figcaption className="evo__label">fig. 01 — the three of us</figcaption>
            <dl className="evo__facts">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="evo__label">{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </figure>
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
            <div className="evo__now-side">
              <div className="evo__status" aria-label="Current status">
                <div className="evo__status-head">
                  <span className="evo__label">Status</span>
                  <span className="evo__label">updated {status.updated}</span>
                </div>
                <div className="evo__status-rows">
                  {status.entries.map((entry) =>
                    entry.label === "Brewing" ? (
                      // Justin has his espresso in the entry about it, standing
                      // on the rule below it.
                      <div
                        key={entry.label}
                        className="evo__status-row--brewing"
                        style={figureVars("justin", "sip")}
                      >
                        <span className="evo__label">{entry.label}</span>
                        <strong>{entry.value}</strong>
                        <span>{entry.detail}</span>
                        <Figure
                          character="justin"
                          action="sip"
                          outfit={outfit}
                          className="evo__brewing-figure"
                        />
                      </div>
                    ) : (
                      <div key={entry.label}>
                        <span className="evo__label">{entry.label}</span>
                        <strong>{entry.value}</strong>
                        <span>{entry.detail}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <aside className="evo__aside">
                <span className="evo__label">One random thing</span>
                <p>
                  I&rsquo;m terrible at geography but weirdly good at directions. I can
                  navigate you anywhere, but don&rsquo;t ask me what country we&rsquo;re in.
                </p>
              </aside>
            </div>
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
                <TruffleCard key={person.name} person={person} outfit={outfit} />
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
          <div className="evo__section-head evo__section-head--desk" style={figureVars("justin", TYPE)}>
            <span className="evo__label">03</span>
            <h2 id="projects-heading">Things I&rsquo;ve built</h2>
            {/* Justin at his desk, on the rule under the heading, typing while
                the reader is here. */}
            <Figure character="justin" action={TYPE} outfit={outfit} className="evo__desk-figure" />
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

        <section className="evo__section" aria-labelledby="agents-heading">
          <div className="evo__section-head">
            <span className="evo__label">04</span>
            <h2 id="agents-heading">My agents</h2>
          </div>
          <div className="evo__agents">
            {agents.map((agent) => (
              <article key={agent.name} className="evo__agent">
                <div>
                  <span className="evo__label">{agent.name}</span>
                  <span className="evo__label">{agent.tag}</span>
                </div>
                <h3>{agent.heading}</h3>
                <span className="evo__label evo__does-label">Does</span>
                <ul className="evo__does">
                  {agent.does.map((job) => (
                    <li key={job}>{job}</li>
                  ))}
                </ul>
                <div className="evo__agent-figure">
                  <Robot character={agent.name} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="evo__section" aria-labelledby="home-heading">
          <div className="evo__section-head">
            <span className="evo__label">05</span>
            <h2 id="home-heading">Around my place</h2>
          </div>
          <ul className="evo__home">
            {home.map((spot) =>
              spot.tag === "The shoes" ? (
                // Justin carrying two shoeboxes, at the end of the shoes row.
                <li key={spot.tag} className="evo__home-row--shoes" style={figureVars("justin", CARRY)}>
                  <span className="evo__label">{spot.tag}</span>
                  <h3>{spot.heading}</h3>
                  <p>{spot.body}</p>
                  <Figure character="justin" action={CARRY} outfit={outfit} className="evo__home-figure" />
                </li>
              ) : (
                <li key={spot.tag}>
                  <span className="evo__label">{spot.tag}</span>
                  <h3>{spot.heading}</h3>
                  <p>{spot.body}</p>
                </li>
              ),
            )}
          </ul>
        </section>

        <section className="evo__section" aria-labelledby="someday-heading">
          <div className="evo__section-head">
            <span className="evo__label">06</span>
            <h2 id="someday-heading">Someday</h2>
          </div>
          <div className="evo__someday">
            {someday.map((wish) => (
              <article
                key={wish.tag}
                className={`evo__wish${wish.tag === "The farm" ? " evo__wish--farm" : ""}`}
              >
                <span className="evo__label">{wish.tag}</span>
                <h3>{wish.heading}</h3>
                <p>{wish.body}</p>
                {wish.tag === "The farm" && <FarmWalk outfit={outfit} />}
              </article>
            ))}
          </div>
        </section>

        <footer className="evo__footer">
          {/* Justin and Truffle on the closing rule: sitting by day, asleep at
              night. Anchored bottom-left in a box the size of the wider pair. */}
          <span
            className="evo__sprite evo__footer-figure"
            style={{
              "--evo-figure-w": `${
                Math.max(
                  canvas("justin", "sit").width + 10 + canvas("truffle", "sit").width,
                  canvas("justin", "sleep").width + 10 + canvas("truffle", "sleep").width,
                )
              }px`,
            }}
            aria-hidden="true"
          >
            <Sprite character="justin" action={part === "night" ? "sleep" : "sit"} outfit={outfit} scale={1} />
            <Sprite character="truffle" action={part === "night" ? "sleep" : "sit"} scale={1} />
          </span>
          <span className="evo__label">That&rsquo;s all for now.</span>
          <span className="evo__label">Thanks for stopping by.</span>
        </footer>
      </main>
    </div>
  );
}
