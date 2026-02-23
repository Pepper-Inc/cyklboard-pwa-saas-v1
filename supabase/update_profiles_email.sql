-- ════════════════════════════════════════════════════════════════
-- XTREME BIKE — ADD EMAIL TO PROFILES
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ════════════════════════════════════════════════════════════════

-- 1. Add email column to profiles
alter table public.profiles
  add column if not exists email text;

-- 2. Update the handle_new_user trigger function to store the email
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email, -- Automatically sync email from auth.users
    coalesce(new.raw_user_meta_data->>'role', (case when (select count(*) from public.profiles) = 0 then 'admin' else 'client' end))
  );
  return new;
end;
$$;

-- 3. Backfill existing emails from auth.users (Optional but recommended)
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

-- Verify columns
select column_name, data_type 
from information_schema.columns 
where table_name = 'profiles' 
and column_name = 'email';
