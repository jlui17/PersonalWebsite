import { AiFillFileText as Resume } from "react-icons/ai";

import { MobileDropdown } from "./MobileDropdown";

export const Header = () => {
  return (
    <>
      <a href="#top" className="group">
        <img
          className="mr-4 aspect-auto h-10 group-hover:animate-bounce lg:ml-0 lg:h-16"
          src="../images/truffle.png"
          alt="trufflebday"
        ></img>
      </a>
      <nav className="hidden lg:flex lg:basis-auto">
        <a className="lg:header-link" href="#aboutme">
          About Me
        </a>
        <a className="lg:header-link" href="#experiences">
          Experiences
        </a>
        <a className="lg:header-link" href="#projects">
          Projects
        </a>
        <a
          className="lg:header-link"
          target="_blank"
          href="./justinlui_resume2023.pdf"
        >
          <Resume className="text-md mr-2 lg:text-2xl" />
          Resume
        </a>
      </nav>
      <MobileDropdown />
    </>
  );
};
