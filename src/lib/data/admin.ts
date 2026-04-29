import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type {
  BlogPost,
  Booking,
  Category,
  Destination,
  GalleryItem,
  PackageItinerary,
  Profile,
  SiteSettings,
  Testimonial,
  TravelPackage,
} from "@/types";

export async function getAdminCategories() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("name");
  return (data ?? []) as Category[];
}

export async function getAdminDestinations() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("destinations").select("*, categories(name, slug, icon)").order("created_at", { ascending: false });
  return (data ?? []) as unknown as Destination[];
}

export async function getAdminPackages() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("travel_packages").select("*, destinations(name, slug, province, city)").order("created_at", { ascending: false });
  return (data ?? []) as unknown as TravelPackage[];
}

export async function getAdminItineraries(packageId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("package_itineraries").select("*").eq("package_id", packageId).order("day_number");
  return (data ?? []) as PackageItinerary[];
}

export async function getAdminBookings(status?: string) {
  await requireAdmin();
  const supabase = await createClient();
  let query = supabase.from("bookings").select("*, travel_packages(name, slug, main_image_url)").order("created_at", { ascending: false });
  const statuses = ["pending", "confirmed", "paid", "completed", "cancelled"] as const;
  if (status && statuses.includes(status as (typeof statuses)[number])) {
    query = query.eq("status", status as (typeof statuses)[number]);
  }
  const { data } = await query;
  return (data ?? []) as unknown as Booking[];
}

export async function getAdminGallery() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("gallery").select("*").order("created_at", { ascending: false });
  return (data ?? []) as GalleryItem[];
}

export async function getAdminBlogPosts() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("blog_posts").select("*, profiles(full_name, avatar_url)").order("created_at", { ascending: false });
  return (data ?? []) as unknown as BlogPost[];
}

export async function getAdminTestimonials() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
  return (data ?? []) as Testimonial[];
}

export async function getAdminProfiles() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  return (data ?? []) as Profile[];
}

export async function getAdminSettings() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").limit(1).single();
  return data as SiteSettings | null;
}
