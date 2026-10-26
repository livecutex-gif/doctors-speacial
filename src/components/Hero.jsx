import React from 'react';
import { Calendar, Phone, CheckCircle, Star, MessageCircle } from 'lucide-react';

export default function Hero({ settings, onBookClick, t }) {
  const doctorName = settings?.doctor_name || 'Dr. A. K. Sharma';
  const doctorDegree = settings?.doctor_degree || 'MBBS, MD (Medicine) - Senior Physician';
  const doctorReg = settings?.doctor_reg_no || 'HN-48291';
  const phone = settings?.phone_number || '+917015846421';

  return (
    <section className="hero-section" style={{ position: 'relative' }}>
      <div className="content-wrap">
        <div className="hero-grid">
          
          {/* Doctor Portrait Card - Appears FIRST on mobile (order: 1), RIGHT on desktop (order: 2) */}
          <div className="hero-doctor-col">
            <div className="doctor-card-wrapper">
              
              {/* Doctor Image Container */}
              <div className="doctor-img-box">
                <img 
                  src="/doctor-portrait.jpg" 
                  alt={doctorName}
                  className="doctor-portrait-img"
                  loading="eager"
                />

                {/* Subtle vignette gradient for contrast */}
                <div 
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.5) 0%, rgba(15, 23, 42, 0.1) 35%, transparent 65%)'
                  }}
                />
              </div>

              {/* Floating Badge: WhatsApp Token */}
              <div className="doctor-top-badge glass-panel">
                <span className="pulse-dot available" />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MessageCircle size={13} style={{ color: '#25D366' }} />
                  WhatsApp Token
                </span>
              </div>

              {/* Doctor Info Glass Banner at Bottom */}
              <div className="doctor-info-banner glass-panel">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        {doctorName}
                      </h2>
                      <CheckCircle size={15} fill="#0284C7" stroke="#FFFFFF" />
                    </div>
                    <p style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600, marginTop: '2px' }}>
                      {doctorDegree}
                    </p>
                  </div>
                  
                  <div 
                    style={{
                      backgroundColor: '#E0F2FE',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#0369A1',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    Reg. {doctorReg}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Text & CTAs Column - Appears SECOND on mobile (order: 2), LEFT on desktop (order: 1) */}
          <div className="hero-text-col">
            
            {/* Main Headline */}
            <h1 className="hero-headline">
              {t?.heroHeadline1 || 'Modern Healthcare,'} <br />
              <span style={{ 
                background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {t?.heroHeadline2 || 'Simplified for Your Family.'}
              </span>
            </h1>

            {/* Subheadline */}
            <p className="hero-subheadline">
              {t?.heroSubheadline || 'Experience patient-first healthcare. Comprehensive OPD consultations, in-house diagnostics, painless procedures, and zero waiting-room chaos — all with instant WhatsApp confirmation.'}
            </p>

            {/* Dual CTA Row */}
            <div className="hero-cta-row">
              <button
                onClick={onBookClick}
                className="btn-pill btn-primary hero-btn-main"
              >
                <Calendar size={18} />
                <span>{t?.bookOpdNow || 'Book OPD Slot Now'}</span>
              </button>

              <a
                href={`tel:${phone}`}
                className="btn-pill btn-secondary hero-btn-sub"
              >
                <Phone size={18} style={{ color: '#0284C7' }} />
                <span>{t?.callReception || 'Call Reception'}</span>
              </a>
            </div>

            {/* Micro-Stats Bar */}
            <div className="prime-card hero-stats-bar">
              {/* Stat 1 */}
              <div style={{ textAlign: 'center' }}>
                <div className="stat-number">
                  <span>10,000+</span>
                </div>
                <div className="stat-label">
                  Happy Patients
                </div>
              </div>

              {/* Divider */}
              <div style={{ textAlign: 'center', borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }}>
                <div className="stat-number" style={{ color: '#0284C7' }}>
                  MD Medicine
                </div>
                <div className="stat-label">
                  Senior Physician
                </div>
              </div>

              {/* Stat 3 */}
              <div style={{ textAlign: 'center' }}>
                <div className="stat-number" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                  <Star size={16} fill="#F59E0B" stroke="#F59E0B" />
                  <span>4.9★</span>
                </div>
                <div className="stat-label">
                  Google Rating
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      <style>{`
        .hero-section {
          padding-top: 1.5rem;
          padding-bottom: 3rem;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          align-items: center;
        }

        /* Mobile First: Doctor on Top, Text Below */
        .hero-doctor-col {
          order: 1;
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .hero-text-col {
          order: 2;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .doctor-card-wrapper {
          position: relative;
          width: 100%;
          max-width: 340px;
          border-radius: 24px;
          padding: 8px;
          background: linear-gradient(145deg, #E0F2FE 0%, #FFFFFF 60%, #F1F5F9 100%);
          border: 1px solid #CBD5E1;
          box-shadow: 0 16px 36px -10px rgba(15, 23, 42, 0.1);
        }

        .doctor-img-box {
          width: 100%;
          aspect-ratio: 1 / 1.05;
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          background-color: #E2E8F0;
        }

        .doctor-portrait-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          display: block;
        }

        .doctor-top-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
          border: 1px solid rgba(255, 255, 255, 0.95);
          background-color: rgba(255, 255, 255, 0.92);
        }

        .doctor-info-banner {
          position: absolute;
          bottom: 16px;
          left: 16px;
          right: 16px;
          padding: 0.75rem 1rem;
          border-radius: 16px;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.95);
          background-color: rgba(255, 255, 255, 0.92);
        }

        .hero-headline {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          line-height: 1.15;
          color: #0F172A;
          letter-spacing: -0.03em;
        }

        .hero-subheadline {
          font-size: clamp(0.95rem, 1.4vw, 1.15rem);
          line-height: 1.65;
          color: #475569;
          max-width: 580px;
        }

        .hero-cta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          padding-top: 0.25rem;
        }

        .hero-btn-main {
          padding: 0.875rem 1.75rem;
          font-size: 0.95rem;
          box-shadow: 0 12px 25px -4px rgba(2, 132, 199, 0.35);
          flex: 1 1 200px;
        }

        .hero-btn-sub {
          padding: 0.875rem 1.5rem;
          font-size: 0.95rem;
          flex: 1 1 170px;
        }

        .hero-stats-bar {
          margin-top: 0.5rem;
          padding: 1rem 0.75rem;
          background-color: #FFFFFF;
          border-radius: 20px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          align-items: center;
          max-width: 580px;
          border: 1px solid #E2E8F0;
        }

        .stat-number {
          font-size: clamp(1rem, 2.5vw, 1.3rem);
          font-weight: 800;
          color: #0F172A;
        }

        .stat-label {
          font-size: 0.72rem;
          color: #64748B;
          font-weight: 500;
          margin-top: 2px;
        }

        /* Desktop Viewport (>= 900px): Text Left, Doctor Right */
        @media (min-width: 900px) {
          .hero-section {
            padding-top: 3rem;
            padding-bottom: 4rem;
          }

          .hero-grid {
            grid-template-columns: 1.15fr 0.85fr !important;
            gap: 3rem !important;
          }

          .hero-text-col {
            order: 1 !important;
          }

          .hero-doctor-col {
            order: 2 !important;
            justify-content: flex-end !important;
          }

          .doctor-card-wrapper {
            max-width: 420px !important;
          }

          .doctor-img-box {
            aspect-ratio: 3 / 4 !important;
          }
        }
      `}</style>
    </section>
  );
}
