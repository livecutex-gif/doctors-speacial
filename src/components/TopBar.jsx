import React from 'react';
import { Phone, Clock, AlertTriangle, ShieldCheck, Languages, Activity } from 'lucide-react';

export default function TopBar({ settings, onNavigateAdmin, lang = 'en', onToggleLang, t, activeServing }) {
  const isAvailable = settings?.is_doctor_available ?? true;
  const morningTimings = settings?.opd_timing_morning || '9:30 AM – 2:00 PM';
  const eveningTimings = settings?.opd_timing_evening || '5:00 PM – 8:00 PM';
  const emergencyNotice = settings?.emergency_notice || 'OPD temporarily closed. For emergency care, contact reception.';
  const phone = settings?.phone_number || '+917015846421';

  return (
    <aside aria-label="Clinic Announcement" className="site-topbar">
      <div className="content-wrap site-topbar-inner">
        
        {/* Availability Status & Live Queue Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span 
              className={`pulse-dot ${isAvailable ? 'available' : 'unavailable'}`}
              title={isAvailable ? 'Doctor is currently attending OPD' : 'OPD is currently closed'}
            />
            
            {isAvailable ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#F1F5F9', fontWeight: 500, fontSize: '0.78rem' }}>
                <strong style={{ color: '#34D399', fontWeight: 600 }}>{t?.opdOpenToday || 'OPD Open:'}</strong>
                <span>{t?.morning || 'Morning'} {morningTimings} &bull; {t?.evening || 'Evening'} {eveningTimings}</span>
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#FCA5A5', fontWeight: 500, fontSize: '0.78rem' }}>
                <AlertTriangle size={13} style={{ color: '#EF4444' }} />
                <strong>{t?.emergencyNotice || 'Notice:'}</strong>
                <span>{emergencyNotice}</span>
              </span>
            )}
          </div>

          {/* Live Queue Tracker Pill */}
          {isAvailable && activeServing && (
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                backgroundColor: 'rgba(2, 132, 199, 0.25)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '9999px',
                padding: '2px 8px',
                color: '#BAE6FD',
                fontSize: '0.72rem',
                fontWeight: 600
              }}
            >
              <Activity size={12} style={{ color: '#38BDF8' }} />
              <span>{t?.liveQueueBanner || 'Live Token:'}</span>
              <strong style={{ color: '#FFFFFF', backgroundColor: '#0284C7', padding: '1px 6px', borderRadius: '4px' }}>
                {activeServing.booking_reference}
              </strong>
            </div>
          )}

        </div>

        {/* Quick Links & Language Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
          
          {/* Emergency Phone */}
          <a 
            href={`tel:${phone}`}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              color: '#BAE6FD', 
              textDecoration: 'none', 
              fontWeight: 600,
              fontSize: '0.78rem',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.target.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.target.style.color = '#BAE6FD')}
          >
            <Phone size={12} style={{ color: '#38BDF8' }} />
            <span>{phone}</span>
          </a>

          <span style={{ color: '#334155' }}>|</span>

          {/* Language Switcher Pill */}
          <button
            onClick={onToggleLang}
            className="btn-pill"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 10px',
              minHeight: '26px'
            }}
            title="Switch Language / भाषा बदलें"
          >
            <Languages size={12} style={{ color: '#38BDF8' }} />
            <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
          </button>
        </div>

      </div>
    </aside>
  );
}
