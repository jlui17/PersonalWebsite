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
            <div className="space-y-6">
              <div>
                <a
                  href="https://github.com/jlui17/VLMPrototype"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-main font-bold text-lg hover:text-accent hover:underline transition-colors"
                >
                  VLMPrototype
                </a>
                <p className="text-text-muted mt-1 leading-relaxed">
                  Did a system design interview that got me thinking about video querying with AI. Thought it was cool so I decided to build it. Upload a video, ask questions in plain English, get answers back. Good learning experience.
                </p>
              </div>
              <div>
                <a
                  href="https://github.com/jlui17/w2fhr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-main font-bold text-lg hover:text-accent hover:underline transition-colors"
                >
                  w2fhr
                </a>
                <p className="text-text-muted mt-1 leading-relaxed">
                  When I got promoted to assistant manager at the Richmond Night Market carnival games section, I saw how messy things were — scheduling, payroll, onboarding all scattered across Excel, Google Sheets, and random HR apps. Pitched my boss, he approved, and I built an all-in-one platform for scheduling, payroll, and onboarding. Still running every season, saved them a couple grand a month, and taught me what it's like to ship something that actually powers an entire company.
                </p>
              </div>
              <div>
                <a
                  href="https://github.com/jlui17/LetMeInUBC-2.0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-main font-bold text-lg hover:text-accent hover:underline transition-colors"
                >
                  LetMeInUBC-2.0
                </a>
                <p className="text-text-muted mt-1 leading-relaxed">
                  My friend Kelvin had a script running at home that auto-registered him for UBC courses when spots opened up. I convinced him we should (1) host it so others could use it and (2) make it email alerts instead of auto-registering people — turns out students don't love giving their login info to random apps. Learned what it takes to ship something to the cloud and keep it running. Watching my friends actually get into the classes they wanted was pretty sweet.
                </p>
              </div>
            </div>
          </section>
        </main>

      </div>
    </div>
  );
};
