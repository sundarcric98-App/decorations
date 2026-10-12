import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Plus, LogOut, User as UserIcon, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

interface AdminNavbarProps {
  onToggleSidebar: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <header className="h-16 bg-white border-b border-[#E8E0D6] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-gray-600 hover:bg-[#FAF7F2] lg:hidden"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#B8955A] hidden sm:inline">
          Admin Control Center
        </span>
      </div>

      {/* Right: Quick Actions & Profile */}
      <div className="flex items-center gap-3">
        <Link to="/admin/portfolio">
          <Button
            size="sm"
            variant="gold"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="rounded-xl"
          >
            New Project
          </Button>
        </Link>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#B8955A] bg-[#FAF7F2] px-3 py-2 rounded-xl border border-[#E8E0D6] transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#B8955A]" />
          <span>Live Site</span>
        </a>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#FAF7F2] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#B8955A]/20 border border-[#B8955A]/40 flex items-center justify-center text-[#B8955A] text-xs font-bold">
              {user?.display_name ? user.display_name.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="text-xs font-semibold text-[#28231F] hidden sm:inline">
              {user?.display_name || user?.name || 'Admin'}
            </span>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#E8E0D6] py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-[#E8E0D6]">
                <p className="text-xs font-bold text-[#28231F] truncate">
                  {user?.display_name || user?.name}
                </p>
                <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
              </div>

              <Link
                to="/admin/settings"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs text-[#28231F] hover:bg-[#FAF7F2]"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#B8955A]" />
                <span>Business Settings</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
