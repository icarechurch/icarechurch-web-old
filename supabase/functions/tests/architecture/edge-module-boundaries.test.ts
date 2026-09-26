const moduleRoots = [
  "content",
  "audit",
  "analytics",
  "identity",
] as const;

const adapters = [
  ["activity-logs/index.ts", "../modules/audit/index.ts"],
  ["analytics-data/index.ts", "../modules/analytics/index.ts"],
  ["content-data/index.ts", "../modules/content/index.ts"],
  ["create-user/index.ts", "../modules/identity/index.ts"],
  ["user-data/index.ts", "../modules/identity/index.ts"],
] as const;

const legacyImplementationFiles = [
  "activity-logs/queries.ts",
  "analytics-data/queries.ts",
  "analytics-data/overview.ts",
  "user-data/admin.ts",
  "user-data/permissions.ts",
  "user-data/profiles.ts",
  "user-data/queries.ts",
  "user-data/roles.ts",
  "user-data/users.ts",
] as const;

const collectTypeScriptFiles = async (directory: URL): Promise<URL[]> => {
  const files: URL[] = [];

  for await (const entry of Deno.readDir(directory)) {
    const entryUrl = new URL(entry.name, directory);
    if (entry.isDirectory) {
      files.push(
        ...(await collectTypeScriptFiles(new URL(`${entry.name}/`, directory))),
      );
      continue;
    }

    if (entry.name.endsWith(".ts")) files.push(entryUrl);
  }

  return files;
};

const relativePath = (url: URL): string =>
  decodeURIComponent(url.pathname).split("/functions/")[1] ?? url.pathname;

Deno.test("keeps Edge Function modules isolated from transport and persistence", async () => {
  const violations: string[] = [];

  for (const moduleName of moduleRoots) {
    const root = new URL(`../../modules/${moduleName}/`, import.meta.url);
    await Deno.stat(root);

    for (const file of await collectTypeScriptFiles(root)) {
      const path = relativePath(file);
      const source = await Deno.readTextFile(file);
      if (path.endsWith(".test.ts")) continue;

      if (source.includes(".gitkeep")) {
        violations.push(`${path}: placeholder files are forbidden`);
      }
      if (
        path.includes("/domain/") &&
        /@supabase|\bDeno\b|\.from\(|\.rpc\(/.test(source)
      ) {
        violations.push(`${path}: domain reaches into runtime or persistence`);
      }
      if (
        path.includes("/application/") &&
        /@supabase|\bDeno\b|\.from\(|\.rpc\(/.test(source)
      ) {
        violations.push(
          `${path}: application reaches into runtime or persistence`,
        );
      }
      if (
        path.includes("/presentation/") &&
        /@supabase|\.from\(|\.rpc\(/.test(source)
      ) {
        violations.push(`${path}: presentation reaches into persistence`);
      }
    }
  }

  for (const [adapterPath, moduleImport] of adapters) {
    const source = await Deno.readTextFile(
      new URL(`../../${adapterPath}`, import.meta.url),
    );
    if (!source.includes(moduleImport)) {
      violations.push(`${adapterPath}: missing module composition import`);
    }
    if (/\.from\(|\.rpc\(|create[A-Za-z]+Handlers/.test(source)) {
      violations.push(
        `${adapterPath}: adapter contains legacy implementation code`,
      );
    }
  }

  for (const legacyPath of legacyImplementationFiles) {
    try {
      await Deno.stat(new URL(`../../${legacyPath}`, import.meta.url));
      violations.push(`${legacyPath}: legacy implementation file still exists`);
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) throw error;
    }
  }

  if (violations.length > 0) throw new Error(violations.join("\n"));
});
