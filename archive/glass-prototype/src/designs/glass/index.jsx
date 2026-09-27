import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import "./glass.css";
import { agents, facts, home, intro, now, people, projects, randomThing, sections, someday, status } from "../../content";
import { moonPhase, periodFor, periods, skyBody, stars } from "./sky.js";
import { Floor, Stage, reducedMotion } from "./stage.jsx";

// A board of Liquid Glass widgets over a sky that follows the San Francisco
// hour. Each widget is one small piece of Justin at rest; the ones with more
// to say grow in place into a glass sheet and shrink back. One pixel Justin
// lives on the board and walks to whichever widget you point at (stage.jsx).
//
// ?hour=0..23 pins the SF hour so every sky can be checked by hand; it pins the
// clock too, so a screenshot stays coherent. ?flat forces the surfaces that a
// browser without backdrop-filter gets, so the fallback can be checked.

const params = new URLSearchParams(window.location.search);
const hourOverride = params.get("hour");
const flat = params.has("flat");

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

function useSFHour() {
  const [hour, setHour] = useState(sfHour);
  useEffect(() => {
    const id = setInterval(() => setHour(sfHour()), 60_000);
    return () => clearInterval(id);
  }, []);
  return hour;
}

const GOOGLE_FONTS =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..700&family=Instrument+Sans:ital,wght@0,400..700;1,400&display=swap";

function useFonts() {
  useEffect(() => {
    if (document.querySelector(`link[href="${GOOGLE_FONTS}"]`)) return undefined;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = GOOGLE_FONTS;
    document.head.appendChild(link);
    return () => link.remove();
  }, []);
}

// The sky's motion (cloud drift, twinkle) pauses after 25s without a pointer,
// key or scroll, and while the tab is hidden: the blurred layers over it then
// stop recompositing for nothing.
function useStill() {
  const [still, setStill] = useState(false);
  useEffect(() => {
    let timer;
    const wake = () => {
      setStill(false);
      clearTimeout(timer);
      timer = setTimeout(() => setStill(true), 25_000);
    };
    const visibility = () => (document.hidden ? setStill(true) : wake());
    wake();
    for (const type of ["pointermove", "pointerdown", "keydown", "scroll", "touchstart"])
      window.addEventListener(type, wake, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    return () => {
      clearTimeout(timer);
      for (const type of ["pointermove", "pointerdown", "keydown", "scroll", "touchstart"])
        window.removeEventListener(type, wake);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return still;
}

/* ---- Sky ---- */

// The previous period's sky stays underneath while the new one fades in over
// it, so an hour change is a slow crossfade rather than a cut. The clouds, the
// fog and the city on the horizon are what the glass has to bend and blur.
function Sky({ hour }) {
  const period = periodFor(hour);
  const [layers, setLayers] = useState([period]);
  useEffect(() => {
    setLayers((old) => (old[old.length - 1] === period ? old : [...old.slice(-1), period]));
  }, [period]);
  const body = skyBody(hour);
  const p = periods[period];
  const phase = moonPhase();
  // The moon's dark side: a sky-coloured disc slid across the lit one.
  const shadow = Math.round(((1 - Math.cos(2 * Math.PI * phase)) / 2) * 50) * (phase < 0.5 ? -1 : 1);

  return (
    <div className="gl-sky" aria-hidden="true">
      {layers.map((name) => {
        const s = periods[name];
        return (
          <div
            key={name}
            className="gl-sky-fill"
            style={{ "--top": s.top, "--mid": s.mid, "--low": s.low }}
          />
        );
      })}
      {p.stars && (
        <div className="gl-stars">
          {stars.map((star, i) => (
            <i
              key={i}
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: star.size,
                height: star.size,
                animationDelay: `${star.delay}s`,
              }}
            />
          ))}
        </div>
      )}
      <div className={`gl-orb gl-orb--${body.kind}`} style={{ left: `${body.x}%`, top: `${body.y}%` }}>
        {body.kind === "moon" && <i style={{ transform: `translateX(${shadow}px)` }} />}
      </div>
      <div className="gl-clouds">
        <i className="gl-cloud gl-cloud--1" />
        <i className="gl-cloud gl-cloud--2" />
        <i className="gl-cloud gl-cloud--3" />
        <i className="gl-cloud gl-cloud--4" />
        <i className="gl-cloud gl-cloud--5" />
        <i className="gl-cloud gl-cloud--6" />
      </div>
      <Horizon />
    </div>
  );
}

// San Francisco on the horizon, with restraint: two soft hills, the bridge's
// towers and cables, a bank of fog at their feet. One silhouette colour from
// the period, so it sits in the sky rather than on it.
function Horizon() {
  return (
    <div className="gl-horizon">
      <svg viewBox="0 0 1440 200" preserveAspectRatio="none" aria-hidden="true">
        <path
          className="gl-hill gl-hill--far"
          d="M0 132 C 120 96, 260 90, 400 118 C 520 140, 640 124, 760 110 C 900 94, 1040 100, 1180 122 C 1290 138, 1370 130, 1440 116 L1440 200 L0 200 Z"
        />
        <g className="gl-bridge">
          <path d="M0 152 C 140 100, 300 92, 428 92 C 560 92, 760 146, 888 92 C 1020 92, 1200 100, 1440 152" />
          <path d="M0 146 L1440 146" />
        </g>
        <path
          className="gl-hill gl-hill--near"
          d="M0 172 C 160 150, 300 146, 480 160 C 640 172, 800 168, 960 154 C 1120 140, 1300 150, 1440 166 L1440 200 L0 200 Z"
        />
      </svg>
      <i className="gl-fog" />
    </div>
  );
}

/* ---- Clock ---- */

function Clock({ hour }) {
  const [time, setTime] = useState(null);
  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("en-US", { hour12: false, timeZone: "America/Los_Angeles" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const shown = time && `${String(hour).padStart(2, "0")}${time.slice(2)}`;
  return (
    <time className="gl-clock" aria-label="Current time in San Francisco">
      <span className="gl-clock-hm">{shown ? shown.slice(0, 5) : "--:--"}</span>
      <span className="gl-clock-s">{shown ? shown.slice(6) : "--"}</span>
    </time>
  );
}

// The day's arc: a thin line with the hour's position on it, the shape behind
// the period's name so the sky's state is never told by colour alone.
function DayArc({ hour }) {
  const t = hour / 24;
  const x = 4 + t * 92;
  const y = 30 - Math.sin(t * Math.PI) * 22;
  return (
    <svg className="gl-arc" viewBox="0 0 100 34" aria-hidden="true">
      <path d="M4 30 Q 50 -14 96 30" fill="none" />
      <circle cx={x} cy={y} r="3" />
    </svg>
  );
}

/* ---- Widgets ---- */

const Prose = ({ parts, className }) => (
  <p className={className}>
    {parts.map((part, i) =>
      typeof part === "string" ? (
        part
      ) : (
        <a key={i} href={part.href} target="_blank" rel="noreferrer">
          {part.text}
        </a>
      ),
    )}
  </p>
);

const Links = () => (
  <div className="gl-pills">
    <a className="gl-pill" href="https://github.com/jlui17" target="_blank" rel="noreferrer">
      GitHub
    </a>
    <a className="gl-pill" href="https://www.linkedin.com/in/jlui17" target="_blank" rel="noreferrer">
      LinkedIn
    </a>
  </div>
);

const girlfriend = people.find((person) => person.girlfriend);
// Everything the hello face and paragraphs say, for the sheet's facts to skip.
const said = [sections.intro.hook, ...intro.flat().map((part) => (typeof part === "string" ? part : part.text))].join(" ");

const PersonCard = ({ person }) => (
  <section className={`gl-card${person.girlfriend ? " is-highlight" : ""}`}>
    <div className="gl-card-head">
      <span className="gl-name">{person.name}</span>
      <span className="gl-tag">{person.tag}</span>
    </div>
    <h3 className="gl-h3">{person.heading}</h3>
    <p className="gl-body">{person.body}</p>
  </section>
);

// A face is three ranks and nothing else: the section's title, its `hook`
// (the one sentence that introduces the thing, in the display face), its
// `more` (one quieter line, a rank down), and the `invite`, which is the
// expand affordance. Everything else is in the sheet, warm sentence first,
// prose smaller and quieter. `floor` widgets keep a strip at the bottom of the
// face clear: the shelf Justin visits and the props stand on (stage.jsx).
const Face = ({ section }) => (
  <>
    <p className="gl-hook">{section.hook}</p>
    <p className="gl-more">{section.more}</p>
  </>
);

const widgets = [
  {
    id: "hello",
    section: sections.intro,
    hero: true,
    face: ({ hour }) => (
      <>
        <h1 className="gl-h1">{sections.intro.title}</h1>
        <p className="gl-hook gl-hook--hero">{sections.intro.hook}</p>
        <p className="gl-more">{sections.intro.more}</p>
        {/* The photo keeps a 3:2 crop so all three of them are in it; the
            clock stands beside it on a wide screen, under it on a phone. */}
        <div className="gl-hero-media">
          <figure className="gl-figure gl-figure--face">
            <img
              className="gl-photo"
              src="/images/justin-girlfriend-dog.jpeg"
              alt="Justin and his girlfriend taking a selfie with a sleepy dog"
            />
            <figcaption className="gl-label">The three of us</figcaption>
          </figure>
          <div className="gl-clockline">
            <DayArc hour={hour} />
            <span>San Francisco</span>
            <Clock hour={hour} />
            <span>{periods[periodFor(hour)].label}</span>
          </div>
        </div>
      </>
    ),
    extras: <Links />,
    sheet: () => (
      <>
        {intro.map((parts, i) => (
          <Prose key={i} parts={parts} className="gl-body gl-prose" />
        ))}
        <dl className="gl-facts">
          {/* Only the facts the face and the paragraphs have not already said. */}
          {facts.filter((fact) => !said.includes(fact.value)).map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
        <section className="gl-card">
          <span className="gl-tag">One random thing</span>
          <h3 className="gl-h3">{randomThing}</h3>
        </section>
      </>
    ),
    // He is already home with her when the sheet lands.
    scene: [
      { who: "justin", act: "idle", at: 0.3 },
      { who: "truffle", act: "sit", at: 0.4 },
    ],
  },
  {
    id: "now",
    section: sections.now,
    meta: `updated ${status.updated}`,
    face: () => <Face section={sections.now} />,
    // The three he has more to say about lead, in a row; the rest are a
    // quiet list in two columns.
    sheet: () => (
      <>
        <div className="gl-live">
          {status.entries.map((entry) => (
            <section key={entry.label} className="gl-card">
              <span className="gl-tag">{entry.label}</span>
              <h3 className="gl-h3">{entry.value}</h3>
              <p className="gl-body">{entry.detail}</p>
            </section>
          ))}
        </div>
        <ul className="gl-list gl-list--two">
          {now.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </>
    ),
    scene: [
      { who: "coffee", act: "ready", at: 0.62 },
      { who: "justin", act: "sip", at: 0.78, from: "right" },
    ],
  },
  {
    id: "agents",
    section: sections.agents,
    floor: true,
    face: () => <Face section={sections.agents} />,
    sheet: () => (
      <div className="gl-cards">
        {agents.map((agent) => (
          <section key={agent.name} className="gl-card">
            <div className="gl-card-head">
              <span className="gl-name">{agent.name}</span>
              <span className="gl-tag">{agent.tag}</span>
            </div>
            <h3 className="gl-h3">{agent.heading}</h3>
            <p className="gl-body">{agent.body}</p>
            <ul className="gl-list">
              {agent.does.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    ),
    // His desk is there; he walks in from the left (the chair's open side) and sits down.
    scene: [
      { who: "justin", act: "type", at: 0.26, from: "left" },
      { who: "luibot", act: "idle", at: 0.58 },
      { who: "luibuilder", act: "idle", at: 0.74 },
    ],
  },
  {
    id: "people",
    section: sections.people,
    floor: true,
    face: () => <Face section={sections.people} />,
    // The one highlight leads, so she is never the card below the fold.
    sheet: () => (
      <div className="gl-cards gl-cards--people">
        <PersonCard person={girlfriend} />
        {people.filter((person) => !person.girlfriend).map((person) => (
          <PersonCard key={person.name} person={person} />
        ))}
      </div>
    ),
    // He is there; she trots in and he kneels to her.
    scene: [
      { who: "justin", act: "pet", at: 0.6 },
      { who: "truffle", act: "sit", at: 0.6, from: "right", flip: true, with: "justin" },
    ],
  },
  {
    id: "home",
    section: sections.home,
    floor: true,
    face: () => <Face section={sections.home} />,
    sheet: () => (
      <div className="gl-cards">
        {home.map((spot) => (
          <section key={spot.tag} className="gl-card">
            <span className="gl-tag">{spot.tag}</span>
            <h3 className="gl-h3">{spot.heading}</h3>
            <p className="gl-body">{spot.body}</p>
          </section>
        ))}
      </div>
    ),
    scene: [
      { who: "shoeRack", act: "idle", at: 0.16 },
      { who: "justin", act: "carry", at: 0.34, from: "near" },
      { who: "coffee", act: "idle", at: 0.74 },
    ],
  },
  {
    id: "someday",
    section: sections.someday,
    floor: true,
    face: () => <Face section={sections.someday} />,
    sheet: () => (
      <div className="gl-cards">
        {someday.map((dream) => (
          <section key={dream.tag} className="gl-card">
            <span className="gl-tag">{dream.tag}</span>
            <h3 className="gl-h3">{dream.heading}</h3>
            <p className="gl-body">{dream.body}</p>
          </section>
        ))}
      </div>
    ),
    // The whole family, already settled, watching the farm.
    scene: [
      { who: "justin", act: "sit", at: 0.1 },
      { who: "truffle", act: "sleep", at: 0.22 },
      { who: "luibot", act: "idle", at: 0.34 },
      { who: "luibuilder", act: "idle", at: 0.43 },
      { who: "chicken", act: "peck", at: 0.55 },
      { who: "sheep", act: "idle", at: 0.68 },
      { who: "cow", act: "graze", at: 0.86 },
    ],
  },
  {
    id: "built",
    section: sections.projects,
    floor: true,
    face: () => <Face section={sections.projects} />,
    sheet: () => (
      <div className="gl-cards">
        {projects.map((project) => (
          <section key={project.title} className="gl-card">
            <div className="gl-card-head">
              <a className="gl-name" href={project.href} target="_blank" rel="noreferrer">
                {project.title}
              </a>
              <span className="gl-tag">{project.tag}</span>
            </div>
            <h3 className="gl-h3">{project.kicker}</h3>
            <p className="gl-body">{project.story}</p>
          </section>
        ))}
      </div>
    ),
    // He walks in and tips his hat to luibuilder, who built the games.
    scene: [
      { who: "luibuilder", act: "idle", at: 0.6 },
      { who: "justin", act: "hat", at: 0.76, from: "right" },
    ],
  },
];

const OpenGlyph = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
    <path d="M9.5 2.5h4v4M13.5 2.5 9 7M6.5 13.5h-4v-4M2.5 13.5 7 9" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const widgetClass = (widget) => `gw gw--${widget.id} gw--opens${widget.floor ? " gw--floor" : ""}${widget.hero ? " gw--hero" : ""}`;

// A widget's face, in full: the board renders it, and the opening sheet
// renders a copy of it at the widget's place so the shape that grows is the
// widget itself, never an empty slab.
function WidgetFace({ widget, hour, onOpen, buttonRef }) {
  const FaceOf = widget.face;
  const { section } = widget;
  return (
    <>
      <span className="gl-ring" aria-hidden="true" />
      {!widget.hero && (
        <header className="gw-head">
          <span className="gl-label">{section.title}</span>
          {widget.meta && <span className="gl-meta">{widget.meta}</span>}
        </header>
      )}
      <div className="gw-body">
        <FaceOf hour={hour} />
        <div className="gw-foot">
          {widget.extras}
          {/* The way in: the invite, with the expand mark. */}
          <button
            ref={buttonRef}
            type="button"
            className="gl-invite"
            aria-label={`${section.invite}: open ${section.title}`}
            tabIndex={onOpen ? undefined : -1}
            onClick={(event) => {
              event.stopPropagation();
              onOpen?.(event);
            }}
          >
            {section.invite}
            <OpenGlyph />
          </button>
        </div>
      </div>
      {widget.floor && <div className="gw-floor" aria-hidden="true" />}
    </>
  );
}

function Widget({ widget, hour, lifted, onOpen, onPoint, buttonRef }) {
  const point = (on) => widget.floor && onPoint(on ? widget.id : null);
  return (
    <article
      className={`${widgetClass(widget)}${lifted ? " is-lifted" : ""}`}
      data-id={widget.id}
      onClick={(event) => event.target.closest("a, .gl-reacts") || onOpen(event)}
      onPointerEnter={(event) => event.pointerType === "mouse" && point(true)}
      onPointerLeave={(event) => event.pointerType === "mouse" && point(false)}
      onFocus={() => point(true)}
      onBlur={(event) => event.currentTarget.contains(event.relatedTarget) || point(false)}
    >
      <WidgetFace widget={widget} hour={hour} onOpen={onOpen} buttonRef={buttonRef} />
    </article>
  );
}

/* ---- Sheet: the widget grown in place ---- */

const MORPH_MS = 400;
const CLOSE_MS = 320;
const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

// Where the open sheet sits: a centred panel as tall as its content, up to
// most of the viewport; on a phone it takes nearly the whole width.
function finalRect(naturalHeight, narrow) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = vw < 640 ? 10 : 24;
  const width = Math.min(vw < 640 ? Infinity : narrow ? 540 : 760, vw - 2 * margin);
  const height = Math.min(naturalHeight, vh - 2 * margin);
  return { top: Math.round((vh - height) / 2), left: Math.round((vw - width) / 2), width, height };
}

const applyRect = (el, r) => {
  el.style.top = `${r.top}px`;
  el.style.left = `${r.left}px`;
  el.style.width = `${r.width}px`;
  el.style.height = `${r.height}px`;
};

// A viewport rect as a clip inset of the morph layer (which is the whole
// viewport), with the widgets' corner radius.
const clipFor = (r, radius) =>
  `inset(${r.top}px ${window.innerWidth - (r.left + r.width)}px ${window.innerHeight - (r.top + r.height)}px ${r.left}px round ${radius}px)`;

// The sheet is the widget grown in place. The morph layer covers the
// viewport and holds three things at their final places from the first
// frame: a plain tinted slab, a copy of the widget's face at the widget's
// rect, and the panel at its rect. One clip-path animation on the layer
// grows the visible shape from the widget's rect to the panel's (and back),
// so the shape is always a whole rounded rectangle, and what it shows is the
// face crossfading into the panel's content: never empty, never a straight
// edge across the widget. While it moves nothing lays out and no glass
// re-blurs; the panel's glass comes on when it has landed.
function Sheet({ widget, fromRect, onClose, onClosing, hour, outfit, cheer, nearSide }) {
  const layer = useRef(null);
  const el = useRef(null);
  const body = useRef(null);
  const closeButton = useRef(null);
  const [phase, setPhase] = useState("opening"); // opening | open | closing
  const [laid, setLaid] = useState(false); // the panel has its final rect
  const [more, setMore] = useState(false); // content continues below the fold
  const finalRef = useRef(null);
  const Body = widget.sheet;

  useLayoutEffect(() => {
    const sheet = el.current;
    const instant = reducedMotion();
    const radius = parseFloat(getComputedStyle(sheet).borderRadius) || 28;
    // Measure the panel at its final width with its natural height, once.
    const probe = finalRect(Infinity, widget.narrow);
    applyRect(sheet, { ...probe, height: 0 });
    sheet.style.height = "auto";
    const natural = Math.ceil(sheet.getBoundingClientRect().height);
    const target = finalRect(natural, widget.narrow);
    applyRect(sheet, target);
    finalRef.current = target;
    setLaid(true);
    const finish = () => {
      // Landed: the slab goes and the clip is cleared in the same frame, so
      // the slab is never seen outside the shape.
      flushSync(() => setPhase("open"));
      layer.current.style.clipPath = "";
      closeButton.current?.focus({ preventScroll: true });
    };
    if (instant) {
      // No motion: the layer was never clipped, so there is nothing to flush.
      setPhase("open");
      closeButton.current?.focus({ preventScroll: true });
      return undefined;
    }
    const anim = layer.current.animate([{ clipPath: clipFor(fromRect, radius) }, { clipPath: clipFor(target, radius) }], {
      duration: MORPH_MS,
      easing: EASE,
      fill: "forwards",
    });
    anim.onfinish = () => {
      anim.cancel();
      finish();
    };
    return () => anim.cancel();
  }, [fromRect, widget.narrow]);

  // A soft fade at the bottom says there is more, until it has been scrolled to.
  const checkMore = useCallback(() => {
    const b = body.current;
    if (b) setMore(b.scrollHeight - b.scrollTop - b.clientHeight > 4);
  }, []);
  useEffect(() => {
    if (phase === "open") checkMore();
  }, [phase, checkMore]);

  const close = useCallback(() => {
    if (phase === "closing") return;
    setPhase("closing");
    // The widget comes back under the face copy while the shape shrinks, so
    // the board is whole the moment the layer goes; its focus ring would be
    // cut by the clip, so the button lets go first.
    closeButton.current?.blur();
    onClosing();
    if (reducedMotion()) {
      onClose();
      return;
    }
    const radius = parseFloat(getComputedStyle(el.current).borderRadius) || 28;
    const anim = layer.current.animate([{ clipPath: clipFor(finalRef.current, radius) }, { clipPath: clipFor(fromRect.measure(), radius) }], {
      duration: CLOSE_MS,
      easing: EASE,
      fill: "forwards",
    });
    anim.onfinish = onClose;
  }, [fromRect, onClose, onClosing, phase]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") close();
      if (event.key === "Tab") {
        // Keep the tab cycle inside the sheet.
        const focusable = [...el.current.querySelectorAll("button, a[href]")].filter((n) => !n.hidden);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  const faceStyle = { top: `${fromRect.top}px`, left: `${fromRect.left}px`, width: `${fromRect.width}px`, height: `${fromRect.height}px` };
  return (
    <>
      <div className={`gl-scrim is-${phase}`} onClick={close} />
      <div ref={layer} className={`gl-morph is-${phase}`}>
        <span className="gl-sheet-plain" aria-hidden="true" />
        <section
          ref={el}
          className={`gl-sheet gw is-${phase}${more ? " has-more" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`sheet-${widget.id}`}
        >
          <span className="gl-ring" aria-hidden="true" />
          <div className="gl-sheet-inner">
            <header className="gl-sheet-head">
              <span id={`sheet-${widget.id}`} className="gl-label">
                {widget.section.title}
              </span>
              {widget.meta && <span className="gl-meta">{widget.meta}</span>}
              <button ref={closeButton} type="button" className="gl-close" aria-label="Close" onClick={close}>
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                  <path d="M4 4l8 8M12 4l-8 8" fill="none" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </header>
            <div ref={body} className="gl-sheet-body" onScroll={checkMore}>
              <Body hour={hour} />
            </div>
            {widget.scene && (
              <Floor
                scene={widget.scene}
                outfit={outfit}
                cheer={cheer}
                nearSide={nearSide}
                startDelay={reducedMotion() ? 0 : MORPH_MS}
                ready={laid}
              />
            )}
          </div>
        </section>
        {/* Over the panel, so the widget is whole at the ends of the motion. */}
        <div className={`${widgetClass(widget)} gl-sheet-face`} style={faceStyle} aria-hidden="true">
          <WidgetFace widget={widget} hour={hour} />
        </div>
      </div>
    </>
  );
}

/* ---- Board ---- */

// The specular highlight follows the pointer: each widget learns where the
// pointer is in its own coordinates, and its rim and inner sheen light up
// nearest to it. One rAF per pointer move, twelve rects.
function useSpecular(boardRef) {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;
    const board = boardRef.current;
    let raf = 0;
    let last = null;
    const paint = () => {
      raf = 0;
      board.querySelectorAll(".gw").forEach((el) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--px", `${Math.round(last.x - r.left)}px`);
        el.style.setProperty("--py", `${Math.round(last.y - r.top)}px`);
      });
    };
    const onMove = (event) => {
      last = { x: event.clientX, y: event.clientY };
      if (!raf) raf = requestAnimationFrame(paint);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [boardRef]);
}

export default function Glass() {
  useFonts();
  const hour = useSFHour();
  const period = periodFor(hour);
  const mode = periods[period].mode;
  const outfit = period === "morning" || period === "day" || period === "golden" ? "overshirt" : "hoodie";
  const boardRef = useRef(null);
  const buttons = useRef({});
  const [open, setOpen] = useState(null); // { widget, fromRect }
  const [cheer, setCheer] = useState(false);
  const [pointed, setPointed] = useState(null); // widget id under the pointer or focus
  const [visit, setVisit] = useState(null); // ...after a short dwell
  const still = useStill();
  useSpecular(boardRef);

  // Typing 1070 (his favourite One Piece episode) gets both arms up.
  useEffect(() => {
    let typed = "";
    const onKey = (event) => {
      typed = (typed + event.key).slice(-4);
      if (typed === "1070") {
        setCheer(true);
        setTimeout(() => setCheer(false), 1800);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // A widget has to be pointed at for a moment before Justin sets off, so a
  // pointer crossing the board does not send him back and forth.
  useEffect(() => {
    if (open) return undefined; // under a sheet the board is frozen; he stays where he is
    const id = setTimeout(() => setVisit(pointed), pointed ? 350 : 0);
    return () => clearTimeout(id);
  }, [pointed, open]);

  // The page behind a sheet stays put: the scroll container is the root.
  useEffect(() => {
    if (!open) return undefined;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  const openWidget = (widget) => (event) => {
    const article = event.currentTarget.closest(".gw");
    const measure = () => {
      const r = article.getBoundingClientRect();
      return { top: r.top, left: r.left, width: r.width, height: r.height };
    };
    // The side of the screen his board sprite was on: the scene's "near" side.
    const sprite = boardRef.current?.querySelector('.gl-stage svg[aria-label^="justin"]');
    const sx = sprite ? sprite.getBoundingClientRect().left : 0;
    setOpen({ widget, fromRect: { ...measure(), measure }, nearSide: sx < window.innerWidth / 2 ? "left" : "right" });
  };

  const closeSheet = useCallback(() => {
    const id = open?.widget.id;
    setOpen(null);
    buttons.current[id]?.focus({ preventScroll: true });
  }, [open]);
  const closingSheet = useCallback(() => setOpen((o) => (o ? { ...o, closing: true } : o)), []);

  return (
    <div
      className={`glass glass--${mode} glass--${period}${flat ? " glass--flat" : ""}${still ? " glass--still" : ""}${open ? " glass--sheet" : ""}`}
    >
      <Sky hour={hour} />
      <RefractionFilter />
      <main className="gl-board" ref={boardRef} aria-label="Justin Lui">
        <div className="gl-grid">
          {widgets.map((widget) => (
            <Widget
              key={widget.id}
              widget={widget}
              hour={hour}
              lifted={open?.widget.id === widget.id && !open.closing}
              onOpen={openWidget(widget)}
              onPoint={setPointed}
              buttonRef={(el) => {
                buttons.current[widget.id] = el;
              }}
            />
          ))}
        </div>
        <Stage period={period} outfit={outfit} cheer={cheer} visit={visit} paused={Boolean(open)} />
      </main>
      {open && (
        <Sheet
          key={open.widget.id}
          widget={open.widget}
          fromRect={open.fromRect}
          onClose={closeSheet}
          onClosing={closingSheet}
          hour={hour}
          outfit={outfit}
          cheer={cheer}
          nearSide={open.nearSide}
        />
      )}
    </div>
  );
}

// The rim's lens: a displacement map under the frosted interior, so only the
// outer band shows it. The map runs the other way from the usual: an edge
// pixel samples from inside the surface, never from beyond its own rounded
// clip (which shows as creases at the corners), so the band is the sky just
// inside the edge, stretched outward, the way a thick glass edge bulges.
// Browsers that do not take a url() in backdrop-filter show the plain rim.
function RefractionFilter() {
  const map =
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>
        <defs>
          <linearGradient id='x' x1='0' x2='1' y1='0' y2='0'><stop offset='0' stop-color='rgb(255,0,0)'/><stop offset='1' stop-color='rgb(0,0,0)'/></linearGradient>
          <linearGradient id='y' x1='0' x2='0' y1='0' y2='1'><stop offset='0' stop-color='rgb(0,255,0)'/><stop offset='1' stop-color='rgb(0,0,0)'/></linearGradient>
        </defs>
        <rect width='64' height='64' fill='url(#x)'/>
        <rect width='64' height='64' fill='url(#y)' style='mix-blend-mode:screen'/>
      </svg>`,
    );
  return (
    <svg className="gl-defs" aria-hidden="true" focusable="false">
      <filter id="gl-refract" x="0" y="0" width="1" height="1" filterUnits="objectBoundingBox" primitiveUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
        <feImage href={map} x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="map" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale="0.12" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
