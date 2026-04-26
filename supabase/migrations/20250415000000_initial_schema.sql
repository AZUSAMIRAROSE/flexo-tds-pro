-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_created_at ON customers(created_at DESC);

-- ============================================
-- MACHINES TABLE
-- ============================================
CREATE TABLE machines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  machine_code TEXT NOT NULL UNIQUE,
  machine_name TEXT,
  default_unit_count INTEGER DEFAULT 10 CHECK (default_unit_count BETWEEN 1 AND 20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_machines_customer ON machines(customer_id);
CREATE INDEX idx_machines_code ON machines(machine_code);

-- ============================================
-- TDS RECORDS TABLE
-- ============================================
CREATE TABLE tds_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
  
  -- Job Information
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  order_number TEXT NOT NULL,
  num_units INTEGER DEFAULT 10 CHECK (num_units BETWEEN 1 AND 20),
  job_type TEXT,
  job_product_name TEXT,
  design_artwork_bromide TEXT,
  operator_name TEXT,
  speed_mpm INTEGER CHECK (speed_mpm BETWEEN 0 AND 500),
  downtime_min INTEGER CHECK (downtime_min BETWEEN 0 AND 999),
  shift_no TEXT,
  action_on_job TEXT,
  
  -- Substrate · Corona · Foil Details
  substrate_laminate TEXT,
  surface_type TEXT,
  width_mm INTEGER CHECK (width_mm BETWEEN 50 AND 2000),
  corona_treatment BOOLEAN DEFAULT FALSE,
  corona_wattage INTEGER CHECK (corona_wattage BETWEEN 0 AND 2000),
  corona_treatment_side TEXT,
  corona_dyne_level INTEGER CHECK (corona_dyne_level BETWEEN 0 AND 100),
  foil_supplier TEXT,
  foil_type TEXT,
  foil_colour_finish TEXT,
  
  -- Quality Parameters
  tape_test TEXT CHECK (tape_test IN ('Pass', 'Fail', 'N/A')),
  flow_marks TEXT CHECK (flow_marks IN ('Pass', 'Fail', 'N/A')),
  flex_test TEXT CHECK (flex_test IN ('Pass', 'Fail', 'N/A')),
  graphite_test TEXT CHECK (graphite_test IN ('Pass', 'Fail', 'N/A')),
  adhesion_test TEXT CHECK (adhesion_test IN ('Pass', 'Fail', 'N/A')),
  rub_scuff_test TEXT CHECK (rub_scuff_test IN ('Pass', 'Fail', 'N/A')),
  ink_lay_tone_check TEXT CHECK (ink_lay_tone_check IN ('Pass', 'Fail', 'N/A')),
  overall_result TEXT CHECK (overall_result IN ('Pass', 'Conditional', 'Fail')),
  quality_notes TEXT,
  
  -- Metadata
  status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Completed', 'Approved')),
  prepared_by UUID REFERENCES auth.users(id),
  prepared_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tds_customer ON tds_records(customer_id);
CREATE INDEX idx_tds_machine ON tds_records(machine_id);
CREATE INDEX idx_tds_date ON tds_records(date DESC);
CREATE INDEX idx_tds_order ON tds_records(order_number);
CREATE INDEX idx_tds_status ON tds_records(status);
CREATE INDEX idx_tds_prepared_by ON tds_records(prepared_by);

-- ============================================
-- TDS UNITS TABLE
-- ============================================
CREATE TABLE tds_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tds_record_id UUID NOT NULL REFERENCES tds_records(id) ON DELETE CASCADE,
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
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tds_record_id, unit_no)
);

CREATE INDEX idx_tds_units_record ON tds_units(tds_record_id);
CREATE INDEX idx_tds_units_batch_code ON tds_units(batch_code);
CREATE INDEX idx_tds_units_ink_name ON tds_units(ink_name);

-- ============================================
-- ACTIVITY LOG TABLE
-- ============================================
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tds_record_id UUID REFERENCES tds_records(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_tds ON activity_log(tds_record_id, timestamp DESC);
CREATE INDEX idx_activity_user ON activity_log(user_id, timestamp DESC);

-- ============================================
-- USER ROLES TABLE
-- ============================================
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Technical Officer', 'Viewer')),
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role)
);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check user role
CREATE OR REPLACE FUNCTION has_role(check_user_id UUID, check_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = check_user_id AND role = check_role
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_machines_updated_at BEFORE UPDATE ON machines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tds_records_updated_at BEFORE UPDATE ON tds_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tds_units_updated_at BEFORE UPDATE ON tds_units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE tds_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE tds_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- CUSTOMERS POLICIES
CREATE POLICY "Anyone authenticated can view customers" ON customers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "TOs and Admins can insert customers" ON customers
  FOR INSERT WITH CHECK (
    has_role(auth.uid(), 'Technical Officer') OR 
    has_role(auth.uid(), 'Admin')
  );

CREATE POLICY "TOs and Admins can update customers" ON customers
  FOR UPDATE USING (
    has_role(auth.uid(), 'Technical Officer') OR 
    has_role(auth.uid(), 'Admin')
  );

CREATE POLICY "Admins can delete customers" ON customers
  FOR DELETE USING (has_role(auth.uid(), 'Admin'));

-- MACHINES POLICIES
CREATE POLICY "Anyone authenticated can view machines" ON machines
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "TOs and Admins can insert machines" ON machines
  FOR INSERT WITH CHECK (
    has_role(auth.uid(), 'Technical Officer') OR 
    has_role(auth.uid(), 'Admin')
  );

CREATE POLICY "TOs and Admins can update machines" ON machines
  FOR UPDATE USING (
    has_role(auth.uid(), 'Technical Officer') OR 
    has_role(auth.uid(), 'Admin')
  );

CREATE POLICY "Admins can delete machines" ON machines
  FOR DELETE USING (has_role(auth.uid(), 'Admin'));

-- TDS RECORDS POLICIES
CREATE POLICY "Anyone authenticated can view TDS records" ON tds_records
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "TOs and Admins can create Draft TDS" ON tds_records
  FOR INSERT WITH CHECK (
    status = 'Draft' AND (
      has_role(auth.uid(), 'Technical Officer') OR 
      has_role(auth.uid(), 'Admin')
    )
  );

CREATE POLICY "TOs and Admins can edit their Draft TDS" ON tds_records
  FOR UPDATE USING (
    (status = 'Draft' AND prepared_by = auth.uid()) OR
    has_role(auth.uid(), 'Admin')
  );

CREATE POLICY "TOs and Admins can mark as Completed" ON tds_records
  FOR UPDATE USING (
    (has_role(auth.uid(), 'Technical Officer') OR has_role(auth.uid(), 'Admin'))
    AND status IN ('Draft', 'Completed')
  )
  WITH CHECK (
    status IN ('Draft', 'Completed')
  );

CREATE POLICY "Only Admins can Approve" ON tds_records
  FOR UPDATE USING (
    has_role(auth.uid(), 'Admin') AND status = 'Completed'
  )
  WITH CHECK (
    status = 'Approved'
  );

CREATE POLICY "TOs and Admins can delete Draft TDS" ON tds_records
  FOR DELETE USING (
    status = 'Draft' AND (
      prepared_by = auth.uid() OR 
      has_role(auth.uid(), 'Admin')
    )
  );

-- TDS UNITS POLICIES
CREATE POLICY "Anyone authenticated can view units" ON tds_units
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "TOs and Admins can manage units" ON tds_units
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tds_records 
      WHERE id = tds_units.tds_record_id 
      AND (
        (status = 'Draft' AND prepared_by = auth.uid()) OR
        has_role(auth.uid(), 'Admin')
      )
    )
  );

-- ACTIVITY LOG POLICIES
CREATE POLICY "Anyone authenticated can view activity log" ON activity_log
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert activity log" ON activity_log
  FOR INSERT WITH CHECK (true);

-- USER ROLES POLICIES
CREATE POLICY "Anyone authenticated can view their own roles" ON user_roles
  FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'Admin'));

CREATE POLICY "Only Admins can manage roles" ON user_roles
  FOR ALL USING (has_role(auth.uid(), 'Admin'));