-- Add group_name column to assessment_results table
ALTER TABLE assessment_results 
ADD COLUMN IF NOT EXISTS group_name TEXT;

-- Create index for group_name for faster queries
CREATE INDEX IF NOT EXISTS idx_assessment_results_group_name ON assessment_results(group_name);
