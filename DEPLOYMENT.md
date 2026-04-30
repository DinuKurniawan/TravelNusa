# TravelNusa Indonesia - Production Deployment Guide

Panduan ini menyiapkan deployment production TravelNusa Indonesia ke Vercel dengan Supabase Cloud, Supabase Auth/Storage, Midtrans Snap, QR ticket, PDF ticket, dashboard admin, dan dashboard customer.

## 1. Checklist Sebelum Deploy

Pastikan struktur minimal tersedia:

```text
src/
  app/
  components/
  lib/
  actions/
  types/
supabase/
  migrations/
scripts/
  seed.ts
public/
.env.example
.env.production.example
package.json
next.config.ts
src/proxy.ts
README.md
```

Catatan Next.js 16: project ini menggunakan `src/proxy.ts`, bukan `middleware.ts`. Mulai Next.js 16, `next lint` sudah dihapus, jadi lint production memakai ESLint CLI: `npm run lint`.

Sebelum push ke GitHub:

```bash
npm install
npm run type-check
npm run lint
npm run build
```

Jangan commit file rahasia:

```text
.env
.env.local
.env.production
.env*.local
.vercel
```

Validasi cepat:

```bash
git status --ignored --short
git ls-files .env .env.local .env.production
```

Output `git ls-files` untuk file rahasia harus kosong.

## 2. Environment Variables Production

Masukkan semua variable berikut di Vercel Project Settings > Environment Variables > Production.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

MIDTRANS_SERVER_KEY=
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=true

NEXT_PUBLIC_SITE_URL=https://domain-production.vercel.app

ADMIN_EMAIL=admin@travelnusa.test
ADMIN_PASSWORD=AdminTravel#2026
```

Aturan keamanan:

```text
NEXT_PUBLIC_SUPABASE_URL            boleh dipakai client
NEXT_PUBLIC_SUPABASE_ANON_KEY       boleh dipakai client
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY     boleh dipakai client
SUPABASE_SERVICE_ROLE_KEY           server/script only
MIDTRANS_SERVER_KEY                 server only
```

Jangan pernah memakai `SUPABASE_SERVICE_ROLE_KEY` atau `MIDTRANS_SERVER_KEY` di Client Component, file dengan `"use client"`, atau kode yang dikirim ke browser.

## 3. Package Scripts

Script production yang dipakai:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "seed": "tsx scripts/seed.ts",
    "type-check": "tsc --noEmit",
    "typecheck": "npm run type-check"
  }
}
```

Dependency production penting sudah harus tersedia:

```text
@supabase/ssr
@supabase/supabase-js
midtrans-client
qrcode
zod
react-hook-form
lucide-react
date-fns
clsx
tailwind-merge
```

Dependency development penting:

```text
tsx
typescript
eslint
eslint-config-next
```

## 4. Next.js Production Config

`next.config.ts` harus mengizinkan image dari Supabase Storage public bucket:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
```

Project ini juga masih mengizinkan `images.unsplash.com` dan `plus.unsplash.com` untuk fallback/mock content. Hapus keduanya setelah semua image production dipindahkan ke Supabase Storage.

## 5. Supabase Production

1. Buat project Supabase production.
2. Simpan `Project URL` ke `NEXT_PUBLIC_SUPABASE_URL`.
3. Simpan `anon public key` ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Simpan `service_role key` ke `SUPABASE_SERVICE_ROLE_KEY`; gunakan hanya di server dan seed script.
5. Jalankan SQL berurutan:

```text
supabase/schema.sql
supabase/functions.sql
supabase/policies.sql
supabase/booking-payment-ticket.sql
```

6. Pastikan Row Level Security aktif untuk tabel publik, booking, payment, ticket, profile, dan tabel admin.
7. Pastikan storage bucket tersedia:

```text
destinations  public
packages      public
gallery       public
blog          public
avatars       public
tickets       private
```

8. Pastikan policy:

```text
Public hanya membaca data published.
Customer hanya membaca data miliknya.
Admin bisa mengelola data.
Payment dan ticket hanya diubah lewat server/service role.
Ticket private dan hanya printable setelah paid.
```

9. Jalankan seed dari mesin lokal yang aman:

```bash
npm run seed
```

Setelah seed production, ganti password admin default, update site settings, nomor WhatsApp, logo, konten, destinasi, paket, dan harga.

## 6. Supabase Auth URL Configuration

Di Supabase Dashboard > Authentication > URL Configuration:

```text
Site URL:
https://domain-production.vercel.app

Redirect URLs:
https://domain-production.vercel.app/**
http://localhost:3000/**
```

Jika menggunakan custom domain, tambahkan:

```text
https://namadomain.com/**
https://www.namadomain.com/**
```

Tes login, register, reset password, dan OAuth redirect setelah production URL final tersedia.

## 7. Midtrans Production

Di Vercel:

```bash
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_SERVER_KEY=<production-server-key>
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=<production-client-key>
```

Jangan gunakan sandbox key untuk production.

Di Midtrans Dashboard production:

```text
Payment Notification URL:
https://domain-production.vercel.app/api/payments/notification

Finish Redirect URL:
https://domain-production.vercel.app/payment/success

Unfinish Redirect URL:
https://domain-production.vercel.app/payment/pending

Error Redirect URL:
https://domain-production.vercel.app/payment/failed
```

Webhook wajib melalui:

```text
POST /api/payments/notification
```

Alur webhook production:

```text
Terima payload Midtrans.
Verifikasi signature key.
Cek status transaksi ke Midtrans status API.
Update tabel payments.
Update tabel bookings.
Generate ticket jika status settlement/capture valid.
Simpan payment_logs.
```

Callback frontend bukan sumber kebenaran status pembayaran. Status valid hanya dari webhook atau status API Midtrans.

## 8. Deploy Via Vercel Dashboard

1. Push project ke GitHub.
2. Buka Vercel Dashboard.
3. Klik Add New Project.
4. Import repository TravelNusa.
5. Framework preset: Next.js.
6. Root directory: `./`.
7. Install command: `npm install`.
8. Build command: `npm run build`.
9. Output directory: kosongkan/default.
10. Masukkan semua Production Environment Variables.
11. Klik Deploy.
12. Setelah URL production keluar, update `NEXT_PUBLIC_SITE_URL` menjadi URL tersebut.
13. Redeploy production.

## 9. Deploy Via Vercel CLI

Login:

```bash
npx vercel login
```

Link project:

```bash
npx vercel link
```

Tambahkan env production:

```bash
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
npx vercel env add SUPABASE_SERVICE_ROLE_KEY production
npx vercel env add MIDTRANS_SERVER_KEY production
npx vercel env add NEXT_PUBLIC_MIDTRANS_CLIENT_KEY production
npx vercel env add MIDTRANS_IS_PRODUCTION production
npx vercel env add NEXT_PUBLIC_SITE_URL production
npx vercel env add ADMIN_EMAIL production
npx vercel env add ADMIN_PASSWORD production
```

Preview deploy:

```bash
npx vercel
```

Production deploy:

```bash
npx vercel --prod
```

Untuk CI/CD yang lebih deterministic:

```bash
npx vercel pull --yes --environment=production
npx vercel build --prod
npx vercel deploy --prebuilt --prod
```

## 10. Push Ke GitHub

Jika repo belum diinisialisasi:

```bash
git init
git add .
git commit -m "Initial TravelNusa production deploy"
git branch -M main
git remote add origin https://github.com/username/travelnusa.git
git push -u origin main
```

Jika repo sudah ada, cukup:

```bash
git status
git add .
git commit -m "Prepare production deployment"
git push
```

Pastikan `.env`, `.env.local`, `.env.production`, `.vercel`, dan service key tidak muncul di commit.

## 11. Custom Domain

1. Masuk ke Vercel Project > Settings > Domains.
2. Tambahkan:

```text
namadomain.com
www.namadomain.com
```

3. Ikuti instruksi DNS dari Vercel.
4. Tunggu DNS aktif.
5. Update Vercel env:

```bash
NEXT_PUBLIC_SITE_URL=https://namadomain.com
```

6. Update Supabase Auth:

```text
Site URL:
https://namadomain.com

Redirect URLs:
https://namadomain.com/**
https://www.namadomain.com/**
http://localhost:3000/**
```

7. Update Midtrans:

```text
Payment Notification URL:
https://namadomain.com/api/payments/notification
```

8. Redeploy Vercel.

## 12. Testing Setelah Deploy

Gunakan checklist ini dari URL production:

```text
Homepage terbuka.
Halaman destinasi terbuka.
Halaman paket terbuka.
Detail paket terbuka.
Register customer berhasil.
Login customer berhasil.
Booking paket berhasil.
Snap popup Midtrans muncul.
Pembayaran test/real diproses sesuai environment.
Webhook Midtrans masuk.
Tabel payments ter-update.
Tabel bookings berubah paid setelah settlement/capture.
Ticket dibuat.
Halaman ticket terbuka.
PDF ticket bisa di-download.
Login admin berhasil.
Dashboard admin terbuka.
CRUD destinasi berhasil.
CRUD paket berhasil.
Upload image ke Supabase Storage berhasil.
Dashboard customer menampilkan booking sendiri.
Logout berhasil.
Mobile responsive aman.
```

Untuk payment, cek juga bahwa nominal dihitung dari database di server, bukan dari payload frontend.

## 13. Logs Dan Monitoring

Vercel Dashboard:

```text
Project > Deployments > pilih deployment > Build Logs
Project > Logs > filter Function/API errors
```

Vercel CLI:

```bash
npx vercel inspect <deployment-url>
npx vercel logs <deployment-url>
npx vercel logs <deployment-url> --since 1h --level error
npx vercel logs <deployment-url> --follow
```

Supabase:

```text
Logs > API
Logs > Postgres
Logs > Auth
Table Editor > payment_logs
Storage > bucket policies
```

Midtrans:

```text
Transaction Logs
Webhook/Notification History
Order ID detail
Fraud status
Settlement/capture status
```

## 14. Error Umum Dan Perbaikan

Missing environment variable:

```text
Cek semua env di Vercel Production.
Redeploy setelah env ditambahkan.
Pull env lokal dengan npx vercel env pull .env.local jika perlu debugging.
```

Supabase Auth redirect error:

```text
Update Site URL dan Redirect URLs di Supabase Auth.
Pastikan NEXT_PUBLIC_SITE_URL sama dengan domain production.
```

Midtrans popup gagal:

```text
Cek NEXT_PUBLIC_MIDTRANS_CLIENT_KEY.
Cek MIDTRANS_IS_PRODUCTION=true.
Cek Snap script production yang dipakai.
Cek domain production di dashboard Midtrans.
```

Webhook Midtrans tidak masuk:

```text
Cek Payment Notification URL.
Cek endpoint POST /api/payments/notification.
Cek Vercel Function Logs.
Cek signature key dan production server key.
```

Payment berhasil tapi ticket tidak dibuat:

```text
Cek payment_logs.
Cek status settlement/capture.
Cek applyMidtransStatusToPayment.
Cek SUPABASE_SERVICE_ROLE_KEY.
Cek RLS dan trigger ticket.
```

Upload gambar gagal:

```text
Cek bucket Supabase.
Cek policy storage.objects.
Cek file size.
Cek MIME type.
Cek role admin aktif.
```

Admin tidak bisa akses dashboard:

```text
Cek profile role = admin.
Cek profile status = active.
Cek src/proxy.ts.
Cek requireAdmin() di server.
```

Image Supabase tidak muncul:

```text
Cek next.config.ts remotePatterns.
Cek bucket public read policy.
Cek image_url memakai /storage/v1/object/public/.
Cek file memang ada di bucket.
```

## 15. Security Production

Checklist wajib:

```text
SUPABASE_SERVICE_ROLE_KEY tidak ada di client bundle.
MIDTRANS_SERVER_KEY tidak ada di client bundle.
Admin route dilindungi proxy dan divalidasi ulang di server.
API admin validasi role admin di server.
Payment amount dihitung dari database.
Webhook Midtrans verifikasi signature.
RLS Supabase aktif.
Customer hanya akses booking miliknya.
Ticket hanya muncul setelah paid.
Password admin default diganti.
.env.local dan .env.production tidak di-commit.
CORS, callback URL, dan redirect URL sesuai domain production.
```

Setelah production stabil, aktifkan monitoring rutin untuk Vercel logs, Supabase logs, Midtrans transaction logs, dan payment_logs di dashboard admin.
