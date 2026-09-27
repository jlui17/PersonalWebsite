# Design process

How to run design work on justinlui.dev so that it lands with Justin: how to show him options, how to keep his words, how to check a design by hand, and how to ship. The rules every session needs are in `AGENTS.md` under "How design work goes well here", and the review protocol is in `docs/design-review.md`. "The coordinator" is defined in `AGENTS.md`.

## Showing him work

- **He decides by opening things.** Give him options as real routes that truly differ ("they should not be similar at all"), built only far enough to react to. Save review rounds and polish for what survives: he deleted seven of eight prototypes, and three of those had been through several review rounds first. A table of concepts got "let's try them", and his real verdicts came after he looked. Our taste rankings did not predict his picks: he chose the prototype the coordinator ranked 4th of 5, he rejected the serif head font that the coordinator and both reviewers agreed on and picked the face a worker ranked 3rd, and he kept the long walks the reviewers wanted cut. So present each option with its best part and its weak part, do not rank, and use reviewers for defects and measurements.
- **Show candidates on the real page before you argue for one.** He picked the head font from four far-apart candidates shown beside the rejected serif, and the ground colour from three ("i like A, but slightly darker"). A temporary URL switch lets him flip between candidates on the live page (`&fonts=` and `&ground=` did, and both were removed once he had picked). He reverses his own trials too (the photo below the text lasted about twenty minutes), so build a trial cheap.
- **A question gets an answer when there is something to look at.** He answered picks between things he could see and exact sentences shown to him. About fifteen questions placed inside status messages were never answered. Give every question a default that ships, make the default visible on the page, and put a question that truly blocks alone in its own message.
- **After two failed patches of the same section, pose or face, restart from the content.** A fresh agent with no tie to the current version writes down what the content is and why each version failed, mocks several far-apart structures with the real strings at 1280 and 375, and he sees the mocks before anyone builds. Two is our limit, not a number of his.
- **When he likes part of a rejected design, ask which part.** He takes a quality from it, not its features. From one whole design he kept only this: "i just like the playfulness of the sprites."
- **Look at a worker's first screenshot before he does.** He opens the dev server while work is mid-round ("i know they're not finished, but i just took a look"), and hot reload shows him every half-done state. Tell him what is not ready to judge.
- **Show motion with something that moves**: the live page, or an animated image opened in a browser. Show true size first and zoomed second.
- If a screenshot of his does not attach or a pasted path cannot be read, say so at once, say what you assume he meant, and keep going.

## Keeping his words

- **Keep his words verbatim in one file that every worker and reviewer reads**: a file per task under `.luidocs/` (gitignored on his machines), grouped by topic, with your reading on its own line under each quote. Append a message there first, then route it to workers, and quote him in the message to the worker.
- **His instruction names an intent, not a layout.** Quote him to the builder, write "I read that as ..." under the quote, and show him a mock of any mechanism you add before anyone builds it. His "use the space" was built as stretching and his "one sentence" as clever taglines, each exactly as briefed, and he rejected both. His own fix ideas for art are usually right, so pass them on word for word.
- He dictates, so typos need one agreed decoding ("louisbot" is luibot, "ghostie" is Ghostty), and a paraphrase drops the part that mattered. The paraphrase of "use the space" lost "you don't fill up the space until it looks awkward". With the quote beside the reading, a worker can catch a bad reading. With only the reading, nobody can.
- Save the path of his screenshot and give it to the worker, so the worker sees what he saw.
- `.luidocs/` is gitignored. Promote what must outlast the task into these docs, and add each new rejection to `docs/design-review.md` when it arrives.
- His notes arrive in bursts while reviews run. A review of the build from before a note is partly stale, so forward only the findings that still apply.

## Checking a design by hand

- `panes` is at `/`, and each step has its own hash, for example `/#agents`. `/?design=sprites` shows every sprite frame zoomed and at true size. Any other `design=` value shows `panes`. Add `?hour=0..23` to pin the San Francisco hour for anything driven by the time of day, and check 8, 14, 19 and 2. The search palette's "Episode 1070" command makes him cheer (the number keys select steps).
- Check at 1280 and 375 wide and at his own window, about 1440x1000 (a pane of about 984x806): every spacing ask of his came from that size, and no worker had tested it. Sweep 600 to 1440 where a sprite sits near text. Look at true size first, then zoomed.
- **Every step's scene has several ways in, and a defect hides in the one nobody exercised.** Check each: walked in on desktop, from both sides; tapped on a phone, where he is placed and does not walk; a direct load of the hash; reduced motion; and each part of the day (`?hour=2`, 8, 14, 19; night in San Francisco is daytime for Europe and Asia). Four defects hid there until the ship review: no chair pull after a phone tap, lying down and then standing after a phone tap on "people", the night rest pose for a second on a direct load of `/#now`, and reduced motion as a fast slideshow. A worker's own log at `?hour=14` missed a creep of 23px per round that only the evening rest pose shows.
- **Judge motion from ordered frame strips with logged positions, never from stills, and on the page, not in the sheet.** The shoebox chore was passed from stills, and he then saw luibot move the wrong way and the boxes teleport. "His hand stays on the chair in every frame" was true of the art strip and false on the page.
- A finding from a harness needs a clean repeat in real time. A frozen clock squeezed the `setTimeout` waits and gave a false 5.5 s loop, and a hot reload in the middle of a run showed a 151px jump that was not real.
- A hidden, headless or unfocused tab freezes or throttles `requestAnimationFrame`, `IntersectionObserver` and CSS animation. Motion sampled there proves little, and a "stuck" animation there may be fine.
- A failing `npm run build` may be another worker's half-written file. Check which path failed before you chase it.
- **No agent has checked this site on a real phone, in Safari, in Firefox, or for smoothness at 60Hz in a focused tab.** He judges smoothness himself. Say so in every recap until someone has. A `.mov` screen recording from him cannot be opened on this machine (no `ffmpeg`), so say that at once when he sends one.
- On Justin's Mac as of 2026-09: the dev server on port 5173 is his. Load pages from it, never stop or restart it, and run your own on another port. Playwright browsers are not installed, so drive headless Chrome over CDP with your own `--user-data-dir`. Headless Chrome will not open narrower than about 500px; use device-metrics emulation for 375.

## Shipping to main

Pushing `main` deploys, so it waits for Justin's word for that change. "Ship it" means: push `main` by these steps; there is no PR. Exactly one session owns a push; settle which one before anyone moves `main`. The first ship of `panes` squashed a long private history into one commit (step 9). Since then work branches from `main`, and shipping a change means pushing its small commits on top, by every step except the squash.

1. **Audit what becomes public, read-only, before the first push of any branch**: anything from "What stays out of the repo" below, in docs, comments, strings and commit messages; secrets; EXIF in every image; what the remote already shows (`git ls-remote`, every remote branch and its Cloudflare preview); whether `origin/main` moved; first paint, fonts and `theme-color`.
2. Every pushed branch is public twice: on GitHub, and as `<branch>.justinlui-site.pages.dev`. A deployment stays reachable at `<hash>.<project>.pages.dev` for as long as a project of that name exists, also after its branch is deleted. That is why the project is never renamed back to `justinlui`: the old name is abandoned so that some earlier deployments stay unreachable. If something private does ship, fixing it in git is not enough: the old deployments have to be deleted as well.
3. **New photo**: strip EXIF before committing. The build copies `public/` into the deploy verbatim, so a straight-from-iPhone photo publishes its GPS coordinates at meter precision. Drop the APP1 and APP13 JPEG segments and keep APP0/APP2, which removes the metadata without recompressing the image or losing the color profile.
4. **Review a frozen copy of the commit that will ship**: `git archive <commit>` into its own folder, `npm run build`, `vite preview` on a port of your own. Never run a dev server in a copy whose `node_modules` is a symlink, because it rewrites the shared Vite cache under his dev server. Both pair reviews before the ship ran while the tree was being edited, which is where the false 151px jump came from.
5. One driver script per headless Chrome. Two scripts in one Chrome throttle the background tab, and that looks exactly like a frozen animation.
6. **Count runs and report "seen N of M"**, plain and with CPU throttling x4: a defect that needs a stall is what a slow phone shows.
7. **A fresh verifier re-checks every fix round to `stage.js`**, or to anything else every scene shares, with a tour of all steps in both directions and every way in ("Checking a design by hand"). Of four fix rounds before the ship, one brought a confirmed regression (a clearance rule that froze luibot in a scrolled pane), and two earlier fixes had each caused the next defect Justin saw. Fix the class in the engine, not the instance: a beam drawn over him was fixed in one place and lived in three more.
8. Dead code goes only with proof: screenshots before and after with 0 differing pixels, and a computed-style dump where a reset changes.
9. Squash only when a branch's history must stay out of `main`, as at the first ship: one commit onto `origin/main`, so that no earlier commit reaches `main`, and then step 1 again on that commit and its message. Never push `redesign-options` or the two prototype tags.
10. Push a preview branch first (Cloudflare builds it in under a minute), check it, push `main`, then delete the preview branch. Check the remote after every push.
11. **Chain of custody**: the sha256 of the bundle the verifier passed equals the preview's and the live site's. Then smoke-test the live site.
12. Write whatever was seen and left unfixed into "Known and accepted at the ship" below.

### What stays out of the repo

These classes are the definition. A grep finds only the mechanical ones, so also read every sentence about him and the people around him, his quotes included.

- A statement about his body or health. Write the rule it led to, never the reason.
- Amounts of money, and the names of banks and other institutions.
- Addresses, and places that locate his home.
- His girlfriend's name, and other people's full names.
- Machine names, home paths, and tokens or keys.

A starting point: `git grep -nIiE "/Users/|/home/|\.ts\.net|api[_-]?key|_TOKEN|secret|password|Bearer |[$€£][0-9]|health|medical|diagnos|allerg"` for the tree, and `git log --format=%B origin/main..` for the commit messages.

### Known and accepted at the ship

These were seen and left on purpose, so finding one again is not a miss. Remove a line when it is fixed.

- Back leaves the site, because selecting a step replaces the history entry, and there is no `hashchange` listener, so editing the hash in an open tab does not change the pane.
- On a phone, focus drops to `body` after "‹ all", and the robots, the status switch and a few other tap targets are under 40px.
- `/#future` scrolls by 21px at 1280x800. At 1920x1080 panes 5 and 3 show blank bands of 94px and 81px. At his window pane 2 fills 75% of its height; a larger size is the next lever, and that is his call.
- luibot's hat crosses the status sign's top border.
- At 1280x720 a scroll can bring a paragraph under luibot, and his 0.4 s beam-out plays over it. A beam was kept over a plain vanish, because every larger move is a beam and "never over text" is our default.
- One lagging sample with words under luibot on a 60px scroll; the robots drawn nowhere for up to 6.4 s during a key mash; luibuilder beams twice on a quick 3, 1, 3; at 700px wide luibot's box overlaps Justin's at step 3.
- By design: a stand-up beat of about 0.3 s when he leaves steps 2 and 6, Truffle's `ear` pose for about 0.3 s before she trots home, and one tick of empty-handed idle when he leaves step 1.
- The photo is 637 KB and shows at about 220px; the bundle is 718 kB, mostly sprites, and the sprite viewer ships in it.
- The favicon is empty, the `og:image` is a portrait and there is no `twitter:card`; there is no `robots.txt`, no `_headers` file (hashed assets revalidate on every load) and no `404.html` (an unknown path returns the page with status 200).
