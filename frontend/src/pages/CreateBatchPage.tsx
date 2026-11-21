import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Papa from 'papaparse';
import {
  Layers,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Download,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  FileText,
  Lock,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { District, TrainingCentre } from '../types';

const NATIONAL_QUALIFICATIONS = [
  { title: 'Java Enterprise Full Stack Development', code: 'JAVA', level: 'NSQF Level 5' },
  { title: 'Cloud Infrastructure & DevOps Engineering', code: 'CLOUD', level: 'NSQF Level 6' },
  { title: 'Cybersecurity Operations & Threat Defense Analyst', code: 'CYBER', level: 'NSQF Level 6' },
  { title: 'Artificial Intelligence & Machine Learning Specialist', code: 'AIML', level: 'NSQF Level 6' },
  { title: 'Data Science & Business Intelligence Analytics', code: 'DATA', level: 'NSQF Level 5' },
  { title: 'Industrial Automation, Robotics & IoT Technician', code: 'ROBO', level: 'NSQF Level 5' },
  { title: 'Electric Vehicle (EV) Powertrain & Battery Systems Technician', code: 'EVTEC', level: 'NSQF Level 4' },
  { title: 'Renewable Solar Energy & Smart Grid Systems Specialist', code: 'SOLAR', level: 'NSQF Level 5' },
  { title: 'Full Stack MERN Software Developer', code: 'MERN', level: 'NSQF Level 5' },
  { title: 'Healthcare Diagnostics & Medical Biomedical Equipment Specialist', code: 'MEDEQ', level: 'NSQF Level 5' },
  { title: 'Advanced CNC Precision Machining & Additive Manufacturing', code: 'CNC', level: 'NSQF Level 4' },
  { title: 'FinTech, Blockchain Architecture & Digital Banking Systems', code: 'FINTECH', level: 'NSQF Level 6' },
];

export const CreateBatchPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { fetchNotifications } = useNotifications();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [districts, setDistricts] = useState<District[]>([]);
  const [trainingCentres, setTrainingCentres] = useState<TrainingCentre[]>([]);
  const [createdBatchId, setCreatedBatchId] = useState<string | null>(null);

  // Step 1: Batch Info
  const [batchName, setBatchName] = useState('Java Full Stack Certification Batch 2026');
  const [courseName, setCourseName] = useState('Java Enterprise Full Stack Development');
  const [courseCode, setCourseCode] = useState('JAVA');
  const [selectedCentre, setSelectedCentre] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [startDate, setStartDate] = useState('2026-01-15');
  const [endDate, setEndDate] = useState('2026-04-15');

  // Step 2 & 3: CSV & Validation
  const [file, setFile] = useState<File | null>(null);
  const [csvRawText, setCsvRawText] = useState<string>('');
  const [validating, setValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<{
    totalRows: number;
    validCount: number;
    invalidCount: number;
    invalidRows: { row: number; reason: string; data: any }[];
    validRows?: any[];
  } | null>(null);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const res = await api.get('/lookups');
        if (res.data.success) {
          setDistricts(res.data.districts);
          setTrainingCentres(res.data.trainingCentres);

          if (user?.trainingCentreId) {
            setSelectedCentre(user.trainingCentreId);
          } else if (res.data.trainingCentres.length > 0) {
            setSelectedCentre(res.data.trainingCentres[0].id);
          }

          if (user?.districtId) {
            setSelectedDistrict(user.districtId);
          } else if (res.data.districts.length > 0) {
            setSelectedDistrict(res.data.districts[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchLookups();
  }, [user]);

  const isTrainerRole = user?.role === 'TRAINING_CENTRE';
  const assignedCentre = trainingCentres.find((tc) => tc.id === (user?.trainingCentreId || selectedCentre)) || user?.trainingCentre;
  const assignedDistrict = districts.find((d) => d.id === (assignedCentre?.districtId || user?.districtId || selectedDistrict)) || user?.district;

  // Handle Step 1 Submit: Create DRAFT Batch
  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const centreIdToSend = isTrainerRole && user?.trainingCentreId ? user.trainingCentreId : selectedCentre;
      const districtIdToSend = isTrainerRole ? (assignedCentre?.districtId || user?.districtId || selectedDistrict) : selectedDistrict;

      const res = await api.post('/batches', {
        batchName,
        courseName,
        courseCode,
        trainingCentreId: centreIdToSend,
        districtId: districtIdToSend,
        trainingStartDate: startDate,
        trainingEndDate: endDate,
      });

      if (res.data.success) {
        setCreatedBatchId(res.data.batch.id);
        setCurrentStep(2);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Failed to create batch');
    }
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvRawText(event.target?.result as string);
      };
      reader.readAsText(selected);
    }
  };

  // Run Backend Validation & Transactional Upload
  const handleValidateAndUpload = async () => {
    if (!createdBatchId || !file) {
      setErrorMessage('Please select a CSV file to validate.');
      return;
    }

    setValidating(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(`/batches/${createdBatchId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setValidationResult({
          totalRows: res.data.validation.totalRows,
          validCount: res.data.validation.validCount,
          invalidCount: 0,
          invalidRows: [],
        });
        setCurrentStep(3);
      }
    } catch (err: any) {
      if (err.response?.status === 422 && err.response?.data?.validation) {
        setValidationResult(err.response.data.validation);
        setCurrentStep(3);
      } else {
        setErrorMessage(err.response?.data?.error || 'Validation failed to execute on server.');
      }
    } finally {
      setValidating(false);
    }
  };

  // Final Step: Submit for Approval
  const handleSubmitBatch = async () => {
    if (!createdBatchId) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/batches/${createdBatchId}/submit`);
      if (res.data.success) {
        fetchNotifications();
        navigate(`/batches/${createdBatchId}`);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Failed to submit batch for approval');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Batch Details' },
    { num: 2, title: 'Upload CSV' },
    { num: 3, title: 'Row Validation' },
    { num: 4, title: 'Review & Submit' },
  ];

  if (user?.role !== 'TRAINING_CENTRE') {
    return (
      <div className="max-w-lg mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-[28px] border border-slate-200/80 p-8 sm:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Access Restricted: Batch Creation</h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Under official governance rules, only accredited Training Centres can create batches and intake candidate rosters.
              Reviewing officers (District, Quality, and State) inspect and authorize batches in the Approval Center.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-900 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Return to Workspace Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header matching SolarGrid */}
      <div>
        <Link to="/batches" className="text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 inline-block">
          ← Back to Batches
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Create Candidate Batch
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Step-by-step wizard to initialize training batch metadata, upload CSV roster, and submit for district review.
        </p>
      </div>

      {/* 4-Step Stepper Header matching SolarGrid */}
      <div className="bg-white rounded-[28px] border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {steps.map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div key={s.num} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-[#0F172A] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? '✓' : s.num}
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Step {s.num}</span>
                  <p
                    className={`text-xs font-semibold ${
                      isCurrent ? 'text-slate-900 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {s.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: Batch Info */}
      {currentStep === 1 && (
        <div className="bg-white rounded-[28px] border border-slate-200/80 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <h2 className="text-base font-bold text-slate-900 mb-1">Step 1: Batch Information</h2>
          <p className="text-xs text-slate-500 mb-6">Enter program, training centre, and duration metadata.</p>

          <form onSubmit={handleCreateDraft} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Name</label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  required
                  placeholder="e.g. Java Enterprise Full Stack 2026 Cohort A"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  National Qualification Title (NSQF Standards)
                </label>
                <select
                  value={
                    NATIONAL_QUALIFICATIONS.some((q) => q.title === courseName)
                      ? courseName
                      : 'CUSTOM'
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val !== 'CUSTOM') {
                      const match = NATIONAL_QUALIFICATIONS.find((q) => q.title === val);
                      if (match) {
                        setCourseName(match.title);
                        setCourseCode(match.code);
                        setBatchName(`${match.title} Certification Batch 2026`);
                      }
                    }
                  }}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                >
                  <optgroup label="Standard All-India NSQF Qualifications">
                    {NATIONAL_QUALIFICATIONS.map((q) => (
                      <option key={q.code} value={q.title}>
                        {q.title} ({q.level} • {q.code})
                      </option>
                    ))}
                  </optgroup>
                  <option value="CUSTOM">Custom / Other Qualification...</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Qualification Title <span className="text-slate-400 font-normal">(Editable)</span>
                </label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                  placeholder="e.g. Java Enterprise Full Stack Development"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code (Prefix)</label>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. JAVA"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                />
              </div>

              {isTrainerRole ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Accredited Training Centre</label>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                      <Lock className="w-3 h-3 text-slate-400" /> Locked to Account
                    </span>
                  </div>
                  <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {assignedCentre?.name || user?.trainingCentre?.name || 'National Skill Training Institute (NSTI Central)'}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        Code: {assignedCentre?.code || user?.trainingCentre?.code || 'NSTI-IND-001'}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Accredited
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Training Centre</label>
                  <select
                    value={selectedCentre}
                    onChange={(e) => setSelectedCentre(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                  >
                    {trainingCentres.map((tc) => (
                      <option key={tc.id} value={tc.id}>
                        {tc.name} ({tc.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isTrainerRole ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Designated District Jurisdiction</label>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                      <Lock className="w-3 h-3 text-slate-400" /> Auto-Assigned
                    </span>
                  </div>
                  <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {assignedDistrict?.name || user?.district?.name || 'Central Delhi'}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        Code: {assignedDistrict?.code || user?.district?.code || 'DEL'}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                      Jurisdiction
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">District Jurisdiction</label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                  >
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Training Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Training End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-[#F8FAFC] text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-900 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                <span>Save Draft & Proceed to CSV</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2: CSV Upload */}
      {currentStep === 2 && (
        <div className="bg-white rounded-[28px] border border-slate-200/80 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 2: Upload Candidates CSV</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload candidate roster. Expected format: Candidate Name, Phone Number, Email, Course.
              </p>
            </div>

            <a
              href="/api/batches/sample-csv"
              download="certiflow_sample.csv"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download Sample CSV</span>
            </a>
          </div>

          {/* Drag & Drop Area */}
          <div className="border-2 border-dashed border-slate-300 rounded-[24px] p-8 text-center bg-[#F8FAFC] hover:bg-slate-100/60 transition-colors">
            <UploadCloud className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-xs font-bold text-slate-800">Drag and drop candidate CSV file here</h3>
            <p className="text-[11px] text-slate-500 mt-0.5 mb-3">Accepts standard .csv spreadsheets</p>

            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-900 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors">
              <span>Browse CSV File</span>
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </label>

            {file && (
              <div className="mt-3 p-2.5 rounded-xl bg-white border border-slate-200 max-w-sm mx-auto flex items-center justify-between text-xs text-slate-700">
                <span className="font-medium truncate">{file.name}</span>
                <span className="text-slate-400">({Math.round(file.size / 1024)} KB)</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              onClick={handleValidateAndUpload}
              disabled={!file || validating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-900 text-white font-semibold text-xs disabled:opacity-50 transition-colors shadow-xs"
            >
              {validating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Validating CSV...</span>
                </>
              ) : (
                <>
                  <span>Validate CSV Records</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Validation Results */}
      {currentStep === 3 && validationResult && (
        <div className="bg-white rounded-[28px] border border-slate-200/80 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Step 3: Validation Report</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict row-level schema inspection. If any row is invalid, the entire file is rejected for correction.
            </p>
          </div>

          {/* Validation Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 text-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Candidates</span>
              <p className="text-xl font-black mt-1 text-slate-900">{validationResult.totalRows}</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-800">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Valid Candidates</span>
              <p className="text-xl font-black mt-1 text-emerald-700">{validationResult.validCount}</p>
            </div>

            <div
              className={`p-4 rounded-2xl border ${
                validationResult.invalidCount > 0
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider">Invalid Rows</span>
              <p className="text-xl font-black mt-1">{validationResult.invalidCount}</p>
            </div>
          </div>

          {/* If there are errors: Display exact row-level breakdown */}
          {validationResult.invalidCount > 0 ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Upload Rejected: Fix the row errors below and re-upload the CSV.</span>
              </div>
              <p className="text-[11px] text-rose-700">
                To guarantee zero corrupted records, CertiFlow requires 100% of candidate rows to be valid before inserting.
              </p>
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {validationResult.invalidRows.map((err, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-white border border-rose-200 text-[11px] font-mono">
                    <span className="font-bold text-rose-700">Row {err.row}:</span> {err.reason}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold">All {validationResult.validCount} candidates passed validation!</h4>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Records have been securely staged in PostgreSQL. Ready to submit for district review.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Re-upload CSV</span>
            </button>

            {validationResult.invalidCount === 0 && (
              <button
                onClick={() => setCurrentStep(4)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-900 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <span>Proceed to Final Review</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: Review and Submit */}
      {currentStep === 4 && (
        <div className="bg-white rounded-[28px] border border-slate-200/80 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Step 4: Review and Submit Batch</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirm batch specifications before locking and routing to District Officers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Batch Name</span>
              <p className="font-bold text-slate-900 mt-0.5">{batchName}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Course & Code</span>
              <p className="font-bold text-slate-900 mt-0.5">{courseName} ({courseCode})</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Candidate Count</span>
              <p className="font-bold text-emerald-600 text-sm mt-0.5">{validationResult?.validCount} Candidates</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Training Period</span>
              <p className="font-medium text-slate-800 mt-0.5">{startDate} to {endDate}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs">
            ℹ️ Submitting this batch will immediately notify District Officers (Dev, Meera, Kabir) for the required 2
            distinct sign-offs.
            {validationResult && validationResult.validCount >= 50 && (
              <span className="block mt-1 font-semibold text-slate-900">
                ⚠️ Notice: Candidate count is ≥ 50. Quality Team (Neha) review will be mandatory before State Office approval.
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              onClick={handleSubmitBatch}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-900 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting Batch...</span>
                </>
              ) : (
                <>
                  <span>Submit Batch for Review</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
