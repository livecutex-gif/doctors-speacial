import React from 'react';
import { Clock, MapPin, Navigation, Phone, Shield, ExternalLink, CalendarCheck } from 'lucide-react';

export default function LocationTimings({ settings }) {
  const address = settings?.clinic_address || 'Opposite Civil Hospital Gate, Court Road, Hansi - 125033, Hisar District, Haryana';
  const phone = settings?.phone_number || '+917015846421';
  const morningTimings = settings?.opd_timing_morning || '9:30 AM – 2:00 PM';
  const eveningTimings = settings?.opd_timing_evening || '5:00 PM – 8:00 PM';

  const schedule = [
    { days: 'Monday – Friday', morning: morningTimings, evening: eveningTimings, status: 'Regular OPD' },
    { days: 'Saturday', morning: morningTimings, evening: '5:00 PM – 7:30 PM', status: 'Regular OPD' },
    { days: 'Sunday', morning: '10:00 AM – 1:00 PM', evening: 'Emergency Only', status: 'Restricted' },
  ];

  return (
    <section id="timings" style={{ backgroundColor: '#FFFFFF' }} className="py-12 md:py-20">
      <div className="content-wrap">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
          <div className="badge-pill badge-sky" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
            <span>Clinic Timings & Location</span>
          </div>

          <h2 style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.5rem)', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>
            Visit Us in Hansi (Hisar)
          </h2>

          <p style={{ fontSize: '1.02rem', color: '#64748B' }}>
            Centrally situated right across Civil Hospital with designated patient parking and ambulance access.
          </p>
        </div>

        {/* 2-Column Grid: Left Schedule & Info, Right Google Maps */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', alignItems: 'stretch' }} className="timing-grid">
          
          {/* Left Card: Day-by-Day OPD Timings & Address */}
          <div 
            className="prime-card"
            style={{
              padding: '2rem',
              borderRadius: '24px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
                <div 
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#E0F2FE',
                    color: '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Clock size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    OPD Consultation Schedule
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Token priority for pre-booked patients</span>
                </div>
              </div>

              {/* Day-by-day table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.75rem' }}>
                {schedule.map((row, idx) => (
                  <div 
                    key={idx}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '16px',
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                        {row.days}
                      </span>
                      <span 
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          backgroundColor: row.status === 'Regular OPD' ? '#D1FAE5' : '#FEF3C7',
                          color: row.status === 'Regular OPD' ? '#065F46' : '#92400E'
                        }}
                      >
                        {row.status}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <div style={{ color: '#475569' }}>
                        <strong style={{ color: '#0F172A', fontWeight: 600 }}>Morning:</strong> {row.morning}
                      </div>
                      <div style={{ color: '#475569' }}>
                        <strong style={{ color: '#0F172A', fontWeight: 600 }}>Evening:</strong> {row.evening}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address Box */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <MapPin size={20} style={{ color: '#0284C7', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Clinic Address
                    </h4>
                    <span 
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        backgroundColor: '#E0F2FE',
                        color: '#0369A1',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}
                    >
                      Landmark: Civil Hospital Gate
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    {address}
                  </p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.625rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Helpline / Direct Reception:</span>
                <a href={`tel:${phone}`} style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284C7', textDecoration: 'none' }}>
                  {phone}
                </a>
              </div>
            </div>

          </div>

          {/* Right Card: Google Maps Container & Direction Button */}
          <div 
            id="location"
            className="prime-card"
            style={{
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Styled Map Container - Height optimized for phone scroll */}
            <div style={{ width: '100%', height: '260px', position: 'relative', backgroundColor: '#E2E8F0' }} className="md:h-[360px]">
              <iframe
                title="Clinic Location Map Hansi"
                src="https://maps.google.com/maps?q=Civil+Hospital+Court+Road+Hansi+Haryana&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, position: 'absolute', inset: 0, filter: 'contrast(1.02) saturate(1.05)' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Map Action Footer */}
            <div 
              style={{
                padding: '1rem 1.25rem',
                backgroundColor: '#FFFFFF',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', display: 'block' }}>
                  PrimeCare Medical Center
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Court Road, Hansi (Hisar) - Easy Patient Parking
                </span>
              </div>

              <a
                href="https://maps.google.com/?q=Civil+Hospital+Court+Road+Hansi+Haryana"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pill btn-primary"
                style={{
                  padding: '0.625rem 1.15rem',
                  fontSize: '0.82rem',
                  textDecoration: 'none',
                  flexGrow: 1
                }}
              >
                <Navigation size={14} />
                <span>Get Directions on Google Maps</span>
                <ExternalLink size={12} />
              </a>
            </div>

          </div>

        </div>

      </div>

      <style>{`
        @media (min-width: 900px) {
          .timing-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
