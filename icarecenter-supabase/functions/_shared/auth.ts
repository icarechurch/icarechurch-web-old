import { HttpError } from "./errors.ts";

export function requireBearerToken(req: Request): string {
  const authorization = req.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new HttpError(401, "UNAUTHORIZED", "Sign in required");
  }

  return authorization;
}

export function assertRole(
  role: string | null | undefined,
  allowedRoles: readonly string[],
): void {
  if (!role || !allowedRoles.includes(role)) {
    throw new HttpError(403, "FORBIDDEN", "Insufficient permissions");
  }
}
