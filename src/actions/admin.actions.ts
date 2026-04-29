"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  blogSchema,
  categorySchema,
  destinationSchema,
  gallerySchema,
  itinerarySchema,
  packageSchema,
  settingsSchema,
  testimonialSchema,
} from "@/lib/validations/admin";
import { generateSlug, nullableString, numberFromForm, splitLines } from "@/lib/utils";
import type { BookingStatus, UserRole } from "@/types";
import type { Database } from "@/types/database";

const allowedDeleteTables = [
  "categories",
  "destinations",
  "travel_packages",
  "package_itineraries",
  "gallery",
  "blog_posts",
  "testimonials",
] as const satisfies readonly (keyof Database["public"]["Tables"])[];

function booleanFromForm(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function idFromForm(formData: FormData) {
  const id = nullableString(formData.get("id"));
  return id || undefined;
}

async function uploadOptionalFile(bucket: string, formData: FormData, fieldName: string, folder = "uploads") {
  const file = formData.get(fieldName);
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const extension = file.name.split(".").pop() || "jpg";
  const safeName = generateSlug(file.name.replace(/\.[^/.]+$/, "")) || "image";
  const path = `${folder}/${Date.now()}-${safeName}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function saveCategoryAction(formData: FormData) {
  await requireAdmin();
  const parsed = categorySchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug") || generateSlug(String(formData.get("name") ?? "")),
    description: nullableString(formData.get("description")),
    icon: nullableString(formData.get("icon")),
    type: nullableString(formData.get("type")),
  });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("categories").upsert({ id: idFromForm(formData), ...parsed });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/kategori");
  revalidatePath("/");
}

export async function saveDestinationAction(formData: FormData) {
  await requireAdmin();
  const uploadedImage = await uploadOptionalFile("destinations", formData, "main_image", "destinations");
  const parsed = destinationSchema.parse({
    category_id: formData.get("category_id"),
    name: formData.get("name"),
    slug: formData.get("slug") || generateSlug(String(formData.get("name") ?? "")),
    province: formData.get("province"),
    city: formData.get("city"),
    address: nullableString(formData.get("address")),
    description: formData.get("description"),
    facilities: splitLines(formData.get("facilities")),
    main_image_url: uploadedImage ?? nullableString(formData.get("main_image_url")),
    gallery_urls: splitLines(formData.get("gallery_urls")),
    latitude: nullableString(formData.get("latitude")) ? numberFromForm(formData.get("latitude")) : null,
    longitude: nullableString(formData.get("longitude")) ? numberFromForm(formData.get("longitude")) : null,
    is_featured: booleanFromForm(formData, "is_featured"),
    status: formData.get("status") || "published",
  });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("destinations").upsert({ id: idFromForm(formData), ...parsed });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/destinasi");
  revalidatePath("/destinasi");
  revalidatePath("/");
}

export async function savePackageAction(formData: FormData) {
  await requireAdmin();
  const uploadedImage = await uploadOptionalFile("packages", formData, "main_image", "packages");
  const parsed = packageSchema.parse({
    destination_id: formData.get("destination_id"),
    name: formData.get("name"),
    slug: formData.get("slug") || generateSlug(String(formData.get("name") ?? "")),
    short_description: nullableString(formData.get("short_description")),
    description: formData.get("description"),
    price: formData.get("price"),
    discount_price: nullableString(formData.get("discount_price")) ? numberFromForm(formData.get("discount_price")) : null,
    duration_days: formData.get("duration_days"),
    duration_nights: formData.get("duration_nights") || 0,
    quota: formData.get("quota"),
    included: splitLines(formData.get("included")),
    excluded: splitLines(formData.get("excluded")),
    main_image_url: uploadedImage ?? nullableString(formData.get("main_image_url")),
    gallery_urls: splitLines(formData.get("gallery_urls")),
    rating: formData.get("rating") || 0,
    total_reviews: formData.get("total_reviews") || 0,
    is_featured: booleanFromForm(formData, "is_featured"),
    status: formData.get("status") || "published",
  });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("travel_packages").upsert({ id: idFromForm(formData), ...parsed });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/paket");
  revalidatePath("/paket");
  revalidatePath("/");
}

export async function saveItineraryAction(formData: FormData) {
  await requireAdmin();
  const parsed = itinerarySchema.parse({
    package_id: formData.get("package_id"),
    day_number: formData.get("day_number"),
    title: formData.get("title"),
    description: formData.get("description"),
    location: nullableString(formData.get("location")),
    time: nullableString(formData.get("time")),
  });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("package_itineraries").upsert({ id: idFromForm(formData), ...parsed });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/paket/${parsed.package_id}/itinerary`);
  revalidatePath("/paket");
}

export async function saveGalleryAction(formData: FormData) {
  await requireAdmin();
  const uploadedImage = await uploadOptionalFile("gallery", formData, "image", "gallery");
  const parsed = gallerySchema.parse({
    title: formData.get("title"),
    image_url: uploadedImage ?? formData.get("image_url"),
    category: nullableString(formData.get("category")),
    status: formData.get("status") || "published",
  });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("gallery").upsert({ id: idFromForm(formData), ...parsed });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/galeri");
  revalidatePath("/galeri");
}

export async function saveBlogAction(formData: FormData) {
  const session = await requireAdmin();
  const uploadedImage = await uploadOptionalFile("blog", formData, "cover_image", "blog");
  const parsed = blogSchema.parse({
    title: formData.get("title"),
    slug: formData.get("slug") || generateSlug(String(formData.get("title") ?? "")),
    excerpt: nullableString(formData.get("excerpt")),
    content: formData.get("content"),
    cover_image_url: uploadedImage ?? nullableString(formData.get("cover_image_url")),
    category: nullableString(formData.get("category")),
    status: formData.get("status") || "draft",
    seo_title: nullableString(formData.get("seo_title")),
    seo_description: nullableString(formData.get("seo_description")),
  });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("blog_posts").upsert({
    id: idFromForm(formData),
    author_id: session.user.id,
    ...parsed,
    published_at: parsed.status === "published" ? new Date().toISOString() : null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function saveTestimonialAction(formData: FormData) {
  await requireAdmin();
  const uploadedImage = await uploadOptionalFile("avatars", formData, "customer_photo", "testimonials");
  const parsed = testimonialSchema.parse({
    customer_name: formData.get("customer_name"),
    customer_photo_url: uploadedImage ?? nullableString(formData.get("customer_photo_url")),
    rating: formData.get("rating"),
    content: formData.get("content"),
    status: formData.get("status") || "published",
  });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("testimonials").upsert({ id: idFromForm(formData), ...parsed });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/testimoni");
  revalidatePath("/");
}

export async function updateBookingStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "pending_payment") as BookingStatus;
  const adminNote = nullableString(formData.get("admin_note"));

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("bookings")
    .update({ booking_status: status, admin_note: adminNote })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/booking");
  revalidatePath("/admin/bookings");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/bookings");
}

export async function updateUserAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "customer") as UserRole;
  const status = String(formData.get("status") ?? "active") as "active" | "inactive";

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("profiles").update({ role, status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}

export async function saveSettingsAction(formData: FormData) {
  await requireAdmin();
  const uploadedLogo = await uploadOptionalFile("avatars", formData, "logo", "settings");
  const parsed = settingsSchema.parse({
    site_name: formData.get("site_name"),
    logo_url: uploadedLogo ?? nullableString(formData.get("logo_url")),
    email: nullableString(formData.get("email")),
    phone: nullableString(formData.get("phone")),
    whatsapp: nullableString(formData.get("whatsapp")),
    address: nullableString(formData.get("address")),
    instagram_url: nullableString(formData.get("instagram_url")),
    facebook_url: nullableString(formData.get("facebook_url")),
    tiktok_url: nullableString(formData.get("tiktok_url")),
    meta_title: nullableString(formData.get("meta_title")),
    meta_description: nullableString(formData.get("meta_description")),
  });

  const id = idFromForm(formData);
  const supabase = getSupabaseAdmin();
  const { error } = id
    ? await supabase.from("site_settings").update(parsed).eq("id", id)
    : await supabase.from("site_settings").insert(parsed);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}

export async function deleteRecordAction(formData: FormData) {
  await requireAdmin();
  const table = String(formData.get("table") ?? "");
  const id = String(formData.get("id") ?? "");
  const path = String(formData.get("path") ?? "/admin");

  if (!allowedDeleteTables.includes(table as (typeof allowedDeleteTables)[number])) {
    throw new Error("Tabel tidak diizinkan.");
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from(table as (typeof allowedDeleteTables)[number]).delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(path);
}
