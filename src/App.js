import "./App.css";
import "./components/Header.js";
import Header from "./components/Header.js";
import Intro from "./components/Intro.js";
import AboutMe from "./components/AboutMe.js";
import Experiences from "./components/Experiences.js";
import Contact from "./components/Contact";
import Projects from "./components/Projects";

function App() {
  return (
    <div className="bg-neutral-900">
      <Header></Header>
      <main className="main-content">
        <div className="flex flex-col lg:flex-row lg:justify-center items-center px-10 lg:px-0 pt-0 h-[40rem] mt-20 mb-20">
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
  );
}

export default App;
