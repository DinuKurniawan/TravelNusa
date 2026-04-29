"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { updateProfileAction } from "@/actions/auth.actions";
import { initialActionState } from "@/actions/state";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Profile } from "@/types";

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateProfileAction(initialActionState, formData);
      setMessage(result.message);
      if (result.ok) toast.success(result.message);
      if (!result.ok) toast.error(result.message);
    });
  }

  return (
    <form action={onSubmit} className="soft-card flex flex-col gap-5 p-5">
      <h2 className="text-xl font-semibold tracking-tight">Profil</h2>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="full_name">Nama lengkap</FieldLabel>
          <Input id="full_name" name="full_name" defaultValue={profile?.full_name ?? ""} />
        </Field>
        <Field>
          <FieldLabel htmlFor="phone">No WhatsApp</FieldLabel>
          <Input id="phone" name="phone" defaultValue={profile?.phone ?? ""} />
        </Field>
      </FieldGroup>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <Button type="submit" disabled={isPending}>
        <Save data-icon="inline-start" />
        {isPending ? "Menyimpan..." : "Simpan Profil"}
      </Button>
    </form>
  );
}
