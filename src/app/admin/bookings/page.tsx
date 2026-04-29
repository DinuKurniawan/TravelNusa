import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BookingTable } from "@/components/admin/BookingTable";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Booking } from "@/types";

async function getBookings() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .select("*, travel_packages(name, slug, main_image_url), payments(*), tickets(*)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as Booking[];
}

export default async function AdminBookingsPage() {
  const bookings = await getBookings();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Booking & Tiket"
        description="Kelola booking customer, pembayaran, tiket, filter status, dan export CSV."
      />
      <BookingTable bookings={bookings} />
    </div>
  );
}
