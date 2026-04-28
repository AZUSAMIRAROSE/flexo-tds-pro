BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

UPDATE public.user_roles ur
SET
  email = COALESCE(ur.email, au.email),
  full_name = COALESCE(ur.full_name, au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  assigned_at = COALESCE(ur.assigned_at, ur.created_at, now()),
  created_at = COALESCE(ur.created_at, now()),
  updated_at = COALESCE(ur.updated_at, now())
FROM auth.users au
WHERE au.id = ur.user_id;

WITH ranked_roles AS (
  SELECT
    ctid,
    user_id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY
        CASE role
          WHEN 'Admin' THEN 1
          WHEN 'Technical Officer' THEN 2
          WHEN 'Viewer' THEN 3
          ELSE 4
        END,
        COALESCE(assigned_at, created_at, now()) ASC
    ) AS role_rank
  FROM public.user_roles
)
DELETE FROM public.user_roles ur
USING ranked_roles rr
WHERE ur.ctid = rr.ctid
  AND rr.role_rank > 1;

UPDATE public.user_roles
SET id = gen_random_uuid()
WHERE id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_user_id_unique
  ON public.user_roles (user_id);

COMMIT;
