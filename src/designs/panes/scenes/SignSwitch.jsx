// The status switch: luibot's anchor is its track. The word beside it keeps
// one width, so nothing moves when it flips.
export function SignSwitch({ on, onFlip }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label="Status sign" className="pn-sign__switch" onClick={onFlip}>
      <span className="pn-sign__track" data-anchor="sign-switch">
        <span className="pn-sign__knob" />
      </span>
      <span className="pn__label pn-sign__state">{on ? "on" : "off"}</span>
    </button>
  );
}
