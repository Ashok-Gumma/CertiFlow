import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Award,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Users,
  Search,
  Sparkles,
  QrCode,
  Zap,
  Lock,
  Layers,
  ChevronRight,
  Check,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { CertificatePreview } from '../components/common/CertificatePreview';
import {
  NotionBatchIntake,
  NotionTwoOfficerConsensus,
  NotionQualityAudit,
  NotionMobileDelivery,
  NotionOfficerDesk,
} from '../components/illustrations/NotionIllustrations';

export const LandingPage: React.FC = () => {
  const [certInput, setCertInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certInput.trim()) return;

    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      navigate(`/verify/${encodeURIComponent(certInput.trim())}`);
    }, 600);
  };

  const steps = [
    {
      num: '01',
      title: 'Batch Intake',
      subtitle: 'Training Centre',
      desc: 'Training Centres upload candidate rosters with strict row-level CSV schema validation. If even one record fails, the entire batch is rejected.',
      illustration: NotionBatchIntake,
    },
    {
      num: '02',
      title: 'District Consensus',
      subtitle: 'Two Distinct Officers',
      desc: 'District review requires 2 distinct officers to physically authorize. Multi-signoff consensus is strictly enforced in the database.',
      illustration: NotionTwoOfficerConsensus,
    },
    {
      num: '03',
      title: 'Quality & State',
      subtitle: 'Audit & Authorization',
      desc: 'Quality team scrutinizes large batches (50+ candidates). State Director provides final cryptographic authorization.',
      illustration: NotionQualityAudit,
    },
    {
      num: '04',
      title: 'Instant Issuance',
      subtitle: 'Public Verification',
      desc: 'Candidates receive secure credential links via WhatsApp simulation without needing passwords. Employers scan QR codes to verify authenticity.',
      illustration: NotionMobileDelivery,
    },
  ];

  const features = [
    {
      icon: FileCheck,
      title: 'All-or-Nothing Ingestion',
      desc: 'Zero corrupt records in the state database. Errors in candidate names, emails, or phone numbers reject the whole file transactionally.',
      tag: 'Integrity',
    },
    {
      icon: Lock,
      title: 'Two-Officer Consensus',
      desc: 'District approvals require 2 distinct officers to authorize. Concurrency-safe unique database constraints prevent single-officer bypass.',
      tag: 'Governance',
    },
    {
      icon: Zap,
      title: 'High-Throughput Issuance',
      desc: 'Instant state sign-off triggers background queues generating high-resolution vector PDFs with embedded verification QR codes.',
      tag: 'Performance',
    },
    {
      icon: ShieldCheck,
      title: 'Live Public Registry',
      desc: 'Always checks the live PostgreSQL database directly. Instantly displays official status, candidate details, or revocation warnings.',
      tag: 'Authenticity',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col font-sans text-slate-900 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Heading and CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-6 space-y-5 text-center lg:text-left"
            >
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-800 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>National Skills Authority • Sovereign Credential Registry</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Skills deserve credentials{' '}
                <span className="text-slate-900 underline decoration-amber-400 decoration-wavy underline-offset-8">
                  you can trust.
                </span>
              </h1>

              {/* Description */}
              <p className="text-base text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                CertiFlow powers sovereign technical qualification integrity: from strict CSV roster intake and multi-officer
                district consensus to automated PDF generation and public verification.
              </p>

              {/* Action Buttons matching SolarGrid */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold bg-[#0F172A] hover:bg-slate-900 text-white shadow-xs transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Launch Operational Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#verify"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Public Registry Search</span>
                </a>
              </div>

              {/* Verified Trust Stats */}
              <div className="pt-5 grid grid-cols-3 gap-4 border-t border-slate-200 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <span className="text-xl font-black text-slate-900 tracking-tight block">100%</span>
                  <span className="text-[10px] text-slate-500 font-medium">PostgreSQL Grounded</span>
                </div>
                <div>
                  <span className="text-xl font-black text-slate-900 tracking-tight block">2-Officer</span>
                  <span className="text-[10px] text-slate-500 font-medium">District Consensus</span>
                </div>
                <div>
                  <span className="text-xl font-black text-slate-900 tracking-tight block">Zero Login</span>
                  <span className="text-[10px] text-slate-500 font-medium">For Candidates & Public</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Clean Credential Preview (Specimen Template) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:col-span-6 relative flex justify-center w-full"
            >
              <div className="w-full relative">
                <CertificatePreview
                  specimen={true}
                  courseName="National Vocational Qualification Standard"
                  trainingCentreName="National Skill Training Institute"
                  status="VALID"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4-Step Governance Pipeline */}
      <section id="how-it-works" className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              GOVERNANCE ARCHITECTURE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              A strict, accountable 4-stage verification pipeline
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Every stage enforces database uniqueness, immutable audit logging, and role separation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {steps.map((step) => {
              const StepIllustration = step.illustration;
              return (
                <div
                  key={step.num}
                  className="p-6 rounded-[28px] bg-[#F8FAFC] border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                        STAGE {step.num}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">Strict Gate</span>
                    </div>

                    <div className="h-32 flex items-center justify-center my-3 group-hover:scale-105 transition-transform">
                      <StepIllustration className="w-28 h-28" />
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-0.5">{step.title}</h3>
                    <span className="text-[10px] font-semibold text-slate-500 block mb-2">{step.subtitle}</span>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">{step.desc}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Audit Trail Logged</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Notion-Styled Officer Desk Showcase */}
      <section className="py-14 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[32px] border border-slate-200/80 p-8 sm:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#F8FAFC] border border-slate-200 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>OFFICER-CENTRIC WORKSPACE DESIGN</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Role isolation crafted for daily skilling operations
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Every officer sees only the tools, batches, and candidate records they are legally authorized to review. Training Centres manage batch CSV intake, District Officers collaborate for 2-officer consensus, Quality Teams scrutinize large batches, and State Directors sign credentials into the immutable public registry.
              </p>
              <div className="flex flex-wrap gap-2 pt-2 justify-center lg:justify-start">
                <span className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-700 text-xs font-semibold">
                  ✓ Strict Separation of Duties
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-700 text-xs font-semibold">
                  ✓ Concurrency-Safe Sign-Offs
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-700 text-xs font-semibold">
                  ✓ Instant QR Public Verification
                </span>
              </div>
            </div>
            <div className="shrink-0 flex items-center justify-center p-2">
              <NotionOfficerDesk className="w-56 h-56 sm:w-64 sm:h-64 drop-shadow-xs" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              KEY CAPABILITIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Enterprise security with intuitive operational workflows
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-[28px] bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3"
              >
                <div className="w-9 h-9 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center shadow-xs">
                  <f.icon className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Public Registry Search Box */}
      <section id="verify" className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1">
            Verify Any Credential Online
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Employers, verification agencies, and candidates can check credential status directly against the live state database.
          </p>

          <form onSubmit={handleVerifySubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                placeholder="Enter Certificate ID (e.g. CF/2026/JAVA/...)"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0F172A] bg-[#F8FAFC] focus:bg-white text-slate-900 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isScanning}
              className="px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-900 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              {isScanning ? 'Verifying...' : 'Verify Now'}
            </button>
          </form>

          <p className="text-[11px] text-slate-400 mt-3 font-mono">
            Sample Valid ID: <span className="font-bold text-slate-700">CF/2026/CLOUD/11/0001406</span>
          </p>
        </div>
      </section>
    </div>
  );
};
