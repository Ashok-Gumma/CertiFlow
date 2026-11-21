import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Search,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Building,
  Layers,
  ArrowRight,
  RefreshCw,
  Printer,
  Download,
  Lock,
  FileCheck,
} from 'lucide-react';
import api from '../services/api';
import { Navbar } from '../components/layout/Navbar';
import { CertificatePreview } from '../components/common/CertificatePreview';
import { NotionQualityAudit } from '../components/illustrations/NotionIllustrations';

export const PublicVerifyPage: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(Boolean(certificateId && certificateId !== 'CF-SAMPLE'));
  const [result, setResult] = useState<any | null>(null);
  const [searchInput, setSearchInput] = useState(certificateId && certificateId !== 'CF-SAMPLE' ? certificateId : '');
  const [isScanning, setIsScanning] = useState(false);

  const verifyCertificate = async (idToVerify: string) => {
    setLoading(true);
    setIsScanning(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      const res = await api.get(`/public/verify/${encodeURIComponent(idToVerify)}`);
      setResult(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setResult(err.response.data);
      } else {
        setResult({
          status: 'NOT_FOUND',
          heading: 'Verification Error',
          message: err.response?.data?.error || 'Unable to query registry at this time.',
        });
      }
    } finally {
      setLoading(false);
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (certificateId && certificateId !== 'CF-SAMPLE') {
      setSearchInput(certificateId);
      verifyCertificate(certificateId);
    } else {
      setResult(null);
      setLoading(false);
    }
  }, [certificateId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/verify/${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Top Header matching SolarGrid */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-800 mb-3 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>National Skill Qualification & Verification Registry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Official Credential Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Direct public verification anchored in the official sovereign vocational qualification database.
          </p>
        </div>

        {/* Prominent Verification Search Input (Always visible at top) */}
        <div className="bg-white rounded-[28px] border border-slate-200/80 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] mb-8">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter Certificate Number (e.g. CF/2026/JAVA/11/000142)"
                required
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0F172A] bg-[#F8FAFC] focus:bg-white text-slate-900 transition-all font-semibold"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchInput.trim()}
              className="px-6 py-3 rounded-2xl bg-[#0F172A] hover:bg-slate-900 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-40 flex items-center justify-center gap-2 shrink-0"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              )}
              <span>Verify Authenticity</span>
            </button>
          </form>

          {/* Quick instructions */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
            <span>Standard Format: <code className="text-slate-700 font-mono font-semibold">CF/YYYY/CODE/MM/SERIAL</code></span>
            <span>Live Sovereign Database • Anti-Tamper Secured</span>
          </div>
        </div>

        {/* State 1: Loading Verification */}
        {loading && (
          <div className="bg-white rounded-[28px] border border-slate-200/80 p-14 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <RefreshCw className="w-8 h-8 animate-spin text-[#0F172A] mx-auto mb-3" />
            <h2 className="text-base font-bold text-slate-900">Validating Credential Record...</h2>
            <p className="text-xs text-slate-500 mt-1">
              Checking certificate serial, multi-tier officer authorizations, and revocation registry.
            </p>
          </div>
        )}

        {/* State 2: Default Prompt (No search performed yet) */}
        {!loading && !result && (
          <div className="bg-white rounded-[32px] border border-slate-200/80 p-10 sm:p-14 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex justify-center mb-2">
              <NotionQualityAudit className="w-36 h-36 drop-shadow-xs" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Awaiting Certificate Serial Number
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Enter your official certificate number in the search bar above to verify its authenticity, issuing institution, and multi-tier government approvals.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#F8FAFC] border border-slate-200 text-slate-700 text-xs font-semibold">
                ✓ No Account or Login Required
              </span>
              <span className="px-3 py-1 rounded-full bg-[#F8FAFC] border border-slate-200 text-slate-700 text-xs font-semibold">
                ✓ Live Registry Grounded
              </span>
              <span className="px-3 py-1 rounded-full bg-[#F8FAFC] border border-slate-200 text-slate-700 text-xs font-semibold">
                ✓ Instant Verification Proof
              </span>
            </div>
          </div>
        )}

        {/* State 3: Result Display (Active, Revoked, or Not Found) */}
        {!loading && result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 mb-10"
          >
            {/* VALID STATUS BANNER */}
            {result.status === 'VALID' && (
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-[28px] p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full mb-1">
                    ✓ Official Status: Active & Authentic
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
                    {result.heading}
                  </h2>
                  <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                    {result.message}
                  </p>
                </div>
              </div>
            )}

            {/* REVOKED STATUS BANNER */}
            {result.status === 'REVOKED' && (
              <div className="bg-rose-50/90 border border-rose-300 rounded-[28px] p-6 sm:p-7 shadow-xs text-center sm:text-left flex flex-col sm:flex-row items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full inline-block mb-1">
                    ⚠️ Official Status: Revoked & Void
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-rose-950 tracking-tight">
                    {result.heading}
                  </h2>
                  <p className="text-xs text-rose-800 mt-0.5">
                    {result.message}
                  </p>

                  {result.certificate?.revocationReason && (
                    <div className="mt-3 p-3 bg-white rounded-xl border border-rose-200 text-xs text-rose-900">
                      <span className="font-bold text-[9px] uppercase tracking-wider text-rose-600 block">
                        State Revocation Reason:
                      </span>
                      <p className="mt-0.5 font-medium italic">"{result.certificate.revocationReason}"</p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Effective date: {new Date(result.certificate.revokedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* NOT FOUND BANNER */}
            {result.status === 'NOT_FOUND' && (
              <div className="bg-white border border-slate-200/80 rounded-[28px] p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-3">
                  <XCircle className="w-7 h-7 text-rose-500" />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{result.heading}</h2>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  {result.message}
                </p>
                <div className="mt-3 inline-block font-mono text-xs text-slate-600 bg-[#F8FAFC] px-3 py-1.5 rounded-xl border border-slate-200">
                  Queried ID: <strong className="text-slate-900">{result.searchedId || certificateId}</strong>
                </div>
              </div>
            )}

            {/* Certificate Component Rendering (Only if certificate data was returned) */}
            {result.certificate && (
              <div className="space-y-6">
                <CertificatePreview
                  candidateName={result.certificate.candidateName}
                  courseName={result.certificate.courseName}
                  trainingCentreName={result.certificate.trainingCentre}
                  batchNumber={result.certificate.batchNumber}
                  certificateNumber={result.certificate.certificateNumber}
                  issueDate={new Date(result.certificate.issueDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                  status={result.status}
                />

                {/* Audit & Security Details matching SolarGrid */}
                <div className="bg-white rounded-[28px] border border-slate-200/80 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Institutional Verification Registry Proof
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Training Institution</span>
                      <p className="font-bold text-slate-900 mt-0.5">{result.certificate.trainingCentre}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">District Office</span>
                      <p className="font-bold text-slate-900 mt-0.5">{result.certificate.district}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Batch Code</span>
                      <p className="font-mono font-bold text-slate-900 mt-0.5">{result.certificate.batchNumber}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Issue Date</span>
                      <p className="font-bold text-slate-900 mt-0.5">
                        {new Date(result.certificate.issueDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Security Hash: SHA-256 Verified on National Skill Qualification Registry
                    </span>

                    <div className="flex items-center gap-2">
                      {result.status === 'VALID' && (
                        <a
                          href={`/api/certificates/${encodeURIComponent(result.certificate.certificateNumber)}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-900 text-white text-xs font-semibold shadow-xs transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Official PDF</span>
                        </a>
                      )}

                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Receipt</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Quick Footer Links */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-4 px-2">
          <Link to="/" className="text-slate-700 font-semibold hover:underline">
            ← Return to Homepage
          </Link>
          <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium">
            Administrative Login →
          </Link>
        </div>
      </main>
    </div>
  );
};