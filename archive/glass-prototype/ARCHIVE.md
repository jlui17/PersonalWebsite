# Archive: the glass prototype

This folder is a snapshot of the whole site as it was when the `glass` prototype last ran. `glass` shows the site as Liquid Glass widgets over a sky that follows the San Francisco hour. It was set aside in favour of `panes` as not to his taste for now.

Nothing in the live site imports this folder, and it is never deployed.

## Run it

```bash
cd archive/glass-prototype
npm install
npm start
```

Then open `http://localhost:5173/?design=glass`. Add `&hour=0..23` to pin the San Francisco hour. The snapshot also holds the other designs from that day: `/` is the old warm spec sheet, and `/?design=panes` and `/?design=spec-sheet-evolved` are the two other prototypes as they were then.

## What differs from the original

- Nothing was left out. The snapshot has no build output and no `node_modules`.
- Personal details were removed from its docs and comments.
- `design-system/sprites/*.svg` were exported from older sprite sheets, and `design-system/sprites/export.mjs` fails at this snapshot, so the SVGs are kept as they were.
