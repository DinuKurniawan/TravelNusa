import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  mockBlogPosts,
  mockCategories,
  mockDestinations,
  mockGallery,
  mockItineraries,
  mockPackages,
  mockSettings,
  mockTestimonials,
} from "@/lib/data/mock";
import type {
  BlogPost,
  Category,
  Destination,
  GalleryItem,
  PackageItinerary,
  SiteSettings,
  Testimonial,
  TravelPackage,
} from "@/types";

async function safeQuery<T>(query: () => Promise<T>, fallback: T) {
  if (!isSupabaseConfigured()) return fallback;

  try {
    return await query();
  } catch {
    return fallback;
  }
}

function normalizeSearch(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export async function getSettings(): Promise<SiteSettings> {
  return safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.from("site_settings").select("*").limit(1).single();
    if (error || !data) return mockSettings;
    return data as SiteSettings;
  }, mockSettings);
}

export async function getCategories(): Promise<Category[]> {
  return safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error || !data) return mockCategories;
    return data as Category[];
  }, mockCategories);
}

export async function getDestinations(filters?: {
  search?: string | string[];
  category?: string | string[];
  province?: string | string[];
  featured?: boolean;
}): Promise<Destination[]> {
  const rows = await safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("destinations")
      .select("*, categories(name, slug, icon)")
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .order("name");
    if (error || !data) return mockDestinations;
    return data as unknown as Destination[];
  }, mockDestinations);

  const search = normalizeSearch(filters?.search)?.toLowerCase();
  const category = normalizeSearch(filters?.category);
  const province = normalizeSearch(filters?.province);

  return rows.filter((item) => {
    if (filters?.featured && !item.is_featured) return false;
    if (search && !`${item.name} ${item.province} ${item.city}`.toLowerCase().includes(search)) return false;
    if (category && category !== "all" && item.categories?.slug !== category) return false;
    if (province && province !== "all" && item.province !== province) return false;
    return true;
  });
}

export async function getDestinationBySlug(slug: string) {
  const rows = await getDestinations();
  return rows.find((item) => item.slug === slug) ?? null;
}

export async function getPackages(filters?: {
  search?: string | string[];
  destination?: string | string[];
  duration?: string | string[];
  minPrice?: string | string[];
  maxPrice?: string | string[];
  sort?: string | string[];
  featured?: boolean;
}): Promise<TravelPackage[]> {
  const rows = await safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("travel_packages")
      .select("*, destinations(name, slug, province, city)")
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });
    if (error || !data) return mockPackages;
    return data as unknown as TravelPackage[];
  }, mockPackages);

  const search = normalizeSearch(filters?.search)?.toLowerCase();
  const destination = normalizeSearch(filters?.destination);
  const duration = normalizeSearch(filters?.duration);
  const minPrice = Number(normalizeSearch(filters?.minPrice) ?? 0);
  const maxPrice = Number(normalizeSearch(filters?.maxPrice) ?? 0);
  const sort = normalizeSearch(filters?.sort);

  const filtered = rows.filter((item) => {
    const price = item.discount_price ?? item.price;
    if (filters?.featured && !item.is_featured) return false;
    if (search && !`${item.name} ${item.destinations?.name ?? ""}`.toLowerCase().includes(search)) return false;
    if (destination && destination !== "all" && item.destinations?.slug !== destination) return false;
    if (duration === "short" && item.duration_days > 3) return false;
    if (duration === "medium" && (item.duration_days < 4 || item.duration_days > 5)) return false;
    if (duration === "long" && item.duration_days < 6) return false;
    if (minPrice > 0 && price < minPrice) return false;
    if (maxPrice > 0 && price > maxPrice) return false;
    return true;
  });

  return filtered.sort((a, b) => {
    if (sort === "price_asc") return (a.discount_price ?? a.price) - (b.discount_price ?? b.price);
    if (sort === "price_desc") return (b.discount_price ?? b.price) - (a.discount_price ?? a.price);
    return Number(b.is_featured) - Number(a.is_featured);
  });
}

export async function getPackageBySlug(slug: string) {
  const rows = await getPackages();
  return rows.find((item) => item.slug === slug) ?? null;
}

export async function getPackagesByDestination(destinationId: string) {
  const rows = await getPackages();
  return rows.filter((item) => item.destination_id === destinationId).slice(0, 3);
}

export async function getPackageItineraries(packageId: string): Promise<PackageItinerary[]> {
  return safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("package_itineraries")
      .select("*")
      .eq("package_id", packageId)
      .order("day_number");
    if (error || !data) return mockItineraries.filter((item) => item.package_id === packageId);
    return data as PackageItinerary[];
  }, mockItineraries.filter((item) => item.package_id === packageId));
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.from("testimonials").select("*").eq("status", "published").order("created_at", { ascending: false });
    if (error || !data) return mockTestimonials;
    return data as Testimonial[];
  }, mockTestimonials);
}

export async function getGallery(category?: string | string[]): Promise<GalleryItem[]> {
  const selectedCategory = normalizeSearch(category);
  const rows = await safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.from("gallery").select("*").eq("status", "published").order("created_at", { ascending: false });
    if (error || !data) return mockGallery;
    return data as GalleryItem[];
  }, mockGallery);

  if (!selectedCategory || selectedCategory === "all") return rows;
  return rows.filter((item) => item.category === selectedCategory);
}

export async function getBlogPosts(filters?: { search?: string | string[]; category?: string | string[] }): Promise<BlogPost[]> {
  const rows = await safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*, profiles(full_name, avatar_url)")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (error || !data) return mockBlogPosts;
    return data as unknown as BlogPost[];
  }, mockBlogPosts);

  const search = normalizeSearch(filters?.search)?.toLowerCase();
  const category = normalizeSearch(filters?.category);

  return rows.filter((item) => {
    if (search && !`${item.title} ${item.excerpt ?? ""}`.toLowerCase().includes(search)) return false;
    if (category && category !== "all" && item.category !== category) return false;
    return true;
  });
}

export async function getBlogPostBySlug(slug: string) {
  const rows = await getBlogPosts();
  return rows.find((item) => item.slug === slug) ?? null;
}
