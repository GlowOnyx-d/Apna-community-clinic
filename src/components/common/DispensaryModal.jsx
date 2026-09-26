import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../../context/DataContext';
import { 
  Pill, 
  X, 
  CheckCircle2, 
  Clock, 
  Search, 
  FileText, 
  User, 
  Stethoscope,
  Sparkles,
  Check
} from 'lucide-react';

export default function DispensaryModal({ isOpen, onClose }) {
  const { appointments, dispensePrescription } = useData();
  const [filter, setFilter] = useState('pending'); // 'pending' | 'dispensed' | 'all'
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState(null);

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

  // Filter completed appointments that have prescriptions
  const prescriptionAppointments = appointments.filter(a => {
    if (a.status !== 'done' || !a.prescription || a.prescription.trim() === '') return false;
    
    const isDispensed = a.dispensaryStatus === 'dispensed';
    if (filter === 'pending' && isDispensed) return false;
    if (filter === 'dispensed' && !isDispensed) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchesName = a.patientName?.toLowerCase().includes(q);
      const matchesToken = a.tokenNumber?.toLowerCase().includes(q);
      const matchesRx = a.prescription?.toLowerCase().includes(q);
      if (!matchesName && !matchesToken && !matchesRx) return false;
    }

    return true;
  });

  const handleDispense = async (aptId) => {
    try {
      setProcessingId(aptId);
      await dispensePrescription(aptId, 'Dispensed with dosage instructions to patient.');
    } catch (err) {
      console.error('Failed to dispense:', err);
    } finally {
      setProcessingId(null);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#1C221C] w-full max-w-2xl rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E6DFC6] dark:border-[#2F3B2F] bg-[#FAF7F2] dark:bg-[#151915]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F] dark:bg-[#52B788]/20 dark:text-[#52B788] flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">
                Community Pharmacy &amp; Free Medicine Dispensary
              </h2>
              <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3]">
                Dispense prescribed essential community medicines under SDG 3
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

        {/* Toolbar */}
        <div className="p-4 border-b border-[#E6DFC6] dark:border-[#2F3B2F] flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#1C221C]">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#8E8E84] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search patient, token, or medicine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-xs focus:outline-none focus:border-[#2D6A4F] dark:text-[#FAF7F2]"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center">
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                filter === 'pending'
                  ? 'bg-[#C97B4A] text-white border-[#C97B4A]'
                  : 'bg-[#FAF7F2] dark:bg-[#242C24] text-[#6B6B63] dark:text-[#C4CFC3] border-[#D8CEB3] dark:border-[#2F3B2F]'
              }`}
            >
              Awaiting Dispense
            </button>
            <button
              onClick={() => setFilter('dispensed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                filter === 'dispensed'
                  ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]'
                  : 'bg-[#FAF7F2] dark:bg-[#242C24] text-[#6B6B63] dark:text-[#C4CFC3] border-[#D8CEB3] dark:border-[#2F3B2F]'
              }`}
            >
              Already Dispensed
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#22291F] text-white border-[#22291F] dark:bg-white dark:text-black'
                  : 'bg-[#FAF7F2] dark:bg-[#242C24] text-[#6B6B63] dark:text-[#C4CFC3] border-[#D8CEB3] dark:border-[#2F3B2F]'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Prescription List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          {prescriptionAppointments.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Pill className="w-8 h-8 text-[#8E8E84] mx-auto opacity-50" />
              <p className="font-semibold text-[#22291F] dark:text-[#FAF7F2]">No prescriptions matching this filter</p>
              <p className="text-[#8E8E84]">Prescriptions generated by doctors upon consultation will appear here.</p>
            </div>
          ) : (
            prescriptionAppointments.map(apt => {
              const isDispensed = apt.dispensaryStatus === 'dispensed';
              return (
                <div
                  key={apt.id}
                  className="p-4 rounded-xl border border-[#E6DFC6] dark:border-[#2F3B2F] bg-[#FAF7F2]/60 dark:bg-[#242C24]/60 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#2D6A4F] text-white flex flex-col items-center justify-center shrink-0">
                        <span className="text-[9px] uppercase font-bold text-[#A3C9B8]">Token</span>
                        <span className="text-xs font-extrabold">{apt.tokenNumber}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[#22291F] dark:text-[#FAF7F2]">{apt.patientName}</h4>
                          <span className="text-[10px] text-[#6B6B63] dark:text-[#C4CFC3]">
                            ({apt.patientAge || '30'}y • {apt.patientGender || 'Unspecified'})
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B6B63] dark:text-[#C4CFC3]">
                          Consulted by <strong>{apt.doctorName}</strong> ({apt.specialization})
                        </p>
                      </div>
                    </div>

                    <div>
                      {isDispensed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#2D6A4F]/15 text-[#2D6A4F] dark:bg-[#52B788]/20 dark:text-[#52B788] border border-[#2D6A4F]/25">
                          <Check className="w-3 h-3" />
                          <span>Dispensed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#C97B4A]/15 text-[#B35F2B] dark:bg-[#E58A54]/20 dark:text-[#E58A54] border border-[#C97B4A]/25">
                          <Clock className="w-3 h-3" />
                          <span>Awaiting Pharmacy Pickup</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Diagnosis */}
                  {apt.diagnosis && (
                    <div className="p-2 bg-white dark:bg-[#1C221C] rounded-lg border border-[#E6DFC6] dark:border-[#2F3B2F] text-[11px]">
                      <span className="font-semibold text-[#2D6A4F] dark:text-[#52B788]">Diagnosis: </span>
                      <span className="text-[#22291F] dark:text-[#FAF7F2]">{apt.diagnosis}</span>
                    </div>
                  )}

                  {/* Prescribed Medications */}
                  <div className="space-y-1">
                    <span className="font-semibold text-[11px] text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider block">
                      Prescribed Community Medication:
                    </span>
                    <pre className="p-2.5 bg-white dark:bg-[#1C221C] border border-[#E6DFC6] dark:border-[#2F3B2F] rounded-lg font-mono text-[11px] text-[#22291F] dark:text-[#FAF7F2] whitespace-pre-wrap">
                      {apt.prescription}
                    </pre>
                  </div>

                  {/* Dispensing Action */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-[#8E8E84]">
                      {isDispensed && apt.dispensedAt 
                        ? `Dispensed on ${new Date(apt.dispensedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : 'Free Community Care Drug Scheme'}
                    </span>

                    {!isDispensed && (
                      <button
                        onClick={() => handleDispense(apt.id)}
                        disabled={processingId === apt.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{processingId === apt.id ? 'Updating...' : 'Mark as Dispensed & Explained'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}
