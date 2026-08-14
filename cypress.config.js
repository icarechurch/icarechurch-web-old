import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "cypress";

const frontendDataDirectories = [join(process.cwd(), "src")];

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

export default defineConfig({
  e2e: {
    baseUrl:
      process.env.CYPRESS_SKIP_BASE_URL === "true"
        ? undefined
        : "http://localhost:8080",
    screenshotsFolder: "cypress/screenshots",
    trashAssetsBeforeRuns: true,
    setupNodeEvents(on, config) {
      on("task", {
        getFrontendDataSources,
      });

      return config;
    },
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});
