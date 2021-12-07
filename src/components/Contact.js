function Footer() {
    return (
        <section id="contact" className="contact" style={{marginBottom:"calc(var(--section-spacing)*2/4)"}}>
            <div className="contact-align">
                <div className="contact-content">
                    <div className="contact-content-container">
                        <h3 style={{marginBottom:"var(--section-row-spacing)"}}>Connect With Me!</h3>
                        <p style={{marginBottom:"var(--section-row-spacing)"}}>Interested in learning more about me? Feel free to connect via email or LinkedIn.</p>
                        <div className="contact-content-container-card">
                            <img src="../images/contact.jpg" alt="justinlui"></img>
                            <div className="contact-content-container-card-text">
                                <div>
                                    <h4>Justin Lui</h4>
                                    <a className="contact-content-container-card-text-email" href="mailto:justinlui17@gmail.com">justinlui17@gmail.com</a>
                                </div>
                                <div className="contact-content-container-card-text-buttons">
                                    <a target="_blank" href="https://www.linkedin.com/in/jlui17" rel="noopener noreferrer" className="button">LinkedIn</a>
                                    <a target="_blank" href="https://github.com/jlui17" rel="noopener noreferrer" className="button">Github</a>
                                    <a target="_blank" href="https://justinlui17.medium.com/" rel="noopener noreferrer" className="button">Medium</a>
                                    <a target="_blank" href="./justinlui_resume2021.pdf" rel="noopener noreferrer" className="button">Resume</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Footer;