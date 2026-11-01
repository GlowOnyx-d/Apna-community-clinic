import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { 
  Search, 
  Ticket, 
  Download, 
  PlusCircle, 
  Pill, 
  Activity, 
  Printer,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  X
} from 'lucide-react';
import WalkInTokenModal from '../../components/common/WalkInTokenModal';
import DispensaryModal from '../../components/common/DispensaryModal';
import VitalsModal from '../../components/common/VitalsModal';
import TokenSlipModal from '../../components/patient/TokenSlipModal';

const formatFriendlyDate = (dateStr, timeStr) => {
  if (!dateStr) return timeStr || 'Unscheduled';
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  let dateLabel = dateStr;
  if (dateStr === todayStr) {
    dateLabel = 'Today';
  } else if (dateStr === tomorrowStr) {
    dateLabel = 'Tomorrow';
  } else {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      if (!isNaN(dt.getTime())) {
        dateLabel = dt.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
      }
    } catch {
      dateLabel = dateStr;
    }
  }
  return timeStr ? `${dateLabel} · ${timeStr}` : dateLabel;
};

export default function AppointmentsMaster() {
  const { appointments, doctors, cancelAppointment } = useData();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDoctorId, setFilterDoctorId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [showDispensaryModal, setShowDispensaryModal] = useState(false);
  const [vitalsModalApt, setVitalsModalApt] = useState(null);
  const [slipModalApt, setSlipModalApt] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [expandedAptId, setExpandedAptId] = useState(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
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
  }, [appointments, filterStatus, filterDoctorId, searchQuery]);

  // Group filtered appointments by date with Today first
  const groupedAppointments = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    const sorted = [...filteredAppointments].sort((a, b) => {
      if (a.date === b.date) {
        return (a.time || '').localeCompare(b.time || '');
      }
      if (a.date === todayStr) return -1;
      if (b.date === todayStr) return 1;
      return (b.date || '').localeCompare(a.date || '');
    });

    const groups = {};
    sorted.forEach((apt) => {
      const d = apt.date || 'Unscheduled';
      if (!groups[d]) groups[d] = [];
      groups[d].push(apt);
    });

    return Object.entries(groups).map(([dateKey, items]) => {
      let label = dateKey;
      if (dateKey === todayStr) {
        label = 'Today';
      } else {
        try {
          const [y, m, d] = dateKey.split('-').map(Number);
          const dt = new Date(y, m - 1, d);
          if (!isNaN(dt.getTime())) {
            label = dt.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
          }
        } catch {
          label = dateKey;
        }
      }
      return { dateKey, label, items };
    });
  }, [filteredAppointments]);

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

  const renderStatus = (status) => {
    if (status === 'done') {
      return (
        <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>Done</span>
        </span>
      );
    }
    if (status === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400 text-xs">
          <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
          <span>Cancelled</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400 text-xs">
        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
        <span>Pending</span>
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#0F766E] dark:text-[#2DD4BF] uppercase tracking-wider">Clinical Administration</span>
          <h1 className="text-2xl font-black text-[#132226] dark:text-[#F4F7F6] tracking-tight mt-0.5 font-heading">
            Master Ledger
          </h1>
          <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA] mt-1">
            Centralized queue and appointment ledger for all doctors, clinics, and walk-in patients.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
          {/* Primary Action Button */}
          <button
            onClick={() => setShowWalkInModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Issue Walk-In Token</span>
          </button>

          {/* Quiet Outline Button */}
          <button
            onClick={() => setShowDispensaryModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-[#121C21] border border-[#CFDAD6] dark:border-[#2C444E] hover:bg-[#F4F7F6] dark:hover:bg-[#19272D] text-[#132226] dark:text-[#F4F7F6] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Pill className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" />
            <span>Pharmacy Desk</span>
          </button>

          {/* Quiet Outline Button */}
          <button
            onClick={exportToCSV}
            disabled={filteredAppointments.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-[#121C21] border border-[#CFDAD6] dark:border-[#2C444E] hover:bg-[#F4F7F6] dark:hover:bg-[#19272D] disabled:opacity-50 text-[#132226] dark:text-[#F4F7F6] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#758D94] dark:text-[#79949B]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#121C21] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] p-3.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search on left */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#758D94] dark:text-[#79949B] absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, doctor, or token..."
            className="w-full pl-9 pr-3.5 py-2 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-xs text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF] transition-all"
          />
        </div>

        {/* Center: Status Segmented Control */}
        <div className="flex items-center p-1 bg-[#F4F7F6] dark:bg-[#19272D] rounded-xl border border-[#E0E7E5] dark:border-[#21333A] overflow-x-auto no-scrollbar">
          {['all', 'pending', 'done', 'cancelled'].map((status) => {
            const isActive = filterStatus === status;
            const count = status === 'all' 
              ? appointments.length 
              : appointments.filter(a => a.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-[#121C21] text-[#0F766E] dark:text-[#2DD4BF] shadow-xs'
                    : 'text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#132226] dark:hover:text-[#F4F7F6]'
                }`}
              >
                {status} <span className="opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Right: Doctor Dropdown (without filter icon) */}
        <select
          value={filterDoctorId}
          onChange={(e) => setFilterDoctorId(e.target.value)}
          className="w-full md:w-auto px-3 py-2 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-xs font-medium text-[#132226] dark:text-[#F4F7F6] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF] cursor-pointer"
        >
          <option value="all">All Doctors</option>
          {doctors.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Appointments List: Mobile Cards (<768px) + Desktop Table (>=768px) */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-[#F4F7F6] dark:bg-[#121C21] rounded-3xl border border-dashed border-[#CFDAD6] dark:border-[#21333A] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0F766E]/10 dark:bg-[#0D9488]/20 border border-[#0F766E]/20 dark:border-[#2DD4BF]/30 text-[#0F766E] dark:text-[#2DD4BF] flex items-center justify-center mx-auto">
            <Ticket className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">No Appointments Found</h3>
          <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA] max-w-sm mx-auto">
            {appointments.length === 0
              ? 'No appointments recorded in the system yet. Once patients book consultations, they will appear here in the master registry.'
              : 'No appointments match the selected filter criteria.'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile View: Stacked Cards (<768px) */}
          <div className="space-y-4 md:hidden">
            {groupedAppointments.map((group) => (
              <div key={group.dateKey} className="space-y-3">
                <div className="px-1 text-xs font-bold text-[#0F766E] dark:text-[#2DD4BF] uppercase tracking-wider">
                  {group.label} ({group.items.length})
                </div>

                {group.items.map((apt) => {
                  const isMenuOpen = activeMenuId === apt.id;
                  const isExpanded = expandedAptId === apt.id;

                  return (
                    <div
                      key={apt.id}
                      className="p-4 bg-white dark:bg-[#121C21] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] shadow-xs space-y-3 relative"
                    >
                      {/* Top Row: Token Badge, Date/Time & Status */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-[#0F766E]/10 dark:bg-[#0D9488]/20 text-[#0F766E] dark:text-[#2DD4BF] rounded-lg font-bold font-mono text-xs">
                            {apt.tokenNumber || 'TK'}
                          </span>
                          <span className="text-xs font-medium text-[#5A7178] dark:text-[#9DB4BA]">
                            {formatFriendlyDate(apt.date, apt.time)}
                          </span>
                        </div>
                        {renderStatus(apt.status)}
                      </div>

                      {/* Patient Info */}
                      <div>
                        <h3 className="font-bold text-sm text-[#132226] dark:text-[#F4F7F6] font-heading">
                          {apt.patientName}
                        </h3>
                        <p className="text-xs text-[#758D94] dark:text-[#79949B]">
                          {apt.patientPhone || apt.patientEmail || 'No contact info'}
                        </p>
                      </div>

                      {/* Doctor Info */}
                      <div className="p-2.5 bg-[#F4F7F6] dark:bg-[#19272D] rounded-xl text-xs border border-[#E0E7E5] dark:border-[#21333A] flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-[#132226] dark:text-[#F4F7F6]">
                            {apt.doctorName}
                          </p>
                          <p className="text-xs text-[#0F766E] dark:text-[#2DD4BF]">
                            {apt.specialization}
                          </p>
                        </div>
                        {(apt.reason || apt.diagnosis) && (
                          <button
                            type="button"
                            onClick={() => setExpandedAptId(isExpanded ? null : apt.id)}
                            className="p-1 text-[#758D94] hover:text-[#132226] dark:text-[#79949B] dark:hover:text-[#F4F7F6]"
                            title="Toggle Reason"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        )}
                      </div>

                      {/* Expandable Reason / Diagnosis */}
                      {isExpanded && (apt.reason || apt.diagnosis) && (
                        <div className="p-2.5 bg-[#F4F7F6]/60 dark:bg-[#19272D]/60 rounded-xl text-xs space-y-1 border border-[#E0E7E5] dark:border-[#21333A]">
                          {apt.reason && (
                            <p><strong className="text-[#132226] dark:text-[#F4F7F6]">Reason:</strong> {apt.reason}</p>
                          )}
                          {apt.diagnosis && (
                            <p className="text-[#0F766E] dark:text-[#2DD4BF]"><strong className="font-bold">Diagnosis:</strong> {apt.diagnosis}</p>
                          )}
                        </div>
                      )}

                      {/* Action buttons footer */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E0E7E5] dark:border-[#21333A]">
                        <button
                          type="button"
                          onClick={() => setVitalsModalApt(apt)}
                          className={`p-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                            apt.vitals
                              ? 'bg-[#0F766E]/15 text-[#0F766E] dark:text-[#2DD4BF]'
                              : 'border border-[#CFDAD6] dark:border-[#2C444E] text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#0F766E] dark:hover:text-[#2DD4BF]'
                          }`}
                          title="Pre-Consultation Vitals & Triage"
                        >
                          <Activity className="w-4 h-4" />
                          <span>{apt.vitals ? 'Vitals ✓' : '+ Vitals'}</span>
                        </button>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : apt.id);
                            }}
                            className="p-2 text-[#758D94] hover:text-[#132226] dark:text-[#79949B] dark:hover:text-[#F4F7F6] rounded-xl border border-[#CFDAD6] dark:border-[#2C444E] hover:bg-[#F4F7F6] dark:hover:bg-[#19272D] transition-colors cursor-pointer"
                            title="More options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div
                              className="absolute right-0 bottom-full mb-1 w-36 bg-white dark:bg-[#121C21] rounded-xl border border-[#E0E7E5] dark:border-[#21333A] shadow-lg py-1 z-20 animate-in fade-in zoom-in-95"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setSlipModalApt(apt);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#132226] dark:text-[#F4F7F6] hover:bg-[#F4F7F6] dark:hover:bg-[#19272D] text-left cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#2DD4BF]" />
                                <span>Token Slip</span>
                              </button>
                              {apt.status === 'pending' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    if (window.confirm(`Cancel token ${apt.tokenNumber || ''} for ${apt.patientName}?`)) {
                                      cancelAppointment(apt.id);
                                    }
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Cancel Token</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Desktop View: Full Data Table (>=768px) */}
          <div className="hidden md:block bg-white dark:bg-[#121C21] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E0E7E5] dark:border-[#21333A] bg-[#F4F7F6]/80 dark:bg-[#0B1114] text-[#5A7178] dark:text-[#9DB4BA] font-bold uppercase tracking-wider text-xs">
                    <th className="py-3.5 px-4">Token</th>
                    <th className="py-3.5 px-4">Patient</th>
                    <th className="py-3.5 px-4">Doctor</th>
                    <th className="py-3.5 px-4">Date &amp; Time</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E7E5] dark:divide-[#21333A]">
                  {groupedAppointments.map((group) => (
                    <React.Fragment key={group.dateKey}>
                      {/* Sticky Date Header Row */}
                      <tr className="sticky top-16 z-10 bg-[#F4F7F6] dark:bg-[#0B1114] border-y border-[#E0E7E5] dark:border-[#21333A]">
                        <td colSpan={6} className="py-2.5 px-4 font-bold text-xs text-[#0F766E] dark:text-[#2DD4BF] uppercase tracking-wider">
                          {group.label} ({group.items.length})
                        </td>
                      </tr>

                      {group.items.map((apt) => {
                        const isMenuOpen = activeMenuId === apt.id;
                        const isExpanded = expandedAptId === apt.id;

                        return (
                          <React.Fragment key={apt.id}>
                            <tr
                              className="hover:bg-[#F4F7F6]/60 dark:hover:bg-[#19272D]/50 transition-colors"
                            >
                              {/* Token */}
                              <td className="py-3.5 px-4 font-bold font-mono text-[#132226] dark:text-[#F4F7F6]">
                                <span className="px-2.5 py-1 bg-[#0F766E]/10 dark:bg-[#0D9488]/20 text-[#0F766E] dark:text-[#2DD4BF] rounded-lg">
                                  {apt.tokenNumber || 'TK'}
                                </span>
                              </td>

                              {/* Patient (Name + Muted Phone) */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-semibold text-xs text-[#132226] dark:text-[#F4F7F6] font-heading">
                                    {apt.patientName}
                                  </p>
                                  {(apt.reason || apt.diagnosis) && (
                                    <button
                                      type="button"
                                      onClick={() => setExpandedAptId(isExpanded ? null : apt.id)}
                                      className="text-[#758D94] hover:text-[#0F766E] dark:hover:text-[#2DD4BF] cursor-pointer"
                                      title="Toggle Reason/Diagnosis note"
                                    >
                                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </button>
                                  )}
                                </div>
                                <p className="text-xs text-[#758D94] dark:text-[#79949B]">
                                  {apt.patientPhone || apt.patientEmail || 'No contact'}
                                </p>
                              </td>

                              {/* Doctor (Name + Muted Specialization) */}
                              <td className="py-3.5 px-4">
                                <p className="font-semibold text-xs text-[#132226] dark:text-[#F4F7F6]">
                                  {apt.doctorName}
                                </p>
                                <p className="text-xs text-[#0F766E] dark:text-[#2DD4BF]">
                                  {apt.specialization}
                                </p>
                              </td>

                              {/* Date & Time (Friendly Format) */}
                              <td className="py-3.5 px-4 text-xs font-medium text-[#132226] dark:text-[#F4F7F6]">
                                {formatFriendlyDate(apt.date, apt.time)}
                              </td>

                              {/* Status (Dot + Word) */}
                              <td className="py-3.5 px-4">
                                {renderStatus(apt.status)}
                              </td>

                              {/* Actions: Primary Vitals Icon + "..." Overflow Menu */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setVitalsModalApt(apt)}
                                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                                      apt.vitals
                                        ? 'bg-[#0F766E]/15 text-[#0F766E] dark:text-[#2DD4BF]'
                                        : 'border border-[#CFDAD6] dark:border-[#2C444E] text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#0F766E] dark:hover:text-[#2DD4BF] hover:bg-[#0F766E]/5'
                                    }`}
                                    title={apt.vitals ? "Vitals Recorded ✓" : "Record Vitals & Triage"}
                                  >
                                    <Activity className="w-4 h-4" />
                                  </button>

                                  <div className="relative">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(isMenuOpen ? null : apt.id);
                                      }}
                                      className="p-2 text-[#758D94] hover:text-[#132226] dark:text-[#79949B] dark:hover:text-[#F4F7F6] rounded-xl border border-[#CFDAD6] dark:border-[#2C444E] hover:bg-[#F4F7F6] dark:hover:bg-[#19272D] transition-colors cursor-pointer"
                                      title="More options"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </button>

                                    {isMenuOpen && (
                                      <div
                                        className="absolute right-0 bottom-full mb-1 w-36 bg-white dark:bg-[#121C21] rounded-xl border border-[#E0E7E5] dark:border-[#21333A] shadow-lg py-1 z-20 animate-in fade-in zoom-in-95 text-left"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveMenuId(null);
                                            setSlipModalApt(apt);
                                          }}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#132226] dark:text-[#F4F7F6] hover:bg-[#F4F7F6] dark:hover:bg-[#19272D] cursor-pointer"
                                        >
                                          <Printer className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#2DD4BF]" />
                                          <span>Token Slip</span>
                                        </button>

                                        {apt.status === 'pending' && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setActiveMenuId(null);
                                              if (window.confirm(`Cancel token ${apt.tokenNumber || ''} for ${apt.patientName}?`)) {
                                                cancelAppointment(apt.id);
                                              }
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                            <span>Cancel Token</span>
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>

                            {/* Expandable Reason & Diagnosis row */}
                            {isExpanded && (apt.reason || apt.diagnosis) && (
                              <tr className="bg-[#F4F7F6]/50 dark:bg-[#19272D]/40 text-xs">
                                <td colSpan={6} className="py-2.5 px-4 pl-12 border-t border-dashed border-[#E0E7E5] dark:border-[#21333A]">
                                  <div className="flex flex-wrap gap-4 text-xs text-[#5A7178] dark:text-[#9DB4BA]">
                                    {apt.reason && (
                                      <div><strong className="text-[#132226] dark:text-[#F4F7F6]">Reason:</strong> {apt.reason}</div>
                                    )}
                                    {apt.diagnosis && (
                                      <div><strong className="text-[#0F766E] dark:text-[#2DD4BF]">Diagnosis:</strong> {apt.diagnosis}</div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Walk-in Token Registration Modal */}
      <WalkInTokenModal
        isOpen={showWalkInModal}
        onClose={() => setShowWalkInModal(false)}
      />

      {/* Free Dispensary / Pharmacy Desk Modal */}
      <DispensaryModal
        isOpen={showDispensaryModal}
        onClose={() => setShowDispensaryModal(false)}
      />

      {/* Pre-Consultation Vitals / Triage Modal */}
      <VitalsModal
        isOpen={Boolean(vitalsModalApt)}
        appointment={vitalsModalApt}
        onClose={() => setVitalsModalApt(null)}
      />

      {/* Token Slip & Email Modal */}
      <TokenSlipModal
        isOpen={Boolean(slipModalApt)}
        appointment={slipModalApt}
        onClose={() => setSlipModalApt(null)}
      />

    </div>
  );
}
