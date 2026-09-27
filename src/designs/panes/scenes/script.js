import { useEffect, useState } from "react";

export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// A scene's steps, one after another: `run(wait)` awaits `wait(ms)` between
// them. Returns the cancel; a cancelled script stops at its pending wait.
export function script(run) {
  let timer;
  run((ms) => new Promise((resolve) => (timer = setTimeout(resolve, ms))));
  return () => clearTimeout(timer);
}

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

// Whether luibot's chore in a scene is done (the sign lit, the feed poured).
// The pathway says so when it flies him there (`done` is a boolean); left
// undefined, the scene keeps its own time: done `delay` ms after it opens.
// Under reduced motion nobody flies, so it is done from the first paint.
export function useChore(done, delay) {
  const [own, setOwn] = useState(false);
  const driven = done !== undefined;
  useEffect(() => {
    if (driven || reducedMotion()) return undefined;
    const id = setTimeout(() => setOwn(true), delay);
    return () => clearTimeout(id);
  }, [driven, delay]);
  return reducedMotion() || (done ?? own);
}
