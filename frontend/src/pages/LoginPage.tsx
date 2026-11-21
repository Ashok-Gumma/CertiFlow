import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Award,
  ShieldCheck,
  Lock,
  Mail,
  RefreshCw,
  Building,
  UserCheck,
  FileCheck,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DemoUser } from '../types';
import { NotionWelcomeOfficer } from '../components/illustrations/NotionIllustrations';

export const LoginPage: React.FC = () => {
  const { login, switchDemoUser, demoUsers, isLoading } = useAuth();
  const [email, setEmail] = useState('dev@certiflow.gov.in');
  const [password, setPassword] = useState('CertiFlow@2026');
  const [error, setError] = useState<string | null>(null);
  const [selectedDemo, setSelectedDemo] = useState<string>('dev@certiflow.gov.in');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to authenticate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectQuickLogin = async (account: DemoUser) => {
    setSelectedDemo(account.email);
    setEmail(account.email);
    setPassword('CertiFlow@2026');
    setError(null);
    setIsSubmitting(true);
    try {
      await switchDemoUser(account.email);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to switch account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOfficerLevelName = (role: string, name: string) => {
    switch (role) {
      case 'TRAINING_CENTRE':
        return 'Centre Desk';
      case 'DISTRICT_OFFICER':
        return 'District Off.';
      case 'QUALITY_TEAM':
        return 'Quality Team';
      case 'STATE_OFFICE':
        return 'State Office';
      default:
        return 'Official';
    }
  };

  const getOfficerLevelFull = (role: string) => {
    switch (role) {
      case 'TRAINING_CENTRE':
        return 'Training Centre Head';
      case 'DISTRICT_OFFICER':
        return 'District Skill Officer (DSDO)';
      case 'QUALITY_TEAM':
        return 'Quality Assurance Auditor';
      case 'STATE_OFFICE':
        return 'State Mission Director';
      default:
        return 'Government Official';
    }
  };

  const getPersonaIcon = (role: string) => {
    if (role === 'TRAINING_CENTRE') return Building;
    if (role === 'DISTRICT_OFFICER') return ShieldCheck;
    if (role === 'QUALITY_TEAM') return FileCheck;
    return Award;
  };

  const currentAccount = demoUsers.find((u) => u.email === selectedDemo) || demoUsers[0];

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col justify-center items-center py-12 px-4 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Brand Header Badge at Top (links to home page) */}
      <Link
        to="/"
        className="flex items-center gap-2.5 mb-5 group hover:opacity-90 transition-opacity"
        title="Return to CertiFlow Homepage"
      >
        <div className="w-10 h-10 rounded-2xl bg-[#0F172A] flex items-center justify-center text-amber-400 shadow-md group-hover:scale-105 transition-transform">
          <Award className="w-5 h-5" />
        </div>
        <span className="text-xl font-bold text-slate-900 tracking-tight">CertiFlow</span>
      </Link>

      {/* Return to Homepage Top Bar */}
      <div className="w-full max-w-[460px] mb-3 flex items-center justify-between px-2 text-xs">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Homepage</span>
        </Link>
        <Link
          to="/verify"
          className="text-slate-400 hover:text-slate-700 font-medium"
        >
          Verify Certificate →
        </Link>
      </div>

      {/* Main Sign In Card */}
      <div className="w-full max-w-[460px] bg-white rounded-[32px] p-8 sm:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.04)] border border-slate-200/80">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sign in</h1>
            <p className="text-xs text-slate-500 mt-1 font-normal">Access your official workspace below.</p>
          </div>
          <div className="shrink-0 p-1">
            <NotionWelcomeOfficer className="w-14 h-14" />
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* QUICK LOGIN Section showing Officer Level Names */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              QUICK LOGIN (OFFICER LEVEL)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">1-Click Auth</span>
          </div>

          {/* Row 1: 4 Officers */}
          <div className="grid grid-cols-4 gap-2 mb-2">
            {demoUsers.slice(0, 4).map((account) => {
              const Icon = getPersonaIcon(account.role);
              const isActive = selectedDemo === account.email;
              const levelName = getOfficerLevelName(account.role, account.name);
              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => handleSelectQuickLogin(account)}
                  disabled={isSubmitting || isLoading}
                  className={`flex flex-col items-center justify-center py-2.5 px-1.5 rounded-2xl border transition-all text-xs font-semibold ${
                    isActive
                      ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  title={`${account.name} - ${account.role}`}
                >
                  <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate max-w-[70px] font-bold text-[11px]">{levelName}</span>
                  <span className={`text-[9.5px] truncate max-w-[70px] ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                    ({account.name.split(' ')[0]})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Row 2: Quality & State Directorate */}
          <div className="grid grid-cols-2 gap-2">
            {demoUsers.slice(4, 6).map((account) => {
              const Icon = getPersonaIcon(account.role);
              const isActive = selectedDemo === account.email;
              const levelName = getOfficerLevelName(account.role, account.name);
              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => handleSelectQuickLogin(account)}
                  disabled={isSubmitting || isLoading}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border transition-all text-xs font-semibold ${
                    isActive
                      ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  title={`${account.name} - ${account.role}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <div className="text-left">
                    <span className="font-bold text-[11px] block">{levelName}</span>
                    <span className={`text-[9.5px] block ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                      ({account.name.split(' ')[0]})
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Officer & Default Credentials Box */}
        <div className="mb-5 p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>{getOfficerLevelFull(currentAccount?.role || 'DISTRICT_OFFICER')}</span>
            </span>
            <span className="text-[9.5px] font-mono text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md font-semibold">
              Default Credentials
            </span>
          </div>
          <div className="space-y-0.5 font-mono text-[11px] text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">Officer Persona:</span>
              <span className="font-bold text-slate-800">{currentAccount?.name || 'Dev'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Login Email:</span>
              <span className="font-bold text-slate-800">{email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Password:</span>
              <span className="font-bold text-slate-800">CertiFlow@2026</span>
            </div>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleManualLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl border border-slate-200 bg-[#F8FAFC] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F172A] transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl border border-slate-200 bg-[#F8FAFC] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F172A] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full mt-3 py-3.5 rounded-2xl bg-[#0F172A] hover:bg-slate-900 text-white font-bold text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting || isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in</span>
            )}
          </button>
        </form>

        {/* Public Verification & Return Home Links */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-500">
            Student or employer with a certificate?{' '}
            <Link to="/verify/CF%2F2026%2FCLOUD%2F11%2F0001406" className="text-slate-900 font-bold hover:underline">
              Verify without login →
            </Link>
          </p>
          <div className="pt-1">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Return to CertiFlow Homepage</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Sovereign Program Footer */}
      <div className="mt-8 text-center text-xs text-slate-400 font-medium">
        CertiFlow Enterprise • National Skills Authority • Secure Workspace
      </div>
    </div>
  );
};
