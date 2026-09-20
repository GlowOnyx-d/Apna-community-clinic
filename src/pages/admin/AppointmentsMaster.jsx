import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Search, Ticket, Download, Filter } from 'lucide-react';

export default function AppointmentsMaster() {
  const { appointments, doctors, cancelAppointment } = useData();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDoctorId, setFilterDoctorId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    const matchesDoctor = filterDoctorId === 'all' || apt.doctorId === filterDoctorId;
    const matchesSearch =
      !searchQuery ||
      apt.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.tokenNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesDoctor && matchesSearch;
  });

  const exportToCSV = () => {
    if (filteredAppointments.length === 0) return;
    const headers = ['Token', 'Patient Name', 'Phone', 'Doctor', 'Specialization', 'Date', 'Time', 'Status', 'Reason', 'Diagnosis'];
    const rows = filteredAppointments.map(a => [
      `"${a.tokenNumber || ''}"`,
      `"${(a.patientName || '').replace(/"/g, '""')}"`,
      `"${a.patientPhone || ''}"`,
      `"${(a.doctorName || '').replace(/"/g, '""')}"`,
      `"${(a.specialization || '').replace(/"/g, '""')}"`,
      `"${a.date || ''}"`,
      `"${a.time || ''}"`,
      `"${a.status || ''}"`,
      `"${(a.reason || '').replace(/"/g, '""')}"`,
      `"${(a.diagnosis || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Apna_Appointments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#2D6A4F] dark:text-[#52B788] uppercase tracking-wider">Master Clinic Registry</span>
          <h1 className="text-2xl font-black text-[#22291F] dark:text-[#F5F1EA] tracking-tight mt-0.5 font-heading">
            Master Appointments &amp; Token Queue
          </h1>
          <p className="text-xs text-[#6B6B63] dark:text-[#9EAA9A] mt-1">
            Complete centralized registry of all booked clinic consultations, token allocations, and visit statuses.
          </p>
        </div>

        <button
          onClick={exportToCSV}
          disabled={filteredAppointments.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2D6A4F] hover:bg-[#245740] disabled:opacity-50 text-[#F5F1EA] text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-center cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export to CSV ({filteredAppointments.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#222722] rounded-2xl border border-[#E6DFC6] dark:border-[#2D352C] p-3.5 sm:p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#8E8E84] dark:text-[#71806F] absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, doctor, or token..."
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] dark:bg-[#1A1D19] border border-[#D8CEB3] dark:border-[#2D352C] rounded-xl text-xs text-[#22291F] dark:text-[#F5F1EA] placeholder-[#8E8E84] dark:placeholder-[#71806F] focus:outline-none focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F] transition-all"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Doctor Filter Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-[#6B6B63] dark:text-[#9EAA9A] shrink-0" />
            <select
              value={filterDoctorId}
              onChange={(e) => setFilterDoctorId(e.target.value)}
              className="w-full sm:w-auto px-2.5 py-1.5 bg-[#FAF7F2] dark:bg-[#1A1D19] border border-[#D8CEB3] dark:border-[#2D352C] rounded-lg text-xs font-medium text-[#22291F] dark:text-[#F5F1EA] focus:outline-none focus:border-[#2D6A4F]"
            >
              <option value="all">All Doctors</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
            {['all', 'pending', 'done', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer shrink-0 ${filterStatus === status
                  ? 'bg-[#2D6A4F] text-[#F5F1EA] shadow-xs'
                  : 'bg-[#FAF7F2] dark:bg-[#1A1D19] border border-[#D8CEB3] dark:border-[#2D352C] text-[#6B6B63] dark:text-[#9EAA9A] hover:text-[#22291F] dark:hover:text-[#F5F1EA] hover:border-[#2D6A4F]/40'
                  }`}
              >
                {status} ({status === 'all' ? appointments.length : appointments.filter(a => a.status === status).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments List: Mobile Cards + Desktop Table */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-[#FAF7F2] dark:bg-[#222722] rounded-3xl border border-dashed border-[#D8CEB3] dark:border-[#2D352C] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#2D6A4F]/10 dark:bg-[#2D6A4F]/20 border border-[#2D6A4F]/20 dark:border-[#2D6A4F]/30 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center mx-auto">
            <Ticket className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#22291F] dark:text-[#F5F1EA] font-heading">No Appointments Found</h3>
          <p className="text-xs text-[#6B6B63] dark:text-[#9EAA9A] max-w-sm mx-auto">
            {appointments.length === 0
              ? 'No appointments recorded in the system yet. Once patients book consultations, they will appear here in the master registry.'
              : 'No appointments match the selected filter criteria.'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile View: Responsive Cards (<md) */}
          <div className="space-y-3 md:hidden">
            {filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 bg-white dark:bg-[#222722] rounded-2xl border border-[#E6DFC6] dark:border-[#2D352C] shadow-xs space-y-3"
              >
                {/* Top Row: Token Badge, Status Badge & Action */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-[#2D6A4F]/10 dark:bg-[#2D6A4F]/25 text-[#2D6A4F] dark:text-[#52B788] border border-[#2D6A4F]/25 dark:border-[#2D6A4F]/35 rounded-lg font-bold font-mono text-xs">
                      {apt.tokenNumber || 'TK'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        apt.status === 'done'
                          ? 'bg-[#2D6A4F]/15 text-[#2D6A4F] dark:bg-[#2D6A4F]/20 dark:text-[#52B788] border border-[#2D6A4F]/30'
                          : apt.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300 dark:border-rose-900/40'
                          : 'bg-[#C97B4A]/15 text-[#C97B4A] border border-[#C97B4A]/30'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  {apt.status === 'pending' && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Cancel token ${apt.tokenNumber} for ${apt.patientName}?`)) {
                          cancelAppointment(apt.id);
                        }
                      }}
                      className="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {/* Patient Information */}
                <div>
                  <h3 className="font-bold text-sm text-[#22291F] dark:text-[#F5F1EA] font-heading">
                    {apt.patientName}
                  </h3>
                  <p className="text-xs text-[#8E8E84] dark:text-[#71806F]">
                    {apt.patientPhone || apt.patientEmail || 'No contact phone'}
                  </p>
                </div>

                {/* Doctor & Schedule Grid */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#FAF7F2] dark:bg-[#1A1D19] rounded-xl text-xs border border-[#E6DFC6] dark:border-[#2D352C]">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-[#8E8E84] dark:text-[#71806F] block">
                      Doctor
                    </span>
                    <p className="font-bold text-[#22291F] dark:text-[#F5F1EA] truncate">
                      {apt.doctorName}
                    </p>
                    <p className="text-[10px] text-[#2D6A4F] dark:text-[#52B788] truncate">
                      {apt.specialization}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8E8E84] dark:text-[#71806F] block">
                      Schedule
                    </span>
                    <p className="font-semibold text-[#22291F] dark:text-[#F5F1EA]">
                      {apt.date}
                    </p>
                    <p className="text-[11px] text-[#6B6B63] dark:text-[#9EAA9A]">
                      {apt.time}
                    </p>
                  </div>
                </div>

                {/* Reason / Diagnosis */}
                {(apt.reason || apt.diagnosis) && (
                  <div className="text-xs space-y-0.5 text-[#6B6B63] dark:text-[#9EAA9A] pt-0.5">
                    {apt.reason && (
                      <p className="truncate">
                        <strong className="text-[#8E8E84] dark:text-[#71806F]">Reason:</strong> {apt.reason}
                      </p>
                    )}
                    {apt.diagnosis && (
                      <p className="text-[#2D6A4F] dark:text-[#52B788] truncate">
                        <strong className="font-bold">Dx:</strong> {apt.diagnosis}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop View: Full Data Table (>=md) */}
          <div className="hidden md:block bg-white dark:bg-[#222722] rounded-2xl border border-[#E6DFC6] dark:border-[#2D352C] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E6DFC6] dark:border-[#2D352C] bg-[#FAF7F2] dark:bg-[#1A1D19]/60 text-[#6B6B63] dark:text-[#9EAA9A] font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Token</th>
                    <th className="py-3.5 px-4">Patient</th>
                    <th className="py-3.5 px-4">Assigned Doctor</th>
                    <th className="py-3.5 px-4">Date &amp; Time</th>
                    <th className="py-3.5 px-4">Reason / Concern</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DFC6] dark:divide-[#2D352C]">
                  {filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-[#FAF7F2] dark:hover:bg-[#1A1D19]/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#22291F] dark:text-[#F5F1EA]">
                        <span className="px-2.5 py-1 bg-[#2D6A4F]/10 dark:bg-[#2D6A4F]/20 text-[#2D6A4F] dark:text-[#52B788] border border-[#2D6A4F]/20 dark:border-[#2D6A4F]/30 rounded-lg">
                          {apt.tokenNumber || 'TK'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-[#22291F] dark:text-[#F5F1EA] font-heading">{apt.patientName}</p>
                        <p className="text-[11px] text-[#8E8E84] dark:text-[#71806F]">{apt.patientPhone || apt.patientEmail || 'No contact'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-[#22291F] dark:text-[#F5F1EA] font-heading">{apt.doctorName}</p>
                        <p className="text-[11px] text-[#2D6A4F] dark:text-[#52B788]">{apt.specialization}</p>
                      </td>
                      <td className="py-3 px-4 text-[#6B6B63] dark:text-[#9EAA9A]">
                        <p className="font-medium text-[#22291F] dark:text-[#F5F1EA]">{apt.date}</p>
                        <p className="text-[11px] text-[#8E8E84] dark:text-[#71806F]">{apt.time}</p>
                      </td>
                      <td className="py-3 px-4 text-[#6B6B63] dark:text-[#9EAA9A] max-w-[200px]">
                        <p className="truncate text-[#22291F] dark:text-[#F5F1EA]" title={apt.reason}>{apt.reason || 'General Consultation'}</p>
                        {apt.diagnosis && <p className="truncate text-[10px] text-[#2D6A4F] dark:text-[#52B788]">Dx: {apt.diagnosis}</p>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${apt.status === 'done'
                          ? 'bg-[#2D6A4F]/15 text-[#2D6A4F] dark:bg-[#2D6A4F]/20 dark:text-[#52B788] border border-[#2D6A4F]/30'
                          : apt.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300 dark:border-rose-900/40'
                            : 'bg-[#C97B4A]/15 text-[#C97B4A] border border-[#C97B4A]/30'
                          }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {apt.status === 'pending' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Cancel token ${apt.tokenNumber} for ${apt.patientName}?`)) {
                                cancelAppointment(apt.id);
                              }
                            }}
                            className="px-2.5 py-1 text-xs text-[#6B6B63] dark:text-[#9EAA9A] hover:text-[#C97B4A] hover:bg-[#C97B4A]/10 border border-[#D8CEB3] dark:border-[#2D352C] hover:border-[#C97B4A]/40 rounded-lg font-semibold transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
