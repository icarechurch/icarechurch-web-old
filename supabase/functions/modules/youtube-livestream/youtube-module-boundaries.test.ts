const moduleRoot = new URL("./", import.meta.url);

const requiredFiles = [
  "domain/Livestream.ts",
  "domain/LivestreamSchedule.ts",
  "domain/ports/LivestreamCacheRepository.ts",
  "domain/ports/LivestreamProvider.ts",
  "application/GetActiveLivestream.ts",
  "infrastructure/SupabaseLivestreamCacheRepository.ts",
  "infrastructure/YouTubeLivestreamProvider.ts",
  "presentation/LivestreamController.ts",
  "index.ts",
  "entrypoint.ts",
] as const;

const legacyFlatFiles = [
  "cache.ts",
  "schedule.ts",
  "types.ts",
  "youtube.ts",
] as const;

const readText = (path: string): Promise<string> =>
  Deno.readTextFile(new URL(path, moduleRoot));

const stat = (path: string): Promise<Deno.FileInfo> =>
  Deno.stat(new URL(path, moduleRoot));

Deno.test("YouTube livestream uses the module layer structure", async () => {
  for (const path of requiredFiles) {
    await stat(path);
  }

  for (
    const layer of ["domain", "application", "infrastructure", "presentation"]
  ) {
    const info = await stat(`${layer}/`);
    if (!info.isDirectory) {
      throw new Error(`${layer} must be a directory`);
    }
  }

  for (const path of legacyFlatFiles) {
    try {
      await stat(path);
      throw new Error(`legacy flat file remains: ${path}`);
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
  }
});

Deno.test("YouTube layer dependencies point inward", async () => {
  const domainFiles = [
    "domain/Livestream.ts",
    "domain/LivestreamSchedule.ts",
    "domain/ports/LivestreamCacheRepository.ts",
    "domain/ports/LivestreamProvider.ts",
  ];
  const applicationFiles = ["application/GetActiveLivestream.ts"];
  const presentationFiles = ["presentation/LivestreamController.ts"];

  const forbiddenDomain = /Deno|@supabase|fetch\(|\bRequest\b|process\.env/;
  const forbiddenApplication =
    /Deno|@supabase|fetch\(|\.from\(|\.rpc\(|\bRequest\b|\bResponse\b/;
  const forbiddenPresentation = /@supabase|fetch\(|\.from\(|\.rpc\(/;

  for (const path of domainFiles) {
    const source = await readText(path);
    if (forbiddenDomain.test(source)) {
      throw new Error(`${path} imports runtime or infrastructure concerns`);
    }
  }

  for (const path of applicationFiles) {
    const source = await readText(path);
    if (forbiddenApplication.test(source)) {
      throw new Error(`${path} imports runtime or infrastructure concerns`);
    }
    if (
      source.includes("infrastructure/") || source.includes("presentation/")
    ) {
      throw new Error(`${path} reaches outside the application boundary`);
    }
    if (/export class\s+GetActiveLivestream/.test(source)) {
      const applicationClass =
        source.match(/export class\s+GetActiveLivestream[\s\S]*/)?.[0] ?? "";
      const methods = [
        ...applicationClass.matchAll(
          /^  (?:public\s+)?(?:async\s+)?([A-Za-z_$][\w$]*)\s*\(/gm,
        ),
      ]
        .map((match) => match[1])
        .filter((name) => name !== "constructor" && !name.startsWith("_"));
      if (methods.length !== 1 || methods[0] !== "execute") {
        throw new Error(`${path} application class must expose only execute`);
      }
    }
  }

  for (const path of presentationFiles) {
    const source = await readText(path);
    if (forbiddenPresentation.test(source)) {
      throw new Error(`${path} accesses infrastructure directly`);
    }
  }
});
