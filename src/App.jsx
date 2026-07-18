import PostcardWall from "./designs/PostcardWall.jsx";
import SpecSheet from "./designs/SpecSheet.jsx";

const design = new URLSearchParams(window.location.search).get("design");

export const App = () => (design === "postcard" ? <PostcardWall /> : <SpecSheet />);
