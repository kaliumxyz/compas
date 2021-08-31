module.exports = {
  lang: "en-US",
  title: "Compas",
  description: "Unified backend tooling",

  themeConfig: {
    repo: "compasjs/compas",
    docsDir: "docs",
    docsBranch: "main",

    editLinks: true,
    editLinkText: "Edit this page on GitHub",
    lastUpdated: "Last updated",

    nav: [
      {
        text: "Docs",
        link: "/",
        activeMatch: "^/$|/getting-started|^/features/|^/migrations/",
      },
      {
        text: "API reference",
        link: "/api/index.html",
        activeMatch: "^/api/",
      },
      {
        text: "Changelog",
        link: "/changelog",
      },
      {
        text: "Release notes",
        link: "/releases/index.html",
        activeMatch: "^/releases/",
      },
    ],

    sidebar: {
      "/api/": getApiSidebar(),
      "/releases/": getReleaseNotesSidebar(),
      "/": getHomeSidebar(),
    },
  },

  markdown: {
    anchor: {},
    toc: {
      includeLevel: [1, 2, 3],
    },
  },

  vite: {
    envDir: process.cwd() + "/docs",
  },
};

function getHomeSidebar() {
  return [
    {
      text: "Getting started",
      link: "/getting-started.html",
    },
    {
      text: "Features",
      children: [
        {
          text: "Script runner",
          link: "/features/script-runner.html",
        },
        {
          text: "Linting and formatting",
          link: "/features/lint-setup.html",
        },
        {
          text: "Typescript setup",
          link: "/features/typescript-setup.html",
        },
        {
          text: "Logger & events",
          link: "/features/logger-and-events.html",
        },
        {
          text: "Testing and benchmarking",
          link: "/features/test-and-bench-runner.html",
        },
        {
          text: "Postgres and Minio",
          link: "/features/postgres-and-minio.html",
        },
        {
          text: "Postgres migrations",
          link: "/features/migrations.html",
        },
        {
          text: "Background jobs",
          link: "/features/background-jobs.html",
        },
        {
          text: "Session handling",
          link: "/features/session-handling.html",
        },
      ],
    },
    {
      text: "Migrations",
      link: "/migrations/index.html",
      children: [
        {
          text: "@compas/store",
          link: "/migrations/store.html",
        },
      ],
    },
  ];
}

function getApiSidebar() {
  return [
    {
      text: "@compas/stdlib",
      link: "/api/stdlib.html",
    },
    {
      text: "@compas/cli",
      link: "/api/cli.html",
    },
    {
      text: "@compas/store",
      link: "/api/store.html",
    },
    {
      text: "@compas/server",
      link: "/api/server.html",
    },
  ];
}

function getReleaseNotesSidebar() {
  return [
    { text: "Release v0.0.158", link: "/releases/0.0.158.html" },
    { text: "Release v0.0.138", link: "/releases/0.0.138.html" },
    { text: "Release v0.0.124", link: "/releases/0.0.124.html" },
    { text: "Release v0.0.119", link: "/releases/0.0.119.html" },
    { text: "Release v0.0.115", link: "/releases/0.0.115.html" },
    { text: "Release v0.0.103", link: "/releases/0.0.103.html" },
    { text: "Release v0.0.89", link: "/releases/0.0.89.html" },
    { text: "Release v0.0.84", link: "/releases/0.0.84.html" },
    { text: "Release v0.0.83", link: "/releases/0.0.83.html" },
    { text: "Release v0.0.81", link: "/releases/0.0.81.html" },
    { text: "Release v0.0.79", link: "/releases/0.0.79.html" },
  ];
}
