"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { TicketStatus } from "@/types";

const adminTicketStatuses: TicketStatus[] = ["active", "used", "cancelled"];

export async function updateTicketStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const ticketId = String(formData.get("ticket_id") ?? "");
  const status = String(formData.get("ticket_status") ?? "active") as TicketStatus;

  if (!ticketId || !adminTicketStatuses.includes(status)) {
    throw new Error("Status tiket tidak valid.");
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("tickets")
    .update({
      ticket_status: status,
      used_at: status === "used" ? new Date().toISOString() : null,
    })
    .eq("id", ticketId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/ticket");
}
