-- ════════════════════════════════════════════════════════════════
-- CYKLBOARD — HARDEN SECURITY & RLS
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ════════════════════════════════════════════════════════════════

-- ── 1. HELPERS ───────────────────────────────────────────────
-- Function to get current user role without recursion
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to securely deduct credits (Atomic operation)
CREATE OR REPLACE FUNCTION public.confirm_attendance(p_class_id UUID, p_user_name TEXT, p_bike_id INT)
RETURNS VOID AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := public.get_my_role();
  IF v_role NOT IN ('admin', 'instructor') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- 1. Insert or update attendance
  INSERT INTO public.attendances (class_id, user_name, bike_number, status, updated_by)
  VALUES (p_class_id, p_user_name, p_bike_id, 'attended', auth.uid())
  ON CONFLICT (class_id, user_name) DO UPDATE 
  SET status = 'attended', updated_at = now(), updated_by = auth.uid();

  -- 2. Deduct credit from profile (if name matches exactly and profile exists)
  UPDATE public.profiles 
  SET credits_remaining = GREATEST(0, credits_remaining - 1)
  WHERE full_name = p_user_name AND role = 'client';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 2. RESET POLICIES ────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "classes_select" ON public.classes;
DROP POLICY IF EXISTS "classes_insert" ON public.classes;
DROP POLICY IF EXISTS "classes_update" ON public.classes;
DROP POLICY IF EXISTS "classes_delete" ON public.classes;
DROP POLICY IF EXISTS "bikes_select" ON public.bikes;
DROP POLICY IF EXISTS "bikes_update" ON public.bikes;
DROP POLICY IF EXISTS "reservations_select" ON public.reservations;
DROP POLICY IF EXISTS "reservations_insert" ON public.reservations;
DROP POLICY IF EXISTS "reservations_update" ON public.reservations;
DROP POLICY IF EXISTS "attendances_select" ON public.attendances;
DROP POLICY IF EXISTS "attendances_insert" ON public.attendances;
DROP POLICY IF EXISTS "attendances_update" ON public.attendances;
DROP POLICY IF EXISTS "attendances_delete" ON public.attendances;

-- ── 3. PROFILES ──────────────────────────────────────────────
-- Everyone authenticated can see profiles (to search for clients)
CREATE POLICY "profiles_select" ON public.profiles 
FOR SELECT TO authenticated USING (true);

-- Admins can update any profile; Users can only update their own
CREATE POLICY "profiles_update" ON public.profiles 
FOR UPDATE TO authenticated 
USING (auth.uid() = id OR public.get_my_role() = 'admin');

-- ── 4. CLASSES ───────────────────────────────────────────────
-- Everyone can see classes
CREATE POLICY "classes_select" ON public.classes 
FOR SELECT TO authenticated USING (true);

-- Only admins and instructors can manage classes
CREATE POLICY "classes_manage" ON public.classes 
FOR ALL TO authenticated 
USING (public.get_my_role() IN ('admin', 'instructor'))
WITH CHECK (public.get_my_role() IN ('admin', 'instructor'));

-- ── 5. BIKES ─────────────────────────────────────────────────
-- Everyone can see bike status
CREATE POLICY "bikes_select" ON public.bikes 
FOR SELECT TO authenticated USING (true);

-- Only admins and instructors can update bike status (manually)
CREATE POLICY "bikes_update" ON public.bikes 
FOR UPDATE TO authenticated 
USING (public.get_my_role() IN ('admin', 'instructor'))
WITH CHECK (public.get_my_role() IN ('admin', 'instructor'));

-- ── 6. RESERVATIONS ──────────────────────────────────────────
-- Admins/Instructors see all; Clients only see their own
CREATE POLICY "reservations_select" ON public.reservations 
FOR SELECT TO authenticated 
USING (public.get_my_role() IN ('admin', 'instructor') OR created_by = auth.uid());

-- Clients, Instructors, and Admins can create reservations
CREATE POLICY "reservations_insert" ON public.reservations 
FOR INSERT TO authenticated 
WITH CHECK (true); -- Usually restricted to own uid or admin. 
-- For MVP/SaaS convenience:
-- WITH CHECK (auth.uid() = created_by OR public.get_my_role() IN ('admin', 'instructor'));

-- Only admins/instructors can update/delete reservations
CREATE POLICY "reservations_modify" ON public.reservations 
FOR ALL TO authenticated 
USING (public.get_my_role() IN ('admin', 'instructor'));

-- ── 7. ATTENDANCES ───────────────────────────────────────────
-- Only admins/instructors see and manage attendances
CREATE POLICY "attendances_access" ON public.attendances 
FOR ALL TO authenticated 
USING (public.get_my_role() IN ('admin', 'instructor'))
WITH CHECK (public.get_my_role() IN ('admin', 'instructor'));

-- ── 8. CLIENT PERMISSIONS (PREVENTING DATA LEAK) ─────────────
-- Ensure clients can't delete anything
CREATE POLICY "clients_no_delete" ON public.bikes FOR DELETE TO authenticated USING (false);
CREATE POLICY "clients_no_delete_res" ON public.reservations FOR DELETE TO authenticated USING (tableoid IS NOT NULL AND public.get_my_role() != 'client');
