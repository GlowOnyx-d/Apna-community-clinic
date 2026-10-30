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
      <div className="bg-white dark:bg-[#121C21] w-full max-w-2xl rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E0E7E5] dark:border-[#21333A] bg-[#F4F7F6] dark:bg-[#0B1114]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 text-[#0F766E] dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF] flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">
                Community Pharmacy &amp; Free Medicine Dispensary
              </h2>
              <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">
                Dispense prescribed essential community medicines under SDG 3
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#5A7178] hover:text-[#132226] dark:text-[#9DB4BA] dark:hover:text-[#F4F7F6] rounded-xl hover:bg-[#0F766E]/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-[#E0E7E5] dark:border-[#21333A] flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#121C21]">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#758D94] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search patient, token, or medicine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-xs focus:outline-none focus:border-[#0F766E] dark:text-[#F4F7F6]"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center">
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                filter === 'pending'
                  ? 'bg-[#F97316] text-white border-[#F97316]'
                  : 'bg-[#F4F7F6] dark:bg-[#19272D] text-[#5A7178] dark:text-[#9DB4BA] border-[#CFDAD6] dark:border-[#21333A]'
              }`}
            >
              Awaiting Dispense
            </button>
            <button
              onClick={() => setFilter('dispensed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                filter === 'dispensed'
                  ? 'bg-[#0F766E] text-white border-[#0F766E]'
                  : 'bg-[#F4F7F6] dark:bg-[#19272D] text-[#5A7178] dark:text-[#9DB4BA] border-[#CFDAD6] dark:border-[#21333A]'
              }`}
            >
              Already Dispensed
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#132226] text-white border-[#132226] dark:bg-white dark:text-black'
                  : 'bg-[#F4F7F6] dark:bg-[#19272D] text-[#5A7178] dark:text-[#9DB4BA] border-[#CFDAD6] dark:border-[#21333A]'
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
              <Pill className="w-8 h-8 text-[#758D94] mx-auto opacity-50" />
              <p className="font-semibold text-[#132226] dark:text-[#F4F7F6]">No prescriptions matching this filter</p>
              <p className="text-[#758D94]">Prescriptions generated by doctors upon consultation will appear here.</p>
            </div>
          ) : (
            prescriptionAppointments.map(apt => {
              const isDispensed = apt.dispensaryStatus === 'dispensed';
              return (
                <div
                  key={apt.id}
                  className="p-4 rounded-xl border border-[#E0E7E5] dark:border-[#21333A] bg-[#F4F7F6]/60 dark:bg-[#19272D]/60 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex flex-col items-center justify-center shrink-0">
                        <span className="text-[9px] uppercase font-bold text-[#A3C9B8]">Token</span>
                        <span className="text-xs font-extrabold">{apt.tokenNumber}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[#132226] dark:text-[#F4F7F6]">{apt.patientName}</h4>
                          <span className="text-[10px] text-[#5A7178] dark:text-[#9DB4BA]">
                            ({apt.patientAge || '30'}y • {apt.patientGender || 'Unspecified'})
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5A7178] dark:text-[#9DB4BA]">
                          Consulted by <strong>{apt.doctorName}</strong> ({apt.specialization})
                        </p>
                      </div>
                    </div>

                    <div>
                      {isDispensed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#0F766E]/15 text-[#0F766E] dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF] border border-[#0F766E]/25">
                          <Check className="w-3 h-3" />
                          <span>Dispensed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#F97316]/15 text-[#EA580C] dark:bg-[#FB923C]/20 dark:text-[#FB923C] border border-[#F97316]/25">
                          <Clock className="w-3 h-3" />
                          <span>Awaiting Pharmacy Pickup</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Diagnosis */}
                  {apt.diagnosis && (
                    <div className="p-2 bg-white dark:bg-[#121C21] rounded-lg border border-[#E0E7E5] dark:border-[#21333A] text-[11px]">
                      <span className="font-semibold text-[#0F766E] dark:text-[#2DD4BF]">Diagnosis: </span>
                      <span className="text-[#132226] dark:text-[#F4F7F6]">{apt.diagnosis}</span>
                    </div>
                  )}

                  {/* Prescribed Medications */}
                  <div className="space-y-1">
                    <span className="font-semibold text-[11px] text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider block">
                      Prescribed Community Medication:
                    </span>
                    <pre className="p-2.5 bg-white dark:bg-[#121C21] border border-[#E0E7E5] dark:border-[#21333A] rounded-lg font-mono text-[11px] text-[#132226] dark:text-[#F4F7F6] whitespace-pre-wrap">
                      {apt.prescription}
                    </pre>
                  </div>

                  {/* Dispensing Action */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-[#758D94]">
                      {isDispensed && apt.dispensedAt 
                        ? `Dispensed on ${new Date(apt.dispensedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : 'Free Community Care Drug Scheme'}
                    </span>

                    {!isDispensed && (
                      <button
                        onClick={() => handleDispense(apt.id)}
                        disabled={processingId === apt.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-[#F4F7F6] text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
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
