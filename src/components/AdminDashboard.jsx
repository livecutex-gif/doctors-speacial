import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Search, 
  Trash2, 
  LogOut, 
  Globe, 
  Plus, 
  Edit3, 
  Send, 
  Database, 
  Settings, 
  RefreshCw, 
  Calendar,
  X,
  MessageCircle,
  Copy,
  Check,
  Printer,
  Download,
  Volume2,
  UserCheck,
  Stethoscope,
  ChevronRight
} from 'lucide-react';
import { 
  fetchClinicSettings, 
  updateClinicSettings, 
  fetchAppointments, 
  updateAppointmentStatus, 
  deleteAppointment,
  createAppointment,
  adminLogout,
  getStoredCredentials,
  saveSupabaseConfig,
  clearSupabaseConfig,
  subscribeToRealtime,
  purgeDemoAppointments
} from '../lib/supabase';
import { CLINIC_SERVICES } from './Services';
import { playReceptionChime } from '../lib/sound';

export default function AdminDashboard({ onLogout, onGoToSite, addToast }) {
  const [settings, setSettings] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [activeTab, setActiveTab] = useState('Today'); // 'Today', 'Tomorrow', 'Pending', 'All'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Supabase Config in modal
  const creds = getStoredCredentials();
  const [customUrl, setCustomUrl] = useState(creds.url);
  const [customKey, setCustomKey] = useState(creds.key);
  const [copiedSql, setCopiedSql] = useState(false);

  // Today & Tomorrow strings in YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  // Walk-in form state
  const [walkinForm, setWalkinForm] = useState({
    patient_name: '',
    patient_phone: '',
    patient_age: '',
    treatment: CLINIC_SERVICES[0].title,
    preferred_date: todayStr,
    preferred_shift: 'Morning Shift (9:30 AM - 2:00 PM)',
    symptoms: 'Walk-in OPD patient'
  });

  const [showPrintRegister, setShowPrintRegister] = useState(false);
  const appointmentsRef = React.useRef([]);

  useEffect(() => {
    appointmentsRef.current = appointments;
  }, [appointments]);

  // Load data on mount
  useEffect(() => {
    loadDashboardData();

    // Subscribe to live changes
    const unsubscribe = subscribeToRealtime(
      (newSettings) => setSettings(newSettings),
      (newAppointments) => {
        if (newAppointments && appointmentsRef.current.length > 0 && newAppointments.length > appointmentsRef.current.length) {
          playReceptionChime();
          const newest = newAppointments[0];
          addToast(`🔔 New OPD Booking: ${newest?.patient_name} (Token #${newest?.booking_reference})`, 'info');
        }
        setAppointments(newAppointments);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Purge any legacy demo names first
      await purgeDemoAppointments();
      const [s, a] = await Promise.all([
        fetchClinicSettings(),
        fetchAppointments()
      ]);
      setSettings(s);
      setAppointments(a);
      setAnnouncementText(s?.emergency_notice || '');
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Doctor Availability
  const handleToggleDoctorAvailable = async () => {
    if (!settings) return;
    const newStatus = !settings.is_doctor_available;
    // Optimistic UI
    setSettings(prev => ({ ...prev, is_doctor_available: newStatus }));
    try {
      await updateClinicSettings({ is_doctor_available: newStatus });
      addToast(newStatus ? 'Doctor is now marked Available for OPD' : 'Doctor is now marked Unavailable (Notice active)', 'success');
    } catch (err) {
      addToast('Failed to update doctor availability', 'error');
    }
  };

  // Save Custom Announcement
  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await updateClinicSettings({ emergency_notice: announcementText });
      setSettings(prev => ({ ...prev, emergency_notice: announcementText }));
      setShowAnnouncementModal(false);
      addToast('OPD announcement updated successfully', 'success');
    } catch (err) {
      addToast('Could not save announcement', 'error');
    }
  };

  // Status Change
  const handleStatusChange = async (appointmentId, newStatus) => {
    // Optimistic update
    setAppointments(prev =>
      prev.map(item => item.id === appointmentId ? { ...item, status: newStatus } : item)
    );
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
      addToast(`Status updated to ${newStatus.toUpperCase()}`, 'success');
    } catch (err) {
      addToast('Error updating appointment status', 'error');
    }
  };

  // Delete Appointment
  const handleDeleteAppointment = async (appointmentId) => {
    // Optimistic remove
    setAppointments(prev => prev.filter(item => item.id !== appointmentId));
    setDeleteConfirmId(null);
    try {
      await deleteAppointment(appointmentId);
      addToast('Appointment removed from schedule', 'info');
    } catch (err) {
      addToast('Error deleting appointment', 'error');
    }
  };

  // Handle Walk-in Booking Submission
  const handleWalkinSubmit = async (e) => {
    e.preventDefault();
    if (!walkinForm.patient_name || !walkinForm.patient_phone) {
      addToast('Name and mobile number are required', 'error');
      return;
    }
    try {
      const record = await createAppointment({
        ...walkinForm,
        patient_age: walkinForm.patient_age ? parseInt(walkinForm.patient_age, 10) : null
      });
      setShowWalkinModal(false);
      setWalkinForm({
        patient_name: '',
        patient_phone: '',
        patient_age: '',
        treatment: CLINIC_SERVICES[0].title,
        preferred_date: todayStr,
        preferred_shift: 'Morning Shift (9:30 AM - 2:00 PM)',
        symptoms: 'Walk-in OPD patient'
      });
      addToast(`Walk-in appointment #${record.booking_reference} registered!`, 'success');
    } catch (err) {
      addToast('Failed to register walk-in', 'error');
    }
  };

  // WhatsApp Confirmation Sender
  const openWhatsAppConfirmation = (appt) => {
    const rawPhone = appt.patient_phone.replace(/\D/g, '');
    const cleanPhone = rawPhone.startsWith('91') ? rawPhone : `91${rawPhone}`;
    const clinicName = settings?.clinic_name || 'PrimeCare Multi-Speciality Clinic';
    
    const message = encodeURIComponent(
      `Namaste ${appt.patient_name} ji, aapki appointment ${clinicName} mein ${appt.preferred_date} (${appt.preferred_shift}) ke liye CONFIRM ho gayi hai. Token ID: ${appt.booking_reference}. Kripya samay par pahunche.`
    );
    
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    // Also auto-confirm status if pending
    if (appt.status === 'pending') {
      handleStatusChange(appt.id, 'confirmed');
    }
  };

  // KPI Calculations
  const kpiStats = useMemo(() => {
    const todayList = appointments.filter(a => a.preferred_date === todayStr);
    const pendingList = appointments.filter(a => a.status === 'pending');
    const confirmedTodayList = todayList.filter(a => a.status === 'confirmed' || a.status === 'completed');
    
    return {
      todayCount: todayList.length,
      pendingCount: pendingList.length,
      confirmedTodayCount: confirmedTodayList.length,
      totalCount: appointments.length
    };
  }, [appointments, todayStr]);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(item => {
      // Tab filter
      if (activeTab === 'Today' && item.preferred_date !== todayStr) return false;
      if (activeTab === 'Tomorrow' && item.preferred_date !== tomorrowStr) return false;
      if (activeTab === 'Pending' && item.status !== 'pending') return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.patient_name?.toLowerCase().includes(query);
        const matchesPhone = item.patient_phone?.includes(query);
        const matchesRef = item.booking_reference?.toLowerCase().includes(query);
        const matchesTreatment = item.treatment?.toLowerCase().includes(query);
        return matchesName || matchesPhone || matchesRef || matchesTreatment;
      }
      return true;
    });
  }, [appointments, activeTab, searchQuery, todayStr, tomorrowStr]);

  // Live Queue state calculation for today
  const activeServing = useMemo(() => {
    return appointments.find(a => a.preferred_date === todayStr && a.status === 'confirmed');
  }, [appointments, todayStr]);

  const waitingQueue = useMemo(() => {
    return appointments.filter(a => a.preferred_date === todayStr && a.status === 'pending');
  }, [appointments, todayStr]);

  // Doctor / Reception Call Next Patient Handler
  const handleCallNextPatient = async () => {
    if (activeServing) {
      // Mark currently consulting patient as completed
      await updateAppointmentStatus(activeServing.id, 'completed');
    }

    if (waitingQueue.length > 0) {
      const nextOne = waitingQueue[0];
      await updateAppointmentStatus(nextOne.id, 'confirmed');
      playReceptionChime();
      addToast(`📢 Calling Next: ${nextOne.patient_name} (Token #${nextOne.booking_reference}) into Chamber!`, 'success');
    } else {
      playReceptionChime();
      addToast('OPD Queue complete! No pending patients remaining for today.', 'info');
    }
  };

  // CSV Export for Excel with Formula Injection protection (CWE-1236)
  const handleExportCSV = () => {
    const listToExport = filteredAppointments.length > 0 ? filteredAppointments : appointments;
    const sanitizeCsvCell = (val) => {
      if (val === null || val === undefined) return '""';
      let str = String(val).replace(/"/g, '""');
      // Neutralize spreadsheet formula prefixes (=, +, -, @, tab, CR)
      if (/^[=+@-|\t\r]/.test(str)) {
        str = "'" + str;
      }
      return `"${str}"`;
    };

    const headers = ['Token ID', 'Patient Name', 'Phone', 'Age', 'Department', 'Date', 'Shift', 'Symptoms', 'Status', 'Booked At'];
    const rows = listToExport.map(a => [
      sanitizeCsvCell(a.booking_reference),
      sanitizeCsvCell(a.patient_name),
      sanitizeCsvCell(`+91${a.patient_phone}`),
      sanitizeCsvCell(a.patient_age || 'N/A'),
      sanitizeCsvCell(a.treatment),
      sanitizeCsvCell(a.preferred_date),
      sanitizeCsvCell(a.preferred_shift),
      sanitizeCsvCell(a.symptoms || ''),
      sanitizeCsvCell(a.status),
      sanitizeCsvCell(a.created_at)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PrimeCare_OPD_Register_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`Exported ${listToExport.length} patient records to CSV!`, 'success');
  };

  const handleCopySql = () => {
    const sqlText = `-- PrimeCare Database Schema\n-- Refer to supabase-schema.sql in the project root`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. TOP ADMIN HEADER */}
      <header 
        style={{ 
          backgroundColor: '#0F172A', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
          padding: '0.875rem 0',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}
      >
        <div className="content-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          {/* Row 1: Logo & Clinic Info + Logout */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div 
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#0284C7',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Plus size={20} strokeWidth={3} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <h1 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', margin: 0, lineHeight: 1.2 }}>
                    {settings?.clinic_name || 'PrimeCare Clinic'}
                  </h1>
                  <span 
                    style={{
                      backgroundColor: 'rgba(2, 132, 199, 0.25)',
                      color: '#38BDF8',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      border: '1px solid rgba(56, 189, 248, 0.3)'
                    }}
                  >
                    OPD Desk
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                  {settings?.doctor_name} &bull; Senior Physician
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={async () => {
                await adminLogout();
                onLogout();
              }}
              className="btn-pill"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#FCA5A5',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '0.4rem 0.75rem',
                fontSize: '0.78rem',
                minHeight: '34px',
                flexShrink: 0
              }}
              title="Sign out of Admin Dashboard"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

          {/* Row 2: Status Toggle, Live Website Link & Supabase Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            
            {/* Doctor Available Live Toggle */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                padding: '0.35rem 0.65rem',
                borderRadius: '9999px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                flexGrow: 1,
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span className={`pulse-dot ${settings?.is_doctor_available ? 'available' : 'unavailable'}`} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: settings?.is_doctor_available ? '#34D399' : '#F87171' }}>
                  {settings?.is_doctor_available ? 'Doctor OPD Open' : 'Doctor OPD Closed'}
                </span>
              </div>
              <button
                onClick={handleToggleDoctorAvailable}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: settings?.is_doctor_available ? '#059669' : '#DC2626',
                  color: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: '9999px'
                }}
              >
                {settings?.is_doctor_available ? 'Set Off' : 'Set On'}
              </button>
            </div>

            {/* Live Website Link */}
            <button
              onClick={onGoToSite}
              className="btn-pill"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#E2E8F0',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                minHeight: '32px'
              }}
              title="View Public Booking Page"
            >
              <Globe size={13} style={{ color: '#38BDF8' }} />
              <span>Site</span>
            </button>

            {/* Supabase Connection Status / Settings */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="btn-pill"
              style={{
                backgroundColor: creds.isValid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: creds.isValid ? '#34D399' : '#FCD34D',
                border: creds.isValid ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(252, 211, 77, 0.3)',
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                minHeight: '32px'
              }}
              title="Database & Supabase Connection"
            >
              <Database size={13} />
              <span>{creds.isValid ? 'Supabase' : 'Local'}</span>
            </button>

          </div>

        </div>
      </header>

      {/* MAIN DASHBOARD CONTENT */}
      <main className="content-wrap" style={{ paddingTop: '1.25rem', paddingBottom: '4rem', flex: 1 }}>
        
        {/* LIVE OPD DOCTOR CHAMBER & QUEUE CALLING BAR */}
        <div 
          className="prime-card"
          style={{
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            borderRadius: '20px',
            padding: '1.25rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 15px 35px -5px rgba(15, 23, 42, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Top: Current Chamber Status */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div 
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: activeServing ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                color: activeServing ? '#34D399' : '#FCD34D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px'
              }}
            >
              <Stethoscope size={22} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className={`pulse-dot ${activeServing ? 'available' : 'unavailable'}`} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Doctor Chamber Live Status
                </span>
              </div>

              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {activeServing ? (
                  <>
                    <span style={{ color: '#E2E8F0' }}>Inside:</span>
                    <span style={{ color: '#38BDF8' }}>{activeServing.patient_name}</span>
                    <span style={{ backgroundColor: '#0284C7', color: '#FFFFFF', fontSize: '0.78rem', padding: '1px 6px', borderRadius: '4px' }}>
                      #{activeServing.booking_reference}
                    </span>
                  </>
                ) : (
                  <span style={{ color: '#94A3B8', fontSize: '0.95rem', fontWeight: 600 }}>
                    Chamber Ready &bull; Call next patient
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                Waiting Area: <strong style={{ color: '#FCD34D' }}>{waitingQueue.length} patient(s) waiting</strong>
              </div>
            </div>
          </div>

          {/* Bottom Calling Actions (Thumb-Friendly on Phone) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', width: '100%' }}>
            <button
              onClick={() => {
                playReceptionChime();
                addToast('🔔 Bell chime tested successfully!', 'info');
              }}
              className="btn-pill"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#E2E8F0',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '0.65rem 0.85rem',
                fontSize: '0.8rem',
                minHeight: '44px',
                flexShrink: 0
              }}
              title="Test Reception Bell Chime"
            >
              <Volume2 size={16} style={{ color: '#38BDF8' }} />
              <span>Chime</span>
            </button>

            <button
              onClick={handleCallNextPatient}
              className="btn-pill btn-whatsapp"
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                fontSize: '0.9rem',
                gap: '0.5rem',
                fontWeight: 700,
                minHeight: '44px'
              }}
            >
              <UserCheck size={18} />
              <span>{activeServing ? 'Done & Next' : 'Call Next Patient'}</span>
              {waitingQueue.length > 0 && (
                <span style={{ backgroundColor: 'rgba(0,0,0,0.25)', padding: '2px 6px', borderRadius: '9999px', fontSize: '0.72rem' }}>
                  #{waitingQueue[0].booking_reference}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 2. 4 KPI SUMMARY CARDS */}
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          
          {/* Card 1: Today's Appointments */}
          <div 
            className="prime-card" 
            style={{ 
              padding: '1rem', 
              backgroundColor: '#FFFFFF', 
              borderRadius: '18px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem'
            }}
          >
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                Today's Bookings
              </span>
              <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: '#0F172A', marginTop: '2px', lineHeight: 1.1 }}>
                {kpiStats.todayCount}
              </div>
              <span style={{ fontSize: '0.68rem', color: '#0284C7', fontWeight: 600 }}>
                {todayStr}
              </span>
            </div>
            <div 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#F0F9FF',
                color: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Calendar size={18} />
            </div>
          </div>

          {/* Card 2: Pending Confirmation (Amber highlight) */}
          <div 
            className="prime-card" 
            style={{ 
              padding: '1rem', 
              backgroundColor: '#FFFBEB', 
              borderRadius: '18px',
              border: '1px solid #FDE68A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem'
            }}
          >
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                Pending Review
              </span>
              <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: '#B45309', marginTop: '2px', lineHeight: 1.1 }}>
                {kpiStats.pendingCount}
              </div>
              <span style={{ fontSize: '0.68rem', color: '#92400E', fontWeight: 600 }}>
                Awaiting Doctor
              </span>
            </div>
            <div 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Clock size={18} />
            </div>
          </div>

          {/* Card 3: Confirmed / Completed Today (Emerald highlight) */}
          <div 
            className="prime-card" 
            style={{ 
              padding: '1rem', 
              backgroundColor: '#ECFDF5', 
              borderRadius: '18px',
              border: '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem'
            }}
          >
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                Attended / Confirmed
              </span>
              <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: '#047857', marginTop: '2px', lineHeight: 1.1 }}>
                {kpiStats.confirmedTodayCount}
              </div>
              <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 600 }}>
                Active Queue
              </span>
            </div>
            <div 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#D1FAE5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <CheckCircle2 size={18} />
            </div>
          </div>

          {/* Card 4: Clinic Status & Announcement Editor */}
          <div 
            className="prime-card" 
            style={{ 
              padding: '1rem', 
              backgroundColor: '#FFFFFF', 
              borderRadius: '18px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Availability
              </span>
              <span className={`pulse-dot ${settings?.is_doctor_available ? 'available' : 'unavailable'}`} />
            </div>

            <div style={{ margin: '0.25rem 0' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: settings?.is_doctor_available ? '#059669' : '#DC2626' }}>
                {settings?.is_doctor_available ? 'Attending OPD' : 'OPD Paused'}
              </span>
            </div>

            <button
              onClick={() => setShowAnnouncementModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#0284C7',
                padding: '2px 0'
              }}
            >
              <Edit3 size={12} />
              <span>Edit Notice</span>
            </button>
          </div>

        </div>
        {/* 3. FILTER TABS & SEARCH BAR */}
        <div 
          className="prime-card"
          style={{
            padding: '1rem',
            borderRadius: '20px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            marginBottom: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem'
          }}
        >
          {/* Horizontally Scrollable Tabs (Zero Wrapping Clutter on Phone) */}
          <div className="scroll-x-pills" style={{ gap: '0.5rem', width: '100%' }}>
            {['Today', 'Tomorrow', 'Pending', 'All Bookings'].map((tab) => {
              const isActive = activeTab === (tab === 'All Bookings' ? 'All' : tab);
              const count = tab === 'Today' ? kpiStats.todayCount
                : tab === 'Pending' ? kpiStats.pendingCount
                : tab === 'Tomorrow' ? appointments.filter(a => a.preferred_date === tomorrowStr).length
                : kpiStats.totalCount;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab === 'All Bookings' ? 'All' : tab)}
                  className="btn-pill"
                  style={{
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.82rem',
                    backgroundColor: isActive ? '#0284C7' : '#F1F5F9',
                    color: isActive ? '#FFFFFF' : '#475569',
                    border: isActive ? '1px solid #0284C7' : '1px solid #E2E8F0',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    minHeight: '36px'
                  }}
                >
                  <span>{tab}</span>
                  <span 
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : '#E2E8F0',
                      color: isActive ? '#FFFFFF' : '#475569',
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      marginLeft: '4px'
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input & Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 240px', width: '100%' }}>
              <input
                type="text"
                placeholder="Search patient name or mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="prime-input"
                style={{ padding: '0.55rem 1rem 0.55rem 2.4rem', fontSize: '0.85rem', minHeight: '40px' }}
              />
              <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Actions Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between' }} className="sm:w-auto">
              <button
                onClick={handleExportCSV}
                className="btn-pill btn-secondary"
                style={{ padding: '0.55rem 0.85rem', fontSize: '0.82rem', minHeight: '38px', flex: '1 1 auto' }}
                title="Export filtered appointments to CSV / Excel"
              >
                <Download size={14} style={{ color: '#0284C7' }} />
                <span>CSV</span>
              </button>

              <button
                onClick={() => setShowPrintRegister(true)}
                className="btn-pill btn-secondary"
                style={{ padding: '0.55rem 0.85rem', fontSize: '0.82rem', minHeight: '38px', flex: '1 1 auto' }}
                title="Print Doctor's OPD Daily Register Sheet"
              >
                <Printer size={14} style={{ color: '#0284C7' }} />
                <span>Day Sheet</span>
              </button>

              <button
                onClick={() => setShowWalkinModal(true)}
                className="btn-pill btn-primary"
                style={{ padding: '0.55rem 1rem', fontSize: '0.82rem', minHeight: '38px', flex: '2 1 auto' }}
              >
                <Plus size={15} />
                <span>New Walk-in</span>
              </button>
            </div>
          </div>

        </div>

        {/* 4. APPOINTMENTS TABLE & MOBILE CARDS */}
        <div 
          className="prime-card"
          style={{
            borderRadius: '24px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-diffused)'
          }}
        >
          {filteredAppointments.length === 0 ? (
            <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
              <AlertCircle size={44} style={{ color: '#CBD5E1', margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                No appointments found
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B' }}>
                {searchQuery ? `No patient matches "${searchQuery}".` : `No bookings found under "${activeTab}" filter.`}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop View Table */}
              <div style={{ overflowX: 'auto' }} className="hidden md:block">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>Token / Date</th>
                      <th style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>Patient</th>
                      <th style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>Phone (Click to Call)</th>
                      <th style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>Department</th>
                      <th style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>Shift</th>
                      <th style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>Status</th>
                      <th style={{ padding: '1rem 1.25rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appt) => (
                      <tr 
                        key={appt.id} 
                        style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* Token & Date */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ fontWeight: 800, color: '#0284C7', fontSize: '0.95rem' }}>
                            {appt.booking_reference}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                            {appt.preferred_date}
                          </div>
                        </td>

                        {/* Patient Name & Age */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ fontWeight: 700, color: '#0F172A' }}>
                            {appt.patient_name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                            {appt.patient_age ? `${appt.patient_age} yrs` : 'Age: N/A'}
                          </div>
                          {appt.symptoms && (
                            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              Note: {appt.symptoms}
                            </div>
                          )}
                        </td>

                        {/* Phone */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <a 
                            href={`tel:+91${appt.patient_phone}`}
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px', 
                              color: '#0284C7', 
                              fontWeight: 600,
                              textDecoration: 'none'
                            }}
                          >
                            <Phone size={13} />
                            <span>+91 {appt.patient_phone}</span>
                          </a>
                        </td>

                        {/* Treatment */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{ fontWeight: 600, color: '#334155' }}>
                            {appt.treatment}
                          </span>
                        </td>

                        {/* Shift */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span 
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              backgroundColor: appt.preferred_shift.includes('Morning') ? '#FEF3C7' : '#E0E7FF',
                              color: appt.preferred_shift.includes('Morning') ? '#92400E' : '#3730A3'
                            }}
                          >
                            {appt.preferred_shift.includes('Morning') ? 'Morning (9:30-2:00)' : 'Evening (5:00-8:00)'}
                          </span>
                        </td>

                        {/* Status Selector */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <select
                            value={appt.status}
                            onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '9999px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: '1px solid',
                              borderColor: appt.status === 'confirmed' ? '#A7F3D0'
                                : appt.status === 'completed' ? '#BAE6FD'
                                : appt.status === 'cancelled' ? '#FECACA'
                                : '#FDE68A',
                              backgroundColor: appt.status === 'confirmed' ? '#D1FAE5'
                                : appt.status === 'completed' ? '#E0F2FE'
                                : appt.status === 'cancelled' ? '#FEE2E2'
                                : '#FEF3C7',
                              color: appt.status === 'confirmed' ? '#065F46'
                                : appt.status === 'completed' ? '#0369A1'
                                : appt.status === 'cancelled' ? '#991B1B'
                                : '#92400E',
                              outline: 'none'
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            
                            {/* WhatsApp Confirmation */}
                            <button
                              onClick={() => openWhatsAppConfirmation(appt)}
                              className="btn-pill"
                              style={{
                                backgroundColor: '#25D366',
                                color: '#FFFFFF',
                                padding: '6px 12px',
                                fontSize: '0.78rem',
                                gap: '4px'
                              }}
                              title="Send 1-Click WhatsApp Confirmation"
                            >
                              <MessageCircle size={14} />
                              <span>WhatsApp</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => setDeleteConfirmId(appt.id)}
                              style={{
                                color: '#94A3B8',
                                padding: '6px',
                                borderRadius: '8px'
                              }}
                              title="Delete Appointment"
                            >
                              <Trash2 size={16} />
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View Card List */}
              <div className="md:hidden" style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredAppointments.map((appt) => (
                  <div 
                    key={appt.id}
                    style={{
                      padding: '1.15rem 1rem',
                      borderBottom: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.625rem',
                      backgroundColor: appt.status === 'confirmed' ? 'rgba(236, 253, 245, 0.4)' : '#FFFFFF'
                    }}
                  >
                    {/* Card Header: Token & Status Selector */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                      <div 
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: '#F0F9FF',
                          border: '1px solid #BAE6FD',
                          borderRadius: '8px',
                          padding: '3px 8px',
                          color: '#0284C7',
                          fontWeight: 800,
                          fontSize: '0.9rem'
                        }}
                      >
                        <span>Token #{appt.booking_reference}</span>
                      </div>
                      
                      <select
                        value={appt.status}
                        onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          backgroundColor: appt.status === 'confirmed' ? '#D1FAE5'
                            : appt.status === 'completed' ? '#E0F2FE'
                            : appt.status === 'cancelled' ? '#FEE2E2'
                            : '#FEF3C7',
                          color: appt.status === 'confirmed' ? '#065F46'
                            : appt.status === 'completed' ? '#0369A1'
                            : appt.status === 'cancelled' ? '#991B1B'
                            : '#92400E',
                          border: '1px solid',
                          borderColor: appt.status === 'confirmed' ? '#A7F3D0'
                            : appt.status === 'completed' ? '#BAE6FD'
                            : appt.status === 'cancelled' ? '#FECACA'
                            : '#FDE68A',
                          minHeight: '34px'
                        }}
                      >
                        <option value="pending">🟡 Pending</option>
                        <option value="confirmed">🟢 Confirmed</option>
                        <option value="completed">🔵 Completed</option>
                        <option value="cancelled">🔴 Cancelled</option>
                      </select>
                    </div>

                    {/* Patient Name & Details */}
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        {appt.patient_name} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B' }}>({appt.patient_age ? `${appt.patient_age} yrs` : 'Age N/A'})</span>
                      </h4>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0284C7', marginTop: '2px' }}>
                        {appt.treatment}
                      </div>
                    </div>

                    {/* Date & Shift Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', fontSize: '0.75rem' }}>
                      <span style={{ backgroundColor: '#F1F5F9', padding: '3px 8px', borderRadius: '6px', color: '#334155', fontWeight: 600 }}>
                        📅 {appt.preferred_date}
                      </span>
                      <span style={{ backgroundColor: appt.preferred_shift.includes('Morning') ? '#FEF3C7' : '#E0E7FF', padding: '3px 8px', borderRadius: '6px', color: appt.preferred_shift.includes('Morning') ? '#92400E' : '#3730A3', fontWeight: 600 }}>
                        ⏰ {appt.preferred_shift.includes('Morning') ? 'Morning (9:30-2:00)' : 'Evening (5:00-8:00)'}
                      </span>
                    </div>

                    {/* Patient Symptoms Note */}
                    {appt.symptoms && (
                      <div style={{ fontSize: '0.78rem', color: '#64748B', backgroundColor: '#F8FAFC', padding: '6px 10px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                        <strong style={{ color: '#475569' }}>Note:</strong> {appt.symptoms}
                      </div>
                    )}

                    {/* Thumb-Friendly Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.375rem' }}>
                      <a
                        href={`tel:+91${appt.patient_phone}`}
                        className="btn-pill btn-secondary"
                        style={{
                          flex: 1,
                          padding: '0.625rem 0.5rem',
                          fontSize: '0.82rem',
                          textDecoration: 'none',
                          minHeight: '42px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <Phone size={14} style={{ color: '#0284C7' }} />
                        <span>Call +91 {appt.patient_phone}</span>
                      </a>

                      <button
                        onClick={() => openWhatsAppConfirmation(appt)}
                        className="btn-pill btn-whatsapp"
                        style={{
                          flex: 1.1,
                          padding: '0.625rem 0.5rem',
                          fontSize: '0.82rem',
                          minHeight: '42px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          fontWeight: 700
                        }}
                      >
                        <MessageCircle size={15} />
                        <span>Confirm WA</span>
                      </button>

                      <button
                        onClick={() => setDeleteConfirmId(appt.id)}
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '9999px',
                          backgroundColor: '#FEE2E2',
                          color: '#EF4444',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                        title="Delete Appointment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </main>

      {/* MODAL 1: NEW WALK-IN PATIENT */}
      {showWalkinModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div 
            className="prime-card"
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '1.5rem 1.25rem',
              boxShadow: 'var(--shadow-modal)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Register Walk-in Patient
              </h3>
              <button onClick={() => setShowWalkinModal(false)} style={{ color: '#94A3B8', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleWalkinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Om Prakash"
                  value={walkinForm.patient_name}
                  onChange={(e) => setWalkinForm({ ...walkinForm, patient_name: e.target.value })}
                  className="prime-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    10-Digit Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98120 44321"
                    value={walkinForm.patient_phone}
                    onChange={(e) => setWalkinForm({ ...walkinForm, patient_phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="prime-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Age
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={walkinForm.patient_age}
                    onChange={(e) => setWalkinForm({ ...walkinForm, patient_age: e.target.value })}
                    className="prime-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Treatment Speciality
                </label>
                <select
                  value={walkinForm.treatment}
                  onChange={(e) => setWalkinForm({ ...walkinForm, treatment: e.target.value })}
                  className="prime-input"
                >
                  {CLINIC_SERVICES.map(s => (
                    <option key={s.id} value={s.title}>{s.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={walkinForm.preferred_date}
                    onChange={(e) => setWalkinForm({ ...walkinForm, preferred_date: e.target.value })}
                    className="prime-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Shift
                  </label>
                  <select
                    value={walkinForm.preferred_shift}
                    onChange={(e) => setWalkinForm({ ...walkinForm, preferred_shift: e.target.value })}
                    className="prime-input"
                  >
                    <option value="Morning Shift (9:30 AM - 2:00 PM)">Morning (9:30 AM - 2:00 PM)</option>
                    <option value="Evening Shift (5:00 PM - 8:00 PM)">Evening (5:00 PM - 8:00 PM)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowWalkinModal(false)}
                  className="btn-pill btn-secondary"
                  style={{ flex: 1, padding: '0.75rem', minHeight: '44px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pill btn-primary"
                  style={{ flex: 1.5, padding: '0.75rem', minHeight: '44px' }}
                >
                  Add Walk-in Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT EMERGENCY / STATUS ANNOUNCEMENT */}
      {showAnnouncementModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div 
            className="prime-card"
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '1.5rem 1.25rem',
              boxShadow: 'var(--shadow-modal)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Edit Live OPD Notice
              </h3>
              <button onClick={() => setShowAnnouncementModal(false)} style={{ color: '#94A3B8', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>
              This notice appears in the top announcement bar when the doctor is marked unavailable or attending emergency procedures.
            </p>

            <form onSubmit={handleSaveAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <textarea
                rows={3}
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="e.g. Doctor is attending emergency surgery at Civil Hospital. Evening OPD will resume at 6:00 PM."
                className="prime-input"
                style={{ resize: 'none' }}
              />

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="btn-pill btn-secondary"
                  style={{ flex: 1, padding: '0.75rem', minHeight: '44px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pill btn-primary"
                  style={{ flex: 1.5, padding: '0.75rem', minHeight: '44px' }}
                >
                  Save Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SUPABASE CONNECTION & SQL SCHEMA */}
      {showSettingsModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div 
            className="prime-card"
            style={{
              width: '100%',
              maxWidth: '580px',
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '1.5rem 1.25rem',
              boxShadow: 'var(--shadow-modal)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={22} style={{ color: '#0284C7' }} />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Supabase Backend Configuration
                </h3>
              </div>
              <button onClick={() => setShowSettingsModal(false)} style={{ color: '#94A3B8' }}>
                <X size={20} />
              </button>
            </div>

            <div 
              style={{
                backgroundColor: creds.isValid ? '#ECFDF5' : '#FFFBEB',
                border: creds.isValid ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                borderRadius: '16px',
                padding: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <div 
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: creds.isValid ? '#D1FAE5' : '#FEF3C7',
                  color: creds.isValid ? '#059669' : '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {creds.isValid ? <Check size={20} /> : <AlertCircle size={20} />}
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 800, color: creds.isValid ? '#065F46' : '#92400E' }}>
                  {creds.isValid ? 'Live Supabase Realtime Active' : 'Hybrid Local Storage Engine Running'}
                </div>
                <div style={{ color: creds.isValid ? '#047857' : '#B45309' }}>
                  {creds.isValid 
                    ? `Connected to: ${creds.url}` 
                    : 'All appointments, doctor toggles, and WhatsApp messages work right now! Connect real Supabase anytime below.'}
                </div>
              </div>
            </div>

            {/* Custom URL & Key Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="prime-input"
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Supabase Anon Public API Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className="prime-input"
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => saveSupabaseConfig(customUrl, customKey)}
                  className="btn-pill btn-primary"
                  style={{ flex: 1, padding: '0.75rem', fontSize: '0.85rem' }}
                >
                  Save & Connect to Supabase
                </button>

                {creds.isValid && (
                  <button
                    type="button"
                    onClick={clearSupabaseConfig}
                    className="btn-pill btn-secondary"
                    style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#EF4444' }}
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>

            {/* SQL Migration Helper */}
            <div 
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                  Database SQL Migration
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Created at `supabase-schema.sql`
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                Includes `clinic_settings`, `appointments`, RLS security policies, and realtime publications ready to run in the Supabase SQL Editor.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {deleteConfirmId && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div 
            className="prime-card"
            style={{
              width: '100%',
              maxWidth: '400px',
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '1.75rem',
              textAlign: 'center'
            }}
          >
            <div 
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: '#FEE2E2',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}
            >
              <Trash2 size={24} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
              Delete Appointment?
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>
              Are you sure you want to remove this appointment token? This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="btn-pill btn-secondary"
                style={{ flex: 1, padding: '0.75rem' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAppointment(deleteConfirmId)}
                className="btn-pill btn-danger"
                style={{ flex: 1, padding: '0.75rem' }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: PRINT OPD DAY SHEET / ATTENDANCE REGISTER */}
      {showPrintRegister && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto'
          }}
        >
          <div 
            className="prime-card"
            style={{
              width: '100%',
              maxWidth: '820px',
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '1.25rem 1rem',
              boxShadow: 'var(--shadow-modal)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Header controls (hidden on print) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Doctor's OPD Consultation Day Sheet
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Standard register format for clinical attendance and prescription records
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    const sheetEl = document.getElementById('printable-day-sheet');
                    const printArea = document.getElementById('isolated-print-area');
                    if (sheetEl && printArea) {
                      printArea.innerHTML = `<div style="width: 100%; padding: 20px; background: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${sheetEl.innerHTML}</div>`;
                      document.body.classList.add('print-daysheet-active');
                      const cleanup = () => {
                        document.body.classList.remove('print-daysheet-active');
                        if (printArea) printArea.innerHTML = '';
                        window.removeEventListener('afterprint', cleanup);
                      };
                      window.addEventListener('afterprint', cleanup);
                      setTimeout(() => document.body.classList.remove('print-daysheet-active'), 6000);
                      window.print();
                    } else {
                      window.print();
                    }
                  }}
                  className="btn-pill btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
                >
                  <Printer size={15} />
                  <span>Print Register</span>
                </button>
                <button
                  onClick={() => setShowPrintRegister(false)}
                  style={{ color: '#94A3B8', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* PRINTABLE DAY SHEET AREA */}
            <div id="printable-day-sheet">
              {/* Sheet Header */}
              <div style={{ borderBottom: '2px solid #0F172A', paddingBottom: '0.875rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    {settings?.clinic_name || 'PrimeCare Multi-Speciality Clinic'}
                  </h2>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284C7' }}>
                    {settings?.doctor_name} &bull; {settings?.doctor_degree}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {settings?.clinic_address} &bull; Reg. #{settings?.doctor_reg_no}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                    DAILY OPD REGISTER
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                    Date: {todayStr}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Total Scheduled: {appointments.filter(a => a.preferred_date === todayStr).length} Patients
                  </div>
                </div>
              </div>

              {/* Day Register Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1.5px solid #0F172A' }}>
                    <th style={{ padding: '6px 8px', fontWeight: 800 }}>Token</th>
                    <th style={{ padding: '6px 8px', fontWeight: 800 }}>Patient Name</th>
                    <th style={{ padding: '6px 8px', fontWeight: 800 }}>Age</th>
                    <th style={{ padding: '6px 8px', fontWeight: 800 }}>Phone</th>
                    <th style={{ padding: '6px 8px', fontWeight: 800 }}>Department</th>
                    <th style={{ padding: '6px 8px', fontWeight: 800 }}>Shift</th>
                    <th style={{ padding: '6px 8px', fontWeight: 800 }}>Status</th>
                    <th style={{ padding: '6px 8px', fontWeight: 800 }}>Doctor Notes / Rx</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.filter(a => a.preferred_date === todayStr).map((item, idx) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #CBD5E1' }}>
                      <td style={{ padding: '6px 8px', fontWeight: 800, color: '#0284C7' }}>
                        {item.booking_reference}
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 700 }}>
                        {item.patient_name}
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        {item.patient_age ? `${item.patient_age}y` : '-'}
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        {item.patient_phone}
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        {item.treatment}
                      </td>
                      <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>
                        {item.preferred_shift.includes('Morning') ? 'Morning' : 'Evening'}
                      </td>
                      <td style={{ padding: '6px 8px', textTransform: 'capitalize', fontWeight: 600 }}>
                        {item.status}
                      </td>
                      <td style={{ padding: '6px 8px', minWidth: '140px', color: '#64748B' }}>
                        {item.symptoms || '____________________'}
                      </td>
                    </tr>
                  ))}
                  {appointments.filter(a => a.preferred_date === todayStr).length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8' }}>
                        No appointments scheduled for today ({todayStr}).
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Sign-off footer */}
              <div style={{ marginTop: '2.5rem', paddingTop: '1rem', borderTop: '1px solid #CBD5E1', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569' }}>
                <div>Verified by Clinic Reception Staff</div>
                <div style={{ borderTop: '1px solid #0F172A', width: '200px', textAlign: 'center', paddingTop: '4px' }}>
                  Consultant Doctor Signature
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-day-sheet, #printable-day-sheet * {
            visibility: visible !important;
          }
          #printable-day-sheet {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 20px !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

    </div>
  );
}
