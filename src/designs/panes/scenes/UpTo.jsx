import { useState } from "react";
import { lately } from "../../../content";
import { SignSwitch } from "./SignSwitch.jsx";
import { useChore } from "./script.js";
import "./scenes.css";

// Pane 5's status sign, the pane's one live detail: a compact unit at the
// top. Its first line is the sign's own LED, the date and the switch; under
// it one line per thing in `lately.status`, a label with its dot and a value.
//
// The sign is off when the pane opens (the lines dim but readable, every dot
// hollow) and lit when luibot reaches the switch (`lit`) or the visitor flips
// it; their hand wins for as long as the pane stays open. On and off never
// rest on colour: the knob changes side, the dots fill, the word says which.
export function UpTo({ lit }) {
  const chore = useChore(lit, 1200);
  const [flipped, setFlipped] = useState(null);
  const on = flipped ?? chore;
  return (
    <div className="pn-upto" data-lit={on || undefined}>
      <div className="pn-upto__sign">
        <div className="pn-upto__status">
          <span className="pn__label" data-led>
            status
          </span>
          <span className="pn__label">updated {lately.updated}</span>
          <SignSwitch on={on} onFlip={() => setFlipped(!on)} />
        </div>
        <dl className="pn-upto__lines">
          {lately.status.map((line) => (
            <div className="pn-upto__line" key={line.label}>
              <dt className="pn__label" data-led>
                {line.label.toLowerCase()}
              </dt>
              <dd>{line.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
