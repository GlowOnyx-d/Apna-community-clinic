import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../../context/DataContext';
import { 
  Ticket, 
  X, 
  User, 
  Stethoscope, 
  Clock, 
  CheckCircle2, 
  FileText,
  Phone,
  Calendar
} from 'lucide-react';
import { getSpecialtyConfig } from '../../utils/doctorVisuals';

export default function WalkInTokenModal({ isOpen, onClose, onSuccess }) {
  const { doctors, bookWalkInAppointment } = useData();

  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [patientPhone, setPatientPhone] = useState('');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [reason, setReason] = useState('General Walk-in Consultation');
  const [loading, setLoading] = useState(false);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedDoctor = doctors.find(d => d.id === doctorId) || doctors[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    try {
      setLoading(true);
      const walkInData = {
        patientName: patientName.trim(),
        patientAge: Number(patientAge) || 30,
        patientGender,
        patientPhone: patientPhone.trim(),
        doctorId: selectedDoctor?.id,
        doctorName: selectedDoctor?.name || 'General Physician',
        specialization: selectedDoctor?.specialization || 'General Medicine',
        reason: reason.trim() || 'Walk-in Consultation'
      };

      const newApt = await bookWalkInAppointment(walkInData);
      onClose();
      if (onSuccess) {
        onSuccess(newApt);
      }
    } catch (err) {
      console.error('Walk-in booking failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#1C221C] w-full max-w-lg rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E6DFC6] dark:border-[#2F3B2F] bg-[#FAF7F2] dark:bg-[#151915]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D6A4F] text-[#FAF7F2] flex items-center justify-center shadow-xs">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">
                Issue Walk-In Queue Token
              </h2>
              <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3]">
                Instant token dispatch for on-spot community walk-in patients
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#6B6B63] hover:text-[#22291F] dark:text-[#C4CFC3] dark:hover:text-[#FAF7F2] rounded-xl hover:bg-[#2D6A4F]/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Patient Name */}
          <div>
            <label className="font-semibold text-[#22291F] dark:text-[#FAF7F2] flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788]" />
              <span>Patient Full Name *</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl focus:outline-none focus:border-[#2D6A4F] dark:text-[#FAF7F2]"
            />
          </div>

          {/* Age, Gender & Contact */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-[#22291F] dark:text-[#FAF7F2] mb-1 block">
                Age
              </label>
              <input
                type="number"
                placeholder="35"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-center focus:outline-none focus:border-[#2D6A4F] dark:text-[#FAF7F2]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#22291F] dark:text-[#FAF7F2] mb-1 block">
                Gender
              </label>
              <select
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl focus:outline-none focus:border-[#2D6A4F] dark:text-[#FAF7F2]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-[#22291F] dark:text-[#FAF7F2] mb-1 block">
                Phone (Optional)
              </label>
              <input
                type="tel"
                placeholder="9876543210"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl focus:outline-none focus:border-[#2D6A4F] dark:text-[#FAF7F2]"
              />
            </div>
          </div>

          {/* Specialist Selection */}
          <div>
            <label className="font-semibold text-[#22291F] dark:text-[#FAF7F2] flex items-center gap-1.5 mb-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788]" />
              <span>Assign Specialist Doctor</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {doctors.map(doc => {
                const isSelected = (selectedDoctor?.id === doc.id);
                const specConfig = getSpecialtyConfig(doc.specialization);
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setDoctorId(doc.id)}
                    className={`flex flex-col text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#2D6A4F] bg-[#2D6A4F]/10 dark:border-[#52B788] dark:bg-[#52B788]/20 shadow-xs'
                        : 'border-[#E6DFC6] dark:border-[#2F3B2F] bg-[#FAF7F2] dark:bg-[#242C24] hover:border-[#2D6A4F]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-[#22291F] dark:text-[#FAF7F2] truncate">{doc.name}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold border ${specConfig.badgeClass}`}>
                        {specConfig.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#6B6B63] dark:text-[#C4CFC3]">{doc.cabin || 'Cabin 101'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chief Complaint */}
          <div>
            <label className="font-semibold text-[#22291F] dark:text-[#FAF7F2] flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5 text-[#6B6B63]" />
              <span>Chief Complaint / Reason for Visit</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Mild headache, viral fever checkup, routine BP check"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl focus:outline-none focus:border-[#2D6A4F] dark:text-[#FAF7F2]"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#E6DFC6] dark:border-[#2F3B2F] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#FAF7F2] dark:bg-[#242C24] hover:bg-[#E6DFC6]/50 dark:hover:bg-[#2F3B2F] text-[#6B6B63] dark:text-[#C4CFC3] font-semibold rounded-xl border border-[#D8CEB3] dark:border-[#2F3B2F] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Ticket className="w-4 h-4" />
              <span>{loading ? 'Issuing...' : 'Generate Walk-In Token'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
}
