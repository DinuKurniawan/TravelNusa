import Link from "next/link";

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
    .order("created_at", { ascending: false });

  return (data ?? []) as unknown as Booking[];
}

export default async function DashboardBookingsPage() {
  const session = await requireUser();
  const bookings = await getMyBookings(session.user.id);

  return (
    <PublicShell>
      <section className="bg-slate-50 py-12 md:py-16">
        <div className="container-nusa">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Riwayat Booking</h1>
          <p className="mt-2 text-muted-foreground">Customer hanya bisa melihat booking miliknya sendiri.</p>
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className="container-nusa">
          <Card>
            <CardHeader>
              <CardTitle>Semua booking</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="rounded-xl border p-4">
                  <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <p className="font-semibold">{booking.travel_packages?.name ?? "Paket travel"}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.booking_code} • Berangkat {formatDate(booking.departure_date)}
                      </p>
                      {booking.admin_note ? <p className="mt-2 text-sm text-muted-foreground">Catatan admin: {booking.admin_note}</p> : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 md:justify-end">
                      <Badge variant="secondary">{booking.status}</Badge>
                      <span className="font-semibold text-primary">{formatCurrency(booking.total_price)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {!bookings.length ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                  Belum ada booking.
                </div>
              ) : null}
              <Button className="w-fit" asChild>
                <Link href="/booking">Buat Booking Baru</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicShell>
  );
}
