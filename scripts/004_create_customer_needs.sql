-- Customer Needs Assessment Results Table
-- Stores numerical ratings for 5 categories (Resilience, Power, Value, Innovation, Intelligence)
-- across 4 subcategories (Providers, Pharmacies, Pharma Manufacturers, Health Systems)

CREATE TABLE IF NOT EXISTS customer_needs_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  group_name TEXT,
  
  -- Resilience values for each subcategory
  resilience_providers INTEGER DEFAULT 0,
  resilience_pharmacies INTEGER DEFAULT 0,
  resilience_pharma_manufacturers INTEGER DEFAULT 0,
  resilience_health_systems INTEGER DEFAULT 0,
  
  -- Power values for each subcategory
  power_providers INTEGER DEFAULT 0,
  power_pharmacies INTEGER DEFAULT 0,
  power_pharma_manufacturers INTEGER DEFAULT 0,
  power_health_systems INTEGER DEFAULT 0,
  
  -- Value values for each subcategory
  value_providers INTEGER DEFAULT 0,
  value_pharmacies INTEGER DEFAULT 0,
  value_pharma_manufacturers INTEGER DEFAULT 0,
  value_health_systems INTEGER DEFAULT 0,
  
  -- Innovation values for each subcategory
  innovation_providers INTEGER DEFAULT 0,
  innovation_pharmacies INTEGER DEFAULT 0,
  innovation_pharma_manufacturers INTEGER DEFAULT 0,
  innovation_health_systems INTEGER DEFAULT 0,
  
  -- Intelligence values for each subcategory
  intelligence_providers INTEGER DEFAULT 0,
  intelligence_pharmacies INTEGER DEFAULT 0,
  intelligence_pharma_manufacturers INTEGER DEFAULT 0,
  intelligence_health_systems INTEGER DEFAULT 0,
  
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_needs_session_id ON customer_needs_results(session_id);
CREATE INDEX IF NOT EXISTS idx_customer_needs_group_name ON customer_needs_results(group_name);

ALTER TABLE customer_needs_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON customer_needs_results 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select all" ON customer_needs_results 
  FOR SELECT USING (true);

CREATE POLICY "Allow updates" ON customer_needs_results 
  FOR UPDATE USING (true);
