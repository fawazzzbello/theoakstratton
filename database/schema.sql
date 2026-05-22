-- Phase 1: Database Schema for Oakstratton Admin Features
-- This file defines the schema for PostgreSQL

-- Users table for admin accounts
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(254) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'manager' CHECK (role IN ('admin', 'manager')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL CHECK (
    category IN ('waitlist_welcome', 'contact_confirmation', 'admin_alert', 'custom')
  ),
  subject VARCHAR(255) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Enhanced leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(254) UNIQUE NOT NULL,
  name VARCHAR(255),
  company VARCHAR(255),
  phone VARCHAR(20),
  source VARCHAR(50) CHECK (source IN ('waitlist', 'contact', 'payment')) DEFAULT 'contact',
  status VARCHAR(50) DEFAULT 'new' CHECK (
    status IN ('new', 'contacted', 'qualified', 'customer', 'unsubscribed')
  ),
  notes TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_contacted TIMESTAMP
);

-- Email delivery tracking
CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  event_type VARCHAR(50) CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

-- Analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL CHECK (
    event_type IN ('page_view', 'form_submit', 'waitlist_join', 'payment_attempt', 'template_opened', 'link_clicked')
  ),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- Alert/Notification system
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) CHECK (type IN ('success', 'error', 'warning', 'info')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,
  is_system BOOLEAN DEFAULT false
);

-- Transactions table (existing, kept for compatibility)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  customer_email VARCHAR(254),
  customer_name VARCHAR(255),
  amount INTEGER,
  currency VARCHAR(3) DEFAULT 'gbp',
  payment_method VARCHAR(50),
  bnpl_provider VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending' CHECK (
    status IN ('pending', 'succeeded', 'failed', 'refunded')
  ),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_events_lead_id ON email_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Create views for common queries
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM leads) as total_leads,
  (SELECT COUNT(*) FROM leads WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '7 days') as new_this_week,
  (SELECT COUNT(*) FROM email_templates WHERE is_active = true) as active_templates,
  (SELECT COUNT(*) FROM leads WHERE status = 'customer') as converted_customers,
  (SELECT COALESCE(ROUND(100 * COUNT(CASE WHEN status = 'customer' THEN 1 END)::numeric / COUNT(*)::numeric, 2), 0)
   FROM leads WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '30 days') as engagement_rate;
