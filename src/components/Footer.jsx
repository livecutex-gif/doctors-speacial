import React from 'react';
import { Plus, Phone, MapPin, Clock, ShieldCheck, Heart } from 'lucide-react';

export default function Footer({ settings, onNavigateAdmin }) {
  const clinicName = settings?.clinic_name || 'PrimeCare Multi-Speciality Clinic';
  const doctorName = settings?.doctor_name || 'Dr. A. K. Sharma';
  const phone = settings?.phone_number || '+917015846421';
  const address = settings?.clinic_address || 'Opposite Civil Hospital Gate, Court Road, Hansi - 125033, Hisar District, Haryana';

  return (
    <footer style={{ backgroundColor: '#0F172A', color: '#94A3B8', paddingTop: '3rem', paddingBottom: 'calc(6.5rem + env(safe-area-inset-bottom, 0px))', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="content-wrap">
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem', marginBottom: '3.5rem' }} className="footer-grid">
          
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div 
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px', 
                  background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF'
                }}
              >
                <Plus size={20} strokeWidth={3} />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                {clinicName}
              </span>
            </div>

            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#94A3B8', marginBottom: '1.5rem', maxWidth: '340px' }}>
              Dedicated outpatient healthcare clinic offering evidence-based OPD consultations, routine diagnostics, and verified patient care.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#38BDF8' }}>
              <ShieldCheck size={16} />
              <span>Reg. Medical Council #{settings?.doctor_reg_no || 'HN-48291'}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Clinic Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
              <li><a href="#services" style={{ color: '#94A3B8', textDecoration: 'none' }}>Speciality Treatments</a></li>
              <li><a href="#about-doctor" style={{ color: '#94A3B8', textDecoration: 'none' }}>About {doctorName}</a></li>
              <li><a href="#timings" style={{ color: '#94A3B8', textDecoration: 'none' }}>OPD Shift Hours</a></li>
              <li><a href="#reviews" style={{ color: '#94A3B8', textDecoration: 'none' }}>Patient Google Reviews</a></li>
              <li><a href="#location" style={{ color: '#94A3B8', textDecoration: 'none' }}>Maps & Driving Directions</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Emergency & Reception
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                <MapPin size={17} style={{ color: '#38BDF8', flexShrink: 0, marginTop: '2px' }} />
                <span>{address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Phone size={17} style={{ color: '#38BDF8', flexShrink: 0 }} />
                <a href={`tel:${phone}`} style={{ color: '#FFFFFF', textDecoration: 'none', fontWeight: 600 }}>{phone}</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Clock size={17} style={{ color: '#38BDF8', flexShrink: 0 }} />
                <span>Morning 9:30 AM – 2:00 PM | Evening 5:00 PM – 8:00 PM</span>
              </div>
            </div>
          </div>

          {/* Portal & Staff Login */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Clinic Staff Portal
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '1rem', lineHeight: 1.5 }}>
              Authorized receptionists & doctor access to view OPD schedule and confirm WhatsApp tokens.
            </p>
            <button
              onClick={onNavigateAdmin}
              className="btn-pill"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '0.625rem 1.25rem',
                fontSize: '0.85rem'
              }}
            >
              <ShieldCheck size={15} style={{ color: '#38BDF8' }} />
              <span>Admin & OPD Dashboard</span>
            </button>
          </div>

        </div>

        {/* Bottom Bar */}
        <div 
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '1.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.8rem'
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} {clinicName}. All Rights Reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748B' }}>
            <span>Crafted with medical precision for patient well-being</span>
          </div>
        </div>

      </div>

      <style>{`
        @media (min-width: 900px) {
          .footer-grid {
            grid-template-columns: 1.5fr 1fr 1.2fr 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
