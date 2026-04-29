import { redirect } from "next/navigation";

export default function LegacyDashboardBookingPage() {
  redirect("/dashboard/bookings");
}
