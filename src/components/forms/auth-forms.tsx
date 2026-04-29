"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { loginAction, registerAction } from "@/actions/auth.actions";
import { initialActionState } from "@/actions/state";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

type LoginInput = z.infer<typeof loginSchema>;
type RegisterInput = z.infer<typeof registerSchema>;

export function LoginForm() {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginInput) {
    const payload = new FormData();
    Object.entries(values).forEach(([key, value]) => payload.append(key, value));
    startTransition(async () => {
      const result = await loginAction(initialActionState, payload);
      setMessage(result.message);
      if (!result.ok) toast.error(result.message);
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="soft-card mx-auto flex w-full max-w-md flex-col gap-5 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
        <p className="text-sm text-muted-foreground">Masuk sebagai customer atau admin.</p>
      </div>
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" aria-invalid={!!form.formState.errors.email} {...form.register("email")} />
          <FieldError>{form.formState.errors.email?.message}</FieldError>
        </Field>
        <Field data-invalid={!!form.formState.errors.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" type="password" aria-invalid={!!form.formState.errors.password} {...form.register("password")} />
          <FieldError>{form.formState.errors.password?.message}</FieldError>
        </Field>
      </FieldGroup>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <Button type="submit" disabled={isPending}>
        <LogIn data-icon="inline-start" />
        {isPending ? "Memproses..." : "Login"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link href="/register" className="font-medium text-primary">
          Register
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", phone: "", email: "", password: "" },
  });

  function onSubmit(values: RegisterInput) {
    const payload = new FormData();
    Object.entries(values).forEach(([key, value]) => payload.append(key, value));
    startTransition(async () => {
      const result = await registerAction(initialActionState, payload);
      setMessage(result.message);
      if (result.ok) toast.success(result.message);
      if (!result.ok) toast.error(result.message);
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="soft-card mx-auto flex w-full max-w-md flex-col gap-5 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Register</h1>
        <p className="text-sm text-muted-foreground">Akun baru otomatis mendapat role customer.</p>
      </div>
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.full_name}>
          <FieldLabel htmlFor="full_name">Nama lengkap</FieldLabel>
          <Input id="full_name" aria-invalid={!!form.formState.errors.full_name} {...form.register("full_name")} />
          <FieldError>{form.formState.errors.full_name?.message}</FieldError>
        </Field>
        <Field data-invalid={!!form.formState.errors.phone}>
          <FieldLabel htmlFor="phone">No WhatsApp</FieldLabel>
          <Input id="phone" aria-invalid={!!form.formState.errors.phone} {...form.register("phone")} />
          <FieldError>{form.formState.errors.phone?.message}</FieldError>
        </Field>
        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" aria-invalid={!!form.formState.errors.email} {...form.register("email")} />
          <FieldError>{form.formState.errors.email?.message}</FieldError>
        </Field>
        <Field data-invalid={!!form.formState.errors.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" type="password" aria-invalid={!!form.formState.errors.password} {...form.register("password")} />
          <FieldError>{form.formState.errors.password?.message}</FieldError>
        </Field>
      </FieldGroup>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <Button type="submit" disabled={isPending}>
        <UserPlus data-icon="inline-start" />
        {isPending ? "Memproses..." : "Buat Akun"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-primary">
          Login
        </Link>
      </p>
    </form>
  );
}
