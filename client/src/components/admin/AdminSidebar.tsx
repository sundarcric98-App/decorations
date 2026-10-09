import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  CalendarCheck,
  FileText,
  CreditCard,
  Calendar as CalendarIcon,
  Sparkles,
  Package,
  Image,
  Users,
  UserCheck,
  Building2,
  TrendingDown,
  BarChart3,
  Settings,
  Bell,
  ExternalLink,
  X,
} from 'lucide-react';
import { Logo } from '../common/Logo';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const navSections = [
    {
      title: 'CORE MANAGEMENT',
      links: [
        { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Enquiries', path: '/admin/enquiries', icon: <MessageSquare className="w-4 h-4" /> },
        { label: 'Bookings', path: '/admin/bookings', icon: <CalendarCheck className="w-4 h-4" /> },
        { label: 'Quotations', path: '/admin/quotations', icon: <FileText className="w-4 h-4" /> },
        { label: 'Payments & Receipts', path: '/admin/payments', icon: <CreditCard className="w-4 h-4" /> },
        { label: 'Event Calendar', path: '/admin/calendar', icon: <CalendarIcon className="w-4 h-4" /> },
      ],
    },
    {
      title: 'CATALOGUE & MEDIA',
      links: [
        { label: 'Services Catalogue', path: '/admin/services', icon: <Sparkles className="w-4 h-4" /> },
        { label: 'Event Packages', path: '/admin/packages', icon: <Package className="w-4 h-4" /> },
        { label: 'Portfolio Gallery', path: '/admin/portfolio', icon: <Image className="w-4 h-4" /> },
      ],
    },
    {
      title: 'OPERATIONS & CRM',
      links: [
        { label: 'Customer Profiles', path: '/admin/customers', icon: <Users className="w-4 h-4" /> },
        { label: 'Staff & Team', path: '/admin/staff', icon: <UserCheck className="w-4 h-4" /> },
        { label: 'Vendors & Suppliers', path: '/admin/vendors', icon: <Building2 className="w-4 h-4" /> },
      ],
    },
    {
      title: 'FINANCE & REPORTS',
      links: [
        { label: 'Expenses Tracking', path: '/admin/expenses', icon: <TrendingDown className="w-4 h-4" /> },
        { label: 'Business Reports', path: '/admin/reports', icon: <BarChart3 className="w-4 h-4" /> },
      ],
    },
    {
      title: 'SETTINGS',
      links: [
        { label: 'Notifications', path: '/admin/notifications', icon: <Bell className="w-4 h-4" /> },
        { label: 'Business Settings', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-[#E8E0D6] flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Header with Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#E8E0D6] bg-[#FAF7F2]">
          <Logo size="sm" showTagline={false} />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <h4 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-[#AFAEA9] mb-1.5">
                {section.title}
              </h4>
              <div className="space-y-0.5">
                {section.links.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-[#FAF7F2] text-[#B8955A] shadow-xs border border-[#EBDDBF]'
                          : 'text-[#56504A] hover:bg-[#FAF7F2] hover:text-[#24211F]'
                      }`
                    }
                  >
                    <span className="shrink-0">{link.icon}</span>
                    <span className="truncate">{link.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Link to Public Website */}
        <div className="p-3 border-t border-[#E8E0D6] bg-[#FAF7F2]">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-[#77716B] hover:text-[#B8955A] hover:bg-white rounded-xl transition-colors border border-transparent hover:border-[#E8E0D6]"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#B8955A]" />
              Visit Public Website
            </span>
            <span className="text-[10px] bg-[#E8E0D6] text-[#56504A] px-1.5 py-0.5 rounded">Live</span>
          </a>
        </div>
      </aside>
    </>
  );
};
