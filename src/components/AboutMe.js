import interests from "./content/interests.json"
import skills from "./content/skills.json"

const truffles = [
    {"alt":"truffle1","loc":"truffle1.jpg"},
    {"alt":"truffle2","loc":"truffle2.jpg"},
    {"alt":"truffle3","loc":"truffle3.jpg"},
    {"alt":"truffle4","loc":"truffle4.jpeg"},
    {"alt":"truffle5","loc":"truffle5.jpeg"},
]

function AboutMe(props) {


    return (
        <section id="aboutme" className="aboutme">
            <div className="aboutme-align">
                <div className="aboutme-content">
                    <h3 className="aboutme-content-title">About Me</h3>
                    <div className="aboutme-content-education">
                        <h4>Education</h4>
                        <p>I'm a 3rd year student in the Combined Major in Business and Computer Science (BUCS) program at the UBC Sauder School of Business.
                            <br></br>
                            <br></br>
                            I love this program. Not only does it combine my two passions, but it has helped me meet so many amazing people who have shaped who I am today.
                        </p>
                    </div>
                    <div className="aboutme-content-interests">
                        <h4>Interests</h4>
                        <div className="aboutme-content-interests-container">
                            {interests.map((interest) => {
                                const imgs = interest.images.map((img) => {
                                    return (
                                        <img src={"./images/" + img["loc"]} alt={img["alt"]}></img>
                                    )
                                })
                                return (<div className="aboutme-content-interests-container-item"><p>{interest["tag"]}</p>{imgs}</div>)
                            })}
                        </div>
                    </div>
                    <div className="aboutme-content-career">
                        <h4>Career</h4>
                        <p>Currently exploring all the different avenues of tech. Looking to focus on front- and back-end SWE positions, then branch out into TPM.</p>
                    </div>
                    <div className="aboutme-content-skills">
                        <h4>Skills</h4>
                        <div className="aboutme-content-skills-container">
                            {skills.map((skill) => {
                                const imgs = skill.images.map((img) => {
                                    return (
                                        <img src={"./images/" + img["loc"]} alt={img["alt"]}></img>
                                    )
                                })
                                return (<div className="aboutme-content-skills-container-item"><p>{skill["tag"]}</p>{imgs}</div>)
                            })}
                        </div>
                    </div>
                    <div className="aboutme-content-truffle">
                        <h4>Truffle</h4>
                        <div className="aboutme-content-truffle-pics">
                            {truffles.map((pic) => {
                                return (
                                    <img src={"./images/" + pic["loc"]} alt={pic["alt"]}></img>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default AboutMe;