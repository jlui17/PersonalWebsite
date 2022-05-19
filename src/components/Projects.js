import React, { useState } from "react";
import work from "./content/projects.json";

function Projects() {
  const [showMore, setShowMore] = useState(false);

  const projects = work.map((project) => {
    return (
      <div key={project["title"]} className="projects-content-item">
        <div className="projects-content-item-text">
          <div className="projects-content-item-text-purpose">
            {project["purpose"]["link"] ? (
              <a
                target="_blank"
                href={project["purpose"]["link"]}
                rel="noopener noreferrer"
              >
                <img
                  alt={project["purpose"]["alt"]}
                  src={"./images/" + project["purpose"]["img"]}
                ></img>
                <p>{project["purpose"]["title"]}</p>
              </a>
            ) : (
              <div className="projects-content-item-text-purpose-div">
                <img
                  alt={project["purpose"]["alt"]}
                  src={"./images/" + project["purpose"]["img"]}
                ></img>
                <p>{project["purpose"]["title"]}</p>
              </div>
            )}
          </div>
          <h4 style={{ marginBottom: "1rem" }}>{project["title"]}</h4>
          {project["description"].map((text) => {
            return <p key={text.slice(0, 10)}>{text}</p>;
          })}
          <div className="projects-content-item-text-tools">
            {project["tools"].map((tool) => {
              return <p key={tool}>{tool}</p>;
            })}
            <a
              target="_blank"
              href={project["github"]}
              rel="noopener noreferrer"
            >
              <svg
                version="1.1"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                viewBox="262 -262 1024 1024"
              >
                <path d="M774-249.4c-282.9,0-512,229.1-512,512c0,226.6,146.6,417.9,350.1,485.8c25.6,4.5,35.2-10.9,35.2-24.3 c0-12.2-0.6-52.5-0.6-95.4c-128.6,23.7-161.9-31.4-172.2-60.2c-5.8-14.7-30.7-60.2-52.5-72.3c-17.9-9.6-43.5-33.3-0.6-33.9 c40.3-0.6,69.1,37.1,78.7,52.5c46.1,77.4,119.7,55.7,149.1,42.2c4.5-33.3,17.9-55.7,32.6-68.5c-113.9-12.8-233-57-233-252.8 c0-55.7,19.8-101.8,52.5-137.6c-5.1-12.8-23-65.3,5.1-135.7c0,0,42.9-13.4,140.8,52.5c41-11.5,84.5-17.3,128-17.3 c43.5,0,87,5.8,128,17.3c97.9-66.6,140.8-52.5,140.8-52.5c28.2,70.4,10.2,122.9,5.1,135.7c32.6,35.8,52.5,81.3,52.5,137.6 c0,196.5-119.7,240-233.6,252.8c18.6,16,34.6,46.7,34.6,94.7c0,68.5-0.6,123.5-0.6,140.8c0,13.4,9.6,29.4,35.2,24.3 c202.2-67.8,348.8-259.8,348.8-485.8C1286-20.2,1056.9-249.4,774-249.4z"></path>
              </svg>
            </a>
          </div>
        </div>
        <a
          target="_blank"
          href={project["link"] ? project["link"] : project["github"]}
          rel="noopener noreferrer"
        >
          <img alt={project["alt"]} src={"./images/" + project["img"]}></img>
        </a>
      </div>
    );
  });

  return (
    <section id="projects" className="projects">
      <div className="projects-align">
        <div className="projects-content">
          <h3 style={{ marginBottom: "var(--section-row-spacing)" }}>
            Projects
          </h3>
          {showMore ? projects : projects.slice(0, 3)}
          <div className="showmore-align">
            <button
              className="button"
              onClick={() => setShowMore(!showMore)}
              style={{ marginRight: "20px" }}
            >
              {showMore ? "Show Less" : "Show More"}
            </button>
            <a
              target="_blank"
              href="https://github.com/jlui17"
              rel="noopener noreferrer"
              className="button"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Projects;
