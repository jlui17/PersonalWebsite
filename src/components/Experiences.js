import React, { useState } from "react";
import jobs from "./content/jobs.json";

function Experiences() {
  const [showMore, setShowMore] = useState(false);

  const experiences = jobs.map((job) => {
    return (
      <>
        <a target="_blank" href={job["link"]} rel="noopener noreferrer">
          <img
            src={"./images/" + job["image"]["file"]}
            alt={job["image"]["alt"]}
            className="mb-3 aspect-auto w-60 rounded-xl shadow-xl transition-transform duration-300 hover:-translate-y-1 lg:mb-0"
          />
        </a>
        <div className="col-span-2 w-full">
          <div className="mb-1 flex flex-col items-start justify-between sm:mb-0 sm:flex-row sm:items-center">
            <h4>{job["position"]}</h4>
            <h4 className="text-neutral-700">{job["duration"]}</h4>
          </div>
          <div className="mb-3 flex flex-col items-start justify-start sm:flex-row sm:items-center sm:justify-between">
            <p>{job["company"]}</p>
            <p>{job["location"]}</p>
          </div>
          {job["description"].map((text) => {
            return (
              <p key={text} className="mb-2 last:mb-12">
                {text}
              </p>
            );
          })}
        </div>
      </>
    );
  });

  return (
    <>
      <h3 className="mb-12">Experiences</h3>
      <div className="flex flex-col items-start justify-center lg:grid lg:grid-cols-3 lg:items-start lg:gap-y-12">
        {showMore ? experiences : experiences.slice(0, 3)}
      </div>
      <div className="ml-auto mr-auto flex items-center justify-center">
        <button
          className="button"
          onClick={() => {
            setShowMore(!showMore);
          }}
        >
          {showMore ? "Show Less" : "Show More"}
        </button>
        <a target="_blank" href="./justinlui_resume2022.pdf" className="button">
          Resume
        </a>
      </div>
    </>
  );
}

export default Experiences;
