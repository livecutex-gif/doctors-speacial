import React from 'react';
import { Award, CheckCircle2, ShieldCheck, HeartPulse, GraduationCap, Building2 } from 'lucide-react';

export default function AboutDoctor({ settings }) {
  const doctorName = settings?.doctor_name || 'Dr. A. K. Sharma';
  const doctorDegree = settings?.doctor_degree || 'MBBS, MD (Medicine) - Senior Consultant Physician';
  const doctorReg = settings?.doctor_reg_no || 'HN-48291';

  const highlights = [
    {
      icon: GraduationCap,
      title: 'Top Medical Pedigree',
      desc: 'Completed MBBS & MD in General Medicine from premier government medical institutions with honors.'
    },
    {
      icon: Award,
      title: '15+ Years Clinical Practice',
      desc: 'Managed over 25,000+ complex medical cases across Haryana with a stellar recovery track record.'
    },
    {
      icon: ShieldCheck,
      title: 'Strict Sterilization Protocols',
      desc: 'Hospital-grade autoclaving, air filtration, and hygienic examination rooms following NABH standards.'
    },
    {
      icon: HeartPulse,
      title: 'Evidence-Based Medicine',
      desc: 'Zero unnecessary diagnostic tests or excessive medications. Direct, honest, empathetic consultations.'
    }
  ];

  return (
    <section id="about-doctor" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }} className="py-12 md:py-20">
      <div className="content-wrap">
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'center' }} className="about-grid">
          
          {/* Left: Doctor Credentials & Story */}
          <div>
            <div className="badge-pill badge-sky" style={{ marginBottom: '1.25rem' }}>
              <span>Senior Medical Leadership</span>
            </div>

            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#0F172A', lineHeight: 1.18, marginBottom: '1.25rem' }}>
              Meet {doctorName}
            </h2>

            <p style={{ fontSize: '1.1rem', color: '#0284C7', fontWeight: 700, marginBottom: '1.25rem' }}>
              {doctorDegree} &bull; Reg. #{doctorReg}
            </p>

            <p style={{ fontSize: '1.02rem', color: '#475569', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              "Our clinic was established with a single unwavering promise: every patient deserves patient-centered, unhurried medical attention. We eliminate the frustration of long hospital queues by giving you confirmed time slots, transparent guidance, and proactive follow-ups."
            </p>

            {/* Registration Verification Strip */}
            <div 
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}
            >
              <div 
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#D1FAE5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                  State Medical Council Registered
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Verified License #{doctorReg} &bull; Senior Consultant Practice
                </div>
              </div>
            </div>

          </div>

          {/* Right: 4 Pillar Highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }} className="sm:grid-cols-2">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={index}
                  className="prime-card"
                  style={{
                    padding: '1.5rem',
                    borderRadius: '20px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <div 
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: '#FFFFFF',
                      color: '#0284C7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem',
                      boxShadow: '0 4px 12px rgba(2, 132, 199, 0.08)'
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.55 }}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      <style>{`
        @media (min-width: 900px) {
          .about-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
