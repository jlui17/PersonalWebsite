function Intro(props) {
    return (
        <section className="intro">
            <div className="intro-align">
                <div className="intro-content">
                    <div className="intro-desc">
                        <div className="intro-desc-greeting">
                            <h1>Hellurrr</h1>
                        </div>
                        <div className="intro-desc-me">
                            <div className="intro-desc-me-name">
                                <h1>I'm <mark style={{backgroundColor: "var(--orange)", paddingRight: "8px", paddingLeft: "8px", borderRadius: "0.5rem"}}>Justin Lui</mark>.</h1>
                            </div>
                            <h2>Software Engineer Intern @ Galvanize</h2>
                        </div>
                        <div className="intro-desc-text">
                            <p>I'm passionate about using technology to make work and life easier. 💻 <br></br>
                            <i>Always finding ways to work smarter (and sometimes harder).</i></p>
                        </div>
                        <div className="intro-desc-buttons">
                            <a target="_blank" href="https://www.linkedin.com/in/jlui17" className="button">LinkedIn</a>
                            <a target="_blank" href="https://github.com/jlui17" className="button">Github</a>
                        </div>
                    </div>
                    <div className="intro-pic">
                        <img src="./images/JustinLui.jpg" alt="Headshot of Justin Lui"></img>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Intro;