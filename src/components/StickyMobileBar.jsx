import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

export default function StickyMobileBar({ settings, onBookClick }) {
  const phone = settings?.phone_number || '+917015846421';
  const whatsapp = settings?.whatsapp_number || '917015846421';

  const handleWhatsAppDirect = () => {
    const rawWa = whatsapp.replace(/\D/g, '');
    const cleanWa = rawWa.startsWith('91') ? rawWa : `91${rawWa}`;
    const text = encodeURIComponent('Namaste PrimeCare Clinic, I would like to book an OPD consultation slot today.');
    window.open(`https://wa.me/${cleanWa}?text=${text}`, '_blank');
  };

  return (
    <div 
      className="md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid #E2E8F0',
        padding: '0.625rem 0.875rem calc(0.625rem + env(safe-area-inset-bottom, 0px)) 0.875rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        boxShadow: '0 -4px 20px rgba(15, 23, 42, 0.08)'
      }}
    >
      {/* Left 50%: Call Clinic */}
      <a
        href={`tel:${phone}`}
        className="btn-pill btn-secondary"
        style={{
          flex: 1,
          padding: '0.75rem 0.5rem',
          fontSize: '0.85rem',
          minHeight: '44px',
          textDecoration: 'none',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
        }}
      >
        <Phone size={15} style={{ color: '#0284C7' }} />
        <span>Call Clinic</span>
      </a>

      {/* Right 50%: Book via WhatsApp / Form */}
      <button
        onClick={onBookClick}
        className="btn-pill btn-whatsapp"
        style={{
          flex: 1.2,
          padding: '0.75rem 0.5rem',
          fontSize: '0.85rem',
          minHeight: '44px',
          fontWeight: 700
        }}
      >
        <MessageCircle size={16} />
        <span>Book OPD Slot</span>
      </button>
    </div>
  );
}
