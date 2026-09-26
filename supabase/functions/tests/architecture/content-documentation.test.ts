const documentationFiles = [
  "README.md",
  "documentations/ARCHITECTURE.md",
  "documentations/COMPONENTS.md",
  "documentations/API.md",
  "documentations/DEVELOPMENT.md",
  "documentations/SECURITY.md",
] as const;

const readDocumentation = async (path: string): Promise<string> =>
  Deno.readTextFile(new URL(`../../../../${path}`, import.meta.url));

Deno.test("documents the content edge module boundary", async () => {
  const stalePaths = [
    "functions/content-data/church-info.ts",
    "functions/content-data/events.ts",
    "functions/content-data/event-popup.ts",
    "functions/content-data/gallery.ts",
    "functions/content-data/giving.ts",
    "functions/content-data/ministries.ts",
    "functions/content-data/pastors.ts",
    "functions/content-data/sermons.ts",
    "functions/content-data/service-times.ts",
  ];

  for (const path of documentationFiles) {
    const source = await readDocumentation(path);
    if (!source.includes("functions/modules/content")) {
      throw new Error(`${path} does not document the content module boundary`);
    }
    if (!source.includes("modules/content/entrypoint.ts")) {
      throw new Error(`${path} does not document the module entrypoint`);
    }
    if (!source.includes(".gitkeep")) {
      throw new Error(`${path} does not document the empty-layer rule`);
    }

    for (const stalePath of stalePaths) {
      if (source.includes(stalePath)) {
        throw new Error(`${path} documents deleted path ${stalePath}`);
      }
    }
  }
});
