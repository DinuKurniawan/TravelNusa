"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { createContactMessageAction } from "@/actions/booking.actions";
import { initialActionState } from "@/actions/state";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema } from "@/lib/validations/contact";

type ContactInput = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { full_name: "", email: "", phone: "", subject: "", message: "" },
  });

  function onSubmit(values: ContactInput) {
    const payload = new FormData();
    Object.entries(values).forEach(([key, value]) => payload.append(key, String(value ?? "")));

    startTransition(async () => {
      const result = await createContactMessageAction(initialActionState, payload);
      setMessage(result.message);
      if (result.ok) {
        toast.success(result.message);
        form.reset();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="soft-card flex flex-col gap-5 p-5 md:p-6">
      <h2 className="text-xl font-semibold tracking-tight">Kirim Pesan</h2>
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Field data-invalid={!!form.formState.errors.full_name}>
            <FieldLabel htmlFor="full_name">Nama lengkap</FieldLabel>
            <Input id="full_name" aria-invalid={!!form.formState.errors.full_name} {...form.register("full_name")} />
            <FieldError>{form.formState.errors.full_name?.message}</FieldError>
          </Field>
          <Field data-invalid={!!form.formState.errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" aria-invalid={!!form.formState.errors.email} {...form.register("email")} />
            <FieldError>{form.formState.errors.email?.message}</FieldError>
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="phone">No WhatsApp</FieldLabel>
            <Input id="phone" {...form.register("phone")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="subject">Subjek</FieldLabel>
            <Input id="subject" {...form.register("subject")} />
          </Field>
        </div>
        <Field data-invalid={!!form.formState.errors.message}>
          <FieldLabel htmlFor="message">Pesan</FieldLabel>
          <Textarea id="message" rows={5} aria-invalid={!!form.formState.errors.message} {...form.register("message")} />
          <FieldError>{form.formState.errors.message?.message}</FieldError>
        </Field>
      </FieldGroup>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <Button type="submit" disabled={isPending}>
        <Send data-icon="inline-start" />
        {isPending ? "Mengirim..." : "Kirim Pesan"}
      </Button>
    </form>
  );
}
