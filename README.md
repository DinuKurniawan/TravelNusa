# TravelNusa Indonesia

Website travel Indonesia berbasis Next.js App Router untuk destinasi, paket perjalanan, galeri, artikel, testimoni, booking customer, dan dashboard admin.

## Tech Stack

- Next.js App Router, TypeScript, Tailwind CSS
- Supabase Database, Auth, Storage, SSR Client
- shadcn/ui, Lucide React, Sonner toast
- React Hook Form, Zod
- TanStack Table untuk tabel admin
- Recharts untuk statistik dashboard

## Install

```bash
npm install
```

## Setup Supabase

1. Buat project Supabase.
2. Buka SQL Editor dan jalankan berurutan:
   - `supabase/schema.sql`
   - `supabase/functions.sql`
   - `supabase/policies.sql`
   - opsional `supabase/seed.sql`
3. Storage bucket dibuat otomatis oleh `supabase/policies.sql` dan `npm run seed`.

## Environment Variables

Salin `.env.example` menjadi `.env.local`.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAIL=admin@travelnusa.test
ADMIN_PASSWORD=AdminTravel#2026
```

`NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` boleh dipakai client. `SUPABASE_SERVICE_ROLE_KEY` hanya untuk server/script dan tidak boleh diekspos ke browser. Jangan commit `.env.local`.

## Seeder

Seeder TypeScript membuat admin default, bucket storage, settings, kategori, destinasi, paket, itinerary, testimoni, blog, dan galeri.

```bash
npm run seed
```

Akun admin default:

- Email: `admin@travelnusa.test`
- Password: `AdminTravel#2026`

Ganti password admin setelah deployment production.

## Menjalankan Project

```bash
npm run dev
```

Buka `http://localhost:3000`.

Validasi build:

```bash
npm run lint
npm run typecheck
npm run build
```

## Struktur Folder

```text
src/
  app/                  Route publik, dashboard customer, admin
  actions/              Server actions auth, booking, admin CRUD
  components/
    admin/              Layout, tabel, chart, form admin
    forms/              Booking, contact, auth, profile forms
    public/             Header, footer, cards, galeri
    shared/             Provider dan logo
    ui/                 shadcn/ui components
  lib/
    data/               Data fetcher publik/admin + fallback demo
    supabase/           Client browser, server, admin
    validations/        Zod schemas
  types/                Domain dan database types
supabase/               Schema, functions, policies, seed SQL
scripts/seed.ts         Seeder default via service role
```

## Catatan Deployment Vercel

Set semua environment variables di Vercel Project Settings. Pastikan `SUPABASE_SERVICE_ROLE_KEY` hanya tersedia sebagai server-side env. Jalankan SQL di Supabase sebelum deploy, lalu jalankan seeder dari mesin lokal atau CI yang aman. Public pages memiliki fallback demo data ketika Supabase belum dikonfigurasi, tetapi booking, auth, dan admin membutuhkan env Supabase valid.
