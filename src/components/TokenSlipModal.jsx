import React, { useEffect } from 'react';
import { Printer, X, ShieldCheck, CheckCircle2, Phone, MapPin, Calendar, Clock, Plus } from 'lucide-react';

export default function TokenSlipModal({ booking, settings, onClose, lang = 'en', t }) {
  if (!booking) return null;

  const clinicName = settings?.clinic_name || 'PrimeCare Multi-Speciality Clinic';
  const doctorName = settings?.doctor_name || 'Dr. A. K. Sharma';
  const doctorDegree = settings?.doctor_degree || 'MBBS, MD (Medicine) - Senior Physician';
  const doctorReg = settings?.doctor_reg_no || 'HN-48291';
  const clinicPhone = settings?.phone_number || '+917015846421';
  const clinicAddress = settings?.clinic_address || 'Opposite Civil Hospital Gate, Court Road, Hansi - 125033, Haryana';

  const handlePrint = () => {
    const slipEl = document.getElementById('printable-token-slip');
    const printArea = document.getElementById('isolated-print-area');

    if (slipEl && printArea) {
      printArea.innerHTML = `
        <div style="max-width: 480px; margin: 0 auto; padding: 20px; border: 2px dashed #0284C7; border-radius: 20px; background: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ${slipEl.innerHTML}
        </div>
      `;

      document.body.classList.add('print-token-active');

      const cleanup = () => {
        document.body.classList.remove('print-token-active');
        if (printArea) printArea.innerHTML = '';
        window.removeEventListener('afterprint', cleanup);
      };
      window.addEventListener('afterprint', cleanup);

      // Safety fallback to clean up class after print dialog
      setTimeout(() => {
        document.body.classList.remove('print-token-active');
      }, 6000);

      window.print();
    } else {
      window.print();
    }
  };

  // Intercept Ctrl+P / Cmd+P to print ONLY this slip
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handlePrint();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      className="token-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto'
      }}
    >
      <div 
        className="token-modal-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '1.5rem 1.15rem',
          boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.35)',
          border: '1px solid #E2E8F0',
          position: 'relative',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        {/* Close Button (Hidden on Print) */}
        <button
          onClick={onClose}
          className="no-print"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            color: '#94A3B8',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={t?.close || 'Close'}
        >
          <X size={20} />
        </button>

        {/* PRINTABLE SLIP CONTENT AREA */}
        <div id="printable-token-slip">
          
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px dashed #CBD5E1', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
              <div 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '8px', 
                  backgroundColor: '#0284C7',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Plus size={20} strokeWidth={3} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                {clinicName}
              </span>
            </div>

            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0284C7' }}>
              {doctorName} &bull; {doctorDegree}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
              Reg. #{doctorReg} &bull; {clinicAddress}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>
              Helpline / Desk: {clinicPhone}
            </div>

            <div 
              style={{
                marginTop: '0.75rem',
                display: 'inline-block',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '3px 12px',
                borderRadius: '9999px',
                textTransform: 'uppercase'
              }}
            >
              {t?.opdAppointmentPass || 'OFFICIAL OPD APPOINTMENT PASS'}
            </div>
          </div>

          {/* Big Token Number Banner */}
          <div 
            style={{
              backgroundColor: '#F0F9FF',
              border: '2px solid #BAE6FD',
              borderRadius: '18px',
              padding: '1rem',
              textAlign: 'center',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t?.bookingTokenId || 'Booking Token ID'}
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0284C7', letterSpacing: '0.06em', lineHeight: 1.1, margin: '4px 0' }}>
              {booking.booking_reference}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
              <CheckCircle2 size={14} />
              <span>Verified Digital Priority Slot</span>
            </div>
          </div>

          {/* Patient Details Grid */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
              fontSize: '0.85rem',
              backgroundColor: '#F8FAFC',
              borderRadius: '16px',
              padding: '1rem 1.25rem',
              border: '1px solid #E2E8F0',
              marginBottom: '1.25rem'
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Patient Name</div>
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>{booking.patient_name}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Age / Gender</div>
              <div style={{ fontWeight: 700, color: '#0F172A' }}>{booking.patient_age ? `${booking.patient_age} Years` : 'Not specified'}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Contact Mobile</div>
              <div style={{ fontWeight: 700, color: '#0F172A' }}>+91 {booking.patient_phone}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Date</div>
              <div style={{ fontWeight: 700, color: '#0F172A' }}>{booking.preferred_date}</div>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Preferred Shift</div>
              <div style={{ fontWeight: 700, color: '#0284C7' }}>{booking.preferred_shift}</div>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Department / Speciality</div>
              <div style={{ fontWeight: 700, color: '#0F172A' }}>{booking.treatment}</div>
            </div>
          </div>

          {/* Barcode representation */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div 
              style={{
                fontFamily: 'monospace',
                letterSpacing: '5px',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                height: '36px'
              }}
            >
              ||| | |||| | ||| || ||| | |||| || |
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
              Security Token #{booking.booking_reference} &bull; Generated via PrimeCare System
            </div>
          </div>

          {/* Footer Notice */}
          <div style={{ fontSize: '0.75rem', color: '#64748B', textAlign: 'center', lineHeight: 1.4, borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem' }}>
            {t?.presentAtCounter || 'Please present this digital pass or printout at the clinic reception counter upon arrival. Pre-booked patients receive token queue priority.'}
          </div>

        </div>

        {/* Modal Action Buttons (Hidden when printing) */}
        <div className="no-print" style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button
            onClick={onClose}
            className="btn-pill btn-secondary"
            style={{ flex: 1, padding: '0.75rem', fontSize: '0.85rem' }}
          >
            {t?.close || 'Close'}
          </button>

          <button
            onClick={handlePrint}
            className="btn-pill btn-primary"
            style={{ flex: 1.5, padding: '0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Printer size={16} />
            <span>{t?.printThisPass || 'Print OPD Pass'}</span>
          </button>
        </div>

      </div>

      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          html, body {
            height: auto !important;
            min-height: 0 !important;
            max-height: 100vh !important;
            overflow: hidden !important;
            background: #FFFFFF !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
