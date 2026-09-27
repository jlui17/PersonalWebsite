import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Sprite, characters } from "../../../sprites/Sprite.jsx";
import "./scenes.css";

// Pane 6: luibuilder works on the projects. He stands on a project's rule
// right after its title and tag (as the robots stand beside their names in
// pane 3), his stack of stones between the words and him, so the hammer
// swings towards the title: he is building THAT project (Justin: "it should
// be doing those 'building' animations beside the titles, not to the far
// right"). Now and then he hammers (`build`, stepped here frame by frame),
// then moves to another project.
//
// He never travels across the pane (between two rules lie titles and
// paragraphs, and Justin found robots floating about noisy: "they kinda like
// light beam themselves to their spot"). He beams out where he stands
// (`beam-out`), is nowhere for a moment, beams in at the next project
// (`beam-in`, whose last frame is `stand`), and gives one small hop in place
// ("they can slightly move around if they want after they teleport").
//
// His rest is `stand`, never `idle` (idle holds a stone block the working
// poses lack). All his canvases share their left edge and the body's place in
// them; `hop` is the widest, so the spot is reserved for it.

const sheet = characters.luibuilder;
const BUILD = sheet.actions.build.durations;
const HOP = sheet.actions.hop.durations;
const BEAM = sheet.actions["beam-out"].durations;
const ARC = 8; // px his hop in place rises above the rule
const GONE = 150; // ms between beaming out and beaming in
const FADE = 44; // px the pane fades at its foot while more lies below (`.pn__pane-body[data-more]`)
const HEIGHT = sheet.actions.hop.frames[0].length;
const WIDTH = sheet.actions.hop.frames[0][0].length;
const ROUNDS = 4; // working rounds with no visitor input before he stops
const REST = { action: "stand", frame: undefined, y: 0 };
const STAND_W = sheet.actions.stand.frames[0][0].length;
const STAND_H = sheet.actions.stand.frames[0].length;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const BuilderContext = createContext(null);

// `present` is false while he is still on his way up from the pathway (or
// down): his spot keeps its size and nothing is drawn in it.
export function BuilderScene({ children, present = true }) {
  const root = useRef(null);
  const [builder, setBuilder] = useState({ at: 0, ...REST });

  useEffect(() => {
    if (reducedMotion()) return undefined;
    const el = root.current;
    const body = el.closest(".pn__pane-body");
    let timer;
    let raf;
    let at = 0;
    let idleRounds = 0;
    let scrolledAt = 0;
    let onInput = null;

    const show = (next) => setBuilder({ at, ...REST, ...next });
    const wait = (ms) => new Promise((resolve) => (timer = setTimeout(resolve, ms)));
    const glide = (from, to, ms, ease) =>
      new Promise((resolve) => {
        const start = performance.now();
        raf = requestAnimationFrame(function step(now) {
          const t = Math.min(1, (now - start) / ms);
          show({ action: "hop", frame: 1, y: Math.round(from + (to - from) * ease(t)) });
          if (t < 1) raf = requestAnimationFrame(step);
          else resolve();
        });
      });
    const rising = (t) => 1 - (1 - t) * (1 - t);
    const falling = (t) => t * t;

    // He keeps still while the visitor scrolls the pane, points at or tabs to
    // a project link, or selects text.
    const busy = () =>
      performance.now() - scrolledAt < 600 ||
      !!el.querySelector("a:hover, a:focus-visible") ||
      !document.getSelection().isCollapsed;
    const calm = async () => {
      while (busy()) await wait(600);
    };

    // A project is in view when his whole box is inside the pane's window,
    // clear of the fade the pane lays over its last lines while more is below.
    const spots = () => [...el.querySelectorAll("[data-builder-spot]")];
    const inView = (spot) => {
      if (!spot) return false;
      const s = spot.getBoundingClientRect(); // his feet; he stands HEIGHT + ARC above them
      const b = body.getBoundingClientRect();
      const fade = body.hasAttribute("data-more") ? FADE : 0;
      return s.bottom - HEIGHT - ARC >= b.top && s.bottom <= b.bottom - fade;
    };
    const seen = () => inView(spots()[at]);
    const othersInView = () =>
      spots()
        .map((spot, i) => (i !== at && inView(spot) ? i : -1))
        .filter((i) => i >= 0);

    const input = () => {
      idleRounds = 0;
      onInput?.();
    };
    const scrolled = () => {
      scrolledAt = performance.now();
    };
    const inputs = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"];
    inputs.forEach((name) => window.addEventListener(name, input, { passive: true }));
    body.addEventListener("scroll", scrolled, { passive: true });

    (async () => {
      await wait(2500);
      for (;;) {
        if (idleRounds >= ROUNDS) await new Promise((resolve) => (onInput = resolve));
        onInput = null;
        idleRounds += 1;

        // He works only where the visitor can see him.
        await calm();
        if (seen()) {
          const strikes = 2 + Math.round(Math.random());
          for (let s = 0; s < strikes; s += 1)
            for (let f = 0; f < BUILD.length; f += 1) {
              show({ action: "build", frame: f });
              await wait(BUILD[f]);
            }
          show(REST);
          await wait(900);
          await calm();
        }

        // On to a project the visitor can see; with none in view he stays.
        if (othersInView().length) {
          if (seen())
            for (let f = 0; f < BEAM.length; f += 1) {
              show({ action: "beam-out", frame: f });
              await wait(BEAM[f]);
            }
          at = -1; // nowhere
          show(REST);
          await wait(GONE);
          // Where he lands is chosen only now: the visitor may have scrolled
          // while he was beaming out. He stays nowhere until the pane is
          // still and a project is in view.
          let landing = [];
          while (!landing.length) {
            await calm();
            landing = othersInView();
            if (!landing.length) await wait(400);
          }
          at = landing[Math.floor(Math.random() * landing.length)];
          for (let f = 0; f < BEAM.length; f += 1) {
            show({ action: "beam-in", frame: f });
            await wait(sheet.actions["beam-in"].durations[f]);
          }
          show(REST);
          await wait(500);
          show({ action: "hop", frame: 0 });
          await wait(HOP[0]);
          await glide(0, ARC, HOP[1] / 2, rising);
          await glide(ARC, 0, HOP[1] / 2, falling);
          show({ action: "hop", frame: 2 });
          await wait(HOP[2]);
          show(REST);
        }

        // He rests 10 to 14 s; once his project has been scrolled out of view
        // and another is in view, the rest is over.
        const rested = performance.now() + 10000 + Math.random() * 4000;
        while (performance.now() < rested) {
          await wait(500);
          if (!busy() && !seen() && othersInView().length) break;
        }
      }
    })();

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      inputs.forEach((name) => window.removeEventListener(name, input));
      body.removeEventListener("scroll", scrolled);
    };
  }, []);

  // His box follows the words on the head's last line. Where he would then
  // stand over words (the box alone on a new line under the title, or beside
  // a tag that sits under a longer title), the box takes a line of its own,
  // as tall as he is, on the same rule. Settled from the layout alone, for
  // every head, so nothing moves when he comes or goes.
  useLayoutEffect(() => {
    const el = root.current;
    const settle = () => {
      const spots = [...el.querySelectorAll("[data-builder-spot]")];
      spots.forEach((spot) => spot.removeAttribute("data-own-line"));
      spots.forEach((spot) => {
        const box = spot.getBoundingClientRect();
        const top = box.bottom - HEIGHT - ARC;
        const words = [...spot.parentElement.children]
          .filter((child) => child !== spot)
          .flatMap((child) => {
            const range = document.createRange();
            range.selectNodeContents(child);
            return [...range.getClientRects()];
          });
        if (words.some((w) => w.right > box.left && w.left < box.right && w.bottom > top && w.top < box.bottom))
          spot.setAttribute("data-own-line", "");
      });
    };
    settle();
    const observer = new ResizeObserver(settle);
    observer.observe(el);
    document.fonts.ready.then(settle);
    return () => observer.disconnect();
  }, []);

  return (
    <BuilderContext.Provider value={{ ...builder, present }}>
      <div className="pn-built" ref={root} style={{ "--builder-w": `${WIDTH}px`, "--builder-work-w": `${STONES_W}px`, "--builder-h": `${HEIGHT + ARC}px` }}>
        {children}
      </div>
    </BuilderContext.Provider>
  );
}

// What he hammers: the `stones` prop, two courses of the stone block his
// `idle` pose rests a hand on. Its canvas ends one column left of his, where
// `build` lands the hammer; on the strike frame (`build` f1) the upper block
// jumps a row and a chip flies (`strike`). It stands only where he stands at
// rest or at work: it does not beam with him, and on an empty rule a lone
// post read as a stray caret.
const STONES_W = characters.stones.actions.idle.frames[0][0].length;

// His place on one project's rule: the stones and luibuilder when he is here.
// Every project keeps the box, so no title moves when he comes or goes.
export function BuilderSpot({ index }) {
  const builder = useContext(BuilderContext);
  const here = builder?.at === index;
  return (
    <span className="pn-builder-spot" data-builder-spot aria-hidden="true">
      {here && builder.present && !builder.action.startsWith("beam") && (
        <span className="pn-builder-stones">
          <Sprite character="stones" action={builder.action === "build" && builder.frame === 1 ? "strike" : "idle"} scale={1} />
        </span>
      )}
      {here && !builder.present && <span className="pn-builder" data-action="away" style={{ width: STAND_W, height: STAND_H }} />}
      {here && builder.present && (
        <span
          className="pn-builder"
          data-action={builder.action}
          data-frame={builder.frame ?? ""}
          style={{ transform: `translateY(${-builder.y}px)` }}
        >
          <Sprite character="luibuilder" action={builder.action} frame={builder.frame} scale={1} />
        </span>
      )}
    </span>
  );
}
