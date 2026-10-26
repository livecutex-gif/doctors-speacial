import React from 'react';
import { 
  Stethoscope, 
  Heart, 
  Baby, 
  Activity, 
  Sparkles, 
  FlaskConical, 
  ArrowRight, 
  Clock, 
  IndianRupee 
} from 'lucide-react';

export const CLINIC_SERVICES = [
  {
    id: 'general-medicine',
    title: 'General Medicine & Diabetology',
    category: 'Primary Healthcare',
    description: 'Expert diagnosis for seasonal fevers, hypertension, high cholesterol, thyroid imbalances, and personalized diabetes care.',
    fee: '500',
    duration: '20 mins',
    icon: Stethoscope,
    popular: true
  },
  {
    id: 'cardiology-ecg',
    title: 'Cardiology & ECG',
    category: 'Preventive Heart Care',
    description: 'Immediate 12-lead digital ECG, chest pain evaluation, blood pressure monitoring, and cardiovascular risk reduction.',
    fee: '700',
    duration: '25 mins',
    icon: Heart,
    popular: true
  },
  {
    id: 'pediatrics',
    title: 'Pediatrics & Child Care',
    category: 'Infant & Child Wellness',
    description: 'Complete developmental milestone checks, vaccination schedules, nutritional guidance, and pediatric infections treatment.',
    fee: '500',
    duration: '20 mins',
    icon: Baby,
    popular: false
  },
  {
    id: 'orthopedics',
    title: 'Orthopedics & Joint Care',
    category: 'Bones & Mobility',
    description: 'Non-surgical arthritis relief, cervical spondylosis, lower back pain management, and bone mineral density screening.',
    fee: '600',
    duration: '20 mins',
    icon: Activity,
    popular: false
  },
  {
    id: 'gynecology',
    title: 'Gynecology & Women\'s Health',
    category: 'Maternal & Hormonal',
    description: 'PCOD/PCOS lifestyle treatment, antenatal checkups, routine health screenings, and confidential women wellness consultations.',
    fee: '600',
    duration: '25 mins',
    icon: Sparkles,
    popular: false
  },
  {
    id: 'lab-diagnostics',
    title: 'In-House Diagnostics & Blood Lab',
    category: 'Diagnostics',
    description: 'Instant blood sugar, CBC, lipid profile, urine routine, and rapid tests with digital reports delivered straight to WhatsApp.',
    fee: '350',
    duration: 'Fast-Track',
    icon: FlaskConical,
    popular: false
  }
];

export default function Services({ onSelectService }) {
  return (
    <section id="services" style={{ backgroundColor: '#F8FAFC' }} className="py-12 md:py-20">
      <div className="content-wrap">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3rem auto' }}>
          <div 
            className="badge-pill badge-sky"
            style={{ marginBottom: '1rem', display: 'inline-flex' }}
          >
            <span>Our Specializations</span>
          </div>

          <h2 
            style={{ 
              fontSize: 'clamp(1.85rem, 3.2vw, 2.5rem)', 
              fontWeight: 800, 
              color: '#0F172A',
              lineHeight: 1.2,
              marginBottom: '1rem'
            }}
          >
            Comprehensive Medical Care Across Key Disciplines
          </h2>

          <p style={{ fontSize: '1.05rem', color: '#64748B', lineHeight: 1.6 }}>
            Every consultation is designed for thorough physical assessment, transparent medical guidance, and unhurried discussions.
          </p>
        </div>

        {/* 3-Column Bento Grid */}
        <div className="grid-3">
          {CLINIC_SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="prime-card"
                style={{
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '24px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.25s, box-shadow 0.25s, border-color 0.25s'
                }}
                onClick={() => onSelectService(service.title)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#7DD3FC';
                  e.currentTarget.style.boxShadow = '0 16px 35px -8px rgba(2, 132, 199, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.boxShadow = 'var(--shadow-diffused)';
                }}
              >
                {service.popular && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '1.25rem',
                      right: '1.25rem',
                      backgroundColor: '#E0F2FE',
                      color: '#0369A1',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '9999px',
                      border: '1px solid #BAE6FD'
                    }}
                  >
                    High Demand
                  </div>
                )}

                <div>
                  {/* Icon Box */}
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      backgroundColor: '#F0F9FF',
                      color: '#0284C7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem',
                      transition: 'all 0.3s'
                    }}
                  >
                    <Icon size={26} strokeWidth={2} />
                  </div>

                  {/* Title & Description */}
                  <h3 
                    style={{ 
                      fontSize: '1.2rem', 
                      fontWeight: 700, 
                      color: '#0F172A',
                      marginBottom: '0.625rem',
                      lineHeight: 1.3
                    }}
                  >
                    {service.title}
                  </h3>

                  <p 
                    style={{ 
                      fontSize: '0.92rem', 
                      color: '#64748B', 
                      lineHeight: 1.55,
                      marginBottom: '1.5rem'
                    }}
                  >
                    {service.description}
                  </p>
                </div>

                {/* Footer Tag & CTA */}
                <div>
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1.25rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid #F1F5F9'
                    }}
                  >
                    <span 
                      style={{ 
                        fontSize: '0.82rem', 
                        fontWeight: 700, 
                        color: '#0F172A', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '2px',
                        backgroundColor: '#F8FAFC',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0'
                      }}
                    >
                      <IndianRupee size={12} />
                      {service.fee}
                    </span>

                    <span 
                      style={{ 
                        fontSize: '0.8rem', 
                        color: '#64748B', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px' 
                      }}
                    >
                      <Clock size={13} style={{ color: '#94A3B8' }} />
                      {service.duration}
                    </span>
                  </div>

                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#0284C7',
                      transition: 'gap 0.2s'
                    }}
                  >
                    <span>Book for this</span>
                    <ArrowRight size={15} />
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
