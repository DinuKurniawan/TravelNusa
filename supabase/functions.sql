create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and status = 'active'
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'avatar_url',
    coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'customer')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function public.generate_booking_code()
returns text
language plpgsql
as $$
declare
  generated_code text;
begin
  loop
    generated_code := 'TN-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 8));
    exit when not exists (
      select 1 from public.bookings where booking_code = generated_code
    );
  end loop;

  return generated_code;
end;
$$;

create or replace function public.set_booking_code()
returns trigger
language plpgsql
as $$
begin
  if new.booking_code is null or length(trim(new.booking_code)) = 0 then
    new.booking_code := public.generate_booking_code();
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists set_booking_code_before_insert on public.bookings;
create trigger set_booking_code_before_insert
  before insert on public.bookings
  for each row execute function public.set_booking_code();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists set_destinations_updated_at on public.destinations;
create trigger set_destinations_updated_at before update on public.destinations
  for each row execute function public.set_updated_at();

drop trigger if exists set_travel_packages_updated_at on public.travel_packages;
create trigger set_travel_packages_updated_at before update on public.travel_packages
  for each row execute function public.set_updated_at();

drop trigger if exists set_package_itineraries_updated_at on public.package_itineraries;
create trigger set_package_itineraries_updated_at before update on public.package_itineraries
  for each row execute function public.set_updated_at();

drop trigger if exists set_bookings_updated_at on public.bookings;
create trigger set_bookings_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

drop trigger if exists set_testimonials_updated_at on public.testimonials;
create trigger set_testimonials_updated_at before update on public.testimonials
  for each row execute function public.set_updated_at();

drop trigger if exists set_gallery_updated_at on public.gallery;
create trigger set_gallery_updated_at before update on public.gallery
  for each row execute function public.set_updated_at();

drop trigger if exists set_blog_posts_updated_at on public.blog_posts;
create trigger set_blog_posts_updated_at before update on public.blog_posts
  for each row execute function public.set_updated_at();

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();
