import "./App.css";
import "./components/Header/Header.js";
import { Header } from "./components/Header/Header.js";
import { Intro } from "./components/Intro.js";
import AboutMe from "./components/AboutMe.js";
import Experiences from "./components/Experiences.js";
import Contact from "./components/Contact";
import Projects from "./components/Projects";

function App() {
  return (
    <div className="flex w-full flex-col items-center justify-center bg-neutral-900">
      <header
        id="top"
        className="flex h-16 w-full max-w-[1023px] items-center justify-center bg-neutral-800 shadow-xl lg:h-24 lg:rounded-b-xl"
      >
        <div className="mx-4 flex w-full items-center justify-between">
          <Header />
        </div>
      </header>
      <div className="w-[95vw] max-w-[1023px]">
        <main className="flex w-full flex-col items-center justify-center px-4">
          <div className="mt-20 mb-20 flex h-[40rem] w-auto flex-col items-center justify-center pt-0 lg:flex-row lg:justify-between">
            <Intro />
          </div>
          <div>
            <AboutMe />
          </div>
          <div>
            <Experiences />
          </div>
          <div>
            <Projects />
          </div>
          <div>
            <Contact />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
