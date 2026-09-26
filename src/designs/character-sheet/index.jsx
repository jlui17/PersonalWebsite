import { useEffect, useRef, useState } from "react";
import "./character-sheet.css";
import { now, people, projects, status } from "../../content";
import { Sprite, characters } from "../../sprites/Sprite.jsx";
import { equipment, layers, outfits, stats, summons } from "./sheet.js";

// ?hour=0..23 pins the SF hour so the default layers can be checked by hand.
const hourOverride = new URLSearchParams(window.location.search).get("hour");

const sfHour = () =>
  hourOverride !== null
    ? Number(hourOverride)
    : Number(
        new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          hourCycle: "h23",
          timeZone: "America/Los_Angeles",
        }).format(new Date()),
      );

// Two layers by day, the hoodie on top from six in the evening.
const defaultOutfit = () => (sfHour() >= 6 && sfHour() < 18 ? 0 : 1);

// The largest canvas a character uses across the given actions, so a figure's
// box is sized from the sheet data and holds still when the action changes.
const canvas = (character, actions = Object.keys(characters[character].actions)) => {
  const frames = actions.flatMap((a) => characters[character].actions[a].frames);
  return {
    width: Math.max(...frames.map((rows) => rows[0].length)),
    height: Math.max(...frames.map((rows) => rows.length)),
  };
};

// "Over" for a mouse pointer while it is on the element; for touch, a tap
// turns it on and the next tap anywhere else turns it off, so a phone can
// wake Truffle and let her go back to sleep. A tap is a pointerdown that
// reaches pointerup; a swipe that starts on the element is cancelled by the
// browser's scroll and changes nothing.
function useHoverOrTap() {
  const el = useRef(null);
  const pressed = useRef(false);
  const [over, setOver] = useState(false);
  const [tapped, setTapped] = useState(false);

  useEffect(() => {
    if (!tapped) return undefined;
    // Capture phase: it runs before the tapped element re-renders, and the
    // tap that set `tapped`, already past capture, cannot release it.
    const release = (event) => {
      if (!el.current?.contains(event.target)) setTapped(false);
    };
    document.addEventListener("pointerdown", release, true);
    return () => document.removeEventListener("pointerdown", release, true);
  }, [tapped]);

  const mouse = (event) => event.pointerType === "mouse";
  return [
    over || tapped,
    {
      ref: el,
      onPointerEnter: (event) => mouse(event) && setOver(true),
      onPointerLeave: (event) => mouse(event) && setOver(false),
      onPointerDown: (event) => {
        pressed.current = !mouse(event);
      },
      onPointerCancel: () => {
        pressed.current = false;
      },
      onPointerUp: () => {
        if (pressed.current) setTapped((on) => !on);
        pressed.current = false;
      },
    },
  ];
}

const Label = ({ children, className = "" }) => (
  <span className={`cs__label ${className}`}>{children}</span>
);

const wornNames = (outfit) =>
  layers.slice(0, outfit.worn).map((l) => l.name.toLowerCase());

// "Shirt, over-shirt." for the caption; the aria-label keeps them lowercase
// after its colon.
const wornSentence = (outfit) => {
  const list = wornNames(outfit).join(", ");
  return list[0].toUpperCase() + list.slice(1);
};

// What the next press does, from this outfit: the next layer goes on, or the
// top one comes off.
const stepHint = (i) => {
  const current = outfits[i];
  const next = outfits[(i + 1) % outfits.length];
  return next.worn > current.worn
    ? `Add the ${layers[next.worn - 1].name.toLowerCase()}.`
    : `Take the ${layers[current.worn - 1].name.toLowerCase()} off.`;
};

// The portrait is the layer control: each press adds the next layer or takes
// the top one off, and the caption says what is on. Every state's caption is
// rendered in the same cell, so the caption keeps the tallest state's height
// and nothing under it moves. Arms go up for a beat when 1070 is typed; that
// is the one 2x moment on the page.
function Portrait({ worn, onStep, cheering }) {
  const { width, height } = canvas("justin", ["idle", "arms-up"]);
  const current = outfits[worn];
  const hint = stepHint(worn);

  return (
    <figure
      className="cs__portrait"
      style={{
        "--cs-figure-w": `${width * 2}px`,
        "--cs-figure-h": `${height * 2}px`,
      }}
    >
      <button
        type="button"
        className="cs__portrait-frame"
        onClick={onStep}
        aria-label={`Portrait, ${current.worn} layers on: ${wornNames(current).join(", ")}. Press to ${hint[0].toLowerCase()}${hint.slice(1)}`}
      >
        <span className="cs__sprite" key={current.outfit} aria-hidden="true">
          <Sprite
            character="justin"
            action={cheering ? "arms-up" : "idle"}
            outfit={current.outfit}
            scale={2}
          />
        </span>
      </button>
      <figcaption>
        <Label>{cheering ? "1070!" : `Layers · ${current.worn}`}</Label>
        <span className="cs__portrait-worn">
          {outfits.map((outfit, i) => (
            <span
              key={outfit.outfit}
              className={i === worn ? undefined : "cs__portrait-worn--other"}
              aria-hidden={i !== worn}
            >
              {wornSentence(outfit)}. {stepHint(i)}
            </span>
          ))}
        </span>
      </figcaption>
    </figure>
  );
}

// Truffle sleeps on her card's bottom rule, her state label beside her. A
// mouse entering the card lifts one ear (so does 1070); only the pointer on
// her, or a tap, gets her to sit up.
function TruffleCard({ person, cheering }) {
  const [near, setNear] = useState(false);
  const [over, overProps] = useHoverOrTap();
  const { width, height } = canvas("truffle", ["sleep", "ear", "sit"]);
  const mouse = (event) => event.pointerType === "mouse";

  return (
    <article
      className="cs__member cs__member--truffle"
      onPointerEnter={(event) => mouse(event) && setNear(true)}
      onPointerLeave={(event) => mouse(event) && setNear(false)}
    >
      <div className="cs__member-head">
        <Label>{person.name}</Label>
        <Label>{person.tag}</Label>
      </div>
      <h3>{person.heading}</h3>
      <p>{person.body}</p>
      <div className="cs__truffle-figure">
        <Label className="cs__truffle-state">
          {over ? "awake, briefly" : "asleep, as usual"}
        </Label>
        <span
          className="cs__sprite cs__truffle-sprite"
          style={{ width, height }}
          aria-hidden="true"
          {...overProps}
        >
          <Sprite
            character="truffle"
            action={over ? "sit" : near || cheering ? "ear" : "sleep"}
            scale={1}
            flip
          />
        </span>
      </div>
    </article>
  );
}

// A summon waves and says hi while the pointer is on it (or after a tap), and
// waves along for 1070. The bubble takes the name label's place, so nothing
// else on the card moves.
function Summon({ character, note, cheering }) {
  const [over, overProps] = useHoverOrTap();
  const { width, height } = canvas(character);

  return (
    <article className="cs__summon" {...overProps}>
      <span className="cs__sprite" style={{ width, height }} aria-hidden="true">
        <Sprite
          character={character}
          action={over || cheering ? "wave" : "idle"}
          scale={1}
        />
      </span>
      <div>
        {over ? (
          <Label className="cs__bubble">Hi, I&rsquo;m {character}</Label>
        ) : (
          <Label>{character}</Label>
        )}
        <p>{note}</p>
      </div>
    </article>
  );
}

export default function CharacterSheet() {
  const [worn, setWorn] = useState(defaultOutfit);
  const [cheering, setCheering] = useState(false);
  const outfit = outfits[worn];
  // Section numbers read "1070!" for the beat, so the easter egg shows
  // wherever the reader is on the page.
  const number = (n) => (cheering ? "1070!" : n);

  useEffect(() => {
    let typed = "";
    const onKey = (event) => {
      typed = (typed + event.key).slice(-4);
      if (typed === "1070") {
        setCheering(true);
        setTimeout(() => setCheering(false), 1800);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={`cs${cheering ? " cs--cheer" : ""}`}>
      <main className="cs__page">
        <header className="cs__masthead">
          <Label className="cs__masthead-title">Character sheet</Label>
          <nav aria-label="Find Justin online">
            <a
              href="https://github.com/jlui17"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/jlui17"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          </nav>
        </header>

        <section className="cs__header" aria-label="Name plate">
          <Portrait
            worn={worn}
            onStep={() => setWorn((i) => (i + 1) % outfits.length)}
            cheering={cheering}
          />

          <div className="cs__nameplate">
            <Label>Name</Label>
            <h1>Justin Lui</h1>
          </div>

          <dl className="cs__fields">
            <div>
              <dt>
                <Label>Pronounced</Label>
              </dt>
              <dd>loo-wee</dd>
            </div>
            <div>
              <dt>
                <Label>Class</Label>
              </dt>
              <dd>Overaller</dd>
            </div>
            <div>
              <dt>
                <Label>From</Label>
              </dt>
              <dd>Vancouver</dd>
            </div>
            <div>
              <dt>
                <Label>Currently in</Label>
              </dt>
              <dd>San Francisco</dd>
            </div>
            <div>
              <dt>
                <Label>Happiest in</Label>
              </dt>
              <dd>bed · the mountains · a café</dd>
            </div>
            <div>
              <dt>
                <Label>Works at</Label>
              </dt>
              <dd>
                <a
                  href="https://www.scorecard.io/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Scorecard
                </a>
              </dd>
            </div>
          </dl>

          <div className="cs__equipment">
            <Label className="cs__equipment-title">Equipment</Label>
            <ul>
              {equipment.slice(0, 1).map((item) => (
                <li key={item.slot}>
                  <Label>{item.slot}</Label>
                  <strong>{item.name}</strong>
                  <span>{item.note}</span>
                </li>
              ))}
              <li className="cs__layer-slot">
                <Label>Layers</Label>
                <ol aria-label={`Layers, ${outfit.worn} of ${layers.length} on`}>
                  {layers.map((layer, i) => (
                    <li
                      key={layer.name}
                      className={i < outfit.worn ? "cs__layer--on" : undefined}
                    >
                      <strong>{layer.name}</strong>
                      <span>{layer.note}</span>
                    </li>
                  ))}
                </ol>
              </li>
              {equipment.slice(1).map((item) => (
                <li key={item.slot}>
                  <Label>{item.slot}</Label>
                  <strong>{item.name}</strong>
                  <span>{item.note}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className="cs__section cs__backstory"
          aria-labelledby="backstory-heading"
        >
          <div className="cs__section-head">
            <Label>{number("01")}</Label>
            <h2 id="backstory-heading">Backstory</h2>
          </div>
          <p>
            Hi, I&rsquo;m Lui. If there&rsquo;s something you should know about
            me, it&rsquo;s that I can nerd out over niche details for hours.
            Steph Curry&rsquo;s footwork, dialing in espresso, programming, or
            the right way to peek a specific angle in Valorant. Once I&rsquo;m
            interested, I&rsquo;ll obsess over the details and talk about them
            way longer than I meant to.
          </p>
          <p>
            For work, I&rsquo;m at{" "}
            <a
              href="https://www.scorecard.io/"
              target="_blank"
              rel="noreferrer"
            >
              Scorecard
            </a>
            , where I work across product and engineering and try a bunch of
            ideas to see what lands.
          </p>
        </section>

        <section className="cs__section" aria-labelledby="stats-heading">
          <div className="cs__section-head">
            <Label>{number("02")}</Label>
            <h2 id="stats-heading">Stats</h2>
            <Label className="cs__section-note">Out of ten</Label>
          </div>
          <ul className="cs__stats">
            {stats.map((stat) => (
              <li key={stat.name}>
                <span className="cs__stat-value">{stat.value}</span>
                <div>
                  <Label>{stat.name}</Label>
                  <p className="cs__stat-note">{stat.note}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="cs__status" aria-label="Status">
            <div className="cs__status-head">
              <Label>Status</Label>
              <Label>updated {status.updated}</Label>
            </div>
            <div className="cs__status-rows">
              {status.entries.map((entry) => (
                <div key={entry.label}>
                  <Label>{entry.label}</Label>
                  <strong>{entry.value}</strong>
                  <span>{entry.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cs__section" aria-labelledby="party-heading">
          <div className="cs__section-head">
            <Label>{number("03")}</Label>
            <h2 id="party-heading">Party</h2>
            <Label className="cs__section-note">
              The best people in my life
            </Label>
          </div>
          <div className="cs__party">
            {people.map((person) =>
              person.name === "Truffle" ? (
                <TruffleCard
                  key={person.name}
                  person={person}
                  cheering={cheering}
                />
              ) : (
                <article
                  key={person.name}
                  className={`cs__member${person.girlfriend ? " cs__member--girlfriend" : ""}`}
                >
                  <div>
                    <div className="cs__member-head">
                      <Label>{person.name}</Label>
                      <Label>{person.tag}</Label>
                    </div>
                    <h3>{person.heading}</h3>
                    <p>{person.body}</p>
                  </div>
                  {person.girlfriend && (
                    <figure className="cs__photo">
                      <img
                        src="/images/justin-girlfriend-dog.jpeg"
                        alt="Justin and his girlfriend taking a selfie with a sleepy dog"
                      />
                      <figcaption>
                        <Label>the three of us</Label>
                      </figcaption>
                    </figure>
                  )}
                </article>
              ),
            )}
          </div>
          <div className="cs__summons">
            <Label className="cs__summons-title">Summons</Label>
            <div className="cs__summons-row">
              {summons.map((summon) => (
                <Summon
                  key={summon.character}
                  {...summon}
                  cheering={cheering}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="cs__section" aria-labelledby="quests-heading">
          <div className="cs__section-head">
            <Label>{number("04")}</Label>
            <h2 id="quests-heading">Quest log</h2>
          </div>

          <Label className="cs__quest-group">Right now</Label>
          <ul className="cs__now">
            {now.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <Label className="cs__quest-group">Side quests</Label>
          <ul className="cs__side-quests">
            {projects.map((project) => (
              <li key={project.title}>
                <div className="cs__quest-meta">
                  <h3>
                    <a href={project.href} target="_blank" rel="noreferrer">
                      {project.title}
                    </a>
                  </h3>
                  <Label>{project.tag}</Label>
                </div>
                <p className="cs__quest-kicker">{project.kicker}</p>
                <p className="cs__quest-story">{project.story}</p>
              </li>
            ))}
          </ul>
        </section>

        <footer className="cs__footer">
          <span className="cs__sprite cs__footer-figure" aria-hidden="true">
            <Sprite
              character="justin"
              action="sit"
              outfit={outfit.outfit}
              scale={1}
            />
            <Sprite character="truffle" action="sit" scale={1} />
          </span>
          <Label>{cheering ? "1070!" : "End of sheet"}</Label>
          <Label>Thanks for stopping by</Label>
        </footer>
      </main>
    </div>
  );
}
