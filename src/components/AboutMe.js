import interests from "./content/interests.json";
import skills from "./content/skills.json";

const truffles = [
  { alt: "truffle1", loc: "truffle1.jpg" },
  { alt: "truffle2", loc: "truffle2.jpg" },
  { alt: "truffle3", loc: "truffle3.jpg" },
  { alt: "truffle4", loc: "truffle4.jpeg" },
  { alt: "truffle5", loc: "truffle5.jpeg" },
];

export const AboutMe = () => {
  return (
    <div className="grid grid-cols-2 gap-x-16 gap-y-12">
      <h3 className="col-span-2">About Me</h3>
      <div className="aboutme-content-education">
        <h4 className="mb-2">CS + Business @ UBC</h4>
        <p>
          I'm a 3rd year student in the Combined Major in Business and Computer
          Science (BUCS) program at the UBC Sauder School of Business.
          <br></br>
          <br></br>I love this program. Not only does it combine my two
          passions, but it has helped me meet so many amazing people who have
          shaped who I am today.
        </p>
      </div>
      <div>
        <h4 className="mb-2">Interests</h4>
        <div className="flex flex-wrap">
          {interests.map((interest) => {
            const imgs = interest.images.map((img) => {
              return (
                <img
                  key={img["loc"]}
                  src={"./images/" + img["loc"]}
                  alt={img["alt"]}
                  className="aspect-auto h-5 pl-2"
                ></img>
              );
            });
            return (
              <div
                key={interest["tag"]}
                className="mr-1 mb-2 flex items-center rounded-xl border-2 bg-neutral-800 p-3"
              >
                <p>{interest["tag"]}</p>
                {imgs}
              </div>
            );
          })}
        </div>
      </div>
      <div className="aboutme-content-career">
        <h4 className="mb-2">Software Engineer</h4>
        <p>
          I'm particularly interested in infrastructure and back-end design as I
          find understanding and improving systems to be the coolest part of
          developing. Currently working in as many different internships as I
          can to become the best developer I can be.
        </p>
      </div>
      <div>
        <h4 className="mb-2">Skills</h4>
        <div className="flex flex-wrap">
          {skills.map((skill) => {
            const skills = skill.images.map((img) => {
              return (
                <img
                  key={img["loc"]}
                  src={"./images/" + img["loc"]}
                  alt={img["alt"]}
                  className="aspect-auto h-5 pl-2"
                ></img>
              );
            });
            return (
              <div
                key={skill["tag"]}
                className="mr-1 mb-2 flex items-center rounded-xl border-2 bg-neutral-800 p-3"
              >
                <p>{skill["tag"]}</p>
                {skills}
              </div>
            );
          })}
        </div>
      </div>
      <div className="col-span-2 flex flex-wrap overflow-hidden">
        <h4 className="mb-2">Truffle</h4>
        <div className="scroll flex flex-nowrap overflow-x-scroll">
          {truffles.map((pic) => {
            return (
              <img
                key={pic["loc"]}
                src={"./images/" + pic["loc"]}
                alt={pic["alt"]}
                className="aspect-1/1 mr-4 mb-2 h-48 rounded-xl shadow-lg"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
