type SeedUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

type SeedError = {
  message: string;
};

type UserResult = {
  data: { user: SeedUser | null };
  error: SeedError | null;
};

type ListUsersResult = {
  data: { users: SeedUser[] };
  error: SeedError | null;
};

type SeedSupabase = {
  auth: {
    admin: {
      createUser(attributes: {
        email: string;
        password: string;
        email_confirm: boolean;
        user_metadata: Record<string, unknown>;
      }): Promise<UserResult>;
      listUsers(): Promise<ListUsersResult>;
      updateUserById(
        id: string,
        attributes: {
          password: string;
          email_confirm: boolean;
          user_metadata: Record<string, unknown>;
        },
      ): Promise<UserResult>;
    };
  };
};

type AdminProfile = {
  id: string;
  full_name: string;
  role: "admin";
  status: "active";
};

type EnsureAdminUserOptions = {
  supabase: SeedSupabase;
  adminEmail: string;
  adminPassword: string;
  upsertProfile(profile: AdminProfile): Promise<void>;
};

const adminFullName = "Admin TravelNusa";

export async function ensureAdminUser({
  supabase,
  adminEmail,
  adminPassword,
  upsertProfile,
}: EnsureAdminUserOptions) {
  const created = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      full_name: adminFullName,
      role: "admin",
    },
  });

  let user = created.data.user;
  if (created.error) {
    const listed = await supabase.auth.admin.listUsers();
    if (listed.error) throw listed.error;

    user = listed.data.users.find((item) => item.email === adminEmail) ?? null;
    if (!user) throw created.error;
  }

  if (!user) {
    throw new Error(`Admin user ${adminEmail} was not returned by Supabase.`);
  }

  const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      ...(user.user_metadata ?? {}),
      full_name: adminFullName,
      role: "admin",
    },
  });

  if (updateError) throw updateError;
  const adminUser = updated.user ?? user;

  await upsertProfile({
    id: adminUser.id,
    full_name: adminFullName,
    role: "admin",
    status: "active",
  });

  return adminUser;
}
