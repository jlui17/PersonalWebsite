import { lazy, Suspense } from "react";
import PostcardWall from "./designs/PostcardWall.jsx";
import SpecSheet from "./designs/SpecSheet.jsx";
import SpritePreview from "./sprites/SpritePreview.jsx";

const design = new URLSearchParams(window.location.search).get("design");

// Redesign prototypes: /?design=<name> loads src/designs/<name>/index.jsx.
// Lazy, so only the chosen prototype's CSS is on the page. Temporary: goes away when Justin picks one.
const prototypes = import.meta.glob("./designs/*/index.jsx");
const loadPrototype = prototypes[`./designs/${design}/index.jsx`];
const Prototype = loadPrototype && lazy(loadPrototype);

export const App = () =>
  Prototype ? (
    <Suspense>
      <Prototype />
    </Suspense>
  ) : design === "postcard" ? (
    <PostcardWall />
  ) : design === "sprites" ? (
    <SpritePreview />
  ) : (
    <SpecSheet />
  );
