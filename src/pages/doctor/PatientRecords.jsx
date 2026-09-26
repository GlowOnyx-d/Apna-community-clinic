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
      <div className="rounded-3xl bg-[#F0EBE1] dark:bg-[#1C221C] border border-[#E4DCCE] dark:border-[#2F3B2F] p-6 sm:p-8 shadow-sm">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D6A4F]/10 dark:bg-[#52B788]/20 text-[#2D6A4F] dark:text-[#52B788] text-xs font-bold border border-[#2D6A4F]/20 dark:border-[#52B788]/30">
            <Users className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788]" />
            <span>Clinical Records Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#22291F] dark:text-[#FAF7F2] tracking-tight font-heading">
            Patient Medical History &amp; Diagnoses
          </h1>
          <p className="text-sm text-[#6B6B63] dark:text-[#C4CFC3]">
            Search patient records, examine historical clinical consultations, view issued prescriptions, and track patient care continuity.
          </p>
        </div>
      </div>

      {patientDirectory.length === 0 ? (
        <div className="bg-[#FAF7F2] dark:bg-[#1C221C] rounded-3xl border border-dashed border-[#D8CEB3] dark:border-[#2F3B2F] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#2D6A4F]/10 dark:bg-[#52B788]/20 border border-[#2D6A4F]/20 dark:border-[#52B788]/30 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">No Patient Records Yet</h3>
          <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] max-w-sm mx-auto">
            Once patients register and complete consultations with clinic specialists, their cross-visit health summaries and digital prescriptions will be recorded here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Patient Directory List (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-[#1C221C] rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-sm overflow-hidden flex flex-col max-h-[750px]">
            <div className="p-4 border-b border-[#E6DFC6] dark:border-[#2F3B2F] bg-[#FAF7F2] dark:bg-[#151915] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">
                  Patients ({filteredPatients.length})
                </h3>
                <span className="text-[11px] font-semibold text-[#8E8E84] dark:text-[#94A493]">Total: {patientDirectory.length}</span>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-[#8E8E84] dark:text-[#94A493] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or phone..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-xs text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-1 focus:ring-[#2D6A4F]"
                />
              </div>
            </div>

            <div className="divide-y divide-[#E6DFC6] dark:divide-[#2F3B2F] overflow-y-auto flex-1">
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
                        ? 'bg-[#2D6A4F]/10 dark:bg-[#357A5B]/20 border-l-4 border-[#2D6A4F] dark:border-[#52B788] text-[#22291F] dark:text-[#FAF7F2]'
                        : 'hover:bg-[#FAF7F2] dark:hover:bg-[#242C24] text-[#6B6B63] dark:text-[#C4CFC3]'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-xs text-[#22291F] dark:text-[#FAF7F2] truncate">{patient.name}</p>
                        <span className="text-[10px] text-[#8E8E84] dark:text-[#94A493]">({patient.gender}, {patient.age}y)</span>
                      </div>
                      <p className="text-[11px] text-[#6B6B63] dark:text-[#C4CFC3] truncate mt-0.5">{patient.phone}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FAF7F2] dark:bg-[#242C24] text-[#6B6B63] dark:text-[#C4CFC3] border border-[#E6DFC6] dark:border-[#2F3B2F]">
                          <FileCheck className="w-3 h-3 text-[#2D6A4F] dark:text-[#52B788]" />
                          {completedCount} Consultations
                        </span>
                        {patient.visits[0]?.date && (
                          <span className="text-[10px] text-[#8E8E84] dark:text-[#94A493]">
                            Last: {patient.visits[0].date}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-[#2D6A4F] dark:text-[#52B788] translate-x-0.5' : 'text-[#8E8E84] dark:text-[#94A493]'}`} />
                  </button>
                );
              })}

              {filteredPatients.length === 0 && (
                <div className="p-8 text-center text-xs text-[#8E8E84] dark:text-[#94A493]">
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
                <div className="bg-white dark:bg-[#1C221C] rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6DFC6] dark:border-[#2F3B2F]">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#2D6A4F] dark:bg-[#357A5B] text-[#FAF7F2] flex items-center justify-center font-bold text-lg shadow-xs">
                        {activePatient.name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">{activePatient.name}</h2>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B6B63] dark:text-[#C4CFC3] mt-0.5">
                          <span>{activePatient.gender}</span>
                          <span>•</span>
                          <span>Age: {activePatient.age}</span>
                          <span>•</span>
                          <span className="text-[#2D6A4F] dark:text-[#52B788] font-semibold">{activePatient.visits.length} Total Visits Recorded</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-xs">
                    <div className="flex items-center gap-2 p-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#E6DFC6] dark:border-[#2F3B2F] rounded-xl text-[#22291F] dark:text-[#FAF7F2]">
                      <Phone className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788] shrink-0" />
                      <span className="font-semibold">{activePatient.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#E6DFC6] dark:border-[#2F3B2F] rounded-xl text-[#22291F] dark:text-[#FAF7F2] truncate">
                      <Mail className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788] shrink-0" />
                      <span className="font-semibold truncate">{activePatient.email}</span>
                    </div>
                  </div>
                </div>

                {/* Diagnostic Pathology & Lab Reports */}
                <div className="bg-white dark:bg-[#1C221C] rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] p-6 shadow-sm">
                  <LabReportsSection 
                    customPatientId={activePatient.id} 
                    customPatientName={activePatient.name} 
                  />
                </div>

                {/* Medical Consultations Timeline */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-[#22291F] dark:text-[#FAF7F2] flex items-center gap-2 font-heading">
                    <Clock className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788]" />
                    <span>Clinical Consultation Timeline ({activePatient.visits.length})</span>
                  </h3>

                  <div className="space-y-4">
                    {activePatient.visits.map((visit, index) => {
                      const isDone = visit.status === 'done';
                      const isCancelled = visit.status === 'cancelled';

                      return (
                        <div 
                          key={visit.id || index}
                          className="bg-white dark:bg-[#1C221C] rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] p-6 shadow-sm relative overflow-hidden"
                        >
                          {/* Left Accent Strip */}
                          <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                            isDone ? 'bg-[#2D6A4F] dark:bg-[#52B788]' : isCancelled ? 'bg-[#8E8E84] dark:bg-[#94A493]' : 'bg-[#C97B4A] dark:bg-[#E58A54]'
                          }`} />

                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E6DFC6] dark:border-[#2F3B2F]">
                            <div className="flex items-center gap-2.5">
                              <span className="px-2.5 py-1 rounded-lg bg-[#2D6A4F]/10 dark:bg-[#52B788]/20 text-[#2D6A4F] dark:text-[#52B788] font-black text-xs border border-[#2D6A4F]/20 dark:border-[#52B788]/30">
                                {visit.tokenNumber || 'TK'}
                              </span>
                              <div className="text-xs">
                                <span className="font-bold text-[#22291F] dark:text-[#FAF7F2]">Dr. {visit.doctorName.replace(/^Dr\.\s*/i, '')}</span>
                                <span className="text-[#6B6B63] dark:text-[#C4CFC3]"> ({visit.specialization})</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-[#6B6B63] dark:text-[#C4CFC3] font-medium">{visit.date} • {visit.time}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                isDone 
                                  ? 'bg-[#2D6A4F]/15 text-[#2D6A4F] dark:bg-[#52B788]/20 dark:text-[#52B788] border border-[#2D6A4F]/30 dark:border-[#52B788]/30'
                                  : isCancelled
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300 dark:border-rose-900/40'
                                  : 'bg-[#C97B4A]/15 text-[#B35F2B] dark:text-[#E58A54] border border-[#C97B4A]/30 dark:border-[#E58A54]/30'
                              }`}>
                                {visit.status}
                              </span>
                            </div>
                          </div>

                          {/* Reason */}
                          <div className="mt-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E84] dark:text-[#94A493] block mb-1">
                              Chief Complaint / Reason
                            </span>
                            <p className="text-xs text-[#22291F] dark:text-[#FAF7F2] bg-[#FAF7F2] dark:bg-[#242C24] border border-[#E6DFC6] dark:border-[#2F3B2F] p-2.5 rounded-xl">
                              {visit.reason || 'General Routine Consultation'}
                            </p>
                          </div>

                          {/* Diagnosis Block */}
                          {visit.diagnosis && (
                            <div className="mt-3 p-3 bg-[#2D6A4F]/5 dark:bg-[#242C24] border border-[#2D6A4F]/30 dark:border-[#52B788]/40 rounded-xl space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D6A4F] dark:text-[#52B788] block">
                                Confirmed Clinical Diagnosis
                              </span>
                              <p className="text-xs font-bold text-[#22291F] dark:text-[#FAF7F2]">
                                {visit.diagnosis}
                              </p>
                            </div>
                          )}

                          {/* Prescription Block */}
                          {visit.prescription && (
                            <div className="mt-3 p-3 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#E6DFC6] dark:border-[#2F3B2F] rounded-xl space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B63] dark:text-[#C4CFC3] flex items-center gap-1.5">
                                <Pill className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788]" />
                                Prescribed Medication &amp; Dosage
                              </span>
                              <pre className="text-xs font-mono text-[#22291F] dark:text-[#FAF7F2] whitespace-pre-wrap font-medium">
                                {visit.prescription}
                              </pre>
                            </div>
                          )}

                          {/* Clinical Notes */}
                          {visit.notes && (
                            <div className="mt-3 text-xs text-[#6B6B63] dark:text-[#C4CFC3]">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E84] dark:text-[#94A493] block mb-0.5">
                                Clinical Notes &amp; Observations:
                              </span>
                              <p className="italic bg-[#FAF7F2] dark:bg-[#242C24] border border-[#E6DFC6] dark:border-[#2F3B2F] p-2 rounded-lg text-[#22291F] dark:text-[#FAF7F2]">
                                {visit.notes}
                              </p>
                            </div>
                          )}

                          {/* Official Prescription Action */}
                          {isDone && (
                            <div className="mt-3 pt-3 border-t border-[#E6DFC6] dark:border-[#2F3B2F] flex items-center justify-end">
                              <button
                                onClick={() => setSelectedPrescription(visit)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#2D6A4F] dark:border-[#52B788] text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#2D6A4F]/10 dark:hover:bg-[#52B788]/15 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>View &amp; Print Official Rx Slip</span>
                              </button>
                            </div>
                          )}

                          {/* Pending Consultation Alert */}
                          {!isDone && !isCancelled && (
                            <div className="mt-3 flex items-center gap-2 p-2.5 bg-[#C97B4A]/10 border border-[#C97B4A]/30 rounded-xl text-xs text-[#B35F2B] dark:text-[#E58A54]">
                              <AlertCircle className="w-4 h-4 shrink-0 text-[#B35F2B] dark:text-[#E58A54]" />
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
              <div className="bg-white dark:bg-[#1C221C] rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] p-12 text-center text-xs text-[#8E8E84] dark:text-[#94A493]">
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
