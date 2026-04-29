import Link from "next/link";
import { CalendarCheck, Download, Ticket } from "lucide-react";

import { PaymentStatusBadge } from "@/components/payment/PaymentStatusBadge";
import { PublicShell } from "@/components/public/public-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { requireUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Booking } from "@/types";

async function getMyBookings(userId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .select("*, travel_packages(name, slug, main_image_url), payments(*), tickets(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as Booking[];
}

function latestPayment(booking: Booking) {
  return [...(booking.payments ?? [])].sort((a, b) =>
    String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")),
  )[0] ?? null;
}

export default async function CustomerBookingsPage() {
  const session = await requireUser();
  const bookings = await getMyBookings(session.user.id);

  return (
    <PublicShell>
      <section className="bg-slate-50 py-10 md:py-14">
        <div className="container-nusa">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarCheck data-icon="inline-start" />
            Customer Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Riwayat Booking</h1>
          <p className="mt-2 text-muted-foreground">Semua booking dan pembayaran milik akun Anda.</p>
        </div>
      </section>
      <section className="py-10 md:py-14">
        <div className="container-nusa">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Booking Saya</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {bookings.map((booking) => {
                const payment = latestPayment(booking);
                const ticket = booking.tickets?.[0];

                return (
                  <div key={booking.id} className="rounded-xl border p-4">
                    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                      <div>
                        <p className="font-semibold">{booking.travel_packages?.name ?? "Paket TravelNusa"}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.booking_code} - Berangkat {formatDate(booking.departure_date)} - {booking.participant_count} peserta
                        </p>
                        <p className="mt-1 font-semibold text-primary">{formatCurrency(booking.total_price)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        <PaymentStatusBadge status={booking.booking_status} kind="booking" />
                        <PaymentStatusBadge status={payment?.payment_status} kind="payment" />
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/bookings/${booking.booking_code}`}>Detail</Link>
                        </Button>
                        {booking.booking_status === "pending_payment" ? (
                          <Button size="sm" asChild>
                            <Link href={`/payment/${booking.booking_code}`}>Bayar</Link>
                          </Button>
                        ) : null}
                        {ticket ? (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/ticket/${booking.booking_code}`}>
                              <Ticket data-icon="inline-start" />
                              Tiket
                            </Link>
                          </Button>
                        ) : null}
                        {ticket ? (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/api/tickets/${booking.booking_code}/pdf`}>
                              <Download data-icon="inline-start" />
                              PDF
                            </Link>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
              {!bookings.length ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>Belum ada booking</EmptyTitle>
                    <EmptyDescription>Pilih paket travel favorit dan mulai booking perjalanan pertama Anda.</EmptyDescription>
                  </EmptyHeader>
                  <Button asChild>
                    <Link href="/paket">Lihat Paket</Link>
                  </Button>
                </Empty>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicShell>
  );
}
