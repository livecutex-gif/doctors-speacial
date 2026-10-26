-- ==============================================================================
-- PrimeCare Clinic & Diagnostic Center - Supabase Database Schema
-- Production Ready Migration for Indian Private Clinics
-- ==============================================================================

-- 1. Create clinic_settings table
CREATE TABLE IF NOT EXISTS public.clinic_settings (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    clinic_name TEXT NOT NULL DEFAULT 'PrimeCare Multi-Speciality Clinic',
    doctor_name TEXT NOT NULL DEFAULT 'Dr. A. K. Sharma',
    doctor_degree TEXT NOT NULL DEFAULT 'MBBS, MD (Medicine) - AIIMS Alumnus',
    doctor_reg_no TEXT NOT NULL DEFAULT 'HN-48291',
    is_doctor_available BOOLEAN NOT NULL DEFAULT true,
    opd_timing_morning TEXT NOT NULL DEFAULT '9:30 AM – 2:00 PM',
    opd_timing_evening TEXT NOT NULL DEFAULT '5:00 PM – 8:00 PM',
    emergency_notice TEXT DEFAULT 'Doctor is attending emergency surgery at Civil Hospital. Emergency OPD will resume at 6:00 PM.',
    phone_number TEXT NOT NULL DEFAULT '+917015846421',
    whatsapp_number TEXT NOT NULL DEFAULT '917015846421',
    clinic_address TEXT NOT NULL DEFAULT 'Opposite Civil Hospital Gate, Court Road, Hansi - 125033, Hisar District, Haryana',
    google_maps_url TEXT NOT NULL DEFAULT 'https://maps.google.com',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed initial clinic settings row if not exists
INSERT INTO public.clinic_settings (
    id, clinic_name, doctor_name, doctor_degree, doctor_reg_no, 
    is_doctor_available, opd_timing_morning, opd_timing_evening, 
    emergency_notice, phone_number, whatsapp_number, clinic_address
) VALUES (
    'primary',
    'PrimeCare Multi-Speciality Clinic',
    'Dr. A. K. Sharma',
    'MBBS, MD (Medicine) - Senior Consultant Physician',
    'HN-48291',
    true,
    '9:30 AM – 2:00 PM',
    '5:00 PM – 8:00 PM',
    'OPD Closed temporarily for scheduled hospital rounds. For urgent consultations, please call reception directly.',
    '+917015846421',
    '917015846421',
    'Opposite Civil Hospital Gate, Court Road, Hansi - 125033 (Hisar Dist.), Haryana'
) ON CONFLICT (id) DO NOTHING;

-- 2. Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference TEXT NOT NULL UNIQUE,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    patient_age INTEGER,
    treatment TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_shift TEXT NOT NULL,
    symptoms TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for speedy searching and filtering
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(preferred_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_phone ON public.appointments(patient_phone);

-- 3. Row Level Security (RLS) setup
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Clean up legacy policies if present
DROP POLICY IF EXISTS "Public Update Clinic Settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "Public & Admin Update Clinic Settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "Public Insert Appointments" ON public.appointments;
DROP POLICY IF EXISTS "Manage Appointments" ON public.appointments;

-- Clinic Settings: Anyone can read (needed for public timings, notice, doctor availability)
CREATE POLICY "Anyone can read clinic settings" ON public.clinic_settings
  FOR SELECT TO anon, authenticated USING (true);

-- Clinic Settings: Only authenticated staff can update
CREATE POLICY "Staff update clinic settings" ON public.clinic_settings
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Appointments: Anyone (anon or logged-in) can book, but STRICTLY status = 'pending'
CREATE POLICY "Anyone can book pending" ON public.appointments
  FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending');

-- Appointments: Only authenticated staff can read patient records
CREATE POLICY "Staff read appointments" ON public.appointments
  FOR SELECT TO authenticated USING (true);

-- Appointments: Only authenticated staff can update status (confirm, cancel, complete)
CREATE POLICY "Staff update appointments" ON public.appointments
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Appointments: Only authenticated staff can delete appointments
CREATE POLICY "Staff delete appointments" ON public.appointments
  FOR DELETE TO authenticated USING (true);

-- 4. Enable Supabase Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.clinic_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

-- 5. Clean setup: Purge any dummy demo appointments if present
DELETE FROM public.appointments 
WHERE booking_reference IN ('PC-8401', 'PC-8402', 'PC-8403', 'PC-8404', 'PC-8405')
   OR patient_name IN ('Sunita Devi', 'Rajesh Verma', 'Aarav Choudhary', 'Pooja Rani', 'Kuldeep Singh');
