-- ════════════════════════════════════════════════════════════════
-- XTREME BIKE — ADD CLIENT ROLE & PERMISSIONS
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ════════════════════════════════════════════════════════════════

-- 1. Modify the role check constraint to include 'client'
-- First, we have to drop the old constraint if it exists.
-- The default name for a check constraint on a column is usually table_column_check
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Now add the new constraint that allows 'admin', 'instructor', and 'client'
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('admin', 'instructor', 'client'));

-- 2. Change the default role for new signups to 'client'
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'client';

-- 3. Update the handle_new_user trigger function to use 'client' as the default fallback
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'client') -- Changed from 'instructor' to 'client'
  );
  RETURN new;
END;
$$;

-- 4. Verify the changes
SELECT constraint_name, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass AND contype = 'c';
