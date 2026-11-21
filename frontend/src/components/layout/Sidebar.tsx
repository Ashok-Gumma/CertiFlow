import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Layers,
  Users,
  CheckSquare,
  Award,
  Send,
  Activity,
  LogOut,
  X,
  ShieldCheck,
  Building,
  FileCheck,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getWorkspaceTitle = () => {
    switch (user?.role) {
      case 'TRAINING_CENTRE':
        return 'TRAINING CENTRE DESK';
      case 'DISTRICT_OFFICER':
        return 'DISTRICT GOVERNANCE DESK';
      case 'QUALITY_TEAM':
        return 'QUALITY AUDIT DESK';
      case 'STATE_OFFICE':
        return 'STATE DIRECTORATE DESK';
      default:
        return 'ADMIN WORKSPACE';
    }
  };

  const getNavItems = () => {
    switch (user?.role) {
      case 'TRAINING_CENTRE':
        return [
          { label: 'Centre Overview', to: '/dashboard', icon: LayoutGrid },
          { label: 'My Training Batches', to: '/batches', icon: Layers },
          { label: 'Enrolled Candidates', to: '/candidates', icon: Users },
          { label: 'Submission Tracker', to: '/approvals', icon: FileCheck },
          { label: 'Issued Certificates', to: '/certificates', icon: Award },
          { label: 'WhatsApp Dispatches', to: '/deliveries', icon: Send },
        ];
      case 'DISTRICT_OFFICER':
        return [
          { label: 'District Overview', to: '/dashboard', icon: LayoutGrid },
          { label: 'District Review Desk', to: '/approvals', icon: CheckSquare },
          { label: 'District Batches', to: '/batches', icon: Layers },
          { label: 'District Candidates', to: '/candidates', icon: Users },
          { label: 'District Certificates', to: '/certificates', icon: Award },
        ];
      case 'QUALITY_TEAM':
        return [
          { label: 'Quality Overview', to: '/dashboard', icon: LayoutGrid },
          { label: 'Quality Audit Desk', to: '/approvals', icon: CheckSquare },
          { label: 'Scrutiny Batches (≥50)', to: '/batches', icon: Layers },
          { label: 'Audit Trail Logs', to: '/audit-logs', icon: Activity },
        ];
      case 'STATE_OFFICE':
      default:
        return [
          { label: 'Executive Overview', to: '/dashboard', icon: LayoutGrid },
          { label: 'State Authorization Desk', to: '/approvals', icon: CheckSquare },
          { label: 'Statewide Batches', to: '/batches', icon: Layers },
          { label: 'Candidate Registry', to: '/candidates', icon: Users },
          { label: 'Certificate Registry', to: '/certificates', icon: Award },
          { label: 'WhatsApp Gateway', to: '/deliveries', icon: Send },
          { label: 'System Audit Logs', to: '/audit-logs', icon: Activity },
        ];
    }
  };

  const navItems = getNavItems();

  const getInitials = (name?: string) => {
    if (!name) return 'SA';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header (Links to default /dashboard for authenticated officers) */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <Link
            to="/dashboard"
            onClick={onClose}
            className="flex items-center gap-2.5 group hover:opacity-90 transition-opacity"
            title="Go to Default Workspace Dashboard"
          >
            <div className="w-9 h-9 rounded-2xl bg-[#0F172A] flex items-center justify-center text-amber-400 shadow-sm group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-slate-900 tracking-tight block">CertiFlow</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {getWorkspaceTitle()}
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#0F172A] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* User Info / Sign Out in SolarGrid style */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          {/* Public Homepage link */}
          <Link
            to="/"
            onClick={onClose}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Public Website Homepage</span>
          </Link>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-full bg-[#0F172A] text-white font-bold text-xs flex items-center justify-center shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-slate-900 block truncate">{user?.name}</span>
              <span className="text-[10px] text-slate-400 block truncate font-mono">{user?.email}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50/70 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
