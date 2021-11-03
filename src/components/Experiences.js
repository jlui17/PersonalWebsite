import React from "react"
import jobs from "./content/jobs.json"

const experiences = jobs.map((job) => {
    return (
        <div className="experiences-content-item">
            <a target="_blank" href={job["link"]} rel="noopener noreferrer"><img src={"./images/"+job["image"]["file"]} alt={job["image"]["alt"]}></img></a>
            <div className="experiences-content-item-text">
                <div className="experiences-content-item-text-title">
                    <h4>{job["position"]}</h4>
                    <h4 style={{color:"var(--date-color)"}}>{job["duration"]}</h4>
                </div>
                <div style={{marginBottom:"var(--title-detail-spacing)"}} className="experiences-content-item-text-details">
                    <p>{job["company"]}</p>
                    <p>{job["location"]}</p>
                </div>
                {job["description"].map((text) => {return(<p style={{marginBottom:"var(--experiences-description-spacing)"}}>{text}</p>)})}
            </div>
        </div>
    )
})

class Experiences extends React.Component {
    constructor() {
        super();
        this.state = {
            "showMore":false
        }
        this.changeShow = this.changeShow.bind(this)
    }

    changeShow() {
        console.log(this.state.showMore ? "hiding" : "showing")
        this.setState({
            "showMore":!this.state.showMore
        })
    }

    render() {
        return (
            <section id="experiences" className="experiences">
                <div className="experiences-align">
                    <div className="experiences-content">
                        <h3 style={{marginBottom:"var(--section-row-spacing)"}}>Experiences</h3>
                        {this.state.showMore ? experiences : experiences.slice(0,3)}
                        <div className="showmore-align">
                            <button className="show-button" onClick={this.changeShow} onMouseEnter={this.hoverShow} onMouseExit={this.unHoverShow}>{this.state.showMore ? "Show Less" : "Show More"}</button>
                        </div>
                    </div>
                </div>
            </section>
        )
    }   
}

export default Experiences;