"use client";

/* eslint-disable react-hooks/incompatible-library */

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { createBookingAction } from "@/actions/booking.actions";
import { initialActionState } from "@/actions/state";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { bookingSchema, type BookingInput } from "@/lib/validations/booking";
import { calculateTotalBooking, formatCurrency } from "@/lib/utils";
import type { TravelPackage } from "@/types";

export function BookingForm({
  packages,
  defaultPackageId,
}: {
  packages: TravelPackage[];
  defaultPackageId?: string;
}) {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  type BookingFormInput = z.input<typeof bookingSchema>;
  const form = useForm<BookingFormInput, unknown, BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      package_id: defaultPackageId ?? packages[0]?.id ?? "",
      departure_date: "",
      participant_count: 1,
      note: "",
    },
  });

  const selectedPackageId = form.watch("package_id");
  const participantCount = Number(form.watch("participant_count") || 1);
  const selectedPackage = useMemo(
    () => packages.find((item) => item.id === selectedPackageId),
    [packages, selectedPackageId],
  );
  const pricePerPerson = selectedPackage ? selectedPackage.discount_price ?? selectedPackage.price : 0;
  const total = calculateTotalBooking(participantCount, pricePerPerson);

  function onSubmit(values: BookingInput) {
    const payload = new FormData();
    Object.entries(values).forEach(([key, value]) => payload.append(key, String(value ?? "")));

    startTransition(async () => {
      const result = await createBookingAction(initialActionState, payload);
      setServerMessage(result.message);
      if (result.ok) {
        toast.success(result.message);
        const redirectTo = typeof result.data?.redirectTo === "string" ? result.data.redirectTo : "/dashboard/bookings";
        router.push(redirectTo);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="soft-card flex flex-col gap-5 p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Form Booking</h2>
          <p className="text-sm text-muted-foreground">Status awal booking adalah pending.</p>
        </div>
        <CalendarDays className="text-primary" />
      </div>
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
          <Field data-invalid={!!form.formState.errors.phone}>
            <FieldLabel htmlFor="phone">No WhatsApp</FieldLabel>
            <Input id="phone" aria-invalid={!!form.formState.errors.phone} {...form.register("phone")} />
            <FieldError>{form.formState.errors.phone?.message}</FieldError>
          </Field>
          <Field data-invalid={!!form.formState.errors.package_id}>
            <FieldLabel htmlFor="package_id">Paket travel</FieldLabel>
            <select
              id="package_id"
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-invalid={!!form.formState.errors.package_id}
              {...form.register("package_id")}
            >
              {packages.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <FieldError>{form.formState.errors.package_id?.message}</FieldError>
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field data-invalid={!!form.formState.errors.departure_date}>
            <FieldLabel htmlFor="departure_date">Tanggal keberangkatan</FieldLabel>
            <Input id="departure_date" type="date" aria-invalid={!!form.formState.errors.departure_date} {...form.register("departure_date")} />
            <FieldError>{form.formState.errors.departure_date?.message}</FieldError>
          </Field>
          <Field data-invalid={!!form.formState.errors.participant_count}>
            <FieldLabel htmlFor="participant_count">Jumlah peserta</FieldLabel>
            <Input
              id="participant_count"
              type="number"
              min={1}
              aria-invalid={!!form.formState.errors.participant_count}
              {...form.register("participant_count", { valueAsNumber: true })}
            />
            <FieldError>{form.formState.errors.participant_count?.message}</FieldError>
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="note">Catatan tambahan</FieldLabel>
          <Textarea id="note" rows={4} {...form.register("note")} />
        </Field>
      </FieldGroup>
      <div className="rounded-xl border bg-muted/40 p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Estimasi total</span>
          <span className="text-2xl font-semibold text-primary">{formatCurrency(total)}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatCurrency(pricePerPerson)} x {participantCount || 1} peserta
        </p>
      </div>
      {serverMessage ? <p className="text-sm text-muted-foreground">{serverMessage}</p> : null}
      <Button type="submit" disabled={isPending}>
        <Send data-icon="inline-start" />
        {isPending ? "Mengirim..." : "Kirim Booking"}
      </Button>
    </form>
  );
}
