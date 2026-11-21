import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Users,
  Download,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Award,
  UserPlus,
  Send,
  Building,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Candidate, Batch } from '../types';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';

export const CandidatesPage: React.FC = () => {
  const { user } = useAuth();
  const { eventSignal, fetchNotifications } = useNotifications();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Selected candidate detail modal
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Register Candidate Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [draftBatches, setDraftBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('+91');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [submittingCandidate, setSubmittingCandidate] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const isTrainingCentre = user?.role === 'TRAINING_CENTRE';

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/candidates', { params });
      if (res.data.success) {
        setCandidates(res.data.data);
        setTotalItems(res.data.pagination.total);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDraftBatches = async () => {
    try {
      const res = await api.get('/batches', { params: { limit: 50 } });
      if (res.data.success) {
        const drafts = (res.data.data as Batch[]).filter(
          (b) => b.status === 'DRAFT' || b.status === 'RETURNED'
        );
        setDraftBatches(drafts);
        if (drafts.length > 0 && !selectedBatchId) {
          setSelectedBatchId(drafts[0].id);
        }
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchCandidates();
  }, [page, eventSignal]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCandidates();
  };

  const handleOpenRegister = () => {
    fetchDraftBatches();
    setRegisterError(null);
    setCandidateName('');
    setCandidatePhone('+91');
    setCandidateEmail('');
    setShowRegisterModal(true);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) {
      setRegisterError('Please select a target draft batch.');
      return;
    }
    setSubmittingCandidate(true);
    setRegisterError(null);

    try {
      const res = await api.post('/candidates', {
        batchId: selectedBatchId,
        name: candidateName,
        phone: candidatePhone,
        email: candidateEmail,
      });

      if (res.data.success) {
        setShowRegisterModal(false);
        fetchCandidates();
        fetchNotifications();
      }
    } catch (err: any) {
      setRegisterError(err.response?.data?.error || 'Failed to register candidate.');
    } finally {
      setSubmittingCandidate(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header matching SolarGrid */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Candidates Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Registered candidates across institutional batches, certificate records, and WhatsApp delivery milestones.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchCandidates}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-slate-900' : ''}`} />
            <span>Refresh</span>
          </button>

          {isTrainingCentre && (
            <button
              onClick={handleOpenRegister}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-900 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Register Candidate</span>
            </button>
          )}
        </div>
      </div>

      {/* Information Notice for Candidate Access */}
      <div className="p-4 rounded-[24px] bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900 block mb-0.5">Candidate Access Architecture:</span>
          <span className="text-slate-500">
            In accordance with sovereign data privacy guidelines, candidates do not possess user accounts or login credentials.
            Once a batch completes official multi-tier sign-off, each candidate receives an automated secure certificate link directly on their WhatsApp phone number.
          </span>
        </div>
      </div>

      {/* Search Bar matching SolarGrid */}
      <div className="bg-white rounded-[24px] border border-slate-200/80 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate by full name, email address, or contact phone (+91...)..."
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

      {/* Table matching SolarGrid */}
      <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6 font-semibold">CANDIDATE NAME</th>
                <th className="py-4 px-6 font-semibold">PHONE NUMBER</th>
                <th className="py-4 px-6 font-semibold">EMAIL ADDRESS</th>
                <th className="py-4 px-6 font-semibold">COURSE QUALIFICATION</th>
                <th className="py-4 px-6 font-semibold">BATCH ID</th>
                <th className="py-4 px-6 font-semibold">STATUS</th>
                <th className="py-4 px-6 text-right font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0F172A]" />
                    <span>Querying candidate directory...</span>
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No candidates found. Upload a CSV roster or register an individual candidate.
                  </td>
                </tr>
              ) : (
                candidates.map((c, idx) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: idx * 0.02 }}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-4 px-6 font-semibold text-slate-900">{c.name}</td>
                    <td className="py-4 px-6 font-mono text-slate-600">{c.phone}</td>
                    <td className="py-4 px-6 text-slate-600">{c.email}</td>
                    <td className="py-4 px-6 font-medium text-slate-800 max-w-[180px] truncate">
                      {c.courseName}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      {c.batch?.batchNumber || '—'}
                    </td>
                    <td className="py-4 px-6">
                      {c.certificate ? (
                        <div className="flex items-center gap-1.5">
                          <Badge status={c.certificate.status} size="sm" />
                          {c.certificate.delivery?.status === 'DELIVERED' && (
                            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              ✓ Dispatched
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">In Review</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedCandidate(c)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Inspect</span>
                      </button>
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

      {/* Candidate Inspector Modal */}
      <Modal
        isOpen={selectedCandidate !== null}
        onClose={() => setSelectedCandidate(null)}
        title={selectedCandidate?.name || 'Candidate Details'}
        description="Comprehensive candidate record, batch alignment, and sovereign credential status."
      >
        {selectedCandidate && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Candidate ID</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedCandidate.id.slice(0, 12)}...</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">WhatsApp Phone</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedCandidate.phone}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Email</span>
                  <p className="text-slate-800 mt-0.5 truncate">{selectedCandidate.email}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Course Qualification</span>
                  <p className="font-bold text-slate-900 mt-0.5 truncate">{selectedCandidate.courseName}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Associated Batch</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">
                    {selectedCandidate.batch?.batchNumber}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Batch Status</span>
                  <div className="mt-0.5">
                    <Badge status={selectedCandidate.batch?.status || 'DRAFT'} size="sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* Credential Status Box */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Certificate & Public Verification
              </span>

              {selectedCandidate.certificate ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Certificate Number</span>
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {selectedCandidate.certificate.certificateNumber}
                      </span>
                    </div>
                    <Badge status={selectedCandidate.certificate.status} size="sm" />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={`/verify/${encodeURIComponent(selectedCandidate.certificate.certificateNumber)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Public Verify Portal</span>
                    </a>

                    <a
                      href={`/api/certificates/${selectedCandidate.certificate.id}/download`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 py-2">
                  <p>Certificate will be automatically generated upon final State Office approval of this batch.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Register Individual Candidate Modal */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Register Individual Candidate"
        description="Add a candidate directly to a draft or returned training batch without a CSV file."
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          {registerError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              ⚠️ {registerError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Training Batch</label>
            {draftBatches.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                No draft batches available. Create a new batch first under the Batches tab.
              </div>
            ) : (
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
              >
                {draftBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchNumber} — {b.batchName} ({b.courseName})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Candidate Full Name</label>
            <input
              type="text"
              required
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="e.g. Priya Sundaram"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Phone Number</label>
            <input
              type="tel"
              required
              value={candidatePhone}
              onChange={(e) => setCandidatePhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              placeholder="e.g. priya.sundaram@example.com"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowRegisterModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingCandidate || draftBatches.length === 0}
              className="px-4 py-2 bg-[#0F172A] hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-40"
            >
              {submittingCandidate ? 'Registering...' : 'Register Candidate'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
