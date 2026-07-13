import "./postcard-wall.css";

const projects = [
  {
    number: "01",
    title: "puzzlewithme",
    href: "https://github.com/jlui17/puzzlewithme",
    kicker: "A jigsaw puzzle app for my girlfriend, my friends, and me.",
    story:
      "My girlfriend and I are long distance now, and online jigsaw puzzles became one of the things we do together. We wanted to make puzzles from personal photos, but we didn't want to upload them somewhere without knowing how they were stored or used. So I built my own version where I know exactly what happens to them.",
    postmark: "MADE FOR US",
  },
  {
    number: "02",
    title: "VLMPrototype",
    href: "https://github.com/jlui17/VLMPrototype",
    kicker: "I left a system design interview wanting to try the idea myself.",
    story:
      "The idea was to upload a video, ask questions about it in plain English, and get answers back. It was mostly a way to learn how video querying with AI could work by building it myself.",
    postmark: "VIDEO + AI",
  },
  {
    number: "03",
    title: "w2fhr",
    href: "https://github.com/jlui17/w2fhr",
    kicker: "I built the software I wished we had at the night market.",
    story:
      "When I became an assistant manager at the Richmond Night Market, scheduling, payroll, and onboarding were spread across Excel, Google Sheets, and a few HR apps. I asked my boss if I could build one place for all of it. It still runs every season and saves the team a couple grand a month.",
    postmark: "RICHMOND NIGHT MARKET",
  },
  {
    number: "04",
    title: "LetMeInUBC-2.0",
    href: "https://github.com/jlui17/LetMeInUBC-2.0",
    kicker: "A small project that helped my friends get into the classes they wanted.",
    story:
      "My friend Kelvin had a script that registered him when a UBC course opened up. We hosted it so other people could use it, then changed it to email alerts because nobody wants to give a random app their school password. I learned how to keep something running in the cloud, and a few friends got into classes they needed.",
    postmark: "SPECIAL DELIVERY: A SEAT",
  },
];

export default function PostcardWall() {
  return (
    <div className="postcard-wall">
      <main className="postcard-wall__page">
        <header className="postcard-wall__hero">
          <div className="postcard-wall__address" aria-label="Introduction">
            <span>A note from</span>
            <strong>Justin Lui</strong>
            <span>pronounced loo-wee</span>
          </div>

          <aside className="postcard-wall__visual">
            <figure className="postcard-wall__photo">
              <img
                src="/images/justin-girlfriend-dog.jpeg"
                alt="Justin and his girlfriend taking a selfie with a sleepy dog"
              />
            </figure>
            <dl className="postcard-wall__photo-facts">
              <div>
                <dt>Currently in</dt>
                <dd>San Francisco</dd>
              </div>
              <div>
                <dt>Working at</dt>
                <dd>Scorecard</dd>
              </div>
              <div className="postcard-wall__origin">
                <dt>Originally from</dt>
                <dd>Vancouver</dd>
              </div>
            </dl>
            <nav className="postcard-wall__links" aria-label="Find Justin online">
              <a href="https://github.com/jlui17" target="_blank" rel="noreferrer">
                GitHub <span aria-hidden="true">↗</span>
              </a>
              <a href="https://www.linkedin.com/in/jlui17" target="_blank" rel="noreferrer">
                LinkedIn <span aria-hidden="true">↗</span>
              </a>
            </nav>
          </aside>

          <div className="postcard-wall__intro">
            <p className="postcard-wall__eyebrow">A little about me</p>
            <h1>Hi, I’m Lui.</h1>
            <p>
              If there’s something you should know about me, it’s that I can nerd
              out over niche details for hours. Steph Curry’s footwork, dialing in
              espresso, programming, or the right way to peek a specific angle in
              Valorant. Once I’m interested, I’ll obsess over the details and talk
              about them way longer than I meant to.
            </p>
            <p className="postcard-wall__work">
              For work, I’m at <a href="https://www.scorecard.io/" target="_blank" rel="noreferrer">Scorecard</a>,
              where I work across product and engineering and try a bunch of ideas
              to see what lands.
            </p>
          </div>
        </header>

        <section className="postcard-wall__table" aria-labelledby="on-the-table">
          <div className="postcard-wall__section-heading">
            <span aria-hidden="true">✦</span>
            <h2 id="on-the-table">What I’m up to</h2>
          </div>
          <ul className="postcard-wall__notes">
            <li>Cooking my way through the handwritten cookbook my girlfriend made me (she’s the best)</li>
            <li>Trying cafés around SF and getting my espresso setup going again</li>
            <li>Looking into V60 pour-over coffee</li>
            <li>Going out to eat and checking out festivals with friends</li>
            <li>Working out at my apartment gym</li>
            <li>Watching One Piece (episode 1070 is my favourite)</li>
          </ul>
          <aside className="postcard-wall__margin-note">
            <b>One random thing</b>
            I’m terrible at geography but weirdly good at directions. I can
            navigate you anywhere, but don’t ask me what country we’re in.
          </aside>
        </section>

        <section className="postcard-wall__people" aria-labelledby="people-heading">
          <div className="postcard-wall__section-heading">
            <span aria-hidden="true">✦</span>
            <h2 id="people-heading">The best people in my life</h2>
          </div>
          <div className="postcard-wall__people-grid">
            <article>
              <p>My mom</p>
              <h3>My role model for hard work and perseverance.</h3>
              <span>She built everything from the ground up. She’s detailed, incredibly resilient, and always willing to do the thankless work.</span>
            </article>
            <article>
              <p>My dad</p>
              <h3>The most dependable and honest person I know.</h3>
              <span>Sometimes a little too honest. I try to be as real with the people I care about as he is, but maybe a bit gentler.</span>
            </article>
            <article>
              <p>Andrea</p>
              <h3>My little sister was made for New York.</h3>
              <span>I look up to her because she moved to New York, chased what she wanted, and made it happen. She’s a huge part of why I finally chased my own dream of working at a startup in San Francisco, and she helped me land at Scorecard.</span>
            </article>
            <article>
              <p>Truffle</p>
              <h3>My best friend since 2017.</h3>
              <span>She’s my spoiled, squishy, and very sweet French Bulldog.</span>
            </article>
            <article className="postcard-wall__person--girlfriend">
              <p>My girlfriend</p>
              <h3>My best friend and the most thoughtful person I know.</h3>
              <span>She makes me kinder, healthier, and better at living on my own. We support each other through work and everything else, and I’m a better person because of her.</span>
            </article>
          </div>
        </section>

        <section className="postcard-wall__projects" aria-labelledby="postcards-heading">
          <div className="postcard-wall__section-heading postcard-wall__section-heading--projects">
            <span aria-hidden="true">✦</span>
            <h2 id="postcards-heading">Things I’ve built</h2>
          </div>

          <div className="postcard-wall__stack">
            {projects.map((project) => (
              <article className="postcard-wall__card" key={project.title}>
                <div className="postcard-wall__card-number" aria-hidden="true">
                  {project.number}
                </div>
                <div className="postcard-wall__card-copy">
                  <p className="postcard-wall__kicker">{project.kicker}</p>
                  <h3>
                    <a href={project.href} target="_blank" rel="noreferrer">
                      {project.title} <span aria-hidden="true">↗</span>
                    </a>
                  </h3>
                  <p>{project.story}</p>
                </div>
                <div className="postcard-wall__postmark" aria-hidden="true">
                  {project.postmark}
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="postcard-wall__footer">
          <span>That’s all for now.</span>
          <span>Thanks for stopping by.</span>
        </footer>
      </main>
    </div>
  );
}
