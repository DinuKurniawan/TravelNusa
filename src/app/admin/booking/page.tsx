import { redirect } from "next/navigation";

export default function LegacyAdminBookingPage() {
  redirect("/admin/bookings");
}
