import { lazy, Suspense } from "react";
import Panes from "./designs/panes/index.jsx";

// /?design=sprites is the sprite viewer, an internal tool. It is lazy so that it stays out of the main bundle.
const SpritePreview = lazy(() => import("./sprites/SpritePreview.jsx"));
const design = new URLSearchParams(window.location.search).get("design");

export const App = () =>
  design === "sprites" ? (
    <Suspense>
      <SpritePreview />
    </Suspense>
  ) : (
    <Panes />
  );
