import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Sun, 
  Moon, 
  ShieldAlert, 
  Check, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  Printer
} from 'lucide-react';
import { createAppointment } from '../lib/supabase';
import { CLINIC_SERVICES } from './Services';
import TokenSlipModal from './TokenSlipModal';

export default function BookingSection({ 
  settings, 
  preselectedService, 
  onAppointmentCreated,
  lang = 'en',
  t,
  activeServing,
  waitingAheadCount
}) {
  const clinicName = settings?.clinic_name || 'PrimeCare Multi-Speciality Clinic';
  const clinicPhone = settings?.phone_number || '+917015846421';
  const clinicWhatsApp = settings?.whatsapp_number || '917015846421';

  // Time and Date Calculation
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  // Current time in hours (e.g. 15.01 = 3:00 PM)
  const currentDecimalHour = now.getHours() + now.getMinutes() / 60;
  
  // Morning shift ends at 2:00 PM (14.0)
  // Evening shift ends at 8:00 PM (20.0)
  const isMorningExpiredToday = currentDecimalHour >= 14.0;
  const isEveningExpiredToday = currentDecimalHour >= 20.0;

  // Determine smart initial date & shift
  const initialDate = isEveningExpiredToday ? tomorrowStr : todayStr;
  const initialShift = (initialDate === todayStr && isMorningExpiredToday)
    ? 'Evening Shift (5:00 PM - 8:00 PM)'
    : 'Morning Shift (9:30 AM - 2:00 PM)';

  const [formData, setFormData] = useState({
    patient_name: '',
    patient_phone: '',
    patient_age: '',
    treatment: preselectedService || CLINIC_SERVICES[0].title,
    preferred_date: initialDate,
    preferred_shift: initialShift,
    symptoms: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState(null);
  const [showSlipModal, setShowSlipModal] = useState(false);

  // Status flags for the currently selected date in the form
  const isSelectedDateToday = formData.preferred_date === todayStr;
  const isMorningShiftDisabled = isSelectedDateToday && isMorningExpiredToday;
  const isEveningShiftDisabled = isSelectedDateToday && isEveningExpiredToday;

  // When date changes or mounts, auto-correct shift if currently selected shift has expired
  useEffect(() => {
    if (isSelectedDateToday) {
      if (isMorningExpiredToday && !isEveningExpiredToday && formData.preferred_shift.includes('Morning')) {
        setFormData(prev => ({ ...prev, preferred_shift: 'Evening Shift (5:00 PM - 8:00 PM)' }));
      }
    }
  }, [formData.preferred_date, isSelectedDateToday, isMorningExpiredToday, isEveningExpiredToday]);

  // Update selected service if passed from services card
  useEffect(() => {
    if (preselectedService) {
      setFormData(prev => ({ ...prev, treatment: preselectedService }));
    }
  }, [preselectedService]);

  const validate = () => {
    const newErrors = {};
    if (!formData.patient_name.trim()) {
      newErrors.patient_name = 'Please enter patient full name';
    } else if (formData.patient_name.trim().length < 3) {
      newErrors.patient_name = 'Name must be at least 3 characters';
    }

    const cleanPhone = formData.patient_phone.replace(/\D/g, '');
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    if (!cleanPhone) {
      newErrors.patient_phone = '10-digit mobile number is required';
    } else if (!indianPhoneRegex.test(cleanPhone)) {
      newErrors.patient_phone = 'Enter a valid 10-digit Indian mobile number (e.g. 9812044321)';
    }

    if (formData.patient_age) {
      const ageNum = parseInt(formData.patient_age, 10);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        newErrors.patient_age = 'Enter a valid age between 1 and 120';
      }
    }

    if (!formData.preferred_date) {
      newErrors.preferred_date = 'Please select your preferred date';
    } else if (formData.preferred_date < todayStr) {
      newErrors.preferred_date = 'Appointment date cannot be in the past';
    }

    // Validate that expired shift cannot be booked for today
    if (isSelectedDateToday) {
      if (formData.preferred_shift.includes('Morning') && isMorningShiftDisabled) {
        newErrors.preferred_shift = 'Morning OPD shift (9:30 AM - 2:00 PM) has ended for today. Please select Evening Shift or choose tomorrow.';
      } else if (formData.preferred_shift.includes('Evening') && isEveningShiftDisabled) {
        newErrors.preferred_shift = 'Evening OPD shift (5:00 PM - 8:00 PM) has ended for today. Please select tomorrow.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        patient_name: formData.patient_name.trim(),
        patient_phone: formData.patient_phone.replace(/\D/g, ''),
        patient_age: formData.patient_age ? parseInt(formData.patient_age, 10) : null,
        treatment: formData.treatment,
        preferred_date: formData.preferred_date,
        preferred_shift: formData.preferred_shift,
        symptoms: formData.symptoms.trim()
      };

      const record = await createAppointment(payload);
      setSuccessBooking(record);
      if (onAppointmentCreated) {
        onAppointmentCreated(record);
      }
    } catch (err) {
      console.error('Error creating appointment:', err);
      alert('Could not submit booking. Please try calling the reception directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSuccessBooking(null);
    setFormData({
      patient_name: '',
      patient_phone: '',
      patient_age: '',
      treatment: CLINIC_SERVICES[0].title,
      preferred_date: todayStr,
      preferred_shift: 'Morning Shift (9:30 AM - 2:00 PM)',
      symptoms: ''
    });
    setErrors({});
  };

  // Generate WhatsApp message URL
  const getWhatsAppBookingUrl = (booking) => {
    const rawWa = clinicWhatsApp.replace(/\D/g, '');
    const cleanWa = rawWa.startsWith('91') ? rawWa : `91${rawWa}`;
    const text = encodeURIComponent(
      `*PrimeCare OPD Booking Token: ${booking.booking_reference}*\n\n` +
      `Namaste, I have booked an OPD slot at ${clinicName}.\n` +
      `• *Patient Name:* ${booking.patient_name}\n` +
      `• *Mobile:* ${booking.patient_phone}\n` +
      `• *Age:* ${booking.patient_age || 'Not specified'}\n` +
      `• *Department:* ${booking.treatment}\n` +
      `• *Date:* ${booking.preferred_date}\n` +
      `• *Shift:* ${booking.preferred_shift}\n` +
      (booking.symptoms ? `• *Note:* ${booking.symptoms}\n` : '') +
      `\nPlease confirm our appointment token. Thank you!`
    );
    return `https://wa.me/${cleanWa}?text=${text}`;
  };

  return (
    <section id="book-appointment" style={{ padding: '4rem 0 5rem 0' }}>
      <div className="content-wrap">
        
        {/* Slate 900 High-Contrast Container */}
        <div 
          style={{
            backgroundColor: '#0F172A',
            borderRadius: '24px',
            padding: '1.5rem 1rem',
            color: '#FFFFFF',
            boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
          className="booking-container sm:p-8 md:p-12"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem', alignItems: 'center' }} className="booking-grid">
            
            {/* Left Side (5 Columns) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              <div 
                className="badge-pill"
                style={{
                  backgroundColor: 'rgba(2, 132, 199, 0.2)',
                  color: '#38BDF8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  alignSelf: 'flex-start'
                }}
              >
                <Sparkles size={14} />
                <span>Instant OPD Confirmation</span>
              </div>

              <h2 
                style={{
                  fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '-0.025em',
                  color: '#FFFFFF'
                }}
              >
                Skip the Waiting Room. <br />
                <span style={{ color: '#38BDF8' }}>
                  Book Your Slot in 30 Seconds.
                </span>
              </h2>

              <p style={{ color: '#94A3B8', fontSize: '1.05rem', lineHeight: 1.6 }}>
                Direct clinic scheduling without any registration or account creation. Choose your shift, submit your details, and receive a verified token directly on WhatsApp.
              </p>

              {/* Step-by-Step Visual Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div 
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(2, 132, 199, 0.25)',
                      color: '#38BDF8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    1
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
                      Select Your Treatment & Shift
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '2px 0 0 0' }}>
                      Choose between Morning OPD or Evening OPD based on your family schedule.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div 
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(2, 132, 199, 0.25)',
                      color: '#38BDF8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    2
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
                      Enter Patient Details
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '2px 0 0 0' }}>
                      Zero login required. Just patient name and WhatsApp mobile number.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div 
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(16, 185, 129, 0.25)',
                      color: '#34D399',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    3
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
                      Instant WhatsApp Token Confirmation
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '2px 0 0 0' }}>
                      Present your digital token at the reception desk for priority doctor consultation.
                    </p>
                  </div>
                </div>

              </div>

              {/* Emergency Call Box */}
              <div 
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div 
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    color: '#F87171',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.05em' }}>
                    Emergency Medical Assistance?
                  </div>
                  <a 
                    href={`tel:${clinicPhone}`} 
                    style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <span>Direct Desk: {clinicPhone}</span>
                  </a>
                </div>
              </div>

            </div>

            {/* Right Side (7 Columns) - White Floating Form Card */}
            <div>
              <div 
                className="prime-card"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '24px',
                  padding: '1.5rem 1.15rem',
                  boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.3)',
                  border: '1px solid #E2E8F0',
                  color: '#0F172A'
                }}
              >
                {!successBooking ? (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    
                    <div>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                        Reserve OPD Slot
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                        No account or password needed. Instant doctor token.
                      </p>
                    </div>

                    {/* Patient Name & Age Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }} className="sm:grid-cols-3">
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Patient Full Name *
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            placeholder="e.g. Ramesh Kumar"
                            value={formData.patient_name}
                            onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                            className="prime-input"
                            style={{ borderColor: errors.patient_name ? '#EF4444' : undefined }}
                          />
                        </div>
                        {errors.patient_name && (
                          <div style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertCircle size={12} />
                            <span>{errors.patient_name}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Patient Age
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 42"
                          min="1"
                          max="120"
                          value={formData.patient_age}
                          onChange={(e) => setFormData({ ...formData, patient_age: e.target.value })}
                          className="prime-input"
                          style={{ borderColor: errors.patient_age ? '#EF4444' : undefined }}
                        />
                        {errors.patient_age && (
                          <div style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '4px' }}>
                            {errors.patient_age}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        10-Digit Mobile Number (WhatsApp) *
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div 
                          style={{
                            padding: '0.875rem 0.85rem',
                            backgroundColor: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                            borderRight: 'none',
                            borderRadius: '16px 0 0 16px',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            color: '#475569'
                          }}
                        >
                          +91
                        </div>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="98120 44321"
                          value={formData.patient_phone}
                          onChange={(e) => setFormData({ ...formData, patient_phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          className="prime-input"
                          style={{
                            borderRadius: '0 16px 16px 0',
                            borderColor: errors.patient_phone ? '#EF4444' : undefined
                          }}
                        />
                      </div>
                      {errors.patient_phone && (
                        <div style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertCircle size={12} />
                          <span>{errors.patient_phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Department / Treatment Selector */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Select Department / Treatment *
                      </label>
                      <select
                        value={formData.treatment}
                        onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                        className="prime-input"
                        style={{ cursor: 'pointer', fontWeight: 600 }}
                      >
                        {CLINIC_SERVICES.map((s) => (
                          <option key={s.id} value={s.title}>
                            {s.title} (₹{s.fee})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Preferred Date */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Preferred OPD Date *
                      </label>
                      <input
                        type="date"
                        min={todayStr}
                        value={formData.preferred_date}
                        onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                        className="prime-input"
                        style={{ borderColor: errors.preferred_date ? '#EF4444' : undefined }}
                      />
                      {errors.preferred_date && (
                        <div style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '4px' }}>
                          {errors.preferred_date}
                        </div>
                      )}
                    </div>

                    {/* Preferred OPD Shift (Visual Radio Cards) */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', margin: 0 }}>
                          Preferred OPD Shift *
                        </label>
                        {isSelectedDateToday && (
                          <span style={{ fontSize: '0.72rem', color: isMorningShiftDisabled ? '#D97706' : '#059669', fontWeight: 600 }}>
                            {isMorningShiftDisabled ? 'Morning OPD ended at 2:00 PM' : 'Live OPD active'}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }} className="sm:grid-cols-2">
                        
                        {/* Morning Shift */}
                        <div
                          className={`shift-card ${formData.preferred_shift.includes('Morning') && !isMorningShiftDisabled ? 'active' : ''}`}
                          onClick={() => {
                            if (!isMorningShiftDisabled) {
                              setFormData({ ...formData, preferred_shift: 'Morning Shift (9:30 AM - 2:00 PM)' });
                            }
                          }}
                          style={{
                            opacity: isMorningShiftDisabled ? 0.55 : 1,
                            cursor: isMorningShiftDisabled ? 'not-allowed' : 'pointer',
                            backgroundColor: isMorningShiftDisabled ? '#F1F5F9' : undefined,
                            borderColor: isMorningShiftDisabled ? '#E2E8F0' : undefined,
                            borderStyle: isMorningShiftDisabled ? 'dashed' : 'solid',
                            position: 'relative'
                          }}
                          title={isMorningShiftDisabled ? "Morning OPD (9:30 AM - 2:00 PM) has ended for today" : "Morning Shift"}
                        >
                          <div 
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              backgroundColor: isMorningShiftDisabled ? '#E2E8F0' : '#FEF3C7',
                              color: isMorningShiftDisabled ? '#94A3B8' : '#D97706',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <Sun size={18} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isMorningShiftDisabled ? '#64748B' : '#0F172A' }}>
                                Morning Shift
                              </span>
                              {isMorningShiftDisabled && (
                                <span 
                                  style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    backgroundColor: '#FEE2E2',
                                    color: '#DC2626',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  Ended (2 PM)
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: isMorningShiftDisabled ? '#94A3B8' : '#64748B' }}>
                              9:30 AM – 2:00 PM
                            </div>
                          </div>
                        </div>

                        {/* Evening Shift */}
                        <div
                          className={`shift-card ${formData.preferred_shift.includes('Evening') && !isEveningShiftDisabled ? 'active' : ''}`}
                          onClick={() => {
                            if (!isEveningShiftDisabled) {
                              setFormData({ ...formData, preferred_shift: 'Evening Shift (5:00 PM - 8:00 PM)' });
                            }
                          }}
                          style={{
                            opacity: isEveningShiftDisabled ? 0.55 : 1,
                            cursor: isEveningShiftDisabled ? 'not-allowed' : 'pointer',
                            backgroundColor: isEveningShiftDisabled ? '#F1F5F9' : undefined,
                            borderColor: isEveningShiftDisabled ? '#E2E8F0' : undefined,
                            borderStyle: isEveningShiftDisabled ? 'dashed' : 'solid',
                            position: 'relative'
                          }}
                          title={isEveningShiftDisabled ? "Evening OPD (5:00 PM - 8:00 PM) has ended for today" : "Evening Shift"}
                        >
                          <div 
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              backgroundColor: isEveningShiftDisabled ? '#E2E8F0' : '#E0E7FF',
                              color: isEveningShiftDisabled ? '#94A3B8' : '#4F46E5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <Moon size={18} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isEveningShiftDisabled ? '#64748B' : '#0F172A' }}>
                                Evening Shift
                              </span>
                              {isEveningShiftDisabled ? (
                                <span 
                                  style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    backgroundColor: '#FEE2E2',
                                    color: '#DC2626',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  Ended (8 PM)
                                </span>
                              ) : (
                                isMorningShiftDisabled && (
                                  <span 
                                    style={{
                                      fontSize: '0.65rem',
                                      fontWeight: 700,
                                      backgroundColor: '#D1FAE5',
                                      color: '#059669',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    Available Now
                                  </span>
                                )
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: isEveningShiftDisabled ? '#94A3B8' : '#64748B' }}>
                              5:00 PM – 8:00 PM
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Informational help note */}
                      {isMorningShiftDisabled && !isEveningShiftDisabled && (
                        <div style={{ fontSize: '0.75rem', color: '#B45309', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', padding: '6px 10px', borderRadius: '8px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={13} style={{ flexShrink: 0 }} />
                          <span>Today's Morning OPD concluded at 2:00 PM. You can reserve an <strong>Evening Shift (5:00 PM – 8:00 PM)</strong> slot or select tomorrow for a morning consultation.</span>
                        </div>
                      )}

                      {errors.preferred_shift && (
                        <div style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertCircle size={12} />
                          <span>{errors.preferred_shift}</span>
                        </div>
                      )}
                    </div>

                    {/* Brief Symptoms / Note */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Brief Symptoms or Note (Optional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Fever since 2 days, chest pain review, previous prescription..."
                        value={formData.symptoms}
                        onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                        className="prime-input"
                        style={{ resize: 'none' }}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-pill btn-primary"
                      style={{
                        padding: '1rem',
                        fontSize: '1rem',
                        width: '100%',
                        marginTop: '0.5rem',
                        opacity: isSubmitting ? 0.75 : 1
                      }}
                    >
                      {isSubmitting ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="pulse-dot available" />
                          <span>Booking Your Slot...</span>
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Send size={18} />
                          <span>Confirm & Generate Booking Token</span>
                        </span>
                      )}
                    </button>

                  </form>
                ) : (
                  /* Success View */
                  <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    
                    <div 
                      style={{
                        width: '68px',
                        height: '68px',
                        borderRadius: '50%',
                        backgroundColor: '#D1FAE5',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.25rem auto',
                        boxShadow: '0 10px 25px rgba(16, 185, 129, 0.25)'
                      }}
                    >
                      <Check size={36} strokeWidth={3} />
                    </div>

                    <div className="badge-pill badge-status-confirmed" style={{ marginBottom: '1rem' }}>
                      <span>Appointment Token Generated</span>
                    </div>

                    <h3 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                      Thank You, {successBooking.patient_name}!
                    </h3>

                    <p style={{ color: '#64748B', fontSize: '0.95rem', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
                      Your OPD slot request has been registered in the clinic scheduling system.
                    </p>

                    {/* Token Card */}
                    <div 
                      style={{
                        backgroundColor: '#F8FAFC',
                        border: '2px dashed #CBD5E1',
                        borderRadius: '20px',
                        padding: '1.25rem',
                        textAlign: 'left',
                        marginBottom: '1.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Booking Token ID</span>
                          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0284C7', letterSpacing: '0.05em' }}>
                            {successBooking.booking_reference}
                          </div>
                        </div>
                        <span className="badge-pill badge-status-pending">Pending Doctor Review</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
                        <div>
                          <strong style={{ color: '#475569', display: 'block', fontSize: '0.75rem' }}>Treatment:</strong>
                          <span style={{ color: '#0F172A', fontWeight: 600 }}>{successBooking.treatment}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#475569', display: 'block', fontSize: '0.75rem' }}>Date:</strong>
                          <span style={{ color: '#0F172A', fontWeight: 600 }}>{successBooking.preferred_date}</span>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <strong style={{ color: '#475569', display: 'block', fontSize: '0.75rem' }}>{t?.shiftLabel || 'Shift:'}</strong>
                          <span style={{ color: '#0F172A', fontWeight: 600 }}>{successBooking.preferred_shift}</span>
                        </div>
                      </div>

                      {/* Live Queue Context for the Patient */}
                      {activeServing && (
                        <div 
                          style={{
                            marginTop: '0.75rem',
                            paddingTop: '0.75rem',
                            borderTop: '1px dashed #CBD5E1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                            fontSize: '0.8rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0369A1' }}>
                            <span className="pulse-dot available" style={{ width: '6px', height: '6px' }} />
                            <span>{t?.currentlyServingNotice || 'In Doctor Chamber:'}</span>
                            <strong style={{ backgroundColor: '#E0F2FE', color: '#0369A1', padding: '1px 6px', borderRadius: '4px' }}>
                              #{activeServing.booking_reference}
                            </strong>
                          </div>

                          {waitingAheadCount > 0 && (
                            <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700, fontSize: '0.75rem' }}>
                              {waitingAheadCount} {t?.queueAhead || 'patient(s) ahead in queue'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Dual Action Buttons: WhatsApp & Printable Slip */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                      <a
                        href={getWhatsAppBookingUrl(successBooking)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-pill btn-whatsapp"
                        style={{
                          padding: '1rem 1.5rem',
                          fontSize: '1rem',
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.625rem',
                          textDecoration: 'none'
                        }}
                      >
                        <Send size={18} />
                        <span>{t?.sendTokenWhatsApp || 'Send Booking Token on WhatsApp'}</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => setShowSlipModal(true)}
                        className="btn-pill"
                        style={{
                          padding: '0.875rem 1.5rem',
                          fontSize: '0.92rem',
                          width: '100%',
                          backgroundColor: '#F0F9FF',
                          color: '#0284C7',
                          border: '1.5px solid #BAE6FD',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          fontWeight: 700
                        }}
                      >
                        <Printer size={17} />
                        <span>{t?.printDownloadSlip || 'Download / Print Token Slip'}</span>
                      </button>
                    </div>

                    <button
                      onClick={handleResetForm}
                      className="btn-pill btn-secondary"
                      style={{
                        padding: '0.75rem 1.25rem',
                        fontSize: '0.85rem',
                        width: '100%'
                      }}
                    >
                      <RotateCcw size={15} />
                      <span>{t?.bookAnother || 'Book Another Appointment'}</span>
                    </button>

                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Printable OPD Token Slip Modal */}
      {showSlipModal && successBooking && (
        <TokenSlipModal 
          booking={successBooking}
          settings={settings}
          onClose={() => setShowSlipModal(false)}
          lang={lang}
          t={t}
        />
      )}

      <style>{`
        @media (min-width: 900px) {
          .booking-grid {
            grid-template-columns: 5fr 7fr !important;
          }
        }
      `}</style>
    </section>
  );
}
