import "./App.css";
import "./components/Header.js";
import Header from "./components/Header.js";
import AboutMe from "./components/AboutMe.js"

function App() {
    return (
        <div>
            <Header></Header>
            <main className="main-content">
                <AboutMe></AboutMe>
            </main>
        </div>
    );
}

export default App;
