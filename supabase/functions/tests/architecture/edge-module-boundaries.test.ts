const moduleRoots = [
  "content",
  "audit",
  "analytics",
  "identity",
  "youtube-livestream",
] as const;

const deploymentEntrypoints = {
  "activity-logs": "modules/audit/entrypoint.ts",
  "analytics-data": "modules/analytics/entrypoint.ts",
  "content-data": "modules/content/entrypoint.ts",
  "create-user": "modules/identity/create-user/entrypoint.ts",
  "user-data": "modules/identity/user-data/entrypoint.ts",
  "youtube-livestream": "modules/youtube-livestream/entrypoint.ts",
} as const;

const legacyDeploymentDirectories = [
  "activity-logs",
  "analytics-data",
  "content-data",
  "create-user",
  "user-data",
  "youtube-livestream",
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

  const config = await Deno.readTextFile(
    new URL("../../../config.toml", import.meta.url),
  );

  for (const [functionName, entrypoint] of Object.entries(
    deploymentEntrypoints,
  )) {
    if (!config.includes(`[functions.${functionName}]`)) {
      violations.push(`${functionName}: missing config section`);
    }
    if (!config.includes(`entrypoint = "./functions/${entrypoint}"`)) {
      violations.push(`${functionName}: missing custom entrypoint`);
    }

    await Deno.stat(new URL(`../../${entrypoint}`, import.meta.url));
  }

  for (const directory of legacyDeploymentDirectories) {
    try {
      await Deno.stat(new URL(`../../${directory}/`, import.meta.url));
      violations.push(`${directory}: public deployment directory still exists`);
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) throw error;
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
