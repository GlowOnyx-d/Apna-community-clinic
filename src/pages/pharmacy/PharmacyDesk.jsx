import React, { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { sendDirectSMS, formatPharmacyPickupSMS } from '../../services/smsService';
import {
  Pill,
  CheckCircle2,
  Clock,
  Search,
  FileText,
  Printer,
  MessageSquare,
  Sparkles,
  AlertCircle,
  Package,
  Layers,
  HeartHandshake,
  User,
  Stethoscope,
  X,
  Phone,
  Check,
  Plus,
  RefreshCw,
  Info
} from 'lucide-react';
import { getPatientAvatar, getPatientFallbackAvatar } from '../../utils/patientVisuals';
import PatientAvatar from '../../components/common/PatientAvatar';

export default function PharmacyDesk() {
  const { userProfile, role } = useAuth();
  const { appointments, pharmacyStock, dispensePrescription, updatePharmacyStock, showToast } = useData();

  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'inventory'
  const [filter, setFilter] = useState('pending'); // 'pending' | 'dispensed' | 'all'
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [checkedMeds, setCheckedMeds] = useState({}); // { [aptId_medIndex]: boolean }
  const [selectedLabelApt, setSelectedLabelApt] = useState(null);
  const [smsSentMap, setSmsSentMap] = useState({});
  const [restockItem, setRestockItem] = useState(null);
  const [restockAmount, setRestockAmount] = useState('100');

  // Filter completed appointments that have prescriptions
  const prescriptionAppointments = useMemo(() => {
    return appointments.filter(a => {
      if (a.status !== 'done' || !a.prescription || a.prescription.trim() === '') return false;

      const isDispensed = a.dispensaryStatus === 'dispensed';
      if (filter === 'pending' && isDispensed) return false;
      if (filter === 'dispensed' && !isDispensed) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = a.patientName?.toLowerCase().includes(q);
        const matchesToken = a.tokenNumber?.toLowerCase().includes(q);
        const matchesRx = a.prescription?.toLowerCase().includes(q);
        const matchesPhone = a.patientPhone?.toLowerCase().includes(q);
        const matchesDoc = a.doctorName?.toLowerCase().includes(q);
        if (!matchesName && !matchesToken && !matchesRx && !matchesPhone && !matchesDoc) return false;
      }

      return true;
    });
  }, [appointments, filter, search]);

  // Statistics
  const pendingCount = useMemo(() => {
    return appointments.filter(a => a.status === 'done' && a.prescription && a.dispensaryStatus !== 'dispensed').length;
  }, [appointments]);

  const dispensedCount = useMemo(() => {
    return appointments.filter(a => a.status === 'done' && a.prescription && a.dispensaryStatus === 'dispensed').length;
  }, [appointments]);

  const totalStockItems = useMemo(() => {
    return (pharmacyStock || []).reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
  }, [pharmacyStock]);

  const lowStockCount = useMemo(() => {
    return (pharmacyStock || []).filter(item => (Number(item.stock) || 0) <= (item.minAlert || 50)).length;
  }, [pharmacyStock]);

  const handleDispense = async (aptId) => {
    try {
      setProcessingId(aptId);
      await dispensePrescription(aptId, 'Verified and dispensed with verbal dosage instructions.');
    } catch (err) {
      console.error('Dispense failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSendPickupSMS = async (apt) => {
    const phone = (apt.patientPhone || '').trim();
    if (!phone) {
      showToast('No phone number recorded for this patient.', 'error');
      return;
    }

    const smsBody = formatPharmacyPickupSMS(apt);

    try {
      await sendDirectSMS({
        recipientPhone: phone,
        message: smsBody,
        tokenNumber: apt.tokenNumber,
        patientName: apt.patientName,
        doctorName: apt.doctorName,
        type: 'pharmacy_pickup'
      });
      setSmsSentMap(prev => ({ ...prev, [apt.id]: true }));
      showToast(`SMS pickup notice dispatched directly to ${apt.patientName} (${phone}) without opening external apps.`, 'success');
    } catch (e) {
      showToast(e.message || 'Failed to dispatch SMS.', 'error');
    }
  };

  const toggleMedCheck = (aptId, index) => {
    const key = `${aptId}_${index}`;
    setCheckedMeds(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApplyRestock = async () => {
    if (!restockItem) return;
    const addQty = parseInt(restockAmount, 10);
    if (isNaN(addQty) || addQty <= 0) {
      showToast('Please enter a valid stock quantity.', 'error');
      return;
    }
    const current = Number(restockItem.stock) || 0;
    await updatePharmacyStock(restockItem.id, current + addQty);
    setRestockItem(null);
    setRestockAmount('100');
  };

  // Helper to split prescription into distinct medicine lines
  const parseRxLines = (prescriptionText) => {
    if (!prescriptionText) return [];
    return prescriptionText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#F0EBE1] to-[#E6DFC6]/50 dark:from-[#1C221C] dark:to-[#151915] border border-[#E4DCCE] dark:border-[#2F3B2F] p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D6A4F]/10 dark:bg-[#52B788]/20 text-[#2D6A4F] dark:text-[#52B788] text-xs font-semibold border border-[#2D6A4F]/20 dark:border-[#52B788]/30">
              <Pill className="w-3.5 h-3.5" />
              <span>SDG 3 Universal Essential Medicine Access Scheme</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#22291F] dark:text-[#FAF7F2] tracking-tight">
              Community Pharmacy &amp; Medicine Dispensary Desk
            </h1>
            <p className="text-sm text-[#6B6B63] dark:text-[#C4CFC3] leading-relaxed">
              Verify digital doctor prescriptions, package essential medicines, dispatch SMS pickup notifications, and print thermal dosage instructions for patients.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white dark:bg-[#242C24] rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] text-center shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B35F2B] dark:text-[#E58A54] block">Awaiting Dispense</span>
              <div className="text-2xl font-black text-[#B35F2B] dark:text-[#E58A54] font-heading mt-0.5">
                {pendingCount}
              </div>
              <span className="text-[10px] text-[#8E8E84] dark:text-[#94A493]">Pending fulfillment</span>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#242C24] rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] text-center shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D6A4F] dark:text-[#52B788] block">Dispensed Today</span>
              <div className="text-2xl font-black text-[#2D6A4F] dark:text-[#52B788] font-heading mt-0.5">
                {dispensedCount}
              </div>
              <span className="text-[10px] text-[#8E8E84] dark:text-[#94A493]">Patients served</span>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#242C24] rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] text-center shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B63] dark:text-[#C4CFC3] block">Essential Medicines</span>
              <div className="text-2xl font-black text-[#22291F] dark:text-[#FAF7F2] font-heading mt-0.5">
                {(pharmacyStock || []).length}
              </div>
              <span className="text-[10px] text-[#8E8E84] dark:text-[#94A493]">Free generic lines</span>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#242C24] rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] text-center shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B63] dark:text-[#C4CFC3] block">Low Stock Alerts</span>
              <div className={`text-2xl font-black font-heading mt-0.5 ${lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-[#2D6A4F] dark:text-[#52B788]'}`}>
                {lowStockCount}
              </div>
              <span className="text-[10px] text-[#8E8E84] dark:text-[#94A493]">{lowStockCount > 0 ? 'Requires restock' : 'Supplies healthy'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6DFC6] dark:border-[#2F3B2F] pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-[#2D6A4F] text-[#FAF7F2] shadow-xs'
                : 'bg-white dark:bg-[#1C221C] text-[#6B6B63] dark:text-[#C4CFC3] hover:text-[#22291F] border border-[#E6DFC6] dark:border-[#2F3B2F]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Prescription Queue ({pendingCount} pending)</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-[#2D6A4F] text-[#FAF7F2] shadow-xs'
                : 'bg-white dark:bg-[#1C221C] text-[#6B6B63] dark:text-[#C4CFC3] hover:text-[#22291F] border border-[#E6DFC6] dark:border-[#2F3B2F]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Essential Medicines Stock ({totalStockItems} total units)</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8E8E84] dark:text-[#94A493] absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder={activeTab === 'queue' ? "Search patient, token, medicine, or phone..." : "Search medicine by name or generic..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1C221C] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-xs text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788]"
          />
        </div>
      </div>

      {/* TAB 1: PRESCRIPTION FULFILLMENT QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-6">

          {/* Sub-Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                filter === 'pending'
                  ? 'bg-[#C97B4A] text-white border-[#C97B4A]'
                  : 'bg-white dark:bg-[#1C221C] text-[#6B6B63] dark:text-[#C4CFC3] border-[#E6DFC6] dark:border-[#2F3B2F]'
              }`}
            >
              Awaiting Dispense ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('dispensed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                filter === 'dispensed'
                  ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]'
                  : 'bg-white dark:bg-[#1C221C] text-[#6B6B63] dark:text-[#C4CFC3] border-[#E6DFC6] dark:border-[#2F3B2F]'
              }`}
            >
              Dispensed Today ({dispensedCount})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#22291F] text-white border-[#22291F] dark:bg-white dark:text-black'
                  : 'bg-white dark:bg-[#1C221C] text-[#6B6B63] dark:text-[#C4CFC3] border-[#E6DFC6] dark:border-[#2F3B2F]'
              }`}
            >
              All Prescriptions
            </button>
          </div>

          {/* Prescriptions List */}
          {prescriptionAppointments.length === 0 ? (
            <div className="bg-[#FAF7F2] dark:bg-[#1C221C] rounded-2xl border border-dashed border-[#D8CEB3] dark:border-[#2F3B2F] p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#2D6A4F]/10 dark:bg-[#52B788]/20 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">
                No Prescriptions in this View
              </h3>
              <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] max-w-md mx-auto">
                Prescriptions issued by clinic doctors during consultations will automatically appear here for verification and medicine packing.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {prescriptionAppointments.map((apt) => {
                const isDispensed = apt.dispensaryStatus === 'dispensed';
                const rxLines = parseRxLines(apt.prescription);
                const smsSent = smsSentMap[apt.id];

                return (
                  <div
                    key={apt.id}
                    className="bg-white dark:bg-[#1C221C] rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] p-5 shadow-sm space-y-4 hover:border-[#2D6A4F]/40 transition-colors"
                  >
                    {/* Top Identity Row */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E6DFC6]/60 dark:border-[#2F3B2F]">
                      <div className="flex items-center gap-3">
                        {/* Token Badge */}
                        <div className="w-11 h-11 rounded-xl bg-[#2D6A4F] text-[#FAF7F2] flex flex-col items-center justify-center shrink-0 shadow-xs">
                          <span className="text-[9px] uppercase font-bold text-[#A3C9B8]">Token</span>
                          <span className="text-sm font-black font-heading">{apt.tokenNumber || 'TK'}</span>
                        </div>

                        {/* Patient Profile Picture with Resilient Fallback */}
                        <PatientAvatar patient={apt} size="md" />

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-[#22291F] dark:text-[#FAF7F2] font-heading">{apt.patientName}</h3>
                            <span className="text-[10px] text-[#6B6B63] dark:text-[#C4CFC3]">
                              ({apt.patientAge || 'Adult'}y • {apt.patientGender || 'Unspecified'})
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#6B6B63] dark:text-[#C4CFC3] mt-0.5">
                            <span className="flex items-center gap-1">
                              <Stethoscope className="w-3 h-3 text-[#2D6A4F] dark:text-[#52B788]" />
                              <span>{apt.doctorName}</span>
                            </span>
                            <span>•</span>
                            <span>{apt.date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isDispensed ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#2D6A4F]/12 text-[#2D6A4F] dark:bg-[#52B788]/20 dark:text-[#52B788] border border-[#2D6A4F]/25">
                            <Check className="w-3 h-3" /> Dispensed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#C97B4A]/15 text-[#B35F2B] dark:bg-[#E58A54]/20 dark:text-[#E58A54] border border-[#C97B4A]/25 animate-pulse">
                            <Clock className="w-3 h-3" /> Awaiting Pickup
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Patient Phone & Contact */}
                    {apt.patientPhone && (
                      <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-[#FAF7F2] dark:bg-[#242C24] border border-[#E6DFC6]/60 dark:border-[#2F3B2F]">
                        <span className="text-[#6B6B63] dark:text-[#C4CFC3] flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788]" />
                          <span>Contact:</span>
                        </span>
                        <span className="font-mono font-bold text-[#22291F] dark:text-[#FAF7F2]">{apt.patientPhone}</span>
                      </div>
                    )}

                    {/* Diagnosis */}
                    {apt.diagnosis && (
                      <div className="p-2.5 rounded-xl bg-[#FAF7F2]/60 dark:bg-[#242C24]/60 border border-[#E6DFC6]/60 dark:border-[#2F3B2F] text-xs">
                        <span className="font-bold text-[#2D6A4F] dark:text-[#52B788] uppercase tracking-wider text-[10px] block mb-0.5">
                          Clinical Diagnosis:
                        </span>
                        <p className="font-medium text-[#22291F] dark:text-[#FAF7F2]">{apt.diagnosis}</p>
                      </div>
                    )}

                    {/* Medication Verification Checklist */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B63] dark:text-[#C4CFC3] flex items-center gap-1">
                          <Pill className="w-3 h-3 text-[#2D6A4F] dark:text-[#52B788]" />
                          Medication Verification Checklist ({rxLines.length} prescribed):
                        </span>
                        <span className="text-[9px] text-[#8E8E84]">Check as packaged</span>
                      </div>

                      <div className="space-y-1.5">
                        {rxLines.map((line, idx) => {
                          const isChecked = checkedMeds[`${apt.id}_${idx}`] || isDispensed;
                          return (
                            <div
                              key={idx}
                              onClick={() => !isDispensed && toggleMedCheck(apt.id, idx)}
                              className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs transition-colors ${
                                isChecked
                                  ? 'bg-[#2D6A4F]/8 border-[#2D6A4F]/30 text-[#22291F] dark:text-[#FAF7F2]'
                                  : 'bg-[#FAF7F2] dark:bg-[#242C24] border-[#E6DFC6] dark:border-[#2F3B2F] text-[#6B6B63] dark:text-[#C4CFC3] cursor-pointer hover:border-[#2D6A4F]/40'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                disabled={isDispensed}
                                className="mt-0.5 rounded text-[#2D6A4F] focus:ring-[#2D6A4F]"
                              />
                              <span className={`font-mono leading-relaxed ${isChecked ? 'line-through opacity-70' : ''}`}>
                                {line}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-[#E6DFC6]/60 dark:border-[#2F3B2F] flex flex-wrap items-center justify-between gap-2 text-xs">
                      
                      {/* Secondary Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedLabelApt(apt)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#242C24] hover:bg-[#FAF7F2] dark:hover:bg-[#2F3B2F] border border-[#D8CEB3] dark:border-[#2F3B2F] text-[#22291F] dark:text-[#FAF7F2] font-semibold transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#6B6B63] dark:text-[#C4CFC3]" />
                          <span>Print Label</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSendPickupSMS(apt)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors cursor-pointer font-semibold ${
                            smsSent
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                              : 'bg-white dark:bg-[#242C24] hover:bg-[#FAF7F2] dark:hover:bg-[#2F3B2F] border-[#D8CEB3] dark:border-[#2F3B2F] text-[#22291F] dark:text-[#FAF7F2]'
                          }`}
                        >
                          {smsSent ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <MessageSquare className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788]" />}
                          <span>{smsSent ? 'SMS Sent ✓' : 'Send SMS'}</span>
                        </button>
                      </div>

                      {/* Primary Dispense Action */}
                      {!isDispensed ? (
                        <button
                          type="button"
                          onClick={() => handleDispense(apt.id)}
                          disabled={processingId === apt.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{processingId === apt.id ? 'Updating...' : 'Mark as Dispensed'}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#8E8E84] dark:text-[#94A493] italic">
                          Dispensed: {apt.dispensedAt ? new Date(apt.dispensedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                        </span>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: ESSENTIAL MEDICINES INVENTORY LEDGER */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">
                Free Community Healthcare Formulary
              </h2>
              <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3]">
                WHO Model List of Essential Medicines supplied 100% free of charge to community patients under SDG 3.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(pharmacyStock || []).map((med) => {
              const isLow = (Number(med.stock) || 0) <= (med.minAlert || 50);

              return (
                <div
                  key={med.id}
                  className="bg-white dark:bg-[#1C221C] rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D6A4F] dark:text-[#52B788] block">
                        {med.category}
                      </span>
                      <h3 className="font-bold text-base text-[#22291F] dark:text-[#FAF7F2] font-heading mt-0.5">
                        {med.name}
                      </h3>
                      <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3]">
                        Generic: {med.generic}
                      </p>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      isLow 
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200' 
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                    }`}>
                      {isLow ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>

                  <div className="p-3 bg-[#FAF7F2] dark:bg-[#242C24] rounded-xl border border-[#E6DFC6] dark:border-[#2F3B2F] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-[#8E8E84] dark:text-[#94A493] block">Available Count</span>
                      <span className="text-lg font-black font-heading text-[#22291F] dark:text-[#FAF7F2]">
                        {med.stock} <span className="text-xs font-normal text-[#6B6B63] dark:text-[#C4CFC3]">{med.unit}</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#8E8E84] dark:text-[#94A493] block">Batch / Expiry</span>
                      <span className="font-mono text-xs font-semibold text-[#22291F] dark:text-[#FAF7F2]">
                        {med.batch} ({med.expiry})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-[#8E8E84]">
                      Min. Threshold: {med.minAlert} {med.unit}
                    </span>

                    <button
                      type="button"
                      onClick={() => setRestockItem(med)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2D6A4F]/10 hover:bg-[#2D6A4F]/20 text-[#2D6A4F] dark:text-[#52B788] text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Restock</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: THERMAL MEDICATION LABEL PRINT SLIP */}
      {selectedLabelApt && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#1C221C] w-full max-w-md rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6DFC6] dark:border-[#2F3B2F]">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788]" />
                <h3 className="font-bold text-sm text-[#22291F] dark:text-[#FAF7F2] font-heading">
                  Medication Dosage Label
                </h3>
              </div>
              <button
                onClick={() => setSelectedLabelApt(null)}
                className="p-1 rounded-lg text-[#6B6B63] hover:text-[#22291F] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Sticker Box */}
            <div
              id="printable-med-label"
              className="p-5 bg-white dark:bg-[#151915] rounded-xl border-2 border-dashed border-[#2D6A4F] space-y-3 text-xs text-[#22291F] dark:text-[#FAF7F2]"
            >
              <div className="text-center pb-2 border-b border-[#E6DFC6] dark:border-[#2F3B2F]">
                <h4 className="font-extrabold text-sm font-heading">APNA COMMUNITY CLINIC PHARMACY</h4>
                <p className="text-[10px] text-[#6B6B63] dark:text-[#C4CFC3]">SDG 3 Free Drug Supply • Counter #2</p>
              </div>

              <div className="flex justify-between font-mono text-[11px] pb-1.5 border-b border-[#E6DFC6] dark:border-[#2F3B2F]">
                <span>Token: <strong>{selectedLabelApt.tokenNumber}</strong></span>
                <span>Date: {selectedLabelApt.date}</span>
              </div>

              <div className="flex items-center gap-3 py-1">
                <PatientAvatar patient={selectedLabelApt} size="sm" className="w-10 h-10 rounded-lg text-xs" />
                <div className="space-y-0.5 text-xs">
                  <p><strong>Patient:</strong> {selectedLabelApt.patientName} ({selectedLabelApt.patientAge || 'Adult'}y • {selectedLabelApt.patientGender || 'Unspecified'})</p>
                  <p><strong>Doctor:</strong> {selectedLabelApt.doctorName}</p>
                  {selectedLabelApt.diagnosis && <p><strong>Diagnosis:</strong> {selectedLabelApt.diagnosis}</p>}
                </div>
              </div>

              <div className="p-3 bg-[#FAF7F2] dark:bg-[#242C24] rounded-lg border border-[#E6DFC6] dark:border-[#2F3B2F] space-y-1.5">
                <span className="font-bold uppercase tracking-wider text-[10px] text-[#2D6A4F] dark:text-[#52B788] block">
                  Prescription &amp; Dosage Instructions:
                </span>
                <pre className="font-mono text-[11px] whitespace-pre-wrap font-bold">
                  {selectedLabelApt.prescription}
                </pre>
              </div>

              <div className="pt-2 text-center text-[9px] text-[#8E8E84] leading-tight">
                Take medicines on time with clean water. Store in a cool dry place out of reach of children.
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#2D6A4F] hover:bg-[#23543E] text-[#FAF7F2] text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Sticker Label</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedLabelApt(null)}
                className="py-2.5 px-4 bg-white dark:bg-[#242C24] border border-[#D8CEB3] text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: RESTOCK MEDICINE */}
      {restockItem && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#1C221C] w-full max-w-sm rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E6DFC6] dark:border-[#2F3B2F]">
              <h3 className="font-bold text-sm text-[#22291F] dark:text-[#FAF7F2] font-heading">
                Replenish Medicine Stock
              </h3>
              <button onClick={() => setRestockItem(null)} className="p-1 text-[#6B6B63] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-sm text-[#2D6A4F] dark:text-[#52B788]">{restockItem.name}</p>
              <p className="text-[#6B6B63]">Current Stock: <strong>{restockItem.stock} {restockItem.unit}</strong></p>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-1 mt-3">
                  Add Quantity ({restockItem.unit}):
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] text-sm font-bold text-[#22291F] dark:text-[#FAF7F2]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleApplyRestock}
                className="flex-1 py-2 px-3 bg-[#2D6A4F] hover:bg-[#23543E] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Confirm Restock
              </button>
              <button
                type="button"
                onClick={() => setRestockItem(null)}
                className="py-2 px-3 bg-white dark:bg-[#242C24] border border-[#D8CEB3] text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
