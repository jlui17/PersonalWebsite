import React from "react";

class Projects extends React.Component {
    constructor() {
        super()
        this.state = {
            "showMore":false
        }
        this.changeShow = this.changeShow.bind(this)
    }

    changeShow() {
        this.setState({
            "showMore":!this.state.showMore
        })
    }

    render() {
        return (
            <section id="projects" className="projects">
                <div className="projects-align">
                    <div className="projects-content">
                        <h3 style={{marginBottom:"var(--section-row-spacing)"}}>Projects</h3>
                        <div className="projects-content-item">
                            <div className="projects-content-item-text">
                                <div className="projects-content-item-text-purpose">
                                    <p>Global Game Jam 2020</p>
                                </div>
                                <h4>Echo</h4>
                                <p>I teamed up with some friends to create this 2D side scroller game concept using Unity. Although it didn't win any prizes/awards, this was my first hackathon and it was super enjoyable.</p>
                                <div className="projects-content-item-text-tools">
                                    <p>Unity</p>
                                    <p>C#</p>
                                </div>
                            </div>
                            <img alt="echo" src="./images/echo.png"></img>
                        </div>
                        <div className="showmore-align">
                            <button className="show-button" onClick={this.changeShow} style={{marginRight:"20px"}}>{this.state.showMore ? "Show Less" : "Show More"}</button>
                            <a target="_blank" href="https://github.com/jlui17" rel="noopener noreferrer"><button className="show-button">GitHub</button></a>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}

export default Projects;