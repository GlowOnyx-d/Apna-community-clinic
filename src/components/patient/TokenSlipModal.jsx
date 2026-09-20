import React, { useRef, useState } from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  HeartHandshake,
  QrCode
} from 'lucide-react';
import QRCodeImage from '../common/QRCodeImage';

export default function TokenSlipModal({ appointment, onClose }) {
  const slipRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!appointment) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!slipRef.current) return;
    try {
      setDownloading(true);
      const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);
      const isDarkActive = document.documentElement.classList.contains('dark');
      const canvas = await html2canvas(slipRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: isDarkActive ? '#1A1D19' : '#FFFFFF'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a5');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save(`Token_Slip_${appointment.tokenNumber}_${appointment.patientName.replace(/\s+/g, '_')}.pdf`);
    } catch (e) {
      console.error("PDF generation failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#222722] rounded-2xl max-w-md w-full border border-[#E6DFC6] dark:border-[#2D352C] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6DFC6] dark:border-[#2D352C] bg-[#FAF7F2] dark:bg-[#1A1D19]/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F] dark:bg-[#52B788] animate-pulse"></span>
            <h3 className="font-bold text-[#22291F] dark:text-[#F5F1EA] text-sm font-heading">Official Clinic Token Slip</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#6B6B63] hover:text-[#22291F] dark:text-[#9EAA9A] dark:hover:text-[#F5F1EA] rounded-lg hover:bg-[#E6DFC6]/50 dark:hover:bg-[#1A1D19] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Area */}
        <div className="p-6 overflow-y-auto">
          <div
            id="printable-token"
            ref={slipRef}
            className="bg-white dark:bg-[#1A1D19] rounded-xl border-2 border-dashed border-[#D8CEB3] dark:border-[#2D352C] p-6 relative shadow-xs text-[#22291F] dark:text-[#F5F1EA]"
          >
            {/* Header */}
            <div className="text-center pb-4 border-b border-[#E6DFC6] dark:border-[#2D352C]">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#2D6A4F] text-[#FAF7F2] mb-2 shadow-xs">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-[#22291F] dark:text-[#F5F1EA] font-heading">Apna Community Clinic</h2>
              <p className="text-[11px] text-[#6B6B63] dark:text-[#9EAA9A] font-medium">Universal Primary Healthcare &amp; Wellness Hub</p>
            </div>

            {/* Token Badge */}
            <div className="my-5 text-center py-4 bg-[#FAF7F2] dark:bg-[#222722] rounded-xl border border-[#E6DFC6] dark:border-[#2D352C]">
              <p className="text-xs font-semibold text-[#6B6B63] dark:text-[#9EAA9A] uppercase tracking-wider">Queue Token Number</p>
              <div className="text-4xl font-black text-[#2D6A4F] dark:text-[#52B788] tracking-tight my-1 font-heading">
                {appointment.tokenNumber || "TK-01"}
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#2D6A4F]/12 dark:bg-[#2D6A4F]/25 text-[#2D6A4F] dark:text-[#52B788]">
                <CheckCircle2 className="w-3 h-3" /> Confirmed
              </span>
            </div>

            {/* Details Grid */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#E6DFC6] dark:border-[#2D352C]">
                <span className="text-[#6B6B63] dark:text-[#9EAA9A]">Patient:</span>
                <span className="font-semibold text-[#22291F] dark:text-[#F5F1EA]">{appointment.patientName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E6DFC6] dark:border-[#2D352C]">
                <span className="text-[#6B6B63] dark:text-[#9EAA9A]">Doctor:</span>
                <span className="font-semibold text-[#22291F] dark:text-[#F5F1EA]">{appointment.doctorName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E6DFC6] dark:border-[#2D352C]">
                <span className="text-[#6B6B63] dark:text-[#9EAA9A]">Specialty:</span>
                <span className="font-semibold text-[#2D6A4F] dark:text-[#52B788]">{appointment.specialization}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E6DFC6] dark:border-[#2D352C]">
                <span className="text-[#6B6B63] dark:text-[#9EAA9A]">Date &amp; Slot:</span>
                <span className="font-semibold text-[#22291F] dark:text-[#F5F1EA]">{appointment.date} • {appointment.time}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#6B6B63] dark:text-[#9EAA9A]">Location / Cabin:</span>
                <span className="font-medium text-[#22291F] dark:text-[#F5F1EA]">Cabin 101, Main Clinic Block</span>
              </div>
            </div>

            {/* QR Code Verification Section */}
            <div className="mt-4 p-3 bg-[#FAF7F2] dark:bg-[#222722] rounded-xl border border-[#E6DFC6] dark:border-[#2D352C] flex items-center gap-3">
              <div className="p-1 bg-white rounded-lg border border-[#E6DFC6] shrink-0">
                <QRCodeImage 
                  value={`AROGYA-TOKEN|${appointment.tokenNumber || 'TK'}|${appointment.patientName}|${appointment.doctorName}|${appointment.date}|${appointment.id}`} 
                  size={58} 
                  darkColor="#2D6A4F"
                  alt="Token QR Code"
                />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D6A4F] dark:text-[#52B788] flex items-center gap-1">
                  <QrCode className="w-3 h-3" /> Digital Triage QR
                </p>
                <p className="text-[11px] font-mono text-[#22291F] dark:text-[#F5F1EA] truncate">ID: {appointment.id}</p>
                <p className="text-[10px] text-[#6B6B63] dark:text-[#9EAA9A]">Scan at clinic reception or nurse station for instant OPD check-in</p>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-3 pt-2.5 border-t border-[#E6DFC6] dark:border-[#2D352C] text-center">
              <p className="text-[10px] text-[#8E8E84] dark:text-[#71806F] leading-relaxed">
                Please arrive 10 minutes prior to your slot. Show this digital token slip at the reception or nurse station.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-[#FAF7F2] dark:bg-[#1A1D19]/60 border-t border-[#E6DFC6] dark:border-[#2D352C] flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-white dark:bg-[#1A1D19] hover:bg-[#FAF7F2] dark:hover:bg-[#2D6A4F]/15 text-[#22291F] dark:text-[#F5F1EA] text-xs font-semibold rounded-xl border border-[#D8CEB3] dark:border-[#2D352C] transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4 text-[#6B6B63] dark:text-[#9EAA9A]" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-[#2D6A4F] hover:bg-[#23543E] disabled:opacity-50 text-[#FAF7F2] text-xs font-semibold rounded-xl transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
