import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Layers, ChevronRight, RefreshCw, Box } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Batch, BatchStatus } from '../types';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { NotionEmptyState } from '../components/illustrations/NotionIllustrations';

export const BatchesPage: React.FC = () => {
  const { user } = useAuth();
  const { eventSignal } = useNotifications();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/batches', { params });
      if (res.data.success) {
        setBatches(res.data.data);
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
    fetchBatches();
  }, [statusFilter, page, eventSignal]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBatches();
  };

  const statusTabs = [
    { label: 'All', value: 'ALL' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Submitted', value: 'SUBMITTED' },
    { label: 'District Review', value: 'DISTRICT_REVIEW' },
    { label: 'Quality Review', value: 'QUALITY_REVIEW' },
    { label: 'State Review', value: 'STATE_REVIEW' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Returned', value: 'RETURNED' },
    { label: 'Rejected', value: 'REJECTED' },
  ];

  return (
    <div className="space-y-6">
      {/* Header matching SolarGrid */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Batches Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage training batches, candidate CSV intakes, and track governance approvals across tiers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchBatches}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-slate-900' : ''}`} />
            <span>Refresh</span>
          </button>

          {user?.role === 'TRAINING_CENTRE' && (
            <Link
              to="/batches/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-900 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Batch</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-[24px] border border-slate-200/80 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
        {/* Horizontal Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.value
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by batch code (CF/2026/...), batch name, or course qualification..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F172A] transition-all"
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

      {/* Batches Table Card */}
      <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6 font-semibold">BATCH ID</th>
                <th className="py-4 px-6 font-semibold">COURSE QUALIFICATION</th>
                <th className="py-4 px-6 font-semibold">TRAINING CENTRE</th>
                <th className="py-4 px-6 text-center font-semibold">CANDIDATES</th>
                <th className="py-4 px-6 font-semibold">STAGE / STATUS</th>
                <th className="py-4 px-6 font-semibold">CYCLE</th>
                <th className="py-4 px-6 text-right font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0F172A]" />
                    <span>Loading batches...</span>
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex justify-center mb-3">
                      <NotionEmptyState className="w-36 h-36 drop-shadow-xs" />
                    </div>
                    <p className="font-bold text-slate-900 text-sm">No batches found</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                      {user?.role === 'TRAINING_CENTRE'
                        ? 'No batches found in your centre. Upload candidate rosters to create your first batch.'
                        : 'No batches match your active search or jurisdiction filters.'}
                    </p>
                    {user?.role === 'TRAINING_CENTRE' && (
                      <Link
                        to="/batches/create"
                        className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-900 text-white font-semibold text-xs shadow-xs transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create First Batch</span>
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      <Link to={`/batches/${batch.id}`} className="hover:underline flex items-center gap-1 group">
                        <span>{batch.batchNumber}</span>
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900 max-w-[200px] truncate">
                      {batch.courseName}
                    </td>
                    <td className="py-4 px-6 text-slate-600 max-w-[160px] truncate">
                      {batch.trainingCentre?.name || '—'}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-slate-900">
                      {batch.candidateCount}
                    </td>
                    <td className="py-4 px-6">
                      <Badge status={batch.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-500">
                      Cycle {batch.approvalCycle}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/batches/${batch.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </Link>
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
    </div>
  );
};
