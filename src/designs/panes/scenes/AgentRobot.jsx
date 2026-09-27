import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Sprite, characters } from "../../../sprites/Sprite.jsx";
import "./scenes.css";

// Pane 3: each robot stands right beside his own name and tag, on the rule
// under them. Pointing at him, tabbing to him or tapping him makes him wave and
// say his line from `greetings` (never his name: it is printed beside him);
// `waving` lets the pane ask for the wave alone (Justin's greeting in the
// pathway, the palette's "Wave to luibot"): he speaks only to the visitor.
// `idle` and `wave` share one canvas in both sheets, so his box never changes.
//
// The button is the fixed hit target and the svg takes no pointer events, so
// the hover area never changes under the pointer. A tap toggles him; a tap
// anywhere else lets him rest.
// `present` is false while he is on his way up from the pathway (or down):
// the button keeps his size, and nothing is drawn in it.
const greetings = { luibot: "Already on it.", luibuilder: "Got an idea?" };

export function AgentRobot({ name, waving = false, present = true }) {
  const el = useRef(null);
  const bubble = useRef(null);
  const pointer = useRef("mouse");
  const [over, setOver] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [tabbedTo, setTabbedTo] = useState(false);
  const [fits, setFits] = useState(false);
  const greeting = over || tapped || tabbedTo;
  const active = greeting || waving;

  useEffect(() => {
    if (!tapped) return undefined;
    const release = (event) => {
      if (!el.current?.contains(event.target)) setTapped(false);
    };
    document.addEventListener("pointerdown", release, true);
    return () => document.removeEventListener("pointerdown", release, true);
  }, [tapped]);

  // The bubble speaks only where it fits on one line between him and the end
  // of the head; where it cannot, he just waves.
  useLayoutEffect(() => {
    if (!greeting) return;
    const room = el.current.parentElement.getBoundingClientRect().right - el.current.getBoundingClientRect().right;
    setFits(room >= bubble.current.offsetWidth + 12);
  }, [greeting]);

  const mouse = (event) => event.pointerType === "mouse";
  const { frames } = characters[name].actions.wave;
  return (
    <button
      ref={el}
      type="button"
      className="pn-robot"
      data-robot={name}
      data-action={active ? "wave" : "idle"}
      aria-label={`Say hi to ${name}`}
      style={{ width: frames[0][0].length, height: frames[0].length }}
      onPointerEnter={(event) => mouse(event) && setOver(true)}
      onPointerLeave={(event) => mouse(event) && setOver(false)}
      onPointerDown={(event) => {
        pointer.current = event.pointerType;
      }}
      onClick={() => pointer.current === "mouse" || setTapped((on) => !on)}
      onFocus={(event) => setTabbedTo(event.target.matches(":focus-visible"))}
      onBlur={() => setTabbedTo(false)}
    >
      {present && <Sprite character={name} action={active ? "wave" : "idle"} scale={1} />}
      <span ref={bubble} className="pn-robot__bubble" data-shown={(greeting && fits) || undefined} aria-hidden="true">
        {greetings[name]}
      </span>
    </button>
  );
}
