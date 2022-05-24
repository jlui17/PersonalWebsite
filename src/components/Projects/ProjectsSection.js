import React, { useState } from "react";
import { AiFillGithub as GitHub } from "react-icons/ai";
import { MdExpandMore as More } from "react-icons/md";
import { Projects } from "./Projects";

export const ProjectsSection = () => {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      <h3 className="mb-12">Projects</h3>
      <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
        {showMore ? Projects : Projects.slice(0, 3)}
      </div>
      <div className="ml-auto mr-auto mt-2 flex items-center justify-center lg:mt-8">
        <button className="button" onClick={() => setShowMore(!showMore)}>
          {showMore ? (
            <>
              <More size={"1.5rem"} className="mr-1 rotate-180" />
              Show Less
            </>
          ) : (
            <>
              <More size={"1.5rem"} className="mr-1" />
              Show More
            </>
          )}
        </button>
        <a
          target="_blank"
          href="https://github.com/jlui17"
          rel="noopener noreferrer"
          className="button"
        >
          <GitHub size={"1.5rem"} className="mr-2 text-neutral-900" />
          Github
        </a>
      </div>
    </>
  );
};
