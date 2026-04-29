import { z } from "zod";

function isFutureOrTodayDate(value: string) {
  const selected = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return selected >= today;
}

export const bookingSchema = z.object({
  full_name: z.string().trim().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(8, "Nomor WhatsApp wajib diisi"),
  package_id: z.string().uuid("Paket travel wajib dipilih"),
  departure_date: z.string().min(1, "Tanggal keberangkatan wajib diisi").refine(isFutureOrTodayDate, "Tanggal keberangkatan tidak boleh di masa lalu"),
  participant_count: z.coerce.number().int().min(1, "Minimal 1 peserta"),
  note: z.string().max(1000, "Catatan maksimal 1000 karakter").optional().nullable(),
});

export function createBookingSchema(maxQuota: number) {
  return bookingSchema.refine((value) => value.participant_count <= maxQuota, {
    path: ["participant_count"],
    message: `Jumlah peserta tidak boleh melebihi kuota ${maxQuota}`,
  });
}

export type BookingInput = z.infer<typeof bookingSchema>;
