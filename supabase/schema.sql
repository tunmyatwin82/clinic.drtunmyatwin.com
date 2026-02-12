-- =============================================
-- Dr. Tun Myat Win Clinic Database Schema
-- Supabase PostgreSQL
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth DATE,
  address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =============================================
-- PATIENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emergency_contact TEXT,
  blood_type TEXT,
  allergies TEXT[] DEFAULT '{}',
  medical_conditions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);

-- =============================================
-- DOCTORS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  specialization TEXT NOT NULL,
  qualifications TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  consultation_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  available_days TEXT[] DEFAULT '{"monday", "tuesday", "wednesday", "thursday", "friday"}',
  available_hours JSONB DEFAULT '{"start": "09:00", "end": "17:00"}',
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);

-- =============================================
-- APPOINTMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  type TEXT NOT NULL DEFAULT 'video' CHECK (type IN ('video', 'audio', 'chat')),
  notes TEXT,
  symptoms TEXT,
  diagnosis TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- =============================================
-- PRESCRIPTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  medications JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment_id ON prescriptions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);

-- =============================================
-- MEDICAL RECORDS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'other' CHECK (type IN ('lab_result', 'imaging', 'report', 'prescription', 'other')),
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_type ON medical_records(type);

-- =============================================
-- PAYMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MMK',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  transaction_id TEXT,
  screenshot_url TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_patient_id ON payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- =============================================
-- MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'file')),
  file_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for conversation queries
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('appointment', 'payment', 'message', 'system')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- =============================================
-- STORAGE BUCKETS
-- =============================================
-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('health-records', 'health-records', false),
  ('payment-screenshots', 'payment-screenshots', false),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Patients policies
CREATE POLICY "Patients can view their own data" ON patients
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Doctors can view all patients" ON patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE u.id::text = auth.uid()::text
    )
  );

-- Appointments policies
CREATE POLICY "Patients can view their own appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = patient_id AND p.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Doctors can view their appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM doctors d
      WHERE d.id = doctor_id AND d.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Patients can create appointments" ON appointments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = patient_id AND p.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Doctors can update appointments" ON appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM doctors d
      WHERE d.id = doctor_id AND d.user_id::text = auth.uid()::text
    )
  );

-- Medical records policies
CREATE POLICY "Patients can view their own medical records" ON medical_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = patient_id AND p.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Doctors can view patient records" ON medical_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM doctors d
      WHERE d.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Doctors can create medical records" ON medical_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM doctors d
      WHERE d.user_id::text = auth.uid()::text
    )
  );

-- Payments policies
CREATE POLICY "Patients can view their own payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = patient_id AND p.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Doctors can view payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM doctors d
      WHERE d.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Patients can create payments" ON payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = patient_id AND p.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Patients can update payments" ON payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = patient_id AND p.user_id::text = auth.uid()::text
    )
  );

-- Messages policies
CREATE POLICY "Users can view their messages" ON messages
  FOR SELECT USING (
    sender_id::text = auth.uid()::text OR receiver_id::text = auth.uid()::text
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id::text = auth.uid()::text);

CREATE POLICY "Users can update their received messages" ON messages
  FOR UPDATE USING (receiver_id::text = auth.uid()::text);

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (user_id::text = auth.uid()::text);

-- =============================================
-- STORAGE POLICIES
-- =============================================

-- Health records storage policy
CREATE POLICY "Users can upload health records"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'health-records');

CREATE POLICY "Users can view their health records"
ON storage.objects FOR SELECT
USING (bucket_id = 'health-records');

-- Payment screenshots storage policy
CREATE POLICY "Users can upload payment screenshots"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-screenshots');

CREATE POLICY "Users can view payment screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-screenshots');

-- Avatars storage policy (public)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars');

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SEED DATA (OPTIONAL)
-- =============================================

-- Insert default doctor (Dr. Tun Myat Win)
-- Note: You should change the email and password after first login
INSERT INTO users (id, email, name, phone, role, gender)
VALUES (
  'doctor-001',
  'doctor@clinic.com',
  'ဒေါက်တာထွန်းမြတ်ဝင်း',
  '0942068582',
  'doctor',
  'male'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO doctors (id, user_id, specialization, qualifications, experience_years, consultation_fee, bio)
VALUES (
  'doctor-profile-001',
  'doctor-001',
  'အမျိုးသားကျန်းမာရေး & အာရုံကြောဆိုင်ရာ',
  ARRAY['MBBS', 'MD (Neurology)'],
  15,
  30000,
  'အမျိုးသားကျန်းမာရေးနှင့် အာရုံကြောစနစ်ပြဿနာများအတွက် ပညာရှင် ဆရာဝန်ကြီး'
) ON CONFLICT (id) DO NOTHING;

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- View for patient appointment history with details
CREATE OR REPLACE VIEW patient_appointment_history AS
SELECT 
  a.id AS appointment_id,
  a.date,
  a.start_time,
  a.end_time,
  a.status,
  a.type,
  a.symptoms,
  a.diagnosis,
  p.id AS patient_id,
  u_p.name AS patient_name,
  u_p.phone AS patient_phone,
  d.id AS doctor_id,
  u_d.name AS doctor_name,
  d.specialization,
  pr.medications,
  pay.amount,
  pay.status AS payment_status
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN users u_p ON p.user_id = u_p.id
JOIN doctors d ON a.doctor_id = d.id
JOIN users u_d ON d.user_id = u_d.id
LEFT JOIN prescriptions pr ON a.id = pr.appointment_id
LEFT JOIN payments pay ON a.id = pay.appointment_id;

-- View for doctor's daily schedule
CREATE OR REPLACE VIEW doctor_daily_schedule AS
SELECT 
  a.id AS appointment_id,
  a.date,
  a.start_time,
  a.end_time,
  a.status,
  p.id AS patient_id,
  u.name AS patient_name,
  u.phone AS patient_phone,
  a.symptoms
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN users u ON p.user_id = u.id
WHERE a.status IN ('pending', 'confirmed')
ORDER BY a.date, a.start_time;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant necessary permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions for anon users (if needed)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
