-- =============================================
-- Dr. Tun Myat Win Clinic Database Schema
-- Oracle Cloud PostgreSQL (clinic schema)
-- =============================================

-- Set search path to clinic schema
SET search_path TO clinic;

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS clinic.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth DATE,
  address TEXT,
  avatar_url TEXT,
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_clinic_users_email ON clinic.users(email);

-- =============================================
-- PATIENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS clinic.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES clinic.users(id) ON DELETE CASCADE,
  emergency_contact TEXT,
  blood_type TEXT,
  allergies TEXT[] DEFAULT '{}',
  medical_conditions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_clinic_patients_user_id ON clinic.patients(user_id);

-- =============================================
-- DOCTORS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS clinic.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES clinic.users(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_clinic_doctors_user_id ON clinic.doctors(user_id);

-- =============================================
-- APPOINTMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS clinic.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES clinic.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES clinic.doctors(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_clinic_appointments_patient_id ON clinic.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinic_appointments_doctor_id ON clinic.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_clinic_appointments_date ON clinic.appointments(date);
CREATE INDEX IF NOT EXISTS idx_clinic_appointments_status ON clinic.appointments(status);

-- =============================================
-- PRESCRIPTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS clinic.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES clinic.appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES clinic.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES clinic.doctors(id) ON DELETE CASCADE,
  medications JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clinic_prescriptions_appointment_id ON clinic.prescriptions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_clinic_prescriptions_patient_id ON clinic.prescriptions(patient_id);

-- =============================================
-- MEDICAL RECORDS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS clinic.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES clinic.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES clinic.doctors(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES clinic.appointments(id) ON DELETE SET NULL,
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
CREATE INDEX IF NOT EXISTS idx_clinic_medical_records_patient_id ON clinic.medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinic_medical_records_type ON clinic.medical_records(type);

-- =============================================
-- PAYMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS clinic.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES clinic.appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES clinic.patients(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_clinic_payments_appointment_id ON clinic.payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_clinic_payments_patient_id ON clinic.payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinic_payments_status ON clinic.payments(status);

-- =============================================
-- MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS clinic.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES clinic.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES clinic.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'file')),
  file_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for conversation queries
CREATE INDEX IF NOT EXISTS idx_clinic_messages_sender_id ON clinic.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_clinic_messages_receiver_id ON clinic.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_clinic_messages_created_at ON clinic.messages(created_at);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS clinic.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES clinic.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('appointment', 'payment', 'message', 'system')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clinic_notifications_user_id ON clinic.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_clinic_notifications_read ON clinic.notifications(read);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION clinic.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
DROP TRIGGER IF EXISTS update_clinic_users_updated_at ON clinic.users;
CREATE TRIGGER update_clinic_users_updated_at
  BEFORE UPDATE ON clinic.users
  FOR EACH ROW
  EXECUTE FUNCTION clinic.update_updated_at_column();

DROP TRIGGER IF EXISTS update_clinic_patients_updated_at ON clinic.patients;
CREATE TRIGGER update_clinic_patients_updated_at
  BEFORE UPDATE ON clinic.patients
  FOR EACH ROW
  EXECUTE FUNCTION clinic.update_updated_at_column();

DROP TRIGGER IF EXISTS update_clinic_doctors_updated_at ON clinic.doctors;
CREATE TRIGGER update_clinic_doctors_updated_at
  BEFORE UPDATE ON clinic.doctors
  FOR EACH ROW
  EXECUTE FUNCTION clinic.update_updated_at_column();

DROP TRIGGER IF EXISTS update_clinic_appointments_updated_at ON clinic.appointments;
CREATE TRIGGER update_clinic_appointments_updated_at
  BEFORE UPDATE ON clinic.appointments
  FOR EACH ROW
  EXECUTE FUNCTION clinic.update_updated_at_column();

DROP TRIGGER IF EXISTS update_clinic_prescriptions_updated_at ON clinic.prescriptions;
CREATE TRIGGER update_clinic_prescriptions_updated_at
  BEFORE UPDATE ON clinic.prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION clinic.update_updated_at_column();

DROP TRIGGER IF EXISTS update_clinic_medical_records_updated_at ON clinic.medical_records;
CREATE TRIGGER update_clinic_medical_records_updated_at
  BEFORE UPDATE ON clinic.medical_records
  FOR EACH ROW
  EXECUTE FUNCTION clinic.update_updated_at_column();

DROP TRIGGER IF EXISTS update_clinic_payments_updated_at ON clinic.payments;
CREATE TRIGGER update_clinic_payments_updated_at
  BEFORE UPDATE ON clinic.payments
  FOR EACH ROW
  EXECUTE FUNCTION clinic.update_updated_at_column();

-- =============================================
-- SEED DATA (DEFAULT DOCTOR)
-- =============================================

-- Insert default doctor (Dr. Tun Myat Win)
INSERT INTO clinic.users (id, email, name, phone, role, gender, password_hash)
VALUES (
  'doctor-001',
  'doctor@clinic.com',
  'ဒေါက်တာထွန်းမြတ်ဝင်း',
  '0942068582',
  'doctor',
  'male',
  '$2a$10$dummyHashForNow12345678901234567890'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO clinic.doctors (id, user_id, specialization, qualifications, experience_years, consultation_fee, bio)
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
-- GRANT PERMISSIONS
-- =============================================

-- Grant permissions for admin user
GRANT ALL ON ALL TABLES IN SCHEMA clinic TO admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA clinic TO admin;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA clinic TO admin;

-- Verify tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'clinic';
