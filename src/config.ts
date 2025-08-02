export const siteConfig = {
  name: "Jonatan Lindholm",
  title: "Software Engineer",
  description: "Simple portfolio website of Jonatan Lindholm",
  // accentColor: "#1d4ed8", // TODO: try different colors
  accentColor: "#1e2420ff", // TODO: try different colors
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
  projects: [
    {
      name: "Master's Thesis Popular Summary",
      description:
        "Deep learning models for clustering and classifying radar data.",
      link: "/masters-thesis",
      skills: ["Python", "TensorFlow", "Deep Learning"],
    },
    {
      name: "Acceleration Ball",
      description:
        "A fast-paced 2D game where you collect apples while avoiding monsters and emerging magma.",
      link: "/AccelerationBall",
      skills: ["Java"],
    },
    {
      name: "Apple Dash",
      description:
        "Simple web game with a Node.js backend and SQLite database.",
      link: "https://apple-dash.fly.dev/",
      skills: ["JavaScript", "Node.js", "Express.js", "SQLite"],
    },
    {
      name: "Playwright Practice",
      description:
        "GitHub repo for practicing Playwright end-to-end UI testing on a virtual bank demo site.",
      link: "https://github.com/JontAmazon/playwright-practice",
      skills: ["JavaScript", "Playwright", "Automated Web Testing"],
    },
  ],
  // memes: [] ... maybe? ;)
  // experience: ...
  // education: ...
};
