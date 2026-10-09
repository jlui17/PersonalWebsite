import { useCallback, useEffect, useRef, useState } from "react";

// TEMPORARY, until Justin picks: the trial versions of the page, flipped on
// the page by the Trial control in the title bar (in the bottom right corner
// of a narrow window) and kept in the URL
// (?top=, ?agents=), so a shared link opens the same version. The first
// option of each is the default.
// top: where the steps are. a, b and c put them at the top of the window in
//   place of the column of cards (tabs, signs, a timeline); old keeps the
//   pathway at the bottom and the cards.
// agents: how pane 2 ranks the robots' names above everything else in it.
//   a: the agents side by side, each name the largest thing in its column,
//   the hook as a quiet line over them. b: one grid for the whole pane, the
//   skim level (each robot's name and sprite, each part's heading) in a
//   column on the left and the details on the right, with no hook.
export const TRIALS = {
  top: { label: "Steps", options: { a: "Tabs", b: "Signs", c: "Timeline", old: "Old" } },
  agents: { label: "Pane 2", options: { a: "Side by side", b: "Names on the left" } },
};

const fromUrl = () => {
  const query = new URLSearchParams(window.location.search);
  return Object.fromEntries(
    Object.entries(TRIALS).map(([key, { options }]) => [key, Object.hasOwn(options, query.get(key) ?? "") ? query.get(key) : Object.keys(options)[0]]),
  );
};

// The version on show, and a way to pick another: the page changes at once,
// and the URL follows (the open step's hash and any other setting kept).
export function useTrial() {
  const [trial, setTrial] = useState(fromUrl);
  const pick = useCallback((key, value) => {
    setTrial((t) => ({ ...t, [key]: value }));
    const query = new URLSearchParams(window.location.search);
    query.set(key, value);
    window.history.replaceState(null, "", `${window.location.pathname}?${query}${window.location.hash}`);
  }, []);
  return [trial, pick];
}

// A dashed button that says what it is, and under it one row of choices per
// trial; the one on show is amber with a filled dot. It stays open while
// Justin flips, and closes on Escape, on a click outside it, or on itself.
export function TrialPicker({ trial, onPick }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const away = (event) => !root.current?.contains(event.target) && setOpen(false);
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);
  return (
    <div
      className="pn__trial"
      ref={root}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !open) return;
        event.stopPropagation(); // the window's own Escape is for the panes
        setOpen(false);
        root.current.querySelector(".pn__trial-button").focus();
      }}
    >
      <button type="button" className="pn__trial-button" aria-expanded={open} aria-controls="pn-trial-panel" onClick={() => setOpen((o) => !o)}>
        Trial
        <svg className={`pn__chevron${open ? " pn__chevron--open" : ""}`} viewBox="0 0 10 10" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.5 2 7 5 3.5 8" />
        </svg>
      </button>
      {open && (
        <div className="pn__trial-panel" id="pn-trial-panel">
          {Object.entries(TRIALS).map(([key, { label, options }]) => (
            <div key={key} className="pn__trial-row" role="group" aria-labelledby={`pn-trial-${key}`}>
              <span className="pn__trial-label" id={`pn-trial-${key}`}>
                {label}
              </span>
              {/* buttons, not radios: after a click the arrow keys still walk the steps, as from any button on the page */}
              {Object.entries(options).map(([value, name]) => (
                <button key={value} type="button" className="pn__trial-option" aria-pressed={trial[key] === value} onClick={() => onPick(key, value)}>
                  <span className="pn__dot" aria-hidden="true" />
                  {name}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
