import { AboutMe } from "./AboutMe";

export const AboutMeSection = () => {
  return (
    <div className="justify-centre flex flex-col items-start lg:grid lg:grid-cols-2 lg:gap-x-16 lg:gap-y-12">
      <h3 className="lg:col-span-2">About Me</h3>
      <AboutMe />
    </div>
  );
};
