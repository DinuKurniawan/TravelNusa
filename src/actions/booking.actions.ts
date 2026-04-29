"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { bookingSchema } from "@/lib/validations/booking";
import { contactSchema } from "@/lib/validations/contact";
import { calculateTotalBooking } from "@/lib/utils";
import type { ActionState } from "./state";
import { errorState, successState, validationErrorState } from "./state";

export async function createBookingAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = bookingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationErrorState(parsed.error);

  if (!isSupabaseConfigured()) {
    return successState("Mode demo: booking tervalidasi. Hubungkan Supabase agar data tersimpan.");
  }

  const supabase = await createClient();
  const session = await getCurrentUser();
  const { data: selectedPackage, error: packageError } = await supabase
    .from("travel_packages")
    .select("price,discount_price,status")
    .eq("id", parsed.data.package_id)
    .single();

  if (packageError || !selectedPackage || selectedPackage.status !== "published") {
    return errorState("Paket travel tidak tersedia.");
  }

  const pricePerPerson = Number(selectedPackage.discount_price ?? selectedPackage.price);
  const totalPrice = calculateTotalBooking(parsed.data.participant_count, pricePerPerson);
  const { error } = await supabase.from("bookings").insert({
    user_id: session?.user.id ?? null,
    package_id: parsed.data.package_id,
    full_name: parsed.data.full_name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    departure_date: parsed.data.departure_date,
    participant_count: parsed.data.participant_count,
    price_per_person: pricePerPerson,
    total_price: totalPrice,
    note: parsed.data.note ?? null,
    status: "pending",
  });

  if (error) return errorState(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/admin/booking");
  return successState("Booking berhasil dikirim. Tim kami akan menghubungi Anda.");
}

export async function createContactMessageAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationErrorState(parsed.error);

  if (!isSupabaseConfigured()) {
    return successState("Mode demo: pesan tervalidasi. Hubungkan Supabase agar pesan tersimpan.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    full_name: parsed.data.full_name,
    email: parsed.data.email,
    phone: parsed.data.phone ?? null,
    subject: parsed.data.subject ?? null,
    message: parsed.data.message,
    status: "unread",
  });

  if (error) return errorState(error.message);

  revalidatePath("/admin");
  return successState("Pesan berhasil dikirim. Kami akan membalas secepatnya.");
}
