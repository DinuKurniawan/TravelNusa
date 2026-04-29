import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Nama kategori wajib diisi"),
  slug: z.string().min(2, "Slug wajib diisi"),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
});

export const destinationSchema = z.object({
  category_id: z.string().uuid("Kategori wajib dipilih"),
  name: z.string().min(2, "Nama destinasi wajib diisi"),
  slug: z.string().min(2, "Slug wajib diisi"),
  province: z.string().min(2, "Provinsi wajib diisi"),
  city: z.string().min(2, "Kota wajib diisi"),
  address: z.string().optional().nullable(),
  description: z.string().min(10, "Deskripsi wajib diisi"),
  facilities: z.array(z.string()).default([]),
  main_image_url: z.string().url().optional().nullable(),
  gallery_urls: z.array(z.string()).default([]),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  is_featured: z.boolean().default(false),
  status: z.enum(["draft", "published"]).default("published"),
});

export const packageSchema = z.object({
  destination_id: z.string().uuid("Destinasi wajib dipilih"),
  name: z.string().min(2, "Nama paket wajib diisi"),
  slug: z.string().min(2, "Slug wajib diisi"),
  short_description: z.string().optional().nullable(),
  description: z.string().min(10, "Deskripsi wajib diisi"),
  price: z.coerce.number().min(0, "Harga wajib angka"),
  discount_price: z.coerce.number().min(0).optional().nullable(),
  duration_days: z.coerce.number().int().min(1, "Durasi wajib diisi"),
  duration_nights: z.coerce.number().int().min(0).default(0),
  quota: z.coerce.number().int().min(0, "Kuota wajib angka"),
  included: z.array(z.string()).default([]),
  excluded: z.array(z.string()).default([]),
  main_image_url: z.string().url().optional().nullable(),
  gallery_urls: z.array(z.string()).default([]),
  rating: z.coerce.number().min(0).max(5).default(0),
  total_reviews: z.coerce.number().int().min(0).default(0),
  is_featured: z.boolean().default(false),
  status: z.enum(["draft", "published"]).default("published"),
});

export const blogSchema = z.object({
  title: z.string().min(2, "Judul wajib diisi"),
  slug: z.string().min(2, "Slug wajib diisi"),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(10, "Konten wajib diisi"),
  cover_image_url: z.string().url().optional().nullable(),
  category: z.string().optional().nullable(),
  status: z.enum(["draft", "published"]).default("draft"),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
});

export const itinerarySchema = z.object({
  package_id: z.string().uuid(),
  day_number: z.coerce.number().int().min(1),
  title: z.string().min(2),
  description: z.string().min(5),
  location: z.string().optional().nullable(),
  time: z.string().optional().nullable(),
});

export const gallerySchema = z.object({
  title: z.string().min(2),
  image_url: z.string().url(),
  category: z.string().optional().nullable(),
  status: z.enum(["draft", "published"]).default("published"),
});

export const testimonialSchema = z.object({
  customer_name: z.string().min(2),
  customer_photo_url: z.string().url().optional().nullable(),
  rating: z.coerce.number().int().min(1).max(5),
  content: z.string().min(5),
  status: z.enum(["draft", "published"]).default("published"),
});

export const settingsSchema = z.object({
  site_name: z.string().min(2),
  logo_url: z.string().url().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  instagram_url: z.string().url().optional().nullable(),
  facebook_url: z.string().url().optional().nullable(),
  tiktok_url: z.string().url().optional().nullable(),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
});
