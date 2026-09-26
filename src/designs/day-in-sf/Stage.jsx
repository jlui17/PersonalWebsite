import { useEffect, useRef, useState } from "react";
import { Sprite } from "../../sprites/Sprite.jsx";
import { day } from "./day.js";
import { hoodieFrom, scenes } from "./scenes.js";
import { Pixels, props } from "./props.jsx";

const SPACING = 150; // sprite pixels from one scene's anchor to the next
const ARRIVE = 6; // within this many sprite pixels of an anchor he stops and acts
const DWELL = 0.55; // he stays at a scene for this share of its section, then walks
const LINE = 0.45; // a part is current once its top passes this share of the viewport height
const STRIDE = 12; // sprite pixels of travel per walk frame
const TRUFFLE_WAIT = 700; // ms she stays down after he has settled somewhere new
const TRUFFLE_TROT = 1200; // ms her trot takes at most, however far he went

const hoodieIndex = day.findIndex((part) => part.id === hoodieFrom);
const sportIndex = day.findIndex((part) => part.id === "sport");

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function useMedia(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

// The fixed strip along the bottom of the viewport. The set slides with the
// scroll so that each part's scene is under Justin while that part is being
// read; he walks the gaps in between. Truffle is one character too: she lies
// where he last settled, and once he has settled somewhere new she gets up,
// trots after him and lies down again. `rootRef` is the page root, which holds
// the sections (data-day) and takes the data-light palette.
export default function Stage({ rootRef }) {
  const scale = useMedia("(max-width: 720px)") ? 2 : 3;
  const setRef = useRef(null);
  const overRef = useRef(null);
  const truffleRef = useRef(null);
  const hatTimer = useRef(0);
  const [justinX, setJustinX] = useState(() => Math.round(window.innerWidth * 0.36));
  const [pose, setPose] = useState({ at: 0, nearest: 0, walking: false, left: false, frame: 0 });
  const [truffle, setTruffle] = useState({ action: scenes[day[0].id].truffle.action, left: false });
  const [cheer, setCheer] = useState(false);
  const [hatTip, setHatTip] = useState(false);
  const [earUp, setEarUp] = useState(false);
  const [ball, setBall] = useState(false);
  const rolled = useRef(false);

  // Her spot at a scene, in set pixels.
  const truffleSpot = (i) => (i * SPACING + scenes[day[i].id].truffle.dx) * scale;

  useEffect(() => {
    const root = rootRef.current;
    const sections = [...root.querySelectorAll("[data-day]")];
    let tops = [];
    let lastY = window.scrollY;
    let left = false;
    let lastScrollAt = 0;
    let raf = 0;
    let settle = 0;
    let light = null;

    // Truffle's position and errand. `target` is where she is or is heading.
    let tX = truffleSpot(0);
    let target = tX;
    let targetScene = 0;
    let wait = 0;
    let trotRaf = 0;
    let trotFrom = 0;
    let trotStart = 0;
    let trotFor = 0;
    truffleRef.current.style.left = `${tX}px`;

    const lieDown = () => setTruffle({ action: scenes[day[targetScene].id].truffle.action, left: false });

    const trot = (now) => {
      const t = Math.min(1, (now - trotStart) / trotFor);
      const ease = t * (2 - t);
      tX = trotFrom + (target - trotFrom) * ease;
      truffleRef.current.style.left = `${tX}px`;
      if (t < 1) {
        trotRaf = requestAnimationFrame(trot);
      } else {
        trotRaf = 0;
        lieDown();
      }
    };

    const follow = (i) => {
      const spot = truffleSpot(i);
      if (spot === target) return;
      target = spot;
      targetScene = i;
      const up = trotRaf !== 0;
      clearTimeout(wait);
      cancelAnimationFrame(trotRaf);
      trotRaf = 0;
      if (reducedMotion()) {
        tX = target;
        truffleRef.current.style.left = `${tX}px`;
        lieDown();
        return;
      }
      const start = () => {
        trotFrom = tX;
        trotStart = performance.now();
        trotFor = Math.min(TRUFFLE_TROT, (Math.abs(target - tX) / (40 * scale)) * 1000);
        setTruffle({ action: "walk", left: target < tX });
        trotRaf = requestAnimationFrame(trot);
      };
      // Already on her feet: she just changes direction.
      if (up) start();
      else wait = setTimeout(start, TRUFFLE_WAIT);
    };

    // He left before she got up: she stays where she is.
    const stayDown = () => {
      if (trotRaf) return;
      clearTimeout(wait);
      target = tX;
    };

    const measure = () => {
      tops = sections.map((s) => s.getBoundingClientRect().top + window.scrollY);
      setJustinX(Math.round(window.innerWidth * 0.36));
    };

    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const line = y + window.innerHeight * LINE;
      let i = tops.findLastIndex((top) => top <= line);
      if (i < 0) i = 0;
      let offset = i;
      if (i < tops.length - 1) {
        // The first part starts above the line on load; its dwell counts from there.
        const start = Math.max(tops[i], window.innerHeight * LINE);
        const t = (line - start) / (tops[i + 1] - start);
        offset += Math.min(1, Math.max(0, (t - DWELL) / (1 - DWELL)));
      }
      const x = Math.round(window.innerWidth * 0.36) - offset * SPACING * scale;
      setRef.current.style.transform = `translateX(${x}px)`;
      overRef.current.style.transform = `translateX(${x}px)`;

      if (day[i].light !== light) {
        light = day[i].light;
        root.dataset.light = light;
        document.body.style.backgroundColor = getComputedStyle(root).getPropertyValue("--dsf-bg");
      }

      if (y !== lastY) {
        left = y < lastY;
        lastY = y;
      }
      const nearest = Math.round(offset);
      const at = Math.abs(offset - nearest) * SPACING < ARRIVE ? nearest : null;
      if (at === null) stayDown();
      else follow(at);
      const walking = at === null && performance.now() - lastScrollAt < 240 && !reducedMotion();
      const frame = Math.floor((offset * SPACING) / STRIDE) % 4;
      setPose((p) =>
        p.at === at && p.nearest === nearest && p.walking === walking && p.left === left && (!walking || p.frame === frame)
          ? p
          : { at, nearest, walking, left, frame: walking ? frame : p.frame },
      );
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onScroll = () => {
      lastScrollAt = performance.now();
      schedule();
      clearTimeout(settle);
      settle = setTimeout(update, 260);
    };
    const onResize = () => {
      measure();
      schedule();
    };
    const observer = new ResizeObserver(onResize);

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    observer.observe(root);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(settle);
      clearTimeout(wait);
      cancelAnimationFrame(trotRaf);
    };
  }, [rootRef, scale]);

  // The ball rolls past once, the first time he reaches the net.
  useEffect(() => {
    if (pose.at === sportIndex && !rolled.current && !reducedMotion()) {
      rolled.current = true;
      setBall(true);
    }
  }, [pose.at]);

  // Typing 1070 (his favourite episode) gets both arms up for a moment.
  useEffect(() => {
    let typed = "";
    let timer = 0;
    const onKey = (e) => {
      if (e.key.length !== 1) return;
      typed = (typed + e.key).slice(-4);
      if (typed !== "1070") return;
      setCheer(true);
      clearTimeout(timer);
      timer = setTimeout(() => setCheer(false), 2400);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(timer);
    };
  }, []);

  // Point at him and he tips his hat. Touch has no hover, so a tap does it for a moment.
  const tapJustin = (e) => {
    if (e.pointerType === "mouse") return;
    setHatTip(true);
    clearTimeout(hatTimer.current);
    hatTimer.current = setTimeout(() => setHatTip(false), 1500);
  };

  // Truffle lifts an ear when the pointer comes near her.
  const onPointerMove = (e) => {
    const r = truffleRef.current.getBoundingClientRect();
    setEarUp(Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < 56);
  };

  const place = (dx, dy = 0) => ({
    left: dx * scale,
    bottom: `calc(var(--dsf-ground) + ${dy * scale}px)`,
  });

  const scene = pose.at === null ? null : scenes[day[pose.at].id];
  const standing = !pose.walking && (!scene || scene.justin.action === "idle" || scene.justin.action === "sip");
  let action = pose.walking ? "walk" : scene ? scene.justin.action : "idle";
  if (cheer) action = "arms-up";
  else if (hatTip && standing) action = "hat";
  const outfit = pose.nearest >= hoodieIndex ? "hoodie" : "overshirt";

  return (
    <div
      className="dsf-stage"
      style={{ "--dsf-scale": scale }}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerMove}
      onPointerLeave={() => setEarUp(false)}
      aria-hidden="true"
    >
      <div className="dsf-set" ref={setRef}>
        {day.map((part, i) => {
          const s = scenes[part.id];
          const here = pose.at === i;
          return (
            <div className="dsf-scene" key={part.id} style={{ left: i * SPACING * scale }}>
              {s.under.map((piece, j) => (
                <div className="dsf-piece" key={j} style={place(piece.dx, piece.dy)}>
                  <Pixels rows={piece.rows} scale={scale} />
                </div>
              ))}
              {s.glow && (
                <div
                  className={s.glow.screen ? "dsf-glow dsf-glow--screen" : "dsf-glow"}
                  style={place(s.glow.dx, s.glow.dy)}
                />
              )}
              {s.steam && (
                <div className="dsf-steam" style={place(s.steam.dx, s.steam.dy)}>
                  <i />
                  <i />
                  <i />
                </div>
              )}
              {s.robots?.map((robot) => (
                <div className="dsf-piece" key={robot.character} style={place(robot.dx, robot.dy)}>
                  <Sprite character={robot.character} action="idle" scale={scale} frame={here ? undefined : 0} />
                </div>
              ))}
              {i === sportIndex && ball && (
                <div className="dsf-ball" style={place(60)} onAnimationEnd={() => setBall(false)}>
                  <Pixels rows={props.ball} scale={scale} />
                </div>
              )}
            </div>
          );
        })}
        <div className="dsf-piece" ref={truffleRef} style={{ bottom: "var(--dsf-ground)" }}>
          <Sprite
            character="truffle"
            action={earUp && truffle.action === "sleep" ? "ear" : truffle.action}
            scale={scale}
            flip={truffle.left}
          />
        </div>
      </div>

      <div
        className="dsf-justin"
        style={{ left: justinX, bottom: `calc(var(--dsf-ground) + ${(pose.walking ? 0 : (scene?.justin.dy ?? 0)) * scale}px)` }}
        onPointerEnter={() => setHatTip(true)}
        onPointerLeave={() => setHatTip(false)}
        onPointerDown={tapJustin}
      >
        <Sprite
          character="justin"
          action={action}
          outfit={outfit}
          scale={scale}
          flip={pose.at === null && pose.left}
          frame={pose.walking ? pose.frame : undefined}
        />
      </div>

      <div className="dsf-set dsf-set--over" ref={overRef}>
        {day.map((part, i) => (
          <div className="dsf-scene" key={part.id} style={{ left: i * SPACING * scale }}>
            {scenes[part.id].over?.map((piece, j) => (
              <div className="dsf-piece" key={j} style={place(piece.dx, piece.dy)}>
                <Pixels rows={piece.rows} scale={scale} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
