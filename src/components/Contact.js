function Footer() {
  return (
    <div className="contact-content-container mb-12 w-full md:w-2/3">
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
        <div className="flex h-40 flex-col flex-wrap items-start justify-evenly">
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
              LinkedIn
            </a>
            <a
              target="_blank"
              href="https://github.com/jlui17"
              rel="noopener noreferrer"
              className="button"
            >
              Github
            </a>
            <a
              target="_blank"
              href="https://justinlui17.medium.com/"
              rel="noopener noreferrer"
              className="button"
            >
              Medium
            </a>
            <a
              target="_blank"
              href="./justinlui_resume2022.pdf"
              rel="noopener noreferrer"
              className="button"
            >
              Resume
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
