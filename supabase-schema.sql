-- Half Shell Oyster Passport — Supabase schema.
-- Run this once, in the Supabase dashboard's SQL Editor, on a brand-new project.

-- Passport Nos. start at HS-000042 to match the numbering already used in testing.
create sequence if not exists passport_no_seq start 42;

create or replace function next_passport_no()
returns bigint
language sql
as $$
  select nextval('passport_no_seq');
$$;

create table if not exists guests (
  phone text primary key,              -- normalized 10-digit US phone number
  name text not null,
  email text,
  email_opt_in boolean not null default false,
  first_visit timestamptz not null default now(),
  passport_no text not null,
  master_number integer,               -- null until they qualify as Oyster Master
  visits jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One row per Oyster Master, in true induction order — the row's own auto-incrementing id
-- IS the permanent Oyster Master number (see netlify/functions/claim-master-number.js).
create table if not exists oyster_masters (
  id serial primary key,
  phone text not null references guests(phone),
  name text not null,
  date_inducted timestamptz not null default now(),
  constraint oyster_masters_phone_unique unique (phone)
);

-- Row Level Security: the app only ever talks to Supabase through Netlify Functions using the
-- service role key (which bypasses RLS entirely), never from the browser with the public anon
-- key. Enabling RLS with no permissive policies means even a leaked anon key can't read or write
-- anything — an extra safety net on top of that.
alter table guests enable row level security;
alter table oyster_masters enable row level security;
