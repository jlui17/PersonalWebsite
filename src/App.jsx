import { useEffect } from "react";
import {
  AiFillGithub as GitHub,
  AiFillLinkedin as LinkedIn,
} from "react-icons/ai";
import { Link } from "./components/Link.tsx";

export const App = () => {
  // Set Sage theme on mount - easy to swap: change "theme-sage" to "theme-terracotta", "theme-coffee", etc.
  useEffect(() => {
    document.body.className = "theme-sage";
  }, []);

  return (
    <div className="bg-theme-main flex min-h-screen w-full flex-col items-center py-8">
      <div className="w-[95vw] max-w-[600px]">
        <main className="flex w-full flex-col px-4">
          {/* Header */}
          <div className="mb-6">
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
          <section className="mb-8">
            <h4 className="text-accent mb-3">What I'm up to</h4>
            <ul className="space-y-2">
              <li className="text-text-muted">Building things at Amazon</li>
              <li className="text-text-muted">
                Keeping my money tree happy and healthy
              </li>
              <li className="text-text-muted">
                Scheming about a brick pizza oven in the backyard
              </li>
              <li className="text-text-muted">
                Volleyball and frisbee with good people
              </li>
              <li className="text-text-muted">
                Quality time with my girlfriend and family
              </li>
            </ul>
          </section>

          {/* Stack */}
          <section className="mb-8">
            <h4 className="text-accent mb-3">Tools I actually use</h4>
            <p className="text-text-muted">OpenCode · Kiro CLI · OpenClaw</p>
          </section>

          {/* Fun Fact */}
          <section className="mb-8">
            <h4 className="text-accent mb-3">Random thing about me</h4>
            <p className="text-text-muted">
              I'm terrible at geography but weirdly good at directions. I can
              navigate you anywhere, just don't ask me what country we're in.
            </p>
          </section>

          {/* Rabbit Hole */}
          <section className="mb-4">
            <h4 className="text-accent mb-3">Currently obsessed with</h4>
            <p className="text-text-muted">
              Making my dev environment at work feel effortless. Vibe coding is
              the goal — if there's any friction, I'm fixing it.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
};
