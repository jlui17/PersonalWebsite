function AboutMe(props) {
    return (
        <section className="aboutme">
            <div className="aboutme-align">
                <div className="aboutme-content">
                    <div className="aboutme-desc">
                        <div className="aboutme-desc-greeting">
                            <h1>Hellurrr</h1>
                        </div>
                        <div className="aboutme-desc-me">
                            <div className="aboutme-desc-me-name">
                                <h1>I'm <mark style={{backgroundColor: "var(--orange)", paddingRight: "8px", paddingLeft: "8px", borderRadius: "0.5rem"}}>Justin Lui</mark>.</h1>
                            </div>
                            <h2>Software Engineer Intern @ Galvanize</h2>
                        </div>
                        <div className="aboutme-desc-text">
                            <p>I'm passionate about using technology to make work and life easier. 💻 <br></br>
                            <i>Always finding ways to work smarter (and sometimes harder).</i></p>
                        </div>
                        <div className="aboutme-desc-buttons">
                            <a target="_blank" href="https://www.linkedin.com/in/jlui17" className="button">LinkedIn</a>
                            <a target="_blank" href="https://github.com/jlui17" className="button">Github</a>
                        </div>
                    </div>
                    <div className="aboutme-pic">
                        <img src="./images/JustinLui.jpg"></img>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AboutMe;