"use client";

/* eslint-disable react-hooks/incompatible-library */

import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, CreditCard, UsersRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { createBookingAction } from "@/actions/booking.actions";
import { initialActionState } from "@/actions/state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createBookingSchema, type BookingInput } from "@/lib/validations/booking";
import { calculateTotalBooking } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import type { Profile, TravelPackage } from "@/types";

type PackageForBooking = Pick<
  TravelPackage,
  "id" | "name" | "slug" | "price" | "discount_price" | "quota" | "duration_days" | "duration_nights"
>;

export function BookingForm({
  travelPackage,
  profile,
  userEmail,
}: {
  travelPackage: PackageForBooking;
  profile: Profile | null;
  userEmail: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const schema = useMemo(() => createBookingSchema(travelPackage.quota), [travelPackage.quota]);
  type BookingFormInput = z.input<typeof schema>;

  const form = useForm<BookingFormInput, unknown, BookingInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: profile?.full_name ?? "",
      email: userEmail,
      phone: profile?.phone ?? "",
      package_id: travelPackage.id,
      departure_date: "",
      participant_count: 1,
      note: "",
    },
  });

  const participantCount = Number(form.watch("participant_count") || 1);
  const pricePerPerson = Number(travelPackage.discount_price ?? travelPackage.price);
  const total = calculateTotalBooking(participantCount, pricePerPerson);
  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function onSubmit(values: BookingInput) {
    const payload = new FormData();
    Object.entries(values).forEach(([key, value]) => payload.append(key, String(value ?? "")));

    startTransition(async () => {
      const result = await createBookingAction(initialActionState, payload);

      if (result.ok) {
        toast.success(result.message);
        const redirectTo = typeof result.data?.redirectTo === "string" ? result.data.redirectTo : "/dashboard/bookings";
        router.push(redirectTo);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays data-icon="inline-start" />
            Data Booking
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                <FieldLabel htmlFor="phone">Nomor WhatsApp</FieldLabel>
                <Input id="phone" aria-invalid={!!form.formState.errors.phone} {...form.register("phone")} />
                <FieldError>{form.formState.errors.phone?.message}</FieldError>
              </Field>
              <Field data-invalid={!!form.formState.errors.departure_date}>
                <FieldLabel htmlFor="departure_date">Tanggal keberangkatan</FieldLabel>
                <Input
                  id="departure_date"
                  type="date"
                  min={minDate}
                  aria-invalid={!!form.formState.errors.departure_date}
                  {...form.register("departure_date")}
                />
                <FieldError>{form.formState.errors.departure_date?.message}</FieldError>
              </Field>
            </div>

            <Field data-invalid={!!form.formState.errors.participant_count}>
              <FieldLabel htmlFor="participant_count">Jumlah peserta</FieldLabel>
              <Input
                id="participant_count"
                type="number"
                min={1}
                max={travelPackage.quota}
                aria-invalid={!!form.formState.errors.participant_count}
                {...form.register("participant_count", { valueAsNumber: true })}
              />
              <FieldError>{form.formState.errors.participant_count?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="note">Catatan tambahan</FieldLabel>
              <Textarea id="note" rows={5} placeholder="Permintaan khusus, alergi makanan, atau info tambahan." {...form.register("note")} />
            </Field>

            <input type="hidden" {...form.register("package_id")} />
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersRound data-icon="inline-start" />
              Ringkasan
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="font-semibold">{travelPackage.name}</p>
              <p className="text-sm text-muted-foreground">
                {travelPackage.duration_days} hari {travelPackage.duration_nights} malam
              </p>
            </div>
            <div className="rounded-xl border bg-muted/40 p-4">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Harga per orang</span>
                <span className="font-medium">{formatCurrency(pricePerPerson)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Jumlah peserta</span>
                <span className="font-medium">{participantCount || 1}</span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4 border-t pt-4">
                <span className="font-medium">Total</span>
                <span className="text-2xl font-semibold text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              Pembayaran diproses aman melalui Midtrans Snap. Total pembayaran selalu dihitung dari database.
            </p>
            <Button type="submit" size="lg" disabled={isPending}>
              <CreditCard data-icon="inline-start" />
              {isPending ? "Menyimpan..." : "Lanjut Pembayaran"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
