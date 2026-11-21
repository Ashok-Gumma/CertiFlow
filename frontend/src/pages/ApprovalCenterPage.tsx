import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Layers,
  ShieldCheck,
  Building,
  Info,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { NotionEmptyState } from '../components/illustrations/NotionIllustrations';

export const ApprovalCenterPage: React.FC = () => {
  const { user } = useAuth();
  const { fetchNotifications, eventSignal } = useNotifications();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick Action Modal
  const [activeBatch, setActiveBatch] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'return' | null>(null);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const isReviewer =
    user?.role === 'DISTRICT_OFFICER' ||
    user?.role === 'QUALITY_TEAM' ||
    user?.role === 'STATE_OFFICE';

  const isTrainingCentre = user?.role === 'TRAINING_CENTRE';

  const fetchPending = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.get('/approvals');
      if (res.data.success) {
        setBatches(res.data.pendingBatches || []);
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.response?.data?.error || 'Failed to load approvals queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, [user, eventSignal]);

  const handleActionSubmit = async () => {
    if (!activeBatch || !actionType) return;
    setSubmitting(true);
    setModalError(null);

    try {
      const endpoint = `/batches/${activeBatch.id}/${actionType}`;
      const decisionValue =
        actionType === 'approve' ? 'APPROVED' : actionType === 'reject' ? 'REJECTED' : 'RETURNED';
      await api.post(endpoint, {
        decision: decisionValue,
        comments,
      });

      setActiveBatch(null);
      setActionType(null);
      setComments('');
      fetchPending();
      fetchNotifications();
    } catch (err: any) {
      setModalError(err.response?.data?.error || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleStepTitle = () => {
    if (user?.role === 'DISTRICT_OFFICER') return 'Tier 1 — District Verification Desk';
    if (user?.role === 'QUALITY_TEAM') return 'Tier 2 — Quality Assurance Desk';
    if (user?.role === 'STATE_OFFICE') return 'Tier 3 — State Office Final Authorization Desk';
    return 'Multi-Tier Governance Desk';
  };

  return (
    <div className="space-y-6">
      {/* Page Header matching SolarGrid */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isReviewer ? 'Approval Center' : 'Approval Pipeline'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isReviewer
              ? 'Multi-level official governance: Review and authorize candidate batches awaiting your sign-off.'
              : 'Track submitted batches progressing through District, Quality Assurance, and State Office review tiers.'}
          </p>
        </div>

        <button
          onClick={fetchPending}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-slate-900' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Role Context & Workflow Explanation Card */}
      {isTrainingCentre ? (
        <div className="p-5 rounded-[28px] bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Building className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <span className="font-bold text-sm text-slate-900">
                  {user?.trainingCentre?.name || 'Training Centre'} — Active Review Pipeline
                </span>
                <span className="font-semibold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full text-[10px]">
                  {batches.length} {batches.length === 1 ? 'Batch' : 'Batches'} In Review
                </span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                As a Training Centre, you submit candidate batches for official credentials.
                Each batch undergoes sequential review:
                <strong className="text-slate-800 font-semibold"> District Verification (2 Officers)</strong> →{' '}
                <strong className="text-slate-800 font-semibold">Quality Team Audit</strong> →{' '}
                <strong className="text-slate-800 font-semibold">State Office Cryptographic Issuance</strong>.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-[28px] bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center shrink-0">
              <CheckSquare className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm block">{getRoleStepTitle()}</span>
              <p className="text-[11px] text-slate-500">
                Logged in as <strong className="font-semibold text-slate-900">{user?.name}</strong> (
                <span className="uppercase font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                  {user?.role}
                </span>
                {user?.district ? ` • ${user.district.name}` : ''})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl text-xs">
              {batches.length} {batches.length === 1 ? 'Batch' : 'Batches'} Awaiting Sign-off
            </span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Table of Batches matching SolarGrid */}
      <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 sm:px-4 font-semibold">BATCH ID</th>
                <th className="py-3 px-3 sm:px-4 font-semibold">COURSE QUALIFICATION</th>
                <th className="py-3 px-3 sm:px-4 font-semibold">TRAINING CENTRE</th>
                <th className="py-3 px-2 sm:px-3 text-center font-semibold">CANDIDATES</th>
                <th className="py-3 px-3 sm:px-4 font-semibold">CURRENT STAGE</th>
                <th className="py-3 px-3 sm:px-4 font-semibold">WAITING TIME</th>
                <th className="py-3 px-3 sm:px-4 text-right font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0F172A]" />
                    <span>Querying pending approval queue...</span>
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex justify-center mb-3">
                      <NotionEmptyState className="w-40 h-40 drop-shadow-xs" />
                    </div>
                    <p className="font-bold text-slate-900 text-sm">All clear! No pending reviews in your queue.</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                      {isReviewer
                        ? 'There are currently no batches in your district or review tier waiting for authorization.'
                        : 'None of your submitted batches are currently in the review queue.'}
                    </p>
                  </td>
                </tr>
              ) : (
                batches.map((b, idx) => {
                  const hoursWaiting = Math.max(
                    0,
                    Math.round((Date.now() - new Date(b.waitingSince).getTime()) / (3600 * 1000))
                  );

                  return (
                    <motion.tr
                      key={b.id}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15, delay: idx * 0.02 }}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-3.5 px-3 sm:px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <Link
                          to={`/batches/${b.id}`}
                          className="hover:underline flex items-center gap-1 group"
                        >
                          <span>{b.batchNumber}</span>
                          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </td>
                      <td className="py-3.5 px-3 sm:px-4 font-semibold text-slate-900 max-w-[150px] lg:max-w-[200px] truncate" title={b.courseName}>
                        {b.courseName}
                      </td>
                      <td className="py-3.5 px-3 sm:px-4 text-slate-600 max-w-[130px] lg:max-w-[170px] truncate" title={b.trainingCentre?.name || ''}>
                        {b.trainingCentre?.name || '—'}
                      </td>
                      <td className="py-3.5 px-2 sm:px-3 text-center font-bold text-slate-900">
                        {b.candidateCount}
                      </td>
                      <td className="py-3.5 px-3 sm:px-4 whitespace-nowrap">
                        <Badge status={b.status} size="sm" />
                        {b.hasApproved && (
                          <span className="block text-[10px] text-emerald-600 font-semibold mt-0.5">
                            ✓ Signed off (cycle {b.approvalCycle})
                          </span>
                        )}
                        {b.status === 'DISTRICT_REVIEW' && b.districtApprovalsCount !== undefined && (
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            District: {b.districtApprovalsCount}/2
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 sm:px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {hoursWaiting === 0 ? 'Just now' : `${hoursWaiting}h waiting`}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 sm:px-4 text-right space-x-1.5 whitespace-nowrap">
                        <Link
                          to={`/batches/${b.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        </Link>

                        {isReviewer && !b.hasApproved && (
                          <>
                            <button
                              onClick={() => {
                                setActiveBatch(b);
                                setActionType('approve');
                                setComments('Candidate roster and assessment scores verified.');
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0F172A] text-white text-xs font-semibold hover:bg-slate-900 shadow-xs transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Approve</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveBatch(b);
                                setActionType('return');
                                setComments('Please review candidate attendance details.');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Return</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveBatch(b);
                                setActionType('reject');
                                setComments('Non-compliance with required training scheme criteria.');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 text-xs font-semibold hover:bg-rose-100 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal (Approve / Return / Reject) */}
      <Modal
        isOpen={actionType !== null}
        onClose={() => {
          setActionType(null);
          setActiveBatch(null);
        }}
        title={
          actionType === 'approve'
            ? `Approve Batch: ${activeBatch?.batchNumber}`
            : actionType === 'return'
            ? `Return Batch: ${activeBatch?.batchNumber}`
            : `Reject Batch: ${activeBatch?.batchNumber}`
        }
        description={
          actionType === 'approve'
            ? 'Record your official authorization for this candidate batch.'
            : actionType === 'return'
            ? 'Send this batch back to the Training Centre for correction. Provide clear revision instructions.'
            : 'Permanently reject this batch submission. Provide detailed justification for the audit trail.'
        }
      >
        <div className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              ⚠️ {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Official Comments / Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              placeholder={
                actionType === 'approve'
                  ? 'Candidate records and marks certified accurate.'
                  : actionType === 'return'
                  ? 'Attendance threshold not met for candidates. Please correct and resubmit.'
                  : 'Critical non-compliance with scheme norms.'
              }
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F172A] bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => {
                setActionType(null);
                setActiveBatch(null);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleActionSubmit}
              disabled={submitting || !comments.trim()}
              className={`px-5 py-2 rounded-xl text-white text-xs font-semibold shadow-xs disabled:opacity-40 transition-colors ${
                actionType === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : actionType === 'return'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {submitting
                ? 'Submitting...'
                : actionType === 'approve'
                ? 'Confirm Authorization'
                : actionType === 'return'
                ? 'Return for Revision'
                : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
