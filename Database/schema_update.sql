-- Migration to add AI feedback to answers
ALTER TABLE answers ADD COLUMN IF NOT EXISTS ai_feedback JSONB;
