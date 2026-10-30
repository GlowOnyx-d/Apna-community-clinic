import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  HeartHandshake,
  QrCode,
  AlertCircle,
  Mail,
  Loader2
} from 'lucide-react';
import QRCodeImage from '../common/QRCodeImage';
import { sendDirectEmail, generateAppointmentEmailHtml } from '../../services/emailService';

export default function TokenSlipModal({ appointment, onClose }) {
  const slipRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(appointment?.patientEmail || '');
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailInfo, setEmailInfo] = useState(null);

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
            dark: '#0F766E',
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

  const handleSendEmail = async () => {
    const email = (recipientEmail || appointment.patientEmail || '').trim();
    if (!email) {
      setEmailError('Please enter a recipient email address.');
      return;
    }

    setEmailLoading(true);
    setEmailError('');

    try {
      const emailHtml = generateAppointmentEmailHtml(appointment);
      const subject = `Apna Clinic Token Confirmation: ${appointment.tokenNumber || 'TK'} (${appointment.patientName || 'Patient'})`;
      const result = await sendDirectEmail({
        recipientEmail: email,
        subject,
        html: emailHtml,
        type: 'token_booking'
      });

      setEmailInfo(result);
      setEmailSent(true);
      setEmailError('');
    } catch (err) {
      console.error('Email dispatch failure:', err);
      setEmailSent(false);
      setEmailError(err.message || 'Failed to dispatch email.');
    } finally {
      setEmailLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#121C21] rounded-2xl max-w-md w-full border border-[#E0E7E5] dark:border-[#21333A] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0E7E5] dark:border-[#21333A] bg-[#F4F7F6] dark:bg-[#0B1114]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E] dark:bg-[#2DD4BF] animate-pulse"></span>
            <h3 className="font-bold text-[#132226] dark:text-[#F4F7F6] text-sm font-heading">Official Clinic Token Slip</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#5A7178] hover:text-[#132226] dark:text-[#9DB4BA] dark:hover:text-[#F4F7F6] rounded-lg hover:bg-[#E0E7E5]/50 dark:hover:bg-[#19272D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Area */}
        <div className="p-6 overflow-y-auto">
          <div
            id="printable-token"
            ref={slipRef}
            className="bg-white dark:bg-[#0B1114] rounded-xl border-2 border-dashed border-[#CFDAD6] dark:border-[#21333A] p-6 relative shadow-xs text-[#132226] dark:text-[#F4F7F6]"
          >
            {/* Header */}
            <div className="text-center pb-4 border-b border-[#E0E7E5] dark:border-[#21333A]">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#0F766E] text-[#F4F7F6] mb-2 shadow-xs">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">Apna Community Clinic</h2>
              <p className="text-[11px] text-[#5A7178] dark:text-[#9DB4BA] font-medium">Universal Primary Healthcare &amp; Wellness Hub</p>
            </div>

            {/* Token Badge */}
            <div className="my-5 text-center py-4 bg-[#F4F7F6] dark:bg-[#121C21] rounded-xl border border-[#E0E7E5] dark:border-[#21333A]">
              <p className="text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider">Queue Token Number</p>
              <div className="text-4xl font-black text-[#0F766E] dark:text-[#2DD4BF] tracking-tight my-1 font-heading">
                {appointment.tokenNumber || "TK-01"}
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#0F766E]/12 dark:bg-[#2DD4BF]/20 text-[#0F766E] dark:text-[#2DD4BF]">
                <CheckCircle2 className="w-3 h-3" /> Confirmed
              </span>
            </div>

            {/* Details Grid */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#E0E7E5] dark:border-[#21333A]">
                <span className="text-[#5A7178] dark:text-[#9DB4BA]">Patient:</span>
                <span className="font-semibold text-[#132226] dark:text-[#F4F7F6]">{appointment.patientName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E0E7E5] dark:border-[#21333A]">
                <span className="text-[#5A7178] dark:text-[#9DB4BA]">Doctor:</span>
                <span className="font-semibold text-[#132226] dark:text-[#F4F7F6]">{appointment.doctorName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E0E7E5] dark:border-[#21333A]">
                <span className="text-[#5A7178] dark:text-[#9DB4BA]">Specialty:</span>
                <span className="font-semibold text-[#0F766E] dark:text-[#2DD4BF]">{appointment.specialization}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E0E7E5] dark:border-[#21333A]">
                <span className="text-[#5A7178] dark:text-[#9DB4BA]">Date &amp; Slot:</span>
                <span className="font-semibold text-[#132226] dark:text-[#F4F7F6]">{appointment.date} • {appointment.time}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#5A7178] dark:text-[#9DB4BA]">Location / Cabin:</span>
                <span className="font-medium text-[#132226] dark:text-[#F4F7F6]">Cabin 101, Main Clinic Block</span>
              </div>
            </div>

            {/* QR Code Verification Section */}
            <div className="mt-4 p-3 bg-[#F4F7F6] dark:bg-[#121C21] rounded-xl border border-[#E0E7E5] dark:border-[#21333A] flex items-center gap-3">
              <div className="p-1 bg-white rounded-lg border border-[#E0E7E5] shrink-0">
                <QRCodeImage
                  value={`AROGYA-TOKEN|${appointment.tokenNumber || 'TK'}|${appointment.patientName}|${appointment.doctorName}|${appointment.date}|${appointment.id}`}
                  size={58}
                  darkColor="#0F766E"
                  alt="Token QR Code"
                />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#2DD4BF] flex items-center gap-1">
                  <QrCode className="w-3 h-3" /> Digital Triage QR
                </p>
                <p className="text-[11px] font-mono text-[#132226] dark:text-[#F4F7F6] truncate">ID: {appointment.id}</p>
                <p className="text-[10px] text-[#5A7178] dark:text-[#9DB4BA]">Scan at clinic reception or nurse station for instant OPD check-in</p>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-3 pt-2.5 border-t border-[#E0E7E5] dark:border-[#21333A] text-center">
              <p className="text-[10px] text-[#758D94] dark:text-[#79949B] leading-relaxed">
                Please arrive 10 minutes prior to your slot. Show this digital token slip at the reception or nurse station.
              </p>
            </div>
          </div>
        </div>

        {/* Recipient Email Input Row */}
        <div className="px-5 py-2.5 bg-[#F4F7F6] dark:bg-[#0B1114] border-t border-[#E0E7E5] dark:border-[#21333A] flex items-center justify-between gap-3 text-xs">
          <span className="text-[#5A7178] dark:text-[#9DB4BA] flex items-center gap-1.5 font-medium shrink-0">
            <Mail className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#2DD4BF]" />
            <span>Send to Email:</span>
          </span>
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => {
              setRecipientEmail(e.target.value);
              setEmailSent(false);
              setEmailError('');
            }}
            placeholder="patient@gmail.com"
            className="flex-1 px-2.5 py-1 rounded-lg bg-white dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] text-xs font-medium text-[#132226] dark:text-[#F4F7F6] max-w-[220px] text-right focus:outline-none focus:border-[#0F766E]"
          />
        </div>

        {/* Email Error Banner */}
        {emailError && (
          <div className="mx-5 my-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 animate-in fade-in space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Email Delivery Notice</span>
            </div>
            <p className="text-[11px] text-rose-800 dark:text-rose-300/90 leading-tight">
              {emailError}
            </p>
          </div>
        )}

        {/* Email Delivery Confirmation Banner */}
        {emailSent && (
          <div className="mx-5 my-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 animate-in fade-in space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Token Slip Emailed to {recipientEmail || appointment.patientEmail}</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-700/80 dark:text-emerald-400">
                SENT ✓
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300/90 leading-tight">
              ✓ Full digital token slip with QR triage code, appointment time, and arrival directions dispatched.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-4 bg-[#F4F7F6] dark:bg-[#0B1114] border-t border-[#E0E7E5] dark:border-[#21333A] flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleSendEmail}
            disabled={emailLoading}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer ${emailSent
                ? 'bg-emerald-600 text-white'
                : 'bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-[#F4F7F6]'
              } disabled:opacity-60`}
          >
            {emailLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : emailSent ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            <span>
              {emailSent
                ? 'Email Sent ✓'
                : emailLoading
                  ? 'Sending Email...'
                  : 'Send to Email'}
            </span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 min-w-[75px] flex items-center justify-center gap-2 py-2.5 px-3 bg-white dark:bg-[#19272D] hover:bg-[#F4F7F6] dark:hover:bg-[#21333A] text-[#132226] dark:text-[#F4F7F6] text-xs font-semibold rounded-xl border border-[#CFDAD6] dark:border-[#21333A] transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#5A7178] dark:text-[#9DB4BA]" />
            <span>Print</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={downloading}
            className={`flex-1 min-w-[95px] flex items-center justify-center gap-2 py-2.5 px-3 border text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer ${pdfDownloaded
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white dark:bg-[#19272D] hover:bg-[#F4F7F6] dark:hover:bg-[#21333A] border-[#CFDAD6] dark:border-[#21333A] text-[#132226] dark:text-[#F4F7F6]'
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
