-- Update "Clinical Trial Support" to "Clinical trial support" in ai_assessment_results table
UPDATE ai_assessment_results 
SET top_processes = REPLACE(top_processes::text, 'Clinical Trial Support', 'Clinical trial support')::jsonb
WHERE top_processes::text LIKE '%Clinical Trial Support%';
