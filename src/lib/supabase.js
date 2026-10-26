import { createClient } from '@supabase/supabase-js';

// Default initial clinic settings for Indian clinic
const DEFAULT_CLINIC_SETTINGS = {
  id: 'primary',
  clinic_name: 'PrimeCare Multi-Speciality Clinic',
  doctor_name: 'Dr. A. K. Sharma',
  doctor_degree: 'MBBS, MD (Medicine) - Senior Consultant Physician',
  doctor_reg_no: 'HN-48291',
  is_doctor_available: true,
  opd_timing_morning: '9:30 AM – 2:00 PM',
  opd_timing_evening: '5:00 PM – 8:00 PM',
  emergency_notice: 'Doctor is attending emergency rounds at Civil Hospital. Evening OPD will resume at 5:00 PM.',
  phone_number: '+917015846421',
  whatsapp_number: '917015846421',
  clinic_address: 'Opposite Civil Hospital Gate, Court Road, Hansi - 125033 (Hisar Dist.), Haryana',
  google_maps_url: 'https://maps.google.com/?q=Hansi+Civil+Hospital+Court+Road+Haryana'
};

// No dummy demo appointments - empty clean list
const INITIAL_DEMO_APPOINTMENTS = [];
export const DEMO_REFS = ['PC-8401', 'PC-8402', 'PC-8403', 'PC-8404', 'PC-8405'];
export const DEMO_NAMES = ['Sunita Devi', 'Rajesh Verma', 'Aarav Choudhary', 'Pooja Rani', 'Kuldeep Singh'];

// Helper to get active Supabase credentials
export const getStoredCredentials = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const isValid = Boolean(url && key && url.startsWith('http') && !url.includes('your-project'));
  return { url, key, isValid };
};

// Initialize Supabase client if valid credentials exist
const creds = getStoredCredentials();
export const supabase = creds.isValid ? createClient(creds.url, creds.key) : null;

// Local fallback store initialization
const getLocalSettings = () => {
  try {
    const raw = localStorage.getItem('primecare_local_settings');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local settings', e);
  }
  return DEFAULT_CLINIC_SETTINGS;
};

const setLocalSettings = (settings) => {
  localStorage.setItem('primecare_local_settings', JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent('primecare_settings_updated', { detail: settings }));
};

const getLocalAppointments = () => {
  try {
    const raw = localStorage.getItem('primecare_local_appointments');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Filter out any dummy demo appointments
      const clean = parsed.filter(item => 
        !DEMO_REFS.includes(item.booking_reference) && 
        !DEMO_NAMES.includes(item.patient_name) &&
        !['appt-1', 'appt-2', 'appt-3', 'appt-4', 'appt-5'].includes(item.id)
      );
      if (clean.length !== parsed.length) {
        localStorage.setItem('primecare_local_appointments', JSON.stringify(clean));
      }
      return clean;
    }
  } catch (e) {
    console.error('Error reading local appointments', e);
  }
  localStorage.setItem('primecare_local_appointments', JSON.stringify([]));
  return [];
};

const setLocalAppointments = (appointments) => {
  localStorage.setItem('primecare_local_appointments', JSON.stringify(appointments));
  window.dispatchEvent(new CustomEvent('primecare_appointments_updated', { detail: appointments }));
};

// Ensure initial local state is seeded (clean with 0 demo appointments)
if (!localStorage.getItem('primecare_local_settings')) {
  setLocalSettings(DEFAULT_CLINIC_SETTINGS);
}
// Clean up any legacy demo appointments from localStorage immediately
try {
  const existingLocal = localStorage.getItem('primecare_local_appointments');
  if (existingLocal) {
    const parsed = JSON.parse(existingLocal);
    const clean = parsed.filter(item => 
      !DEMO_REFS.includes(item.booking_reference) && 
      !DEMO_NAMES.includes(item.patient_name) &&
      !['appt-1', 'appt-2', 'appt-3', 'appt-4', 'appt-5'].includes(item.id)
    );
    localStorage.setItem('primecare_local_appointments', JSON.stringify(clean));
  } else {
    localStorage.setItem('primecare_local_appointments', JSON.stringify([]));
  }
} catch (e) {}

// -----------------------------------------------------------------------------
// PUBLIC & ADMIN API METHODS
// -----------------------------------------------------------------------------

export async function fetchClinicSettings() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('clinic_settings')
        .select('*')
        .eq('id', 'primary')
        .single();
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase fetchClinicSettings error, using local fallback:', err);
    }
  }
  return getLocalSettings();
}

export async function updateClinicSettings(newSettings) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('clinic_settings')
        .upsert({ ...newSettings, id: 'primary', updated_at: new Date().toISOString() })
        .select()
        .single();
      if (!error && data) {
        setLocalSettings(data);
        return data;
      }
    } catch (err) {
      console.warn('Supabase updateClinicSettings error, updating local:', err);
    }
  }
  const merged = { ...getLocalSettings(), ...newSettings, updated_at: new Date().toISOString() };
  setLocalSettings(merged);
  return merged;
}

export async function fetchAppointments() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        // Filter out any dummy demo appointments from database
        const clean = data.filter(item => 
          !DEMO_REFS.includes(item.booking_reference) && 
          !DEMO_NAMES.includes(item.patient_name)
        );
        return clean;
      }
    } catch (err) {
      console.warn('Supabase fetchAppointments error, using local fallback:', err);
    }
  }
  return getLocalAppointments();
}

export async function purgeDemoAppointments() {
  if (supabase) {
    try {
      await supabase
        .from('appointments')
        .delete()
        .in('booking_reference', DEMO_REFS);
      await supabase
        .from('appointments')
        .delete()
        .in('patient_name', DEMO_NAMES);
    } catch (e) {
      console.warn('Error purging demo appointments from Supabase:', e);
    }
  }
  const current = getLocalAppointments();
  const clean = current.filter(item => 
    !DEMO_REFS.includes(item.booking_reference) && 
    !DEMO_NAMES.includes(item.patient_name)
  );
  setLocalAppointments(clean);
  return clean;
}

export function generateBookingReference() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PC-${suffix}`;
}

export async function createAppointment(appointmentData) {
  const reference = generateBookingReference();
  const newRecord = {
    patient_name: appointmentData.patient_name ? String(appointmentData.patient_name).trim() : '',
    patient_phone: appointmentData.patient_phone ? String(appointmentData.patient_phone).replace(/\D/g, '') : '',
    patient_age: appointmentData.patient_age ? parseInt(appointmentData.patient_age, 10) : null,
    treatment: appointmentData.treatment || 'General Consultation',
    preferred_date: appointmentData.preferred_date,
    preferred_shift: appointmentData.preferred_shift || 'Morning Shift',
    symptoms: appointmentData.symptoms ? String(appointmentData.symptoms).trim() : '',
    booking_reference: reference,
    status: 'pending', // Strictly enforce pending status; client cannot set any other status
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (supabase) {
    // Only INSERT into appointments. Do NOT chain .select() because anonymous users will not have read access after RLS is tightened
    const { error } = await supabase
      .from('appointments')
      .insert([newRecord]);

    if (error) {
      console.error('Supabase createAppointment insert error:', error);
      throw error;
    }
  }

  // Sync to local state and return record so patient can immediately view token slip
  const fallbackRecord = { ...newRecord, id: 'appt-' + Date.now() };
  const current = getLocalAppointments();
  setLocalAppointments([fallbackRecord, ...current]);
  return fallbackRecord;
}

export async function updateAppointmentStatus(id, newStatus) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        const current = getLocalAppointments();
        const updated = current.map(item => item.id === id ? data : item);
        setLocalAppointments(updated);
        return data;
      }
    } catch (err) {
      console.warn('Supabase updateAppointmentStatus error, updating local:', err);
    }
  }

  const current = getLocalAppointments();
  const updated = current.map(item => 
    item.id === id ? { ...item, status: newStatus, updated_at: new Date().toISOString() } : item
  );
  setLocalAppointments(updated);
  return updated.find(i => i.id === id);
}

export async function deleteAppointment(id) {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      if (error) console.warn('Supabase delete error:', error);
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  const current = getLocalAppointments();
  const filtered = current.filter(item => item.id !== id);
  setLocalAppointments(filtered);
  return true;
}

// Subscribe to real-time events across tabs/Supabase
export function subscribeToRealtime(onSettingsChange, onAppointmentsChange) {
  let supabaseChannel = null;

  if (supabase) {
    try {
      supabaseChannel = supabase
        .channel('primecare_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'clinic_settings' },
          (payload) => {
            if (payload.new) onSettingsChange(payload.new);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'appointments' },
          async () => {
            const all = await fetchAppointments();
            onAppointmentsChange(all);
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Supabase realtime subscribe error:', e);
    }
  }

  // Cross-tab & local custom event listeners
  const handleCustomSettings = (e) => onSettingsChange(e.detail);
  const handleCustomAppointments = (e) => onAppointmentsChange(e.detail);
  const handleStorage = (e) => {
    if (e.key === 'primecare_local_settings') {
      onSettingsChange(getLocalSettings());
    } else if (e.key === 'primecare_local_appointments') {
      onAppointmentsChange(getLocalAppointments());
    }
  };

  window.addEventListener('primecare_settings_updated', handleCustomSettings);
  window.addEventListener('primecare_appointments_updated', handleCustomAppointments);
  window.addEventListener('storage', handleStorage);

  return () => {
    if (supabase && supabaseChannel) {
      supabase.removeChannel(supabaseChannel);
    }
    window.removeEventListener('primecare_settings_updated', handleCustomSettings);
    window.removeEventListener('primecare_appointments_updated', handleCustomAppointments);
    window.removeEventListener('storage', handleStorage);
  };
}

// -----------------------------------------------------------------------------
// AUTHENTICATION UTILITIES
// -----------------------------------------------------------------------------

export async function adminLogin(email, password) {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are configured.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: password
  });

  if (error) {
    throw error;
  }

  return { success: true, user: data?.user, session: data?.session };
}

export async function adminLogout() {
  if (supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Supabase signOut error:', error);
      throw error;
    }
  }
  return true;
}

export async function getAdminSession() {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export function saveSupabaseConfig(url, key) {
  localStorage.setItem('primecare_supabase_url', url.trim());
  localStorage.setItem('primecare_supabase_key', key.trim());
  window.location.reload();
}

export function clearSupabaseConfig() {
  localStorage.removeItem('primecare_supabase_url');
  localStorage.removeItem('primecare_supabase_key');
  window.location.reload();
}
