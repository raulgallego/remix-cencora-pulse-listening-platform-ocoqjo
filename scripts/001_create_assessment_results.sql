CREATE TABLE IF NOT EXISTS assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE,
  answers JSONB NOT NULL,
  strengths JSONB NOT NULL,
  growth_areas JSONB NOT NULL,
  tag_counts JSONB NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessment_results_session_id ON assessment_results(session_id);

ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON assessment_results 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select by session" ON assessment_results 
  FOR SELECT USING (true);

CREATE POLICY "Allow updates" ON assessment_results 
  FOR UPDATE USING (true);
