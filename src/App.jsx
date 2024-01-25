import {
  AiFillGithub as GitHub,
  AiFillLinkedin as LinkedIn,
  AiFillFileText as Resume,
} from "react-icons/ai";
import { SiMedium as Medium } from "react-icons/si";
import { Link } from "./components/Link.tsx";

export const App = () => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-neutral-900">
      <div className="w-[95vw] max-w-[1023px]">
        <main className="flex w-full flex-col items-center justify-center px-4">
          <div className="mb-20 mt-20 flex h-[40rem] w-full flex-col items-center justify-center pt-0 lg:flex-row lg:justify-around">
            <div className="flex flex-col">
              <h2 className="mb-5">Open to SWE/PM Opportunities!</h2>
              <div className="flex">
                <h1 className="mb-1">
                  Hello, I'm{" "}
                  <mark className="color-black rounded-xl bg-orange-300 px-3 py-1 lg:py-2">
                    Justin Lui.
                  </mark>
                </h1>
              </div>
              <h2 className="mb-1 mt-3 lg:mt-0">Software Engineer</h2>
              <p>
                Most of my friends call me Lui (pronounced <i>loo-wee</i>).{" "}
                <br /> <br />I like to work backwards from problems to develop
                effective solutions. I take ownership of my projects and deliver
                tangible results.
              </p>
              <div className="flex flex-wrap">
                <Link href="https://www.linkedin.com/in/jlui17">
                  <LinkedIn className="text-md mr-2 text-neutral-900 lg:text-2xl" />
                  LinkedIn
                </Link>
                <Link href="https://github.com/jlui17">
                  <GitHub className="text-md mr-2 text-neutral-900 lg:text-2xl" />
                  Github
                </Link>
                <Link href="https://medium.com/@justinlui17">
                  <Medium className="text-md mr-2 text-neutral-900 lg:text-2xl" />
                  Medium
                </Link>
                <Link href="./justinlui_resume.pdf">
                  <Resume className="text-md mr-2 text-neutral-900 lg:text-2xl" />
                  Resume
                </Link>
              </div>
            </div>
            <img
              className="ml-4 hidden aspect-auto h-[300px] rounded-xl shadow-lg lg:block"
              src="./images/JustinLui.jpg"
              alt="Headshot of Justin Lui"
            ></img>
          </div>
        </main>
      </div>
    </div>
  );
};
