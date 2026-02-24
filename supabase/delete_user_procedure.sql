-- ════════════════════════════════════════════════════════════════
-- CYKLBOARD — DELETE USER PROCEDURE
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ════════════════════════════════════════════════════════════════

-- This function allows an admin to permanently delete a user 
-- from BOTH public.profiles and auth.users.
-- It uses "SECURITY DEFINER" to run with elevated privileges.

CREATE OR REPLACE FUNCTION public.delete_user_completely(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    requester_role TEXT;
BEGIN
    -- 1. Check if the requester is an admin
    SELECT role INTO requester_role 
    FROM public.profiles 
    WHERE id = auth.uid();

    IF requester_role != 'admin' THEN
        RAISE EXCEPTION 'Solo los administradores pueden eliminar usuarios de forma permanente.';
    END IF;

    -- 2. Prevent admins from deleting themselves (optional safety)
    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'No puedes eliminar tu propia cuenta administrativa desde este panel.';
    END IF;

    -- 3. Delete from auth.users
    -- Due to the "ON DELETE CASCADE" in our profile table definition,
    -- this will automatically remove the row from public.profiles too.
    DELETE FROM auth.users WHERE id = target_user_id;

END;
$$;

-- Grant access to the function to authenticated users 
-- (The logic inside the function handles the role check)
GRANT EXECUTE ON FUNCTION public.delete_user_completely(UUID) TO authenticated;
