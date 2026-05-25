-- Migration: Fix database schema for production
-- Critical fix: Add missing columns to users table

-- 1. Add missing columns to users table (these are required for user management)
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_superadmin BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP;

-- 2. Fix the dashboard_stats view to handle division by zero
DROP VIEW IF EXISTS dashboard_stats CASCADE;

CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM leads) as total_leads,
  (SELECT COUNT(*) FROM leads WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '7 days') as new_this_week,
  (SELECT COUNT(*) FROM email_templates WHERE is_active = true) as active_templates,
  (SELECT COUNT(*) FROM leads WHERE status = 'customer') as converted_customers,
  (SELECT COALESCE(ROUND(100 * COUNT(CASE WHEN status = 'customer' THEN 1 END)::numeric / NULLIF(COUNT(*)::numeric, 0), 2), 0)
   FROM leads WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '30 days') as engagement_rate;

