import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  CheckSquare,
  Award,
  Send,
  ArrowRight,
  RefreshCw,
  Box,
  FileCheck,
  ShieldCheck,
  Activity,
  Plus,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { DashboardStats, Batch, AuditLog } from '../types';
import { NotionWelcomeOfficer } from '../components/illustrations/NotionIllustrations';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { eventSignal } = useNotifications();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBatches, setRecentBatches] = useState<Batch[]>([]);
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
  const [stuckBatches, setStuckBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, stuckRes] = await Promise.all([
        api.get('/dashboard/stats'),
        user?.role !== 'TRAINING_CENTRE'
          ? api.get('/dashboard/stuck-batches').catch(() => ({ data: { stuckBatches: [] } }))
          : Promise.resolve({ data: { stuckBatches: [] } }),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setRecentBatches(statsRes.data.recentBatches || []);
        setRecentActivity(statsRes.data.recentActivity || []);
      }

      if (stuckRes.data?.stuckBatches) {
        setStuckBatches(stuckRes.data.stuckBatches);
      }
    } catch (e) {
      console.error('Error fetching dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, eventSignal]);

  const getOfficerTitle = () => {
    switch (user?.role) {
      case 'TRAINING_CENTRE':
        return 'Centre Operations Desk';
      case 'DISTRICT_OFFICER':
        return 'District Skill Officer (DSDO)';
      case 'QUALITY_TEAM':
        return 'Quality Assurance Scrutiny Desk';
      case 'STATE_OFFICE':
        return 'State Mission Directorate';
      default:
        return 'Operations Desk';
    }
  };

  const getOfficerWelcomeSubtitle = () => {
    switch (user?.role) {
      case 'TRAINING_CENTRE':
        return 'Upload candidate rosters, review assessments, and submit batches for sequential district verification.';
      case 'DISTRICT_OFFICER':
        return 'Dual-officer consensus active: 2 distinct district officers must authorize candidate records before quality audit.';
      case 'QUALITY_TEAM':
        return 'Scrutinizing high-volume batches (≥50 candidates) for assessment integrity, syllabus compliance, and attendance norms.';
      case 'STATE_OFFICE':
        return 'Statewide credential authority: cryptographic signing, immutable public verification registry, and WhatsApp dispatch gateway.';
      default:
        return 'Manage qualification batches and credential governance.';
    }
  };

  return (
    <div className="space-y-6">
      {/* Officer Welcome Banner with Notion Illustration */}
      <div className="bg-white rounded-[28px] p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{getOfficerTitle()}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
            {getOfficerWelcomeSubtitle()}
          </p>
        </div>
        <div className="shrink-0 flex items-center justify-center p-1">
          <NotionWelcomeOfficer className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-xs" />
        </div>
      </div>

      {/* 4 Top KPI Metric Cards matching SolarGrid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              BATCHES INTAKE
            </span>
            <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Box className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              {stats?.totalBatches || 0} Batches
            </h3>
            <p className="text-xs font-semibold text-emerald-600 mt-1">Intake healthy</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              PENDING APPROVALS
            </span>
            <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              {stats?.pendingApprovals || 0} Batches
            </h3>
            <p className="text-xs font-semibold text-amber-600 mt-1">Awaiting officer sign-off</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              CREDENTIALS ISSUED
            </span>
            <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              {stats?.certificatesIssued || 0} Issued
            </h3>
            <p className="text-xs font-semibold text-emerald-600 mt-1">Sovereign registry verified</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              WHATSAPP DISPATCH
            </span>
            <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Send className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              {stats?.deliverySuccessRate || 100}%
            </h3>
            <p className="text-xs font-semibold text-indigo-600 mt-1">Simulated carrier active</p>
          </div>
        </div>
      </div>

      {/* 3 Action Desk Cards matching SolarGrid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Desk 1 */}
        <Link
          to="/batches"
          className="bg-white rounded-[24px] p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              {user?.role === 'TRAINING_CENTRE'
                ? 'Batch Intake Desk'
                : user?.role === 'DISTRICT_OFFICER'
                ? 'District Batches Desk'
                : user?.role === 'QUALITY_TEAM'
                ? 'Quality Scrutiny Desk'
                : 'Statewide Batches Registry'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {user?.role === 'TRAINING_CENTRE'
                ? 'Create training batches, upload candidate spreadsheets, and submit for district review.'
                : user?.role === 'DISTRICT_OFFICER'
                ? 'Inspect training batches and candidate rosters within your district jurisdiction.'
                : user?.role === 'QUALITY_TEAM'
                ? 'Audit candidate rosters and training compliance for high-volume batches (≥50).'
                : 'Comprehensive repository of candidate batches across all accredited institutes.'}
            </p>
          </div>
        </Link>

        {/* Desk 2 */}
        <Link
          to="/approvals"
          className="bg-white rounded-[24px] p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Approval Governance Desk</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Multi-tier district officer sign-offs (requires 2), quality audit scrutiny, and state sign-off.
            </p>
          </div>
        </Link>

        {/* Desk 3 */}
        <Link
          to="/deliveries"
          className="bg-white rounded-[24px] p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
              <Send className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">WhatsApp Dispatch Desk</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Automated simulated candidate dispatch, message tracking, and exponential retry monitor.
            </p>
          </div>
        </Link>
      </div>

      {/* Bottom Card: Recent System Audit Stream matching SolarGrid */}
      <div className="bg-white rounded-[24px] p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900">Recent System Audit Stream</h3>
          </div>
          <Link
            to="/audit-logs"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
          >
            <span>View full log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2">
          {recentActivity.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No recent audit events in stream.
            </div>
          ) : (
            recentActivity.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#F8FAFC] hover:bg-slate-100/80 transition-colors text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">{log.action}</span>
                  <span className="text-slate-400">by</span>
                  <span className="font-semibold text-slate-700">
                    {log.actor?.name || 'System Admin'}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-400">
                  {new Date(log.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
