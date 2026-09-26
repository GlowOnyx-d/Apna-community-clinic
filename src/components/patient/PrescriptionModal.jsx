import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Printer,
  Download,
  HeartHandshake,
  Stethoscope,
  User,
  ShieldCheck,
  FileText,
  Sparkles,
  QrCode
} from 'lucide-react';
import QRCodeImage from '../common/QRCodeImage';

export default function PrescriptionModal({ appointment, onClose }) {
  const prescriptionRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  // Lock background scroll when open
  useEffect(() => {
    if (appointment) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [appointment]);

  if (!appointment) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!prescriptionRef.current) return;
    try {
      setDownloading(true);
      const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);

      // Render crisp A4 prescription with white medical background
      const canvas = await html2canvas(prescriptionRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, pdf.internal.pageSize.getHeight()));
      const safePatientName = (appointment.patientName || 'Patient').replace(/\s+/g, '_');
      pdf.save(`Apna_Prescription_${appointment.tokenNumber || 'Rx'}_${safePatientName}.pdf`);
    } catch (e) {
      console.error("Prescription PDF generation failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  // Helper to parse line-by-line medication instructions if provided
  const parsePrescriptionLines = (rawText) => {
    if (!rawText) return [];
    return rawText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  };

  const prescriptionLines = parsePrescriptionLines(appointment.prescription);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-[#FAF7F2] dark:bg-[#1C221C] rounded-2xl max-w-3xl w-full border border-[#E6DFC6] dark:border-[#2F3B2F] overflow-hidden flex flex-col max-h-[92vh] shadow-2xl my-auto">

        {/* Modal Top Control Bar (Screen only) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#E6DFC6] dark:border-[#2F3B2F] bg-white dark:bg-[#151915]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2D6A4F]/10 dark:bg-[#52B788]/20 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#22291F] dark:text-[#FAF7F2] text-sm font-heading">
                Outpatient Medical Prescription &amp; Clinical Summary
              </h3>
              <p className="text-[11px] text-[#6B6B63] dark:text-[#C4CFC3]">
                Token #{appointment.tokenNumber || 'TK'} • Dr. {appointment.doctorName?.replace(/^Dr\.\s*/i, '')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#D8CEB3] dark:border-[#2F3B2F] bg-white dark:bg-[#242C24] hover:bg-[#FAF7F2] dark:hover:bg-[#151915] text-xs font-semibold text-[#22291F] dark:text-[#FAF7F2] transition-colors cursor-pointer"
              title="Print Prescription"
            >
              <Printer className="w-3.5 h-3.5 text-[#6B6B63] dark:text-[#C4CFC3]" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2D6A4F] hover:bg-[#245740] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Save as A4 PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Exporting...' : 'Save PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#6B6B63] hover:text-[#22291F] dark:text-[#C4CFC3] dark:hover:text-[#FAF7F2] rounded-lg hover:bg-[#E6DFC6]/50 dark:hover:bg-[#242C24] transition-colors ml-1 cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Letterhead Paper Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-[#ECE6D9] dark:bg-[#151915] flex justify-center">

          {/* Printable Prescription Canvas Container (Strict White Medical Stationery) */}
          <div
            ref={prescriptionRef}
            className="w-full max-w-[650px] bg-white text-[#1A1D19] rounded-xl shadow-lg border border-[#E0D8C3] p-6 sm:p-8 relative selection:bg-[#2D6A4F] selection:text-white"
            style={{ minHeight: '800px' }}
          >
            {/* Top Letterhead Header */}
            <div className="border-b-2 border-[#2D6A4F] pb-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center shadow-xs">
                    <HeartHandshake className="w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-[#1A1D19]">
                      Apna Community Health Clinic
                    </h1>
                    <p className="text-[11px] font-semibold text-[#2D6A4F] uppercase tracking-wider">
                      Universal Primary Healthcare &amp; Wellness Initiative
                    </p>
                    <p className="text-[10px] text-[#6B7280]">
                      Reg No: ACHC-2026-DL-0941 • SDG 3 Good Health &amp; Well-Being
                    </p>
                  </div>
                </div>

                <div className="text-right text-[10px] text-[#4B5563] hidden sm:block leading-tight">
                  <p className="font-bold text-[#1A1D19]">Community Health Center Complex</p>
                  <p>Ward 4, Health City</p>
                  <p>Phone: +91 11 2345 6789</p>
                  <p className="text-[#2D6A4F] font-semibold">support@Apnaclinic.org</p>
                </div>
              </div>
            </div>

            {/* Doctor & Patient Info Strip */}
            <div className="my-5 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF7F2] p-4 rounded-xl border border-[#E6DFC6] text-xs">
              {/* Doctor Details */}
              <div className="space-y-1 sm:border-r sm:border-[#E6DFC6] sm:pr-4">
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1">
                  <Stethoscope className="w-3 h-3 text-[#2D6A4F]" /> Attending Specialist
                </span>
                <p className="font-bold text-sm text-[#1A1D19]">{appointment.doctorName}</p>
                <p className="text-[11px] font-medium text-[#2D6A4F]">{appointment.specialization}</p>
                <p className="text-[10px] text-[#6B7280]">OPD Consultation Room • Active License</p>
              </div>

              {/* Patient Details */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3 text-[#2D6A4F]" /> Patient Profile
                </span>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm text-[#1A1D19]">{appointment.patientName}</p>
                  <span className="px-2 py-0.5 rounded bg-[#2D6A4F] text-white font-mono font-bold text-xs">
                    {appointment.tokenNumber || 'TK-01'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[#4B5563]">
                  <span>Age: <strong>{appointment.patientAge ? `${appointment.patientAge}y` : 'Adult'}</strong></span>
                  <span>•</span>
                  <span>Gender: <strong>{appointment.patientGender || 'Not specified'}</strong></span>
                  <span>•</span>
                  <span>Date: <strong>{appointment.date}</strong></span>
                </div>
                {appointment.patientPhone && (
                  <p className="text-[10px] text-[#6B7280]">Contact: {appointment.patientPhone}</p>
                )}
              </div>
            </div>

            {/* Chief Complaints & Clinical Findings */}
            <div className="space-y-3 mb-5">
              {appointment.reason && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] mb-0.5">
                    Chief Complaint / Clinical Presentation
                  </h4>
                  <p className="text-xs text-[#1F2937] italic bg-[#F9FAFB] p-2 rounded-lg border border-[#E5E7EB]">
                    "{appointment.reason}"
                  </p>
                </div>
              )}

              {appointment.diagnosis && (
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-0.5">
                    Primary Clinical Diagnosis
                  </span>
                  <p className="text-sm font-bold text-emerald-950">
                    {appointment.diagnosis}
                  </p>
                </div>
              )}

              {appointment.notes && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] mb-0.5">
                    Clinical Examination &amp; Notes
                  </h4>
                  <p className="text-xs text-[#374151] leading-relaxed">
                    {appointment.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Rx Symbol & Medication Advice */}
            <div className="my-6 border-t border-[#E5E7EB] pt-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-serif italic font-black text-2xl text-[#2D6A4F]">℞</span>
                <h3 className="font-bold text-sm text-[#1A1D19] uppercase tracking-wide">
                  Prescription &amp; Dosage Instructions
                </h3>
              </div>

              {prescriptionLines.length > 0 ? (
                <div className="space-y-2.5">
                  {prescriptionLines.map((line, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E6DFC6] flex items-start gap-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#2D6A4F]/15 text-[#2D6A4F] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="text-xs text-[#1F2937] font-medium leading-relaxed">
                        {line.replace(/^\d+[.)]\s*/, '')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center text-xs text-gray-500">
                  Standard supportive care, proper hydration, and scheduled follow-up advised.
                </div>
              )}
            </div>

            {/* General Health & Lifestyle Advisory */}
            <div className="my-5 p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                Community Health Guidelines:
              </p>
              <p className="text-[10px] leading-relaxed text-amber-800">
                Complete the prescribed course as directed. In case of unexpected side effects or worsening symptoms, report back to the clinic or nearby primary health center immediately.
              </p>
            </div>

            {/* Bottom Sign-off & Stamp */}
            <div className="mt-8 pt-4 border-t border-[#E5E7EB] flex items-end justify-between">

              {/* Official Digital Seal */}
              <div className="flex items-center gap-2.5">
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#2D6A4F]/60 flex flex-col items-center justify-center p-1 text-center rotate-[-8deg] bg-emerald-50/40">
                  <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
                  <span className="text-[8px] font-black uppercase text-[#2D6A4F] leading-tight">
                    ACHC VERIFIED
                  </span>
                  <span className="text-[7px] text-[#2D6A4F] font-mono">
                    VALID
                  </span>
                </div>
                <div className="text-[9px] text-[#6B7280] leading-tight">
                  <p className="font-bold text-[#374151]">Authorized Outpatient Slip</p>
                  <p>Arogya Community EHR</p>
                  <p>Verified on {appointment.completedAt ? new Date(appointment.completedAt).toLocaleDateString() : appointment.date}</p>
                </div>
              </div>

              {/* Pharmacy Verification QR Code */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="p-1 bg-white border border-gray-200 rounded-lg shadow-2xs">
                  <QRCodeImage 
                    value={`AROGYA-RX|${appointment.id}|TOKEN:${appointment.tokenNumber || 'TK'}|PATIENT:${appointment.patientName}|DOCTOR:${appointment.doctorName}|DATE:${appointment.date}`} 
                    size={52} 
                    darkColor="#1A1D19" 
                    alt="Rx Verification QR Code"
                  />
                </div>
                <span className="text-[8px] text-gray-500 font-mono mt-0.5 flex items-center gap-0.5">
                  <QrCode className="w-2.5 h-2.5 text-[#2D6A4F]" /> Scan to Verify Rx
                </span>
              </div>

              {/* Doctor's Signature Block */}
              <div className="text-right space-y-1">
                <div className="font-serif italic text-lg text-[#1A1D19] pr-2 tracking-wide font-bold">
                  {appointment.doctorName}
                </div>
                <div className="w-44 border-b border-[#1A1D19] ml-auto"></div>
                <p className="text-[10px] font-bold text-[#1A1D19] uppercase">Medical Officer / Specialist Signature</p>
                <p className="text-[9px] text-[#6B7280]">License Reg. Validated</p>
              </div>

            </div>

            {/* Small Footer Notice */}
            <div className="mt-6 text-center text-[9px] text-gray-400 border-t border-gray-100 pt-2">
              Apna Community Clinic • Free Universal Outpatient Health Portal • Powered by Secure Cloud Healthcare Records
            </div>

          </div>

        </div>

      </div>
    </div>,
    document.body
  );
}
