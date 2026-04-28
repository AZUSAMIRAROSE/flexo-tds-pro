-- ============================================================
-- FlexoTDS Pro - Fresh Supabase Setup
-- Project URL: https://wzjlipiktcegjooyldbk.supabase.co
--
-- Paste this whole file into Supabase SQL Editor and run it once.
-- It resets only this app's public tables.
-- It creates/keeps the "templates" storage bucket, but does not delete files from it.
-- It does NOT delete Supabase Auth users.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 0. CLEAN RESET FOR THIS APP
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Templates authenticated read" ON storage.objects;
DROP POLICY IF EXISTS "Templates admins upload" ON storage.objects;
DROP POLICY IF EXISTS "Templates admins update" ON storage.objects;
DROP POLICY IF EXISTS "Templates admins delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read templates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload templates" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update templates" ON storage.objects;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP TABLE IF EXISTS public.tds_units CASCADE;
DROP TABLE IF EXISTS public.activity_log CASCADE;
DROP TABLE IF EXISTS public.tds_records CASCADE;
DROP TABLE IF EXISTS public.machines CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.prevent_zero_admins() CASCADE;
DROP FUNCTION IF EXISTS public.prevent_user_role_user_id_change() CASCADE;
DROP FUNCTION IF EXISTS public.set_tds_record_defaults() CASCADE;
DROP FUNCTION IF EXISTS public.set_activity_log_defaults() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(UUID, TEXT) CASCADE;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- 1. TABLES
-- ------------------------------------------------------------

CREATE TABLE public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  role TEXT NOT NULL DEFAULT 'Technical Officer'
    CHECK (role IN ('Admin', 'Technical Officer', 'Viewer')),
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  machine_code TEXT NOT NULL UNIQUE,
  machine_name TEXT,
  default_unit_count INTEGER NOT NULL DEFAULT 10
    CHECK (default_unit_count BETWEEN 1 AND 20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.tds_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  machine_id UUID REFERENCES public.machines(id) ON DELETE SET NULL,

  date DATE NOT NULL DEFAULT CURRENT_DATE,
  order_number TEXT NOT NULL,
  num_units INTEGER NOT NULL DEFAULT 10 CHECK (num_units BETWEEN 1 AND 20),
  job_type TEXT,
  job_product_name TEXT,
  design_artwork_bromide TEXT,
  operator_name TEXT,
  speed_mpm INTEGER CHECK (speed_mpm BETWEEN 0 AND 500),
  downtime_min INTEGER CHECK (downtime_min BETWEEN 0 AND 999),
  shift_no TEXT,
  action_on_job TEXT,

  substrate_laminate TEXT,
  surface_type TEXT,
  width_mm INTEGER CHECK (width_mm BETWEEN 50 AND 2000),
  corona_treatment BOOLEAN NOT NULL DEFAULT false,
  corona_wattage INTEGER CHECK (corona_wattage BETWEEN 0 AND 2000),
  corona_treatment_side TEXT,
  corona_dyne_level INTEGER CHECK (corona_dyne_level BETWEEN 0 AND 100),
  foil_supplier TEXT,
  foil_type TEXT,
  foil_colour_finish TEXT,

  tape_test TEXT CHECK (tape_test IN ('Pass', 'Fail', 'N/A')),
  flow_marks TEXT CHECK (flow_marks IN ('Pass', 'Fail', 'N/A')),
  flex_test TEXT CHECK (flex_test IN ('Pass', 'Fail', 'N/A')),
  graphite_test TEXT CHECK (graphite_test IN ('Pass', 'Fail', 'N/A')),
  adhesion_test TEXT CHECK (adhesion_test IN ('Pass', 'Fail', 'N/A')),
  rub_scuff_test TEXT CHECK (rub_scuff_test IN ('Pass', 'Fail', 'N/A')),
  ink_lay_tone_check TEXT CHECK (ink_lay_tone_check IN ('Pass', 'Fail', 'N/A')),
  overall_result TEXT CHECK (overall_result IN ('Pass', 'Conditional', 'Fail')),
  quality_notes TEXT,

  status TEXT NOT NULL DEFAULT 'Draft'
    CHECK (status IN ('Draft', 'Completed', 'Approved')),
  prepared_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  prepared_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.tds_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tds_record_id UUID NOT NULL REFERENCES public.tds_records(id) ON DELETE CASCADE,
  unit_no INTEGER NOT NULL CHECK (unit_no BETWEEN 1 AND 20),

  color_station TEXT,
  anilox_value NUMERIC(10, 2),
  anilox_unit TEXT CHECK (anilox_unit IN ('LPI', 'LCM')),
  volume_value NUMERIC(10, 2),
  volume_unit TEXT CHECK (volume_unit IN ('CCM', 'BCM')),
  ink_name TEXT,
  batch_code TEXT,
  lamp_hrs INTEGER CHECK (lamp_hrs BETWEEN 0 AND 9999),
  intensity_pct INTEGER CHECK (intensity_pct BETWEEN 0 AND 100),
  unit_remarks TEXT,
  plate_tape TEXT CHECK (plate_tape IN ('Red', 'Blue', 'Green', 'Orange')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(tds_record_id, unit_no)
);

CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tds_record_id UUID REFERENCES public.tds_records(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2. INDEXES
-- ------------------------------------------------------------

CREATE INDEX idx_user_roles_user_role ON public.user_roles(user_id, role);
CREATE UNIQUE INDEX one_admin_only ON public.user_roles((1)) WHERE role = 'Admin';

CREATE INDEX idx_customers_name ON public.customers(name);
CREATE INDEX idx_customers_created_at ON public.customers(created_at DESC);

CREATE INDEX idx_machines_customer ON public.machines(customer_id);
CREATE INDEX idx_machines_code ON public.machines(machine_code);

CREATE INDEX idx_tds_customer ON public.tds_records(customer_id);
CREATE INDEX idx_tds_machine ON public.tds_records(machine_id);
CREATE INDEX idx_tds_date ON public.tds_records(date DESC);
CREATE INDEX idx_tds_order ON public.tds_records(order_number);
CREATE INDEX idx_tds_status ON public.tds_records(status);
CREATE INDEX idx_tds_prepared_by ON public.tds_records(prepared_by);

CREATE INDEX idx_tds_units_record ON public.tds_units(tds_record_id);
CREATE INDEX idx_tds_units_batch_code ON public.tds_units(batch_code);
CREATE INDEX idx_tds_units_ink_name ON public.tds_units(ink_name);

CREATE INDEX idx_activity_tds ON public.activity_log(tds_record_id, timestamp DESC);
CREATE INDEX idx_activity_user ON public.activity_log(user_id, timestamp DESC);

-- ------------------------------------------------------------
-- 3. HELPER FUNCTIONS AND TRIGGERS
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.has_role(check_user_id UUID, check_role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = check_user_id
      AND role = check_role
  );
$$;

REVOKE ALL ON FUNCTION public.has_role(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_tds_record_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.prepared_by IS NULL THEN
    NEW.prepared_by = auth.uid();
  END IF;

  IF NEW.status IS NULL THEN
    NEW.status = 'Draft';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_activity_log_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id = auth.uid();
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_zero_admins()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD.role = 'Admin' THEN
    IF (SELECT COUNT(*) FROM public.user_roles WHERE role = 'Admin') = 1 THEN
      RAISE EXCEPTION 'Cannot remove the last admin. The system must always have at least one admin.';
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.role = 'Admin' AND NEW.role <> 'Admin' THEN
    IF (SELECT COUNT(*) FROM public.user_roles WHERE role = 'Admin') = 1 THEN
      RAISE EXCEPTION 'Cannot remove the last admin. The system must always have at least one admin.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_user_role_user_id_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.user_id <> OLD.user_id THEN
    RAISE EXCEPTION 'Changing user_roles.user_id is not allowed.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_machines_updated_at
  BEFORE UPDATE ON public.machines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tds_records_updated_at
  BEFORE UPDATE ON public.tds_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tds_units_updated_at
  BEFORE UPDATE ON public.tds_units
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_tds_record_defaults
  BEFORE INSERT ON public.tds_records
  FOR EACH ROW EXECUTE FUNCTION public.set_tds_record_defaults();

CREATE TRIGGER set_activity_log_defaults
  BEFORE INSERT ON public.activity_log
  FOR EACH ROW EXECUTE FUNCTION public.set_activity_log_defaults();

CREATE TRIGGER ensure_admin_exists_update
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_zero_admins();

CREATE TRIGGER ensure_admin_exists_delete
  BEFORE DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_zero_admins();

CREATE TRIGGER prevent_user_role_user_id_change
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_user_role_user_id_change();

-- ------------------------------------------------------------
-- 4. AUTH SIGNUP TRIGGER
-- First auth user becomes Admin. Later users become Technical Officer.
-- Existing auth users are backfilled below.
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role TEXT;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('flextds_first_admin_lock'));

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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill auth users that already exist.
-- Priority admin email is the email from your pasted SQL.
WITH ranked_users AS (
  SELECT
    u.id,
    u.email,
    u.raw_user_meta_data,
    row_number() OVER (
      ORDER BY
        CASE WHEN lower(u.email) = lower('a9560747278@gmail.com') THEN 0 ELSE 1 END,
        u.created_at ASC
    ) AS rn
  FROM auth.users u
)
INSERT INTO public.user_roles (user_id, role, email, full_name)
SELECT
  id,
  CASE WHEN rn = 1 THEN 'Admin' ELSE 'Technical Officer' END,
  email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
FROM ranked_users
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, public.user_roles.full_name);

-- ------------------------------------------------------------
-- 5. ROW LEVEL SECURITY
-- ------------------------------------------------------------

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tds_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tds_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'Admin'));

CREATE POLICY "Admins can update other user roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'Admin') AND user_id <> auth.uid())
WITH CHECK (public.has_role(auth.uid(), 'Admin') AND user_id <> auth.uid());

CREATE POLICY "Block role deletion"
ON public.user_roles
FOR DELETE
USING (false);

CREATE POLICY "Authenticated users can view customers"
ON public.customers
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "TOs and admins can insert customers"
ON public.customers
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'Technical Officer')
  OR public.has_role(auth.uid(), 'Admin')
);

CREATE POLICY "TOs and admins can update customers"
ON public.customers
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'Technical Officer')
  OR public.has_role(auth.uid(), 'Admin')
)
WITH CHECK (
  public.has_role(auth.uid(), 'Technical Officer')
  OR public.has_role(auth.uid(), 'Admin')
);

CREATE POLICY "Admins can delete customers"
ON public.customers
FOR DELETE
USING (public.has_role(auth.uid(), 'Admin'));

CREATE POLICY "Authenticated users can view machines"
ON public.machines
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "TOs and admins can insert machines"
ON public.machines
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'Technical Officer')
  OR public.has_role(auth.uid(), 'Admin')
);

CREATE POLICY "TOs and admins can update machines"
ON public.machines
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'Technical Officer')
  OR public.has_role(auth.uid(), 'Admin')
)
WITH CHECK (
  public.has_role(auth.uid(), 'Technical Officer')
  OR public.has_role(auth.uid(), 'Admin')
);

CREATE POLICY "Admins can delete machines"
ON public.machines
FOR DELETE
USING (public.has_role(auth.uid(), 'Admin'));

CREATE POLICY "Authenticated users can view TDS records"
ON public.tds_records
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "TOs and admins can create draft TDS"
ON public.tds_records
FOR INSERT
WITH CHECK (
  status = 'Draft'
  AND prepared_by = auth.uid()
  AND (
    public.has_role(auth.uid(), 'Technical Officer')
    OR public.has_role(auth.uid(), 'Admin')
  )
);

CREATE POLICY "TOs can update own draft or completed TDS"
ON public.tds_records
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'Technical Officer')
  AND prepared_by = auth.uid()
  AND status IN ('Draft', 'Completed')
)
WITH CHECK (
  prepared_by = auth.uid()
  AND status IN ('Draft', 'Completed')
);

CREATE POLICY "Admins can update TDS records"
ON public.tds_records
FOR UPDATE
USING (public.has_role(auth.uid(), 'Admin'))
WITH CHECK (public.has_role(auth.uid(), 'Admin'));

CREATE POLICY "Owners and admins can delete draft TDS"
ON public.tds_records
FOR DELETE
USING (
  status = 'Draft'
  AND (
    prepared_by = auth.uid()
    OR public.has_role(auth.uid(), 'Admin')
  )
);

CREATE POLICY "Authenticated users can view TDS units"
ON public.tds_units
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Owners and admins can insert TDS units"
ON public.tds_units
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.tds_records tr
    WHERE tr.id = tds_record_id
      AND tr.status IN ('Draft', 'Completed')
      AND (
        tr.prepared_by = auth.uid()
        OR public.has_role(auth.uid(), 'Admin')
      )
  )
);

CREATE POLICY "Owners and admins can update TDS units"
ON public.tds_units
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.tds_records tr
    WHERE tr.id = tds_record_id
      AND tr.status IN ('Draft', 'Completed')
      AND (
        tr.prepared_by = auth.uid()
        OR public.has_role(auth.uid(), 'Admin')
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.tds_records tr
    WHERE tr.id = tds_record_id
      AND tr.status IN ('Draft', 'Completed')
      AND (
        tr.prepared_by = auth.uid()
        OR public.has_role(auth.uid(), 'Admin')
      )
  )
);

CREATE POLICY "Owners and admins can delete TDS units"
ON public.tds_units
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.tds_records tr
    WHERE tr.id = tds_record_id
      AND tr.status IN ('Draft', 'Completed')
      AND (
        tr.prepared_by = auth.uid()
        OR public.has_role(auth.uid(), 'Admin')
      )
  )
);

CREATE POLICY "Users can insert own activity"
ON public.activity_log
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own activity"
ON public.activity_log
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all activity"
ON public.activity_log
FOR SELECT
USING (public.has_role(auth.uid(), 'Admin'));

-- ------------------------------------------------------------
-- 6. STORAGE BUCKET AND STORAGE POLICIES
-- ------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('templates', 'templates', false)
ON CONFLICT (id) DO UPDATE SET public = false;

CREATE POLICY "Templates authenticated read"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'templates'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Templates admins upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'templates'
  AND public.has_role(auth.uid(), 'Admin')
);

CREATE POLICY "Templates admins update"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'templates'
  AND public.has_role(auth.uid(), 'Admin')
)
WITH CHECK (
  bucket_id = 'templates'
  AND public.has_role(auth.uid(), 'Admin')
);

CREATE POLICY "Templates admins delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'templates'
  AND public.has_role(auth.uid(), 'Admin')
);

-- ------------------------------------------------------------
-- 7. API GRANTS
-- ------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ------------------------------------------------------------
-- 8. SAMPLE DATA
-- These rows help you confirm the app is working.
-- ------------------------------------------------------------

INSERT INTO public.customers (name, location)
VALUES
  ('EPL', 'Vapi'),
  ('ABC Packaging Ltd.', 'Mumbai'),
  ('XYZ Flexo Corp', 'Pune'),
  ('Supreme Labels', 'Ahmedabad');

INSERT INTO public.machines (customer_id, machine_code, machine_name, default_unit_count)
SELECT c.id, 'FX-200A', 'Siegwerk India Pvt. Ltd.', 6
FROM public.customers c
WHERE c.name = 'EPL'
ON CONFLICT (machine_code) DO UPDATE SET
  customer_id = EXCLUDED.customer_id,
  machine_name = EXCLUDED.machine_name,
  default_unit_count = EXCLUDED.default_unit_count;

INSERT INTO public.machines (customer_id, machine_code, machine_name, default_unit_count)
SELECT c.id, 'FX-300B', 'Siegwerk India Pvt. Ltd.', 8
FROM public.customers c
WHERE c.name = 'ABC Packaging Ltd.'
ON CONFLICT (machine_code) DO UPDATE SET
  customer_id = EXCLUDED.customer_id,
  machine_name = EXCLUDED.machine_name,
  default_unit_count = EXCLUDED.default_unit_count;

INSERT INTO public.machines (customer_id, machine_code, machine_name, default_unit_count)
SELECT c.id, 'FX-150C', 'Siegwerk India Pvt. Ltd.', 4
FROM public.customers c
WHERE c.name = 'XYZ Flexo Corp'
ON CONFLICT (machine_code) DO UPDATE SET
  customer_id = EXCLUDED.customer_id,
  machine_name = EXCLUDED.machine_name,
  default_unit_count = EXCLUDED.default_unit_count;

WITH inserted_tds AS (
  INSERT INTO public.tds_records (
    customer_id,
    machine_id,
    date,
    order_number,
    num_units,
    job_type,
    job_product_name,
    design_artwork_bromide,
    operator_name,
    speed_mpm,
    downtime_min,
    shift_no,
    action_on_job,
    substrate_laminate,
    surface_type,
    width_mm,
    corona_treatment,
    corona_wattage,
    corona_treatment_side,
    corona_dyne_level,
    prepared_by,
    status
  )
  SELECT
    c.id,
    m.id,
    CURRENT_DATE,
    'ORD-2026-0001',
    6,
    'Conversion',
    'PET Shrink Sleeve 80u',
    'AW-2026-VER1',
    'Rajesh Kumar',
    120,
    15,
    '1',
    'Production',
    'PET',
    'Corona Treated',
    350,
    true,
    800,
    'Front',
    38,
    (SELECT user_id FROM public.user_roles WHERE role = 'Admin' LIMIT 1),
    'Draft'
  FROM public.customers c
  JOIN public.machines m ON m.customer_id = c.id
  WHERE c.name = 'EPL'
    AND m.machine_code = 'FX-200A'
  RETURNING id
)
INSERT INTO public.tds_units (
  tds_record_id,
  unit_no,
  color_station,
  anilox_value,
  anilox_unit,
  volume_value,
  volume_unit,
  ink_name,
  batch_code,
  lamp_hrs,
  intensity_pct,
  plate_tape
)
SELECT id, 1, 'Cyan', 360, 'LPI', 4.5, 'CCM', 'INX ECO-4000 Cyan', 'BT2026042801', 1200, 85, 'Blue'
FROM inserted_tds
UNION ALL
SELECT id, 2, 'Magenta', 400, 'LPI', 5.2, 'CCM', 'INX ECO-4000 Magenta', 'BT2026042802', 1150, 90, 'Blue'
FROM inserted_tds
UNION ALL
SELECT id, 3, 'Yellow', 400, 'LPI', 5.0, 'CCM', 'INX ECO-4000 Yellow', 'BT2026042803', 1180, 88, 'Green'
FROM inserted_tds;

COMMIT;
