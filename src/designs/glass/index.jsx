import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import "./glass.css";
import { agents, facts, home, intro, now, people, projects, someday, status } from "../../content";
import { periodFor, periods, skyBody, stars } from "./sky.js";
import { Floor, Robot, Roofline, reducedMotion } from "./stage.jsx";

// A board of Liquid Glass widgets over a sky that follows the San Francisco
// hour. Each widget is one small piece of Justin at rest; the ones with more
// to say grow in place into a glass sheet and shrink back. The pixel sprites
// live on the widgets' edges (see stage.jsx).
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

/* ---- Sky ---- */

// The previous period's sky stays underneath while the new one fades in over
// it, so an hour change is a slow crossfade rather than a cut.
function Sky({ hour }) {
  const period = periodFor(hour);
  const [layers, setLayers] = useState([period]);
  useEffect(() => {
    setLayers((old) => (old[old.length - 1] === period ? old : [...old.slice(-1), period]));
  }, [period]);
  const body = skyBody(hour);
  const p = periods[period];

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
      <div className={`gl-orb gl-orb--${body.kind}`} style={{ left: `${body.x}%`, top: `${body.y}%` }} />
      <div className="gl-cloud gl-cloud--a" />
      <div className="gl-cloud gl-cloud--b" />
      <div className="gl-cloud gl-cloud--c" />
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

const Label = ({ children }) => <span className="gl-label">{children}</span>;

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

const coffee = home.find((spot) => spot.tag === "The coffee corner");
const desk = home.find((spot) => spot.tag === "The desk");
const shoes = home.find((spot) => spot.tag === "The shoes");

// Each widget: its resting face, and for the ones that open, the sheet's body
// and the sprite scene on the sheet's floor. Labels are the widgets' names.
const widgets = [
  {
    id: "hello",
    label: "Hello",
    area: "hello",
    face: () => (
      <>
        <h1 className="gl-h1">Hi, I&rsquo;m Lui.</h1>
        {intro.map((parts, i) => (
          <Prose key={i} parts={parts} className="gl-intro" />
        ))}
        <Links />
      </>
    ),
  },
  {
    id: "coffee",
    label: coffee.tag,
    area: "coffee",
    narrow: true,
    face: () => <h2 className="gl-h2">{coffee.heading}</h2>,
    sheet: () => (
      <>
        <h3 className="gl-h3">{coffee.heading}</h3>
        <p className="gl-body">{coffee.body}</p>
      </>
    ),
    scene: [{ who: "justin", act: "sip", at: 0.2, from: "left" }],
  },
  {
    id: "clock",
    label: "San Francisco",
    area: "clock",
    face: ({ hour }) => (
      <>
        <Clock hour={hour} />
        <div className="gl-period">
          <DayArc hour={hour} />
          <span>{periods[periodFor(hour)].label}</span>
        </div>
      </>
    ),
  },
  {
    id: "photo",
    label: null,
    area: "photo",
    face: () => (
      <img
        className="gl-photo"
        src="/images/justin-girlfriend-dog.jpeg"
        alt="Justin and his girlfriend taking a selfie with a sleepy dog"
      />
    ),
  },
  {
    id: "facts",
    label: "In short",
    area: "facts",
    face: () => (
      <dl className="gl-facts">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>
    ),
  },
  {
    id: "now",
    label: "Right now",
    area: "now",
    meta: `updated ${status.updated}`,
    face: () => (
      <dl className="gl-status">
        {status.entries.map((entry) => (
          <div key={entry.label}>
            <dt>{entry.label}</dt>
            <dd>
              {entry.value}
              <small>{entry.detail}</small>
            </dd>
          </div>
        ))}
      </dl>
    ),
    sheet: () => (
      <>
        <dl className="gl-status gl-status--full">
          {status.entries.map((entry) => (
            <div key={entry.label}>
              <dt>{entry.label}</dt>
              <dd>
                {entry.value}
                <small>{entry.detail}</small>
              </dd>
            </div>
          ))}
        </dl>
        <h3 className="gl-h3">What I&rsquo;m up to</h3>
        <ul className="gl-list">
          {now.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </>
    ),
    scene: [{ who: "justin", act: "idle", at: 0.8, from: "right" }],
  },
  {
    id: "agents",
    label: "My agents",
    area: "agents",
    face: () => (
      <div className="gl-agents">
        {agents.map((agent) => (
          <div key={agent.name} className="gl-agent">
            <Robot character={agent.name} className="gl-agent-sprite" />
            <div>
              <span className="gl-name">{agent.name}</span>
              <span className="gl-tag">{agent.tag}</span>
              <p>{agent.heading}</p>
            </div>
          </div>
        ))}
      </div>
    ),
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
    scene: [
      { who: "justin", act: "idle", at: 0.2, from: "left" },
      { who: "luibot", act: "idle", at: 0.5 },
      { who: "luibuilder", act: "idle", at: 0.7 },
    ],
  },
  {
    id: "people",
    label: "My people",
    area: "people",
    face: () => (
      <ul className="gl-rows">
        {people.map((person) => (
          <li key={person.name} className={person.girlfriend ? "is-highlight" : undefined}>
            <div className="gl-row-head">
              <span className="gl-name">{person.name}</span>
              <span className="gl-tag">{person.tag}</span>
            </div>
            <p>{person.heading}</p>
          </li>
        ))}
      </ul>
    ),
    sheet: () => (
      <div className="gl-cards">
        {people.map((person) => (
          <section key={person.name} className={`gl-card${person.girlfriend ? " is-highlight" : ""}`}>
            <div className="gl-card-head">
              <span className="gl-name">{person.name}</span>
              <span className="gl-tag">{person.tag}</span>
            </div>
            <h3 className="gl-h3">{person.heading}</h3>
            <p className="gl-body">{person.body}</p>
          </section>
        ))}
      </div>
    ),
    scene: [
      { who: "justin", act: "sit", at: 0.22, from: "left" },
      { who: "truffle", act: "sit", at: 0.76, from: "right", flip: true },
    ],
  },
  {
    id: "built",
    label: "Things I’ve built",
    area: "built",
    face: () => (
      <ul className="gl-rows">
        {projects.map((project) => (
          <li key={project.title}>
            <div className="gl-row-head">
              <span className="gl-name">{project.title}</span>
              <span className="gl-tag">{project.tag}</span>
            </div>
            <p>{project.kicker}</p>
          </li>
        ))}
      </ul>
    ),
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
    scene: [
      { who: "justin", act: "idle", at: 0.2, from: "left" },
      { who: "luibuilder", act: "idle", at: 0.42 },
    ],
  },
  {
    id: "desk",
    label: desk.tag,
    area: "desk",
    narrow: true,
    face: () => <h2 className="gl-h2">{desk.heading}</h2>,
    sheet: () => (
      <>
        <h3 className="gl-h3">{desk.heading}</h3>
        <p className="gl-body">{desk.body}</p>
      </>
    ),
  },
  {
    id: "shoes",
    label: shoes.tag,
    area: "shoes",
    narrow: true,
    face: () => <h2 className="gl-h2">{shoes.heading}</h2>,
    sheet: () => (
      <>
        <h3 className="gl-h3">{shoes.heading}</h3>
        <p className="gl-body">{shoes.body}</p>
      </>
    ),
  },
  {
    id: "someday",
    label: "Someday",
    area: "someday",
    face: () => (
      <ul className="gl-someday">
        {someday.map((dream) => (
          <li key={dream.tag}>
            <span className="gl-tag">{dream.tag}</span>
            <p>{dream.heading}</p>
          </li>
        ))}
      </ul>
    ),
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
    scene: [
      { who: "justin", act: "sit", at: 0.18, from: "left" },
      { who: "luibot", act: "idle", at: 0.44 },
      { who: "luibuilder", act: "idle", at: 0.58 },
      { who: "truffle", act: "sit", at: 0.82, from: "right", flip: true },
    ],
  },
];

const OpenGlyph = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <path d="M9.5 2.5h4v4M13.5 2.5 9 7M6.5 13.5h-4v-4M2.5 13.5 7 9" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Widget({ widget, hour, lifted, onOpen, buttonRef }) {
  const Face = widget.face;
  const opens = Boolean(widget.sheet);
  return (
    <article
      className={`gw gw--${widget.area}${opens ? " gw--opens" : ""}${lifted ? " is-lifted" : ""}`}
      data-id={widget.id}
      onClick={opens ? (event) => event.target.closest("a, .gl-reacts") || onOpen(event) : undefined}
    >
      <span className="gl-ring" aria-hidden="true" />
      {(widget.label || widget.meta) && (
        <header className="gw-head">
          {widget.label && <Label>{widget.label}</Label>}
          {widget.meta && <span className="gl-meta">{widget.meta}</span>}
        </header>
      )}
      <div className="gw-body">
        <Face hour={hour} />
      </div>
      {opens && (
        <button
          ref={buttonRef}
          type="button"
          className="gw-open"
          aria-label={`Open ${widget.label}`}
          onClick={(event) => {
            event.stopPropagation();
            onOpen(event);
          }}
        >
          <OpenGlyph />
        </button>
      )}
    </article>
  );
}

/* ---- Sheet: the widget grown in place ---- */

const MORPH_MS = 480;

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

function Sheet({ widget, fromRect, onClose, hour, outfit, cheer }) {
  const el = useRef(null);
  const closeButton = useRef(null);
  const [phase, setPhase] = useState("opening"); // opening | open | closing
  const Body = widget.sheet;

  useLayoutEffect(() => {
    const sheet = el.current;
    const instant = reducedMotion();
    // Measure the sheet at its final width with its natural height, then
    // start it at the widget's rect and let the transition carry it over.
    const probe = finalRect(Infinity, widget.narrow);
    sheet.style.transition = "none";
    applyRect(sheet, { ...probe, height: 0 });
    sheet.style.height = "auto";
    const natural = sheet.offsetHeight;
    const target = finalRect(natural, widget.narrow);
    applyRect(sheet, fromRect);
    sheet.getBoundingClientRect();
    sheet.style.transition = "";
    applyRect(sheet, target);
    const done = setTimeout(
      () => {
        setPhase("open");
        closeButton.current?.focus();
      },
      instant ? 0 : MORPH_MS,
    );
    return () => clearTimeout(done);
  }, [fromRect, widget.narrow]);

  const close = useCallback(() => {
    if (phase === "closing") return;
    setPhase("closing");
    const back = fromRect.measure();
    applyRect(el.current, back);
    setTimeout(onClose, reducedMotion() ? 0 : MORPH_MS);
  }, [fromRect, onClose, phase]);

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

  return (
    <>
      <div className={`gl-scrim is-${phase}`} onClick={close} />
      <section
        ref={el}
        className={`gl-sheet gw is-${phase}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`sheet-${widget.id}`}
      >
        <span className="gl-ring" aria-hidden="true" />
        <header className="gl-sheet-head">
          <span id={`sheet-${widget.id}`} className="gl-label">
            {widget.label}
          </span>
          {widget.meta && <span className="gl-meta">{widget.meta}</span>}
          <button ref={closeButton} type="button" className="gl-close" aria-label="Close" onClick={close}>
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" fill="none" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <div className="gl-sheet-body">
          <Body hour={hour} />
        </div>
        {widget.scene && phase === "open" && <Floor scene={widget.scene} outfit={outfit} cheer={cheer} />}
        {widget.scene && phase !== "open" && <div className="gl-floor" aria-hidden="true" />}
      </section>
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

  // Body scroll stays put while a sheet is up.
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const openWidget = (widget) => (event) => {
    const article = event.currentTarget.closest(".gw");
    const measure = () => {
      const r = article.getBoundingClientRect();
      return { top: r.top, left: r.left, width: r.width, height: r.height };
    };
    setOpen({ widget, fromRect: { ...measure(), measure } });
  };

  const closeSheet = useCallback(() => {
    const id = open?.widget.id;
    setOpen(null);
    buttons.current[id]?.focus();
  }, [open]);

  return (
    <div className={`glass glass--${mode}${flat ? " glass--flat" : ""}`}>
      <Sky hour={hour} />
      <RefractionFilter />
      <main className="gl-board" ref={boardRef} aria-label="Justin Lui">
        <div className="gl-grid">
          {widgets.map((widget) => (
            <Widget
              key={widget.id}
              widget={widget}
              hour={hour}
              lifted={open?.widget.id === widget.id}
              onOpen={openWidget(widget)}
              buttonRef={(el) => {
                buttons.current[widget.id] = el;
              }}
            />
          ))}
        </div>
        <Roofline period={period} outfit={outfit} cheer={cheer} />
      </main>
      {open && (
        <Sheet
          key={open.widget.id}
          widget={open.widget}
          fromRect={open.fromRect}
          onClose={closeSheet}
          hour={hour}
          outfit={outfit}
          cheer={cheer}
        />
      )}
    </div>
  );
}

// The rim's refraction: a displacement map that pulls the backdrop inward
// toward the edges, masked in CSS to the outer band of each surface. Browsers
// that do not take a url() in backdrop-filter simply show the plain rim.
function RefractionFilter() {
  const map =
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>
        <defs>
          <linearGradient id='x' x1='0' x2='1' y1='0' y2='0'><stop offset='0' stop-color='rgb(0,0,0)'/><stop offset='1' stop-color='rgb(255,0,0)'/></linearGradient>
          <linearGradient id='y' x1='0' x2='0' y1='0' y2='1'><stop offset='0' stop-color='rgb(0,0,0)'/><stop offset='1' stop-color='rgb(0,255,0)'/></linearGradient>
        </defs>
        <rect width='64' height='64' fill='url(#x)'/>
        <rect width='64' height='64' fill='url(#y)' style='mix-blend-mode:screen'/>
      </svg>`,
    );
  return (
    <svg className="gl-defs" aria-hidden="true" focusable="false">
      <filter id="gl-refract" x="0" y="0" width="1" height="1" filterUnits="objectBoundingBox" primitiveUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
        <feImage href={map} x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="map" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale="0.035" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
