create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  province text not null,
  city text not null,
  address text,
  description text not null,
  facilities text[] not null default '{}',
  main_image_url text,
  gallery_urls text[] not null default '{}',
  latitude numeric,
  longitude numeric,
  is_featured boolean not null default false,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.travel_packages (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid references public.destinations(id) on delete set null,
  name text not null,
  slug text not null unique,
  short_description text,
  description text not null,
  price numeric not null check (price >= 0),
  discount_price numeric check (discount_price is null or discount_price >= 0),
  duration_days integer not null check (duration_days > 0),
  duration_nights integer not null default 0 check (duration_nights >= 0),
  quota integer not null check (quota >= 0),
  included text[] not null default '{}',
  excluded text[] not null default '{}',
  main_image_url text,
  gallery_urls text[] not null default '{}',
  rating numeric not null default 0 check (rating >= 0 and rating <= 5),
  total_reviews integer not null default 0 check (total_reviews >= 0),
  is_featured boolean not null default false,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.package_itineraries (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.travel_packages(id) on delete cascade,
  day_number integer not null check (day_number > 0),
  title text not null,
  description text not null,
  location text,
  time text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (package_id, day_number)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  package_id uuid references public.travel_packages(id) on delete set null,
  booking_code text unique,
  full_name text not null,
  email text not null,
  phone text not null,
  departure_date date not null,
  participant_count integer not null check (participant_count > 0),
  price_per_person numeric not null check (price_per_person >= 0),
  total_price numeric not null check (total_price >= 0),
  note text,
  admin_note text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'paid', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_photo_url text,
  rating integer not null check (rating between 1 and 5),
  content text not null,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  category text,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image_url text,
  category text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status text not null default 'unread' check (status in ('unread', 'read', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default 'TravelNusa Indonesia',
  logo_url text,
  email text,
  phone text,
  whatsapp text,
  address text,
  instagram_url text,
  facebook_url text,
  tiktok_url text,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_status on public.profiles(status);
create index if not exists idx_categories_slug on public.categories(slug);
create index if not exists idx_categories_type on public.categories(type);
create index if not exists idx_destinations_category_id on public.destinations(category_id);
create index if not exists idx_destinations_slug on public.destinations(slug);
create index if not exists idx_destinations_status on public.destinations(status);
create index if not exists idx_destinations_featured_published on public.destinations(is_featured) where status = 'published';
create index if not exists idx_destinations_location on public.destinations(province, city);
create index if not exists idx_travel_packages_destination_id on public.travel_packages(destination_id);
create index if not exists idx_travel_packages_slug on public.travel_packages(slug);
create index if not exists idx_travel_packages_price on public.travel_packages(price);
create index if not exists idx_travel_packages_featured_published on public.travel_packages(is_featured) where status = 'published';
create index if not exists idx_itineraries_package_day on public.package_itineraries(package_id, day_number);
create index if not exists idx_bookings_user_id on public.bookings(user_id);
create index if not exists idx_bookings_package_id on public.bookings(package_id);
create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_bookings_created_at on public.bookings(created_at desc);
create index if not exists idx_gallery_status_category on public.gallery(status, category);
create index if not exists idx_blog_posts_slug on public.blog_posts(slug);
create index if not exists idx_blog_posts_published on public.blog_posts(published_at desc) where status = 'published';
