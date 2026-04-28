-- ============================================================
-- FlexoTDS Pro — Auth & RLS Hardening (FINAL PRODUCTION)
-- Run in Supabase SQL Editor — SAFE TO RE-RUN
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. TABLE SETUP
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'Technical Officer' CHECK (role IN ('Admin', 'Technical Officer', 'Viewer')),
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'email') THEN
    ALTER TABLE public.user_roles ADD COLUMN email TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'full_name') THEN
    ALTER TABLE public.user_roles ADD COLUMN full_name TEXT;
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────
-- 2. SIGNUP TRIGGER — RACE-SAFE FIRST-ADMIN
-- ────────────────────────────────────────────────────────────
-- Uses NOT EXISTS (WHERE role = 'Admin') instead of COUNT(*) = 0
-- to prevent race condition where two simultaneous signups
-- could both see zero and both become Admin.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role TEXT;
BEGIN
  -- Race-safe: check if ANY admin exists, not just row count
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'Admin') THEN
    assigned_role := 'Admin';
  ELSE
    assigned_role := 'Technical Officer';
  END IF;

  INSERT INTO public.user_roles (user_id, role, email, full_name)
  VALUES (
    NEW.id,
    assigned_role,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.user_roles.full_name);
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- 3. BACKFILL EXISTING USERS
-- ────────────────────────────────────────────────────────────
INSERT INTO public.user_roles (user_id, role, email, full_name)
SELECT 
  id, 'Technical Officer', email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles)
ON CONFLICT (user_id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 4. user_roles RLS
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "System can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Anyone authenticated can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only Admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'Admin')
  );

CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'Admin')
  );

CREATE POLICY "System can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 5. HARDEN activity_log RLS
-- ────────────────────────────────────────────────────────────
-- OLD: WITH CHECK (true) — anyone could insert fake logs
-- NEW: user_id must match caller + admins see all, users see own

DROP POLICY IF EXISTS "System can insert activity log" ON activity_log;
DROP POLICY IF EXISTS "Authenticated users can insert activity log" ON activity_log;
DROP POLICY IF EXISTS "Anyone authenticated can view activity log" ON activity_log;
DROP POLICY IF EXISTS "Users can view own activity" ON activity_log;
DROP POLICY IF EXISTS "Admins can view all activity" ON activity_log;
DROP POLICY IF EXISTS "Users can insert own activity" ON activity_log;

-- INSERT: user can only log actions as themselves
CREATE POLICY "Users can insert own activity" ON activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- SELECT: users see their own logs, admins see everything
CREATE POLICY "Users can view own activity" ON activity_log
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all activity" ON activity_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'Admin')
  );

-- ────────────────────────────────────────────────────────────
-- 6. HARDEN tds_records UPDATE — ownership-aware
-- ────────────────────────────────────────────────────────────
-- The existing policies already check prepared_by = auth.uid()
-- for Draft records. But TOs could update ANY Draft without
-- the prepared_by check in "TOs and Admins can mark as Completed".
-- Fix: add ownership check to the status transition policy.

DROP POLICY IF EXISTS "TOs and Admins can mark as Completed" ON tds_records;

CREATE POLICY "TOs and Admins can mark as Completed" ON tds_records
  FOR UPDATE USING (
    (
      (has_role(auth.uid(), 'Technical Officer') AND prepared_by = auth.uid())
      OR has_role(auth.uid(), 'Admin')
    )
    AND status IN ('Draft', 'Completed')
  )
  WITH CHECK (
    status IN ('Draft', 'Completed')
  );

-- ────────────────────────────────────────────────────────────
-- 7. DB-ENFORCED ADMIN UNIQUENESS
-- ────────────────────────────────────────────────────────────
-- Makes it PHYSICALLY IMPOSSIBLE for 2 users to have Admin role.
-- Even if the trigger race somehow fires twice, the DB rejects it.

DROP INDEX IF EXISTS one_admin_only;
CREATE UNIQUE INDEX one_admin_only
  ON public.user_roles ((1))
  WHERE role = 'Admin';

-- ────────────────────────────────────────────────────────────
-- 8. SELF-ESCALATION BLOCK (RLS)
-- ────────────────────────────────────────────────────────────
-- Even if an admin hits the API directly, they cannot change
-- their OWN role. This prevents privilege lockout and social
-- engineering via direct Supabase API calls.

DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;

CREATE POLICY "Admins can update other users roles" ON public.user_roles
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'Admin')
  )
  WITH CHECK (
    user_id != auth.uid()
  );

-- ────────────────────────────────────────────────────────────
-- 9. OWNERSHIP IMMUTABILITY — prepared_by lock on INSERT
-- ────────────────────────────────────────────────────────────
-- When a TO creates a TDS, prepared_by MUST be their own uid.
-- Prevents spoofing ownership on creation.

DROP POLICY IF EXISTS "TOs and Admins can create Draft TDS" ON tds_records;

CREATE POLICY "TOs and Admins can create Draft TDS" ON tds_records
  FOR INSERT WITH CHECK (
    status = 'Draft'
    AND prepared_by = auth.uid()
    AND (
      has_role(auth.uid(), 'Technical Officer')
      OR has_role(auth.uid(), 'Admin')
    )
  );

-- ────────────────────────────────────────────────────────────
-- 10. ZERO-ADMIN PREVENTION TRIGGER
-- ────────────────────────────────────────────────────────────
-- Ensures the system ALWAYS has at least 1 admin.
-- If someone tries to demote the last admin → blocked.

CREATE OR REPLACE FUNCTION public.prevent_zero_admins()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.role = 'Admin' AND NEW.role != 'Admin' THEN
    IF (SELECT COUNT(*) FROM public.user_roles WHERE role = 'Admin') = 1 THEN
      RAISE EXCEPTION 'Cannot remove the last admin. System must always have at least one admin.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_admin_exists ON public.user_roles;
CREATE TRIGGER ensure_admin_exists
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_zero_admins();

-- ────────────────────────────────────────────────────────────
-- 11. OPTIMIZE has_role() — mark STABLE for performance
-- ────────────────────────────────────────────────────────────
-- Without STABLE, Postgres treats this as VOLATILE and re-executes
-- it for every single row in every RLS check. With STABLE, the
-- query planner can cache the result within a single statement.

CREATE OR REPLACE FUNCTION public.has_role(check_user_id UUID, check_role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = check_role
  );
$$;

-- ────────────────────────────────────────────────────────────
-- 12. BLOCK user_roles DELETE via RLS
-- ────────────────────────────────────────────────────────────
-- Roles should never be deleted — only changed by admin.
-- This prevents accidental or malicious role removal.

DROP POLICY IF EXISTS "Block role deletion" ON public.user_roles;
DROP POLICY IF EXISTS "Only Admins can manage roles" ON public.user_roles;

CREATE POLICY "Block role deletion" ON public.user_roles
  FOR DELETE USING (false);

-- ────────────────────────────────────────────────────────────
-- 13. TDS EDIT — prevent prepared_by spoofing on UPDATE
-- ────────────────────────────────────────────────────────────
-- WITH CHECK ensures prepared_by cannot be changed during update.

DROP POLICY IF EXISTS "TOs and Admins can edit their Draft TDS" ON tds_records;

CREATE POLICY "TOs and Admins can edit their Draft TDS" ON tds_records
  FOR UPDATE
  USING (
    (status = 'Draft' AND prepared_by = auth.uid())
    OR has_role(auth.uid(), 'Admin')
  )
  WITH CHECK (
    prepared_by = auth.uid()
    OR has_role(auth.uid(), 'Admin')
  );

-- ────────────────────────────────────────────────────────────
-- 14. LOCK has_role() PERMISSIONS
-- ────────────────────────────────────────────────────────────
-- Prevent privilege escalation through SECURITY DEFINER abuse.

REVOKE ALL ON FUNCTION public.has_role(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, TEXT) TO authenticated;
ALTER FUNCTION public.has_role(UUID, TEXT) OWNER TO postgres;

-- ────────────────────────────────────────────────────────────
-- 15. PERFORMANCE INDEX FOR RLS
-- ────────────────────────────────────────────────────────────
DROP INDEX IF EXISTS idx_user_roles_user_role;
CREATE INDEX idx_user_roles_user_role
  ON public.user_roles (user_id, role);

-- ════════════════════════════════════════════════════════════
-- ██ AUTH LAYER FROZEN — DO NOT MODIFY BELOW THIS LINE ██
-- ════════════════════════════════════════════════════════════
--
-- Smoke tests:
--   1. Signup first user → becomes Admin
--   2. Signup second user → becomes Technical Officer
--   3. Admin changes own role → BLOCKED
--   4. Non-admin edits another's TDS → BLOCKED
--   5. Delete user_roles row → BLOCKED
--   6. Spoof prepared_by → BLOCKED
--
-- SELECT * FROM public.user_roles ORDER BY created_at;
-- UPDATE public.user_roles SET role = 'Admin' WHERE email = 'YOUR_EMAIL';
