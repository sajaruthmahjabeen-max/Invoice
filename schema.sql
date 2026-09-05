-- ===================================================
-- Trillion Thunders (KMS) — Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor
-- Dashboard: https://supabase.com/dashboard/project/qhuhngicocldbcmbegfg/sql
-- ===================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CLINICS / HOSPITALS TABLE
CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  invoice_no TEXT NOT NULL UNIQUE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  clinic_name TEXT NOT NULL,
  date TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(12, 2) DEFAULT 0.00,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'Generated',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. PRODUCTS & SIZES TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sizes TEXT NOT NULL,
  spec TEXT,
  rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. COMPANY PROFILE & SETTINGS TABLE
CREATE TABLE IF NOT EXISTS company_settings (
  id INT PRIMARY KEY DEFAULT 1,
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

-- 6. Insert Default Company Settings Row
INSERT INTO company_settings (id, company_name, tagline, address, phone, email, website, invoice_prefix, authorized_signature)
VALUES (1, 'Trilion Thunders Company', 'Clinic & Hospital Covers', '123, Business Street, Chennai - 600001', '+91 98765 43210', 'support@trilionthunders.com', 'www.trilionthunders.com', 'INV-2026-', 'Saju Mauji')
ON CONFLICT (id) DO NOTHING;

-- 7. ENABLE ROW LEVEL SECURITY (RLS) & ALLOW ANONYMOUS ACCESS FOR THIS APP
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Allow full read/write for all users (Anon Key)
CREATE POLICY "Allow anon all on clinics" ON clinics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on bills" ON bills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on company_settings" ON company_settings FOR ALL USING (true) WITH CHECK (true);
