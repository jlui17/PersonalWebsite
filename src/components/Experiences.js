import React, {useState} from "react"
import jobs from "./content/jobs.json"

function Experiences() {
    const [showMore, setShowMore] = useState(false);

    const experiences = jobs.map((job) => {
        return (
            <div key={job["position"] + job["duration"]} className="experiences-content-item">
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
                    {job["description"].map((text) => {return(<p key={text} style={{marginBottom:"var(--experiences-description-spacing)"}}>{text}</p>)})}
                </div>
            </div>
        )
    });

    return (
        <section id="experiences" className="experiences">
            <div className="experiences-align">
                <div className="experiences-content">
                    <h3 style={{marginBottom:"var(--section-row-spacing)"}}>Experiences</h3>
                    {showMore ? experiences : experiences.slice(0,3)}
                    <div className="showmore-align">
                        <button className="show-button" onClick={() => {setShowMore(!showMore)}} style={{marginRight:"20px"}}>{showMore ? "Show Less" : "Show More"}</button>
                        <a target="_blank" href="./justinlui_resume2022.pdf"><button className="show-button">Resume</button></a>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Experiences;
