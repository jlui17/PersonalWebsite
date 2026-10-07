import { useEffect, useState } from "react";

export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// A scene's steps, one after another: `run(wait)` awaits `wait(ms)` between
// them. Returns the cancel; a cancelled script stops at its pending wait.
export function script(run) {
  let timer;
  run((ms) => new Promise((resolve) => (timer = setTimeout(resolve, ms))));
  return () => clearTimeout(timer);
}

// Resolves once the page has painted a frame in which `shown()` is true, so
// a frame that a late timer set is never skipped: the one rule for every beam
// (the robots' between places, luibuilder's between projects). A hidden tab
// paints nothing, so there it resolves at once, and after a second it gives up
// (the actor went away meanwhile).
export const painted = (shown) =>
  new Promise((resolve) => {
    const start = performance.now();
    if (document.hidden) return resolve();
    requestAnimationFrame(function look() {
      if (document.hidden || performance.now() - start > 1000) return resolve();
      if (!shown()) return requestAnimationFrame(look);
      requestAnimationFrame(() => resolve()); // the frame that showed it has been painted
    });
  });

// Whether the element is in view (in the window and not scrolled out of its
// pane): a scene's loops and one-shots run only then.
export function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

// Whether luibot's chore in a scene is done (the sign lit, the feed poured):
// the pathway says so when it flies him there (`done`), on a phone too. Under
// reduced motion nobody flies, so it is done from the first paint.
export function useChore(done) {
  return reducedMotion() || done;
}
