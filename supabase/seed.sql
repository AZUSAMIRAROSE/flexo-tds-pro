-- Insert test users (run this after creating users in Supabase Auth)
-- User IDs will be replaced with actual Supabase auth.users IDs

-- Sample Admin user role (replace USER_ID with actual UUID)
-- INSERT INTO user_roles (user_id, role, assigned_by) 
-- VALUES ('ADMIN_USER_UUID', 'Admin', 'ADMIN_USER_UUID');

-- Sample customers
INSERT INTO customers (name, location) VALUES
  ('EPL', 'Vapi'),
  ('ABC Packaging Ltd.', 'Mumbai'),
  ('XYZ Flexo Corp', 'Pune'),
  ('Supreme Labels', 'Ahmedabad');

-- Sample machines
INSERT INTO machines (customer_id, machine_code, machine_name, default_unit_count)
SELECT 
  c.id,
  'FX-200A',
  'Siegwerk India Pvt. Ltd.',
  6
FROM customers c WHERE c.name = 'EPL';

INSERT INTO machines (customer_id, machine_code, machine_name, default_unit_count)
SELECT 
  c.id,
  'FX-300B',
  'Siegwerk India Pvt. Ltd.',
  8
FROM customers c WHERE c.name = 'ABC Packaging Ltd.';

INSERT INTO machines (customer_id, machine_code, machine_name, default_unit_count)
SELECT 
  c.id,
  'FX-150C',
  'Siegwerk India Pvt. Ltd.',
  4
FROM customers c WHERE c.name = 'XYZ Flexo Corp';

-- Sample TDS record (Draft status)
WITH inserted_tds AS (
  INSERT INTO tds_records (
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
    status
  )
  SELECT 
    c.id,
    m.id,
    CURRENT_DATE,
    'ORD-2025-0142',
    6,
    'Conversion',
    'PET Shrink Sleeve 80µ',
    'AW-2024-VER3',
    'Rajesh Kumar',
    120,
    15,
    '1',
    'Production',
    'PET',
    'Corona Treated',
    350,
    TRUE,
    800,
    'Front',
    38,
    'Draft'
  FROM customers c
  JOIN machines m ON m.customer_id = c.id
  WHERE c.name = 'EPL' AND m.machine_code = 'FX-200A'
  RETURNING id
)
-- Sample units for the TDS
INSERT INTO tds_units (
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
SELECT 
  id,
  1,
  'Cyan',
  360,
  'LPI',
  4.5,
  'CCM',
  'INX ECO-4000 Cyan',
  'BT2025042801',
  1200,
  85,
  'Blue'
FROM inserted_tds
UNION ALL
SELECT 
  id,
  2,
  'Magenta',
  400,
  'LPI',
  5.2,
  'CCM',
  'INX ECO-4000 Magenta',
  'BT2025042802',
  1150,
  90,
  'Blue'
FROM inserted_tds
UNION ALL
SELECT 
  id,
  3,
  'Yellow',
  400,
  'LPI',
  5.0,
  'CCM',
  'INX ECO-4000 Yellow',
  'BT2025042803',
  1180,
  88,
  'Green'
FROM inserted_tds;