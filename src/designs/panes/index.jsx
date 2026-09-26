import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./panes.css";
import { agents, facts, home, intro, now, people, projects, someday, status } from "../../content";
import { Sprite } from "../../sprites/Sprite.jsx";
import ballSheet from "./ball.js";
import { Palette } from "./Palette.jsx";
import { createStage } from "./stage.js";

// ?hour=0..23 pins the San Francisco hour, clock included, so each time of
// day can be checked by hand.
const hourOverride = new URLSearchParams(window.location.search).get("hour");

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

// How Justin settles on the status bar once he has walked somewhere: espresso
// in the morning, standing through the day, sitting in the evening, asleep at
// night. The clock beside him says why.
const restPose = { morning: "sip", day: "idle", evening: "sit", night: "sleep" };

function useSFHour() {
  const [hour, setHour] = useState(sfHour);
  useEffect(() => {
    const id = setInterval(() => setHour(sfHour()), 60_000);
    return () => clearInterval(id);
  }, []);
  return hour;
}

function useMedia(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

function SFClock({ hour, className }) {
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
    <span className={`pn__clock ${className ?? ""}`} aria-label="Current time in San Francisco">
      SF {shown ? shown.slice(0, 5) : "--:--"}
      <span className="pn__clock-seconds">{shown ? shown.slice(5) : ":--"}</span>
    </span>
  );
}

// A sprite reacts while a mouse is over it; on touch a tap toggles it and a
// tap anywhere else ends it.
function useHoverOrTap() {
  const el = useRef(null);
  const pointer = useRef("mouse");
  const [over, setOver] = useState(false);
  const [tapped, setTapped] = useState(false);

  useEffect(() => {
    if (!tapped) return undefined;
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
      onClick: () => pointer.current === "mouse" || setTapped((on) => !on),
    },
  ];
}

// In reading order, which is also the tab order, the segment order and the
// order of the panes on a phone: who he is, who he loves, his agents, what
// he hopes for, what he is up to, his home, what he has built.
const PANES = [
  { id: "hello", title: "hello" },
  { id: "people", title: "people" },
  { id: "agents", title: "agents" },
  { id: "someday", title: "someday" },
  { id: "now", title: "now" },
  { id: "home", title: "home" },
  { id: "built", title: "built" },
];

const Label = ({ children, className = "" }) => (
  <span className={`pn__label ${className}`}>{children}</span>
);

function Prose({ paragraph }) {
  return (
    <p>
      {paragraph.map((part, j) =>
        typeof part === "string" ? (
          part
        ) : (
          <a key={j} className="pn__link" href={part.href} target="_blank" rel="noreferrer">
            {part.text}
          </a>
        ),
      )}
    </p>
  );
}

// luibot and luibuilder stand on the rule under their names; the pointer on
// them (or a "wave" from the palette) gets a wave back. luibuilder's wave is
// a hat tip that plays once and holds.
function Robot({ character, waving }) {
  const [over, props] = useHoverOrTap();
  return (
    <span className="pn__agent-sprite" aria-hidden="true" {...props}>
      <Sprite character={character} action={over || waving ? "wave" : "idle"} scale={1} />
    </span>
  );
}

// A quiet marker moves down what each agent does, one line at a time: no
// invented events, just attention resting on each real task in turn.
function useRoamingMarker(length, offsetMs) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (reducedMotion()) return undefined;
    let id;
    const start = setTimeout(() => {
      setIndex(1 % length);
      id = setInterval(() => setIndex((i) => (i + 1) % length), 4200);
    }, 4200 + offsetMs);
    return () => {
      clearTimeout(start);
      clearInterval(id);
    };
  }, [length, offsetMs]);
  return index;
}

function Agent({ agent, waving, offsetMs }) {
  const current = useRoamingMarker(agent.does.length, offsetMs);
  return (
    <section className="pn__agent" aria-label={agent.name}>
      <div className="pn__agent-head">
        <span className="pn__card-name">{agent.name}</span>
        <Label>{agent.tag}</Label>
        <Robot character={agent.name} waving={waving} />
      </div>
      <h3>{agent.heading}</h3>
      <p>{agent.body}</p>
      <div className="pn__does">
        <Label>what I hand him</Label>
        <ul>
          {agent.does.map((line, i) => (
            <li key={line} aria-current={i === current ? "true" : undefined}>
              {line}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Card({ name, tag, heading, body, tinted, children }) {
  return (
    <article className={`pn__card${tinted ? " pn__card--tinted" : ""}`}>
      <div className="pn__card-head">
        {name ? <span className="pn__card-name">{name}</span> : <Label>{tag}</Label>}
        {name && <Label>{tag}</Label>}
      </div>
      <h3>{heading}</h3>
      <p>{body}</p>
      {children}
    </article>
  );
}

const truffleWords = {
  sleep: "asleep on the status bar",
  ear: "one ear up",
  trot: "on her way",
  sit: "sitting up",
};

function Pane({ pane, index, focused, zoomed, hidden, onFocus, onToggleZoom, titleRef, children }) {
  const el = useRef(null);
  return (
    <article
      ref={el}
      className={`pn__pane${focused ? " pn__pane--focused" : ""}`}
      data-pane={pane.id}
      hidden={hidden}
      aria-labelledby={`pn-title-${pane.id}`}
      onPointerDown={() => onFocus(pane.id, { scroll: false })}
      onFocus={(event) => {
        if (el.current.contains(event.target)) onFocus(pane.id, { scroll: false });
      }}
    >
      <div className="pn__pane-head">
        <button
          ref={titleRef}
          id={`pn-title-${pane.id}`}
          type="button"
          className="pn__pane-title"
          data-pane-key
          aria-pressed={focused}
          onClick={() => onFocus(pane.id, { scroll: false })}
        >
          <span className="pn__dot" aria-hidden="true" />
          <span className="pn__pane-index" aria-hidden="true">
            {index + 1}
          </span>
          {pane.title}
        </button>
        <button
          type="button"
          className="pn__zoom"
          aria-label={zoomed ? `Restore the layout` : `Zoom the ${pane.title} pane`}
          onClick={() => onToggleZoom(pane.id)}
        >
          {zoomed ? "restore" : "zoom"}
        </button>
      </div>
      <div className="pn__pane-body">{children}</div>
    </article>
  );
}

function Pixels({ sheet, action, frame }) {
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

export default function Panes() {
  const hour = useSFHour();
  const part = timeOfDay(hour);
  const outfit = part === "morning" || part === "day" ? "overshirt" : "hoodie";
  const phone = useMedia("(max-width: 639px)");

  const [focused, setFocused] = useState(PANES[0].id);
  const [zoomed, setZoomed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [waving, setWaving] = useState(null);
  const one = zoomed || phone; // one pane at a time

  const titleRefs = useRef({});
  const segmentRefs = useRef({});
  const workRef = useRef(null);

  // ---- the stage: sprites on the status bar ----
  const stage = useMemo(() => createStage({ reduced: reducedMotion }), []);
  const [scene, setScene] = useState(() => stage.snapshot());

  useEffect(() => {
    stage.setRest(restPose[part]);
  }, [stage, part]);

  const segmentCenter = useCallback((id) => {
    const rect = segmentRefs.current[id]?.getBoundingClientRect();
    return rect ? rect.left + rect.width / 2 : null;
  }, []);

  // First paint: Justin over the first segment, Truffle asleep to the right
  // of the segments with the ball at her nose, nobody walking. The resize
  // handler reads the focused pane through a ref so it never re-runs (and
  // never snaps him) on a focus change.
  const laidOut = useRef(false);
  const focusedRef = useRef(focused);
  focusedRef.current = focused;
  const layoutStage = useCallback(() => {
    stage.lane.left = 6;
    stage.lane.right = window.innerWidth - 6;
    const lastSegment = segmentRefs.current[PANES[PANES.length - 1].id]?.getBoundingClientRect();
    const restRight = Math.min(stage.lane.right - 40, (lastSegment?.right ?? 300) + 70);
    if (!laidOut.current) {
      stage.place("justin", segmentCenter(PANES[0].id) ?? 60);
      stage.place("truffle", restRight);
      stage.placeBall(restRight + 34);
      laidOut.current = true;
    } else {
      // A resize is a re-layout, not an interaction: everything snaps to
      // where it belongs and nobody walks.
      const center = segmentCenter(focusedRef.current);
      if (center !== null && !stage.busy()) stage.place("justin", center);
      stage.place("truffle", Math.min(stage.truffle.cx, stage.lane.right - 18));
      stage.placeBall(Math.min(stage.ball.x, stage.lane.right - 14));
    }
    setScene(stage.snapshot());
  }, [stage, segmentCenter]);

  useLayoutEffect(() => {
    layoutStage();
    window.addEventListener("resize", layoutStage);
    return () => window.removeEventListener("resize", layoutStage);
  }, [layoutStage]);

  // One animation loop; it only re-renders when something on stage changed.
  useEffect(() => {
    let last = performance.now();
    let prev = JSON.stringify(stage.snapshot());
    let id = requestAnimationFrame(function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      stage.tick(now, dt);
      const next = stage.snapshot();
      const key = JSON.stringify(next);
      if (key !== prev) {
        prev = key;
        setScene(next);
      }
      id = requestAnimationFrame(frame);
    });
    return () => cancelAnimationFrame(id);
  }, [stage]);

  // Focus moved: Justin walks to that pane's segment; Truffle follows if it
  // is a real walk.
  const firstFocus = useRef(true);
  useEffect(() => {
    if (firstFocus.current) {
      firstFocus.current = false;
      return;
    }
    const center = segmentCenter(focused);
    if (center === null) return;
    const distance = stage.walkTo(center);
    stage.followJustin(distance);
  }, [focused, segmentCenter, stage, phone]);

  // ---- panes: focus, zoom, keyboard ----
  const focusPane = useCallback(
    (id, { scroll = true, focusTitle = false } = {}) => {
      setFocused(id);
      if (focusTitle) titleRefs.current[id]?.focus({ preventScroll: true });
      if (scroll) {
        requestAnimationFrame(() => {
          document
            .querySelector(`[data-pane="${id}"]`)
            ?.scrollIntoView({ block: "nearest", behavior: reducedMotion() ? "auto" : "smooth" });
        });
      }
    },
    [],
  );

  const toggleZoom = useCallback(
    (id) => {
      if (id) setFocused(id);
      setZoomed((z) => !z);
      workRef.current?.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
    },
    [],
  );

  const order = PANES.map((p) => p.id);
  const step = useCallback(
    (delta) => {
      const i = order.indexOf(focused);
      focusPane(order[(i + delta + order.length) % order.length], { focusTitle: true });
    },
    [focused, focusPane, order],
  );

  // Move to the nearest pane in a direction, by geometry, like a tiling
  // window manager. With one pane showing, left/up and right/down step
  // through the order instead.
  const move = useCallback(
    (dir) => {
      if (one) {
        step(dir === "right" || dir === "down" ? 1 : -1);
        return;
      }
      const rects = PANES.map((p) => ({
        id: p.id,
        rect: document.querySelector(`[data-pane="${p.id}"]`).getBoundingClientRect(),
      }));
      const from = rects.find((r) => r.id === focused).rect;
      const overlapX = (r) => Math.min(r.right, from.right) - Math.max(r.left, from.left) > 0;
      const overlapY = (r) => Math.min(r.bottom, from.bottom) - Math.max(r.top, from.top) > 0;
      const pick = {
        right: (r) => r.left >= from.right - 1 && overlapY(r) && r.left - from.right,
        left: (r) => r.right <= from.left + 1 && overlapY(r) && from.left - r.right,
        down: (r) => r.top >= from.bottom - 1 && overlapX(r) && r.top - from.bottom,
        up: (r) => r.bottom <= from.top + 1 && overlapX(r) && from.top - r.bottom,
      }[dir];
      const best = rects
        .filter((r) => r.id !== focused)
        .map((r) => ({ id: r.id, d: pick(r.rect) }))
        .filter((r) => r.d !== false)
        .sort((a, b) => a.d - b.d)[0];
      if (best) focusPane(best.id, { focusTitle: true });
    },
    [focused, focusPane, one, step],
  );

  useEffect(() => {
    let typed = "";
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
        return;
      }
      if (paletteOpen || event.metaKey || event.ctrlKey || event.altKey) return;
      const tag = event.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || event.target.isContentEditable) return;

      typed = (typed + event.key).slice(-4);
      if (typed === "1070") stage.cheer();

      const onPaneKey = event.target.closest?.("[data-pane-key]");
      const arrows = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
      const vim = { h: "left", l: "right", k: "up", j: "down" };
      if (vim[event.key]) {
        event.preventDefault();
        move(vim[event.key]);
      } else if (arrows[event.key] && onPaneKey) {
        event.preventDefault();
        move(arrows[event.key]);
      } else if (event.key === "z") {
        event.preventDefault();
        toggleZoom();
      } else if (event.key === "Escape" && zoomed) {
        toggleZoom();
      } else if (event.key === "/") {
        event.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move, paletteOpen, stage, toggleZoom, zoomed, one]);

  // The tool owns the whole window, scrollbars and overscroll included.
  useEffect(() => {
    document.documentElement.classList.add("panes-root");
    const theme = document.querySelector('meta[name="theme-color"]');
    const before = theme?.getAttribute("content");
    theme?.setAttribute("content", "#1a1813");
    return () => {
      document.documentElement.classList.remove("panes-root");
      if (before) theme?.setAttribute("content", before);
    };
  }, []);

  // Phone: a horizontal swipe moves between panes.
  const touch = useRef(null);
  const onTouchStart = (event) => {
    const t = event.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (event) => {
    if (!touch.current || !phone) return;
    const t = event.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 64 && Math.abs(dy) < 48) step(dx < 0 ? 1 : -1);
  };

  // Moves DOM focus to the pane's title too, or the palette would hand focus
  // back to the previous pane and pull the focus ring (and Justin) back.
  const wave = useCallback(
    (name) => {
      focusPane("agents", { focusTitle: true });
      setWaving(name);
      setTimeout(() => setWaving(null), 2400);
    },
    [focusPane],
  );

  const commands = useMemo(
    () => [
      ...PANES.map((p) => ({
        id: `go-${p.id}`,
        label: `Go to ${p.title}`,
        kind: "pane",
        run: () => focusPane(p.id, { focusTitle: true }),
      })),
      {
        id: "zoom",
        label: zoomed ? "Restore the layout" : "Zoom the focused pane",
        kind: "layout",
        run: () => toggleZoom(),
      },
      ...projects.map((project) => ({
        id: `open-${project.title}`,
        label: `Open ${project.title} on GitHub`,
        kind: "link",
        run: () => window.open(project.href, "_blank", "noreferrer"),
      })),
      {
        id: "open-github",
        label: "Open my GitHub",
        kind: "link",
        run: () => window.open("https://github.com/jlui17", "_blank", "noreferrer"),
      },
      {
        id: "open-linkedin",
        label: "Open my LinkedIn",
        kind: "link",
        run: () => window.open("https://www.linkedin.com/in/jlui17", "_blank", "noreferrer"),
      },
      { id: "hat", label: "Tip my hat", kind: "sprite", run: () => stage.tipHat() },
      { id: "ball", label: "Throw the ball for Truffle", kind: "sprite", run: () => stage.throwBall() },
      { id: "truffle", label: "Call Truffle over", kind: "sprite", run: () => stage.callTruffle() },
      { id: "sit", label: "Sit down for a bit", kind: "sprite", run: () => stage.sit() },
      { id: "sip", label: "Espresso break", kind: "sprite", run: () => stage.sip() },
      { id: "wave-luibot", label: "Wave to luibot", kind: "sprite", run: () => wave("luibot") },
      { id: "wave-luibuilder", label: "Wave to luibuilder", kind: "sprite", run: () => wave("luibuilder") },
      { id: "1070", label: "Episode 1070", kind: "sprite", run: () => stage.cheer() },
    ],
    [zoomed, focusPane, toggleZoom, stage, wave],
  );

  const paneProps = (id) => {
    const index = order.indexOf(id);
    return {
      pane: PANES[index],
      index,
      focused: focused === id,
      zoomed,
      hidden: one && focused !== id,
      onFocus: focusPane,
      onToggleZoom: toggleZoom,
      titleRef: (el) => {
        titleRefs.current[id] = el;
      },
    };
  };

  const truffleState = truffleWords[scene.truffle.pose];

  return (
    <div className="panes">
      <header className="pn__titlebar">
        <div className="pn__title-name">
          Justin Lui
          <Label>pronounced loo-wee</Label>
        </div>
        <button
          type="button"
          className="pn__palette-button"
          onClick={() => setPaletteOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={paletteOpen}
          aria-label="Open the command palette"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <circle cx="7" cy="7" r="4.6" />
            <path d="M10.5 10.5 14 14" strokeLinecap="round" />
          </svg>
          <span className="pn__palette-button-text">Search or run a command</span>
          <span className="pn__kbd" aria-hidden="true">
            ⌘K
          </span>
        </button>
        <SFClock hour={hour} className="pn__title-clock" />
      </header>

      <main
        ref={workRef}
        className={`pn__work${one ? " pn__work--zoomed" : ""}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Pane {...paneProps("hello")}>
          <div className="pn__hello">
            <div className="pn__prose">
              <div>
                <h1 className="pn__h1">Hi, I&rsquo;m Lui.</h1>
              </div>
              {intro.map((paragraph, i) => (
                <Prose key={i} paragraph={paragraph} />
              ))}
            </div>
            <dl className="pn__facts">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="pn__label">{fact.label.toLowerCase()}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
              <div className="pn__facts-links">
                <a className="pn__link" href="https://github.com/jlui17" target="_blank" rel="noreferrer">
                  GitHub ↗
                </a>
                <a
                  className="pn__link"
                  href="https://www.linkedin.com/in/jlui17"
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn ↗
                </a>
              </div>
            </dl>
          </div>
        </Pane>

        <Pane {...paneProps("people")}>
          <div className="pn__cards">
            {people.map((person) => (
              <Card
                key={person.name}
                name={person.name}
                tag={person.tag}
                heading={person.heading}
                body={person.body}
                tinted={person.girlfriend}
              >
                {person.name === "Truffle" && (
                  <Label className={`pn__card-live${scene.truffle.pose !== "sleep" ? " pn__card-live--awake" : ""}`}>
                    right now: {truffleState}
                  </Label>
                )}
              </Card>
            ))}
          </div>
        </Pane>

        <Pane {...paneProps("agents")}>
          <div className="pn__agents">
            {agents.map((agent, i) => (
              <Agent key={agent.name} agent={agent} waving={waving === agent.name} offsetMs={i * 2100} />
            ))}
          </div>
        </Pane>

        <Pane {...paneProps("someday")}>
          <div className="pn__three">
            {someday.map((entry) => (
              <Card key={entry.tag} tag={entry.tag} heading={entry.heading} body={entry.body} />
            ))}
          </div>
        </Pane>

        <Pane {...paneProps("now")}>
          <div className="pn__status-head">
            <Label>status</Label>
            <Label>updated {status.updated}</Label>
          </div>
          <div className="pn__status-rows">
            {status.entries.map((entry) => (
              <div key={entry.label}>
                <Label>{entry.label.toLowerCase()}</Label>
                <strong>{entry.value}</strong>
                <span>{entry.detail}</span>
              </div>
            ))}
          </div>
          <div className="pn__now">
            <Label>what I&rsquo;m up to</Label>
            <ul>
              {now.map((item, i) => (
                <li key={item}>
                  <span className="pn__mono">{String(i + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Pane>

        <Pane {...paneProps("home")}>
          <div className="pn__three">
            {home.map((entry) => (
              <Card key={entry.tag} tag={entry.tag} heading={entry.heading} body={entry.body} />
            ))}
          </div>
        </Pane>

        <Pane {...paneProps("built")}>
          <ul className="pn__projects">
            {projects.map((project) => (
              <li className="pn__project" key={project.title}>
                <div className="pn__project-head">
                  <a className="pn__project-title" href={project.href} target="_blank" rel="noreferrer">
                    {project.title}
                  </a>
                  <Label>{project.tag}</Label>
                </div>
                <p className="pn__project-kicker">{project.kicker}</p>
                <p className="pn__project-story">{project.story}</p>
              </li>
            ))}
          </ul>
        </Pane>
      </main>

      {/* The sprites are decoration with a pointer bonus: a click on Justin
          tips his hat, on Truffle sits her up, on the ball throws it. Every
          one of these is also a palette command, so nothing here is the only
          way to do a thing. */}
      <div className="pn__stage" aria-hidden="true">
        <span
          className="pn__actor"
          data-actor="justin"
          data-pose={scene.justin.pose}
          data-frame={scene.justin.frame ?? ""}
          data-flip={scene.justin.flip}
          style={{ transform: `translateX(${scene.justin.left}px)` }}
          onClick={() => stage.tipHat()}
        >
          <Sprite
            character="justin"
            action={scene.justin.pose}
            outfit={outfit}
            scale={1}
            flip={scene.justin.flip}
            frame={scene.justin.frame}
          />
        </span>
        <span
          className="pn__actor"
          data-actor="truffle"
          data-pose={scene.truffle.pose}
          data-frame={scene.truffle.frame ?? ""}
          data-flip={scene.truffle.flip}
          style={{ transform: `translateX(${scene.truffle.left}px)` }}
          onClick={() => stage.pet()}
        >
          <Sprite
            character="truffle"
            action={scene.truffle.pose}
            scale={1}
            flip={scene.truffle.flip}
            frame={scene.truffle.frame}
          />
        </span>
        <span
          className="pn__actor"
          data-actor="ball"
          data-frame={scene.ball.frame}
          style={{ transform: `translateX(${scene.ball.left}px)` }}
          onClick={() => stage.throwBall()}
        >
          <Pixels sheet={ballSheet} action="roll" frame={scene.ball.frame} />
        </span>
      </div>

      <footer className="pn__statusbar">
        <nav className="pn__segments" aria-label="Panes">
          {PANES.map((p, i) => (
            <button
              key={p.id}
              ref={(el) => {
                segmentRefs.current[p.id] = el;
              }}
              type="button"
              className="pn__segment"
              data-pane-key
              aria-current={focused === p.id ? "true" : undefined}
              onClick={() => focusPane(p.id, { scroll: true })}
            >
              <span className="pn__segment-n" aria-hidden="true">
                {i + 1}
              </span>
              {p.title}
            </button>
          ))}
        </nav>
        <div className="pn__hints">
          <span className="pn__hint">
            <b>⌘K</b> palette
          </span>
          <span className="pn__hint">
            <b>h j k l</b> move
          </span>
          <span className="pn__hint">
            <b>z</b> {zoomed ? "restore" : "zoom"}
          </span>
          <SFClock hour={hour} />
        </div>
      </footer>

      {paletteOpen && <Palette commands={commands} onClose={() => setPaletteOpen(false)} />}
    </div>
  );
}
