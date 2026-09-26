import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  HeartHandshake,
  QrCode,
  MessageSquare,
  Smartphone
} from 'lucide-react';
import QRCodeImage from '../common/QRCodeImage';
import { sendDirectSMS, formatAppointmentSMS } from '../../services/smsService';

export default function TokenSlipModal({ appointment, onClose }) {
  const slipRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [recipientPhone, setRecipientPhone] = useState(appointment?.patientPhone || '');
  const [smsSent, setSmsSent] = useState(false);
  const [smsLoading, setSmsLoading] = useState(false);
  const [smsDeliveryInfo, setSmsDeliveryInfo] = useState(null);

  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  // Lock background scroll when modal is open
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
    if (!appointment) return;
    try {
      setDownloading(true);

      // Dynamically load jsPDF and QRCode
      const [jspdfModule, qrcodeModule] = await Promise.all([
        import('jspdf'),
        import('qrcode')
      ]);

      const jsPDF = jspdfModule.jsPDF || jspdfModule.default?.jsPDF || jspdfModule.default;
      const QRCode = qrcodeModule.default || qrcodeModule;

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5'
      });

      // Prepare QR Code Payload & Data URL
      const qrPayload = `APNA-CLINIC-TOKEN|${appointment.tokenNumber || 'TK'}|${appointment.patientName || 'Patient'}|${appointment.doctorName || 'Doctor'}|${appointment.date || ''}|${appointment.id || ''}`;
      let qrDataUrl = '';
      try {
        qrDataUrl = await QRCode.toDataURL(qrPayload, {
          width: 160,
          margin: 1,
          color: {
            dark: '#2D6A4F',
            light: '#FFFFFF'
          }
        });
      } catch (qrErr) {
        console.warn('QR code generation notice:', qrErr);
      }

      // 1. Header Banner
      doc.setFillColor(45, 106, 79);
      doc.roundedRect(12, 10, 124, 22, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('APNA COMMUNITY HEALTH CLINIC', 74, 19, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Universal Primary Healthcare & Wellness Hub • UN SDG 3', 74, 26, { align: 'center' });

      // 2. Token Card
      doc.setFillColor(242, 248, 245);
      doc.setDrawColor(45, 106, 79);
      doc.setLineWidth(0.5);
      doc.roundedRect(12, 36, 124, 28, 2, 2, 'FD');
      doc.setTextColor(45, 106, 79);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('QUEUE TOKEN NUMBER', 74, 43, { align: 'center' });
      doc.setFontSize(22);
      doc.text(String(appointment.tokenNumber || 'TK-01'), 74, 54, { align: 'center' });
      doc.setFontSize(7.5);
      doc.text('CONFIRMED • PRIORITY CLINIC QUEUE', 74, 60, { align: 'center' });

      // 3. Details Card
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(216, 206, 179);
      doc.roundedRect(12, 68, 124, 60, 2, 2, 'FD');

      const rows = [
        ['Patient Name:', appointment.patientName || 'Registered Patient'],
        ['Contact Phone:', appointment.patientPhone || recipientPhone || '+91 98765 00000'],
        ['Consulting Doctor:', appointment.doctorName || 'General Physician'],
        ['Specialization:', appointment.specialization || 'General OPD & Primary Care'],
        ['Appointment Date:', appointment.date || 'Today'],
        ['Allocated Slot:', appointment.time || 'Walk-In Queue'],
        ['Clinic Cabin:', appointment.cabin || 'Cabin 101, Main Clinic Block'],
        ['Token Record ID:', appointment.id || 'N/A']
      ];

      let startY = 75;
      rows.forEach(([label, val]) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(107, 107, 99);
        doc.text(label, 16, startY);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(34, 41, 31);
        doc.text(String(val), 52, startY);
        startY += 6.5;
      });

      // 4. Digital QR Verification Card
      doc.setFillColor(250, 247, 242);
      doc.setDrawColor(230, 223, 198);
      doc.roundedRect(12, 132, 124, 32, 2, 2, 'FD');
      if (qrDataUrl) {
        doc.addImage(qrDataUrl, 'PNG', 16, 134, 28, 28);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(45, 106, 79);
      doc.text('DIGITAL TRIAGE QR VERIFICATION', 48, 142);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(80, 80, 80);
      doc.text('Scan at clinic reception or nurse desk for instant OPD check-in.', 48, 148);
      doc.text('100% Free Consultation • UN SDG 3 Public Health', 48, 154);
      doc.text(`Slip Ref: ${appointment.id || 'N/A'}`, 48, 160);

      // 5. Footer Instructions
      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 115);
      doc.text('Please arrive 10 minutes prior to your allocated slot.', 74, 174, { align: 'center' });
      doc.text('Show this digital token slip at the reception or nurse station.', 74, 179, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleString()} | Apna Community Clinic`, 74, 185, { align: 'center' });

      const safePatient = (appointment.patientName || 'Patient').replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeToken = (appointment.tokenNumber || 'TK').replace(/[^a-zA-Z0-9_-]/g, '_');
      doc.save(`Apna_Token_Slip_${safeToken}_${safePatient}.pdf`);

      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 3000);
    } catch (e) {
      console.error("PDF generation error:", e);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const handleSendSMS = async () => {
    const phone = (recipientPhone || appointment.patientPhone || '').trim();
    if (!phone) {
      alert('Please enter a recipient mobile number to send the SMS.');
      return;
    }

    setSmsLoading(true);

    try {
      const smsBody = formatAppointmentSMS({ ...appointment, patientPhone: phone });
      const result = await sendDirectSMS({
        recipientPhone: phone,
        message: smsBody,
        tokenNumber: appointment.tokenNumber,
        patientName: appointment.patientName,
        doctorName: appointment.doctorName,
        type: 'token_booking'
      });

      setSmsDeliveryInfo(result);
      setSmsSent(true);
    } catch (err) {
      alert(err.message || 'Failed to dispatch SMS.');
    } finally {
      setSmsLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#1C221C] rounded-2xl max-w-md w-full border border-[#E6DFC6] dark:border-[#2F3B2F] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6DFC6] dark:border-[#2F3B2F] bg-[#FAF7F2] dark:bg-[#151915]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F] dark:bg-[#52B788] animate-pulse"></span>
            <h3 className="font-bold text-[#22291F] dark:text-[#FAF7F2] text-sm font-heading">Official Clinic Token Slip</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#6B6B63] hover:text-[#22291F] dark:text-[#C4CFC3] dark:hover:text-[#FAF7F2] rounded-lg hover:bg-[#E6DFC6]/50 dark:hover:bg-[#242C24] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Area */}
        <div className="p-6 overflow-y-auto">
          <div
            id="printable-token"
            ref={slipRef}
            className="bg-white dark:bg-[#151915] rounded-xl border-2 border-dashed border-[#D8CEB3] dark:border-[#2F3B2F] p-6 relative shadow-xs text-[#22291F] dark:text-[#FAF7F2]"
          >
            {/* Header */}
            <div className="text-center pb-4 border-b border-[#E6DFC6] dark:border-[#2F3B2F]">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#2D6A4F] text-[#FAF7F2] mb-2 shadow-xs">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">Apna Community Clinic</h2>
              <p className="text-[11px] text-[#6B6B63] dark:text-[#C4CFC3] font-medium">Universal Primary Healthcare &amp; Wellness Hub</p>
            </div>

            {/* Token Badge */}
            <div className="my-5 text-center py-4 bg-[#FAF7F2] dark:bg-[#1C221C] rounded-xl border border-[#E6DFC6] dark:border-[#2F3B2F]">
              <p className="text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider">Queue Token Number</p>
              <div className="text-4xl font-black text-[#2D6A4F] dark:text-[#52B788] tracking-tight my-1 font-heading">
                {appointment.tokenNumber || "TK-01"}
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#2D6A4F]/12 dark:bg-[#52B788]/20 text-[#2D6A4F] dark:text-[#52B788]">
                <CheckCircle2 className="w-3 h-3" /> Confirmed
              </span>
            </div>

            {/* Details Grid */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#E6DFC6] dark:border-[#2F3B2F]">
                <span className="text-[#6B6B63] dark:text-[#C4CFC3]">Patient:</span>
                <span className="font-semibold text-[#22291F] dark:text-[#FAF7F2]">{appointment.patientName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E6DFC6] dark:border-[#2F3B2F]">
                <span className="text-[#6B6B63] dark:text-[#C4CFC3]">Doctor:</span>
                <span className="font-semibold text-[#22291F] dark:text-[#FAF7F2]">{appointment.doctorName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E6DFC6] dark:border-[#2F3B2F]">
                <span className="text-[#6B6B63] dark:text-[#C4CFC3]">Specialty:</span>
                <span className="font-semibold text-[#2D6A4F] dark:text-[#52B788]">{appointment.specialization}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E6DFC6] dark:border-[#2F3B2F]">
                <span className="text-[#6B6B63] dark:text-[#C4CFC3]">Date &amp; Slot:</span>
                <span className="font-semibold text-[#22291F] dark:text-[#FAF7F2]">{appointment.date} • {appointment.time}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#6B6B63] dark:text-[#C4CFC3]">Location / Cabin:</span>
                <span className="font-medium text-[#22291F] dark:text-[#FAF7F2]">Cabin 101, Main Clinic Block</span>
              </div>
            </div>

            {/* QR Code Verification Section */}
            <div className="mt-4 p-3 bg-[#FAF7F2] dark:bg-[#1C221C] rounded-xl border border-[#E6DFC6] dark:border-[#2F3B2F] flex items-center gap-3">
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
                <p className="text-[11px] font-mono text-[#22291F] dark:text-[#FAF7F2] truncate">ID: {appointment.id}</p>
                <p className="text-[10px] text-[#6B6B63] dark:text-[#C4CFC3]">Scan at clinic reception or nurse station for instant OPD check-in</p>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-3 pt-2.5 border-t border-[#E6DFC6] dark:border-[#2F3B2F] text-center">
              <p className="text-[10px] text-[#8E8E84] dark:text-[#94A493] leading-relaxed">
                Please arrive 10 minutes prior to your slot. Show this digital token slip at the reception or nurse station.
              </p>
            </div>
          </div>
        </div>

        {/* Recipient Phone Input Row */}
        <div className="px-5 py-2.5 bg-[#FAF7F2] dark:bg-[#151915] border-t border-[#E6DFC6] dark:border-[#2F3B2F] flex items-center justify-between gap-3 text-xs">
          <span className="text-[#6B6B63] dark:text-[#C4CFC3] flex items-center gap-1.5 font-medium">
            <Smartphone className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788]" />
            <span>SMS Phone:</span>
          </span>
          <input
            type="tel"
            value={recipientPhone}
            onChange={(e) => {
              setRecipientPhone(e.target.value);
              setSmsSent(false);
            }}
            placeholder="+91 98765 43210"
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] text-xs font-mono font-bold text-[#22291F] dark:text-[#FAF7F2] max-w-[170px] text-right focus:outline-none focus:border-[#2D6A4F]"
          />
        </div>

        {/* In-Website Direct SMS Delivery Confirmation Banner */}
        {smsSent && (
          <div className="mx-5 my-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 animate-in fade-in space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>SMS Dispatched Directly to {recipientPhone || appointment.patientPhone}</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-700/80 dark:text-emerald-400">
                {smsDeliveryInfo?.messageId || 'GATEWAY-OK'}
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300/90 leading-tight">
              ✓ Sent directly from Apna Clinic Gateway . Please show the SMS message at the reception counter.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-4 bg-[#FAF7F2] dark:bg-[#151915] border-t border-[#E6DFC6] dark:border-[#2F3B2F] flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleSendSMS}
            disabled={smsLoading}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer ${smsSent
                ? 'bg-emerald-600 text-white'
                : 'bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2]'
              }`}
          >
            {smsSent ? <CheckCircle2 className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
            <span>{smsSent ? 'SMS Dispatched ✓' : (smsLoading ? 'Sending SMS...' : 'Send SMS Details')}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 min-w-[90px] flex items-center justify-center gap-2 py-2.5 px-3 bg-white dark:bg-[#242C24] hover:bg-[#FAF7F2] dark:hover:bg-[#2F3B2F] text-[#22291F] dark:text-[#FAF7F2] text-xs font-semibold rounded-xl border border-[#D8CEB3] dark:border-[#2F3B2F] transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#6B6B63] dark:text-[#C4CFC3]" />
            <span>Print</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={downloading}
            className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-2.5 px-3 border text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer ${
              pdfDownloaded
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white dark:bg-[#242C24] hover:bg-[#FAF7F2] dark:hover:bg-[#2F3B2F] border-[#D8CEB3] dark:border-[#2F3B2F] text-[#22291F] dark:text-[#FAF7F2]'
            } disabled:opacity-50`}
          >
            {pdfDownloaded ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Download className="w-4 h-4" />}
            <span>{downloading ? 'Saving PDF...' : (pdfDownloaded ? 'Downloaded ✓' : 'PDF Slip')}</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
