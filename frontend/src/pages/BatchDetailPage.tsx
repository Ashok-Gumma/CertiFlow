import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Users,
  Award,
  Send,
  Download,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Eye,
  FileCheck,
  Plus,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Batch, Approval, Candidate } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { CertificatePreview } from '../components/common/CertificatePreview';

export const BatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { fetchNotifications, eventSignal } = useNotifications();

  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'candidates' | 'approvals'>('overview');

  // Preview certificate modal
  const [previewCertCandidate, setPreviewCertCandidate] = useState<Candidate | null>(null);

  // Review action modal (approve / reject / return)
  const [modalType, setModalType] = useState<'approve' | 'reject' | 'return' | null>(null);
  const [comments, setComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [justApproved, setJustApproved] = useState(false);

  // Add Candidate Modal (for Training Centre in DRAFT mode)
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [candName, setCandName] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candPhone, setCandPhone] = useState('');
  const [candAdding, setCandAdding] = useState(false);
  const [candError, setCandError] = useState<string | null>(null);

  // Submit batch modal / state
  const [submittingBatch, setSubmittingBatch] = useState(false);

  const fetchBatch = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/batches/${id}`);
      if (res.data.success) {
        setBatch(res.data.batch);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBatch();
  }, [id, eventSignal]);

  const handleActionSubmit = async () => {
    if (!batch || !modalType) return;
    setActionLoading(true);
    setActionError(null);

    try {
      let endpoint = '';
      if (modalType === 'approve') endpoint = `/batches/${batch.id}/approve`;
      if (modalType === 'reject') endpoint = `/batches/${batch.id}/reject`;
      if (modalType === 'return') endpoint = `/batches/${batch.id}/return`;

      const decisionValue =
        modalType === 'approve' ? 'APPROVED' : modalType === 'reject' ? 'REJECTED' : 'RETURNED';

      const res = await api.post(endpoint, {
        decision: decisionValue,
        comments,
      });

      if (res.data.success) {
        setModalType(null);
        setComments('');
        setJustApproved(true);
        setTimeout(() => setJustApproved(false), 5000);
        fetchBatch();
        fetchNotifications();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.error || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batch) return;
    setCandAdding(true);
    setCandError(null);

    try {
      const res = await api.post('/candidates', {
        name: candName,
        email: candEmail,
        phone: candPhone,
        courseName: batch.courseName,
        batchId: batch.id,
      });

      if (res.data.success) {
        setShowAddCandidate(false);
        setCandName('');
        setCandEmail('');
        setCandPhone('');
        fetchBatch();
        fetchNotifications();
      }
    } catch (err: any) {
      setCandError(err.response?.data?.error || 'Failed to add candidate');
    } finally {
      setCandAdding(false);
    }
  };

  const handleSubmitBatch = async () => {
    if (!batch) return;
    setSubmittingBatch(true);
    try {
      const res = await api.post(`/batches/${batch.id}/submit`);
      if (res.data.success) {
        fetchBatch();
        fetchNotifications();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit batch for review.');
    } finally {
      setSubmittingBatch(false);
    }
  };

  if (loading || !batch) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#0F172A] mb-3" />
        <p className="text-xs text-slate-500 font-medium">Retrieving batch details...</p>
      </div>
    );
  }

  // Determine current cycle approvals
  const currentCycle = batch.approvalCycle;
  const currentApprovals = (batch.approvals || []).filter((a) => a.approvalCycle === currentCycle);
  const districtApprovals = currentApprovals.filter(
    (a) => a.role === 'DISTRICT_OFFICER' && a.decision === 'APPROVED'
  );
  const qualityApproval = currentApprovals.find(
    (a) => a.role === 'QUALITY_TEAM' && a.decision === 'APPROVED'
  );

  const userHasApprovedInCycle = currentApprovals.some((a) => a.officerId === user?.id);

  // Check review action permissions
  let canApprove = false;
  let canRejectOrReturn = false;

  if (user?.role === 'DISTRICT_OFFICER') {
    if (
      (batch.status === 'SUBMITTED' || batch.status === 'DISTRICT_REVIEW') &&
      !userHasApprovedInCycle &&
      (!user.districtId || user.districtId === batch.districtId)
    ) {
      canApprove = true;
      canRejectOrReturn = true;
    }
  } else if (user?.role === 'QUALITY_TEAM') {
    if (batch.status === 'QUALITY_REVIEW') {
      canApprove = true;
      canRejectOrReturn = true;
    }
  } else if (user?.role === 'STATE_OFFICE') {
    if (batch.status === 'STATE_REVIEW') {
      canApprove = true;
      canRejectOrReturn = true;
    }
  }

  const isTrainingCentreOwner =
    user?.role === 'TRAINING_CENTRE' &&
    (!user.trainingCentreId || user.trainingCentreId === batch.trainingCentreId);

  const canSubmitBatch =
    isTrainingCentreOwner &&
    (batch.status === 'DRAFT' || batch.status === 'RETURNED') &&
    batch.candidateCount > 0;

  const isQualityRequired = batch.candidateCount >= 50;

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {justApproved && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold">Official Decision Recorded Successfully!</h4>
              <p className="text-[11px] text-emerald-800">
                The batch workflow state machine has advanced to the next governance tier.
              </p>
            </div>
          </div>
          <button onClick={() => setJustApproved(false)} className="text-xs font-bold text-emerald-700">
            ✕
          </button>
        </motion.div>
      )}

      {/* Top Header matching SolarGrid */}
      <div>
        <Link to="/batches" className="text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 inline-block">
          ← Back to Batches
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
                {batch.batchNumber}
              </h1>
              <Badge status={batch.status} />
              {batch.approvalCycle > 1 && (
                <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
                  Cycle #{batch.approvalCycle}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{batch.batchName}</p>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2">
            {/* Training Centre actions for DRAFT / RETURNED */}
            {isTrainingCentreOwner && (batch.status === 'DRAFT' || batch.status === 'RETURNED') && (
              <>
                <button
                  onClick={() => setShowAddCandidate(true)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-600" />
                  <span>+ Add Candidate</span>
                </button>

                {canSubmitBatch && (
                  <button
                    onClick={handleSubmitBatch}
                    disabled={submittingBatch}
                    className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-900 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingBatch ? 'Submitting...' : 'Submit Batch for Review'}</span>
                  </button>
                )}
              </>
            )}

            {/* Reviewer actions */}
            {canRejectOrReturn && (
              <>
                <button
                  onClick={() => {
                    setModalType('return');
                    setComments('');
                  }}
                  className="px-3.5 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Return for Correction</span>
                </button>

                <button
                  onClick={() => {
                    setModalType('reject');
                    setComments('');
                  }}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs font-semibold hover:bg-rose-100 transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </>
            )}

            {canApprove && (
              <button
                onClick={() => {
                  setModalType('approve');
                  setComments('Candidate roster, eligibility and assessment scores verified.');
                }}
                className="px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-900 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {user?.role === 'STATE_OFFICE'
                    ? 'Grant Final State Approval'
                    : user?.role === 'QUALITY_TEAM'
                    ? 'Approve Quality Review'
                    : 'Approve District Review'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Tier Governance Stepper matching SolarGrid */}
      <div className="bg-white rounded-[28px] border border-slate-200/80 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            GOVERNANCE WORKFLOW PIPELINE
          </h2>
          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
            {batch.status === 'APPROVED' ? 'Approved & Issued' : 'In Approval Pipeline'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
          {/* Step 1: Submission */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-950">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">01. INTAKE</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xs font-bold truncate">{batch.trainingCentre?.name}</p>
            <span className="text-[10px] text-emerald-700 block mt-0.5">
              {batch.candidateCount} candidates staged
            </span>
          </div>

          {/* Step 2: District Signoff */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              districtApprovals.length >= 2
                ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950'
                : districtApprovals.length === 1
                ? 'bg-indigo-50/70 border-indigo-200/80 text-indigo-950 ring-1 ring-indigo-300'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider">02. DISTRICT REVIEW</span>
              {districtApprovals.length >= 2 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              )}
            </div>
            <p className="text-xs font-bold">
              {districtApprovals.length} of 2 Officers Signed
            </p>
            <div className="mt-0.5 space-y-0.5 text-[10px]">
              {districtApprovals.map((a) => (
                <span key={a.id} className="block text-emerald-700 font-semibold truncate">
                  ✓ {a.officer?.name}
                </span>
              ))}
              {districtApprovals.length < 2 && (
                <span className="text-slate-400 italic">Consensus required</span>
              )}
            </div>
          </div>

          {/* Step 3: Quality Scrutiny */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              !isQualityRequired
                ? 'bg-slate-50 border-slate-200 text-slate-400'
                : qualityApproval
                ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950'
                : batch.status === 'QUALITY_REVIEW'
                ? 'bg-amber-50/70 border-amber-200/80 text-amber-950 ring-1 ring-amber-300'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider">03. QUALITY REVIEW</span>
              {!isQualityRequired ? (
                <span className="text-[9px] font-semibold text-slate-400">Bypassed (&lt;50)</span>
              ) : qualityApproval ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              )}
            </div>
            <p className="text-xs font-bold">
              {!isQualityRequired ? 'Skipped (<50)' : 'Quality Team (Neha)'}
            </p>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {!isQualityRequired
                ? 'Not required for <50'
                : qualityApproval
                ? `Approved by ${qualityApproval.officer?.name}`
                : 'Scrutiny pending'}
            </span>
          </div>

          {/* Step 4: State Office Approval */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              batch.status === 'APPROVED'
                ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950'
                : batch.status === 'STATE_REVIEW'
                ? 'bg-indigo-50/70 border-indigo-200/80 text-indigo-950 ring-1 ring-indigo-300'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider">04. STATE OFFICE</span>
              {batch.status === 'APPROVED' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
              )}
            </div>
            <p className="text-xs font-bold">State Director (Farah)</p>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {batch.status === 'APPROVED' ? 'Final authorization complete' : 'Awaiting state sign-off'}
            </span>
          </div>

          {/* Step 5: Background PDF & Delivery */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              batch.status === 'APPROVED'
                ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider">05. CREDENTIALS</span>
              {batch.status === 'APPROVED' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Award className="w-3.5 h-3.5 text-slate-300" />
              )}
            </div>
            <p className="text-xs font-bold">PDF & WhatsApp</p>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {batch.status === 'APPROVED' ? 'Issued to candidates' : 'Pending final approval'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs matching SolarGrid */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'overview'
              ? 'bg-[#0F172A] text-white shadow-xs'
              : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('candidates')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'candidates'
              ? 'bg-[#0F172A] text-white shadow-xs'
              : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Candidates ({batch.candidates?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'approvals'
              ? 'bg-[#0F172A] text-white shadow-xs'
              : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Sign-Off Ledger ({batch.approvals?.length || 0})
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-white rounded-[28px] border border-slate-200/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Course Specifications
            </h3>
            <div>
              <span className="text-[10px] text-slate-400 block">Course Title</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">{batch.courseName}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Course Identifier Code</span>
              <p className="text-xs font-mono font-semibold text-slate-900 mt-0.5">{batch.courseCode}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Candidate Enrollment</span>
              <p className="text-xs font-bold text-emerald-600 mt-0.5">{batch.candidateCount} Students</p>
            </div>
          </div>

          <div className="bg-white rounded-[28px] border border-slate-200/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Institution & District
            </h3>
            <div>
              <span className="text-[10px] text-slate-400 block">Training Centre</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">{batch.trainingCentre?.name}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">District Jurisdiction</span>
              <p className="text-xs font-semibold text-slate-900 mt-0.5">{batch.district?.name}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Submission Date</span>
              <p className="text-xs text-slate-700 mt-0.5">
                {batch.submittedAt ? new Date(batch.submittedAt).toLocaleString() : 'Draft — Not submitted'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[28px] border border-slate-200/80 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Workflow Status
            </h3>
            <div>
              <span className="text-[10px] text-slate-400 block">Quality Review Requirement</span>
              <p className="text-xs font-semibold text-slate-900 mt-0.5">
                {isQualityRequired ? 'Mandatory (≥50 candidates)' : 'Bypassed (<50 candidates)'}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Current Approval Cycle</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">Cycle #{batch.approvalCycle}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Batch Status</span>
              <div className="mt-1">
                <Badge status={batch.status} size="sm" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Candidates */}
      {activeTab === 'candidates' && (
        <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6 font-semibold">#</th>
                  <th className="py-4 px-6 font-semibold">CANDIDATE NAME</th>
                  <th className="py-4 px-6 font-semibold">PHONE</th>
                  <th className="py-4 px-6 font-semibold">EMAIL</th>
                  <th className="py-4 px-6 font-semibold">CERTIFICATE ID</th>
                  <th className="py-4 px-6 font-semibold">DELIVERY</th>
                  <th className="py-4 px-6 text-right font-semibold">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(batch.candidates || []).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No candidates registered in this batch yet.
                    </td>
                  </tr>
                ) : (
                  (batch.candidates || []).map((c, index) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-6 text-slate-400 font-mono">{index + 1}</td>
                      <td className="py-3 px-6 font-semibold text-slate-900">{c.name}</td>
                      <td className="py-3 px-6 font-mono text-slate-600">{c.phone}</td>
                      <td className="py-3 px-6 text-slate-600">{c.email}</td>
                      <td className="py-3 px-6 font-mono text-slate-900 font-medium">
                        {c.certificate ? c.certificate.certificateNumber : '—'}
                      </td>
                      <td className="py-3 px-6">
                        {c.certificate?.delivery ? (
                          <Badge status={c.certificate.delivery.status} size="sm" />
                        ) : (
                          <span className="text-[10px] text-slate-400">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-6 text-right space-x-1.5 whitespace-nowrap">
                        {c.certificate && (
                          <>
                            <button
                              onClick={() => setPreviewCertCandidate(c)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>Preview</span>
                            </button>

                            <a
                              href={`/api/certificates/${c.certificate.id}/download`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </a>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Approvals */}
      {activeTab === 'approvals' && (
        <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 sm:p-8 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            Official Governance Sign-Off Register
          </h3>
          {(batch.approvals || []).length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No sign-offs recorded yet for this batch.</p>
          ) : (
            <div className="space-y-3">
              {(batch.approvals || []).map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900">{app.officer?.name}</span>
                      <Badge status={app.role} size="sm" />
                      <Badge status={app.decision} size="sm" />
                      <span className="text-[10px] text-slate-400 font-mono">Cycle #{app.approvalCycle}</span>
                    </div>
                    {app.comments && (
                      <p className="text-slate-700 italic mt-1 bg-white p-2.5 rounded-xl border border-slate-200/80">
                        "{app.comments}"
                      </p>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {new Date(app.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Candidate Certificate Preview Modal */}
      <Modal
        isOpen={previewCertCandidate !== null}
        onClose={() => setPreviewCertCandidate(null)}
        maxWidth="3xl"
        title="Official Certificate Preview"
        description="Official credential preview rendered from PostgreSQL metadata."
      >
        {previewCertCandidate && previewCertCandidate.certificate && (
          <div className="space-y-4 pt-2">
            <div className="flex justify-center p-2 bg-slate-50 rounded-2xl border border-slate-200/80">
              <CertificatePreview
                candidateName={previewCertCandidate.name}
                courseName={previewCertCandidate.courseName}
                trainingCentreName={batch.trainingCentre?.name}
                batchNumber={batch.batchNumber}
                certificateNumber={previewCertCandidate.certificate.certificateNumber}
                issueDate={new Date(previewCertCandidate.certificate.issueDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
                status={previewCertCandidate.certificate.status}
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-mono">
                Verification: /verify/{previewCertCandidate.certificate.certificateNumber}
              </span>

              <a
                href={`/api/certificates/${previewCertCandidate.certificate.id}/download`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F172A] text-white font-semibold hover:bg-slate-900 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Vector PDF</span>
              </a>
            </div>
          </div>
        )}
      </Modal>

      {/* Review Action Modal (Approve / Return / Reject) */}
      <Modal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        title={
          modalType === 'approve'
            ? 'Confirm Official Approval'
            : modalType === 'reject'
            ? 'Reject Candidate Batch'
            : 'Return Batch for Correction'
        }
        description={
          modalType === 'approve'
            ? 'Your authorization will be permanently recorded in the state audit ledger.'
            : 'Please specify the exact reason for the record and training centre notification.'
        }
      >
        <div className="space-y-4">
          {actionError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              ⚠️ {actionError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {modalType === 'approve' ? 'Comments (Optional)' : 'Mandatory Reason (at least 5 characters)'}
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              placeholder={
                modalType === 'approve'
                  ? 'Candidate attendance logs and assessment marks verified.'
                  : 'Specify reason (e.g. Assessment score anomalies found for candidates 12 to 18).'
              }
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>

            <button
              onClick={handleActionSubmit}
              disabled={actionLoading || (modalType !== 'approve' && comments.trim().length < 5)}
              className={`px-5 py-2 rounded-xl text-white text-xs font-semibold shadow-xs transition-colors ${
                modalType === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : modalType === 'reject'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              } disabled:opacity-50`}
            >
              {actionLoading ? 'Processing...' : 'Confirm Decision'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Single Candidate Modal */}
      <Modal
        isOpen={showAddCandidate}
        onClose={() => setShowAddCandidate(false)}
        title="Add Candidate to Batch"
        description="Register an individual candidate into this draft batch."
      >
        <form onSubmit={handleAddCandidate} className="space-y-4">
          {candError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              ⚠️ {candError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Candidate Full Name</label>
            <input
              type="text"
              required
              value={candName}
              onChange={(e) => setCandName(e.target.value)}
              placeholder="e.g. Rahul Verma"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Candidate Email</label>
            <input
              type="email"
              required
              value={candEmail}
              onChange={(e) => setCandEmail(e.target.value)}
              placeholder="e.g. rahul.verma@example.com"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Mobile Number</label>
            <input
              type="tel"
              required
              value={candPhone}
              onChange={(e) => setCandPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddCandidate(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={candAdding}
              className="px-4 py-2 bg-[#0F172A] hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {candAdding ? 'Adding...' : 'Add Candidate'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
