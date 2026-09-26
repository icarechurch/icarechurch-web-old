const contentRoot = new URL("../../modules/content/", import.meta.url);
const contentAdapter = new URL(
  "../../content-data/index.ts",
  import.meta.url,
);

const resourceNames = [
  "sermons",
  "events",
  "ministries",
  "church-info",
  "gallery",
  "pastors",
  "service-times",
  "giving",
  "event-popup",
] as const;

const readText = (url: URL): Promise<string> => Deno.readTextFile(url);

const collectTypeScriptFiles = async (directory: URL): Promise<URL[]> => {
  const files: URL[] = [];

  for await (const entry of Deno.readDir(directory)) {
    const entryUrl = new URL(entry.name, directory);
    if (entry.isDirectory) {
      files.push(...(await collectTypeScriptFiles(new URL(`${entry.name}/`, directory))));
      continue;
    }

    if (entry.name.endsWith(".ts")) {
      files.push(entryUrl);
    }
  }

  return files;
};

const relativePath = (url: URL): string =>
  decodeURIComponent(url.pathname).split("/functions/")[1] ?? url.pathname;

Deno.test("content module exposes every content resource", async () => {
  const moduleIndex = new URL("index.ts", contentRoot);
  await Deno.stat(moduleIndex);

  for (const resourceName of resourceNames) {
    await Deno.stat(new URL(`${resourceName}/`, contentRoot));
  }
});

Deno.test("content layers preserve their dependency boundaries", async () => {
  const files = await collectTypeScriptFiles(contentRoot);
  const violations: string[] = [];
  const forbiddenInDomain = /@supabase\/supabase-js|\bDeno\b|\.from\(|\.rpc\(/;
  const forbiddenInApplication = /@supabase\/supabase-js|\bDeno\b|\.from\(|\.rpc\(/;
  const forbiddenInPresentation = /@supabase\/supabase-js|\.from\(|\.rpc\(/;

  for (const file of files) {
    const path = relativePath(file);
    const source = await readText(file);

    if (path.includes("/.gitkeep") || path.endsWith("/.gitkeep")) {
      violations.push(`${path}: placeholder file is forbidden`);
    }

    if (path.includes("/domain/") && forbiddenInDomain.test(source)) {
      violations.push(`${path}: domain imports runtime or persistence code`);
    }
    if (path.includes("/application/") && forbiddenInApplication.test(source)) {
      violations.push(`${path}: application imports runtime or persistence code`);
    }
    if (path.includes("/presentation/") && forbiddenInPresentation.test(source)) {
      violations.push(`${path}: presentation accesses persistence directly`);
    }

    if (path.includes("/application/") && /export class\s+\w+/.test(source)) {
      const publicMethods = [...source.matchAll(/\n\s+(?:public\s+)?([A-Za-z_$][\w$]*)\s*\(/g)]
        .map((match) => match[1])
        .filter((name) => name !== "constructor" && !name.startsWith("_"));
      if (publicMethods.length !== 1 || publicMethods[0] !== "execute") {
        violations.push(`${path}: application class must expose only execute`);
      }
    }
  }

  const adapterSource = await readText(contentAdapter);
  if (!adapterSource.includes("../modules/content/index.ts")) {
    violations.push("content-data/index.ts: missing content composition import");
  }
  if (/\.\/((sermons|events|ministries|church-info|gallery|pastors|service-times|giving|event-popup)\.ts)/.test(adapterSource)) {
    violations.push("content-data/index.ts: imports a private resource handler");
  }

  if (violations.length > 0) {
    throw new Error(violations.join("\n"));
  }
});
