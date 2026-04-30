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
   - `supabase/booking-payment-ticket.sql`
   - opsional `supabase/seed.sql`
3. Storage bucket dibuat otomatis oleh `supabase/policies.sql` dan `npm run seed`.

## Environment Variables

Salin `.env.example` menjadi `.env.local`.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
MIDTRANS_SERVER_KEY=
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAIL=admin@travelnusa.test
ADMIN_PASSWORD=AdminTravel#2026
```

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dan `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` boleh dipakai client. `SUPABASE_SERVICE_ROLE_KEY` dan `MIDTRANS_SERVER_KEY` hanya untuk server/script dan tidak boleh diekspos ke browser. Jangan commit `.env.local`.

## Setup Midtrans Sandbox

1. Masuk ke Midtrans Dashboard sandbox.
2. Ambil `Server Key` dan isi ke `MIDTRANS_SERVER_KEY`.
3. Ambil `Client Key` dan isi ke `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`.
4. Pastikan `MIDTRANS_IS_PRODUCTION=false` selama development.
5. Set Payment Notification URL di dashboard Midtrans:

```text
http://localhost:3000/api/payments/notification
```

Untuk testing webhook dari internet, gunakan tunnel HTTPS seperti ngrok dan ganti URL notification menjadi:

```text
https://<subdomain-ngrok>/api/payments/notification
```

Gunakan production key hanya saat aplikasi live, lalu ubah `MIDTRANS_IS_PRODUCTION=true` di environment production. Semua request Snap token dan status transaksi dilakukan di server melalui `midtrans-client`; client hanya menerima `snap_token`.

## Alur Booking, Payment, dan Tiket

1. Customer login, membuka `/paket/[slug]`, lalu klik `Booking Sekarang`.
2. Form `/booking/[packageSlug]` menyimpan booking sebagai `pending_payment`.
3. Halaman `/payment/[bookingCode]` meminta Snap token lewat `POST /api/payments/create`.
4. Midtrans mengirim webhook ke `POST /api/payments/notification`.
5. Server memverifikasi signature, mengecek status transaksi ke Midtrans, mengupdate `payments` dan `bookings`, lalu membuat `tickets` jika status `settlement` atau `capture`.
6. Customer dapat membuka `/ticket/[bookingCode]` dan download PDF lewat `/api/tickets/[bookingCode]/pdf`.

Admin dapat mengelola booking di `/admin/bookings` dan pembayaran di `/admin/payments`.

## Seeder

Seeder TypeScript membuat admin default, bucket storage, settings, kategori, destinasi, paket, itinerary, testimoni, blog, dan galeri.

```bash
npm run seed
```

Akun admin default:

- Email: `admin@travelnusa.test`
- Password: `AdminTravel#2026`

Jika `ADMIN_EMAIL` atau `ADMIN_PASSWORD` di environment diubah, jalankan ulang `npm run seed`.
Seeder akan menyamakan password akun admin yang sudah ada dengan nilai `ADMIN_PASSWORD`.

Ganti password admin setelah deployment production.

## Menjalankan Project

```bash
npm run dev
```

Buka `http://localhost:3000`.

Validasi build:

```bash
npm run lint
npm run type-check
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

Panduan production lengkap tersedia di [`DEPLOYMENT.md`](DEPLOYMENT.md).

Set semua environment variables di Vercel Project Settings. Pastikan `SUPABASE_SERVICE_ROLE_KEY` hanya tersedia sebagai server-side env. Jalankan SQL di Supabase sebelum deploy, lalu jalankan seeder dari mesin lokal atau CI yang aman. Public pages memiliki fallback demo data ketika Supabase belum dikonfigurasi, tetapi booking, auth, dan admin membutuhkan env Supabase valid.
