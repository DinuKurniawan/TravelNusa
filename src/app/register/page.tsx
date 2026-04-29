import type { Metadata } from "next";

import { RegisterForm } from "@/components/forms/auth-forms";
import { PublicShell } from "@/components/public/public-shell";

export const metadata: Metadata = {
  title: "Register",
};

export default function RegisterPage() {
  return (
    <PublicShell>
      <section className="bg-slate-50 py-12 md:py-20">
        <div className="container-nusa">
          <RegisterForm />
        </div>
      </section>
    </PublicShell>
  );
}
