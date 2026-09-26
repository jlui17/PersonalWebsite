import { Sprite, characters } from "./Sprite.jsx";
import "./sprite-preview.css";

// Every sheet, every frame: big enough to see each pixel, and at the size the
// page actually draws them (1 CSS px per sprite pixel). Reads only the sheet
// data, so it stays correct while a sheet is being redrawn.
const zoom = 8;
const backgrounds = [
  ["latte", "#f3e8d8"],
  ["card", "#ecdec7"],
];

// Every (character, action, outfit) the set contains, in one flat list.
const variants = Object.entries(characters).flatMap(([character, sheet]) =>
  Object.keys(sheet.actions).flatMap((action) =>
    Object.keys(sheet.outfits ?? { "": null }).map((outfit) => ({
      character,
      action,
      outfit: outfit || undefined,
    })),
  ),
);

const label = ({ character, action, outfit }) =>
  [character, action, outfit].filter(Boolean).join(" · ");

const id = ({ character, action, outfit }) =>
  [character, action, outfit].filter(Boolean).join("-");

const Panel = ({ bg, children }) => (
  <div className="sp-panel" style={{ background: bg }}>
    {children}
  </div>
);

const Figure = ({ caption, children }) => (
  <figure className="sp-figure">
    {children}
    <figcaption>{caption}</figcaption>
  </figure>
);

export default function SpritePreview() {
  return (
    <main className="sp">
      <h1>Sprite set</h1>

      <h2>Lineup, true size</h2>
      <div className="sp-panels">
        {backgrounds.map(([name, bg]) => (
          <Panel bg={bg} key={name}>
            <Figure caption={`1x ${name}`}>
              <div className="sp-lineup">
                <Sprite character="justin" action="idle" scale={1} />
                <Sprite character="truffle" action="sleep" scale={1} flip />
                <Sprite character="truffle" action="sit" scale={1} />
                <Sprite character="luibot" action="idle" scale={1} />
                <Sprite character="luibuilder" action="idle" scale={1} />
              </div>
            </Figure>
          </Panel>
        ))}
      </div>

      {variants.map((v) => {
        const { frames, interval } = characters[v.character].actions[v.action];
        const size = `${frames[0][0].length}×${frames[0].length}`;
        return (
          <section className="sp-row" id={id(v)} key={id(v)}>
            <h2>
              {label(v)}
              <span>
                {size} · {frames.length} {frames.length === 1 ? "frame" : "frames"}
                {frames.length > 1 && ` · ${interval ?? 1200}ms`}
              </span>
            </h2>
            <Panel bg={backgrounds[0][1]}>
              {frames.map((_, i) => (
                <Figure caption={`${i + 1}/${frames.length} · ${zoom}x`} key={i}>
                  <Sprite {...v} scale={zoom} frame={i} />
                </Figure>
              ))}
            </Panel>
            <div className="sp-panels">
              {backgrounds.map(([name, bg]) => (
                <Panel bg={bg} key={name}>
                  {frames.map((_, i) => (
                    <Figure caption={`${i + 1}/${frames.length}`} key={i}>
                      <Sprite {...v} scale={1} frame={i} />
                    </Figure>
                  ))}
                  {frames.length > 1 && (
                    <Figure caption={`animated · ${name}`}>
                      <Sprite {...v} scale={1} />
                    </Figure>
                  )}
                </Panel>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
