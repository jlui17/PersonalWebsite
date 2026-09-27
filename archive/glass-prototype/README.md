# PersonalWebsite

Justin Lui's personal site, [justinlui.dev](https://justinlui.dev). It is about who he is: the people he loves, what he is into, and a few things he has built. It is not a portfolio, and it must never read as a resume.

React 19 + Vite, one page, plain CSS. Pushing `main` deploys it to Cloudflare Pages.

```bash
npm install
npm start       # dev server at localhost:5173
npm run build   # production build into dist/
```

## Where things are

- `src/content.js`: every word on the site, as named exports. A routine edit happens here and never touches markup.
- `src/designs/`: the designs. `SpecSheet.jsx` with `spec-sheet.css` is the live one. `/?design=<name>` opens another one, for example `/?design=postcard` for the old postcard design.
- `src/sprites/`: the pixel sprites (Justin, his dog Truffle, his two robots, and props) and the component that draws them. `/?design=sprites` shows every frame.
- `design-system/`: the site's tokens, component cards and sprites exported as plain files.
- `public/`: copied into the deploy as it is. Read "New photo" in `AGENTS.md` before you add a photo.

## Docs

- [`AGENTS.md`](AGENTS.md): how the site is designed and worded, and why. The design principles, the voice, how to edit content, how design work goes well here, and what to avoid. Coding agents load it in every session, and it is the place to start for a person too.
- [`src/sprites/README.md`](src/sprites/README.md): the sprite guide. How a sheet is built, how to draw and change one with the rejection behind each art rule, and how to stage sprites in a design.
- [`docs/design-process.md`](docs/design-process.md): how to run design work with Justin. How to show him options, how to keep his words, and how to check a design by hand (routes, overrides, widths, browser traps).
- [`docs/design-review.md`](docs/design-review.md): how finished design work gets reviewed. Justin's taste in his own words, his rejections quoted by topic, and the review protocol. It is written to be handed to a fresh reviewer.
