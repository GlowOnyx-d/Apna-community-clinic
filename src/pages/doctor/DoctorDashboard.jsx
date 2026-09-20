import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { 
  Stethoscope, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Ticket,
  X,
  Search
} from 'lucide-react';

export default function DoctorDashboard() {
  const { userProfile, role } = useAuth();
  const { appointments, doctors, completeConsultation } = useData();

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today'
  const [adminSelectedDoctorId, setAdminSelectedDoctorId] = useState('all');

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to normalize and match names
  const matchDoctor = (apt, profile) => {
    if (!profile) return false;
    if (apt.doctorId && profile.uid && apt.doctorId === profile.uid) return true;
    if (apt.doctorEmail && profile.email && apt.doctorEmail.toLowerCase() === profile.email.toLowerCase()) return true;
    if (apt.doctorName && profile.name) {
      const cleanA = apt.doctorName.replace(/^Dr\.\s*/i, '').trim().toLowerCase();
      const cleanB = profile.name.replace(/^Dr\.\s*/i, '').trim().toLowerCase();
      if (cleanA === cleanB) return true;
    }
    return false;
  };

  // Filter appointments for this doctor (or selected doctor if admin)
  const doctorAppointments = useMemo(() => {
    return appointments.filter(apt => {
      // 1. Role-based doctor matching
      if (role === 'admin') {
        if (adminSelectedDoctorId !== 'all' && apt.doctorId !== adminSelectedDoctorId) {
          return false;
        }
      } else {
        // Logged-in doctor
        const matches = matchDoctor(apt, userProfile);
        if (!matches) return false;
      }

      // 2. Date Filter
      if (dateFilter === 'today' && apt.date !== todayStr) {
        return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPatient = apt.patientName?.toLowerCase().includes(q);
        const matchesToken = apt.tokenNumber?.toLowerCase().includes(q);
        const matchesReason = apt.reason?.toLowerCase().includes(q);
        if (!matchesPatient && !matchesToken && !matchesReason) return false;
      }

      return true;
    });
  }, [appointments, role, userProfile, adminSelectedDoctorId, dateFilter, searchQuery, todayStr]);

  const pendingQueue = doctorAppointments.filter(a => a.status === 'pending');
  const completedVisits = doctorAppointments.filter(a => a.status === 'done');

  const handleOpenConsultation = (apt) => {
    setSelectedAppointment(apt);
    setDiagnosis(apt.diagnosis || '');
    setNotes(apt.notes || '');
    setPrescription(apt.prescription || '');
  };

  const handleSaveConsultation = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      setLoading(true);
      await completeConsultation(selectedAppointment.id, {
        diagnosis,
        notes,
        prescription
      });
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Failed to complete consultation:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#F0EBE1] dark:bg-[#1C221C] border border-[#E4DCCE] dark:border-[#2F3B2F] text-[#22291F] dark:text-[#FAF7F2] p-6 sm:p-8 shadow-sm">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D6A4F]/10 dark:bg-[#52B788]/20 text-[#2D6A4F] dark:text-[#52B788] text-xs font-semibold border border-[#2D6A4F]/20 dark:border-[#52B788]/30">
            <Stethoscope className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788]" />
            <span>Doctor Clinical Consultation Queue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-[#22291F] dark:text-[#FAF7F2]">
            Welcome, {userProfile?.name || 'Doctor'}
          </h1>
          <p className="text-sm text-[#6B6B63] dark:text-[#C4CFC3]">
            {userProfile?.specialization || 'Clinical Specialist'} • Manage your daily patient token stream and record diagnostic notes.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#1C221C] p-3.5 sm:p-5 rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#C97B4A]/12 dark:bg-[#E58A54]/18 text-[#C97B4A] dark:text-[#E58A54] border border-[#C97B4A]/25 dark:border-[#E58A54]/30 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider">In Queue</p>
            <p className="text-xl sm:text-2xl font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">{pendingQueue.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1C221C] p-3.5 sm:p-5 rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#2D6A4F]/10 dark:bg-[#52B788]/20 text-[#2D6A4F] dark:text-[#52B788] border border-[#2D6A4F]/20 dark:border-[#52B788]/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider">Completed</p>
            <p className="text-xl sm:text-2xl font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">{completedVisits.length}</p>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-[#1C221C] p-3.5 sm:p-5 rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#2D6A4F]/10 dark:bg-[#52B788]/20 text-[#2D6A4F] dark:text-[#52B788] border border-[#2D6A4F]/20 dark:border-[#52B788]/30 flex items-center justify-center shrink-0">
            <Ticket className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider">Total Appointments</p>
            <p className="text-xl sm:text-2xl font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">{doctorAppointments.length}</p>
          </div>
        </div>
      </div>

      {/* Queue Filter & Search Toolbar */}
      <div className="bg-white dark:bg-[#1C221C] rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#8E8E84] dark:text-[#94A493] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, token, or symptom..."
            className="w-full pl-10 pr-4 py-2 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-xs text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Admin Doctor Switcher */}
          {role === 'admin' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] font-medium">Doctor:</span>
              <select
                value={adminSelectedDoctorId}
                onChange={(e) => setAdminSelectedDoctorId(e.target.value)}
                className="px-3 py-1.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-xs font-medium text-[#22291F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788]"
              >
                <option value="all">All Doctors ({doctors.length})</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Date Filter */}
          <div className="flex bg-[#FAF7F2] dark:bg-[#242C24] p-1 rounded-xl gap-1 border border-[#D8CEB3] dark:border-[#2F3B2F]">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                dateFilter === 'today' ? 'bg-[#2D6A4F] dark:bg-[#357A5B] text-[#FAF7F2]' : 'text-[#6B6B63] dark:text-[#C4CFC3] hover:text-[#22291F] dark:hover:text-[#FAF7F2]'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                dateFilter === 'all' ? 'bg-[#2D6A4F] dark:bg-[#357A5B] text-[#FAF7F2]' : 'text-[#6B6B63] dark:text-[#C4CFC3] hover:text-[#22291F] dark:hover:text-[#FAF7F2]'
              }`}
            >
              All Dates
            </button>
          </div>
        </div>
      </div>

      {/* Queue Table / List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">
            {dateFilter === 'today' ? "Today's Active Patient Queue" : "Active Patient Queue"} ({pendingQueue.length})
          </h2>
          <span className="text-xs font-medium text-[#6B6B63] dark:text-[#C4CFC3]">
            Sorted by daily token sequence
          </span>
        </div>

        {pendingQueue.length === 0 ? (
          <div className="bg-[#FAF7F2] dark:bg-[#1C221C] rounded-2xl border border-dashed border-[#D8CEB3] dark:border-[#2F3B2F] p-12 text-center space-y-3">
            <div className="w-11 h-11 rounded-xl bg-[#2D6A4F]/10 dark:bg-[#52B788]/20 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center mx-auto">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#22291F] dark:text-[#FAF7F2] font-heading">No Patients in Queue</h3>
            <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] max-w-sm mx-auto">
              There are no pending consultation tokens right now. New patient bookings will automatically populate this queue.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingQueue.map((apt) => (
              <div key={apt.id} className="bg-white dark:bg-[#1C221C] rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] hover:border-[#2D6A4F]/40 dark:hover:border-[#445644] p-5 shadow-sm transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-xl bg-[#2D6A4F] dark:bg-[#357A5B] text-[#FAF7F2] font-bold text-sm tracking-wider shadow-xs">
                      {apt.tokenNumber || 'TK'}
                    </span>
                    <span className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788]" /> {apt.time}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">{apt.patientName}</h3>
                  <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] mt-0.5">
                    {apt.patientGender || 'Unspecified'}, {apt.patientAge || 'Age N/A'} • {apt.patientPhone || 'No Phone'}
                  </p>

                  <div className="mt-3 p-3 bg-[#FAF7F2] dark:bg-[#242C24] rounded-xl text-xs space-y-1 border border-[#E6DFC6] dark:border-[#2F3B2F]">
                    <span className="text-[#8E8E84] dark:text-[#94A493] font-semibold block uppercase text-[10px]">Reason for Consultation</span>
                    <p className="text-[#22291F] dark:text-[#FAF7F2]">{apt.reason || 'General Consultation'}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenConsultation(apt)}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Start Consultation &amp; Record Diagnosis</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Consultation Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#1C221C] w-full max-w-xl rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6DFC6] dark:border-[#2F3B2F]">
              <div>
                <span className="text-xs font-semibold text-[#2D6A4F] dark:text-[#52B788] uppercase tracking-wider">Consultation Token: {selectedAppointment.tokenNumber}</span>
                <h3 className="text-lg font-bold text-[#22291F] dark:text-[#FAF7F2] mt-0.5 font-heading">
                  Patient: {selectedAppointment.patientName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-1.5 rounded-lg text-[#6B6B63] hover:bg-[#FAF7F2] dark:text-[#C4CFC3] dark:hover:bg-[#242C24] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConsultation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                  Clinical Diagnosis *
                </label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Viral Bronchitis, Hypertension Stage 1"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                  Prescription &amp; Medication
                </label>
                <textarea
                  rows={3}
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  placeholder="1. Tab Paracetamol 500mg TDS&#10;2. Cough Syrup 10ml BD"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] transition-colors font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                  Clinical Observations &amp; Follow-up Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Review after 5 days if fever persists. Advised hydration."
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAppointment(null)}
                  className="px-4 py-2 text-xs font-medium text-[#6B6B63] hover:bg-[#FAF7F2] dark:text-[#C4CFC3] dark:hover:bg-[#242C24] border border-[#D8CEB3] dark:border-[#2F3B2F] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Saving Notes...' : 'Complete Consultation & Save Notes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
