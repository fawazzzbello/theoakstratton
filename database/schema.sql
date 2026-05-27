-- Phase 1: Database Schema for Oakstratton Admin Features
-- This file defines the schema for PostgreSQL

-- Users table for admin accounts
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(254) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'manager' CHECK (role IN ('admin', 'manager', 'superadmin')),
  is_superadmin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  password_changed_at TIMESTAMP,
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

-- Landing content management
CREATE TABLE IF NOT EXISTS landing_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name VARCHAR(100) NOT NULL,
  section_key VARCHAR(255) NOT NULL UNIQUE,
  content_type VARCHAR(50) CHECK (content_type IN ('text', 'json', 'html', 'image_url')) DEFAULT 'text',
  content_value TEXT,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  version INT DEFAULT 1
);

-- Pricing plans for Stripe integration
CREATE TABLE IF NOT EXISTS pricing_plans (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_gbp INTEGER NOT NULL,
  recurring BOOLEAN DEFAULT false,
  stripe_product_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  features JSONB DEFAULT '[]'::jsonb,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders from Stripe payments
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_email VARCHAR(254) NOT NULL,
  customer_name VARCHAR(255),
  plan_id VARCHAR(100) REFERENCES pricing_plans(id) ON DELETE SET NULL,
  amount_gbp INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'gbp',
  stripe_session_id VARCHAR(255) UNIQUE,
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' CHECK (
    status IN ('pending', 'completed', 'failed', 'refunded', 'canceled')
  ),
  invoice_url TEXT,
  receipt_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email campaigns for bulk sending
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  segment VARCHAR(50) NOT NULL CHECK (segment IN ('all', 'waitlist', 'contacted', 'customers', 'new')),
  recipient_count INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent')),
  sent_at TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaign sends tracking
CREATE TABLE IF NOT EXISTS campaign_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP
);

-- Testimonials for landing page
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  company VARCHAR(255),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  image_url VARCHAR(500),
  is_featured BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Navigation menu items for dynamic header
CREATE TABLE IF NOT EXISTS navigation_menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label VARCHAR(100) NOT NULL,
  href VARCHAR(255) NOT NULL,
  icon VARCHAR(50),
  parent_id UUID REFERENCES navigation_menu(id) ON DELETE CASCADE,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_events_lead_id ON email_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_landing_content_section_key ON landing_content(section_key);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_is_active ON pricing_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_active ON testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_segment ON email_campaigns(segment);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_campaign_id ON campaign_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_lead_id ON campaign_sends(lead_id);
CREATE INDEX IF NOT EXISTS idx_navigation_menu_parent_id ON navigation_menu(parent_id);
CREATE INDEX IF NOT EXISTS idx_navigation_menu_display_order ON navigation_menu(display_order);
CREATE INDEX IF NOT EXISTS idx_navigation_menu_is_active ON navigation_menu(is_active);

-- Create views for common queries
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM leads) as total_leads,
  (SELECT COUNT(*) FROM leads WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '7 days') as new_this_week,
  (SELECT COUNT(*) FROM email_templates WHERE is_active = true) as active_templates,
  (SELECT COUNT(*) FROM leads WHERE status = 'customer') as converted_customers,
  (SELECT COALESCE(ROUND(100 * COUNT(CASE WHEN status = 'customer' THEN 1 END)::numeric / NULLIF(COUNT(*)::numeric, 0), 2), 0)
   FROM leads WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '30 days') as engagement_rate;
