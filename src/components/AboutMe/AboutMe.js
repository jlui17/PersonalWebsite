import { truffle, interests, skills, newSkills } from "./Content";

export const AboutMe = () => {
  return (
    <>
      <div className="mb-12 lg:mb-0">
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
      <div className="mb-12 lg:mb-0">
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
              <div key={interest["tag"]} className="tag">
                <p>{interest["tag"]}</p>
                {imgs}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mb-12 lg:mb-0">
        <h4 className="mb-2">Software Engineer</h4>
        <p>
          I'm particularly interested in infrastructure and back-end design as I
          find understanding and improving systems to be the coolest part of
          developing. Currently working in as many different internships as I
          can to become the best developer I can be.
        </p>
      </div>
      <div className="mb-12 lg:mb-0">
        <h4 className="mb-2">Skills</h4>
        <div className="flex flex-wrap">
          {newSkills.map((skill) => {
            // const skills = skill.images.map((img) => {
            //   return (
            //     <img
            //       key={img["loc"]}
            //       src={"./images/" + img["loc"]}
            //       alt={img["alt"]}
            //       className="aspect-auto h-5 pl-2"
            //     ></img>
            //   );
            // });
            // return (
            //   <div key={skill["tag"]} className="tag">
            //     <p>{skill["tag"]}</p>
            //     {skills}
            //   </div>
            // );
            return (
              <div className="tag" key={skill["tag"]}>
                {skill}
              </div>
            );
          })}
        </div>
      </div>
      <div className="col-span-2 flex flex-wrap overflow-hidden">
        <h4 className="mb-2">Truffle</h4>
        <div className="scroll flex flex-nowrap overflow-x-scroll">
          {truffle.map((pic) => {
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
    </>
  );
};
