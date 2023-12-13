import {
  AiFillGithub as GitHub,
  AiFillLinkedin as LinkedIn,
  AiOutlineTwitter as Twitter,
  AiFillFileText as Resume,
} from "react-icons/ai";

export const Intro = () => {
  return (
    <>
      <div className="flex flex-col">
        <div className="mb-5">
          <h1>Beep boop.</h1>
        </div>
        <div className="mb-5">
          <div className="flex">
            <h1>
              I'm{" "}
              <mark className="color-black rounded-xl bg-orange-300 px-3 py-1 lg:py-2">
                Justin Lui.
              </mark>
            </h1>
          </div>
          <h2 className="mt-3 lg:mt-0">
            Software Development Engineer @ Amazon
          </h2>
        </div>
        <p>
          Using technology to make work and life easier 💻 <br />
          Find me on summer weekends at the Richmond Night Market 🎪{" "}
        </p>
        <div className="flex flex-wrap">
          <a
            target="_blank"
            href="https://www.linkedin.com/in/jlui17"
            rel="noopener noreferrer"
            className="button"
          >
            <LinkedIn className="text-md mr-2 text-neutral-900 lg:text-2xl" />
            LinkedIn
          </a>
          <a
            target="_blank"
            href="https://github.com/jlui17"
            rel="noopener noreferrer"
            className="button"
          >
            <GitHub className="text-md mr-2 text-neutral-900 lg:text-2xl" />
            Github
          </a>
          <a
            target="_blank"
            href="https://twitter.com/justinlui17"
            rel="noopener noreferrer"
            className="button"
          >
            <Twitter className="text-md mr-2 text-neutral-900 lg:text-2xl" />
            Twitter
          </a>
          <a
            target="_blank"
            href="./justinlui_resume.pdf"
            rel="noopener noreferrer"
            className="button"
          >
            <Resume className="text-md mr-2 text-neutral-900 lg:text-2xl" />
            Resume
          </a>
        </div>
      </div>
      <img
        className="mt-8 aspect-auto h-[300px] rounded-xl shadow-lg lg:ml-8 lg:mt-0"
        src="./images/JustinLui.jpg"
        alt="Headshot of Justin Lui"
      ></img>
    </>
  );
};
