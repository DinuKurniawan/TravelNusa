import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password wajib diisi"),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, "Nama lengkap wajib diisi"),
  phone: z.string().min(8, "Nomor WhatsApp wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});
