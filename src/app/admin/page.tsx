import { CalendarClock, CheckCircle2, Map, PackageOpen, Users, type LucideIcon } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BookingChart } from "@/components/admin/booking-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminBookings, getAdminDestinations, getAdminPackages, getAdminProfiles } from "@/lib/data/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

function monthKey(date?: string) {
  return new Date(date ?? Date.now()).toLocaleDateString("id-ID", { month: "short" });
}

export default async function AdminDashboardPage() {
  const [destinations, packages, bookings, users] = await Promise.all([
    getAdminDestinations(),
    getAdminPackages(),
    getAdminBookings(),
    getAdminProfiles(),
  ]);

  const pending = bookings.filter((item) => item.status === "pending").length;
  const confirmed = bookings.filter((item) => item.status === "confirmed").length;
  const monthly = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const key = monthKey(date.toISOString());
    return {
      month: key,
      total: bookings.filter((booking) => monthKey(booking.created_at) === key).length,
    };
  });

  const popular = packages
    .map((item) => ({
      ...item,
      totalBookings: bookings.filter((booking) => booking.package_id === item.id).length,
    }))
    .sort((a, b) => b.totalBookings - a.totalBookings)
    .slice(0, 5);
  const statCards: { icon: LucideIcon; label: string; value: number }[] = [
    { icon: Map, label: "Total destinasi", value: destinations.length },
    { icon: PackageOpen, label: "Total paket", value: packages.length },
    { icon: CalendarClock, label: "Total booking", value: bookings.length },
    { icon: Users, label: "Total customer", value: users.filter((user) => user.role === "customer").length },
    { icon: CalendarClock, label: "Pending", value: pending },
    { icon: CheckCircle2, label: "Confirmed", value: confirmed },
  ];

  return (
    <div>
      <AdminPageHeader title="Dashboard Admin" description="Ringkasan statistik TravelNusa Indonesia." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {statCards.map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-semibold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <CardTitle>Grafik booking bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingChart data={monthly} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Paket paling populer</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {popular.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border p-3">
                <div>
                  <p className="line-clamp-1 font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(item.discount_price ?? item.price)}</p>
                </div>
                <Badge variant="secondary">{item.totalBookings}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Booking terbaru</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {bookings.slice(0, 5).map((booking) => (
            <div key={booking.id} className="grid gap-3 rounded-xl border p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-medium">{booking.full_name}</p>
                <p className="text-sm text-muted-foreground">{booking.booking_code} • {formatDate(booking.created_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{booking.status}</Badge>
                <span className="font-semibold text-primary">{formatCurrency(booking.total_price)}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
