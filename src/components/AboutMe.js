function AboutMe(props) {
    return (
        <section className="aboutme">
            <div className="aboutme-content">
                <div className="aboutme-content-greeting">
                    <h1>Hellurrr</h1>
                </div>
                <div className="aboutme-content-me">
                    <div className="aboutme-content-me-name">
                        <h1>I'm <mark style={{backgroundColor: "var(--orange)", paddingRight: "8px", paddingLeft: "8px", borderRadius: "0.5rem"}}>Justin Lui</mark>.</h1>
                    </div>
                    <h2>A Software Engineer</h2>
                </div>
                <div className="aboutme-content-description">
                    <p>A BUCS student and Software Engineer at Galvanize.</p>
                </div>
                <div className="aboutme-content-buttons">
                    <a target="_blank" href="https://www.linkedin.com/in/jlui17">LinkedIn</a>
                    <a target="_blank" href="https://github.com/jlui17">Github</a>
                    <a href="#">Medium</a>
                </div>
            </div>
        </section>
    );
}

export default AboutMe;