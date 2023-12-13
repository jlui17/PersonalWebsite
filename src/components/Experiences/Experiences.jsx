import { ExperiencesContent } from "./Content";

export const ExperienceContent = ExperiencesContent.map((job) => {
  return (
    <>
      <a target="_blank" href={job["link"]} rel="noopener noreferrer">
        <img
          src={"./images/" + job["image"]["file"]}
          alt={job["image"]["alt"]}
          className="mb-3 aspect-auto w-60 rounded-xl shadow-xl transition-transform duration-300 hover:-translate-y-1 lg:mb-0"
        />
      </a>
      <div className="col-span-3 w-full">
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
            <p
              key={text}
              className="mb-2 last:mb-12"
              dangerouslySetInnerHTML={{ __html: text }}
            />
          );
        })}
        <div className="mt-3 mb-12 flex flex-wrap items-center justify-start lg:mb-0">
          {job["tools"].map((tool) => {
            return <div className="tag">{tool}</div>;
          })}
        </div>
      </div>
    </>
  );
});
