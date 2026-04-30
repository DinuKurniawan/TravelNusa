import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ensureAdminUser } from "./seed-admin";

describe("ensureAdminUser", () => {
  it("syncs the configured password for an existing admin user", async () => {
    const calls: unknown[] = [];
    const existingUser = {
      id: "admin-user-id",
      email: "admin@travelnusa.test",
      user_metadata: { theme: "kept" },
    };

    const supabase = {
      auth: {
        admin: {
          async createUser() {
            calls.push(["createUser"]);
            return { data: { user: null }, error: new Error("User already registered") };
          },
          async listUsers() {
            calls.push(["listUsers"]);
            return { data: { users: [existingUser] }, error: null };
          },
          async updateUserById(id: string, attributes: Record<string, unknown>) {
            calls.push(["updateUserById", id, attributes]);
            return { data: { user: existingUser }, error: null };
          },
        },
      },
    };

    await ensureAdminUser({
      supabase,
      adminEmail: "admin@travelnusa.test",
      adminPassword: "configured-password",
      upsertProfile: async (profile) => {
        calls.push(["upsertProfile", profile]);
      },
    });

    assert.deepEqual(calls, [
      ["createUser"],
      ["listUsers"],
      [
        "updateUserById",
        "admin-user-id",
        {
          password: "configured-password",
          email_confirm: true,
          user_metadata: {
            theme: "kept",
            full_name: "Admin TravelNusa",
            role: "admin",
          },
        },
      ],
      [
        "upsertProfile",
        {
          id: "admin-user-id",
          full_name: "Admin TravelNusa",
          role: "admin",
          status: "active",
        },
      ],
    ]);
  });
});
