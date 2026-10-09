import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube, Sparkles, Heart } from 'lucide-react';
import { Logo } from './Logo';
import { useSettings } from '../../context/SettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1A1816] text-[#CECDCC] pt-16 pb-8 border-t border-[#3D3835]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#3D3835]">
          {/* Brand Info */}
          <div className="space-y-4">
            <Logo variant="light" size="lg" />
            <p className="text-sm leading-relaxed text-[#AFAEA9] mt-3">
              South India’s premier luxury wedding planners and event decorators. We transform your most auspicious occasions into breathtaking visual masterpieces with royal mandapams, exotic florals, and impeccable hospitality.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={settings?.socialInstagram || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#2E2A27] flex items-center justify-center text-[#B8955A] hover:bg-[#B8955A] hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={settings?.socialFacebook || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#2E2A27] flex items-center justify-center text-[#B8955A] hover:bg-[#B8955A] hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={settings?.socialYoutube || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#2E2A27] flex items-center justify-center text-[#B8955A] hover:bg-[#B8955A] hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Core Services */}
          <div>
            <h4 className="font-serif text-white text-base font-bold tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B8955A]" />
              Our Specializations
            </h4>
            <ul className="space-y-2.5 text-sm text-[#AFAEA9]">
              <li>
                <Link to="/services/royal-muhurtham-mandapam" className="hover:text-[#B8955A] transition-colors">
                  Traditional Muhurtham Mandapams
                </Link>
              </li>
              <li>
                <Link to="/services/grand-floral-reception-stage" className="hover:text-[#B8955A] transition-colors">
                  Grand Reception Stages
                </Link>
              </li>
              <li>
                <Link to="/services/haldi-mehndi-festive-setup" className="hover:text-[#B8955A] transition-colors">
                  Haldi, Mehndi & Sangeet Sets
                </Link>
              </li>
              <li>
                <Link to="/services/cinematic-wedding-film-photography" className="hover:text-[#B8955A] transition-colors">
                  Candid Photography & 4K Drone
                </Link>
              </li>
              <li>
                <Link to="/services/grand-south-indian-leaf-feast" className="hover:text-[#B8955A] transition-colors">
                  Royal Leaf Feast & Catering
                </Link>
              </li>
              <li>
                <Link to="/services/imperial-floral-tunnel-entrance" className="hover:text-[#B8955A] transition-colors">
                  Entrance Archways & Floral Tunnels
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-white text-base font-bold tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B8955A]" />
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-[#AFAEA9]">
              <li>
                <Link to="/packages" className="hover:text-[#B8955A] transition-colors">
                  Wedding & Event Packages
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="hover:text-[#B8955A] transition-colors">
                  Real Weddings & Portfolio
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#B8955A] transition-colors">
                  About Sathuragiri Decoration
                </Link>
              </li>
              <li>
                <Link to="/book-event" className="hover:text-[#B8955A] transition-colors">
                  Get a Free Custom Quote
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#B8955A] transition-colors">
                  Contact & Venue Consultations
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-[#B8955A] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#B8955A] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-serif text-white text-base font-bold tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B8955A]" />
              Reach Us
            </h4>
            <div className="space-y-3.5 text-sm text-[#AFAEA9]">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#B8955A] shrink-0 mt-1" />
                <span>
                  {settings?.address || 'Plot No. 45, Temple View Avenue'},<br />
                  {settings?.city || 'Madurai'}, {settings?.state || 'Tamil Nadu'} - {settings?.pincode || '625009'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#B8955A] shrink-0" />
                <a href={`tel:${settings?.phone || '+919842187654'}`} className="hover:text-white transition-colors">
                  {settings?.phone || '+91 98421 87654'}
                </a>
              </div>
              {settings?.alternatePhone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#B8955A] shrink-0" />
                  <a href={`tel:${settings.alternatePhone}`} className="hover:text-white transition-colors">
                    {settings.alternatePhone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#B8955A] shrink-0" />
                <a href={`mailto:${settings?.email || 'contact@sathuragiridecoration.com'}`} className="hover:text-white transition-colors">
                  {settings?.email || 'contact@sathuragiridecoration.com'}
                </a>
              </div>
              {settings?.gstNumber && (
                <div className="pt-2 text-xs text-gray-500">
                  GSTIN: <span className="text-[#B8955A] font-mono">{settings.gstNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#77716B]">
          <p>© {currentYear} {settings?.businessName || 'Sathuragiri Decoration'}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with passion for memorable celebrations <Heart className="w-3.5 h-3.5 text-[#B8955A] inline" />
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-[#B8955A]">Privacy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-[#B8955A]">Terms</Link>
            <span>•</span>
            <Link to="/admin/login" className="text-[#B8955A] hover:underline">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
