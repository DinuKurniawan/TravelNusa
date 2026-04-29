import type { Metadata } from "next";

import { LoginForm } from "@/components/forms/auth-forms";
import { PublicShell } from "@/components/public/public-shell";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <PublicShell>
      <section className="bg-slate-50 py-12 md:py-20">
        <div className="container-nusa">
          <LoginForm />
        </div>
      </section>
    </PublicShell>
  );
}
