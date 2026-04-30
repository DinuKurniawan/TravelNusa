alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.destinations enable row level security;
alter table public.travel_packages enable row level security;
alter table public.package_itineraries enable row level security;
alter table public.bookings enable row level security;
alter table public.testimonials enable row level security;
alter table public.gallery enable row level security;
alter table public.blog_posts enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = 'customer');

drop policy if exists "profiles_admin_select" on public.profiles;
create policy "profiles_admin_select" on public.profiles
  for select to authenticated
  using (public.is_admin());

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select to anon, authenticated
  using (true);

drop policy if exists "categories_admin_all" on public.categories;
create policy "categories_admin_all" on public.categories
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "destinations_public_published" on public.destinations;
create policy "destinations_public_published" on public.destinations
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists "destinations_admin_all" on public.destinations;
create policy "destinations_admin_all" on public.destinations
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "packages_public_published" on public.travel_packages;
create policy "packages_public_published" on public.travel_packages
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists "packages_admin_all" on public.travel_packages;
create policy "packages_admin_all" on public.travel_packages
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "itineraries_public_package_published" on public.package_itineraries;
create policy "itineraries_public_package_published" on public.package_itineraries
  for select to anon, authenticated
  using (
    exists (
      select 1
      from public.travel_packages p
      where p.id = package_id
        and p.status = 'published'
    )
  );

drop policy if exists "itineraries_admin_all" on public.package_itineraries;
create policy "itineraries_admin_all" on public.package_itineraries
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "bookings_customer_insert" on public.bookings;
create policy "bookings_customer_insert" on public.bookings
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

drop policy if exists "bookings_customer_select_own" on public.bookings;
create policy "bookings_customer_select_own" on public.bookings
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "bookings_admin_select" on public.bookings;
create policy "bookings_admin_select" on public.bookings
  for select to authenticated
  using (public.is_admin());

drop policy if exists "bookings_admin_update" on public.bookings;
create policy "bookings_admin_update" on public.bookings
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "testimonials_public_published" on public.testimonials;
create policy "testimonials_public_published" on public.testimonials
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists "testimonials_admin_all" on public.testimonials;
create policy "testimonials_admin_all" on public.testimonials
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "gallery_public_published" on public.gallery;
create policy "gallery_public_published" on public.gallery
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists "gallery_admin_all" on public.gallery;
create policy "gallery_admin_all" on public.gallery
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "blog_public_published" on public.blog_posts;
create policy "blog_public_published" on public.blog_posts
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists "blog_admin_all" on public.blog_posts;
create policy "blog_admin_all" on public.blog_posts
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "contact_public_insert" on public.contact_messages;
create policy "contact_public_insert" on public.contact_messages
  for insert to anon, authenticated
  with check (true);

drop policy if exists "contact_admin_all" on public.contact_messages;
create policy "contact_admin_all" on public.contact_messages
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read" on public.site_settings
  for select to anon, authenticated
  using (true);

drop policy if exists "settings_admin_update" on public.site_settings;
create policy "settings_admin_update" on public.site_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into storage.buckets (id, name, public)
values
  ('destinations', 'destinations', true),
  ('packages', 'packages', true),
  ('gallery', 'gallery', true),
  ('blog', 'blog', true),
  ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "storage_public_read_travelnusa" on storage.objects;
create policy "storage_public_read_travelnusa" on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('destinations', 'packages', 'gallery', 'blog', 'avatars'));

drop policy if exists "storage_admin_insert_travelnusa" on storage.objects;
create policy "storage_admin_insert_travelnusa" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('destinations', 'packages', 'gallery', 'blog', 'avatars')
    and public.is_admin()
  );

drop policy if exists "storage_admin_update_travelnusa" on storage.objects;
create policy "storage_admin_update_travelnusa" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('destinations', 'packages', 'gallery', 'blog', 'avatars')
    and public.is_admin()
  )
  with check (
    bucket_id in ('destinations', 'packages', 'gallery', 'blog', 'avatars')
    and public.is_admin()
  );

drop policy if exists "storage_admin_delete_travelnusa" on storage.objects;
create policy "storage_admin_delete_travelnusa" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('destinations', 'packages', 'gallery', 'blog', 'avatars')
    and public.is_admin()
  );

drop policy if exists "storage_user_avatar_upload_own" on storage.objects;
create policy "storage_user_avatar_upload_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "storage_user_avatar_update_own" on storage.objects;
create policy "storage_user_avatar_update_own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
