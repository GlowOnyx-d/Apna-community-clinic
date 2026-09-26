import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../../context/DataContext';
import { 
  Activity, 
  X, 
  Heart, 
  Thermometer, 
  Wind, 
  Droplet, 
  Scale, 
  AlertCircle,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function VitalsModal({ appointment, isOpen, onClose }) {
  const { recordVitals } = useData();

  const existingVitals = appointment?.vitals || {};
  const [bpSystolic, setBpSystolic] = useState(existingVitals.bpSystolic || '');
  const [bpDiastolic, setBpDiastolic] = useState(existingVitals.bpDiastolic || '');
  const [pulse, setPulse] = useState(existingVitals.pulse || '');
  const [temperature, setTemperature] = useState(existingVitals.temperature || '');
  const [spo2, setSpo2] = useState(existingVitals.spo2 || '');
  const [bloodSugar, setBloodSugar] = useState(existingVitals.bloodSugar || '');
  const [weight, setWeight] = useState(existingVitals.weight || '');
  const [notes, setNotes] = useState(existingVitals.notes || '');
  const [saving, setSaving] = useState(false);

  // Lock background scroll when modal is open
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

  if (!isOpen || !appointment) return null;

  // Real-time clinical threshold warnings
  const isHighBP = Number(bpSystolic) >= 140 || Number(bpDiastolic) >= 90;
  const isLowSpo2 = Number(spo2) > 0 && Number(spo2) < 95;
  const isFever = Number(temperature) >= 100.4;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const vitalsData = {
        bp: bpSystolic && bpDiastolic ? `${bpSystolic}/${bpDiastolic} mmHg` : '',
        bpSystolic: bpSystolic || '',
        bpDiastolic: bpDiastolic || '',
        pulse: pulse ? `${pulse} bpm` : '',
        temperature: temperature ? `${temperature} °F` : '',
        spo2: spo2 ? `${spo2}%` : '',
        bloodSugar: bloodSugar ? `${bloodSugar} mg/dL` : '',
        weight: weight ? `${weight} kg` : '',
        notes: notes || '',
        hasAlert: isHighBP || isLowSpo2 || isFever
      };

      await recordVitals(appointment.id, vitalsData);
      onClose();
    } catch (err) {
      console.error('Failed to save vitals:', err);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#1C221C] w-full max-w-lg rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E6DFC6] dark:border-[#2F3B2F] bg-[#FAF7F2] dark:bg-[#151915]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F] dark:bg-[#52B788]/20 dark:text-[#52B788] flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">
                Patient Triage &amp; Vitals Recording
              </h2>
              <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3]">
                Token #{appointment.tokenNumber} • {appointment.patientName} ({appointment.patientAge || 'Adult'})
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

        {/* Clinical Alert Warning Banner if thresholds crossed */}
        {(isHighBP || isLowSpo2 || isFever) && (
          <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Clinical Flag:</strong> {isHighBP && 'Stage 1/2 Hypertension BP. '} {isLowSpo2 && 'Low Oxygen Saturation. '} {isFever && 'Pyrexia / Fever detected.'}
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Blood Pressure & Pulse */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#22291F] dark:text-[#FAF7F2] flex items-center gap-1.5 mb-1">
                <Heart className="w-3.5 h-3.5 text-[#C97B4A]" />
                <span>Blood Pressure (Sys / Dia)</span>
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="120"
                  value={bpSystolic}
                  onChange={(e) => setBpSystolic(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-center focus:outline-none focus:border-[#2D6A4F] dark:text-[#FAF7F2]"
                />
                <span className="text-[#8E8E84]">/</span>
                <input
                  type="number"
                  placeholder="80"
                  value={bpDiastolic}
                  onChange={(e) => setBpDiastolic(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-center focus:outline-none focus:border-[#2D6A4F] dark:text-[#FAF7F2]"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#22291F] dark:text-[#FAF7F2] flex items-center gap-1.5 mb-1">
                <Activity className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>Pulse Rate (bpm)</span>
              </label>
              <input
                type="number"
                placeholder="72 bpm"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl focus:outline-none focus:border-[#2D6A4F] dark:text-[#FAF7F2]"
              />
            </div>
          </div>

          {/* Temperature & SpO2 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#22291F] dark:text-[#FAF7F2] flex items-center gap-1.5 mb-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                <span>Body Temperature (°F)</span>
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="98.6"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl focus:outline-none focus:border-[#2D6A4F] dark:text-[#FAF7F2]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#22291F] dark:text-[#FAF7F2] flex items-center gap-1.5 mb-1">
                <Wind className="w-3.5 h-3.5 text-sky-600" />
                <span>Oxygen SpO2 (%)</span>
              </label>
              <input
                type="number"
                placeholder="98"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl focus:outline-none focus:border-[#2D6A4F] dark:text-[#FAF7F2]"
              />
            </div>
          </div>

          {/* Blood Sugar & Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#22291F] dark:text-[#FAF7F2] flex items-center gap-1.5 mb-1">
                <Droplet className="w-3.5 h-3.5 text-purple-600" />
                <span>Random Blood Sugar (mg/dL)</span>
              </label>
              <input
                type="number"
                placeholder="110"
                value={bloodSugar}
                onChange={(e) => setBloodSugar(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl focus:outline-none focus:border-[#2D6A4F] dark:text-[#FAF7F2]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#22291F] dark:text-[#FAF7F2] flex items-center gap-1.5 mb-1">
                <Scale className="w-3.5 h-3.5 text-teal-600" />
                <span>Patient Weight (kg)</span>
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="65"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl focus:outline-none focus:border-[#2D6A4F] dark:text-[#FAF7F2]"
              />
            </div>
          </div>

          {/* Triage Observations */}
          <div>
            <label className="font-semibold text-[#22291F] dark:text-[#FAF7F2] flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5 text-[#6B6B63]" />
              <span>Nurse / Receptionist Triage Observations</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Patient feels dizzy, mild breathlessness since morning..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl focus:outline-none focus:border-[#2D6A4F] dark:text-[#FAF7F2]"
            />
          </div>

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
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saving ? 'Saving Vitals...' : 'Attach Vitals to Consultation'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
}
