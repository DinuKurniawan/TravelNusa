import { z } from "zod";

export const bookingSchema = z.object({
  full_name: z.string().min(2, "Nama lengkap wajib diisi"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(8, "Nomor WhatsApp wajib diisi"),
  package_id: z.string().uuid("Paket travel wajib dipilih"),
  departure_date: z.string().min(1, "Tanggal keberangkatan wajib diisi"),
  participant_count: z.coerce.number().int().min(1, "Minimal 1 peserta"),
  note: z.string().optional().nullable(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
