-- Create positioning_results table for slide 9 sticker columns
CREATE TABLE IF NOT EXISTS positioning_results (
  id SERIAL PRIMARY KEY,
  at_risk INTEGER NOT NULL DEFAULT 0,
  competitive INTEGER NOT NULL DEFAULT 0,
  differentiated INTEGER NOT NULL DEFAULT 0,
  leading INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a single default row (we'll only ever have one row that gets updated)
INSERT INTO positioning_results (at_risk, competitive, differentiated, leading)
VALUES (0, 0, 0, 0)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE positioning_results ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (admin-only via service role)
CREATE POLICY "Allow all operations for service role" ON positioning_results
  FOR ALL USING (true) WITH CHECK (true);
