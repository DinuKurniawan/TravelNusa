import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL || "admin@travelnusa.test";
const adminPassword = process.env.ADMIN_PASSWORD || "AdminTravel#2026";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const images = {
  bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=80",
  lombok: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1600&q=80",
  bajo: "https://images.unsplash.com/photo-1601058497548-f247dfe349d6?auto=format&fit=crop&w=1600&q=80",
  jogja: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1600&q=80",
  raja: "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=1600&q=80",
  bromo: "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?auto=format&fit=crop&w=1600&q=80",
};

const categories = [
  ["11111111-1111-4111-8111-111111111111", "Pantai", "pantai", "Waves"],
  ["22222222-2222-4222-8222-222222222222", "Gunung", "gunung", "Mountain"],
  ["33333333-3333-4333-8333-333333333333", "Budaya", "budaya", "Landmark"],
  ["44444444-4444-4444-8444-444444444444", "Alam", "alam", "Trees"],
  ["55555555-5555-4555-8555-555555555555", "Keluarga", "keluarga", "Users"],
  ["66666666-6666-4666-8666-666666666666", "Honeymoon", "honeymoon", "Heart"],
  ["77777777-7777-4777-8777-777777777777", "Adventure", "adventure", "Compass"],
  ["88888888-8888-4888-8888-888888888888", "City Tour", "city-tour", "Building2"],
].map(([id, name, slug, icon]) => ({
  id,
  name,
  slug,
  icon,
  type: ["Keluarga", "Honeymoon", "Adventure", "City Tour"].includes(name) ? "package" : "destination",
  description: `${name} TravelNusa Indonesia`,
}));

const destinations = [
  ["aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa", "Bali", "bali", "Bali", "Denpasar", "pantai", images.bali],
  ["bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb", "Lombok", "lombok", "Nusa Tenggara Barat", "Lombok", "pantai", images.lombok],
  ["cccccccc-3333-4333-8333-cccccccccccc", "Labuan Bajo", "labuan-bajo", "Nusa Tenggara Timur", "Manggarai Barat", "adventure", images.bajo],
  ["dddddddd-4444-4444-8444-dddddddddddd", "Yogyakarta", "yogyakarta", "DI Yogyakarta", "Yogyakarta", "budaya", images.jogja],
  ["eeeeeeee-5555-4555-8555-eeeeeeeeeeee", "Raja Ampat", "raja-ampat", "Papua Barat Daya", "Raja Ampat", "alam", images.raja],
  ["ffffffff-6666-4666-8666-ffffffffffff", "Bromo", "bromo", "Jawa Timur", "Probolinggo", "gunung", images.bromo],
].map(([id, name, slug, province, city, categorySlug, image]) => ({
  id,
  name,
  slug,
  province,
  city,
  address: `${city}, ${province}`,
  category_id: categories.find((item) => item.slug === categorySlug)?.id,
  description: `${name} adalah destinasi populer Indonesia dengan pengalaman lokal, panorama ikonik, dan itinerary yang nyaman bersama TravelNusa.`,
  facilities: ["Transport AC", "Guide lokal", "Tiket wisata", "Dokumentasi"],
  main_image_url: image,
  gallery_urls: [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=80",
  ],
  is_featured: true,
  status: "published",
}));

const packages = [
  ["90000000-1111-4111-8111-000000000001", "Paket Liburan Bali 3 Hari 2 Malam", "paket-liburan-bali-3-hari-2-malam", "bali", 2500000, 2199000, 3, 2, 20],
  ["90000000-2222-4222-8222-000000000002", "Paket Honeymoon Lombok 4 Hari 3 Malam", "paket-honeymoon-lombok-4-hari-3-malam", "lombok", 4200000, 3799000, 4, 3, 12],
  ["90000000-3333-4333-8333-000000000003", "Paket Sailing Komodo Labuan Bajo 3 Hari 2 Malam", "paket-sailing-komodo-labuan-bajo-3-hari-2-malam", "labuan-bajo", 5500000, 4999000, 3, 2, 10],
  ["90000000-4444-4444-8444-000000000004", "Paket Wisata Budaya Yogyakarta 2 Hari 1 Malam", "paket-wisata-budaya-yogyakarta-2-hari-1-malam", "yogyakarta", 1500000, 1299000, 2, 1, 25],
  ["90000000-5555-4555-8555-000000000005", "Paket Explore Raja Ampat 5 Hari 4 Malam", "paket-explore-raja-ampat-5-hari-4-malam", "raja-ampat", 9500000, 8999000, 5, 4, 8],
  ["90000000-6666-4666-8666-000000000006", "Paket Sunrise Bromo 2 Hari 1 Malam", "paket-sunrise-bromo-2-hari-1-malam", "bromo", 1200000, 999000, 2, 1, 30],
].map(([id, name, slug, destinationSlug, price, discountPrice, durationDays, durationNights, quota]) => {
  const destination = destinations.find((item) => item.slug === destinationSlug);
  return {
    id,
    name,
    slug,
    destination_id: destination?.id,
    short_description: `Paket ${destination?.name} terkurasi dengan rute efisien dan admin responsif.`,
    description: `Nikmati ${destination?.name} bersama TravelNusa melalui paket lengkap yang mencakup transport, penginapan, guide, dan itinerary fleksibel.`,
    price,
    discount_price: discountPrice,
    duration_days: durationDays,
    duration_nights: durationNights,
    quota,
    included: ["Akomodasi", "Transport lokal", "Guide", "Tiket wisata", "Sarapan"],
    excluded: ["Tiket pesawat", "Pengeluaran pribadi", "Aktivitas opsional"],
    main_image_url: destination?.main_image_url,
    gallery_urls: destination?.gallery_urls,
    rating: 4.8,
    total_reviews: 80,
    is_featured: true,
    status: "published",
  };
});

async function upsertOrThrow(
  table: string,
  payload: Record<string, unknown> | Record<string, unknown>[],
  onConflict?: string,
) {
  const { error } = await supabase.from(table).upsert(payload, onConflict ? { onConflict } : undefined);
  if (error) throw new Error(`${table}: ${error.message}`);
}

async function createBuckets() {
  const buckets = [
    { name: "destinations", public: true },
    { name: "packages", public: true },
    { name: "gallery", public: true },
    { name: "blog", public: true },
    { name: "avatars", public: true },
    { name: "tickets", public: false },
  ];

  for (const bucket of buckets) {
    const { error } = await supabase.storage.createBucket(bucket.name, { public: bucket.public });
    if (error && !error.message.toLowerCase().includes("already exists")) {
      throw error;
    }
    await supabase.storage.updateBucket(bucket.name, { public: bucket.public });
  }
}

async function createAdminUser() {
  const created = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      full_name: "Admin TravelNusa",
      role: "admin",
    },
  });

  let user = created.data.user;
  if (created.error) {
    const listed = await supabase.auth.admin.listUsers();
    user = listed.data.users.find((item) => item.email === adminEmail) ?? null;
    if (!user) throw created.error;
  }

  await upsertOrThrow("profiles", {
    id: user!.id,
    full_name: "Admin TravelNusa",
    role: "admin",
    status: "active",
  });
}

async function main() {
  console.log("Seeding TravelNusa Indonesia...");
  await createBuckets();
  await createAdminUser();

  await upsertOrThrow("site_settings", {
    id: "99000000-1111-4111-8111-000000000001",
    site_name: "TravelNusa Indonesia",
    email: "info@travelnusa.id",
    phone: "+62 812-3456-7890",
    whatsapp: "+62 812-3456-7890",
    address: "Jakarta, Indonesia",
    instagram_url: "https://instagram.com/travelnusa",
    facebook_url: "https://facebook.com/travelnusa",
    tiktok_url: "https://tiktok.com/@travelnusa",
    meta_title: "TravelNusa Indonesia - Jelajahi Keindahan Nusantara",
    meta_description:
      "Platform travel Indonesia untuk booking paket wisata terbaik ke Bali, Lombok, Labuan Bajo, Yogyakarta, Raja Ampat, dan destinasi populer lainnya.",
  });

  await upsertOrThrow("categories", categories, "slug");
  await upsertOrThrow("destinations", destinations, "slug");
  await upsertOrThrow("travel_packages", packages, "slug");

  const itineraries = packages.flatMap((item) =>
    Array.from({ length: Number(item.duration_days) }).map((_, index) => ({
      package_id: item.id,
      day_number: index + 1,
      title: index === 0 ? "Kedatangan dan eksplorasi awal" : index + 1 === Number(item.duration_days) ? "Wisata penutup dan kepulangan" : `Eksplorasi hari ${index + 1}`,
      description: "Perjalanan mengikuti itinerary terkurasi TravelNusa dengan rute utama, kuliner lokal, dan waktu istirahat yang cukup.",
      location: destinations.find((destination) => destination.id === item.destination_id)?.name,
      time: index === 0 ? "13:00" : "08:00",
    })),
  );
  await upsertOrThrow("package_itineraries", itineraries, "package_id,day_number");

  await upsertOrThrow("testimonials", [
    { id: "71000000-1111-4111-8111-000000000001", customer_name: "Andi Saputra", rating: 5, content: "Timnya rapi, responsif, dan itinerary Bali terasa pas untuk keluarga.", status: "published" },
    { id: "71000000-2222-4222-8222-000000000002", customer_name: "Siti Rahma", rating: 5, content: "Honeymoon Lombok sangat berkesan. Hotel dan sunset dinner-nya cantik.", status: "published" },
    { id: "71000000-3333-4333-8333-000000000003", customer_name: "Michael Tan", rating: 4, content: "Sailing Komodo nyaman, crew kapal ramah, dan jadwalnya efisien.", status: "published" },
    { id: "71000000-4444-4444-8444-000000000004", customer_name: "Dewi Lestari", rating: 5, content: "Booking mudah, admin cepat bantu, cocok untuk trip kantor.", status: "published" },
  ]);

  await upsertOrThrow(
    "blog_posts",
    [
      ["81000000-1111-4111-8111-000000000001", "7 Destinasi Wisata Indonesia yang Wajib Dikunjungi", "7-destinasi-wisata-indonesia-yang-wajib-dikunjungi", images.bali, "Inspirasi"],
      ["81000000-2222-4222-8222-000000000002", "Tips Liburan Hemat ke Bali", "tips-liburan-hemat-ke-bali", images.bali, "Tips"],
      ["81000000-3333-4333-8333-000000000003", "Panduan Sailing Trip Labuan Bajo", "panduan-sailing-trip-labuan-bajo", images.bajo, "Panduan"],
      ["81000000-4444-4444-8444-000000000004", "Rekomendasi Honeymoon Romantis di Lombok", "rekomendasi-honeymoon-romantis-di-lombok", images.lombok, "Honeymoon"],
    ].map(([id, title, slug, cover, category]) => ({
      id,
      title,
      slug,
      excerpt: `${title} bersama TravelNusa Indonesia.`,
      content: `${title}\n\nArtikel ini membantu Anda merencanakan perjalanan Indonesia dengan rute efisien, estimasi waktu yang realistis, dan tips praktis sebelum berangkat.`,
      cover_image_url: cover,
      category,
      status: "published",
      seo_title: title,
      seo_description: `${title} - TravelNusa Indonesia`,
      published_at: new Date().toISOString(),
    })),
    "slug",
  );

  await upsertOrThrow(
    "gallery",
    destinations.flatMap((destination, index) => [
      { id: `72000000-${String(index + 1).padStart(4, "0")}-4111-8111-000000000001`, title: `${destination.name} - Lanskap utama`, image_url: destination.main_image_url, category: "Wisata", status: "published" },
      { id: `72000000-${String(index + 1).padStart(4, "0")}-4111-8111-000000000002`, title: `${destination.name} - Momen perjalanan`, image_url: destination.gallery_urls[0], category: "Wisata", status: "published" },
    ]),
  );

  console.log("Seed selesai.");
  console.warn("PERINGATAN: Admin default hanya untuk development. Ganti password sebelum production.");
  console.log(`Admin email: ${adminEmail}`);
  console.log(`Admin password: ${adminPassword}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
