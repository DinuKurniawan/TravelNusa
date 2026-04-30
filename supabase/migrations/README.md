# Supabase Migrations

TravelNusa currently keeps SQL migration files in the `supabase/` directory:

1. `supabase/schema.sql`
2. `supabase/functions.sql`
3. `supabase/policies.sql`
4. `supabase/booking-payment-ticket.sql`
5. Optional seed data: `supabase/seed.sql`

For production, apply the files in that order from the Supabase SQL Editor or convert them into timestamped Supabase CLI migrations before running `supabase db push`.
