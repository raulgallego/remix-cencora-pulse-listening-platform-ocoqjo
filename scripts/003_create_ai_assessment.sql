-- Create table for AI disruption assessment results
CREATE TABLE IF NOT EXISTS ai_assessment_results (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  group_name TEXT,
  top_processes JSONB,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster session lookups
CREATE INDEX IF NOT EXISTS idx_ai_assessment_session ON ai_assessment_results(session_id);
