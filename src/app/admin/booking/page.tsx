import { updateBookingStatusAction } from "@/actions/admin.actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getAdminBookings } from "@/lib/data/admin";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { BookingStatus } from "@/types";

const statuses: BookingStatus[] = ["pending", "confirmed", "paid", "completed", "cancelled"];

export default async function AdminBookingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = Array.isArray(params.status) ? params.status[0] : params.status;
  const bookings = await getAdminBookings(status);

  return (
    <div>
      <AdminPageHeader title="Booking" description="Lihat detail booking, filter status, ubah status, dan tambahkan catatan admin." />
      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant="outline" asChild><a href="/admin/booking">Semua</a></Button>
        {statuses.map((item) => (
          <Button key={item} variant="outline" asChild><a href={`/admin/booking?status=${item}`}>{item}</a></Button>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_460px]">
        <DataTable
          data={bookings.map((item) => ({
            ...item,
            package_name: item.travel_packages?.name,
          }))}
          columns={[
            { key: "booking_code", header: "Kode" },
            { key: "full_name", header: "Nama" },
            { key: "package_name", header: "Paket" },
            { key: "departure_date", header: "Berangkat", format: "date" },
            { key: "total_price", header: "Total", format: "currency" },
            { key: "status", header: "Status" },
          ]}
        />
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <CardTitle>{booking.booking_code}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="text-sm text-muted-foreground">
                  <p>{booking.full_name} • {booking.email} • {booking.phone}</p>
                  <p>{booking.travel_packages?.name ?? "Paket"} • {formatDate(booking.departure_date)} • {booking.participant_count} peserta</p>
                  <p className="font-semibold text-primary">{formatCurrency(booking.total_price)}</p>
                  {booking.note ? <p>Catatan customer: {booking.note}</p> : null}
                </div>
                <form action={updateBookingStatusAction} className="flex flex-col gap-3">
                  <input type="hidden" name="id" value={booking.id} />
                  <select name="status" defaultValue={booking.status} className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm">
                    {statuses.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                  <Textarea name="admin_note" defaultValue={booking.admin_note ?? ""} placeholder="Catatan admin" />
                  <Button type="submit">Update Status</Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
