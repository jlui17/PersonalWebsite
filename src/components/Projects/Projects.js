import React, { useState } from "react";
import { ProjectContent } from "./Content";

export const Projects = () => {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      <h3 className="mb-12">Projects</h3>
      <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
        {showMore ? ProjectContent : ProjectContent.slice(0, 3)}
      </div>
      <div className="ml-auto mr-auto mt-2 flex items-center justify-center lg:mt-8">
        <button className="button" onClick={() => setShowMore(!showMore)}>
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
    </>
  );
};
