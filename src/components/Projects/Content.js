import { AiFillGithub } from "react-icons/ai";

const projects = [
  {
    purpose: {
      link: "https://github.com/jlui17/",
      img: "personal.png",
      alt: "truffle",
      title: "Personal Project",
    },
    title: "Sorting Visualizer",
    description: [
      "Needed more skills to add to my resume so I could get a job 😉. Built this project over the weekend while completing a React course on Scrimba.",
      "This React app visualizes different sorting algorithms to help people understand how they work.",
    ],
    tools: ["React", "JavaScript"],
    img: "sortingvisualizer.jpg",
    alt: "sortingvisualizer",
    github: "https://github.com/jlui17/SortingVisualizer",
    link: "https://jlui17sortingvisualizer.netlify.app/",
  },
  {
    purpose: {
      link: "https://github.com/jlui17/",
      img: "personal.png",
      alt: "truffle",
      title: "Personal Project",
    },
    title: "LetMeIn UBC",
    description: [
      "Inspired by July 13, 2021 (UBC course registration day) when some of my friends and I couldn't register for courses because they filled up. Instead of paying for a tracking service, we built our own.",
      "LetMeIn UBC helps students get into the courses they need by tracking the seat availability of course sections and notifying them when there is space.",
      "I implemented the front-end and API back-end.",
      "*Yes it does work.",
    ],
    tools: ["Django", "Node.js", "Docker", "Azure", "Twilio"],
    img: "letmeinubc.png",
    alt: "letmeinubc",
    github: "https://github.com/kel-z/LetMeInUBC",
    link: "",
  },
  {
    purpose: {
      link: "https://github.com/jlui17/",
      img: "personal.png",
      alt: "truffle",
      title: "Personal Project",
    },
    title: "Algorithmic Trading Bot",
    description: [
      "On April 6, 2021, I attended an algorithmic trading workshop hosted by Scotiabank. In the Q&A, I asked about getting started and they recommended using Interactive Brokers TWS API. So, I teamed up with a friend and began my journey in algo trading.",
      "This application trades stocks using core algorithmic trading strategies (moving averages, momentum, growth) and the IB TWS API.",
      "I implemented the GUI, moving averages, and growth trading strategies.",
    ],
    tools: ["IB TWS API", "Python", "Pandas", "PyQT"],
    img: "tradingbot.png",
    alt: "algotrader",
    github: "https://github.com/jlui17/tws_api_trading_bot",
    link: "",
  },
  {
    purpose: {
      link: "https://globalgamejam.org/",
      img: "gamejam.png",
      alt: "globalgamejam",
      title: "Global Game Jam 2020",
    },
    title: "Echo",
    description: [
      "In January, my friend Alexa asked me to join her team for Global Game Jam 2020. I was a bit worried because I didn't have any game development experience, but I had a great time and the end product exceeded my expectations.",
      "Echo is a 2D side scroller RPG game concept developed in Unity. It's story is based around a child who has been separated from their mother in a forest and lost their vision. Follow them on their journey to reunite with their mother.",
      "I led the implementation of characters, scripting, game physics, and level design.",
    ],
    tools: ["Unity", "C#"],
    img: "echo.png",
    alt: "echo",
    github: "https://github.com/jlui17/Echo",
    link: "",
  },
  {
    purpose: {
      link: "https://github.com/jlui17/",
      img: "academic.png",
      alt: "ubc",
      title: "Academic Project (CPSC 304 - Relational Databases)",
    },
    title: "Carnival Operations DBMS",
    description: [
      "Based on the operations of a carnival games company.",
      "This application is a full stack project, with a React front-end, Flask back-end, and Oracle database. It allows users to interact with their operations database through a simple UI. Analysis is also provided using complex SQL queries to help the user evaluate their business performance.",
      "I led the system design and front-end development, helping design the tech stack, flow of information, and the implementation of each UI component.",
    ],
    tools: ["React", "Flask", "SQL", "TypeScript", "Python", "Oracle"],
    img: "304.png",
    alt: "cs304",
    github:
      "https://github.students.cs.ubc.ca/CPSC304-2021W-T1/project_p7w2b_v9h3b_x8z2b",
    link: "",
  },
  {
    purpose: {
      link: "https://github.com/jlui17/",
      img: "academic.png",
      alt: "ubc",
      title: "Academic Project (CPSC 210 - Software Construction)",
    },
    title: "Inventory Manager",
    description: [
      "Based on the inventory management system at the Richmond Night Market.",
      "This application applies core OOP principles and the observable design pattern to emulate an inventory management system used in a carnival games operation.",
    ],
    tools: ["Java", "Observale Design Pattern"],
    img: "inventorymanager.png",
    alt: "inventory manager",
    github: "https://github.com/jlui17/W2F_Inv_Manager",
    link: "",
  },
  {
    purpose: {
      link: "https://github.com/jlui17/",
      img: "personal.png",
      alt: "truffle",
      title: "Personal Project",
    },
    title: "Sudoku Solver",
    description: [
      "At the start of 2020, despite almost no Python knowledge, the co-founders of GeekEdu hired me to teach K-12 students programming in Python. Not wanting to be a terrible instructor, I developed this project to learn the basics of Python.",
      "This application uses backtracking search to solve any sudoku puzzle.",
    ],
    tools: ["PyGame", "Python"],
    img: "sudoku.png",
    alt: "sudoku",
    github: "https://github.com/jlui17/Sudoku-solver",
    link: "",
  },
];

export const ProjectContent = projects.map((project) => {
  return (
    <>
      <div className="col-span-2">
        <a
          target="_blank"
          href={project["purpose"]["link"]}
          rel="noopener noreferrer"
          className="inline-flex items-center justify-start border-b-2 border-transparent transition-colors ease-linear hover:border-white"
        >
          <img
            alt={project["purpose"]["alt"]}
            src={"./images/" + project["purpose"]["img"]}
            className="h-4 rounded-none border-none shadow-none"
          ></img>
          <p className="ml-2 mb-0 font-heading text-sm">
            {project["purpose"]["title"]}
          </p>
        </a>
        <h4 className="mb-3">{project["title"]}</h4>
        {project["description"].map((text) => {
          return (
            <p className="mb-2" key={text.slice(0, 10)}>
              {text}
            </p>
          );
        })}
        <div className="mt-3 flex flex-wrap items-center justify-start">
          {project["tools"].map((tool) => {
            return (
              <p
                key={tool}
                className="mr-4 mb-2 rounded-xl bg-neutral-700 px-3 py-3 lg:py-2"
              >
                {tool}
              </p>
            );
          })}
          <a target="_blank" href={project["github"]} rel="noopener noreferrer">
            <AiFillGithub
              size={"2.5rem"}
              className="mb-2 text-neutral-700 transition-colors duration-300 hover:text-white"
            />
          </a>
        </div>
      </div>
      <a
        target="_blank"
        href={project["link"] ? project["link"] : project["github"]}
        rel="noopener noreferrer"
      >
        <img
          className="mt-2 mb-12 aspect-[4/3] h-56 rounded-xl object-fill shadow-xl transition-transform duration-300 hover:-translate-y-1 lg:ml-auto lg:mt-0"
          alt={project["alt"]}
          src={"./images/" + project["img"]}
        ></img>
      </a>
    </>
  );
});
