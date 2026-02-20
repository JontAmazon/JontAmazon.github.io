export const siteConfig = {
  name: "Jonatan Lindholm",
  title: "Software Engineer/Tester",
  description: "Portfolio website of Jonatan Lindholm",
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
    "Test Automation (2025-2026)",
    "Full Stack Learning Projects (2025)",
    "Fun Projects",
    "University",
  ],
  testing_projects_2025: [
    {
      name: "API Testing",
      description:
      "Test suite for a REST API, covering CRED operations, filtering/search, auth, idempotency, cleanup, API contracts, and JSON schema validation.",
      link: "https://github.com/JontAmazon/rest-api-test-suite",
      icon: { type: "github", offsetY: -2 },
      skills: ["Python", "pytest"],
    },
    {
      name: "E2E testing of Demo Banking App",
      description:
      "Playwright test suite validating registration, login, accounts, and transfers. Utilizing fixtures for setup/teardown.",
      link: "https://github.com/JontAmazon/playwright-practice",
      icon: { type: "github", offsetY: -2 },
      skills: ["JavaScript", "Playwright"],
      testResults: {
        enabled: false,
        title: "Automated Test Results 7 Days (demo app is flaky <u>by design</u> - failed tests are normal)",
        github: {
          owner: "JontAmazon",
          repo: "playwright-practice",
          branch: "results3",
          path: "test-results-history",
          dataUrl: "/data/parabank/test-results.json",
          days: 7,
          linkStyle: "blob",
        },
      },
    },
    {
      name: "UI Automation for Online Clothing Store",
      description:
      "Playwright test suite validating user registration, login, and logout flows on automationexercise.com. Utilizing fixtures for setup/teardown.",
      link: "https://github.com/JontAmazon/ui-automation",
      icon: { type: "github", offsetY: -2 },
      skills: ["JavaScript", "Playwright"],
      testResults: {
        enabled: true,
        title: "Automated Test Results 7 Days",
        github: {
          owner: "JontAmazon",
          repo: "ui-automation",
          branch: "results",
          path: "test-results-history",
          dataUrl: "/data/clothing/test-results.json",
          days: 7,
          linkStyle: "blob",
        },
      },
    },
  ],
  full_stack_projects_2025: [
    {
      name: "To-Do App (WIP)",
      description:
      "A desktop browser to-do/note editor built with Next.js, " +
      "featuring authentication with NextAuth (JWT) and a managed PostgreSQL database. " +
      // "Designed to be a personal productivity tool and full-stack learning project." +
      "\n\tExtra focus on testing with Vitest and Playwright (unit, api, e2e, CI/CD).",
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
        "Auth", // "(NextAuth)", 
        "PostgreSQL", // (Neon - managed DB; Prisma ORM)
        "React", 
        "Playwright",
        // "CI/CD - unit, API, and Playwright tests,",
        // "Fly.io", 
        // "Tailwind CSS", 
      ],
    },
    {
      name: "WhatsApp Weather Bot",
      description:
      "A WhatsApp weather bot that sends daily weather updates to all subscribers.",
      link: "https://weather-whatsapp-bot.fly.dev/",
      badge: { text: "Subscribe" },
      skills: ["Python", "REST API", "Database", "Docker", "GH Actions"],
    },
    /*
    {
      name: "Apple Dash",
      description:
      "Simple web game with a Node.js backend and SQLite highscore database.",
      link: "https://apple-dash.fly.dev/",
      badge: { text: "Play" },
      skills: ["JavaScript", "Node.js", "Express", "REST API", "Database"],
    },
    */
  ],
  previous_projects: [
    {
      name: "Acceleration Ball",
      description:
      "A fast-paced 2D game where you collect apples while avoiding monsters and emerging magma.",
      link: "/acceleration-ball",
      icon: { type: "youtube", size: "70px", offsetX: -5, offsetY: -10 },
      skills: ["Java", "OOP", "Game Loop & Animation"],
    },
    {
      name: "Yatzy Simulation",
      description: "Heuristic-based algorithm for playing Yatzy.",
      link: "https://yatzy-solver.fly.dev/",
      badge: { text: "View Simulation" },
      skills: ["Python"],
    },
  ],
  university_projects: [
    {
      name: "Master's Thesis Popular Summary",
      description:
      "Deep learning models for clustering and classifying radar data.",
      link: "/masters-thesis",
      badge: { text: "Read" },
      skills: ["Python", "Deep Learning", "TensorFlow"],
    },
    {
      name: "Favorite Courses",
      description: "Highlights from my favorite university courses.",
      link: "/uni-favorite-courses",
      badge: { text: "Read" },
      skills: ["Programming", "Java", "C", "Python", "Numerical methods", "Optimization", "Mathematics"]

    },
  ],
  // memes: [] ... maybe? ;)
  // experience: ...
  // education: ...
};
