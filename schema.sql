-- ========================================================
-- IMPORTANT 1-CLICK MIGRATION: RUN THIS IN SUPABASE SQL EDITOR
-- Dashboard: https://supabase.com/dashboard/project/qhuhngicocldbcmbegfg/sql/new
--
-- Enables Multi-User Account Separation & Privacy:
-- Each user account gets their own isolated bills, clinics, products, staff & settings!
-- All existing legacy records are safely assigned to salihathasneem@gmail.com.
-- ========================================================

-- 1. Add user_id column to all tables (if not already present)
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS user_id TEXT;

-- 2. Precision & Stocks upgrade
ALTER TABLE products ALTER COLUMN rate TYPE NUMERIC(12, 4);
ALTER TABLE bills ALTER COLUMN subtotal TYPE NUMERIC(12, 4);
ALTER TABLE bills ALTER COLUMN total_amount TYPE NUMERIC(12, 4);
ALTER TABLE products ADD COLUMN IF NOT EXISTS stocks JSONB DEFAULT '{}'::jsonb;

-- 3. Update unique constraint so invoices are unique per user, not globally across all users
ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_invoice_no_key;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bills_user_invoice_unique'
  ) THEN
    ALTER TABLE bills ADD CONSTRAINT bills_user_invoice_unique UNIQUE (user_id, invoice_no);
  END IF;
END $$;

-- 4. Preserve existing records by attaching them to salihathasneem@gmail.com
UPDATE clinics SET user_id = 'salihathasneem@gmail.com' WHERE user_id IS NULL;
UPDATE bills SET user_id = 'salihathasneem@gmail.com' WHERE user_id IS NULL;
UPDATE products SET user_id = 'salihathasneem@gmail.com' WHERE user_id IS NULL;
UPDATE company_settings SET user_id = 'salihathasneem@gmail.com' WHERE user_id IS NULL;
UPDATE employees SET user_id = 'salihathasneem@gmail.com' WHERE user_id IS NULL;
UPDATE attendance SET user_id = 'salihathasneem@gmail.com' WHERE user_id IS NULL;

-- 5. Enable Row Level Security (RLS) with full Anon/Authenticated access
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on clinics" ON clinics;
CREATE POLICY "Allow anon all on clinics" ON clinics FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on bills" ON bills;
CREATE POLICY "Allow anon all on bills" ON bills FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on products" ON products;
CREATE POLICY "Allow anon all on products" ON products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on company_settings" ON company_settings;
CREATE POLICY "Allow anon all on company_settings" ON company_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on employees" ON employees;
CREATE POLICY "Allow anon all on employees" ON employees FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on attendance" ON attendance;
CREATE POLICY "Allow anon all on attendance" ON attendance FOR ALL USING (true) WITH CHECK (true);

-- ===================================================
-- Trillion Thunders (KMS) — Full Supabase Database Schema
-- Dashboard: https://supabase.com/dashboard/project/qhuhngicocldbcmbegfg/sql
-- ===================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CLINICS / HOSPITALS TABLE
CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  total_billed NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. BILLS / INVOICES TABLE
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  invoice_no TEXT NOT NULL,
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  clinic_name TEXT NOT NULL,
  date TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(12, 4) DEFAULT 0.00,
  total_amount NUMERIC(12, 4) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'Generated',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. PRODUCTS & SIZES TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  name TEXT NOT NULL,
  sizes TEXT NOT NULL,
  spec TEXT,
  rate NUMERIC(12, 4) NOT NULL DEFAULT 0.00,
  stocks JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. COMPANY PROFILE & SETTINGS TABLE
CREATE TABLE IF NOT EXISTS company_settings (
  id INT PRIMARY KEY DEFAULT 1,
  user_id TEXT,
  company_name TEXT NOT NULL DEFAULT 'Trilion Thunders Company',
  tagline TEXT DEFAULT 'Clinic & Hospital Covers',
  address TEXT DEFAULT '123, Business Street, Chennai - 600001',
  phone TEXT DEFAULT '+91 98765 43210',
  email TEXT DEFAULT 'support@trilionthunders.com',
  website TEXT DEFAULT 'www.trilionthunders.com',
  invoice_prefix TEXT DEFAULT 'INV-2026-',
  authorized_signature TEXT DEFAULT 'Saju Mauji',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. EMPLOYEES / STAFF TABLE
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  name TEXT NOT NULL,
  role TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. ATTENDANCE LOGS TABLE
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Present',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
