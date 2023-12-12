import {
  AiFillGithub,
  AiFillLinkedin,
  AiOutlineTwitter as Twitter,
  AiFillFileText,
} from "react-icons/ai";

export const Contact = () => {
  return (
    <div className="contact-content-container mb-12 w-full md:w-3/4">
      <h3 className="mb-4">Connect With Me!</h3>
      <p className="mb-4">
        Interested in learning more about me? Feel free to connect via email or
        LinkedIn.
      </p>
      <div className="mb-4 flex items-center justify-start">
        <img
          className="mr-12 hidden aspect-auto h-40 rounded-full shadow-xl sm:block"
          src="../images/contact.jpg"
          alt="justinlui"
        ></img>
        <div className="flex h-40 flex-col items-start justify-evenly">
          <div>
            <h4>Justin Lui</h4>
            <a
              className="transition-colors duration-300 hover:underline"
              href="mailto:justinlui17@gmail.com"
            >
              justinlui17@gmail.com
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-start">
            <a
              target="_blank"
              href="https://www.linkedin.com/in/jlui17"
              rel="noopener noreferrer"
              className="button"
            >
              <AiFillLinkedin className="text-md mr-2 text-neutral-900 lg:text-2xl" />
              LinkedIn
            </a>
            <a
              target="_blank"
              href="https://github.com/jlui17"
              rel="noopener noreferrer"
              className="button"
            >
              <AiFillGithub className="text-md mr-2 text-neutral-900 lg:text-2xl" />
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
              <AiFillFileText className="text-md mr-2 text-neutral-900 lg:text-2xl" />
              Resume
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
