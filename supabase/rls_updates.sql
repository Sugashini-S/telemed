-- =============================================
-- RLS Policy Updates for Protected Routes & Slot Availability
-- Run this in Supabase SQL Editor
-- =============================================

-- NOTE: The existing schema already has these policies in place:
--   "Anyone can view doctors" → FOR SELECT USING (true)
-- This means even authenticated users CAN read doctors.
-- However, if you want to restrict doctors to ONLY authenticated users,
-- run the following:

-- Step 1: Drop the old open policy (optional, only if restricting)
-- DROP POLICY IF EXISTS "Anyone can view doctors" ON doctors;

-- Step 2: Create a policy restricting to authenticated users only
-- CREATE POLICY "Authenticated users can view doctors" ON doctors
--   FOR SELECT USING (auth.role() = 'authenticated');

-- =============================================
-- Allow authenticated users to read appointments for slot availability
-- (needed for the booking page to check which slots are taken)
-- =============================================

-- The current policy only allows patient/doctor to see their own appointments.
-- For slot availability checking, we need patients to see all appointments 
-- for a specific doctor+date (just the time, not personal data).
-- 
-- Option A: Add a broader SELECT policy (simpler, hackathon-ready)
-- This allows any authenticated user to see appointment times for any doctor.

DO $$
BEGIN
    -- Only create the policy if it doesn't already exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'appointments' 
        AND policyname = 'Authenticated users can check slot availability'
    ) THEN
        EXECUTE 'CREATE POLICY "Authenticated users can check slot availability" ON appointments
            FOR SELECT USING (auth.role() = ''authenticated'')';
    END IF;
END
$$;

-- =============================================
-- Verify policies are correct
-- =============================================
-- Run this to check all active policies:
-- SELECT tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('users', 'doctors', 'appointments')
-- ORDER BY tablename, policyname;
