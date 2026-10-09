import { useCallback, useState } from "react";

// TEMPORARY, until Justin picks: the trial versions of the page, flipped on
// the page by the Trial control (in the title bar, or at the window's foot
// on a narrow window) and kept in the URL
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

// One row of choices per trial, always on show, so flipping never hides
// what is being compared; the one on show is amber in a box. Rendered in two
// places and shown in one (panes.css): `bar`, two small rows in the title
// bar on a wide window, and `foot`, one row in a slim bar of its own at the
// window's foot where the title bar has no room (it covers nothing, and it
// comes last in the Tab order).
export function TrialPicker({ trial, onPick, where }) {
  return (
    <div className={`pn__trial pn__trial--${where}`} role="group" aria-label="Trial versions">
      {Object.entries(TRIALS).map(([key, { label, options }]) => (
        <div key={key} className="pn__trial-row" role="group" aria-labelledby={`pn-trial-${where}-${key}`}>
          <span className="pn__trial-label" id={`pn-trial-${where}-${key}`}>
            {label}
          </span>
          {/* buttons, not radios: after a click the arrow keys still walk the steps, as from any button on the page */}
          {Object.entries(options).map(([value, name]) => (
            <button key={value} type="button" className="pn__trial-option" aria-pressed={trial[key] === value} onClick={() => onPick(key, value)}>
              {name}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
