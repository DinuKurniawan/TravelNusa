import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PaymentTable } from "@/components/admin/PaymentTable";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Payment } from "@/types";

async function getPayments() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("payments")
    .select("*, bookings(booking_code, full_name, email), payment_logs(*)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as Payment[];
}

export default async function AdminPaymentsPage() {
  const payments = await getPayments();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Pembayaran"
        description="Monitor transaksi Midtrans, raw response, status payment, dan log webhook."
      />
      <PaymentTable payments={payments} />
    </div>
  );
}
