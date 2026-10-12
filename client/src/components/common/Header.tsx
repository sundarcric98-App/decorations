import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Menu, X, User, LayoutDashboard } from 'lucide-react';
import { Logo } from './Logo';
import { WhatsAppButton } from './WhatsAppButton';
import { Button } from './Button';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { settings } = useSettings();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'Portfolio', path: '/portfolio' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E8E0D6] py-3'
          : 'bg-[#FAF7F2]/95 backdrop-blur-sm py-4 md:py-5 border-b border-[#E8E0D6]/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium tracking-wide transition-colors relative py-1 ${
                  isActive(link.path)
                    ? 'text-[#B8955A] font-semibold'
                    : 'text-[#28231F] hover:text-[#B8955A]'
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#B8955A] rounded-full animate-in fade-in duration-300" />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Phone contact */}
            <a
              href="tel:+918903575802"
              className="flex items-center gap-2 text-xs font-semibold text-[#28231F] hover:text-[#B8955A] bg-[#F3ECE2] px-3.5 py-2 rounded-xl border border-[#E8E0D6] transition-colors"
              title="Call Sathuragiri Decoration: +91 89035 75802 / +91 98423 22624"
            >
              <Phone className="w-3.5 h-3.5 text-[#B8955A]" />
              <span>+91 89035 75802</span>
            </a>

            {/* WhatsApp Primary Call to Action with choice dropdown */}
            <WhatsAppButton
              size="sm"
              label="WhatsApp Enquiry"
              className="rounded-xl px-4 py-2 font-medium"
              showChoice={true}
            />

            {/* Admin Portal Shortcut */}
            {isAuthenticated ? (
              <Link to="/admin/dashboard" title={`Dashboard (${user?.name})`}>
                <Button variant="secondary" size="sm" leftIcon={<LayoutDashboard className="w-3.5 h-3.5 text-[#B8955A]" />}>
                  Admin
                </Button>
              </Link>
            ) : (
              <Link to="/admin/login" title="Administrator Login">
                <button className="text-gray-400 hover:text-[#B8955A] p-2 rounded-lg transition-colors" aria-label="Admin Portal">
                  <User className="w-4 h-4" />
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Actions & Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <WhatsAppButton
              size="sm"
              label="Enquire"
              className="px-3 py-1.5 text-xs"
            />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#28231F] hover:bg-[#F3ECE2] focus:outline-none transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/98 backdrop-blur-xl border-b border-[#E8E0D6] px-5 pt-3 pb-6 animate-in slide-in-from-top-4 duration-300 shadow-xl">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2.5 rounded-xl text-base font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-[#FAF7F2] text-[#B8955A] font-semibold border-l-4 border-[#B8955A]'
                    : 'text-[#28231F] hover:bg-[#FAF7F2]'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 border-t border-[#E8E0D6] flex flex-col gap-2.5">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:+918903575802"
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#FAF7F2] text-xs font-semibold text-[#28231F] border border-[#E8E0D6]"
                  title="Call Line 1"
                >
                  <Phone className="w-3.5 h-3.5 text-[#B8955A]" />
                  <span>89035 75802</span>
                </a>
                <a
                  href="tel:+919842322624"
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#FAF7F2] text-xs font-semibold text-[#28231F] border border-[#E8E0D6]"
                  title="Call Line 2"
                >
                  <Phone className="w-3.5 h-3.5 text-[#B8955A]" />
                  <span>98423 22624</span>
                </a>
              </div>

              <WhatsAppButton
                size="md"
                label="WhatsApp 1: +91 89035 75802"
                preferLine={1}
                className="w-full justify-center text-xs"
              />

              <WhatsAppButton
                size="md"
                label="WhatsApp 2: +91 98423 22624"
                preferLine={2}
                className="w-full justify-center text-xs"
              />

              {isAuthenticated ? (
                <Link to="/admin/dashboard" className="w-full">
                  <Button variant="secondary" size="md" className="w-full" leftIcon={<LayoutDashboard className="w-4 h-4 text-[#B8955A]" />}>
                    Open Admin Dashboard ({user?.name})
                  </Button>
                </Link>
              ) : (
                <Link to="/admin/login" className="text-center text-xs text-[#77716B] hover:text-[#B8955A] py-1">
                  Admin Portal Login →
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
