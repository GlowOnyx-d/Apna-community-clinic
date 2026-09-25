import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { 
  X, 
  Calendar, 
  Sparkles, 
  Ticket, 
  ChevronRight, 
  AlertCircle 
} from 'lucide-react';
import { getDoctorAvatar, getDoctorFallbackAvatar } from '../../utils/doctorVisuals';

export default function BookAppointmentModal({ initialDoctor = null, onClose, onSuccess }) {
  const { userProfile } = useAuth();
  const { doctors, bookAppointment, generateTokenNumber } = useData();

  const [selectedDoctorId, setSelectedDoctorId] = useState(
    initialDoctor ? initialDoctor.id : (doctors[0]?.id || '')
  );
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [patientPhone, setPatientPhone] = useState(userProfile?.phone || '');
  const [patientName, setPatientName] = useState(userProfile?.name || '');
  const [loading, setLoading] = useState(false);

  if (!doctors || doctors.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
        <div className="bg-white dark:bg-[#1C221C] w-full max-w-md rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] p-6 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-[#C97B4A]/15 text-[#B35F2B] dark:text-[#E58A54] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">No Doctors Available to Book With Yet</h2>
          <p className="text-sm text-[#6B6B63] dark:text-[#C4CFC3]">
            No doctors have been added to the clinic system yet. Please ask the clinic administrator to add doctor profiles first.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] text-sm font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0];

  const currentSlots = selectedDoctor?.availableSlots || ["09:00 AM", "10:00 AM", "11:00 AM"];
  const activeSlot = time || currentSlots[0] || "09:00 AM";

  // Calculate live preview token
  const estimatedToken = selectedDoctor ? generateTokenNumber(selectedDoctor.id, date) : 'TK-01';

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    try {
      setLoading(true);
      const booked = await bookAppointment({
        patientId: userProfile?.uid || 'patient_guest',
        patientName: patientName || userProfile?.name || 'Community Patient',
        patientEmail: userProfile?.email || '',
        patientPhone: patientPhone || userProfile?.phone || '+91 98765 00000',
        patientAge: userProfile?.age || 29,
        patientGender: userProfile?.gender || 'Female',
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        specialization: selectedDoctor.specialization,
        date,
        time: activeSlot,
        reason: reason || 'Routine Clinical Consultation'
      });

      // Subtle confetti in theme colors
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#2D6A4F', '#52B788', '#C97B4A']
      });

      if (onSuccess) {
        onSuccess(booked);
      } else {
        onClose();
      }
    } catch (err) {
      console.error("Booking failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#1C221C] rounded-2xl max-w-xl w-full border border-[#E6DFC6] dark:border-[#2F3B2F] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6DFC6] dark:border-[#2F3B2F] bg-[#FAF7F2] dark:bg-[#151915]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2D6A4F] text-[#FAF7F2] flex items-center justify-center shadow-xs">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#22291F] dark:text-[#FAF7F2] text-base font-heading">Book Clinic Appointment</h3>
              <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3]">Instant Token Queue Allocation</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-[#6B6B63] hover:text-[#22291F] dark:text-[#C4CFC3] dark:hover:text-[#FAF7F2] rounded-lg hover:bg-[#E6DFC6]/50 dark:hover:bg-[#242C24] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-5">
          
          {/* Doctor Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-2">
              1. Select Healthcare Specialist
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {doctors.map((docItem) => {
                const isSelected = docItem.id === selectedDoctorId;
                return (
                  <button
                    key={docItem.id}
                    type="button"
                    onClick={() => {
                      setSelectedDoctorId(docItem.id);
                      setTime(docItem.availableSlots?.[0] || '');
                    }}
                    className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-[#2D6A4F] dark:border-[#52B788] bg-[#2D6A4F]/10 dark:bg-[#357A5B]/20 shadow-xs' 
                        : 'border-[#E6DFC6] dark:border-[#2F3B2F] hover:border-[#2D6A4F]/40 dark:hover:border-[#445644] bg-[#FAF7F2] dark:bg-[#242C24]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <img 
                        src={getDoctorAvatar(docItem)} 
                        alt={docItem.name} 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getDoctorFallbackAvatar(docItem.name);
                        }}
                        className="w-8 h-8 rounded-full object-cover border border-[#E6DFC6] dark:border-[#2F3B2F] bg-white dark:bg-[#151915]"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#22291F] dark:text-[#FAF7F2] truncate font-heading">{docItem.name}</p>
                        <p className="text-[10px] text-[#2D6A4F] dark:text-[#52B788] font-medium truncate">{docItem.specialization.split('(')[0]}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#8E8E84] dark:text-[#94A493] font-medium mt-auto">
                      {docItem.cabin || 'Cabin 101'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Slot Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Date Picker */}
            <div>
              <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-2">
                2. Select Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#8E8E84] dark:text-[#94A493] absolute left-3.5 top-3" />
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-xs font-medium text-[#22291F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788]"
                />
              </div>
            </div>

            {/* Live Token Estimator */}
            <div className="p-3 bg-[#FAF7F2] dark:bg-[#242C24] rounded-xl border border-[#E6DFC6] dark:border-[#2F3B2F] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-[#B35F2B] dark:text-[#E58A54] uppercase tracking-wider">Next Token in Line</span>
                <p className="text-xl font-black text-[#2D6A4F] dark:text-[#52B788] font-heading">{estimatedToken}</p>
                <p className="text-[10px] text-[#6B6B63] dark:text-[#C4CFC3]">Estimated queue wait: ~10 mins</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#2D6A4F]/15 dark:bg-[#52B788]/20 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Time Slot Picker */}
          <div>
            <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-2">
              3. Available Time Slot
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {currentSlots.map((slot) => {
                const isSelected = activeSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#2D6A4F] dark:bg-[#357A5B] text-[#FAF7F2] border-[#2D6A4F] dark:border-[#52B788] shadow-xs'
                        : 'bg-[#FAF7F2] dark:bg-[#242C24] hover:bg-[#E6DFC6]/60 dark:hover:bg-[#2F3B2F] border-[#D8CEB3] dark:border-[#445644] text-[#6B6B63] dark:text-[#C4CFC3]'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Patient Details & Reason */}
          <div className="space-y-3 pt-2 border-t border-[#E6DFC6] dark:border-[#2F3B2F]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] mb-1">
                  Patient Full Name
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Maya Sharma"
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-xs text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-xs text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] mb-1">
                Reason for Visit / Chief Health Concern
              </label>
              <textarea
                rows="2"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Mild fever, blood pressure checkup, cough for 2 days..."
                className="w-full px-3.5 py-2 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-xs text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788]"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Confirming Booking...' : `Confirm Booking • Token ${estimatedToken}`}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
