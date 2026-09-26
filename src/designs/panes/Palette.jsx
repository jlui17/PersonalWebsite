import { useEffect, useMemo, useRef, useState } from "react";
import { fuzzy } from "./fuzzy.js";

// The command palette: a dialog holding one combobox. Typing filters the
// commands; arrows move, Enter runs, Escape closes. Focus goes back to
// whatever had it when the palette opened, unless the command moved it.
export function Palette({ commands, onClose }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef(null);
  const list = useRef(null);
  const opener = useRef(document.activeElement);

  const results = useMemo(() => {
    const scored = commands
      .map((command) => ({ command, match: fuzzy(query, command.label) }))
      .filter((r) => r.match);
    if (query) scored.sort((a, b) => b.match.score - a.match.score);
    return scored;
  }, [commands, query]);

  useEffect(() => {
    input.current.focus();
    const returnTo = opener.current;
    return () => {
      // Only put focus back if nothing else claimed it (a "go to" command
      // focuses its pane).
      if (document.activeElement === document.body || document.activeElement === null) {
        returnTo?.focus?.({ preventScroll: true });
      }
    };
  }, []);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    list.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const run = (index) => {
    const hit = results[index];
    if (!hit) return;
    onClose();
    hit.command.run();
  };

  const onKeyDown = (event) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((i) => (results.length ? (i + 1) % results.length : 0));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
        break;
      case "Home":
        event.preventDefault();
        setActive(0);
        break;
      case "End":
        event.preventDefault();
        setActive(Math.max(0, results.length - 1));
        break;
      case "Enter":
        event.preventDefault();
        run(active);
        break;
      case "Escape":
        event.preventDefault();
        onClose();
        break;
      case "Tab":
        event.preventDefault(); // the input is the only thing to focus here
        break;
      default:
    }
  };

  const optionId = (i) => `pn-option-${i}`;

  return (
    <div
      className="pn__palette-backdrop"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="pn__palette" role="dialog" aria-modal="true" aria-label="Command palette">
        <input
          ref={input}
          className="pn__palette-input"
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="pn-palette-list"
          aria-activedescendant={results.length ? optionId(active) : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck="false"
          placeholder="Go somewhere, open something, or bother the dog"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
        />
        <ul id="pn-palette-list" ref={list} className="pn__palette-list" role="listbox">
          {results.length === 0 && (
            <li className="pn__palette-empty" role="presentation">
              Nothing matches &ldquo;{query}&rdquo;.
            </li>
          )}
          {results.map(({ command, match }, i) => (
            <li
              key={command.id}
              id={optionId(i)}
              className="pn__option"
              role="option"
              aria-selected={i === active}
              onPointerMove={() => i !== active && setActive(i)}
              onClick={() => run(i)}
            >
              <span>
                {[...command.label].map((ch, j) =>
                  match.indices.includes(j) ? <mark key={j}>{ch}</mark> : ch,
                )}
              </span>
              <span className="pn__option-kind">{command.kind}</span>
            </li>
          ))}
        </ul>
        <div className="pn__palette-foot">
          <span>↑↓ move</span>
          <span>↵ run</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
