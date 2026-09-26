const { readdirSync, readFileSync, statSync } = require("node:fs");
const { join, resolve } = require("node:path");
const { defineConfig } = require("../icarecenter-frontend/node_modules/cypress");

const frontendDataDirectories = [
  resolve(__dirname, "..", "icarecenter-frontend", "src"),
];

const getFrontendDataSources = () =>
  frontendDataDirectories.flatMap((directory) =>
    readdirSync(directory, { recursive: true })
      .map((entry) => join(directory, entry.toString()))
      .filter((filePath) => statSync(filePath).isFile())
      .filter((filePath) => !filePath.endsWith(".test.ts"))
      .filter((filePath) => !filePath.endsWith(".test.tsx"))
      .map((filePath) => ({
        filePath,
        source: readFileSync(filePath, "utf8"),
      })),
  );

module.exports = defineConfig({
  allowCypressEnv: false,
  e2e: {
    baseUrl:
      process.env.CYPRESS_SKIP_BASE_URL === "true"
        ? undefined
        : "http://localhost:8080",
    specPattern: join(__dirname, "e2e/**/*.cy.{js,jsx,ts,tsx}"),
    supportFile: join(__dirname, "support/e2e.js"),
    screenshotsFolder: join(__dirname, "screenshots"),
    trashAssetsBeforeRuns: true,
    setupNodeEvents(on, config) {
      on("task", {
        getFrontendDataSources,
      });

      return config;
    },
  },

  component: {
    specPattern: join(__dirname, "component/**/*.cy.{js,jsx,ts,tsx}"),
    supportFile: join(__dirname, "support/component.js"),
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});
