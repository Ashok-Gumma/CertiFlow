import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
  Search,
  MessageSquare,
  Smartphone,
  ExternalLink,
  Download,
  ShieldCheck,
  CheckCheck,
  Eye,
} from 'lucide-react';
import api from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';
import { Delivery } from '../types';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';

export const DeliveriesPage: React.FC = () => {
  const { eventSignal } = useNotifications();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    delivered: number;
    pending: number;
    processing: number;
    failed: number;
    successRate: number;
  }>({
    total: 0,
    delivered: 0,
    pending: 0,
    processing: 0,
    failed: 0,
    successRate: 100,
  });

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);

  // WhatsApp Message Preview Modal
  const [previewDelivery, setPreviewDelivery] = useState<Delivery | null>(null);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/deliveries', { params });
      if (res.data.success) {
        setDeliveries(res.data.data);
        setStats(res.data.stats);
        setTotalItems(res.data.pagination.total);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [page, statusFilter, eventSignal]);

  const handleRetryFailed = async () => {
    setRetrying(true);
    setRetryMessage(null);
    try {
      const res = await api.post('/deliveries/retry-failed');
      if (res.data.success) {
        setRetryMessage(res.data.message);
        fetchDeliveries();
      }
    } catch (err: any) {
      setRetryMessage(err.response?.data?.error || 'Failed to retry deliveries');
    } finally {
      setRetrying(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDeliveries();
  };

  return (
    <div className="space-y-6">
      {/* Header matching SolarGrid */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            WhatsApp Delivery Dispatches
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Automated message dispatch simulation with retry backoff and public download link delivery.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchDeliveries}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-slate-900' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleRetryFailed}
            disabled={retrying || stats.failed === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-900 text-white font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors"
          >
            {retrying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Re-enqueuing...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Failed ({stats.failed})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {retryMessage && (
        <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 text-xs flex items-center justify-between shadow-xs">
          <span>ℹ️ {retryMessage}</span>
          <button onClick={() => setRetryMessage(null)} className="text-slate-600 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* 5 Delivery Metric Cards matching SolarGrid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-5 bg-white rounded-[24px] border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Dispatched</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Candidate links sent</span>
        </div>

        <div className="p-5 bg-white rounded-[24px] border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivered</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.delivered}</p>
          <span className="text-[10px] text-emerald-600 mt-0.5 block">Confirmed received</span>
        </div>

        <div className="p-5 bg-white rounded-[24px] border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">In Queue</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.pending + stats.processing}</p>
          <span className="text-[10px] text-amber-600 mt-0.5 block">Pending delivery</span>
        </div>

        <div className="p-5 bg-white rounded-[24px] border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Failed / Bounced</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{stats.failed}</p>
          <span className="text-[10px] text-rose-600 mt-0.5 block">Requires retry</span>
        </div>

        <div className="p-5 bg-white rounded-[24px] border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Success Rate</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.successRate}%</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Overall dispatch rate</span>
        </div>
      </div>

      {/* Search and Filters matching SolarGrid */}
      <div className="bg-white rounded-[24px] border border-slate-200/80 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'DELIVERED', 'FAILED', 'PENDING'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by phone (+91...), candidate name, or certificate ID..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F172A] transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#0F172A] hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Deliveries Table Card matching SolarGrid */}
      <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6 font-semibold">CERTIFICATE ID</th>
                <th className="py-4 px-6 font-semibold">CANDIDATE</th>
                <th className="py-4 px-6 font-semibold">PHONE NUMBER</th>
                <th className="py-4 px-6 font-semibold">STATUS</th>
                <th className="py-4 px-6 text-center font-semibold">ATTEMPTS</th>
                <th className="py-4 px-6 font-semibold">DETAILS</th>
                <th className="py-4 px-6 text-right font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0F172A]" />
                    <span>Loading dispatch logs...</span>
                  </td>
                </tr>
              ) : deliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No delivery records found matching your filters.
                  </td>
                </tr>
              ) : (
                deliveries.map((del) => (
                  <tr key={del.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      {del.certificate?.certificateNumber || '—'}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {del.certificate?.candidate?.name || '—'}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-600">
                      {del.phone}
                    </td>
                    <td className="py-4 px-6">
                      <Badge status={del.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-center font-mono font-bold text-slate-900">
                      {del.attempts}
                    </td>
                    <td className="py-4 px-6 text-slate-500 max-w-[200px] truncate">
                      {del.status === 'FAILED' ? (
                        <span className="text-rose-600 font-semibold">{del.lastError || 'Network failure'}</span>
                      ) : del.status === 'DELIVERED' ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Delivered to phone</span>
                        </span>
                      ) : (
                        <span>Queued for dispatch</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => setPreviewDelivery(del)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Chat</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={totalItems}
          itemsPerPage={10}
        />
      </div>

      {/* WhatsApp Chat Preview Modal */}
      <Modal
        isOpen={previewDelivery !== null}
        onClose={() => setPreviewDelivery(null)}
        title="Candidate WhatsApp Message"
        description="Simulated WhatsApp delivery notification received by candidate without requiring any login."
      >
        {previewDelivery && (
          <div className="max-w-md mx-auto space-y-4">
            {/* WhatsApp Phone Mockup Frame */}
            <div className="rounded-[24px] bg-[#EFEAE2] border border-slate-300 p-4 shadow-sm text-xs font-sans">
              {/* WhatsApp Chat Bubble */}
              <div className="bg-white rounded-2xl rounded-tl-xs p-3.5 shadow-xs border border-slate-200/80 space-y-2 text-slate-800">
                <div className="font-bold text-xs text-slate-900 border-b border-slate-100 pb-1.5">
                  National Skills Authority • Official Credential Delivery
                </div>
                <p className="leading-relaxed">
                  Dear <strong>{previewDelivery.certificate?.candidate?.name || 'Candidate'}</strong>,
                </p>
                <p className="leading-relaxed">
                  Congratulations! Your qualification certificate has been officially approved and issued by the Directorate General of Vocational Training.
                </p>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-[11px] space-y-0.5">
                  <div>Certificate ID: <strong className="text-slate-900">{previewDelivery.certificate?.certificateNumber}</strong></div>
                  <div>Status: <span className="text-emerald-600 font-bold">OFFICIALLY ISSUED</span></div>
                </div>
                <p className="leading-relaxed">
                  You can view your verified certificate or download the official PDF directly using the secure link below (no password or login required):
                </p>
                <div className="pt-1">
                  <a
                    href={`/verify/${encodeURIComponent(previewDelivery.certificate?.certificateNumber || '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-700 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>View & Verify Certificate</span>
                  </a>
                </div>
                <div className="text-right text-[10px] text-slate-400 flex items-center justify-end gap-1 pt-1">
                  <span>{new Date(previewDelivery.deliveredAt || previewDelivery.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewDelivery(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
