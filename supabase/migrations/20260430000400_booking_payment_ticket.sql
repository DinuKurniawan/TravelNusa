create extension if not exists "pgcrypto";

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
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
    where id = (select auth.uid())
      and role = 'admin'
      and status = 'active'
  );
$$;

create or replace function public.generate_booking_code()
returns text
language plpgsql
set search_path = public
as $$
declare
  generated_code text;
begin
  loop
    generated_code := 'TRV-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(encode(gen_random_bytes(4), 'base64'), '/', 'X'), 1, 5));
    exit when not exists (
      select 1 from public.bookings where booking_code = generated_code
    );
  end loop;

  return generated_code;
end;
$$;

create or replace function public.generate_ticket_code()
returns text
language plpgsql
set search_path = public
as $$
declare
  generated_code text;
begin
  loop
    generated_code := 'TKT-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(encode(gen_random_bytes(4), 'base64'), '/', 'X'), 1, 5));
    exit when not exists (
      select 1 from public.tickets where ticket_code = generated_code
    );
  end loop;

  return generated_code;
end;
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'bookings'
      and column_name = 'status'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'bookings'
      and column_name = 'booking_status'
  ) then
    alter table public.bookings rename column status to booking_status;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'bookings'
      and column_name = 'booking_status'
  ) then
    alter table public.bookings add column booking_status text;
  end if;
end;
$$;

alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings drop constraint if exists bookings_booking_status_check;

update public.bookings
set booking_status = case booking_status
  when 'pending' then 'pending_payment'
  when 'confirmed' then 'confirmed'
  when 'paid' then 'paid'
  when 'completed' then 'completed'
  when 'cancelled' then 'cancelled'
  when 'expired' then 'expired'
  else 'pending_payment'
end
where booking_status is null
   or booking_status not in ('pending_payment', 'paid', 'confirmed', 'completed', 'cancelled', 'expired');

update public.bookings
set booking_code = public.generate_booking_code()
where booking_code is null or length(trim(booking_code)) = 0;

alter table public.bookings
  alter column booking_code set not null,
  alter column booking_status set default 'pending_payment',
  alter column booking_status set not null;

alter table public.bookings
  add constraint bookings_booking_status_check
  check (booking_status in ('pending_payment', 'paid', 'confirmed', 'completed', 'cancelled', 'expired'));

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  order_id text not null unique,
  snap_token text,
  snap_redirect_url text,
  payment_type text,
  transaction_id text,
  transaction_status text not null default 'pending',
  fraud_status text,
  gross_amount numeric not null check (gross_amount >= 0),
  currency text not null default 'IDR',
  payment_status text not null default 'pending' check (payment_status in ('pending', 'settlement', 'capture', 'expire', 'cancel', 'deny', 'failure', 'refund')),
  raw_response jsonb,
  paid_at timestamptz,
  expired_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  ticket_code text not null unique,
  qr_code_url text,
  pdf_url text,
  ticket_status text not null default 'active' check (ticket_status in ('active', 'used', 'cancelled')),
  issued_at timestamptz not null default now(),
  used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (booking_id)
);

create table if not exists public.payment_logs (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  order_id text,
  event_type text,
  transaction_status text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_bookings_booking_status on public.bookings(booking_status);
create index if not exists idx_bookings_booking_code on public.bookings(booking_code);
create index if not exists idx_bookings_departure_date on public.bookings(departure_date);
create index if not exists idx_payments_booking_id on public.payments(booking_id);
create index if not exists idx_payments_order_id on public.payments(order_id);
create index if not exists idx_payments_payment_status on public.payments(payment_status);
create index if not exists idx_payments_paid_at on public.payments(paid_at desc);
create index if not exists idx_tickets_booking_id on public.tickets(booking_id);
create index if not exists idx_tickets_ticket_code on public.tickets(ticket_code);
create index if not exists idx_payment_logs_payment_id on public.payment_logs(payment_id);
create index if not exists idx_payment_logs_order_id on public.payment_logs(order_id);

create or replace function public.set_booking_code()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.booking_code is null or length(trim(new.booking_code)) = 0 then
    new.booking_code := public.generate_booking_code();
  end if;

  return new;
end;
$$;

create or replace function public.set_ticket_code()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.ticket_code is null or length(trim(new.ticket_code)) = 0 then
    new.ticket_code := public.generate_ticket_code();
  end if;

  return new;
end;
$$;

create or replace function public.issue_ticket_after_paid_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.booking_status = 'paid'
    and exists (
      select 1
      from public.payments p
      where p.booking_id = new.id
        and p.payment_status in ('settlement', 'capture')
    )
    and not exists (
      select 1
      from public.tickets t
      where t.booking_id = new.id
    ) then
    insert into public.tickets (booking_id)
    values (new.id);
  end if;

  return new;
end;
$$;

drop trigger if exists set_booking_code_before_insert on public.bookings;
create trigger set_booking_code_before_insert
  before insert on public.bookings
  for each row execute function public.set_booking_code();

drop trigger if exists set_ticket_code_before_insert on public.tickets;
create trigger set_ticket_code_before_insert
  before insert on public.tickets
  for each row execute function public.set_ticket_code();

drop trigger if exists issue_ticket_after_paid_booking on public.bookings;
create trigger issue_ticket_after_paid_booking
  after insert or update of booking_status on public.bookings
  for each row execute function public.issue_ticket_after_paid_booking();

drop trigger if exists set_bookings_updated_at on public.bookings;
create trigger set_bookings_updated_at
  before update on public.bookings
  for each row execute function public.update_updated_at_column();

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
  before update on public.payments
  for each row execute function public.update_updated_at_column();

drop trigger if exists set_tickets_updated_at on public.tickets;
create trigger set_tickets_updated_at
  before update on public.tickets
  for each row execute function public.update_updated_at_column();

alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.tickets enable row level security;
alter table public.payment_logs enable row level security;

drop policy if exists "bookings_customer_insert" on public.bookings;
create policy "bookings_customer_insert" on public.bookings
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "bookings_customer_select_own" on public.bookings;
create policy "bookings_customer_select_own" on public.bookings
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "bookings_admin_select" on public.bookings;
create policy "bookings_admin_select" on public.bookings
  for select to authenticated
  using (public.is_admin());

drop policy if exists "bookings_admin_update" on public.bookings;
create policy "bookings_admin_update" on public.bookings
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "bookings_admin_delete" on public.bookings;
create policy "bookings_admin_delete" on public.bookings
  for delete to authenticated
  using (public.is_admin());

drop policy if exists "payments_customer_select_own" on public.payments;
create policy "payments_customer_select_own" on public.payments
  for select to authenticated
  using (
    exists (
      select 1
      from public.bookings b
      where b.id = booking_id
        and b.user_id = (select auth.uid())
    )
  );

drop policy if exists "payments_admin_all" on public.payments;
create policy "payments_admin_all" on public.payments
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "tickets_customer_select_own" on public.tickets;
create policy "tickets_customer_select_own" on public.tickets
  for select to authenticated
  using (
    exists (
      select 1
      from public.bookings b
      where b.id = booking_id
        and b.user_id = (select auth.uid())
        and b.booking_status in ('paid', 'confirmed', 'completed')
    )
  );

drop policy if exists "tickets_admin_all" on public.tickets;
create policy "tickets_admin_all" on public.tickets
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "payment_logs_admin_read" on public.payment_logs;
create policy "payment_logs_admin_read" on public.payment_logs
  for select to authenticated
  using (public.is_admin());

insert into storage.buckets (id, name, public)
values ('tickets', 'tickets', false)
on conflict (id) do update set public = excluded.public;

drop policy if exists "storage_admin_tickets_all" on storage.objects;
create policy "storage_admin_tickets_all" on storage.objects
  for all to authenticated
  using (bucket_id = 'tickets' and public.is_admin())
  with check (bucket_id = 'tickets' and public.is_admin());
