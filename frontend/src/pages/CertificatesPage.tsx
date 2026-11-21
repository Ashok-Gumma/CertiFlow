import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Search,
  Download,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Eye,
  FileText,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Certificate } from '../types';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';
import { CertificatePreview } from '../components/common/CertificatePreview';

export const CertificatesPage: React.FC = () => {
  const { user } = useAuth();
  const { fetchNotifications, eventSignal } = useNotifications();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Certificate Inspection Modal
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);

  // Revocation Modal
  const [revokingCert, setRevokingCert] = useState<Certificate | null>(null);
  const [revocationReason, setRevocationReason] = useState('');
  const [submittingRevoke, setSubmittingRevoke] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/certificates', { params });
      if (res.data.success) {
        setCertificates(res.data.data);
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
    fetchCertificates();
  }, [page, statusFilter, eventSignal]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCertificates();
  };

  const handleRevokeConfirm = async () => {
    if (!revokingCert) return;
    setSubmittingRevoke(true);
    setRevokeError(null);

    try {
      const res = await api.post(`/certificates/${revokingCert.id}/revoke`, {
        reason: revocationReason,
      });

      if (res.data.success) {
        setRevokingCert(null);
        setRevocationReason('');
        fetchCertificates();
        fetchNotifications();
      }
    } catch (err: any) {
      setRevokeError(err.response?.data?.error || 'Failed to revoke certificate');
    } finally {
      setSubmittingRevoke(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header matching SolarGrid */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Certificate Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Official cryptographic credential repository with real-time public verification and state revocation controls.
          </p>
        </div>

        <button
          onClick={fetchCertificates}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-slate-900' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar matching SolarGrid */}
      <div className="bg-white rounded-[24px] border border-slate-200/80 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'VALID', 'REVOKED'].map((st) => (
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
              placeholder="Search by certificate ID (e.g. CF/2026/...) or candidate name..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F172A] transition-colors"
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

      {/* Certificates Table Card matching SolarGrid */}
      <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6 font-semibold">CERTIFICATE ID</th>
                <th className="py-4 px-6 font-semibold">CANDIDATE</th>
                <th className="py-4 px-6 font-semibold">COURSE QUALIFICATION</th>
                <th className="py-4 px-6 font-semibold">BATCH ID</th>
                <th className="py-4 px-6 font-semibold">ISSUE DATE</th>
                <th className="py-4 px-6 font-semibold">STATUS</th>
                <th className="py-4 px-6 text-right font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0F172A]" />
                    <span>Querying credential registry...</span>
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No certificates found matching your criteria.
                  </td>
                </tr>
              ) : (
                certificates.map((cert, idx) => (
                  <motion.tr
                    key={cert.id}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: idx * 0.02 }}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      {cert.certificateNumber}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {cert.candidate?.name}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-800 max-w-[200px] truncate">
                      {cert.batch?.courseName}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-600">
                      {cert.batch?.batchNumber}
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <Badge status={cert.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setPreviewCert(cert)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Preview Certificate"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <span>Preview</span>
                      </button>

                      <a
                        href={`/api/certificates/${cert.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </a>

                      <a
                        href={`/verify/${encodeURIComponent(cert.certificateNumber)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verify</span>
                      </a>

                      {user?.role === 'STATE_OFFICE' && cert.status === 'VALID' && (
                        <button
                          onClick={() => {
                            setRevokingCert(cert);
                            setRevocationReason('');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100 transition-colors"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Revoke</span>
                        </button>
                      )}
                    </td>
                  </motion.tr>
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

      {/* Certificate Preview Modal */}
      <Modal
        isOpen={previewCert !== null}
        onClose={() => setPreviewCert(null)}
        maxWidth="3xl"
        title="Official Verified Credential"
        description="Official sovereign credential generated from verified state database records."
      >
        {previewCert && (
          <div className="space-y-4">
            <div className="flex justify-center p-2 bg-slate-50 rounded-2xl border border-slate-200/80">
              <CertificatePreview
                certificateNumber={previewCert.certificateNumber}
                candidateName={previewCert.candidate?.name || 'Candidate Name'}
                courseName={previewCert.batch?.courseName || 'Course Qualification'}
                trainingCentreName={previewCert.batch?.trainingCentre?.name || 'Training Centre'}
                batchNumber={previewCert.batch?.batchNumber || 'Batch ID'}
                issueDate={new Date(previewCert.issueDate).toLocaleDateString()}
                status={previewCert.status as 'VALID' | 'REVOKED'}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-mono">
                SHA-256 Hash Anchored • Digital Seal Active
              </span>

              <div className="flex items-center gap-2">
                <a
                  href={`/api/certificates/${previewCert.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Official PDF</span>
                </a>
                <button
                  onClick={() => setPreviewCert(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Revoke Certificate Modal */}
      <Modal
        isOpen={revokingCert !== null}
        onClose={() => setRevokingCert(null)}
        title={`Revoke Certificate: ${revokingCert?.certificateNumber}`}
        description="Warning: Revocation cancels this credential immediately on the public registry."
      >
        <div className="space-y-4">
          {revokeError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              ⚠️ {revokeError}
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Permanent Revocation Warning</span>
              <span>
                Revoking this certificate marks it as invalid on the public verification portal. Anyone scanning the QR code or verifying online will immediately see a REVOKED alert.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Reason for Revocation <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={revocationReason}
              onChange={(e) => setRevocationReason(e.target.value)}
              rows={3}
              placeholder="e.g. Assessment irregularity identified during audit."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F172A] bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setRevokingCert(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleRevokeConfirm}
              disabled={submittingRevoke || !revocationReason.trim()}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs disabled:opacity-40 transition-colors"
            >
              {submittingRevoke ? 'Revoking...' : 'Confirm Revocation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
