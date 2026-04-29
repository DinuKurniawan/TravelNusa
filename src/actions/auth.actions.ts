"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { requireUser } from "@/lib/auth";
import type { ActionState } from "./state";
import { errorState, successState, validationErrorState } from "./state";

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationErrorState(parsed.error);

  if (!isSupabaseConfigured()) {
    return errorState("Supabase belum dikonfigurasi. Isi .env.local terlebih dahulu.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return errorState(error.message);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,status")
    .eq("id", user?.id ?? "")
    .single();

  revalidatePath("/", "layout");

  if (profile?.role === "admin" && profile.status === "active") {
    redirect("/admin");
  }

  redirect("/dashboard");
}

export async function registerAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationErrorState(parsed.error);

  if (!isSupabaseConfigured()) {
    return errorState("Supabase belum dikonfigurasi. Isi .env.local terlebih dahulu.");
  }

  const supabase = await createClient();
  const { email, password, full_name, phone } = parsed.data;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        phone,
        role: "customer",
      },
    },
  });

  if (error) return errorState(error.message);
  if (!data.session) {
    return successState("Registrasi berhasil. Cek email untuk verifikasi akun.");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function updateProfileAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireUser();
  const supabase = await createClient();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!fullName) return errorState("Nama lengkap wajib diisi.");

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone })
    .eq("id", session.user.id);

  if (error) return errorState(error.message);
  revalidatePath("/dashboard");
  return successState("Profil berhasil diperbarui.");
}
