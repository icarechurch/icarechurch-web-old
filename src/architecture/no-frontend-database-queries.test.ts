import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const FRONTEND_DATA_DIRECTORIES = [
  join(process.cwd(), "src", "hooks"),
  join(process.cwd(), "src", "integrations", "supabase", "services"),
];

function getSourceFiles(directory: string): string[] {
  return readdirSync(directory, { recursive: true })
    .map((entry) => join(directory, entry.toString()))
    .filter((filePath) => statSync(filePath).isFile())
    .filter((filePath) => !filePath.endsWith(".test.ts"))
    .filter((filePath) => !filePath.endsWith(".test.tsx"));
}

describe("frontend data access architecture", () => {
  it("keeps table queries and RPCs out of frontend data code", () => {
    const violations = FRONTEND_DATA_DIRECTORIES.flatMap((directory) =>
      getSourceFiles(directory).flatMap((filePath) => {
        const source = readFileSync(filePath, "utf8");
        const hasTableQuery = /\.from\(\s*["'`]/u.test(source);
        const hasRpcCall = /\.rpc\(/u.test(source);

        if (!hasTableQuery && !hasRpcCall) return [];
        if (filePath.endsWith("storage.service.ts") && !hasRpcCall) return [];

        return [filePath];
      }),
    );

    expect(violations).toEqual([]);
  });
});
