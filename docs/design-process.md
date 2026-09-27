# Design process

How to run design work on justinlui.dev so that it lands with Justin: how to show him options, how to keep his words, and how to check a design by hand. The four rules every session needs are in `AGENTS.md` under "How design work goes well here", and the review protocol is in `docs/design-review.md`. "The coordinator" is defined in `AGENTS.md`.

## Showing him work

- **He decides by opening things.** Give him options as real routes that truly differ ("they should not be similar at all"), built only far enough to react to. Save review rounds and polish for what survives: he deleted seven of eight prototypes, and three of those had been through several review rounds first. A table of concepts got "let's try them", and his real verdicts came after he looked. The coordinator's own ranking did not predict his pick, twice, so present each option with its best part and its weak part.
- **When he likes part of a rejected design, ask which part.** He takes a quality from it, not its features. From one whole design he kept only this: "i just like the playfulness of the sprites."
- **Look at a worker's first screenshot before he does.** He opens the dev server while work is mid-round ("i know they're not finished, but i just took a look"), and hot reload shows him every half-done state. Tell him what is not ready to judge.
- **Show motion with something that moves**: the live page, or an animated image opened in a browser. Show true size first and zoomed second.
- If a screenshot of his does not attach or a pasted path cannot be read, say so at once, say what you assume he meant, and keep going.

## Keeping his words

- **Keep his words verbatim in one file that every worker and reviewer reads**, grouped by topic, with your reading on its own line under each quote. Append a message there first, then route it to workers, and quote him in the message to the worker.
- He dictates, so typos need one agreed decoding ("louisbot" is luibot, "ghostie" is Ghostty), and a paraphrase drops the part that mattered. The paraphrase of "use the space" lost "you don't fill up the space until it looks awkward". With the quote beside the reading, a worker can catch a bad reading. With only the reading, nobody can.
- Save the path of his screenshot and give it to the worker, so the worker sees what he saw.
- `.luidocs/` is gitignored. Promote what must outlast the task into these docs, and add each new rejection to `docs/design-review.md` when it arrives.
- His notes arrive in bursts while reviews run. A review of the build from before a note is partly stale, so forward only the findings that still apply.

## Checking a design by hand

- `panes` is at `/`, and each step has its own hash, for example `/#agents`. `/?design=sprites` shows every sprite frame zoomed and at true size. Any other `design=` value shows `panes`. Add `?hour=0..23` to pin the San Francisco hour for anything driven by the time of day, and check 8, 14, 19 and 2. The search palette's "Episode 1070" command makes him cheer (the number keys select steps).
- Check at 1280 and 375 wide, and sweep 600 to 1440 where a sprite sits near text. Look at true size first, then zoomed.
- A hidden, headless or unfocused tab freezes or throttles `requestAnimationFrame`, `IntersectionObserver` and CSS animation. Motion sampled there proves little, and a "stuck" animation there may be fine.
- A failing `npm run build` may be another worker's half-written file. Check which path failed before you chase it.
- **Nobody has checked this site on a real phone, in Safari, or for motion at 60Hz in a focused tab.** Say so in every recap until someone has.
- On Justin's Mac as of 2026-09: the dev server on port 5173 is his. Load pages from it, never stop or restart it, and run your own on another port. Playwright browsers are not installed, so drive headless Chrome over CDP with your own `--user-data-dir`. Headless Chrome will not open narrower than about 500px; use device-metrics emulation for 375.
