import { AiFillGithub as GitHub } from "react-icons/ai";
import { ProjectsContent } from "./Content";

export const Projects = ProjectsContent.map((project) => {
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
            <p
              className="mb-2"
              key={text.slice(0, 10)}
              dangerouslySetInnerHTML={{ __html: text }}
            />
          );
        })}
        <div className="mt-3 flex flex-wrap items-center justify-start">
          {project["tools"].map(({ icon, tool }) => {
            return (
              <div className="tag">
                {icon ? icon : null}
                {tool ? (
                  <p key={tool} className="">
                    {tool}
                  </p>
                ) : null}
              </div>
            );
          })}
          <a target="_blank" href={project["github"]} rel="noopener noreferrer">
            <GitHub
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
