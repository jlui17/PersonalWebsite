import { useEffect, useRef, useState } from "react";
import { Sprite } from "../../sprites/Sprite.jsx";

// Trailhead and summit are the Grouse Grind's, Vancouver's stair-climb of a hike.
// He layers up past HOODIE_AT because it is colder up there.
export const ELEVATION = { trailhead: 274, summit: 1127 };
const HOODIE_AT = 800;

const SCALE = 3;
const JUSTIN_W = 18 * SCALE;
const SPEED = { justin: 84, truffle: 52 }; // px per second, a calm walk
const GAP = 46; // Truffle stops this far behind him
const TRUFFLE_DELAY = 900;
const NAP_AFTER = 5000;
const CHEER_FOR = 1800;
const EDGE = 8;
const ALTIMETER_W = 104; // the readout at the right end of the line; nobody walks under it

export const formatElevation = (m) => `${m.toLocaleString("en-US")} m`;

const scrollProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
};

export function Companions() {
  const lineRef = useRef(null);
  const altimeterRef = useRef(null);
  const justinRef = useRef(null);
  const truffleRef = useRef(null);

  const [justin, setJustin] = useState({ action: "idle", flip: false, outfit: "overshirt" });
  const [truffle, setTruffle] = useState({ action: "sleep", flip: false });

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(pointer: coarse)").matches;

    const range = () => window.innerWidth - EDGE - JUSTIN_W - ALTIMETER_W;
    const startX = EDGE + range() * 0.15;

    // Positions live in refs and go straight to the DOM; React only hears about
    // action/flip/outfit changes, which are rare.
    // cheerAt: 0 none, -1 requested (stamped with the loop's clock on the next frame).
    const j = { x: startX, target: startX, flip: false, cheerAt: 0, summitAt: 0 };
    const t = { x: startX - GAP - 20, target: startX - GAP - 20, flip: false, wakeAt: 0, napAt: 0, mode: "sleep" };
    const cursor = { x: -1, y: -1 };
    let atSummit = false;
    let frame = 0;
    let last = 0;

    const place = () => {
      justinRef.current.style.transform = `translateX(${Math.round(j.x)}px)`;
      truffleRef.current.style.transform = `translateX(${Math.round(t.x)}px)`;
    };

    const readScroll = () => {
      const progress = scrollProgress();
      const elevation = Math.round(
        ELEVATION.trailhead + progress * (ELEVATION.summit - ELEVATION.trailhead),
      );
      altimeterRef.current.textContent = formatElevation(elevation);
      setJustin((s) => {
        const outfit = elevation >= HOODIE_AT ? "hoodie" : "overshirt";
        return s.outfit === outfit ? s : { ...s, outfit };
      });
      atSummit = progress > 0.985;
      if (touch) j.target = EDGE + progress * range();
    };

    if (still) {
      place();
      readScroll();
      window.addEventListener("scroll", readScroll, { passive: true });
      return () => window.removeEventListener("scroll", readScroll);
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(step);
    };

    const cursorOver = (x, width, reach) => {
      if (cursor.x < 0) return false;
      const lineY = lineRef.current.getBoundingClientRect().top;
      return Math.abs(cursor.x - (x + width / 2)) < width && cursor.y < lineY && cursor.y > lineY - reach;
    };

    const step = (now) => {
      frame = 0;
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      let busy = false;

      // Justin walks toward his target, then does whatever the spot calls for.
      const dx = j.target - j.x;
      const walking = Math.abs(dx) > 1;
      if (walking) {
        j.x += Math.sign(dx) * Math.min(Math.abs(dx), SPEED.justin * dt);
        j.flip = dx < 0;
        t.target = j.x + (dx < 0 ? GAP + 6 : -GAP);
        if (t.mode !== "walk") t.wakeAt = t.wakeAt || now + TRUFFLE_DELAY;
        j.summitAt = 0;
        busy = true;
      }
      if (j.cheerAt < 0) j.cheerAt = now;
      if (j.cheerAt && now - j.cheerAt >= CHEER_FOR) j.cheerAt = 0;
      let action = "idle";
      if (walking) action = "walk";
      else if (j.cheerAt) action = "arms-up";
      else if (atSummit) {
        // First time he arrives at the top: arms up once, then he sits.
        if (!j.summitAt) j.summitAt = now;
        action = now - j.summitAt < CHEER_FOR ? "arms-up" : "sit";
        if (action === "sit") {
          t.target = j.x + 26 * SCALE + 6;
          t.wakeAt = t.wakeAt || now + TRUFFLE_DELAY;
        } else busy = true;
      } else if (cursorOver(j.x, JUSTIN_W, 200)) action = "hat";
      if (j.cheerAt) busy = true;
      const jFlip = action === "walk" ? j.flip : action === "sit" ? false : j.flip;
      setJustin((s) =>
        s.action === action && s.flip === jFlip ? s : { ...s, action, flip: jFlip },
      );

      // Truffle: a delay, a slow trot, a sit, and after a while, back to sleep.
      let tAction = t.mode;
      const tdx = t.target - t.x;
      if (t.wakeAt && now >= t.wakeAt) {
        if (Math.abs(tdx) > 4) {
          t.mode = "walk";
          t.x += Math.sign(tdx) * Math.min(Math.abs(tdx), SPEED.truffle * dt);
          t.flip = tdx < 0;
          t.napAt = 0;
          busy = true;
        } else if (t.mode === "walk") {
          t.mode = "sit";
          t.napAt = now + NAP_AFTER;
          t.wakeAt = 0;
        } else {
          t.wakeAt = 0;
        }
      } else if (t.wakeAt) {
        busy = true;
      }
      if (t.napAt) {
        if (now >= t.napAt) {
          t.mode = "sleep";
          t.napAt = 0;
        } else busy = true;
      }
      tAction = t.mode;
      if (t.mode === "sleep" && cursorOver(t.x, 18 * SCALE, 90)) tAction = "ear";
      // Sitting and sleeping she faces right; asleep, the head is on the right.
      const tFlip = t.mode === "walk" ? t.flip : t.mode === "sit" ? t.flip : false;
      setTruffle((s) =>
        s.action === tAction && s.flip === tFlip ? s : { action: tAction, flip: tFlip },
      );

      place();
      if (busy) schedule();
    };

    const onPointer = (e) => {
      cursor.x = e.clientX;
      cursor.y = e.clientY;
      if (!touch) {
        j.target = Math.min(EDGE + range(), Math.max(EDGE, e.clientX - JUSTIN_W / 2));
      }
      schedule();
    };
    const onScroll = () => {
      readScroll();
      schedule();
    };
    const onResize = () => {
      j.target = Math.min(j.target, EDGE + range());
      schedule();
    };

    // Typing 1070 anywhere on the page: his favourite episode.
    let typed = "";
    const onKey = (e) => {
      if (e.key.length !== 1) return;
      typed = (typed + e.key).slice(-4);
      if (typed === "1070") {
        j.cheerAt = -1;
        schedule();
      }
    };

    place();
    readScroll();
    schedule();
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="trail__ground" aria-hidden="true">
      <div className="trail__ground-line" ref={lineRef}>
        <div className="trail__walker" ref={truffleRef}>
          <Sprite character="truffle" action={truffle.action} scale={SCALE} flip={truffle.flip} />
        </div>
        <div className="trail__walker" ref={justinRef}>
          <Sprite
            character="justin"
            action={justin.action}
            outfit={justin.outfit}
            scale={SCALE}
            flip={justin.flip}
          />
        </div>
      </div>
      <span className="trail__mono trail__altimeter" ref={altimeterRef}>
        {formatElevation(ELEVATION.trailhead)}
      </span>
    </div>
  );
}
