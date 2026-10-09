import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Calendar, Menu, X, Sparkles, User, LayoutDashboard } from 'lucide-react';
import { Logo } from './Logo';
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'Packages', path: '/packages' },
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
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E8E0D6] py-3.5'
          : 'bg-[#FAF7F2]/90 backdrop-blur-sm py-4 md:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors relative py-1 ${
                  isActive(link.path)
                    ? 'text-[#B8955A] font-semibold'
                    : 'text-[#24211F] hover:text-[#B8955A]'
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#B8955A] rounded-full animate-in fade-in duration-300" />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Phone contact */}
            <a
              href={`tel:${settings?.phone || '+919842187654'}`}
              className="flex items-center gap-2 text-xs font-semibold text-[#24211F] hover:text-[#B8955A] bg-[#F3ECE2] px-3.5 py-2 rounded-xl border border-[#E8E0D6] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#B8955A]" />
              <span>{settings?.phone || '+91 98421 87654'}</span>
            </a>

            {/* Admin or Login Link */}
            {isAuthenticated ? (
              <Link to="/admin/dashboard">
                <Button variant="secondary" size="sm" leftIcon={<LayoutDashboard className="w-3.5 h-3.5 text-[#B8955A]" />}>
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/admin/login" title="Staff & Admin Portal">
                <button className="text-gray-500 hover:text-[#B8955A] p-2 rounded-lg transition-colors">
                  <User className="w-4 h-4" />
                </button>
              </Link>
            )}

            {/* Book Event CTA */}
            <Link to="/book-event">
              <Button
                variant="gold"
                size="sm"
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Book Your Event
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link to="/book-event" className="sm:hidden">
              <Button variant="gold" size="sm">
                Book
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#24211F] hover:bg-[#F3ECE2] focus:outline-none transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-[#E8E0D6] px-4 pt-3 pb-6 animate-in slide-in-from-top-4 duration-300 shadow-xl">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-[#FAF7F2] text-[#B8955A] font-semibold border-l-4 border-[#B8955A]'
                    : 'text-[#24211F] hover:bg-[#FAF7F2]'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 border-t border-[#E8E0D6] flex flex-col gap-3">
              <a
                href={`tel:${settings?.phone || '+919842187654'}`}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FAF7F2] text-sm font-semibold text-[#24211F] border border-[#E8E0D6]"
              >
                <Phone className="w-4 h-4 text-[#B8955A]" />
                <span>Call Us: {settings?.phone || '+91 98421 87654'}</span>
              </a>

              <Link to="/book-event" className="w-full">
                <Button variant="gold" size="md" className="w-full" leftIcon={<Sparkles className="w-4 h-4" />}>
                  Book Your Event Now
                </Button>
              </Link>

              {isAuthenticated ? (
                <Link to="/admin/dashboard" className="w-full">
                  <Button variant="secondary" size="md" className="w-full" leftIcon={<LayoutDashboard className="w-4 h-4 text-[#B8955A]" />}>
                    Open Admin Dashboard ({user?.name})
                  </Button>
                </Link>
              ) : (
                <Link to="/admin/login" className="text-center text-xs text-[#77716B] hover:text-[#B8955A] py-1">
                  Admin & Staff Portal Login →
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
