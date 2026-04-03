-- Migration: Add test_name column to test_feedback table
-- This is safe for production as it adds nullable column
ALTER TABLE `test_feedback` ADD `test_name` text;

-- Optionally backfill existing records with test names from tests table
-- UPDATE test_feedback SET test_name = (
--   SELECT title FROM tests WHERE tests.id = test_feedback.test_id
-- ) WHERE test_name IS NULL;