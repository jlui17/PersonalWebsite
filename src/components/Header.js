export const Header = () => {
  return (
    <>
      <a href="#top" className="group">
        <img
          className="aspect-auto h-16 group-hover:animate-bounce"
          src="../images/truffle.png"
          alt="trufflebday"
        ></img>
      </a>
      <nav>
        <a className="header-link" href="#aboutme">
          About Me
        </a>
        <a className="header-link" href="#experiences">
          Experiences
        </a>
        <a className="header-link" href="#projects">
          Projects
        </a>
        <a className="header-link" href="#contact">
          Contact
        </a>
      </nav>
    </>
  );
};
