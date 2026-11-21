import React, { useState } from 'react';
import { Menu, Bell, CheckCheck, Search, Plus, Award, ShieldCheck, CheckSquare } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { DemoSwitcher } from '../common/DemoSwitcher';

interface HeaderProps {
  onToggleSidebar: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/batches?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'SA';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile trigger & Breadcrumb Badge matching SolarGrid */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* SolarGrid-style Breadcrumb Pill */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 font-bold text-slate-800 hover:text-slate-950 transition-colors"
            title="Go to Default Workspace Dashboard"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>National Skills Authority</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            OFFICIAL PORTAL
          </span>
        </div>
      </div>

      {/* Middle: SolarGrid-style Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search batches, certificates, candidates..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-slate-200 bg-[#F8FAFC] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F172A] transition-all"
          />
        </div>
      </form>

      {/* Right: Actions matching SolarGrid */}
      <div className="flex items-center gap-3">
        {/* Demo Switcher */}
        <DemoSwitcher />

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200/80"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-40 overflow-hidden">
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-full">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No notifications right now
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`p-3 hover:bg-slate-50 transition-colors cursor-pointer text-xs ${
                          !n.isRead ? 'bg-indigo-50/40' : ''
                        }`}
                      >
                        <div className="font-semibold text-slate-900 mb-0.5">{n.title}</div>
                        <div className="text-slate-600 text-[11px] leading-relaxed">{n.message}</div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Action Button tailored by officer duty */}
        {user?.role === 'TRAINING_CENTRE' ? (
          <button
            onClick={() => navigate('/batches/create')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-900 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Batch</span>
          </button>
        ) : (
          <button
            onClick={() => navigate('/approvals')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-900 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Review Queue</span>
          </button>
        )}

        {/* User initials badge matching SolarGrid */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {getInitials(user?.name)}
          </div>
          <span className="hidden xl:inline-block text-xs font-bold text-slate-800 truncate max-w-[120px]">
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
};
