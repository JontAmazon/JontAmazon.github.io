export const siteConfig = {
  name: "Jonatan Lindholm",
  title: "Software Engineer/Tester",
  description: "Simple portfolio website of Jonatan Lindholm",
  accentColor: "#1d4ed8",
  social: {
    // skipped email
    linkedin: "https://linkedin.com/in/jonatan-lindholm-8aa005a9",
    github: "https://github.com/JontAmazon",
  },
  aboutMe: [
    "I'm a software engineer with a passion for testing, simulations, and efficient tools. ",
    // also: numerical methods, ...
    // "I enjoy working with Python, and have recently been learning a lot of JavaScript and Playwright.+
    // "I like writing and I love structure. "+
    // "I get excited about clean code, smart tests, and organizing messy systems.",

    "Based in Lund, Sweden. Currently exploring new projects and opportunities."
  ],
  skills: [],
  projectHeaders: [
    "Learning Project Summer & Fall 2025",
    "Fun Previous Projects",
  ],
  projects_2025: [
    {
      name: "To-Do App (WIP)",
      description:
      "A desktop browser to-do/note editor built with Next.js, " +
      "featuring JWT client-side authentication and a managed PostgreSQL database." +
      "\nDesigned to be a personal productivity tool and full-stack learning project." +
      "\nExtra focus on testing (unit, api, e2e) with Vitest and Playwright, and CI/CD.",
      /*
      --- More features planned ---
      - fine-tuned editor:
        - automatic (??) UI for verbose tasks (collapsible text blocks)
        - several text formatting options
        - "- " creates a new list item?
      - history 
      - auto-save
      - keyboard shortcuts for power users:
        - collapse/expand note, etc.
      
        --- EV add background ---
      - I found that other note apps missed collapsible features.
        - (maybe note app X also has this)

      */
      // link: "",
      skills: [
        "TypeScript", 
        "Next.js", 
        "Auth", // "Authentication (NextAuth)", 
        "PostgreSQL", // Neon - managed DB
        "React", 
        "Playwright",
        // "CI/CD",
        // PostgreSQL (Prisma ORM)
        // "Fly.io"
        // "Tailwind CSS", 
      ],
    },
    {
      name: "Playwright Practice",
      description:
      "End-to-end browser automation on a virtual bank demo webapp.",
      link: "https://github.com/JontAmazon/playwright-practice",
      skills: ["JavaScript", "Playwright"],
      testResults: {
        enabled: true,
        title: "Test Results 7 Days (Automated Tests)",
        github: {
          owner: "JontAmazon",
          repo: "playwright-practice",
          branch: "results3",
          path: "test-results-history",
          days: 7,
          linkStyle: "blob",
        },
      },
    },
    {
      name: "WhatsApp Weather Bot",
      description:
      "A WhatsApp weather bot that sends daily weather updates to all subscribers.",
      link: "https://weather-whatsapp-bot.fly.dev/",
      skills: ["Python", "REST API", "Database", "Docker", "GH Actions"],
    },
    {
      name: "Apple Dash",
      description:
      "Simple web game with a Node.js backend and SQLite highscore database.",
      link: "https://apple-dash.fly.dev/",
      skills: ["JavaScript", "Node.js", "Express", "REST API", "Database"],
    },
  ],
  previous_projects: [
    {
      name: "Acceleration Ball",
      description:
      "A fast-paced 2D game where you collect apples while avoiding monsters and emerging magma.",
      link: "/acceleration-ball",
      skills: ["Java", "OOP", "Game Loop & Animation"],
    },
    {
      name: "Yatzy Simulation",
      description: "Heuristic-based algorithm for playing Yatzy.",
      link: "https://yatzy-solver.fly.dev/",
      skills: ["Python"],
    },
    {
      name: "Master's Thesis Popular Summary",
      description:
        "Deep learning models for clustering and classifying radar data.",
      link: "/masters-thesis",
      skills: ["Python", "Deep Learning", "TensorFlow"],
    },
  ],
  // memes: [] ... maybe? ;)
  // experience: ...
  // education: ...
};
