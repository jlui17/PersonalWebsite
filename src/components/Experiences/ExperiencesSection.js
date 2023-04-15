import React, { useState } from "react";
import { AiFillFileText as Resume } from "react-icons/ai";
import { MdExpandMore as More } from "react-icons/md";
import { ExperienceContent } from "./Experiences";

export const ExperiencesSection = () => {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      <h3 className="mb-12">Experiences</h3>
      <div className="flex flex-col items-start justify-center lg:grid lg:grid-cols-4 lg:items-start lg:gap-y-12 lg:gap-x-6">
        {showMore ? ExperienceContent : ExperienceContent.slice(0, 3)}
      </div>
      <div className="ml-auto mr-auto flex items-center justify-center lg:mt-8">
        <button
          className="button"
          onClick={() => {
            setShowMore(!showMore);
          }}
        >
          {showMore ? (
            <>
              <More className="text-md mr-1 rotate-180 lg:text-2xl" />
              Show Less
            </>
          ) : (
            <>
              <More className="text-md mr-1 lg:text-2xl" />
              Show More
            </>
          )}
        </button>
        <a
          target="_blank"
          href="./justinlui_resume2023.pdf"
          rel="noopener noreferrer"
          className="button"
        >
          <Resume className="text-md mr-2 text-neutral-900 lg:text-2xl" />
          Resume
        </a>
      </div>
    </>
  );
};
