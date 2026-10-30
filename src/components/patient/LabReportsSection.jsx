import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Activity,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  X,
  FileCheck,
  Calendar,
  Sparkles,
  Download,
  Eye,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';

const COMMON_TEST_PRESETS = [
  {
    name: "Fasting Blood Sugar & HbA1c Panel",
    category: "Diabetes & Metabolism",
    keyMetrics: [
      { param: "Fasting Blood Glucose", value: "95 mg/dL", reference: "70 - 99 mg/dL", status: "Optimal" },
      { param: "HbA1c Glycated Hemoglobin", value: "5.5%", reference: "< 5.7%", status: "Optimal" }
    ],
    summary: "Normal fasting glycemic control."
  },
  {
    name: "Complete Blood Count (CBC) with Platelets",
    category: "Hematology",
    keyMetrics: [
      { param: "Hemoglobin (Hb)", value: "13.5 g/dL", reference: "12.0 - 15.5 g/dL", status: "Optimal" },
      { param: "Total WBC Count", value: "6,500 /uL", reference: "4,000 - 11,000 /uL", status: "Optimal" },
      { param: "Platelet Count", value: "250,000 /uL", reference: "150,000 - 450,000 /uL", status: "Optimal" }
    ],
    summary: "Blood cell counts and hemoglobin within healthy reference ranges."
  },
  {
    name: "Lipid Profile (Cholesterol & Triglycerides)",
    category: "Cardiovascular Health",
    keyMetrics: [
      { param: "Total Cholesterol", value: "185 mg/dL", reference: "< 200 mg/dL", status: "Desirable" },
      { param: "HDL (Good)", value: "52 mg/dL", reference: "> 50 mg/dL", status: "Optimal" },
      { param: "Triglycerides", value: "140 mg/dL", reference: "< 150 mg/dL", status: "Normal" }
    ],
    summary: "Lipid panel parameters within target ranges."
  },
  {
    name: "Thyroid Stimulating Hormone (TSH)",
    category: "Endocrinology",
    keyMetrics: [
      { param: "Ultrasensitive TSH", value: "2.8 uIU/mL", reference: "0.45 - 4.50 uIU/mL", status: "Normal" }
    ],
    summary: "Euthyroid state. Normal pituitary-thyroid axis function."
  },
  {
    name: "Kidney Function Test (Creatinine & Urea)",
    category: "Renal Health",
    keyMetrics: [
      { param: "Serum Creatinine", value: "0.9 mg/dL", reference: "0.6 - 1.2 mg/dL", status: "Normal" },
      { param: "Blood Urea Nitrogen", value: "14 mg/dL", reference: "7 - 20 mg/dL", status: "Normal" }
    ],
    summary: "Renal clearance parameters preserved."
  }
];

export default function LabReportsSection({ customPatientId = null, customPatientName = null }) {
  const { userProfile, role } = useAuth();
  const { labReports, addLabReport, deleteLabReport } = useData();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedReportForView, setSelectedReportForView] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New report form state
  const [newTestName, setNewTestName] = useState(COMMON_TEST_PRESETS[0].name);
  const [newCategory, setNewCategory] = useState(COMMON_TEST_PRESETS[0].category);
  const [newLabName, setNewLabName] = useState('Apna Community Diagnostic Center (SDG 3)');
  const [newTestDate, setNewTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStatus, setNewStatus] = useState('Normal');
  const [newSummary, setNewSummary] = useState(COMMON_TEST_PRESETS[0].summary);
  const [newParamName, setNewParamName] = useState('Primary Metric');
  const [newParamVal, setNewParamVal] = useState('Normal');
  const [newParamRef, setNewParamRef] = useState('Standard Range');
  const [newNotes, setNewNotes] = useState('');

  // Target patient identification
  const effectivePatientId = customPatientId || userProfile?.uid || 'guest_patient';
  const effectivePatientName = customPatientName || userProfile?.name || 'Community Patient';
  const effectivePatientEmail = userProfile?.email || '';

  // Filter reports for current patient (or all if admin/doctor looking across)
  const patientLabReports = useMemo(() => {
    return (labReports || []).filter(rep => {
      // If patient role, only show own reports
      if (role === 'patient') {
        const matchesUid = rep.patientId && userProfile?.uid && rep.patientId === userProfile.uid;
        const matchesEmail = rep.patientEmail && userProfile?.email && rep.patientEmail.toLowerCase() === userProfile.email.toLowerCase();
        const matchesName = rep.patientName && userProfile?.name && rep.patientName.toLowerCase() === userProfile.name.toLowerCase();
        if (!matchesUid && !matchesEmail && !matchesName) return false;
      } else if (customPatientId || customPatientName) {
        // Specific patient selected
        const matchesId = customPatientId && rep.patientId === customPatientId;
        const matchesName = customPatientName && rep.patientName?.toLowerCase() === customPatientName.toLowerCase();
        if (!matchesId && !matchesName) return false;
      }

      // Filter by category
      if (categoryFilter !== 'all' && rep.category !== categoryFilter) {
        return false;
      }

      // Filter by search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTest = rep.testName?.toLowerCase().includes(q);
        const matchesLab = rep.labName?.toLowerCase().includes(q);
        const matchesSummary = rep.summary?.toLowerCase().includes(q);
        if (!matchesTest && !matchesLab && !matchesSummary) return false;
      }

      return true;
    });
  }, [labReports, role, userProfile, customPatientId, customPatientName, categoryFilter, search]);

  const handleApplyPreset = (preset) => {
    setNewTestName(preset.name);
    setNewCategory(preset.category);
    setNewSummary(preset.summary);
    if (preset.keyMetrics?.[0]) {
      setNewParamName(preset.keyMetrics[0].param);
      setNewParamVal(preset.keyMetrics[0].value);
      setNewParamRef(preset.keyMetrics[0].reference);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    const newReport = {
      patientId: effectivePatientId,
      patientName: effectivePatientName,
      patientEmail: effectivePatientEmail,
      testName: newTestName,
      category: newCategory,
      labName: newLabName,
      testDate: newTestDate,
      status: newStatus,
      summary: newSummary,
      notes: newNotes,
      keyMetrics: [
        {
          param: newParamName,
          value: newParamVal,
          reference: newParamRef,
          status: newStatus === 'Normal' ? 'Optimal' : newStatus
        }
      ],
      doctorReviewStatus: 'Awaiting Doctor Review'
    };

    await addLabReport(newReport);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-5">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0F766E]/10 dark:bg-[#2DD4BF]/20 text-[#0F766E] dark:text-[#2DD4BF] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">
              Diagnostic Lab Reports &amp; Pathology Tests
            </h2>
          </div>
          <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA] mt-1">
            Access accredited pathology blood panels, glucose logs, and medical records attached to your health profile.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-[#F4F7F6] text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer self-start sm:self-center"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload / Log Lab Report</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-[#0F766E] text-[#F4F7F6] border-[#0F766E]'
                : 'bg-white dark:bg-[#121C21] text-[#5A7178] dark:text-[#9DB4BA] border-[#E0E7E5] dark:border-[#21333A]'
            }`}
          >
            All Reports ({patientLabReports.length})
          </button>
          <button
            onClick={() => setCategoryFilter('Diabetes & Metabolism')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              categoryFilter === 'Diabetes & Metabolism'
                ? 'bg-[#0F766E] text-[#F4F7F6] border-[#0F766E]'
                : 'bg-white dark:bg-[#121C21] text-[#5A7178] dark:text-[#9DB4BA] border-[#E0E7E5] dark:border-[#21333A]'
            }`}
          >
            Diabetes &amp; Sugar
          </button>
          <button
            onClick={() => setCategoryFilter('Hematology')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              categoryFilter === 'Hematology'
                ? 'bg-[#0F766E] text-[#F4F7F6] border-[#0F766E]'
                : 'bg-white dark:bg-[#121C21] text-[#5A7178] dark:text-[#9DB4BA] border-[#E0E7E5] dark:border-[#21333A]'
            }`}
          >
            Blood (CBC)
          </button>
          <button
            onClick={() => setCategoryFilter('Cardiovascular Health')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              categoryFilter === 'Cardiovascular Health'
                ? 'bg-[#0F766E] text-[#F4F7F6] border-[#0F766E]'
                : 'bg-white dark:bg-[#121C21] text-[#5A7178] dark:text-[#9DB4BA] border-[#E0E7E5] dark:border-[#21333A]'
            }`}
          >
            Lipid Profile
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#758D94] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search test or diagnostic center..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-[#121C21] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-xs text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] focus:outline-none focus:border-[#0F766E]"
          />
        </div>
      </div>

      {/* Reports Grid */}
      {patientLabReports.length === 0 ? (
        <div className="bg-[#F4F7F6] dark:bg-[#121C21] rounded-2xl border border-dashed border-[#CFDAD6] dark:border-[#21333A] p-10 text-center space-y-3">
          <FileText className="w-8 h-8 text-[#758D94] mx-auto opacity-60" />
          <h3 className="text-sm font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">
            No Diagnostic Reports Logged Yet
          </h3>
          <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA] max-w-sm mx-auto">
            You can upload or log blood tests, fasting glucose panels, and health documents to keep them organized for doctor consultations.
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F766E] hover:bg-[#115E59] text-[#F4F7F6] text-xs font-semibold rounded-xl cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Upload First Lab Test</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patientLabReports.map((rep) => {
            const isAlert = rep.status === 'Alert';
            const isBorderline = rep.status === 'Borderline';

            return (
              <div
                key={rep.id}
                className="bg-white dark:bg-[#121C21] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] p-5 shadow-xs space-y-3.5 hover:border-[#0F766E]/40 transition-colors"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-[#E0E7E5]/60 dark:border-[#21333A]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#2DD4BF] block">
                      {rep.category}
                    </span>
                    <h3 className="font-bold text-sm text-[#132226] dark:text-[#F4F7F6] font-heading mt-0.5">
                      {rep.testName}
                    </h3>
                    <p className="text-[11px] text-[#5A7178] dark:text-[#9DB4BA] mt-0.5">
                      {rep.labName}
                    </p>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                    isAlert
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200'
                      : isBorderline
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                  }`}>
                    {rep.status}
                  </span>
                </div>

                {/* Key Metrics Table */}
                {rep.keyMetrics && rep.keyMetrics.length > 0 && (
                  <div className="rounded-xl border border-[#E0E7E5]/60 dark:border-[#21333A] overflow-hidden text-xs">
                    <div className="bg-[#F4F7F6] dark:bg-[#19272D] px-3 py-1.5 flex justify-between font-semibold text-[10px] text-[#5A7178] dark:text-[#9DB4BA]">
                      <span>Parameter</span>
                      <span>Result &amp; Range</span>
                    </div>
                    <div className="divide-y divide-[#E0E7E5]/40 dark:divide-[#21333A] bg-white dark:bg-[#121C21]">
                      {rep.keyMetrics.map((km, idx) => (
                        <div key={idx} className="px-3 py-1.5 flex items-center justify-between">
                          <span className="font-medium text-[#132226] dark:text-[#F4F7F6]">{km.param}</span>
                          <div className="text-right">
                            <span className="font-bold font-mono text-[#0F766E] dark:text-[#2DD4BF]">{km.value}</span>
                            {km.reference && (
                              <span className="text-[10px] text-[#758D94] block font-normal">ref: {km.reference}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clinical Summary */}
                {rep.summary && (
                  <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA] leading-relaxed bg-[#F4F7F6]/60 dark:bg-[#19272D]/60 p-2.5 rounded-xl border border-[#E0E7E5]/40 dark:border-[#21333A]">
                    <strong>Interpretation:</strong> {rep.summary}
                  </p>
                )}

                {/* Footer and Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-[#E0E7E5]/60 dark:border-[#21333A] text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#758D94] dark:text-[#79949B]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Tested on: {rep.testDate}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedReportForView(rep)}
                      className="flex items-center gap-1 px-3 py-1 rounded-xl bg-[#F4F7F6] hover:bg-[#E0E7E5]/60 dark:bg-[#19272D] dark:hover:bg-[#21333A] text-[#132226] dark:text-[#F4F7F6] font-semibold border border-[#CFDAD6] dark:border-[#21333A] cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-[#0F766E] dark:text-[#2DD4BF]" />
                      <span>View Slip</span>
                    </button>
                    {role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => deleteLabReport(rep.id)}
                        className="text-rose-600 hover:text-rose-700 text-xs px-2 py-1 cursor-pointer"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: VIEW CERTIFIED LAB SLIP */}
      {selectedReportForView && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#121C21] w-full max-w-lg rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E7E5] dark:border-[#21333A]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0F766E] dark:text-[#2DD4BF]" />
                <h3 className="font-bold text-sm text-[#132226] dark:text-[#F4F7F6] font-heading">
                  Certified Clinical Laboratory Slip
                </h3>
              </div>
              <button
                onClick={() => setSelectedReportForView(null)}
                className="p-1 rounded-lg text-[#5A7178] hover:text-[#132226] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Lab Document Sheet */}
            <div
              id="printable-lab-report"
              className="p-6 bg-white dark:bg-[#0B1114] rounded-xl border border-[#CFDAD6] dark:border-[#21333A] space-y-4 text-xs text-[#132226] dark:text-[#F4F7F6]"
            >
              <div className="text-center pb-3 border-b border-[#E0E7E5] dark:border-[#21333A]">
                <h4 className="font-black text-base font-heading text-[#0F766E] dark:text-[#2DD4BF]">
                  APNA COMMUNITY DIAGNOSTIC UNIT
                </h4>
                <p className="text-[11px] text-[#5A7178] dark:text-[#9DB4BA]">
                  Department of Clinical Pathology &amp; Preventive Health (SDG 3)
                </p>
                <p className="text-[10px] text-[#758D94]">Accredited Primary Community Health Laboratory</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-lg bg-[#F4F7F6] dark:bg-[#19272D]">
                <div>
                  <p className="text-[#5A7178] dark:text-[#9DB4BA]">Patient Name:</p>
                  <p className="font-bold text-[#132226] dark:text-[#F4F7F6]">{selectedReportForView.patientName}</p>
                </div>
                <div>
                  <p className="text-[#5A7178] dark:text-[#9DB4BA]">Collection Date:</p>
                  <p className="font-bold font-mono">{selectedReportForView.testDate}</p>
                </div>
                <div>
                  <p className="text-[#5A7178] dark:text-[#9DB4BA]">Investigation:</p>
                  <p className="font-bold">{selectedReportForView.testName}</p>
                </div>
                <div>
                  <p className="text-[#5A7178] dark:text-[#9DB4BA]">Overall Status:</p>
                  <p className="font-bold text-[#0F766E] dark:text-[#2DD4BF]">{selectedReportForView.status}</p>
                </div>
              </div>

              {/* Table */}
              <div>
                <span className="font-bold uppercase tracking-wider text-[10px] text-[#5A7178] dark:text-[#9DB4BA] block mb-1.5">
                  Pathology Measured Findings:
                </span>
                <table className="w-full text-left border-collapse border border-[#E0E7E5] dark:border-[#21333A] text-xs">
                  <thead>
                    <tr className="bg-[#F4F7F6] dark:bg-[#19272D]">
                      <th className="p-2 border border-[#E0E7E5] dark:border-[#21333A]">Test Parameter</th>
                      <th className="p-2 border border-[#E0E7E5] dark:border-[#21333A]">Observed Value</th>
                      <th className="p-2 border border-[#E0E7E5] dark:border-[#21333A]">Biological Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReportForView.keyMetrics?.map((km, idx) => (
                      <tr key={idx} className="border-b border-[#E0E7E5]/60 dark:border-[#21333A]">
                        <td className="p-2 font-medium">{km.param}</td>
                        <td className="p-2 font-mono font-bold text-[#0F766E] dark:text-[#2DD4BF]">{km.value}</td>
                        <td className="p-2 text-[#5A7178] dark:text-[#9DB4BA]">{km.reference || 'Standard'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedReportForView.summary && (
                <div className="p-3 bg-[#F4F7F6] dark:bg-[#19272D] rounded-lg border border-[#E0E7E5] dark:border-[#21333A]">
                  <span className="font-bold text-[10px] uppercase text-[#0F766E] dark:text-[#2DD4BF] block">Pathologist Impression:</span>
                  <p className="mt-1 leading-relaxed">{selectedReportForView.summary}</p>
                </div>
              )}

              <div className="pt-2 text-center text-[10px] text-[#758D94] border-t border-[#E0E7E5] dark:border-[#21333A]">
                Electronically verified diagnostic report under Apna Community Health Clinic.
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#0F766E] hover:bg-[#115E59] text-[#F4F7F6] text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Lab Slip</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedReportForView(null)}
                className="py-2.5 px-4 bg-white dark:bg-[#19272D] border border-[#CFDAD6] text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: UPLOAD / LOG LAB REPORT */}
      {isAddModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#121C21] w-full max-w-lg rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E7E5] dark:border-[#21333A]">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" />
                <h3 className="font-bold text-sm text-[#132226] dark:text-[#F4F7F6] font-heading">
                  Log New Diagnostic Lab Report
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-[#5A7178] hover:text-[#132226] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A7178] dark:text-[#9DB4BA] flex items-center gap-1 mb-1.5">
                <Sparkles className="w-3 h-3 text-[#0F766E] dark:text-[#2DD4BF]" /> Quick Test Templates:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_TEST_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="px-2.5 py-1 rounded-lg bg-[#0F766E]/8 hover:bg-[#0F766E]/15 dark:bg-[#2DD4BF]/15 dark:hover:bg-[#2DD4BF]/25 text-[#0F766E] dark:text-[#2DD4BF] text-[10px] font-semibold transition-colors cursor-pointer border border-[#0F766E]/20"
                  >
                    + {p.name.split('(')[0]}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#5A7178] dark:text-[#9DB4BA] font-semibold mb-1">
                  Investigation / Test Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] text-xs text-[#132226] dark:text-[#F4F7F6] focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5A7178] dark:text-[#9DB4BA] font-semibold mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] text-xs text-[#132226] dark:text-[#F4F7F6] focus:outline-none focus:border-[#0F766E]"
                  >
                    <option value="Diabetes & Metabolism">Diabetes &amp; Metabolism</option>
                    <option value="Hematology">Hematology (Blood)</option>
                    <option value="Cardiovascular Health">Cardiovascular (Lipid)</option>
                    <option value="Endocrinology">Endocrinology (Thyroid)</option>
                    <option value="Renal Health">Renal (Kidney)</option>
                    <option value="Radiology / Imaging">Radiology / Imaging</option>
                    <option value="General Diagnostics">General Diagnostics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#5A7178] dark:text-[#9DB4BA] font-semibold mb-1">
                    Date of Test
                  </label>
                  <input
                    type="date"
                    required
                    value={newTestDate}
                    onChange={(e) => setNewTestDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] text-xs text-[#132226] dark:text-[#F4F7F6] focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#5A7178] dark:text-[#9DB4BA] font-semibold mb-1">
                  Diagnostic Center / Laboratory
                </label>
                <input
                  type="text"
                  required
                  value={newLabName}
                  onChange={(e) => setNewLabName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] text-xs text-[#132226] dark:text-[#F4F7F6] focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              {/* Primary Key Metric Inputs */}
              <div className="p-3 bg-[#F4F7F6] dark:bg-[#19272D] rounded-xl border border-[#E0E7E5] dark:border-[#21333A] space-y-2">
                <span className="font-bold text-[10px] uppercase tracking-wider text-[#0F766E] dark:text-[#2DD4BF] block">
                  Key Quantitative Metric
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-[#5A7178] dark:text-[#9DB4BA]">Metric Name</label>
                    <input
                      type="text"
                      value={newParamName}
                      onChange={(e) => setNewParamName(e.target.value)}
                      placeholder="e.g. Fasting Sugar"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#121C21] border border-[#CFDAD6] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#5A7178] dark:text-[#9DB4BA]">Observed Result</label>
                    <input
                      type="text"
                      value={newParamVal}
                      onChange={(e) => setNewParamVal(e.target.value)}
                      placeholder="e.g. 98 mg/dL"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#121C21] border border-[#CFDAD6] text-xs font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#5A7178] dark:text-[#9DB4BA]">Reference Range</label>
                    <input
                      type="text"
                      value={newParamRef}
                      onChange={(e) => setNewParamRef(e.target.value)}
                      placeholder="e.g. 70-99 mg/dL"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#121C21] border border-[#CFDAD6] text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5A7178] dark:text-[#9DB4BA] font-semibold mb-1">
                    Diagnostic Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] text-xs text-[#132226] dark:text-[#F4F7F6] focus:outline-none focus:border-[#0F766E]"
                  >
                    <option value="Normal">Normal / Healthy Range</option>
                    <option value="Borderline">Borderline / Mild Variation</option>
                    <option value="Alert">Alert / Needs Medical Attention</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#5A7178] dark:text-[#9DB4BA] font-semibold mb-1">
                    Summary / Findings
                  </label>
                  <input
                    type="text"
                    value={newSummary}
                    onChange={(e) => setNewSummary(e.target.value)}
                    placeholder="Brief clinical takeaway..."
                    className="w-full px-3 py-2 rounded-xl bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] text-xs text-[#132226] dark:text-[#F4F7F6] focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#0F766E] hover:bg-[#115E59] text-[#F4F7F6] font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Save Lab Report to Health Record
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
