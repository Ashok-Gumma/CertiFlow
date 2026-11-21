import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Award, ArrowRight, ShieldCheck, LogIn, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DemoSwitcher } from '../common/DemoSwitcher';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo: If logged in, routes to /dashboard; if guest, routes to / */}
        <Link
          to={isAuthenticated ? "/dashboard" : "/"}
          className="flex items-center gap-2.5 group"
          title={isAuthenticated ? "Go to your Operational Workspace" : "CertiFlow Homepage"}
        >
          <div className="w-9 h-9 rounded-2xl bg-[#0F172A] flex items-center justify-center text-amber-400 shadow-xs group-hover:scale-105 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900 tracking-tight">CertiFlow</span>
            <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              Gov Verified
            </span>
          </div>
        </Link>

        {/* Public Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <Link to="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <a href="/#how-it-works" className="hover:text-slate-900 transition-colors">
            Governance Pipeline
          </a>
          <a href="/#features" className="hover:text-slate-900 transition-colors">
            Security & Features
          </a>
          <Link to="/verify" className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verify Credential</span>
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 font-bold text-slate-900 hover:text-slate-950 transition-colors bg-slate-100 px-2.5 py-1 rounded-lg"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>My Workspace</span>
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <DemoSwitcher />

          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#0F172A] hover:bg-slate-900 text-white transition-colors shadow-xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Operational Desk</span>
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign in</span>
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#0F172A] hover:bg-slate-900 text-white transition-all shadow-xs"
              >
                <span>Access Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
