import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube, Sparkles, Heart } from 'lucide-react';
import { Logo } from './Logo';
import { WhatsAppButton } from './WhatsAppButton';
import { useSettings } from '../../context/SettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useSettings();
  const currentYear = new Date().getFullYear();

  const categories = [
    { name: 'Wedding Decoration', slug: 'wedding-decoration' },
    { name: 'Reception Decoration', slug: 'reception-decoration' },
    { name: 'Engagement', slug: 'engagement' },
    { name: 'Birthday Celebration', slug: 'birthday-celebration' },
    { name: 'Baby Shower', slug: 'baby-shower' },
    { name: 'Traditional Functions', slug: 'traditional-functions' },
    { name: 'Photoshoots', slug: 'photoshoots' },
    { name: 'Catering', slug: 'catering' },
    { name: 'Event Stalls', slug: 'event-stalls' },
  ];

  return (
    <footer className="bg-[#1A1816] text-[#CECDCC] pt-16 pb-8 border-t border-[#3D3835]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#3D3835]">
          {/* Brand Info */}
          <div className="space-y-4">
            <Logo variant="light" size="lg" />
            <p className="text-sm leading-relaxed text-[#AFAEA9] mt-3">
              {settings?.about_text ||
                'South India’s premier luxury event decorators. Transforming auspicious occasions into timeless masterpieces with royal mandapams, exotic florals, and unforgettable celebration styling.'}
            </p>
            <div className="pt-2">
              <WhatsAppButton
                size="sm"
                label="Direct WhatsApp Enquiry"
                className="rounded-xl w-full sm:w-auto"
              />
            </div>
            <div className="flex items-center gap-3 pt-3">
              <a
                href={settings?.instagram_url || settings?.socialInstagram || 'https://instagram.com/sathuragiridecoration'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#2E2A27] flex items-center justify-center text-[#B8955A] hover:bg-[#B8955A] hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={settings?.facebook_url || settings?.socialFacebook || 'https://facebook.com/sathuragiridecoration'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#2E2A27] flex items-center justify-center text-[#B8955A] hover:bg-[#B8955A] hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={settings?.youtube_url || settings?.socialYoutube || 'https://youtube.com/@sathuragiridecoration'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#2E2A27] flex items-center justify-center text-[#B8955A] hover:bg-[#B8955A] hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Event Categories */}
          <div>
            <h4 className="font-serif text-white text-base font-bold tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B8955A]" />
              Event Services
            </h4>
            <ul className="space-y-2 text-sm text-[#AFAEA9]">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to={`/portfolio?category=${cat.slug}`}
                    className="hover:text-[#B8955A] transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-serif text-white text-base font-bold tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B8955A]" />
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-[#AFAEA9]">
              <li>
                <Link to="/" className="hover:text-[#B8955A] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#B8955A] transition-colors">
                  All Services & Categories
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="hover:text-[#B8955A] transition-colors">
                  Decoration Portfolio & Gallery
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#B8955A] transition-colors">
                  About Sathuragiri Decoration
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#B8955A] transition-colors">
                  Contact & Venue Enquiries
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-[#B8955A] transition-colors text-xs text-gray-500">
                  Staff / Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-serif text-white text-base font-bold tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B8955A]" />
              Contact Information
            </h4>
            <div className="space-y-3.5 text-sm text-[#AFAEA9]">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#B8955A] shrink-0 mt-1" />
                <span className="leading-relaxed">
                  {settings?.address || '124, Temple View Road, Near Sathuragiri Hills, Madurai & Rajapalayam, Tamil Nadu, India'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#B8955A] shrink-0" />
                <a href={`tel:${settings?.phone || '+919842187654'}`} className="hover:text-white transition-colors">
                  {settings?.phone || '+91 98421 87654'}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#B8955A] shrink-0" />
                <a href={`mailto:${settings?.email || 'contact@sathuragiridecoration.com'}`} className="hover:text-white transition-colors">
                  {settings?.email || 'contact@sathuragiridecoration.com'}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#77716B]">
          <p>{settings?.footer_text || `© ${currentYear} Sathuragiri Decoration. Every Celebration, Beautifully Crafted. All rights reserved.`}</p>
          <p className="flex items-center gap-1">
            Crafted for Memorable Celebrations <Heart className="w-3.5 h-3.5 text-[#B8955A] inline" />
          </p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-[#B8955A]">About Us</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-[#B8955A]">Contact</Link>
            <span>•</span>
            <Link to="/admin/login" className="text-[#B8955A] hover:underline">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
