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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
        <div className="bg-white dark:bg-[#222722] w-full max-w-md rounded-2xl border border-[#E6DFC6] dark:border-[#2D352C] p-6 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-[#C97B4A]/15 text-[#B35F2B] dark:text-[#C97B4A] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#22291F] dark:text-[#F5F1EA] font-heading">No Doctors Available to Book With Yet</h2>
          <p className="text-sm text-[#6B6B63] dark:text-[#9EAA9A]">
            No doctors have been added to the clinic system yet. Please ask the clinic administrator to add doctor profiles first.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-[#2D6A4F] hover:bg-[#23543E] text-[#FAF7F2] text-sm font-semibold rounded-xl transition-colors shadow-sm"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#222722] rounded-2xl max-w-xl w-full border border-[#E6DFC6] dark:border-[#2D352C] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6DFC6] dark:border-[#2D352C] bg-[#FAF7F2] dark:bg-[#1A1D19]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2D6A4F] text-[#FAF7F2] flex items-center justify-center shadow-xs">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#22291F] dark:text-[#F5F1EA] text-base font-heading">Book Clinic Appointment</h3>
              <p className="text-xs text-[#6B6B63] dark:text-[#9EAA9A]">Instant Token Queue Allocation</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-[#6B6B63] hover:text-[#22291F] dark:text-[#9EAA9A] dark:hover:text-[#F5F1EA] rounded-lg hover:bg-[#E6DFC6]/50 dark:hover:bg-[#1A1D19] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-5">
          
          {/* Doctor Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#9EAA9A] uppercase tracking-wider mb-2">
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
                    className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                      isSelected 
                        ? 'border-[#2D6A4F] bg-[#2D6A4F]/10 dark:bg-[#2D6A4F]/20 shadow-xs' 
                        : 'border-[#E6DFC6] dark:border-[#2D352C] hover:border-[#2D6A4F]/40 dark:hover:border-[#384337] bg-[#FAF7F2] dark:bg-[#1A1D19]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <img 
                        src={docItem.avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100"} 
                        alt={docItem.name} 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='%23FAF7F2' stroke='%232D6A4F' stroke-width='1.5'%3E%3Ccircle cx='12' cy='8' r='5'/%3E%3Cpath d='M20 21a8 8 0 1 0-16 0'/%3E%3C/svg%3E";
                        }}
                        className="w-8 h-8 rounded-full object-cover border border-[#E6DFC6] dark:border-[#2D352C] bg-white dark:bg-[#1A1D19]"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#22291F] dark:text-[#F5F1EA] truncate font-heading">{docItem.name}</p>
                        <p className="text-[10px] text-[#2D6A4F] dark:text-[#52B788] font-medium truncate">{docItem.specialization.split('(')[0]}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#8E8E84] dark:text-[#71806F] font-medium mt-auto">
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
              <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#9EAA9A] uppercase tracking-wider mb-2">
                2. Select Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#8E8E84] dark:text-[#71806F] absolute left-3.5 top-3" />
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#1A1D19] border border-[#D8CEB3] dark:border-[#2D352C] rounded-xl text-xs font-medium text-[#22291F] dark:text-[#F5F1EA] focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>
            </div>

            {/* Live Token Estimator */}
            <div className="p-3 bg-[#FAF7F2] dark:bg-[#1A1D19] rounded-xl border border-[#E6DFC6] dark:border-[#2D352C] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-[#B35F2B] dark:text-[#C97B4A] uppercase tracking-wider">Next Token in Line</span>
                <p className="text-xl font-black text-[#2D6A4F] dark:text-[#52B788] font-heading">{estimatedToken}</p>
                <p className="text-[10px] text-[#6B6B63] dark:text-[#9EAA9A]">Estimated queue wait: ~10 mins</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#2D6A4F]/15 dark:bg-[#2D6A4F]/20 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Time Slot Picker */}
          <div>
            <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#9EAA9A] uppercase tracking-wider mb-2">
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
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition-colors ${
                      isSelected
                        ? 'bg-[#2D6A4F] text-[#FAF7F2] border-[#2D6A4F] shadow-xs'
                        : 'bg-[#FAF7F2] dark:bg-[#1A1D19] hover:bg-[#E6DFC6]/60 dark:hover:bg-[#2D6A4F]/10 border-[#D8CEB3] dark:border-[#2D352C] text-[#6B6B63] dark:text-[#9EAA9A]'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Patient Details & Reason */}
          <div className="space-y-3 pt-2 border-t border-[#E6DFC6] dark:border-[#2D352C]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#9EAA9A] mb-1">
                  Patient Full Name
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Maya Sharma"
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] dark:bg-[#1A1D19] border border-[#D8CEB3] dark:border-[#2D352C] rounded-xl text-xs text-[#22291F] dark:text-[#F5F1EA] placeholder-[#8E8E84] dark:placeholder-[#71806F] focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#9EAA9A] mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] dark:bg-[#1A1D19] border border-[#D8CEB3] dark:border-[#2D352C] rounded-xl text-xs text-[#22291F] dark:text-[#F5F1EA] placeholder-[#8E8E84] dark:placeholder-[#71806F] focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#9EAA9A] mb-1">
                Reason for Visit / Chief Health Concern
              </label>
              <textarea
                rows="2"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Mild fever, blood pressure checkup, cough for 2 days..."
                className="w-full px-3.5 py-2 bg-[#FAF7F2] dark:bg-[#1A1D19] border border-[#D8CEB3] dark:border-[#2D352C] rounded-xl text-xs text-[#22291F] dark:text-[#F5F1EA] placeholder-[#8E8E84] dark:placeholder-[#71806F] focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#2D6A4F] hover:bg-[#23543E] text-[#FAF7F2] text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
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
