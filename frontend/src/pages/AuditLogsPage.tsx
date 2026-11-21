import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  AlertTriangle,
  Eye,
  Check,
  Copy,
} from 'lucide-react';
import api from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';
import { AuditLog } from '../types';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';

export const AuditLogsPage: React.FC = () => {
  const { eventSignal } = useNotifications();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Details Modal
  const [inspectLog, setInspectLog] = useState<AuditLog | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const params: any = { page, limit: 15 };
      if (search.trim()) params.search = search.trim();
      if (actionFilter !== 'ALL') params.action = actionFilter;
      if (entityFilter !== 'ALL') params.entityType = entityFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/audit-logs', { params });
      if (res.data.success) {
        setLogs(res.data.data);
        setTotalItems(res.data.pagination.total);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.response?.data?.error || 'Failed to query audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, entityFilter, startDate, endDate, eventSignal]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleExportCsv = async () => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (actionFilter !== 'ALL') params.append('action', actionFilter);
      if (entityFilter !== 'ALL') params.append('entityType', entityFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('format', 'csv');

      const token = localStorage.getItem('certiflow_token');
      const response = await fetch(`/api/audit-logs?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certiflow_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export CSV', err);
      alert('Could not export audit log CSV.');
    }
  };

  const copyMetadata = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header matching SolarGrid */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            System Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audited trace of logins, batch submissions, multi-tier approvals, certificate generation, and revocations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-slate-900' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-900 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar matching SolarGrid */}
      <div className="bg-white rounded-[24px] border border-slate-200/80 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by actor name, action, or target entity ID..."
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F172A] transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#0F172A] hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-slate-400 font-bold text-[10px] uppercase">
              <Filter className="w-3 h-3" />
              <span>Filters:</span>
            </div>

            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
            >
              <option value="ALL">All Actions</option>
              <option value="BATCH_CREATED">BATCH_CREATED</option>
              <option value="BATCH_SUBMITTED">BATCH_SUBMITTED</option>
              <option value="BATCH_APPROVED">BATCH_APPROVED</option>
              <option value="BATCH_RETURNED">BATCH_RETURNED</option>
              <option value="BATCH_REJECTED">BATCH_REJECTED</option>
              <option value="CERTIFICATES_GENERATED">CERTIFICATES_GENERATED</option>
              <option value="CERTIFICATE_REVOKED">CERTIFICATE_REVOKED</option>
              <option value="WHATSAPP_DISPATCHED">WHATSAPP_DISPATCHED</option>
              <option value="USER_LOGIN">USER_LOGIN</option>
            </select>

            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
            >
              <option value="ALL">All Entities</option>
              <option value="BATCH">BATCH</option>
              <option value="CANDIDATE">CANDIDATE</option>
              <option value="CERTIFICATE">CERTIFICATE</option>
              <option value="DELIVERY">DELIVERY</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-[11px] font-mono text-slate-700"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-[11px] font-mono text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Main Table Card matching SolarGrid */}
      <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6 font-semibold">TIMESTAMP</th>
                <th className="py-4 px-6 font-semibold">ACTION</th>
                <th className="py-4 px-6 font-semibold">TARGET ENTITY</th>
                <th className="py-4 px-6 font-semibold">USER</th>
                <th className="py-4 px-6 text-right font-semibold">DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0F172A]" />
                    <span>Loading audit records...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono text-slate-500 text-[11px]">
                      {new Date(log.createdAt).toLocaleDateString()},{' '}
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 font-mono tracking-tight">
                      {log.action}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-600">
                      {log.entityType}({log.entityId.slice(0, 16)}...)
                    </td>
                    <td className="py-4 px-6 text-slate-800 font-semibold">
                      {log.actor?.name || 'System Admin'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setInspectLog(log)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition-colors"
                      >
                        Inspect
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
          itemsPerPage={15}
        />
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={inspectLog !== null}
        onClose={() => setInspectLog(null)}
        title="Audit Record Payload Inspection"
        description={`Record ID: ${inspectLog?.id}`}
      >
        {inspectLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Action</span>
                <span className="font-bold text-slate-900 font-mono">{inspectLog.action}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Timestamp</span>
                <span className="font-medium text-slate-700 font-mono">{new Date(inspectLog.createdAt).toISOString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Actor</span>
                <span className="font-semibold text-slate-800">
                  {inspectLog.actor?.name || 'System Admin'} ({inspectLog.actor?.role || 'SYSTEM'})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Entity</span>
                <span className="font-mono text-slate-800">
                  {inspectLog.entityType}: {inspectLog.entityId}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700">Metadata Payload (JSON)</span>
                <button
                  onClick={() => copyMetadata(JSON.stringify(inspectLog.metadata, null, 2))}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-64 select-all">
                {inspectLog.metadata
                  ? JSON.stringify(inspectLog.metadata, null, 2)
                  : '// No additional metadata payload'}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectLog(null)}
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
