import React from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';

const PATIENT_REVIEWS = [
  {
    id: 1,
    name: 'Suresh Goyal',
    location: 'Court Road, Hansi',
    rating: 5,
    date: '3 days ago',
    comment: 'Dr. Sharma is the most patient doctor I have consulted. My mother had uncontrolled diabetes for months. Within 3 weeks of his treatment plan and lifestyle changes, her HbA1c is under control. The WhatsApp booking token saved us from waiting 2 hours in rush OPD.',
    verified: true,
    treatment: 'Diabetology Care'
  },
  {
    id: 2,
    name: 'Anjali Mittal',
    location: 'Sector 14, Hisar',
    rating: 5,
    date: '1 week ago',
    comment: 'Excellent clinic environment. Very clean, air-conditioned, and sanitized. We visited for my 5-year-old child who had viral bronchitis. Doctor explained every medicine clearly without prescribing unnecessary antibiotics.',
    verified: true,
    treatment: 'Pediatrics'
  },
  {
    id: 3,
    name: 'Baljeet Singh Sindhu',
    location: 'Barwala Road, Hansi',
    rating: 5,
    date: '2 weeks ago',
    comment: 'Had sudden palpitation and mild chest pain. Visited PrimeCare and they conducted an instant ECG within 5 minutes. Doctor Sharma carefully evaluated and reassured us. Highly trusted clinic in Hansi!',
    verified: true,
    treatment: 'Cardiology & ECG'
  }
];

export default function Reviews() {
  return (
    <section id="reviews" style={{ backgroundColor: '#F8FAFC' }} className="py-12 md:py-20">
      <div className="content-wrap">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
          <div className="badge-pill badge-sky" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
            <span>Verified Patient Feedback</span>
          </div>

          <h2 style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.5rem)', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>
            Trusted by Thousands of Families Across Hansi & Hisar
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="#F59E0B" stroke="#F59E0B" />
              ))}
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>4.9 out of 5</span>
            <span style={{ color: '#94A3B8' }}>&bull;</span>
            <span style={{ fontSize: '0.9rem', color: '#64748B' }}>Google Reviews Verified</span>
          </div>
        </div>

        {/* 3-Column Review Cards */}
        <div className="grid-3">
          {PATIENT_REVIEWS.map((review) => (
            <div
              key={review.id}
              className="prime-card"
              style={{
                padding: '1.75rem',
                borderRadius: '24px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={15} fill="#F59E0B" stroke="#F59E0B" />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{review.date}</span>
                </div>

                <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem', fontStyle: 'italic' }}>
                  "{review.comment}"
                </p>
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      {review.name}
                    </h4>
                    {review.verified && <CheckCircle size={14} fill="#10B981" stroke="#FFFFFF" />}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    {review.location}
                  </div>
                </div>

                <span 
                  style={{
                    fontSize: '0.72rem',
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontWeight: 600
                  }}
                >
                  {review.treatment}
                </span>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
