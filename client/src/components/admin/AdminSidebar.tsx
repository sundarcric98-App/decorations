import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Image,
  Settings,
  ExternalLink,
  LogOut,
  X,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const navLinks = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: 'Event Categories',
      path: '/admin/categories',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      label: 'Portfolio Projects',
      path: '/admin/portfolio',
      icon: <Image className="w-4 h-4" />,
    },
    {
      label: 'Business Settings',
      path: '/admin/settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
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

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-6 space-y-1.5">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#77716B]">
            Portfolio Management
          </p>
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#B8955A]/10 text-[#B8955A] font-semibold border-r-4 border-[#B8955A]'
                    : 'text-[#28231F] hover:bg-[#FAF7F2] hover:text-[#B8955A]'
                }`
              }
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}

          <div className="pt-6 mt-6 border-t border-[#E8E0D6] space-y-1.5">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#77716B]">
              Public Website
            </p>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-[#28231F] hover:bg-[#FAF7F2] hover:text-[#B8955A] transition-colors"
            >
              <span className="flex items-center gap-3">
                <ExternalLink className="w-4 h-4 text-[#B8955A]" />
                <span>View Live Website</span>
              </span>
            </a>
          </div>
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-[#E8E0D6] bg-[#FAF7F2]/60 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-bold text-[#28231F] truncate">
              {user?.display_name || user?.name || 'Administrator'}
            </p>
            <p className="text-[10px] text-[#77716B] uppercase font-semibold">
              {user?.role || 'ADMIN'}
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
