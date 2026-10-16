-- Tilet Art Gallery — Supabase/PostgreSQL MVP schema
-- Version 1.0
-- Designed for: artist onboarding -> artwork publishing -> discovery -> purchase request
-- -> manual payment verification -> artwork preparation -> delivery -> completion.
-- Run once in a NEW Supabase project via SQL Editor.

begin;

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------------
create type public.user_role as enum ('buyer', 'artist', 'admin');
create type public.application_status as enum (
  'draft', 'submitted', 'under_review', 'approved', 'changes_required', 'rejected'
);
create type public.artwork_review_status as enum (
  'draft', 'pending_review', 'approved', 'changes_required', 'rejected'
);
create type public.artwork_availability as enum (
  'available', 'reserved', 'sold', 'unavailable'
);
create type public.product_type as enum ('original', 'limited_edition', 'print', 'digital');
create type public.order_status as enum (
  'purchase_requested',
  'awaiting_payment',
  'payment_being_verified',
  'payment_confirmed',
  'preparing_artwork',
  'ready_for_delivery',
  'out_for_delivery',
  'delivered',
  'completed',
  'cancelled',
  'reservation_expired',
  'delivery_issue',
  'returned'
);
create type public.payment_status as enum ('not_submitted', 'submitted', 'confirmed', 'rejected');
create type public.delivery_status as enum (
  'preparing', 'ready_for_delivery', 'out_for_delivery', 'delivered', 'delivery_issue', 'returned'
);

-- -----------------------------------------------------------------------------
-- PRIVATE SCHEMA
-- Stores guest order access tokens outside the public API schema.
-- -----------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- REFERENCE SEQUENCES + HELPERS
-- -----------------------------------------------------------------------------
create sequence public.application_reference_seq start 1;
create sequence public.order_reference_seq start 1;

create or replace function public.next_application_reference()
returns text
language sql
volatile
security definer
set search_path = public
as $$
  select 'TAG-ART-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.application_reference_seq')::text, 5, '0');
$$;

create or replace function public.next_order_reference()
returns text
language sql
volatile
security definer
set search_path = public
as $$
  select 'TAG-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_reference_seq')::text, 5, '0');
$$;

create or replace function public.slugify(value text)
returns text
language sql
immutable
strict
as $$
  select trim(both '-' from regexp_replace(lower(value), '[^a-z0-9]+', '-', 'g'));
$$;

-- -----------------------------------------------------------------------------
-- CORE TABLES
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'buyer',
  full_name text,
  phone text,
  location text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.artist_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  reference text unique not null default public.next_application_reference(),
  full_name text not null,
  public_name text not null,
  email text not null,
  phone text not null,
  location text not null,
  biography text,
  artist_statement text,
  categories text[] not null default '{}',
  mediums text[] not null default '{}',
  years_experience integer check (years_experience is null or years_experience >= 0),
  portfolio_links text[] not null default '{}',
  status public.application_status not null default 'draft',
  review_note text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.artist_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  application_id uuid unique references public.artist_applications(id) on delete set null,
  slug text unique not null,
  public_name text not null,
  biography text,
  artist_statement text,
  location text,
  categories text[] not null default '{}',
  mediums text[] not null default '{}',
  profile_image_url text,
  cover_image_url text,
  social_links jsonb not null default '{}'::jsonb,
  verified boolean not null default false,
  profile_completion smallint not null default 0 check (profile_completion between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.artworks (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artist_profiles(id) on delete cascade,
  slug text unique not null,
  title text not null,
  description text,
  story text,
  category text not null,
  medium text not null,
  creation_year integer check (creation_year is null or creation_year between 1000 and 2200),
  width_cm numeric(10,2) check (width_cm is null or width_cm > 0),
  height_cm numeric(10,2) check (height_cm is null or height_cm > 0),
  depth_cm numeric(10,2) check (depth_cm is null or depth_cm >= 0),
  weight_kg numeric(10,2) check (weight_kg is null or weight_kg >= 0),
  framed boolean,
  product_type public.product_type not null default 'original',
  price_etb numeric(12,2) not null check (price_etb > 0),
  availability public.artwork_availability not null default 'available',
  review_status public.artwork_review_status not null default 'draft',
  review_note text,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.artwork_images (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  is_main boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create unique index one_main_image_per_artwork
  on public.artwork_images(artwork_id)
  where is_main = true;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null default public.next_order_reference(),
  artwork_id uuid not null references public.artworks(id) on delete restrict,
  artist_id uuid not null references public.artist_profiles(id) on delete restrict,
  buyer_user_id uuid references public.profiles(id) on delete set null,
  buyer_name text not null,
  buyer_phone text not null,
  buyer_email text not null,
  delivery_location text not null,
  buyer_message text,
  artwork_price_etb numeric(12,2) not null check (artwork_price_etb > 0),
  commission_rate numeric(5,2) not null check (commission_rate >= 0 and commission_rate <= 100),
  commission_amount_etb numeric(12,2) not null check (commission_amount_etb >= 0),
  artist_earnings_etb numeric(12,2) not null check (artist_earnings_etb >= 0),
  status public.order_status not null default 'purchase_requested',
  payment_status public.payment_status not null default 'not_submitted',
  reservation_expires_at timestamptz,
  cancelled_reason text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One unique physical artwork can only be in one active sale flow at a time.
create unique index one_active_order_per_artwork
  on public.orders(artwork_id)
  where status in (
    'purchase_requested', 'awaiting_payment', 'payment_being_verified',
    'payment_confirmed', 'preparing_artwork', 'ready_for_delivery',
    'out_for_delivery', 'delivered'
  );

create index artist_applications_user_status_idx
  on public.artist_applications(user_id, status);
create index artworks_artist_idx on public.artworks(artist_id);
create index artworks_discovery_idx
  on public.artworks(review_status, availability, published_at desc);
create index orders_buyer_idx on public.orders(buyer_user_id, created_at desc);
create index orders_artist_idx on public.orders(artist_id, created_at desc);

create table public.order_status_history (
  id bigint generated by default as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  note text,
  created_at timestamptz not null default now()
);

create index order_status_history_order_idx
  on public.order_status_history(order_id, created_at);

create table private.order_guest_access (
  order_id uuid primary key references public.orders(id) on delete cascade,
  token_hash bytea not null,
  created_at timestamptz not null default now()
);

create table public.payment_submissions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  submitted_by uuid references public.profiles(id) on delete set null,
  payment_method text not null,
  payment_reference text,
  date_paid date,
  proof_storage_path text,
  status public.payment_status not null default 'submitted',
  admin_note text,
  verified_by uuid references public.profiles(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create index payment_submissions_order_idx on public.payment_submissions(order_id, created_at desc);

create table public.deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique not null references public.orders(id) on delete cascade,
  recipient_name text not null,
  recipient_phone text not null,
  delivery_address text not null,
  delivery_instructions text,
  status public.delivery_status not null default 'preparing',
  tracking_note text,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  title text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_unread_idx on public.notifications(user_id, read_at, created_at desc);

create table public.platform_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.platform_settings(key, value) values
  ('commission_rate', '10'::jsonb),
  ('reservation_hours', '24'::jsonb),
  ('payment_methods', '["Bank transfer", "Telebirr"]'::jsonb)
on conflict (key) do nothing;

-- -----------------------------------------------------------------------------
-- UPDATED_AT TRIGGER
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger artist_applications_set_updated_at before update on public.artist_applications
for each row execute function public.set_updated_at();
create trigger artist_profiles_set_updated_at before update on public.artist_profiles
for each row execute function public.set_updated_at();
create trigger artworks_set_updated_at before update on public.artworks
for each row execute function public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders
for each row execute function public.set_updated_at();
create trigger deliveries_set_updated_at before update on public.deliveries
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- AUTH PROFILE CREATION
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id, full_name, role)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    'buyer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- SECURITY HELPERS
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.owns_artist_profile(p_artist_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.artist_profiles a
    where a.id = p_artist_id and a.user_id = auth.uid()
  );
$$;

-- Artist applicants cannot modify administrator review fields. Submission time is
-- set by the database when the application moves to Submitted.
create or replace function public.guard_artist_application_workflow()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if tg_op = 'INSERT' then
      new.review_note := null;
      new.reviewed_by := null;
      new.reviewed_at := null;
      if new.status = 'submitted' then
        new.submitted_at := coalesce(new.submitted_at, now());
      end if;
    else
      if new.review_note is distinct from old.review_note
         or new.reviewed_by is distinct from old.reviewed_by
         or new.reviewed_at is distinct from old.reviewed_at then
        raise exception 'Application review fields can only be changed by an administrator.';
      end if;

      if new.status = 'submitted' and old.status <> 'submitted' then
        new.submitted_at := now();
      end if;
    end if;
  end if;
  return new;
end;
$$;

create trigger guard_artist_application_workflow_before_write
before insert or update on public.artist_applications
for each row execute function public.guard_artist_application_workflow();

-- Prevent users from self-promoting their account role.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only an administrator can change account roles.';
  end if;
  return new;
end;
$$;

create trigger protect_profile_role_before_update
before update on public.profiles
for each row execute function public.protect_profile_role();

-- Artists may edit their public content but not verification/ownership fields.
create or replace function public.protect_artist_profile_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if new.user_id is distinct from old.user_id
       or new.application_id is distinct from old.application_id
       or new.verified is distinct from old.verified then
      raise exception 'Protected artist profile fields can only be changed by an administrator.';
    end if;
  end if;
  return new;
end;
$$;

create trigger protect_artist_profile_admin_fields_before_update
before update on public.artist_profiles
for each row execute function public.protect_artist_profile_admin_fields();

-- Artists can only edit artwork while it is Draft or Changes Required,
-- and can only submit it to Pending Review themselves.
create or replace function public.protect_artwork_review_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() and public.owns_artist_profile(old.artist_id) then
    if new.artist_id is distinct from old.artist_id
       or new.reviewed_by is distinct from old.reviewed_by
       or new.reviewed_at is distinct from old.reviewed_at
       or new.review_note is distinct from old.review_note
       or new.published_at is distinct from old.published_at then
      raise exception 'Protected artwork fields can only be changed by an administrator or marketplace workflow.';
    end if;

    if old.review_status not in ('draft', 'changes_required') then
      raise exception 'This artwork cannot be edited in its current review state.';
    end if;

    if new.review_status not in ('draft', 'pending_review') then
      raise exception 'Artists may only save a draft or submit artwork for review.';
    end if;
  end if;
  return new;
end;
$$;

create trigger protect_artwork_review_fields_before_update
before update on public.artworks
for each row execute function public.protect_artwork_review_fields();

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.artist_applications enable row level security;
alter table public.artist_profiles enable row level security;
alter table public.artworks enable row level security;
alter table public.artwork_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payment_submissions enable row level security;
alter table public.deliveries enable row level security;
alter table public.notifications enable row level security;
alter table public.platform_settings enable row level security;

-- Profiles
create policy "profiles_select_own_or_admin"
on public.profiles for select to authenticated
using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin"
on public.profiles for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

-- Artist applications
create policy "artist_applications_select_own_or_admin"
on public.artist_applications for select to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "artist_applications_insert_own"
on public.artist_applications for insert to authenticated
with check (
  user_id = auth.uid()
  and status in ('draft', 'submitted')
  and reviewed_by is null
  and reviewed_at is null
);

create policy "artist_applications_update_editable_own"
on public.artist_applications for update to authenticated
using (
  (user_id = auth.uid() and status in ('draft', 'changes_required'))
  or public.is_admin()
)
with check (
  public.is_admin()
  or (user_id = auth.uid() and status in ('draft', 'submitted'))
);

-- Public artist pages + owner/admin private access
create policy "artist_profiles_public_read_verified"
on public.artist_profiles for select to anon, authenticated
using (verified = true or user_id = auth.uid() or public.is_admin());

create policy "artist_profiles_owner_update"
on public.artist_profiles for update to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "artist_profiles_admin_insert"
on public.artist_profiles for insert to authenticated
with check (public.is_admin());

-- Artworks
create policy "artworks_public_read_published"
on public.artworks for select to anon, authenticated
using (
  (review_status = 'approved' and published_at is not null)
  or public.owns_artist_profile(artist_id)
  or public.is_admin()
);

create policy "artworks_artist_insert"
on public.artworks for insert to authenticated
with check (
  public.owns_artist_profile(artist_id)
  and review_status = 'draft'
  and availability = 'available'
  and review_note is null
  and reviewed_by is null
  and reviewed_at is null
  and published_at is null
);

create policy "artworks_artist_edit_or_admin"
on public.artworks for update to authenticated
using (
  (public.owns_artist_profile(artist_id) and review_status in ('draft', 'changes_required'))
  or public.is_admin()
)
with check (
  (public.owns_artist_profile(artist_id) and review_status in ('draft', 'pending_review') and availability = 'available')
  or public.is_admin()
);

create policy "artworks_artist_delete_draft_or_admin"
on public.artworks for delete to authenticated
using (
  (public.owns_artist_profile(artist_id) and review_status = 'draft')
  or public.is_admin()
);

-- Artwork image metadata
create policy "artwork_images_public_read"
on public.artwork_images for select to anon, authenticated
using (
  exists (
    select 1 from public.artworks a
    where a.id = artwork_id
      and (
        (a.review_status = 'approved' and a.published_at is not null)
        or public.owns_artist_profile(a.artist_id)
        or public.is_admin()
      )
  )
);

create policy "artwork_images_owner_insert"
on public.artwork_images for insert to authenticated
with check (
  exists (
    select 1 from public.artworks a
    where a.id = artwork_id
      and public.owns_artist_profile(a.artist_id)
      and a.review_status in ('draft', 'changes_required')
  )
  or public.is_admin()
);

create policy "artwork_images_owner_update"
on public.artwork_images for update to authenticated
using (
  exists (
    select 1 from public.artworks a
    where a.id = artwork_id
      and public.owns_artist_profile(a.artist_id)
      and a.review_status in ('draft', 'changes_required')
  )
  or public.is_admin()
)
with check (
  exists (
    select 1 from public.artworks a
    where a.id = artwork_id
      and public.owns_artist_profile(a.artist_id)
      and a.review_status in ('draft', 'changes_required')
  )
  or public.is_admin()
);

create policy "artwork_images_owner_delete"
on public.artwork_images for delete to authenticated
using (
  exists (
    select 1 from public.artworks a
    where a.id = artwork_id
      and public.owns_artist_profile(a.artist_id)
      and a.review_status in ('draft', 'changes_required')
  )
  or public.is_admin()
);

-- Orders: direct writes are intentionally not allowed. Purchase requests use RPC.
create policy "orders_read_participants_or_admin"
on public.orders for select to authenticated
using (
  buyer_user_id = auth.uid()
  or public.owns_artist_profile(artist_id)
  or public.is_admin()
);

create policy "orders_admin_update"
on public.orders for update to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Order timeline
create policy "order_history_read_participants_or_admin"
on public.order_status_history for select to authenticated
using (
  exists (
    select 1 from public.orders o
    where o.id = order_id
      and (
        o.buyer_user_id = auth.uid()
        or public.owns_artist_profile(o.artist_id)
        or public.is_admin()
      )
  )
);

-- Payment submissions
create policy "payment_submissions_read_participants_or_admin"
on public.payment_submissions for select to authenticated
using (
  exists (
    select 1 from public.orders o
    where o.id = order_id
      and (
        o.buyer_user_id = auth.uid()
        or public.owns_artist_profile(o.artist_id)
        or public.is_admin()
      )
  )
);

create policy "payment_submissions_admin_update"
on public.payment_submissions for update to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Deliveries
create policy "deliveries_read_participants_or_admin"
on public.deliveries for select to authenticated
using (
  exists (
    select 1 from public.orders o
    where o.id = order_id
      and (
        o.buyer_user_id = auth.uid()
        or public.owns_artist_profile(o.artist_id)
        or public.is_admin()
      )
  )
);

create policy "deliveries_admin_update"
on public.deliveries for update to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Notifications
create policy "notifications_read_own"
on public.notifications for select to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "notifications_mark_own_read"
on public.notifications for update to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

-- Platform settings contain only non-secret marketplace settings.
create policy "platform_settings_public_read"
on public.platform_settings for select to anon, authenticated
using (true);

create policy "platform_settings_admin_all"
on public.platform_settings for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- MARKETPLACE WORKFLOW RPCs
-- -----------------------------------------------------------------------------

-- Create a purchase request safely. The caller cannot choose the price,
-- commission, artist, order status, or reservation state.
create or replace function public.create_purchase_request(
  p_artwork_id uuid,
  p_buyer_name text,
  p_buyer_phone text,
  p_buyer_email text,
  p_delivery_location text,
  p_buyer_message text default null
)
returns table(order_reference text, access_token text)
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_artwork public.artworks%rowtype;
  v_rate numeric(5,2);
  v_hours integer;
  v_order_id uuid;
  v_reference text;
  v_token text;
  v_commission numeric(12,2);
  v_earnings numeric(12,2);
begin
  if nullif(trim(p_buyer_name), '') is null
     or nullif(trim(p_buyer_phone), '') is null
     or nullif(trim(p_buyer_email), '') is null
     or nullif(trim(p_delivery_location), '') is null then
    raise exception 'Buyer name, phone, email, and delivery location are required.';
  end if;

  select * into v_artwork
  from public.artworks
  where id = p_artwork_id
  for update;

  if not found then
    raise exception 'Artwork not found.';
  end if;

  if v_artwork.review_status <> 'approved'
     or v_artwork.published_at is null
     or v_artwork.availability <> 'available' then
    raise exception 'This artwork is no longer available for purchase.';
  end if;

  select coalesce((value #>> '{}')::numeric, 10)
  into v_rate
  from public.platform_settings
  where key = 'commission_rate';

  select coalesce((value #>> '{}')::integer, 24)
  into v_hours
  from public.platform_settings
  where key = 'reservation_hours';

  v_rate := coalesce(v_rate, 10);
  v_hours := coalesce(v_hours, 24);
  v_commission := round(v_artwork.price_etb * v_rate / 100.0, 2);
  v_earnings := v_artwork.price_etb - v_commission;
  v_reference := public.next_order_reference();
  v_token := gen_random_uuid()::text;

  insert into public.orders (
    reference, artwork_id, artist_id, buyer_user_id,
    buyer_name, buyer_phone, buyer_email, delivery_location, buyer_message,
    artwork_price_etb, commission_rate, commission_amount_etb, artist_earnings_etb,
    status, payment_status, reservation_expires_at
  ) values (
    v_reference, v_artwork.id, v_artwork.artist_id, auth.uid(),
    trim(p_buyer_name), trim(p_buyer_phone), lower(trim(p_buyer_email)),
    trim(p_delivery_location), nullif(trim(coalesce(p_buyer_message, '')), ''),
    v_artwork.price_etb, v_rate, v_commission, v_earnings,
    'awaiting_payment', 'not_submitted', now() + make_interval(hours => v_hours)
  ) returning id into v_order_id;

  insert into private.order_guest_access(order_id, token_hash)
  values (v_order_id, digest(v_token, 'sha256'));

  insert into public.order_status_history(order_id, status, note) values
    (v_order_id, 'purchase_requested', 'Purchase request received.'),
    (v_order_id, 'awaiting_payment', 'Awaiting payment.');

  update public.artworks
  set availability = 'reserved', updated_at = now()
  where id = v_artwork.id;

  return query select v_reference, v_token;
end;
$$;

-- Guest-safe order lookup. Returns only buyer-safe fields.
create or replace function public.get_guest_order(
  p_reference text,
  p_access_token text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_order public.orders%rowtype;
  v_result jsonb;
begin
  select o.* into v_order
  from public.orders o
  join private.order_guest_access ga on ga.order_id = o.id
  where o.reference = p_reference
    and ga.token_hash = digest(p_access_token, 'sha256');

  if not found then
    raise exception 'Order not found or access link is invalid.';
  end if;

  select jsonb_build_object(
    'reference', o.reference,
    'status', o.status,
    'payment_status', o.payment_status,
    'price_etb', o.artwork_price_etb,
    'reservation_expires_at', o.reservation_expires_at,
    'created_at', o.created_at,
    'artwork', jsonb_build_object(
      'id', a.id,
      'slug', a.slug,
      'title', a.title
    ),
    'artist', jsonb_build_object(
      'slug', ap.slug,
      'name', ap.public_name
    ),
    'timeline', coalesce((
      select jsonb_agg(
        jsonb_build_object('status', h.status, 'note', h.note, 'created_at', h.created_at)
        order by h.created_at, h.id
      )
      from public.order_status_history h
      where h.order_id = o.id
    ), '[]'::jsonb)
  ) into v_result
  from public.orders o
  join public.artworks a on a.id = o.artwork_id
  join public.artist_profiles ap on ap.id = o.artist_id
  where o.id = v_order.id;

  return v_result;
end;
$$;

-- Guest or logged-in buyer can submit payment details through the secure order link.
create or replace function public.submit_payment_by_token(
  p_reference text,
  p_access_token text,
  p_payment_method text,
  p_payment_reference text default null,
  p_date_paid date default current_date
)
returns uuid
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_order public.orders%rowtype;
  v_submission_id uuid;
begin
  select o.* into v_order
  from public.orders o
  join private.order_guest_access ga on ga.order_id = o.id
  where o.reference = p_reference
    and ga.token_hash = digest(p_access_token, 'sha256')
  for update of o;

  if not found then
    raise exception 'Order not found or access link is invalid.';
  end if;

  if v_order.status not in ('awaiting_payment', 'payment_being_verified') then
    raise exception 'Payment cannot be submitted for this order in its current state.';
  end if;

  if nullif(trim(p_payment_method), '') is null then
    raise exception 'Payment method is required.';
  end if;

  insert into public.payment_submissions (
    order_id, submitted_by, payment_method, payment_reference, date_paid, status
  ) values (
    v_order.id, auth.uid(), trim(p_payment_method),
    nullif(trim(coalesce(p_payment_reference, '')), ''), p_date_paid, 'submitted'
  ) returning id into v_submission_id;

  update public.orders
  set status = 'payment_being_verified', payment_status = 'submitted'
  where id = v_order.id;

  insert into public.order_status_history(order_id, status, note)
  values (v_order.id, 'payment_being_verified', 'Payment submitted and is being verified.');

  return v_submission_id;
end;
$$;

-- Admin reviews an artist application. Approval creates the artist profile and role.
create or replace function public.review_artist_application(
  p_application_id uuid,
  p_decision public.application_status,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_app public.artist_applications%rowtype;
  v_artist_id uuid;
  v_slug text;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.';
  end if;

  if p_decision not in ('approved', 'changes_required', 'rejected') then
    raise exception 'Invalid review decision.';
  end if;

  select * into v_app
  from public.artist_applications
  where id = p_application_id
  for update;

  if not found then
    raise exception 'Artist application not found.';
  end if;

  update public.artist_applications
  set status = p_decision,
      review_note = nullif(trim(coalesce(p_note, '')), ''),
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = v_app.id;

  if p_decision = 'approved' then
    v_slug := coalesce(nullif(public.slugify(v_app.public_name), ''), 'artist') || '-' || left(v_app.id::text, 6);

    insert into public.artist_profiles (
      user_id, application_id, slug, public_name, biography, artist_statement,
      location, categories, mediums, verified, profile_completion
    ) values (
      v_app.user_id, v_app.id, v_slug, v_app.public_name, v_app.biography,
      v_app.artist_statement, v_app.location, v_app.categories, v_app.mediums,
      true, 70
    )
    on conflict (user_id) do update
      set application_id = excluded.application_id,
          public_name = excluded.public_name,
          biography = excluded.biography,
          artist_statement = excluded.artist_statement,
          location = excluded.location,
          categories = excluded.categories,
          mediums = excluded.mediums,
          verified = true,
          updated_at = now()
    returning id into v_artist_id;

    update public.profiles set role = 'artist' where id = v_app.user_id;

    insert into public.notifications(user_id, title, message)
    values (
      v_app.user_id,
      'Artist application approved',
      'Welcome to Tilet Art Gallery. Complete your artist profile and start adding artwork.'
    );
  else
    select id into v_artist_id from public.artist_profiles where user_id = v_app.user_id;

    insert into public.notifications(user_id, title, message)
    values (
      v_app.user_id,
      case when p_decision = 'changes_required' then 'Changes requested' else 'Artist application update' end,
      coalesce(nullif(trim(coalesce(p_note, '')), ''), 'Your artist application has been reviewed.')
    );
  end if;

  return v_artist_id;
end;
$$;

-- Admin reviews artwork.
create or replace function public.review_artwork(
  p_artwork_id uuid,
  p_decision public.artwork_review_status,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_artwork public.artworks%rowtype;
  v_artist_user uuid;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.';
  end if;

  if p_decision not in ('approved', 'changes_required', 'rejected') then
    raise exception 'Invalid artwork review decision.';
  end if;

  select * into v_artwork from public.artworks where id = p_artwork_id for update;
  if not found then raise exception 'Artwork not found.'; end if;

  select user_id into v_artist_user from public.artist_profiles where id = v_artwork.artist_id;

  update public.artworks
  set review_status = p_decision,
      review_note = nullif(trim(coalesce(p_note, '')), ''),
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      published_at = case when p_decision = 'approved' then coalesce(published_at, now()) else published_at end
  where id = p_artwork_id;

  if v_artist_user is not null then
    insert into public.notifications(user_id, title, message)
    values (
      v_artist_user,
      case
        when p_decision = 'approved' then 'Your artwork is now live'
        when p_decision = 'changes_required' then 'Changes requested for your artwork'
        else 'Artwork review update'
      end,
      coalesce(nullif(trim(coalesce(p_note, '')), ''),
        case when p_decision = 'approved' then 'Your artwork has been approved and published.' else 'Your artwork has been reviewed.' end)
    );
  end if;
end;
$$;

-- Admin confirms payment. This is the point at which the artwork becomes SOLD.
create or replace function public.confirm_payment(
  p_payment_submission_id uuid,
  p_admin_note text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_payment public.payment_submissions%rowtype;
  v_order public.orders%rowtype;
  v_artist_user uuid;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.';
  end if;

  select * into v_payment
  from public.payment_submissions
  where id = p_payment_submission_id
  for update;

  if not found then raise exception 'Payment submission not found.'; end if;

  select * into v_order
  from public.orders
  where id = v_payment.order_id
  for update;

  if v_payment.status = 'confirmed' or v_order.payment_status = 'confirmed' then
    raise exception 'Payment has already been confirmed for this order.';
  end if;

  update public.payment_submissions
  set status = 'confirmed',
      admin_note = nullif(trim(coalesce(p_admin_note, '')), ''),
      verified_by = auth.uid(),
      verified_at = now()
  where id = v_payment.id;

  update public.orders
  set payment_status = 'confirmed',
      status = 'preparing_artwork'
  where id = v_order.id;

  update public.artworks
  set availability = 'sold'
  where id = v_order.artwork_id;

  insert into public.order_status_history(order_id, status, note) values
    (v_order.id, 'payment_confirmed', 'Payment confirmed.'),
    (v_order.id, 'preparing_artwork', 'The artist is preparing the artwork.');

  insert into public.deliveries(
    order_id, recipient_name, recipient_phone, delivery_address, status
  ) values (
    v_order.id, v_order.buyer_name, v_order.buyer_phone, v_order.delivery_location, 'preparing'
  )
  on conflict (order_id) do nothing;

  select user_id into v_artist_user from public.artist_profiles where id = v_order.artist_id;

  if v_order.buyer_user_id is not null then
    insert into public.notifications(user_id, order_id, title, message)
    values (
      v_order.buyer_user_id, v_order.id,
      'Payment confirmed',
      'Your payment has been confirmed. The artist is now preparing your artwork.'
    );
  end if;

  if v_artist_user is not null then
    insert into public.notifications(user_id, order_id, title, message)
    values (
      v_artist_user, v_order.id,
      'Your artwork has been sold',
      'Payment is confirmed. Please prepare the artwork for delivery.'
    );
  end if;
end;
$$;

-- Artist marks a paid order as ready for delivery.
create or replace function public.mark_order_ready(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found.'; end if;

  if not public.owns_artist_profile(v_order.artist_id) and not public.is_admin() then
    raise exception 'You do not have access to this order.';
  end if;

  if v_order.status <> 'preparing_artwork' then
    raise exception 'Order is not currently in artwork preparation.';
  end if;

  update public.orders set status = 'ready_for_delivery' where id = v_order.id;
  update public.deliveries set status = 'ready_for_delivery' where order_id = v_order.id;

  insert into public.order_status_history(order_id, status, note)
  values (v_order.id, 'ready_for_delivery', 'Artwork is ready for delivery.');
end;
$$;

-- Admin cancellation / reservation release.
create or replace function public.cancel_order(
  p_order_id uuid,
  p_reason text default null,
  p_as_expired boolean default false
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order public.orders%rowtype;
  v_new_status public.order_status;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found.'; end if;

  if v_order.status in ('completed', 'cancelled', 'reservation_expired') then
    raise exception 'This order is already closed.';
  end if;

  v_new_status := case when p_as_expired then 'reservation_expired'::public.order_status else 'cancelled'::public.order_status end;

  update public.orders
  set status = v_new_status,
      cancelled_reason = nullif(trim(coalesce(p_reason, '')), '')
  where id = v_order.id;

  if v_order.payment_status <> 'confirmed' then
    update public.artworks
    set availability = 'available'
    where id = v_order.artwork_id and availability = 'reserved';
  end if;

  insert into public.order_status_history(order_id, status, note)
  values (v_order.id, v_new_status, nullif(trim(coalesce(p_reason, '')), ''));
end;
$$;

-- -----------------------------------------------------------------------------
-- STORAGE BUCKETS
-- -----------------------------------------------------------------------------
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values
  ('artist-media', 'artist-media', true, 10485760, array['image/jpeg','image/png','image/webp']),
  ('artwork-images', 'artwork-images', true, 15728640, array['image/jpeg','image/png','image/webp']),
  ('payment-proofs', 'payment-proofs', false, 10485760, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;

-- Public media can be viewed by everyone.
create policy "public_read_artist_media"
on storage.objects for select to public
using (bucket_id = 'artist-media');

create policy "public_read_artwork_images"
on storage.objects for select to public
using (bucket_id = 'artwork-images');

-- Approved artists upload only inside a folder named with their auth user id.
create policy "artists_upload_artist_media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'artist-media'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (select 1 from public.artist_profiles ap where ap.user_id = auth.uid())
);

create policy "artists_manage_own_artist_media"
on storage.objects for update to authenticated
using (
  bucket_id = 'artist-media'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'artist-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "artists_delete_own_artist_media"
on storage.objects for delete to authenticated
using (
  bucket_id = 'artist-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "artists_upload_artwork_images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'artwork-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (select 1 from public.artist_profiles ap where ap.user_id = auth.uid())
);

create policy "artists_manage_own_artwork_images"
on storage.objects for update to authenticated
using (
  bucket_id = 'artwork-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'artwork-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "artists_delete_own_artwork_images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'artwork-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- payment-proofs intentionally has no anon/authenticated storage policy yet.
-- We will add a signed-upload/server workflow when wiring the payment UI.

-- -----------------------------------------------------------------------------
-- PRIVILEGES
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on public.artist_profiles, public.artworks, public.artwork_images, public.platform_settings to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update on public.artist_applications to authenticated;
grant select, update on public.artist_profiles to authenticated;
grant select, insert, update, delete on public.artworks to authenticated;
grant select, insert, update, delete on public.artwork_images to authenticated;
grant select, update on public.orders to authenticated;
grant select on public.order_status_history to authenticated;
grant select, update on public.payment_submissions to authenticated;
grant select, update on public.deliveries to authenticated;
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant select, insert, update, delete on public.platform_settings to authenticated;

grant execute on function public.create_purchase_request(uuid,text,text,text,text,text) to anon, authenticated;
grant execute on function public.get_guest_order(text,text) to anon, authenticated;
grant execute on function public.submit_payment_by_token(text,text,text,text,date) to anon, authenticated;
grant execute on function public.review_artist_application(uuid,public.application_status,text) to authenticated;
grant execute on function public.review_artwork(uuid,public.artwork_review_status,text) to authenticated;
grant execute on function public.confirm_payment(uuid,text) to authenticated;
grant execute on function public.mark_order_ready(uuid) to authenticated;
grant execute on function public.cancel_order(uuid,text,boolean) to authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.owns_artist_profile(uuid) to anon, authenticated;

-- Ensure the private guest-token table cannot be called directly.
revoke all on all tables in schema private from public, anon, authenticated;
revoke all on all sequences in schema private from public, anon, authenticated;

commit;

-- -----------------------------------------------------------------------------
-- AFTER THIS SCRIPT
-- 1) Create your first Auth user.
-- 2) Promote that user's profile to admin once using SQL Editor:
--
--    update public.profiles
--    set role = 'admin'
--    where id = (select id from auth.users where email = 'YOUR-ADMIN-EMAIL');
--
-- Do not put service_role / secret keys in NEXT_PUBLIC_* environment variables.
-- -----------------------------------------------------------------------------
