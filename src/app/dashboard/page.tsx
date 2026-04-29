import Link from "next/link";
import { CalendarCheck, UserRound } from "lucide-react";

import { ProfileForm } from "@/components/forms/profile-form";
import { PublicShell } from "@/components/public/public-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Booking } from "@/types";

async function getMyBookings(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("*, travel_packages(name, slug, main_image_url)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  return (data ?? []) as unknown as Booking[];
}

export default async function DashboardPage() {
  const session = await requireUser();
  const bookings = await getMyBookings(session.user.id);

  return (
    <PublicShell>
      <section className="bg-slate-50 py-12 md:py-16">
        <div className="container-nusa flex flex-col gap-2">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserRound data-icon="inline-start" />
            Customer Dashboard
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Halo, {session.profile?.full_name ?? session.user.email}</h1>
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className="container-nusa grid gap-8 lg:grid-cols-[360px_1fr]">
          <ProfileForm profile={session.profile} />
          <Card>
            <CardHeader>
              <CardTitle>Riwayat booking terbaru</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {bookings.length ? (
                bookings.map((booking) => (
                  <div key={booking.id} className="rounded-xl border p-4">
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                      <div>
                        <p className="font-semibold">{booking.travel_packages?.name ?? booking.booking_code}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.booking_code} • {formatDate(booking.departure_date)} • {booking.participant_count} peserta
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{booking.status}</Badge>
                        <span className="font-semibold text-primary">{formatCurrency(booking.total_price)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                  Belum ada booking.
                </div>
              )}
              <Button className="w-fit" variant="outline" asChild>
                <Link href="/dashboard/booking">
                  <CalendarCheck data-icon="inline-start" />
                  Lihat Semua Booking
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicShell>
  );
}
