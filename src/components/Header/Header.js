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
      <nav className="hidden lg:block">
        <a className="lg:header-link" href="#aboutme">
          About Me
        </a>
        <a className="lg:header-link" href="#experiences">
          Experiences
        </a>
        <a className="lg:header-link" href="#projects">
          Projects
        </a>
        <a className="lg:header-link" href="./justinlui_resume2022.pdf">
          Resume
        </a>
      </nav>
      <MobileDropdown />
    </>
  );
};
