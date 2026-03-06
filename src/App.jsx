import {
  AiFillGithub as GitHub,
  AiFillLinkedin as LinkedIn,
} from "react-icons/ai";
import { Link } from "./components/Link.tsx";

export const App = () => {
  return (
    <div className="bg-theme-main flex min-h-screen w-full flex-col items-center py-8 mode-cafe">
      <div className="w-[95vw] max-w-[600px]">
        <main className="flex w-full flex-col px-4">
          {/* Header */}
          <div className="mb-6 experience-header">
            <h1 className="text-text-main mb-3">
              Hi, I'm{" "}
              <span className="bg-accent hover:bg-accent-hover text-theme-main rounded-xl px-3 py-1">
                Justin Lui
              </span>
            </h1>
            <p className="text-text-subtle">
              Most of my friends call me Lui (pronounced <i>loo-wee</i>).
            </p>
          </div>

          {/* Links */}
          <div className="mb-8 flex flex-wrap gap-3">
            <Link href="https://github.com/jlui17">
              <GitHub className="text-theme-main text-base mr-2 lg:text-xl" />
              GitHub
            </Link>
            <Link href="https://www.linkedin.com/in/jlui17">
              <LinkedIn className="text-theme-main text-base mr-2 lg:text-xl" />
              LinkedIn
            </Link>
          </div>

          {/* Now */}
          <section className="mb-8 experience-section">
            <h4 className="text-accent mb-3">What I'm up to</h4>
            <ul className="space-y-2">
              <li className="text-text-muted">
                Beeping and booping at Amazon
              </li>
              <li className="text-text-muted">
                Quality time with my girlfriend and family
              </li>
              <li className="text-text-muted">
                Keeping my money tree happy and healthy
              </li>
              <li className="text-text-muted">
                Scheming about a brick pizza oven in the backyard
              </li>
              <li className="text-text-muted">
                Volleyball and frisbee with good people
              </li>
            </ul>
          </section>

          {/* Fun Fact */}
          <section className="mb-8 experience-section">
            <h4 className="text-accent mb-3">Random thing about me</h4>
            <p className="text-text-muted">
              I'm terrible at geography but weirdly good at directions. I can
              navigate you anywhere, just don't ask me what country we're in.
            </p>
          </section>

          {/* Projects */}
          <section className="mb-4 experience-section">
            <h4 className="text-accent mb-3">Projects</h4>
            <div className="space-y-4">
              <div>
                <a
                  href="https://github.com/jlui17/LetMeInUBC-2.0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-main font-medium hover:text-accent hover:underline experience-link"
                >
                  LetMeInUBC-2.0
                </a>
                <p className="text-text-muted">
                  Course availability alerts for UBC students. My friend Kelvin built it for himself originally, then me and Lawrence helped him clean it up and ship it. Hit 800+ users at one point — actually helped me and my friends get into the classes we wanted.
                </p>
              </div>
              <div>
                <a
                  href="https://github.com/jlui17/w2fhr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-main font-medium hover:text-accent hover:underline experience-link"
                >
                  w2fhr
                </a>
                <p className="text-text-muted">
                  Scheduling, payroll, and inventory for the Richmond Night Market game section. They were juggling Excel, Google Sheets, and some HR app called Humanity before this. Still running today, handles the whole company — first time I built something that actually mattered to a business.
                </p>
              </div>
            </div>
          </section>
        </main>

      </div>
    </div>
  );
};
