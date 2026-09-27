import { useEffect, useMemo, useRef, useState } from "react";
import { Sprite, characters } from "./Sprite.jsx";
import "./sprite-preview.css";

// Internal tool at /?design=sprites: every sheet, every action, the animation
// beside its frames. It reads only the sheet data, so it stays correct while a
// sheet is being redrawn.

// Integer, so a sprite pixel is a whole number of screen pixels.
const zoom = 4;
const backgrounds = ["latte", "dark"];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const anchor = (character, action) => `${character}-${action}`;

const Choice = ({ label, options, value, onChange }) => (
  <div className="sp-choice" role="group" aria-label={label}>
    <span className="sp-label">{label}</span>
    {options.map((option) => (
      <button type="button" key={option} aria-pressed={option === value} onClick={() => onChange(option)}>
        {option}
      </button>
    ))}
  </div>
);

// The block keeps its own clock and pins every Sprite with `frame`, because
// Sprite keeps its tick to itself and the frame row has to know which still is
// showing. The timing rule is Sprite's: durations[i], else the interval.
function Action({ character, action, outfit }) {
  const { frames, interval = 1200, durations, stride } = characters[character].actions[action];
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(!reducedMotion);
  const animated = frames.length > 1;
  const shown = frame % frames.length;
  const ms = (i) => durations?.[i] ?? interval;
  const loop = frames.reduce((sum, _, i) => sum + ms(i), 0);

  // Built once per sheet edit, not once per tick: React skips an element it has
  // seen before, so a tick redraws the two live sprites and leaves the stills.
  const stills = useMemo(
    () =>
      frames.map((_, i) => (
        <Sprite character={character} action={action} outfit={outfit} scale={zoom} frame={i} />
      )),
    [frames, character, action, outfit],
  );

  useEffect(() => {
    if (!playing || !animated) return undefined;
    const id = setTimeout(() => setFrame((shown + 1) % frames.length), durations?.[shown] ?? interval);
    return () => clearTimeout(id);
  }, [playing, animated, shown, frames.length, durations, interval]);

  return (
    <section className="sp-action" id={anchor(character, action)} data-toc>
      <header className="sp-action__head">
        <h3>{action}</h3>
        {animated && (
          <button type="button" className="sp-play" onClick={() => setPlaying(!playing)}>
            {playing ? "Pause" : "Play"}
          </button>
        )}
        <p className="sp-label">
          {frames[0][0].length} × {frames[0].length} px ·{" "}
          {animated ? `${frames.length} frames · ${loop / 1000}s loop` : "1 frame · still"}
          {stride && ` · stride ${stride}px`}
        </p>
      </header>
      <div className="sp-action__body">
        <div className="sp-stage">
          <figure className="sp-tile">
            <Sprite character={character} action={action} outfit={outfit} scale={zoom} frame={shown} />
            <figcaption className="sp-label">
              {!animated ? "still" : playing ? "live" : `held on ${shown + 1}`} · {zoom}×
            </figcaption>
          </figure>
          <figure className="sp-tile">
            <Sprite character={character} action={action} outfit={outfit} scale={1} frame={shown} />
            <figcaption className="sp-label">1×</figcaption>
          </figure>
        </div>
        {animated && (
          <ol className="sp-frames" data-playing={playing}>
            {frames.map((_, i) => (
              <li key={i}>
                <button
                  type="button"
                  className="sp-tile"
                  aria-current={i === shown || undefined}
                  aria-label={`Hold frame ${i + 1}`}
                  onClick={() => {
                    setFrame(i);
                    setPlaying(false);
                  }}
                >
                  {stills[i]}
                  <span className="sp-label">
                    {i + 1} · {ms(i)}ms
                  </span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

export default function SpritePreview() {
  const sheets = Object.entries(characters);
  const [background, setBackground] = useState(backgrounds[0]);
  const [outfits, setOutfits] = useState({});
  const [current, setCurrent] = useState("lineup");
  const outfitOf = (character, sheet) => outfits[character] ?? Object.keys(sheet.outfits ?? {})[0];

  // A deep link (/?design=sprites#justin-reach): the browser looks for the
  // anchor before React has drawn it, so the jump is made here. Once only: Fast
  // Refresh re-runs effects on every sprite edit, and that must not yank the page.
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView();
  }, []);

  // The entry in view: the first block, in page order, that crosses a band
  // under the top of the window. The band starts below the phone layout's
  // sticky bar (6.5rem) so the same numbers serve both layouts.
  useEffect(() => {
    const blocks = [...document.querySelectorAll("[data-toc]")];
    const inBand = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => (entry.isIntersecting ? inBand.add(entry.target) : inBand.delete(entry.target)));
        const first = blocks.find((block) => inBand.has(block));
        if (first) setCurrent(first.id);
      },
      { rootMargin: "-112px 0px -60% 0px" },
    );
    blocks.forEach((block) => observer.observe(block));
    return () => observer.disconnect();
  }, []);

  // Keep the marked entry visible when the table of contents scrolls on its own.
  useEffect(() => {
    document.querySelector(".sp-toc [aria-current]")?.scrollIntoView({ block: "nearest" });
  }, [current]);

  return (
    <div className="sp" data-bg={background}>
      <aside className="sp-side">
        <div className="sp-side__title">
          <p className="sp-label">
            {sheets.length} sheets · {sheets.reduce((sum, [, sheet]) => sum + Object.keys(sheet.actions).length, 0)}{" "}
            actions
          </p>
          <h1>Sprite set</h1>
        </div>

        <div className="sp-controls">
          <Choice label="Background" options={backgrounds} value={background} onChange={setBackground} />
          {sheets.map(
            ([character, sheet]) =>
              sheet.outfits && (
                <Choice
                  key={character}
                  label={`${character} wears`}
                  options={Object.keys(sheet.outfits)}
                  value={outfitOf(character, sheet)}
                  onChange={(outfit) => setOutfits({ ...outfits, [character]: outfit })}
                />
              ),
          )}
        </div>

        {/* Phone layout: the table of contents folds into this select. */}
        <select
          className="sp-jump"
          aria-label="Jump to"
          value={current}
          onChange={(event) => {
            window.location.hash = event.target.value;
          }}
        >
          <option value="lineup">Lineup</option>
          {sheets.map(([character, sheet]) => (
            <optgroup label={character} key={character}>
              {Object.keys(sheet.actions).map((action) => (
                <option value={anchor(character, action)} key={action}>
                  {character} · {action}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <nav className="sp-toc" aria-label="Sprites">
          <a className="sp-toc__sheet" href="#lineup" aria-current={current === "lineup" || undefined}>
            Lineup
          </a>
          {sheets.map(([character, sheet]) => (
            <div className="sp-toc__group" key={character}>
              <a className="sp-toc__sheet" href={`#${character}`}>
                {character}
              </a>
              <ul>
                {Object.keys(sheet.actions).map((action) => (
                  <li key={action}>
                    <a
                      className="sp-label"
                      href={`#${anchor(character, action)}`}
                      aria-current={current === anchor(character, action) || undefined}
                    >
                      {action}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <main className="sp-main">
        <section className="sp-lineup" id="lineup" data-toc>
          <p className="sp-label">Everyone at true size, 1×</p>
          <div className="sp-lineup__row">
            {sheets.map(([character, sheet]) => (
              <a href={`#${character}`} key={character}>
                <Sprite
                  character={character}
                  action={Object.keys(sheet.actions)[0]}
                  outfit={outfitOf(character, sheet)}
                  scale={1}
                  frame={0}
                />
                <span className="sp-label">{character}</span>
              </a>
            ))}
          </div>
        </section>

        {sheets.map(([character, sheet], i) => (
          <section className="sp-sheet" id={character} key={character}>
            <header className="sp-sheet__head">
              <span className="sp-label">{String(i + 1).padStart(2, "0")}</span>
              <h2>{character}</h2>
              <span className="sp-label">
                {Object.keys(sheet.actions).length} actions
                {sheet.outfits && ` · ${Object.keys(sheet.outfits).join(" / ")}`}
              </span>
            </header>
            {Object.keys(sheet.actions).map((action) => (
              <Action character={character} action={action} outfit={outfitOf(character, sheet)} key={action} />
            ))}
          </section>
        ))}
      </main>
    </div>
  );
}
