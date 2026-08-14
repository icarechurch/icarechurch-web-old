import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../client";
import { adminService } from "./admin.service";
import { authService } from "./auth.service";
import { profileService } from "./profiles.service";
import { usersService } from "./users.service";

vi.mock("../client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    auth: {
      updateUser: vi.fn(),
    },
  },
}));

const invoke = vi.mocked(supabase.functions.invoke);

describe("user data service adapters", () => {
  beforeEach(() => {
    invoke.mockReset();
  });

  it("loads admin users with roles", async () => {
    const users = [{ id: "user-1", role: "admin" }];
    invoke.mockResolvedValue({ data: { data: users }, error: null });

    await expect(adminService.getAllUsersWithRoles()).resolves.toEqual(users);
    expect(invoke).toHaveBeenCalledWith("user-data", {
      body: { resource: "admin", operation: "list" },
    });
  });

  it("updates an admin user profile", async () => {
    invoke.mockResolvedValue({ data: { data: null }, error: null });

    await expect(adminService.updateUserProfile("user-1", "Ada")).resolves.toBeUndefined();
    expect(invoke).toHaveBeenCalledWith("user-data", {
      body: {
        resource: "profiles",
        operation: "update-name",
        input: { userId: "user-1", fullName: "Ada" },
      },
    });
  });

  it("loads a user role", async () => {
    invoke.mockResolvedValue({ data: { data: "admin" }, error: null });

    await expect(authService.getUserRole("user-1")).resolves.toBe("admin");
    expect(invoke).toHaveBeenCalledWith("user-data", {
      body: { resource: "roles", operation: "get", input: { userId: "user-1" } },
    });
  });

  it("loads allowed tabs", async () => {
    const tabs = ["profile", "users"];
    invoke.mockResolvedValue({ data: { data: tabs }, error: null });

    await expect(authService.getAllowedTabs()).resolves.toEqual(tabs);
    expect(invoke).toHaveBeenCalledWith("user-data", {
      body: { resource: "permissions", operation: "allowed-tabs" },
    });
  });

  it("gets and updates a profile", async () => {
    const profile = { full_name: "Ada" };
    invoke
      .mockResolvedValueOnce({ data: { data: profile }, error: null })
      .mockResolvedValueOnce({ data: { data: null }, error: null });

    await expect(profileService.getProfile("user-1")).resolves.toEqual(profile);
    await expect(profileService.updateProfile({ id: "user-1", full_name: "Ada" }))
      .resolves.toBeUndefined();
    expect(invoke).toHaveBeenNthCalledWith(1, "user-data", {
      body: { resource: "profiles", operation: "get", input: { userId: "user-1" } },
    });
    expect(invoke).toHaveBeenNthCalledWith(2, "user-data", {
      body: {
        resource: "profiles",
        operation: "upsert",
        input: expect.objectContaining({ id: "user-1", full_name: "Ada" }),
      },
    });
  });

  it("manages user roles through user-data", async () => {
    invoke
      .mockResolvedValueOnce({ data: { data: null }, error: null })
      .mockResolvedValueOnce({ data: { data: null }, error: null })
      .mockResolvedValueOnce({ data: { data: null }, error: null })
      .mockResolvedValueOnce({ data: { data: null }, error: null });

    await usersService.createUserRole({ user_id: "user-1", role: "admin" });
    await usersService.deleteUserRole("user-1");
    await usersService.updateUserRole({ user_id: "user-1", role: "moderator" });
    await usersService.deleteUser({ target_user_id: "user-2" });

    expect(invoke).toHaveBeenNthCalledWith(1, "user-data", {
      body: {
        resource: "roles",
        operation: "create",
        input: { user_id: "user-1", role: "admin" },
      },
    });
    expect(invoke).toHaveBeenNthCalledWith(2, "user-data", {
      body: { resource: "roles", operation: "delete", input: { userId: "user-1" } },
    });
    expect(invoke).toHaveBeenNthCalledWith(3, "user-data", {
      body: {
        resource: "roles",
        operation: "replace",
        input: { user_id: "user-1", role: "moderator" },
      },
    });
    expect(invoke).toHaveBeenNthCalledWith(4, "user-data", {
      body: {
        resource: "users",
        operation: "delete",
        input: { target_user_id: "user-2" },
      },
    });
  });
});
