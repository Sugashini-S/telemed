-- =============================================
-- Admin Panel Setup - Migration
-- =============================================

-- 1. Update users role constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('patient', 'doctor', 'admin'));

-- 2. Add approval status to doctors
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;

-- 3. Update RLS for Admin
-- Admin can view everything
CREATE POLICY "Admin can view all users" ON users FOR SELECT USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin can view all doctors" ON doctors FOR SELECT USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin can view all appointments" ON appointments FOR SELECT USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Admin can update everything
CREATE POLICY "Admin can update users" ON users FOR UPDATE USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin can update doctors" ON doctors FOR UPDATE USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin can update appointments" ON appointments FOR UPDATE USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Admin can insert
CREATE POLICY "Admin can insert doctors" ON doctors FOR INSERT WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);
