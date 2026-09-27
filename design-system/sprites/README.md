# Sprites

The pixel sprites of justinlui.dev as plain SVG files: Justin, Truffle, the robots luibot and luibuilder, the desk, the tennis ball and the props. They are exported from the site's sheets (`src/sprites/*.js` and `src/designs/panes/ball.js`), and the pixels are the ones the site's renderer (`src/sprites/Sprite.jsx`) draws at scale 1.

Regenerate everything, including `index.html`, after a sheet changes:

```bash
node design-system/sprites/export.mjs
```

The script deletes every SVG in this folder first, so a sprite that has left the sheets leaves this folder too. `index.html` lists every character and action with its canvas size, its timing, a few words on what it is for, and every frame. It is generated from the sheets, so read it instead of a list here.

## Naming

- `<character>-<action>-<frame>.svg` is one still frame, for example `justin-overshirt-idle-0.svg` or `truffle-sleep-1.svg`.
- `<character>-<action>.svg` is the animated version of an action with more than one frame, for example `luibot-wave.svg`.
- File names are kebab-case. The sheet `shoeRack` exports as `shoe-rack`, `cherryTree` as `cherry-tree` and `farmSign` as `farm-sign`.

Justin has two outfits on the same frames. `justin-overshirt` walks the pathway. `justin-hoodie` stands beside his title in the first pane, so the two of him on one screen are told apart.

## Drawn for the dark ground

The sprites' ink (`#1e1711`) is nearly the colour of the panes ground, so an ink outline would vanish and parts joined only by ink would float. The site paints the outer outline (the ink within two cells of empty canvas) in `--sprite-outline`, a soft brown just lighter than the ground. An `<img>` cannot read a CSS variable from the page, so the export reads `--sprite-outline` from `../tokens.css` and writes it into the files. Interior lines, eyes and noses stay ink. The tennis ball keeps its ink outline, because the site draws it that way.

Put these files on `--pn-ground`, `--pn-bar` or `--pn-surface`. They are not drawn for a light page.

## Placing one

```html
<img src="sprites/justin-overshirt-idle.svg" width="36" height="62" alt="">
```

- True size: one CSS px per sprite px. Never a fractional scale and never smoothing. If a sprite is too big for a spot, change the layout, not the sprite.
- Feet on a line the layout already has. The lowest ink of every standing, sitting and lying frame is on the last row of the canvas, so the bottom edge of the image sits on the line. The pathway's floor is the top rule of the step bar.
- Reserve the box for the largest pose the figure takes in that spot, and anchor it at the bottom, so no text moves when the pose changes. Never place a sprite over text.
- The sprites are decoration (`alt=""`, `aria-hidden`). Give one an `alt` only when it is the content.
- Side views face right. Mirror one with `transform: scaleX(-1)` for the other way. There are no left-facing files.
- The animated files switch frames with a CSS animation inside the SVG (no script), so they play inside an `<img>`. An action whose last frame lasts 60 s or more plays once and holds that frame. Under `prefers-reduced-motion: reduce` a file shows one still frame: the first, or the held frame of a play-once action.
- A one-shot (pressing the button, taking the cup, the hat tip) is stepped frame by frame by the design, so use its still frames in order. Do not leave it to the animated file's loop.

The art rules and the staging rules, with the reason behind each, are in `src/sprites/README.md`. What the sprites are for is in `AGENTS.md` under "Sprites".
