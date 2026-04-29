import { z } from "zod";

export const contactSchema = z.object({
  full_name: z.string().min(2, "Nama lengkap wajib diisi"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  message: z.string().min(10, "Pesan minimal 10 karakter"),
});
