import "./App.css";
import "./components/Header.js";
import Header from "./components/Header.js";
import Intro from "./components/Intro.js"
import AboutMe from "./components/AboutMe.js"
import Experiences from "./components/Experiences.js"
import Contact from "./components/Contact";

function App() {
    return (
        <div>
            <Header></Header>
            <main className="main-content">
                <Intro></Intro>
                <AboutMe></AboutMe>
                <Experiences></Experiences>
                <Contact></Contact>
            </main>
        </div>
    );
}

export default App;
