import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Calendar, 
  Menu, 
  X, 
  Plus, 
  Shield, 
  Stethoscope, 
  User, 
  Clock, 
  Star, 
  MapPin, 
  ChevronRight 
} from 'lucide-react';

export default function Navbar({ settings, onBookClick, onNavigateAdmin, lang = 'en', onToggleLang, t }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const clinicName = settings?.clinic_name || 'PrimeCare Clinic';
  const phone = settings?.phone_number || '+917015846421';

  const nameParts = clinicName.trim().split(' ');
  const brandTitle = nameParts[0] || 'PrimeCare';
  const brandSubtitle = nameParts.length > 1 
    ? nameParts.slice(1).join(' ') 
    : 'Multi-Speciality Clinic';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t?.navServices || 'Services', href: '#services', icon: Stethoscope },
    { name: t?.navAbout || 'About Doctor', href: '#about-doctor', icon: User },
    { name: t?.navTimings || 'OPD Timings', href: '#timings', icon: Clock },
    { name: t?.navReviews || 'Patient Reviews', href: '#reviews', icon: Star },
    { name: t?.navLocation || 'Clinic Location', href: '#location', icon: MapPin },
  ];

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      const topOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
      <nav aria-label="Main Navigation" className="header-container">
        
        {/* Left: Clinic Brand & Logo */}
        <a 
          href="/" 
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="brand-link"
          title={`${clinicName} - Home`}
        >
          <div className="brand-icon-box">
            <Plus size={22} strokeWidth={3} />
          </div>
          <div className="brand-text-wrap">
            <span className="brand-name">
              {brandTitle}
            </span>
            <span className="brand-subtitle">
              {brandSubtitle}
            </span>
          </div>
        </a>

        {/* Center: Desktop Navigation Links (Spaced, Pill Hover, Completely Hidden on Mobile/Tablet) */}
        <div className="header-nav-links">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="nav-link-item"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Right: Primary Book Appointment CTA */}
        <div className="header-actions">
          <button
            onClick={onBookClick}
            className="header-book-btn"
          >
            <Calendar size={18} />
            <span>{t?.bookAppointment || 'Book Appointment'}</span>
          </button>

          {/* Mobile / Tablet Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="header-menu-toggle"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-nav-panel">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="mobile-nav-item"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={17} style={{ color: '#0284C7' }} />
                  <span>{link.name}</span>
                </div>
                <ChevronRight size={15} style={{ color: '#94A3B8' }} />
              </a>
            );
          })}

          <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '0.5rem 0' }} />

          {/* Quick Call in Mobile Menu */}
          <a
            href={`tel:${phone}`}
            className="mobile-nav-item"
            style={{ color: '#0284C7', backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Phone size={17} style={{ color: '#0284C7' }} />
              <span>Call Reception ({phone})</span>
            </div>
            <ChevronRight size={15} style={{ color: '#0284C7' }} />
          </a>

          {/* Quick Booking in Mobile Menu */}
          <button
            onClick={() => { setMobileMenuOpen(false); onBookClick(); }}
            className="btn-pill btn-primary"
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.95rem',
              gap: '0.5rem',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
            }}
          >
            <Calendar size={17} />
            <span>{t?.bookOpdNow || 'Book OPD Slot Now'}</span>
          </button>

          {/* Admin Portal Link */}
          <button
            onClick={() => { setMobileMenuOpen(false); onNavigateAdmin(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: '#64748B',
              fontWeight: 600,
              fontSize: '0.82rem',
              padding: '0.5rem',
              marginTop: '0.25rem'
            }}
          >
            <Shield size={14} style={{ color: '#0284C7' }} />
            <span>Admin & Reception Portal</span>
          </button>
        </div>
      )}
    </header>
  );
}
