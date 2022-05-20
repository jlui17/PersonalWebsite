import React, { useState } from "react";
import { AiFillGithub } from "react-icons/ai";
import work from "./content/projects.json";

export const Projects = () => {
  const [showMore, setShowMore] = useState(false);

  const projects = work.map((project) => {
    return (
      <>
        <div className="col-span-2">
          <a
            target="_blank"
            href={project["purpose"]["link"]}
            rel="noopener noreferrer"
            className="inline-flex items-center justify-start border-b-2 border-transparent transition-colors ease-linear hover:border-white"
          >
            <img
              alt={project["purpose"]["alt"]}
              src={"./images/" + project["purpose"]["img"]}
              className="h-4 rounded-none border-none shadow-none"
            ></img>
            <p className="ml-2 mb-0 font-heading text-sm">
              {project["purpose"]["title"]}
            </p>
          </a>
          <h4 className="mb-3">{project["title"]}</h4>
          {project["description"].map((text) => {
            return (
              <p className="mb-2" key={text.slice(0, 10)}>
                {text}
              </p>
            );
          })}
          <div className="mt-3 flex flex-wrap items-center justify-start">
            {project["tools"].map((tool) => {
              return (
                <p
                  key={tool}
                  className="mr-4 mb-2 rounded-xl bg-neutral-700 px-3 py-3 lg:py-2"
                >
                  {tool}
                </p>
              );
            })}
            <a
              target="_blank"
              href={project["github"]}
              rel="noopener noreferrer"
            >
              <AiFillGithub
                size={"2.5rem"}
                className="mb-2 text-neutral-700 transition-colors duration-300 hover:text-white"
              />
            </a>
          </div>
        </div>
        <a
          target="_blank"
          href={project["link"] ? project["link"] : project["github"]}
          rel="noopener noreferrer"
        >
          <img
            className="mt-2 mb-12 aspect-[4/3] h-56 rounded-xl object-fill shadow-xl transition-transform duration-300 hover:-translate-y-1 lg:ml-auto lg:mt-0"
            alt={project["alt"]}
            src={"./images/" + project["img"]}
          ></img>
        </a>
      </>
    );
  });

  return (
    <>
      <h3 className="mb-12">Projects</h3>
      <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
        {showMore ? projects : projects.slice(0, 3)}
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
