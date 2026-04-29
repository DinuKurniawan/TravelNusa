insert into public.site_settings (
  site_name,
  email,
  phone,
  whatsapp,
  address,
  instagram_url,
  facebook_url,
  tiktok_url,
  meta_title,
  meta_description
)
values (
  'TravelNusa Indonesia',
  'info@travelnusa.id',
  '+62 812-3456-7890',
  '+62 812-3456-7890',
  'Jakarta, Indonesia',
  'https://instagram.com/travelnusa',
  'https://facebook.com/travelnusa',
  'https://tiktok.com/@travelnusa',
  'TravelNusa Indonesia - Jelajahi Keindahan Nusantara',
  'Platform travel Indonesia untuk booking paket wisata terbaik ke Bali, Lombok, Labuan Bajo, Yogyakarta, Raja Ampat, dan destinasi populer lainnya.'
)
on conflict do nothing;
