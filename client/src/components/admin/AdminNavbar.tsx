import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Plus,
  LogOut,
  User as UserIcon,
  MessageSquare,
  CalendarCheck,
  FileText,
  CreditCard,
  TrendingDown,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { NotificationItem } from '../../types';

interface AdminNavbarProps {
  onToggleSidebar: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await api.get<{ unreadCount: number; notifications: NotificationItem[] }>(
          '/notifications'
        );
        if (data) {
          setUnreadCount(data.unreadCount || 0);
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        // Silent fail for polling
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <header className="h-16 bg-white border-b border-[#E8E0D6] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Page context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-gray-500 hover:bg-[#FAF7F2] lg:hidden focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#B8955A]">
            Sathuragiri Management System
          </span>
        </div>
      </div>

      {/* Right: Actions, Notifications, User Menu */}
      <div className="flex items-center gap-3">
        {/* Quick Action Button */}
        <div className="relative">
          <button
            onClick={() => {
              setQuickMenuOpen(!quickMenuOpen);
              setUserMenuOpen(false);
              setNotifMenuOpen(false);
            }}
            className="flex items-center gap-1.5 bg-[#FAF7F2] hover:bg-[#F3ECE2] text-[#24211F] text-xs font-semibold px-3 py-2 rounded-xl border border-[#E8E0D6] transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#B8955A]" />
            <span className="hidden sm:inline">Quick Action</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {quickMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E8E0D6] py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              onClick={() => setQuickMenuOpen(false)}
            >
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#AFAEA9]">
                Create Record
              </div>
              <Link
                to="/book-event"
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#24211F] hover:bg-[#FAF7F2] hover:text-[#B8955A] font-medium"
              >
                <MessageSquare className="w-4 h-4 text-[#B8955A]" />
                New Enquiry
              </Link>
              <Link
                to="/admin/bookings?create=true"
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#24211F] hover:bg-[#FAF7F2] hover:text-[#B8955A] font-medium"
              >
                <CalendarCheck className="w-4 h-4 text-[#B8955A]" />
                New Booking
              </Link>
              <Link
                to="/admin/quotations?create=true"
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#24211F] hover:bg-[#FAF7F2] hover:text-[#B8955A] font-medium"
              >
                <FileText className="w-4 h-4 text-[#B8955A]" />
                New Quotation
              </Link>
              <Link
                to="/admin/payments?create=true"
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#24211F] hover:bg-[#FAF7F2] hover:text-[#B8955A] font-medium"
              >
                <CreditCard className="w-4 h-4 text-[#B8955A]" />
                Record Payment
              </Link>
              <Link
                to="/admin/expenses?create=true"
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#24211F] hover:bg-[#FAF7F2] hover:text-[#B8955A] font-medium"
              >
                <TrendingDown className="w-4 h-4 text-[#B8955A]" />
                Record Expense
              </Link>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifMenuOpen(!notifMenuOpen);
              setQuickMenuOpen(false);
              setUserMenuOpen(false);
            }}
            className="p-2 rounded-xl text-gray-600 hover:bg-[#FAF7F2] hover:text-[#B8955A] relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C74646] text-[10px] font-bold text-white shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E8E0D6] py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 pb-2 border-b border-[#E8E0D6] flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#24211F]">
                  Notifications ({unreadCount} unread)
                </span>
                <Link
                  to="/admin/notifications"
                  onClick={() => setNotifMenuOpen(false)}
                  className="text-xs text-[#B8955A] font-semibold hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-6">No notifications found.</p>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <Link
                      key={n.id}
                      to={n.link || '/admin/notifications'}
                      onClick={() => setNotifMenuOpen(false)}
                      className={`block px-4 py-3 text-xs transition-colors hover:bg-[#FAF7F2] ${
                        !n.isRead ? 'bg-[#FAF7F2]/50 font-semibold' : 'text-[#77716B]'
                      }`}
                    >
                      <p className="text-[#24211F]">{n.title}</p>
                      <p className="text-[11px] text-[#77716B] mt-0.5">{n.message}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setQuickMenuOpen(false);
              setNotifMenuOpen(false);
            }}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#FAF7F2] transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#B8955A] to-[#D4B77D] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-[#24211F] leading-tight">{user?.name || 'Admin'}</span>
              <span className="text-[10px] font-semibold text-[#B8955A] tracking-wider uppercase">
                {user?.role || 'STAFF'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden md:block" />
          </button>

          {userMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#E8E0D6] py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              onClick={() => setUserMenuOpen(false)}
            >
              <div className="px-4 py-2 border-b border-[#E8E0D6]">
                <p className="text-xs font-bold text-[#24211F]">{user?.name}</p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded bg-[#FAF7F2] text-[#B8955A] border border-[#EBDDBF]">
                  {user?.role}
                </span>
              </div>
              <Link
                to="/admin/settings"
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#24211F] hover:bg-[#FAF7F2] font-medium"
              >
                <UserIcon className="w-4 h-4 text-gray-400" />
                Settings & Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#C74646] hover:bg-[#FDF2F2] font-semibold text-left transition-colors border-t border-gray-100 mt-1"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
