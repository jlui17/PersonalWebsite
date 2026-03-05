import {
  AiFillGithub as GitHub,
  AiFillLinkedin as LinkedIn,
} from "react-icons/ai";
import { Link } from "./components/Link.tsx";

export const App = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center py-8">
      <div className="w-[95vw] max-w-[600px]">
        <main className="flex w-full flex-col px-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="mb-3">
              Hi, I'm{" "}
              <mark className="color-black rounded-xl bg-orange-300 px-3 py-1">
                Justin Lui
              </mark>
            </h1>
            <p className="text-neutral-400">
              Most of my friends call me Lui (pronounced <i>loo-wee</i>).
            </p>
          </div>

          {/* Links */}
          <div className="mb-8 flex flex-wrap gap-3">
            <Link href="https://github.com/jlui17">
              <GitHub className="text-md mr-2 text-neutral-900 lg:text-xl" />
              GitHub
            </Link>
            <Link href="https://www.linkedin.com/in/jlui17">
              <LinkedIn className="text-md mr-2 text-neutral-900 lg:text-xl" />
              LinkedIn
            </Link>
          </div>

          {/* Now */}
          <section className="mb-8">
            <h4 className="mb-3 text-orange-200">What I'm up to</h4>
            <ul className="space-y-2 text-neutral-300">
              <li>Building things at Amazon</li>
              <li>Keeping my money tree happy and healthy</li>
              <li>Scheming about a brick pizza oven in the backyard</li>
              <li>Volleyball and frisbee with good people</li>
              <li>Quality time with my girlfriend and family</li>
            </ul>
          </section>

          {/* Stack */}
          <section className="mb-8">
            <h4 className="mb-3 text-orange-200">Tools I actually use</h4>
            <p className="text-neutral-300">OpenCode · Kiro CLI · OpenClaw</p>
          </section>

          {/* Fun Fact */}
          <section className="mb-8">
            <h4 className="mb-3 text-orange-200">Random thing about me</h4>
            <p className="text-neutral-300">
              I'm terrible at geography but weirdly good at directions. I can navigate 
              you anywhere, just don't ask me what country we're in.
            </p>
          </section>

          {/* Rabbit Hole */}
          <section className="mb-4">
            <h4 className="mb-3 text-orange-200">Currently obsessed with</h4>
            <p className="text-neutral-300">
              Making my dev environment at work feel effortless. Vibe coding is the goal — 
              if there's any friction, I'm fixing it.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
};
