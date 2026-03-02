-- =============================================
-- Rural TN Clinic Booker – Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('patient', 'doctor')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  specialization TEXT NOT NULL,
  available_slots JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT CHECK (status IN ('booked', 'completed', 'cancelled')) DEFAULT 'booked',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_id, appointment_date, appointment_time)
);

-- =============================================
-- Row Level Security Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Users: users can read all, but only update their own
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Doctors: anyone can read, only doctor can update their own
CREATE POLICY "Anyone can view doctors" ON doctors
  FOR SELECT USING (true);

CREATE POLICY "Doctors can update own profile" ON doctors
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Doctors can insert own profile" ON doctors
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Appointments: patients see their own, doctors see theirs
CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT USING (
    auth.uid() = patient_id OR auth.uid() = doctor_id
  );

CREATE POLICY "Patients can create appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE USING (
    auth.uid() = patient_id OR auth.uid() = doctor_id
  );

-- =============================================
-- Seed Data: Sample doctors
-- =============================================

-- Note: Replace UUIDs with actual auth user IDs after registration

-- INSERT INTO users (id, name, email, role) VALUES
--   ('d1111111-1111-1111-1111-111111111111', 'Dr. Kavitha Sundaram', 'kavitha@phc.tn.gov.in', 'doctor'),
--   ('d2222222-2222-2222-2222-222222222222', 'Dr. Murugan Rajan', 'murugan@phc.tn.gov.in', 'doctor'),
--   ('d3333333-3333-3333-3333-333333333333', 'Dr. Lakshmi Narayanan', 'lakshmi@phc.tn.gov.in', 'doctor');

-- INSERT INTO doctors (id, specialization, available_slots) VALUES
--   ('d1111111-1111-1111-1111-111111111111', 'General Medicine', '["09:00","09:30","10:00","10:30","11:00","14:00","14:30","15:00"]'),
--   ('d2222222-2222-2222-2222-222222222222', 'Pediatrics', '["09:00","10:00","11:00","14:00","15:00","16:00"]'),
--   ('d3333333-3333-3333-3333-333333333333', 'Obstetrics & Gynecology', '["10:00","10:30","11:00","11:30","14:00","14:30"]');
