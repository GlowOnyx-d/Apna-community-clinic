import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import PrescriptionModal from '../../components/patient/PrescriptionModal';
import LabReportsSection from '../../components/patient/LabReportsSection';
import { 
  Users, 
  Search, 
  Clock, 
  Pill, 
  ChevronRight, 
  Phone, 
  Mail, 
  AlertCircle,
  FileCheck,
  FileText
} from 'lucide-react';

export default function PatientRecords() {
  const { appointments } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientKey, setSelectedPatientKey] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // Aggregate appointments by unique patient (keyed by patientId or normalized email/name)
  const patientDirectory = useMemo(() => {
    const map = new Map();

    appointments.forEach((apt) => {
      const key = apt.patientId || (apt.patientEmail ? apt.patientEmail.toLowerCase() : apt.patientName?.toLowerCase());
      if (!key) return;

      if (!map.has(key)) {
        map.set(key, {
          key,
          id: apt.patientId,
          name: apt.patientName || 'Community Patient',
          email: apt.patientEmail || 'No email provided',
          phone: apt.patientPhone || 'No phone provided',
          age: apt.patientAge || 'N/A',
          gender: apt.patientGender || 'Unspecified',
          visits: []
        });
      }

      const patient = map.get(key);
      patient.visits.push(apt);

      // Keep most up-to-date patient details if earlier record was sparse
      if (apt.patientPhone && patient.phone === 'No phone provided') patient.phone = apt.patientPhone;
      if (apt.patientEmail && patient.email === 'No email provided') patient.email = apt.patientEmail;
      if (apt.patientAge && patient.age === 'N/A') patient.age = apt.patientAge;
    });

    // Sort visits chronologically (newest first)
    const list = Array.from(map.values()).map(p => {
      p.visits.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
      return p;
    });

    // Sort patients by latest visit date
    list.sort((a, b) => {
      const dateA = a.visits[0]?.date || '';
      const dateB = b.visits[0]?.date || '';
      return dateB.localeCompare(dateA);
    });

    return list;
  }, [appointments]);

  // Filter patients by search
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patientDirectory;
    const q = searchQuery.toLowerCase();
    return patientDirectory.filter(p => 
      p.name?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q)
    );
  }, [patientDirectory, searchQuery]);

  // Active patient selection (default to first matching patient if none selected)
  const activePatient = useMemo(() => {
    if (selectedPatientKey) {
      return patientDirectory.find(p => p.key === selectedPatientKey) || null;
    }
    return filteredPatients[0] || null;
  }, [selectedPatientKey, patientDirectory, filteredPatients]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-[#E8F0EE] dark:bg-[#121C21] border border-[#DCE5E2] dark:border-[#21333A] p-6 sm:p-8 shadow-sm">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F766E]/10 dark:bg-[#2DD4BF]/20 text-[#0F766E] dark:text-[#2DD4BF] text-xs font-bold border border-[#0F766E]/20 dark:border-[#2DD4BF]/30">
            <Users className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" />
            <span>Clinical Records Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#132226] dark:text-[#F4F7F6] tracking-tight font-heading">
            Patient Medical History &amp; Diagnoses
          </h1>
          <p className="text-sm text-[#5A7178] dark:text-[#9DB4BA]">
            Search patient records, examine historical clinical consultations, view issued prescriptions, and track patient care continuity.
          </p>
        </div>
      </div>

      {patientDirectory.length === 0 ? (
        <div className="bg-[#F4F7F6] dark:bg-[#121C21] rounded-3xl border border-dashed border-[#CFDAD6] dark:border-[#21333A] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0F766E]/10 dark:bg-[#2DD4BF]/20 border border-[#0F766E]/20 dark:border-[#2DD4BF]/30 text-[#0F766E] dark:text-[#2DD4BF] flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">No Patient Records Yet</h3>
          <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA] max-w-sm mx-auto">
            Once patients register and complete consultations with clinic specialists, their cross-visit health summaries and digital prescriptions will be recorded here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Patient Directory List (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-[#121C21] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] shadow-sm overflow-hidden flex flex-col max-h-[750px]">
            <div className="p-4 border-b border-[#E0E7E5] dark:border-[#21333A] bg-[#F4F7F6] dark:bg-[#0B1114] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">
                  Patients ({filteredPatients.length})
                </h3>
                <span className="text-[11px] font-semibold text-[#758D94] dark:text-[#79949B]">Total: {patientDirectory.length}</span>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-[#758D94] dark:text-[#79949B] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or phone..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-xs text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>
            </div>

            <div className="divide-y divide-[#E0E7E5] dark:divide-[#21333A] overflow-y-auto flex-1">
              {filteredPatients.map((patient) => {
                const isSelected = activePatient?.key === patient.key;
                const completedCount = patient.visits.filter(v => v.status === 'done').length;

                return (
                  <button
                    key={patient.key}
                    type="button"
                    onClick={() => setSelectedPatientKey(patient.key)}
                    className={`w-full text-left p-4 transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#0F766E]/10 dark:bg-[#0D9488]/20 border-l-4 border-[#0F766E] dark:border-[#2DD4BF] text-[#132226] dark:text-[#F4F7F6]'
                        : 'hover:bg-[#F4F7F6] dark:hover:bg-[#19272D] text-[#5A7178] dark:text-[#9DB4BA]'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-xs text-[#132226] dark:text-[#F4F7F6] truncate">{patient.name}</p>
                        <span className="text-[10px] text-[#758D94] dark:text-[#79949B]">({patient.gender}, {patient.age}y)</span>
                      </div>
                      <p className="text-[11px] text-[#5A7178] dark:text-[#9DB4BA] truncate mt-0.5">{patient.phone}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F4F7F6] dark:bg-[#19272D] text-[#5A7178] dark:text-[#9DB4BA] border border-[#E0E7E5] dark:border-[#21333A]">
                          <FileCheck className="w-3 h-3 text-[#0F766E] dark:text-[#2DD4BF]" />
                          {completedCount} Consultations
                        </span>
                        {patient.visits[0]?.date && (
                          <span className="text-[10px] text-[#758D94] dark:text-[#79949B]">
                            Last: {patient.visits[0].date}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-[#0F766E] dark:text-[#2DD4BF] translate-x-0.5' : 'text-[#758D94] dark:text-[#79949B]'}`} />
                  </button>
                );
              })}

              {filteredPatients.length === 0 && (
                <div className="p-8 text-center text-xs text-[#758D94] dark:text-[#79949B]">
                  No matching patients found.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Selected Patient Detail & Medical Timeline (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {activePatient ? (
              <>
                {/* Patient Profile Card */}
                <div className="bg-white dark:bg-[#121C21] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E0E7E5] dark:border-[#21333A]">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#0F766E] dark:bg-[#0D9488] text-[#F4F7F6] flex items-center justify-center font-bold text-lg shadow-xs">
                        {activePatient.name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">{activePatient.name}</h2>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#5A7178] dark:text-[#9DB4BA] mt-0.5">
                          <span>{activePatient.gender}</span>
                          <span>•</span>
                          <span>Age: {activePatient.age}</span>
                          <span>•</span>
                          <span className="text-[#0F766E] dark:text-[#2DD4BF] font-semibold">{activePatient.visits.length} Total Visits Recorded</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-xs">
                    <div className="flex items-center gap-2 p-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#E0E7E5] dark:border-[#21333A] rounded-xl text-[#132226] dark:text-[#F4F7F6]">
                      <Phone className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF] shrink-0" />
                      <span className="font-semibold">{activePatient.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#E0E7E5] dark:border-[#21333A] rounded-xl text-[#132226] dark:text-[#F4F7F6] truncate">
                      <Mail className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF] shrink-0" />
                      <span className="font-semibold truncate">{activePatient.email}</span>
                    </div>
                  </div>
                </div>

                {/* Diagnostic Pathology & Lab Reports */}
                <div className="bg-white dark:bg-[#121C21] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] p-6 shadow-sm">
                  <LabReportsSection 
                    customPatientId={activePatient.id} 
                    customPatientName={activePatient.name} 
                  />
                </div>

                {/* Medical Consultations Timeline */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-[#132226] dark:text-[#F4F7F6] flex items-center gap-2 font-heading">
                    <Clock className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" />
                    <span>Clinical Consultation Timeline ({activePatient.visits.length})</span>
                  </h3>

                  <div className="space-y-4">
                    {activePatient.visits.map((visit, index) => {
                      const isDone = visit.status === 'done';
                      const isCancelled = visit.status === 'cancelled';

                      return (
                        <div 
                          key={visit.id || index}
                          className="bg-white dark:bg-[#121C21] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] p-6 shadow-sm relative overflow-hidden"
                        >
                          {/* Left Accent Strip */}
                          <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                            isDone ? 'bg-[#0F766E] dark:bg-[#2DD4BF]' : isCancelled ? 'bg-[#758D94] dark:bg-[#79949B]' : 'bg-[#F97316] dark:bg-[#FB923C]'
                          }`} />

                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E0E7E5] dark:border-[#21333A]">
                            <div className="flex items-center gap-2.5">
                              <span className="px-2.5 py-1 rounded-lg bg-[#0F766E]/10 dark:bg-[#2DD4BF]/20 text-[#0F766E] dark:text-[#2DD4BF] font-black text-xs border border-[#0F766E]/20 dark:border-[#2DD4BF]/30">
                                {visit.tokenNumber || 'TK'}
                              </span>
                              <div className="text-xs">
                                <span className="font-bold text-[#132226] dark:text-[#F4F7F6]">Dr. {visit.doctorName.replace(/^Dr\.\s*/i, '')}</span>
                                <span className="text-[#5A7178] dark:text-[#9DB4BA]"> ({visit.specialization})</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-[#5A7178] dark:text-[#9DB4BA] font-medium">{visit.date} • {visit.time}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                isDone 
                                  ? 'bg-[#0F766E]/15 text-[#0F766E] dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF] border border-[#0F766E]/30 dark:border-[#2DD4BF]/30'
                                  : isCancelled
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300 dark:border-rose-900/40'
                                  : 'bg-[#F97316]/15 text-[#EA580C] dark:text-[#FB923C] border border-[#F97316]/30 dark:border-[#FB923C]/30'
                              }`}>
                                {visit.status}
                              </span>
                            </div>
                          </div>

                          {/* Reason */}
                          <div className="mt-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#758D94] dark:text-[#79949B] block mb-1">
                              Chief Complaint / Reason
                            </span>
                            <p className="text-xs text-[#132226] dark:text-[#F4F7F6] bg-[#F4F7F6] dark:bg-[#19272D] border border-[#E0E7E5] dark:border-[#21333A] p-2.5 rounded-xl">
                              {visit.reason || 'General Routine Consultation'}
                            </p>
                          </div>

                          {/* Diagnosis Block */}
                          {visit.diagnosis && (
                            <div className="mt-3 p-3 bg-[#0F766E]/5 dark:bg-[#19272D] border border-[#0F766E]/30 dark:border-[#2DD4BF]/40 rounded-xl space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#2DD4BF] block">
                                Confirmed Clinical Diagnosis
                              </span>
                              <p className="text-xs font-bold text-[#132226] dark:text-[#F4F7F6]">
                                {visit.diagnosis}
                              </p>
                            </div>
                          )}

                          {/* Prescription Block */}
                          {visit.prescription && (
                            <div className="mt-3 p-3 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#E0E7E5] dark:border-[#21333A] rounded-xl space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A7178] dark:text-[#9DB4BA] flex items-center gap-1.5">
                                <Pill className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#2DD4BF]" />
                                Prescribed Medication &amp; Dosage
                              </span>
                              <pre className="text-xs font-mono text-[#132226] dark:text-[#F4F7F6] whitespace-pre-wrap font-medium">
                                {visit.prescription}
                              </pre>
                            </div>
                          )}

                          {/* Clinical Notes */}
                          {visit.notes && (
                            <div className="mt-3 text-xs text-[#5A7178] dark:text-[#9DB4BA]">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#758D94] dark:text-[#79949B] block mb-0.5">
                                Clinical Notes &amp; Observations:
                              </span>
                              <p className="italic bg-[#F4F7F6] dark:bg-[#19272D] border border-[#E0E7E5] dark:border-[#21333A] p-2 rounded-lg text-[#132226] dark:text-[#F4F7F6]">
                                {visit.notes}
                              </p>
                            </div>
                          )}

                          {/* Official Prescription Action */}
                          {isDone && (
                            <div className="mt-3 pt-3 border-t border-[#E0E7E5] dark:border-[#21333A] flex items-center justify-end">
                              <button
                                onClick={() => setSelectedPrescription(visit)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#0F766E] dark:border-[#2DD4BF] text-[#0F766E] dark:text-[#2DD4BF] hover:bg-[#0F766E]/10 dark:hover:bg-[#2DD4BF]/15 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>View &amp; Print Official Rx Slip</span>
                              </button>
                            </div>
                          )}

                          {/* Pending Consultation Alert */}
                          {!isDone && !isCancelled && (
                            <div className="mt-3 flex items-center gap-2 p-2.5 bg-[#F97316]/10 border border-[#F97316]/30 rounded-xl text-xs text-[#EA580C] dark:text-[#FB923C]">
                              <AlertCircle className="w-4 h-4 shrink-0 text-[#EA580C] dark:text-[#FB923C]" />
                              <span>Consultation is pending. Clinical diagnosis and prescription will appear once completed.</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-[#121C21] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] p-12 text-center text-xs text-[#758D94] dark:text-[#79949B]">
                Select a patient from the left directory to view full medical history.
              </div>
            )}
          </div>

        </div>
      )}

      {selectedPrescription && (
        <PrescriptionModal
          appointment={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
        />
      )}

    </div>
  );
}
