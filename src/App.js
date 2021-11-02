import "./App.css";
import "./components/Header.js";
import Header from "./components/Header.js";
import Intro from "./components/Intro.js"

function App() {
    return (
        <div>
            <Header></Header>
            <main className="main-content">
                <Intro></Intro>
            </main>
        </div>
    );
}

export default App;
