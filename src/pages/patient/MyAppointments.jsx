import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import TokenSlipModal from '../../components/patient/TokenSlipModal';
import BookAppointmentModal from '../../components/patient/BookAppointmentModal';
import PrescriptionModal from '../../components/patient/PrescriptionModal';
import { 
  Ticket, 
  Plus, 
  FileCheck, 
  Pill, 
  Stethoscope,
  FileText
} from 'lucide-react';

export default function MyAppointments() {
  const { userProfile } = useAuth();
  const { appointments, cancelAppointment } = useData();

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const [selectedSlipAppointment, setSelectedSlipAppointment] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Filter for this patient
  const myAppointments = appointments.filter(
    a => a.patientId === userProfile?.uid || a.patientEmail === userProfile?.email
  );

  const activeAppointments = myAppointments.filter(a => a.status === 'pending');
  const pastAppointments = myAppointments.filter(a => a.status === 'done' || a.status === 'cancelled');

  const handleCancel = (id) => {
    if (window.confirm("Are you sure you want to cancel this appointment token?")) {
      cancelAppointment(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#22291F] dark:text-[#F5F1EA] tracking-tight font-heading">
            My Appointments &amp; Medical Records
          </h1>
          <p className="text-xs text-[#6B6B63] dark:text-[#9EAA9A] mt-1">
            Track your live token queue positions, past visit notes, and doctor prescriptions
          </p>
        </div>

        <button
          onClick={() => setBookingModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2D6A4F] hover:bg-[#245740] text-[#FAF7F2] text-xs font-bold rounded-xl shadow-sm transition-colors self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E6DFC6] dark:border-[#2D352C]">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold transition-all relative ${
            activeTab === 'active'
              ? 'text-[#2D6A4F] dark:text-[#52B788] border-b-2 border-[#2D6A4F]'
              : 'text-[#6B6B63] hover:text-[#22291F] dark:text-[#9EAA9A] dark:hover:text-[#F5F1EA]'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Active Queue Tokens ({activeAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold transition-all relative ${
            activeTab === 'history'
              ? 'text-[#2D6A4F] dark:text-[#52B788] border-b-2 border-[#2D6A4F]'
              : 'text-[#6B6B63] hover:text-[#22291F] dark:text-[#9EAA9A] dark:hover:text-[#F5F1EA]'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Past Consultations &amp; Diagnoses ({pastAppointments.length})</span>
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'active' ? (
        <div className="space-y-4">
          {activeAppointments.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#222722] rounded-3xl border border-[#E6DFC6] dark:border-[#2D352C] p-6 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#2D6A4F]/15 border border-[#2D6A4F]/30 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center mx-auto mb-3">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#22291F] dark:text-[#F5F1EA]">No active queue tokens</h3>
              <p className="text-xs text-[#6B6B63] dark:text-[#9EAA9A] mt-1 max-w-sm mx-auto">
                You do not have any pending consultations scheduled right now.
              </p>
              <button
                onClick={() => setBookingModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#2D6A4F] hover:bg-[#245740] text-[#FAF7F2] rounded-xl text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Book Consultation
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeAppointments.map((apt) => (
                <div 
                  key={apt.id}
                  className="bg-white dark:bg-[#222722] rounded-2xl border border-[#E6DFC6] dark:border-[#2D352C] p-5 shadow-sm hover:border-[#2D6A4F]/60 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Token & Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl bg-[#2D6A4F] text-[#FAF7F2] font-black text-sm tracking-wider shadow-sm">
                          {apt.tokenNumber}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#C97B4A]/15 text-[#B35F2B] dark:text-[#C97B4A] border border-[#C97B4A]/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C97B4A] animate-ping"></span>
                          In Queue
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-[#6B6B63] dark:text-[#9EAA9A]">{apt.date}</span>
                    </div>

                    <h3 className="text-base font-bold text-[#22291F] dark:text-[#F5F1EA] font-heading">{apt.doctorName}</h3>
                    <p className="text-xs font-medium text-[#2D6A4F] dark:text-[#52B788]">{apt.specialization}</p>

                    <div className="my-3 py-2.5 px-3 bg-[#FAF7F2] dark:bg-[#1A1D19] border border-[#E6DFC6] dark:border-[#2D352C] rounded-xl space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#6B6B63] dark:text-[#9EAA9A]">Scheduled Time Slot:</span>
                        <span className="font-bold text-[#22291F] dark:text-[#F5F1EA]">{apt.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B6B63] dark:text-[#9EAA9A]">Reason / Concern:</span>
                        <span className="font-medium text-[#22291F] dark:text-[#F5F1EA] truncate max-w-[200px]">{apt.reason || 'General Consultation'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#E6DFC6] dark:border-[#2D352C]">
                    <button
                      onClick={() => setSelectedSlipAppointment(apt)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-[#2D6A4F] text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#2D6A4F]/10 text-xs font-bold rounded-xl transition-colors"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>View Token Slip</span>
                    </button>
                    <button
                      onClick={() => handleCancel(apt.id)}
                      className="px-3 py-2 text-xs font-semibold text-[#6B6B63] hover:text-[#C97B4A] hover:bg-[#C97B4A]/10 rounded-xl border border-[#D8CEB3] dark:border-[#2D352C] dark:text-[#9EAA9A] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {pastAppointments.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#222722] rounded-3xl border border-[#E6DFC6] dark:border-[#2D352C] p-6 shadow-sm">
              <p className="text-xs text-[#6B6B63] dark:text-[#9EAA9A]">No past medical consultation records found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastAppointments.map((apt) => (
                <div 
                  key={apt.id}
                  className="bg-white dark:bg-[#222722] rounded-2xl border border-[#E6DFC6] dark:border-[#2D352C] p-5 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E6DFC6] dark:border-[#2D352C]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] dark:bg-[#1A1D19] border border-[#E6DFC6] dark:border-[#2D352C] text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center font-bold text-xs">
                        {apt.tokenNumber || 'TK'}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#22291F] dark:text-[#F5F1EA] font-heading">{apt.doctorName}</h3>
                        <p className="text-xs text-[#2D6A4F] dark:text-[#52B788]">{apt.specialization}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#6B6B63] dark:text-[#9EAA9A] font-medium">{apt.date} • {apt.time}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        apt.status === 'done'
                          ? 'bg-[#2D6A4F]/15 text-[#2D6A4F] border border-[#2D6A4F]/30 dark:bg-[#2D6A4F]/20 dark:text-[#52B788]'
                          : 'bg-[#FAF7F2] text-[#8E8E84] border border-[#E6DFC6] dark:bg-[#1A1D19] dark:text-[#71806F] dark:border-[#2D352C]'
                      }`}>
                        {apt.status === 'done' ? 'Completed' : 'Cancelled'}
                      </span>
                    </div>
                  </div>

                  {/* Consultation Notes & Diagnosis Section */}
                  {apt.status === 'done' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FAF7F2] dark:bg-[#1A1D19] p-4 rounded-xl border border-[#E6DFC6] dark:border-[#2D352C] text-xs">
                      <div>
                        <p className="font-bold text-[#6B6B63] dark:text-[#9EAA9A] flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                          <Stethoscope className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788]" />
                          Doctor's Diagnosis &amp; Notes
                        </p>
                        <p className="font-semibold text-[#22291F] dark:text-[#F5F1EA] mb-1">
                          {apt.diagnosis || "Routine Clinical Assessment"}
                        </p>
                        <p className="text-[#6B6B63] dark:text-[#9EAA9A] leading-relaxed">
                          {apt.notes || "Patient vitals stable. Advised rest and follow up if symptoms persist."}
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-[#6B6B63] dark:text-[#9EAA9A] flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                          <Pill className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788]" />
                          Prescription / Advice
                        </p>
                        <p className="text-[#22291F] dark:text-[#F5F1EA] whitespace-pre-line leading-relaxed font-mono bg-white dark:bg-[#222722] p-2.5 rounded-lg border border-[#E6DFC6] dark:border-[#2D352C]">
                          {apt.prescription || "Standard multivitamins & hydration."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions for completed appointments */}
                  {apt.status === 'done' && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E6DFC6] dark:border-[#2D352C]">
                      <button
                        onClick={() => setSelectedPrescription(apt)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2D6A4F] hover:bg-[#245740] text-[#FAF7F2] text-xs font-bold transition-colors shadow-xs cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Download Official Prescription (Rx)</span>
                      </button>
                      <button
                        onClick={() => setSelectedSlipAppointment(apt)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D8CEB3] dark:border-[#2D352C] hover:bg-[#FAF7F2] dark:hover:bg-[#1A1D19] text-xs font-semibold text-[#6B6B63] dark:text-[#9EAA9A] transition-colors cursor-pointer"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Token Details</span>
                      </button>
                    </div>
                  )}

                  {apt.status === 'cancelled' && (
                    <p className="text-xs text-[#8E8E84] dark:text-[#71806F] italic">This appointment was cancelled prior to consultation.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {selectedSlipAppointment && (
        <TokenSlipModal
          appointment={selectedSlipAppointment}
          onClose={() => setSelectedSlipAppointment(null)}
        />
      )}

      {selectedPrescription && (
        <PrescriptionModal
          appointment={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
        />
      )}

      {bookingModalOpen && (
        <BookAppointmentModal
          onClose={() => setBookingModalOpen(false)}
          onSuccess={(booked) => {
            setBookingModalOpen(false);
            setSelectedSlipAppointment(booked);
          }}
        />
      )}

    </div>
  );
}
