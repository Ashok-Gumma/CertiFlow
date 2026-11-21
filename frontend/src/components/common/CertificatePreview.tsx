import React from 'react';
import { Award, QrCode, CheckCircle2, ShieldCheck, Printer, Download } from 'lucide-react';

interface CertificatePreviewProps {
  candidateName?: string;
  courseName?: string;
  trainingCentreName?: string;
  batchNumber?: string;
  certificateNumber?: string;
  issueDate?: string;
  status?: 'VALID' | 'REVOKED';
  interactive?: boolean;
  specimen?: boolean;
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  candidateName,
  courseName,
  trainingCentreName,
  batchNumber,
  certificateNumber,
  issueDate,
  status = 'VALID',
  specimen = false,
}) => {
  const finalCandidateName = specimen
    ? '[ CANDIDATE FULL NAME ]'
    : (candidateName || 'Candidate Name');

  const finalCourseName = specimen
    ? (courseName || 'NSQF National Qualification Program')
    : (courseName || 'Vocational Skill Qualification');

  const finalCentreName = specimen
    ? (trainingCentreName || 'Accredited National Training Institute')
    : (trainingCentreName || 'Accredited Vocational Institute');

  const finalBatchNumber = specimen
    ? (batchNumber || 'CF/2026/••••/•••')
    : (batchNumber || 'CF/2026/BATCH/001');

  const finalCertificateNumber = specimen
    ? (certificateNumber || 'CF/2026/••••/•••••••')
    : (certificateNumber || 'CF/2026/0000/00/000000');

  const finalIssueDate = specimen
    ? (issueDate || 'Verified Upon Official Issue')
    : (issueDate || '21 Nov 2026');
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Official Sovereign Government Certificate Sheet */}
      <div className="relative bg-[#FCFDFD] rounded-2xl p-3.5 sm:p-5 shadow-[0_4px_30px_rgba(0,0,0,0.08)] border-2 border-[#B8860B]/70 overflow-hidden select-none text-slate-900 font-serif">
        {/* Anti-tamper Security Holographic Ribbon */}
        <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-b from-[#142652] via-[#B8860B] to-[#10B981]" />

        {/* Ambient National Crest Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <Award className="w-[360px] h-[360px] text-slate-900" />
        </div>

        {/* Inner Classical Ornate Double Border */}
        <div className="border border-[#142652]/40 rounded-xl p-3 sm:p-4 relative bg-gradient-to-b from-white via-[#FCFDFE] to-white shadow-inner">
          {/* Classical Corner Knot Accents */}
          <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-[#B8860B]" />
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-[#B8860B]" />
          <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-[#B8860B]" />
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-[#B8860B]" />

          {/* Micro-security Header Ribbon (No state name, purely sovereign) */}
          <div className="text-center pb-2.5 border-b border-slate-200/90 font-sans">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[9px] font-bold text-slate-800 uppercase tracking-widest mb-1.5">
              DIRECTORATE GENERAL OF VOCATIONAL TRAINING & APPRENTICESHIP
            </div>
            <h4 className="text-xs sm:text-sm font-black text-[#0D1C3D] tracking-wider uppercase font-serif">
              National Vocational Qualification Authority
            </h4>
            <p className="text-[9.5px] text-slate-500 tracking-wide font-mono mt-0.5">
              National Skills Qualifications Framework • NSQF Level 5 Standard
            </p>
            {specimen && (
              <div className="mt-1">
                <span className="inline-block px-2 py-0.5 rounded-md bg-amber-50 border border-amber-300 text-[#B8860B] text-[8px] font-bold font-mono uppercase tracking-wider">
                  ★ OFFICIAL SOVEREIGN CREDENTIAL SPECIMEN ★
                </span>
              </div>
            )}
          </div>

          {/* Title & Qualification Standard */}
          <div className="text-center mt-3 mb-2">
            <h2 className="text-base sm:text-lg font-black text-[#0D1C3D] uppercase tracking-wide font-serif">
              Certificate of Skill Competency
            </h2>
            <p className="text-[10px] text-[#B8860B] font-semibold italic mt-0.5">
              Conferred upon official multi-tier assessment and institutional verification
            </p>
          </div>

          {/* Candidate Name Section */}
          <div className="text-center my-3">
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block font-sans">
              This is to officially certify that
            </span>
            <h3
              className={`text-lg sm:text-2xl font-black tracking-tight font-serif mt-1 ${
                specimen ? 'text-slate-500 font-mono tracking-widest' : 'text-slate-900'
              }`}
            >
              {finalCandidateName}
            </h3>
            <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-[#B8860B] to-transparent mx-auto mt-1" />
          </div>

          {/* Qualification Statement */}
          <div className="text-center mb-3 font-sans">
            <p className="text-[11px] sm:text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              has successfully completed all prescribed coursework, practical competencies, and standardized evaluations in
            </p>
            <p className="text-sm sm:text-base font-extrabold text-[#0D1C3D] mt-1 font-serif">
              {finalCourseName}
            </p>
          </div>

          {/* Institutional Audit Details Grid */}
          <div className="bg-[#F8FAFC] rounded-xl p-2.5 sm:p-3 border border-slate-200/90 grid grid-cols-3 gap-2 text-center text-xs mb-3.5 font-sans">
            <div>
              <span className="text-[8px] sm:text-[8.5px] text-slate-400 uppercase font-bold tracking-wider block">Training Institution</span>
              <span className="font-bold text-slate-800 text-[10px] sm:text-[11px] truncate block" title={finalCentreName}>
                {finalCentreName}
              </span>
            </div>
            <div>
              <span className="text-[8px] sm:text-[8.5px] text-slate-400 uppercase font-bold tracking-wider block">Batch Identifier Code</span>
              <span className="font-mono font-bold text-[#0D1C3D] text-[10px] sm:text-[11px] block">{finalBatchNumber}</span>
            </div>
            <div>
              <span className="text-[8px] sm:text-[8.5px] text-slate-400 uppercase font-bold tracking-wider block">Assessment Performance</span>
              <span className="font-bold text-[#B8860B] text-[10px] sm:text-[11px] block">
                {specimen ? 'Certified Merit (Grade A)' : 'Grade A (Exemplary Merit)'}
              </span>
            </div>
          </div>

          {/* Footer: QR Code, Sovereign Gold Seal, Dual Signatures */}
          <div className="pt-2.5 border-t border-slate-200/80 grid grid-cols-12 items-center gap-2 font-sans w-full">
            {/* Left: QR Code with live verification tag (col-span-5) */}
            <div className="col-span-5 flex items-center gap-2 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white p-1 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                <QrCode className="w-8 h-8 sm:w-9 sm:h-9 text-[#0D1C3D]" />
              </div>
              <div className="min-w-0 text-left text-[8.5px]">
                <span className="text-[7px] font-mono text-slate-400 uppercase block tracking-wider truncate">CERTIFICATE SERIAL</span>
                <span className="font-mono font-bold text-[8px] sm:text-[8.5px] text-slate-900 block truncate">
                  {finalCertificateNumber}
                </span>
                <span className="text-[7.5px] text-slate-500 font-mono block truncate">
                  Issued: {finalIssueDate}
                </span>
                <span className="inline-flex items-center gap-1 text-[7.5px] text-emerald-600 font-semibold truncate">
                  <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{specimen ? 'Registry Template' : 'Sovereign Hash Valid'}</span>
                </span>
              </div>
            </div>

            {/* Center: Minimal Gold Embossed Sovereign Seal (col-span-2) */}
            <div className="col-span-2 flex justify-center">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-amber-100 via-amber-300 to-amber-600 flex flex-col items-center justify-center border-2 border-[#B8860B] text-[#5C4308] shadow-sm shrink-0">
                <span className="text-[5px] font-black uppercase tracking-tight">NSQF</span>
                <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#7A5B0B] my-[-1px]" />
                <span className="text-[4.5px] font-black uppercase tracking-tight">OFFICIAL SEAL</span>
              </div>
            </div>

            {/* Right: Dual Official Signatures (col-span-5) */}
            <div className="col-span-5 flex items-end justify-end gap-2 text-center text-[8px] min-w-0">
              {/* District Officer Signature (Dev) */}
              <div className="flex-1 min-w-0 max-w-[85px]">
                <svg className="w-10 sm:w-12 h-3.5 text-[#142652] mx-auto mb-0.5" viewBox="0 0 90 25" fill="none" stroke="currentColor">
                  <path d="M5 18 C15 6, 28 22, 45 10 C60 2, 75 16, 85 7" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M25 14 C35 10, 40 20, 55 12" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <div className="w-full border-t border-slate-400 mx-auto my-0.5" />
                <span className="font-bold text-slate-900 block text-[7.5px] truncate">Dev</span>
                <span className="text-[#0D1C3D] font-semibold block text-[6.5px] leading-tight truncate">District Skill Officer</span>
                <span className="text-slate-400 block text-[6px] leading-tight truncate">Vocational Auth.</span>
              </div>

              {/* State Director Signature (Farah) */}
              <div className="flex-1 min-w-0 max-w-[85px]">
                <svg className="w-10 sm:w-12 h-3.5 text-[#142652] mx-auto mb-0.5" viewBox="0 0 90 25" fill="none" stroke="currentColor">
                  <path d="M5 15 C20 4, 32 24, 52 8 C68 2, 78 18, 87 10" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M30 12 C45 6, 55 22, 70 14" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <div className="w-full border-t border-slate-400 mx-auto my-0.5" />
                <span className="font-bold text-slate-900 block text-[7.5px] truncate">Farah</span>
                <span className="text-[#0D1C3D] font-semibold block text-[6.5px] leading-tight truncate">State Mission Director</span>
                <span className="text-slate-400 block text-[6px] leading-tight truncate">Vocational Cert.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revoked watermark banner if revoked */}
        {status === 'REVOKED' && (
          <div className="absolute inset-0 bg-rose-950/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
            <div className="px-10 py-4 bg-rose-700/95 text-white font-mono font-black text-2xl uppercase tracking-widest border-4 border-white rotate-[-12deg] shadow-2xl">
              ⚠️ REVOKED & VOID
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
