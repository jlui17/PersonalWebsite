# Sprites

Pixel sprites of the people, dog and robots on justinlui.dev, exported from the site's sprite sheets (`src/sprites/*.js` and `src/designs/spec-sheet-evolved/ball.js`) as plain SVG files. Each file is a set of `<rect>`s on a one-unit grid with `shape-rendering="crispEdges"`, so it stays sharp at any whole-number scale. The pixels are identical to what the site's renderer (`src/sprites/Sprite.jsx`) draws.

Regenerate everything, including `index.html`, with `node design-system/sprites/export.mjs` after a sheet changes.

## Naming

- `<character>-<action>-<frame>.svg` is one still frame, for example `justin-overshirt-idle-0.svg`, `truffle-sleep-1.svg`.
- `<character>-<action>.svg` is the animated version of an action with more than one frame, for example `justin-hoodie-sip.svg`, `luibot-wave.svg`.

Characters: `justin-overshirt`, `justin-hoodie`, `truffle`, `luibot`, `luibuilder`, `ball`.

## The characters

**Justin** wears a straw hat modelled loosely on Luffy's from One Piece, a rust over-shirt open over a plain oat tee (or a slate hoodie, see below), and loose textured trousers. He is 36 by 62 px standing.

The two outfits are the same frames with a different palette. The site picks one by the hour in San Francisco: `justin-overshirt` from 06:00 to 17:59 (morning and day), `justin-hoodie` from 18:00 to 05:59 (evening and night). Use the same rule wherever a clock is present; otherwise the over-shirt is the default.

| Action | Canvas | Frames | Timing | On the site |
| --- | --- | --- | --- | --- |
| `idle` | 36 × 62 | 3 | 1300 / 160 / 1300 ms, loops | standing and blinking: the daytime masthead pose |
| `walk` | 36 × 62 | 4 | 200 ms per frame, loops; stride 7 px per frame | side view, facing right |
| `sit` | 52 × 52 | 2 | 3200 / 160 ms, loops | sitting on the rule: the evening masthead pose, and again in the footer |
| `sleep` | 64 × 28 | 1 | static | lying on the rule: the night masthead pose |
| `sip` | 36 × 62 | 2 | 2600 / 1000 ms, loops | espresso: the morning masthead pose |
| `hat` | 36 × 62 | 1 | static | tips the hat while the pointer is on his name (not at night, he's asleep) |
| `arms-up` | 36 × 62 | 1 | static | both arms up for 1.8 s after someone types `1070` |

**Truffle** is Justin's female brindle French bulldog. Her head always faces the viewer while the body is side-on.

| Action | Canvas | Frames | Timing | On the site |
| --- | --- | --- | --- | --- |
| `sleep` | 36 × 20 | 2 | 2300 / 700 ms, loops | asleep on the bottom rule of her card, breathing |
| `ear` | 36 × 20 | 3 | 1100 / 300 ms, then holds frame 2 | one ear pricks up when the cursor enters her card |
| `sit` | 24 × 24 | 1 | static | sits up while the cursor is on her |
| `walk` | 34 × 26 | 8 | 110 ms per frame, loops; stride 2 px per frame | a stroll, facing right |
| `trot` | 34 × 26 | 4 | 90 ms per frame, loops; stride 6 px per frame | a trot, facing right |

**luibot** and **luibuilder** are Justin's two agents, drawn as robots in the same straw hat. luibot is blue and wears the slate hoodie; luibuilder is orange, boxy, wears the rust over-shirt and rests a hand on a stone block.

| Action | Canvas | Frames | Timing | On the site |
| --- | --- | --- | --- | --- |
| `luibot-idle` | 28 × 32 | 2 | 2800 / 160 ms, loops | standing, blinking |
| `luibot-wave` | 28 × 32 | 2 | 220 ms per frame, loops | waves while the pointer is on him |
| `luibuilder-idle` | 30 × 34 | 2 | 3400 / 160 ms, loops | standing, blinking |
| `luibuilder-wave` | 30 × 34 | 2 | 240 ms, then holds frame 1 | tips his hat while the pointer is on him |

**The tennis ball** rolls up to Truffle's nose the first time her card scrolls into view, and she ignores it.

| Action | Canvas | Frames | Timing | On the site |
| --- | --- | --- | --- | --- |
| `roll` | 10 × 10 | 4 | 1200 ms per frame in `ball-roll.svg` | a quarter turn per frame, rolling right; frame 0 is at rest. On the site the frame is driven by distance travelled (one turn per circumference, about 31 px), not by a clock, so the animated file's 1200 ms is only the renderer's default. |

## Placing one

```html
<img src="sprites/justin-overshirt-idle.svg" width="36" height="62" alt="">
```

- True size (1 CSS px per sprite px) or a whole-number multiple: 36 × 62, 72 × 124, 144 × 248. Never a fractional scale and never smoothing; the SVG is `crispEdges`, so a whole-number size renders without blur, and `image-rendering: pixelated` on the `<img>` is harmless but not needed.
- Feet on a hairline rule. Every standing, sitting and lying frame has its lowest ink on the last row of the canvas, so the bottom edge of the image sits on the rule. The one exception is Justin's `idle`, `walk`, `sip`, `hat` and `arms-up` canvases, which have two spare rows at the top so the walk can bob; their feet are still on the last row.
- The sprites are decorative on the site (`alt=""`, `aria-hidden`). Give one an `alt` only when it is the content.
- The side-view frames (Justin's `walk`, Truffle's `walk` and `trot`, the ball's `roll`) face right. The site mirrors them for leftward travel with a horizontal flip (`transform: scaleX(-1)`); there are no left-facing files. Truffle's sleeping and sitting frames are drawn facing right too, and the site flips her so she faces into her card.
- The animated files switch frames with a CSS animation inside the SVG (no script), so they play inside an `<img>`. Actions that play once (`truffle-ear`, `luibuilder-wave`) hold their last frame. Under `prefers-reduced-motion: reduce` they show one still frame: the first, or the held frame for a play-once action.

## Ink and outline

The ink is `#1e1711`, a near-black warm brown, never pure black; it is darker than the site's text colour so a 2 px outline still holds at true size. Every figure has a closed 2 px outer outline in ink and 1 px interior lines. The outline drops to 1 px around parts that would vanish under 2 px (ears, hands, feet, the antenna light, the 10 px ball). A 1 px outline may step diagonally; the 2 px outline never does.

The clothes and hat share exact colours across Justin and the robots, so the three read as one family: straw `#d9b25a`, hat band `#6e3b2e`, rust over-shirt `#a8674a`, slate hoodie `#5b6579`, grey trousers `#6a6259`.
