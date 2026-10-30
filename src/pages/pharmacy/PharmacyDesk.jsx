import React, { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { sendDirectEmail, generatePharmacyPickupEmailHtml } from '../../services/emailService';
import {
  Pill,
  CheckCircle2,
  Clock,
  Search,
  FileText,
  Printer,
  Mail,
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
  Info,
  Ticket,
  Loader2
} from 'lucide-react';

export default function PharmacyDesk() {
  const { userProfile, role } = useAuth();
  const { appointments, pharmacyStock, dispensePrescription, updatePharmacyStock, showToast } = useData();

  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'inventory'
  const [filter, setFilter] = useState('pending'); // 'pending' | 'dispensed' | 'all'
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [checkedMeds, setCheckedMeds] = useState({}); // { [aptId_medIndex]: boolean }
  const [selectedLabelApt, setSelectedLabelApt] = useState(null);
  const [emailSentMap, setEmailSentMap] = useState({});
  const [emailSendingId, setEmailSendingId] = useState(null);
  const [emailErrorMap, setEmailErrorMap] = useState({});
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

  const handleSendPickupEmail = async (apt) => {
    const email = (apt.patientEmail || '').trim();
    if (!email) {
      showToast('No email address recorded for this patient.', 'error');
      return;
    }

    const emailHtml = generatePharmacyPickupEmailHtml(apt);
    const subject = ` Prescriptions Ready for Pickup - Token ${apt.tokenNumber || 'TK'} (Apna Clinic)`;
    setEmailSendingId(apt.id);
    setEmailErrorMap(prev => ({ ...prev, [apt.id]: null }));

    try {
      await sendDirectEmail({
        recipientEmail: email,
        subject,
        html: emailHtml,
        type: 'pharmacy_pickup'
      });
      setEmailSentMap(prev => ({ ...prev, [apt.id]: true }));
      setEmailErrorMap(prev => ({ ...prev, [apt.id]: null }));
      showToast(`Email pickup notice sent to ${apt.patientName} (${email})!`, 'success');
    } catch (e) {
      console.error('Pharmacy pickup email failed:', e);
      setEmailSentMap(prev => ({ ...prev, [apt.id]: false }));
      setEmailErrorMap(prev => ({ ...prev, [apt.id]: e.message || 'Email delivery failed' }));
      showToast(e.message || 'Failed to dispatch email notice.', 'error');
    } finally {
      setEmailSendingId(null);
    }
  };

  const toggleMedCheck = (aptId, index) => {
    const key = `${aptId}_${index}`;
    setCheckedMeds(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleVerifyAllMeds = (aptId, totalCount) => {
    setCheckedMeds(prev => {
      const next = { ...prev };
      let allChecked = true;
      for (let i = 0; i < totalCount; i++) {
        if (!next[`${aptId}_${i}`]) {
          allChecked = false;
          break;
        }
      }
      for (let i = 0; i < totalCount; i++) {
        next[`${aptId}_${i}`] = !allChecked;
      }
      return next;
    });
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

  // Resolves legacy demo "TK-00" tokens to unique sequential tokens
  const getCleanTokenNumber = (apt) => {
    if (!apt) return 'TK-01';
    if (apt.tokenNumber && apt.tokenNumber !== 'TK-00') {
      return apt.tokenNumber;
    }
    if (apt.id === 'apt_patel_done_1') return 'TK-05';
    if (apt.id === 'apt_priya_done_1') return 'TK-02';
    if (apt.id === 'apt_sarah_done_1') return 'TK-01';
    return 'TK-01';
  };

  // Matches a prescription line to the Essential Medicines stock inventory
  const findStockMatch = (line, stockList) => {
    if (!line || !stockList || stockList.length === 0) return null;
    const cleanLine = line.toLowerCase();

    // Exclude non-medication lifestyle / therapy instructions
    if (
      cleanLine.includes('exercise') ||
      cleanLine.includes('compress') ||
      cleanLine.includes('avoid') ||
      cleanLine.includes('lifestyle') ||
      cleanLine.includes('rest') ||
      cleanLine.includes('diet') ||
      cleanLine.includes('walk') ||
      cleanLine.includes('adjustment') ||
      cleanLine.includes('ergonomic')
    ) {
      return null;
    }

    const aliases = [
      { keywords: ['paracetamol', 'crocin', 'calpol', 'pcm', 'acetaminophen'], targets: ['paracetamol', 'acetaminophen'] },
      { keywords: ['levocetirizine', 'cetirizine', 'zyrtec'], targets: ['levocetirizine', 'cetirizine'] },
      { keywords: ['saline', 'nasal drop', 'sodium chloride'], targets: ['saline', 'nasal'] },
      { keywords: ['glucosamine'], targets: ['glucosamine'] },
      { keywords: ['ibuprofen', 'brufen', 'combiflam'], targets: ['ibuprofen'] },
      { keywords: ['amoxicillin', 'mox'], targets: ['amoxicillin'] },
      { keywords: ['metformin', 'glycomet'], targets: ['metformin'] },
      { keywords: ['pantoprazole', 'pantocid', 'pan'], targets: ['pantoprazole'] },
      { keywords: ['salbutamol', 'albuterol', 'asthalin', 'inhaler'], targets: ['salbutamol', 'albuterol'] },
      { keywords: ['ors', 'electral', 'rehydration'], targets: ['ors', 'rehydration'] },
      { keywords: ['iron', 'folic acid', 'ferrous'], targets: ['iron', 'folic'] },
      { keywords: ['cough', 'expectorant', 'ambroxol', 'guaifenesin'], targets: ['cough', 'expectorant'] }
    ];

    for (const alias of aliases) {
      if (alias.keywords.some(k => cleanLine.includes(k))) {
        const match = stockList.find(item => {
          const itemStr = `${item.name} ${item.generic || ''} ${item.category || ''}`.toLowerCase();
          return alias.targets.some(t => itemStr.includes(t));
        });
        if (match) return match;
      }
    }

    return stockList.find(item => {
      const itemName = item.name.toLowerCase();
      const itemGeneric = (item.generic || '').toLowerCase();
      const words = [...itemName.split(/[\s+/]+/), ...itemGeneric.split(/[\s+/]+/)].map(w => w.replace(/[^a-z]/g, '')).filter(w => w.length >= 4);
      return words.some(w => cleanLine.includes(w));
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#E8F0EE] to-[#E0E7E5]/50 dark:from-[#121C21] dark:to-[#0B1114] border border-[#DCE5E2] dark:border-[#21333A] p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F766E]/10 dark:bg-[#2DD4BF]/20 text-[#0F766E] dark:text-[#2DD4BF] text-xs font-semibold border border-[#0F766E]/20 dark:border-[#2DD4BF]/30">
              <Pill className="w-3.5 h-3.5" />
              <span>SDG 3 Universal Essential Medicine Access Scheme</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#132226] dark:text-[#F4F7F6] tracking-tight">
              Community Pharmacy &amp; Medicine Dispensary Desk
            </h1>
            <p className="text-sm text-[#5A7178] dark:text-[#9DB4BA] leading-relaxed">
              Verify digital doctor prescriptions, package essential medicines, dispatch email pickup notifications, and print thermal dosage instructions for patients.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white dark:bg-[#19272D] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] text-center shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#EA580C] dark:text-[#FB923C] block">Awaiting Dispense</span>
              <div className="text-2xl font-black text-[#EA580C] dark:text-[#FB923C] font-heading mt-0.5">
                {pendingCount}
              </div>
              <span className="text-[10px] text-[#758D94] dark:text-[#79949B]">Pending fulfillment</span>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#19272D] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] text-center shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#2DD4BF] block">Dispensed Today</span>
              <div className="text-2xl font-black text-[#0F766E] dark:text-[#2DD4BF] font-heading mt-0.5">
                {dispensedCount}
              </div>
              <span className="text-[10px] text-[#758D94] dark:text-[#79949B]">Patients served</span>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#19272D] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] text-center shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A7178] dark:text-[#9DB4BA] block">Essential Medicines</span>
              <div className="text-2xl font-black text-[#132226] dark:text-[#F4F7F6] font-heading mt-0.5">
                {(pharmacyStock || []).length}
              </div>
              <span className="text-[10px] text-[#758D94] dark:text-[#79949B]">Free generic lines</span>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#19272D] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] text-center shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A7178] dark:text-[#9DB4BA] block">Low Stock Alerts</span>
              <div className={`text-2xl font-black font-heading mt-0.5 ${lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-[#0F766E] dark:text-[#2DD4BF]'}`}>
                {lowStockCount}
              </div>
              <span className="text-[10px] text-[#758D94] dark:text-[#79949B]">{lowStockCount > 0 ? 'Requires restock' : 'Supplies healthy'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E0E7E5] dark:border-[#21333A] pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'queue'
                ? 'bg-[#0F766E] text-[#F4F7F6] shadow-xs'
                : 'bg-white dark:bg-[#121C21] text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#132226] border border-[#E0E7E5] dark:border-[#21333A]'
              }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Prescription Queue ({pendingCount} pending)</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'inventory'
                ? 'bg-[#0F766E] text-[#F4F7F6] shadow-xs'
                : 'bg-white dark:bg-[#121C21] text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#132226] border border-[#E0E7E5] dark:border-[#21333A]'
              }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Essential Medicines Stock ({totalStockItems} total units)</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#758D94] dark:text-[#79949B] absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder={activeTab === 'queue' ? "Search patient, token, medicine, or phone..." : "Search medicine by name or generic..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#121C21] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-xs text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF]"
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
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${filter === 'pending'
                  ? 'bg-[#F97316] text-white border-[#F97316]'
                  : 'bg-white dark:bg-[#121C21] text-[#5A7178] dark:text-[#9DB4BA] border-[#E0E7E5] dark:border-[#21333A]'
                }`}
            >
              Awaiting Dispense ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('dispensed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${filter === 'dispensed'
                  ? 'bg-[#0F766E] text-white border-[#0F766E]'
                  : 'bg-white dark:bg-[#121C21] text-[#5A7178] dark:text-[#9DB4BA] border-[#E0E7E5] dark:border-[#21333A]'
                }`}
            >
              Dispensed Today ({dispensedCount})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${filter === 'all'
                  ? 'bg-[#132226] text-[#F4F7F6] border-[#132226] dark:bg-[#F4F7F6] dark:text-[#121C21] dark:border-[#F4F7F6]'
                  : 'bg-white dark:bg-[#121C21] text-[#5A7178] dark:text-[#9DB4BA] border-[#E0E7E5] dark:border-[#21333A]'
                }`}
            >
              All Prescriptions
            </button>
          </div>

          {/* Prescriptions List */}
          {prescriptionAppointments.length === 0 ? (
            <div className="bg-[#F4F7F6] dark:bg-[#121C21] rounded-2xl border border-dashed border-[#CFDAD6] dark:border-[#21333A] p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0F766E]/10 dark:bg-[#2DD4BF]/20 text-[#0F766E] dark:text-[#2DD4BF] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">
                No Prescriptions in this View
              </h3>
              <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA] max-w-md mx-auto">
                Prescriptions issued by clinic doctors during consultations will automatically appear here for verification and medicine packing.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {prescriptionAppointments.map((apt) => {
                const isDispensed = apt.dispensaryStatus === 'dispensed';
                const rxLines = parseRxLines(apt.prescription);
                const emailSent = emailSentMap[apt.id];
                const cleanToken = getCleanTokenNumber(apt);
                const checkedCount = rxLines.filter((_, idx) => checkedMeds[`${apt.id}_${idx}`] || isDispensed).length;
                const isAllMedsChecked = rxLines.length === 0 || checkedCount === rxLines.length;

                return (
                  <div
                    key={apt.id}
                    className="bg-white dark:bg-[#121C21] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] p-5 shadow-sm space-y-4 hover:border-[#0F766E]/40 transition-colors"
                  >
                    {/* Top Identity Row */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E0E7E5]/60 dark:border-[#21333A]">
                      <div className="flex items-center gap-4">
                        {/* High-visibility Dispensary Ticket Badge */}
                        <div className="flex items-stretch rounded-xl overflow-hidden border-2 border-[#0F766E] dark:border-[#2DD4BF] shadow-sm shrink-0 bg-white dark:bg-[#0B1114]">
                          <div className="bg-[#0F766E] text-[#F4F7F6] px-3 py-2 flex flex-col items-center justify-center min-w-[58px]">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#A3C9B8]">Ticket</span>
                            <Ticket className="w-4 h-4 text-[#F4F7F6] mt-0.5" />
                          </div>
                          <div className="px-4 py-2 flex items-center justify-center bg-[#EAF3EE] dark:bg-[#1F3327] min-w-[80px]">
                            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[#1B4D36] dark:text-[#2DD4BF]">
                              {cleanToken}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-[#132226] dark:text-[#F4F7F6] font-heading">{apt.patientName}</h3>
                            <span className="text-[10px] text-[#5A7178] dark:text-[#9DB4BA]">
                              ({apt.patientAge || 'Adult'}y • {apt.patientGender || 'Unspecified'})
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#5A7178] dark:text-[#9DB4BA] mt-0.5">
                            <span className="flex items-center gap-1">
                              <Stethoscope className="w-3 h-3 text-[#0F766E] dark:text-[#2DD4BF]" />
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
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#0F766E]/12 text-[#0F766E] dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF] border border-[#0F766E]/25">
                            <Check className="w-3 h-3" /> Dispensed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#F97316]/15 text-[#EA580C] dark:bg-[#FB923C]/20 dark:text-[#FB923C] border border-[#F97316]/25 animate-pulse">
                            <Clock className="w-3 h-3" /> Awaiting Pickup
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Patient Phone & Contact */}
                    {apt.patientPhone && (
                      <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-[#F4F7F6] dark:bg-[#19272D] border border-[#E0E7E5]/60 dark:border-[#21333A]">
                        <span className="text-[#5A7178] dark:text-[#9DB4BA] flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#2DD4BF]" />
                          <span>Contact:</span>
                        </span>
                        <span className="font-mono font-bold text-[#132226] dark:text-[#F4F7F6]">{apt.patientPhone}</span>
                      </div>
                    )}

                    {/* Diagnosis */}
                    {apt.diagnosis && (
                      <div className="p-2.5 rounded-xl bg-[#F4F7F6]/60 dark:bg-[#19272D]/60 border border-[#E0E7E5]/60 dark:border-[#21333A] text-xs">
                        <span className="font-bold text-[#0F766E] dark:text-[#2DD4BF] uppercase tracking-wider text-[10px] block mb-0.5">
                          Clinical Diagnosis:
                        </span>
                        <p className="font-medium text-[#132226] dark:text-[#F4F7F6]">{apt.diagnosis}</p>
                      </div>
                    )}

                    {/* Medication Verification Checklist with Progress Indicator & Low-Stock Warnings */}
                    <div className="space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#2DD4BF]" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A7178] dark:text-[#9DB4BA]">
                            Medication Verification Checklist ({rxLines.length} prescribed):
                          </span>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center">
                          {/* 3. Progress indicator */}
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider transition-colors ${checkedCount === rxLines.length
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : checkedCount > 0
                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                : 'bg-[#F4F7F6] text-[#5A7178] dark:bg-[#19272D] dark:text-[#9DB4BA] border border-[#E0E7E5] dark:border-[#21333A]'
                            }`}>
                            {checkedCount === rxLines.length ? `All ${rxLines.length} Verified ✓` : `${checkedCount} of ${rxLines.length} verified`}
                          </span>

                          {!isDispensed && rxLines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleVerifyAllMeds(apt.id, rxLines.length)}
                              className="text-[10px] text-[#0F766E] hover:text-[#115E59] dark:text-[#2DD4BF] dark:hover:text-[#6ee7b7] font-bold hover:underline cursor-pointer transition-colors"
                            >
                              {checkedCount === rxLines.length ? 'Uncheck All' : 'Verify All'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-[#E0E7E5]/50 dark:bg-[#21333A] rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${checkedCount === rxLines.length
                              ? 'bg-[#0F766E] dark:bg-[#2DD4BF]'
                              : 'bg-[#F97316] dark:bg-[#FB923C]'
                            }`}
                          style={{ width: `${rxLines.length > 0 ? (checkedCount / rxLines.length) * 100 : 0}%` }}
                        />
                      </div>

                      <div className="space-y-2">
                        {rxLines.map((line, idx) => {
                          const isChecked = checkedMeds[`${apt.id}_${idx}`] || isDispensed;
                          const matchedStock = findStockMatch(line, pharmacyStock);
                          const isLowStock = matchedStock ? ((Number(matchedStock.stock) || 0) <= (matchedStock.minAlert || 50)) : false;
                          const isOutStock = matchedStock ? ((Number(matchedStock.stock) || 0) <= 0) : false;

                          return (
                            <div
                              key={idx}
                              onClick={() => !isDispensed && toggleMedCheck(apt.id, idx)}
                              className={`flex items-start justify-between gap-3 p-3 rounded-xl border text-xs transition-all ${isChecked
                                  ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/60 shadow-2xs'
                                  : 'bg-[#F4F7F6] dark:bg-[#19272D] border-[#E0E7E5] dark:border-[#21333A] hover:border-[#0F766E]/50 cursor-pointer shadow-2xs'
                                }`}
                            >
                              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border transition-colors ${isChecked
                                    ? 'bg-[#0F766E] border-[#0F766E] text-[#F4F7F6] dark:bg-[#2DD4BF] dark:border-[#2DD4BF] dark:text-[#0B1114]'
                                    : 'border-[#758D94] dark:border-[#79949B] bg-white dark:bg-[#121C21]'
                                  }`}>
                                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>

                                <div className="min-w-0 flex-1 space-y-1">
                                  <p className={`font-mono text-xs leading-relaxed transition-all ${isChecked
                                      ? 'line-through text-emerald-950/70 dark:text-emerald-200/70 font-medium'
                                      : 'text-[#132226] dark:text-[#F4F7F6] font-semibold'
                                    }`}>
                                    {line}
                                  </p>

                                  {/* 5. Low-stock / Stock Indicator on line item */}
                                  {matchedStock && (
                                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                      {isOutStock ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                                          <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                                          Out of Stock (0 {matchedStock.unit})
                                        </span>
                                      ) : isLowStock ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                                          <AlertCircle className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                                          Low Stock: {matchedStock.stock} {matchedStock.unit} remaining (Min: {matchedStock.minAlert})
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#0F766E]/10 text-[#0F766E] dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF] border border-[#0F766E]/20 dark:border-[#2DD4BF]/30">
                                          <Package className="w-3 h-3 text-[#0F766E] dark:text-[#2DD4BF]" />
                                          In Stock ({matchedStock.stock} {matchedStock.unit})
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="shrink-0 flex items-center">
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${isChecked
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                                    : 'bg-[#E0E7E5]/50 text-[#758D94] dark:bg-[#21333A] dark:text-[#79949B]'
                                  }`}>
                                  {isChecked ? 'Verified ✓' : 'To Pack'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-[#E0E7E5]/60 dark:border-[#21333A] flex flex-wrap items-center justify-between gap-2 text-xs">

                      {/* Secondary Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedLabelApt(apt)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#19272D] hover:bg-[#F4F7F6] dark:hover:bg-[#21333A] border border-[#CFDAD6] dark:border-[#21333A] text-[#132226] dark:text-[#F4F7F6] font-semibold transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#5A7178] dark:text-[#9DB4BA]" />
                          <span>Print Label</span>
                        </button>

                        <button
                          type="button"
                          disabled={emailSendingId === apt.id}
                          onClick={() => handleSendPickupEmail(apt)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors cursor-pointer font-semibold ${emailSendingId === apt.id
                              ? 'bg-[#F4F7F6] dark:bg-[#19272D] text-[#758D94] border-[#CFDAD6] cursor-not-allowed'
                              : emailSent
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                                : emailErrorMap[apt.id]
                                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300'
                                  : 'bg-white dark:bg-[#19272D] hover:bg-[#F4F7F6] dark:hover:bg-[#21333A] border-[#CFDAD6] dark:border-[#21333A] text-[#132226] dark:text-[#F4F7F6]'
                            }`}
                        >
                          {emailSendingId === apt.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0F766E] dark:text-[#2DD4BF]" />
                              <span>Sending...</span>
                            </>
                          ) : emailSent ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Email Sent ✓</span>
                            </>
                          ) : emailErrorMap[apt.id] ? (
                            <>
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Retry Email</span>
                            </>
                          ) : (
                            <>
                              <Mail className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#2DD4BF]" />
                              <span>Email Notice</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Display Email Error Message if failed */}
                      {emailErrorMap[apt.id] && (
                        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-[11px] text-rose-700 dark:text-rose-300 flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span className="leading-tight">{emailErrorMap[apt.id]}</span>
                        </div>
                      )}

                      {/* Primary Dispense Action - Validated */}
                      {!isDispensed ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (!isAllMedsChecked) {
                              showToast(`Please verify all medications before dispensing (${checkedCount} of ${rxLines.length} verified).`, 'warning');
                              return;
                            }
                            handleDispense(apt.id);
                          }}
                          disabled={processingId === apt.id}
                          title={!isAllMedsChecked ? `Verify all ${rxLines.length} checklist items before dispensing` : 'Confirm all medications packaged and dispensed'}
                          className={`flex items-center gap-1.5 px-4 py-2 font-bold rounded-xl shadow-xs transition-all text-xs cursor-pointer ${!isAllMedsChecked
                              ? 'bg-[#E0E7E5]/60 dark:bg-[#21333A]/60 text-[#758D94] dark:text-[#79949B] border border-[#CFDAD6] dark:border-[#2C444E] hover:bg-[#E0E7E5]/80'
                              : 'bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-[#F4F7F6]'
                            }`}
                        >
                          <CheckCircle2 className={`w-4 h-4 ${!isAllMedsChecked ? 'text-[#758D94] dark:text-[#79949B]' : ''}`} />
                          <span>
                            {processingId === apt.id
                              ? 'Updating...'
                              : !isAllMedsChecked
                                ? `Verify All to Dispense (${checkedCount}/${rxLines.length})`
                                : 'Mark as Dispensed'}
                          </span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#758D94] dark:text-[#79949B] italic">
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
              <h2 className="text-base font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">
                Free Community Healthcare Formulary
              </h2>
              <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">
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
                  className="bg-white dark:bg-[#121C21] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#2DD4BF] block">
                        {med.category}
                      </span>
                      <h3 className="font-bold text-base text-[#132226] dark:text-[#F4F7F6] font-heading mt-0.5">
                        {med.name}
                      </h3>
                      <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">
                        Generic: {med.generic}
                      </p>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${isLow
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                      }`}>
                      {isLow ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>

                  <div className="p-3 bg-[#F4F7F6] dark:bg-[#19272D] rounded-xl border border-[#E0E7E5] dark:border-[#21333A] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-[#758D94] dark:text-[#79949B] block">Available Count</span>
                      <span className="text-lg font-black font-heading text-[#132226] dark:text-[#F4F7F6]">
                        {med.stock} <span className="text-xs font-normal text-[#5A7178] dark:text-[#9DB4BA]">{med.unit}</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#758D94] dark:text-[#79949B] block">Batch / Expiry</span>
                      <span className="font-mono text-xs font-semibold text-[#132226] dark:text-[#F4F7F6]">
                        {med.batch} ({med.expiry})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-[#758D94]">
                      Min. Threshold: {med.minAlert} {med.unit}
                    </span>

                    <button
                      type="button"
                      onClick={() => setRestockItem(med)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0F766E]/10 hover:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#2DD4BF] text-xs font-semibold transition-colors cursor-pointer"
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
          <div className="bg-white dark:bg-[#121C21] w-full max-w-md rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E7E5] dark:border-[#21333A]">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" />
                <h3 className="font-bold text-sm text-[#132226] dark:text-[#F4F7F6] font-heading">
                  Medication Dosage Label
                </h3>
              </div>
              <button
                onClick={() => setSelectedLabelApt(null)}
                className="p-1 rounded-lg text-[#5A7178] hover:text-[#132226] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Sticker Box */}
            <div
              id="printable-med-label"
              className="p-5 bg-white dark:bg-[#0B1114] rounded-xl border-2 border-dashed border-[#0F766E] space-y-3 text-xs text-[#132226] dark:text-[#F4F7F6]"
            >
              <div className="text-center pb-2 border-b border-[#E0E7E5] dark:border-[#21333A]">
                <h4 className="font-extrabold text-sm font-heading">APNA COMMUNITY CLINIC PHARMACY</h4>
                <p className="text-[10px] text-[#5A7178] dark:text-[#9DB4BA]">SDG 3 Free Drug Supply • Counter #2</p>
              </div>

              {/* High-visibility Dispensary Ticket Section */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#EAF3EE] dark:bg-[#1F3327] border-2 border-[#0F766E] dark:border-[#2DD4BF]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center shrink-0">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-[#5A7178] dark:text-[#9DB4BA] block">
                      Dispensary Ticket
                    </span>
                    <span className="text-2xl font-black font-mono tracking-wider text-[#1B4D36] dark:text-[#2DD4BF]">
                      {getCleanTokenNumber(selectedLabelApt)}
                    </span>
                  </div>
                </div>
                <div className="text-right text-[11px] font-mono text-[#5A7178] dark:text-[#9DB4BA]">
                  <div>Date: <strong className="text-[#132226] dark:text-[#F4F7F6]">{selectedLabelApt.date}</strong></div>
                  <div>Time: <strong>{selectedLabelApt.time || 'Today'}</strong></div>
                </div>
              </div>

              <div className="py-1 space-y-1 text-xs">
                <p><strong>Patient:</strong> {selectedLabelApt.patientName} <span className="text-[#5A7178] dark:text-[#9DB4BA]">({selectedLabelApt.patientAge || 'Adult'}y • {selectedLabelApt.patientGender || 'Unspecified'})</span></p>
                <p><strong>Doctor:</strong> {selectedLabelApt.doctorName}</p>
                {selectedLabelApt.diagnosis && <p><strong>Diagnosis:</strong> {selectedLabelApt.diagnosis}</p>}
              </div>

              <div className="p-3 bg-[#F4F7F6] dark:bg-[#19272D] rounded-lg border border-[#E0E7E5] dark:border-[#21333A] space-y-1.5">
                <span className="font-bold uppercase tracking-wider text-[10px] text-[#0F766E] dark:text-[#2DD4BF] block">
                  Prescription &amp; Dosage Instructions:
                </span>
                <pre className="font-mono text-[11px] whitespace-pre-wrap font-bold">
                  {selectedLabelApt.prescription}
                </pre>
              </div>

              <div className="pt-2 text-center text-[9px] text-[#758D94] leading-tight">
                Take medicines on time with clean water. Store in a cool dry place out of reach of children.
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#0F766E] hover:bg-[#115E59] text-[#F4F7F6] text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Sticker Label</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedLabelApt(null)}
                className="py-2.5 px-4 bg-white dark:bg-[#19272D] border border-[#CFDAD6] text-xs font-semibold rounded-xl cursor-pointer"
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
          <div className="bg-white dark:bg-[#121C21] w-full max-w-sm rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E0E7E5] dark:border-[#21333A]">
              <h3 className="font-bold text-sm text-[#132226] dark:text-[#F4F7F6] font-heading">
                Replenish Medicine Stock
              </h3>
              <button onClick={() => setRestockItem(null)} className="p-1 text-[#5A7178] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-sm text-[#0F766E] dark:text-[#2DD4BF]">{restockItem.name}</p>
              <p className="text-[#5A7178]">Current Stock: <strong>{restockItem.stock} {restockItem.unit}</strong></p>

              <div>
                <label className="block text-[11px] font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider mb-1 mt-3">
                  Add Quantity ({restockItem.unit}):
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] text-sm font-bold text-[#132226] dark:text-[#F4F7F6]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleApplyRestock}
                className="flex-1 py-2 px-3 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Confirm Restock
              </button>
              <button
                type="button"
                onClick={() => setRestockItem(null)}
                className="py-2 px-3 bg-white dark:bg-[#19272D] border border-[#CFDAD6] text-xs font-semibold rounded-xl cursor-pointer"
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
