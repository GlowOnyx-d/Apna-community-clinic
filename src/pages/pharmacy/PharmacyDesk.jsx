import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { sendDirectEmail, generatePharmacyPickupEmailHtml } from '../../services/emailService';
import {
  CheckCircle2,
  Clock,
  Search,
  Printer,
  Mail,
  X,
  Check,
  Edit3,
  ChevronDown,
  Loader2
} from 'lucide-react';

export default function PharmacyDesk() {
  const { role } = useAuth();
  const { appointments, pharmacyStock, dispensePrescription, updatePharmacyStock, showToast } = useData();

  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'stock'
  const [filter, setFilter] = useState('pending'); // 'pending' | 'dispensed' | 'all'
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'low'
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [checkedMeds, setCheckedMeds] = useState({}); // { [aptId_medIndex]: boolean }
  const [selectedLabelApt, setSelectedLabelApt] = useState(null);
  const [emailSentMap, setEmailSentMap] = useState({});
  const [emailSendingId, setEmailSendingId] = useState(null);
  const [emailErrorMap, setEmailErrorMap] = useState({});
  const [restockItem, setRestockItem] = useState(null);
  const [restockAmount, setRestockAmount] = useState('100');
  const [expandedDispensed, setExpandedDispensed] = useState({}); // { [aptId]: boolean }

  const isAdmin = role === 'admin';

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

  // Split into Awaiting (unfulfilled) and Dispensed lists
  const awaitingAppointments = useMemo(() => {
    return prescriptionAppointments.filter(a => a.dispensaryStatus !== 'dispensed');
  }, [prescriptionAppointments]);

  const dispensedAppointments = useMemo(() => {
    return prescriptionAppointments.filter(a => a.dispensaryStatus === 'dispensed');
  }, [prescriptionAppointments]);

  // Statistics
  const pendingCount = useMemo(() => {
    return appointments.filter(a => a.status === 'done' && a.prescription && a.dispensaryStatus !== 'dispensed').length;
  }, [appointments]);

  const dispensedCount = useMemo(() => {
    return appointments.filter(a => a.status === 'done' && a.prescription && a.dispensaryStatus === 'dispensed').length;
  }, [appointments]);

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
    const subject = `Prescriptions Ready for Pickup - Token ${apt.tokenNumber || 'TK'} (Apna Clinic)`;
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

  // Determines if a line is lifestyle/exercise/diet advice rather than a drug to verify
  const isAdviceLine = (line) => {
    const lower = line.toLowerCase();
    const clean = lower.replace(/^[\d.)\s-]+/, '').trim();
    return (
      clean.startsWith('gentle') ||
      lower.includes('exercise') ||
      lower.includes('advice') ||
      lower.includes('diet') ||
      lower.includes('rest') ||
      lower.includes('compress') ||
      lower.includes('lifestyle') ||
      lower.includes('stretch') ||
      lower.includes('walk') ||
      lower.includes('intake encouraged') ||
      lower.includes('counseling') ||
      lower.includes('annual screening')
    );
  };

  // Parses drug name and dose instructions
  const parseMedLine = (line) => {
    const clean = line.replace(/^[\d.)\s-]+/, '').trim();
    if (clean.includes(' - ')) {
      const [name, ...rest] = clean.split(' - ');
      return { name: name.trim(), instructions: rest.join(' - ').trim() };
    }
    const match = clean.match(/\b(TDS|BD|OD|PRN|HS|SOS|QID|TID|BID|\d+\s*times|twice|thrice|daily|every|at bedtime|before|after)\b/i);
    if (match && match.index > 0) {
      return {
        name: clean.slice(0, match.index).trim(),
        instructions: clean.slice(match.index).trim()
      };
    }
    return { name: clean, instructions: '' };
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

    if (isAdviceLine(line)) {
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

  // Filtered & sorted stock list (low items first)
  const sortedStock = useMemo(() => {
    let list = [...(pharmacyStock || [])];
    if (stockFilter === 'low') {
      list = list.filter(m => (Number(m.stock) || 0) <= (m.minAlert || 50));
    }
    if (search.trim() && activeTab === 'stock') {
      const q = search.toLowerCase();
      list = list.filter(m =>
        m.name?.toLowerCase().includes(q) ||
        m.generic?.toLowerCase().includes(q) ||
        m.batch?.toLowerCase().includes(q) ||
        m.category?.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const aIsLow = (Number(a.stock) || 0) <= (a.minAlert || 50) ? 1 : 0;
      const bIsLow = (Number(b.stock) || 0) <= (b.minAlert || 50) ? 1 : 0;
      if (aIsLow !== bIsLow) return bIsLow - aIsLow;
      return (a.name || '').localeCompare(b.name || '');
    });
    return list;
  }, [pharmacyStock, stockFilter, search, activeTab]);

  // Render Awaiting (unfulfilled) Prescription Card (in 2-column items-start grid)
  const renderAwaitingCard = (apt) => {
    const cleanToken = getCleanTokenNumber(apt);
    const rxLines = parseRxLines(apt.prescription);

    const medItems = [];
    const adviceItems = [];

    rxLines.forEach((line, idx) => {
      if (isAdviceLine(line)) {
        adviceItems.push({ text: line, originalIdx: idx });
      } else {
        medItems.push({
          line,
          parsed: parseMedLine(line),
          originalIdx: idx,
          stockMatch: findStockMatch(line, pharmacyStock)
        });
      }
    });

    const checkedMedsCount = medItems.filter(m => checkedMeds[`${apt.id}_${m.originalIdx}`]).length;
    const totalMedsCount = medItems.length;
    const isAllMedsChecked = totalMedsCount === 0 || checkedMedsCount === totalMedsCount;
    const emailSent = emailSentMap[apt.id];

    return (
      <div
        key={apt.id}
        className="bg-white dark:bg-[#121C21] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-[#0F766E]/40 transition-colors"
      >
        <div className="space-y-3">
          {/* Top Row: Token badge next to patient name (18px semibold), age/gender muted, status dot on right */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-1 bg-[#0F766E]/10 dark:bg-[#0D9488]/20 text-[#0F766E] dark:text-[#2DD4BF] rounded-lg font-mono text-xs font-bold shrink-0">
                  {cleanToken}
                </span>
                <h3 className="text-lg font-semibold text-[#132226] dark:text-[#F4F7F6] truncate">
                  {apt.patientName}
                </h3>
                <span className="text-xs text-[#758D94] dark:text-[#79949B]">
                  ({apt.patientAge || 'Adult'}y • {apt.patientGender || 'Unspecified'})
                </span>
              </div>

              {/* Under it: Doctor name, date, and phone as one muted line */}
              <p className="text-xs text-[#758D94] dark:text-[#79949B] mt-1 truncate">
                {apt.doctorName} · {apt.date} {apt.patientPhone ? `· ${apt.patientPhone}` : ''}
              </p>
            </div>

            {/* Status dot + label */}
            <div className="shrink-0 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Awaiting pickup</span>
              </span>
            </div>
          </div>

          {/* Diagnosis: One muted line "Dx: ..." clamp to 2 lines */}
          {apt.diagnosis && (
            <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA] line-clamp-2">
              <strong className="font-semibold text-[#132226] dark:text-[#F4F7F6]">Dx:</strong> {apt.diagnosis}
            </p>
          )}

          {/* Medicine List: Checklist, one row per item, 14px normal font, NOT monospace */}
          {medItems.length > 0 && (
            <div className="space-y-2 pt-1">
              {medItems.map((med) => {
                const isChecked = checkedMeds[`${apt.id}_${med.originalIdx}`];
                const stock = med.stockMatch;
                const isOutStock = stock ? (Number(stock.stock) || 0) <= 0 : false;
                const isLowStock = stock ? (Number(stock.stock) || 0) <= (stock.minAlert || 50) : false;

                return (
                  <div
                    key={med.originalIdx}
                    onClick={() => toggleMedCheck(apt.id, med.originalIdx)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors cursor-pointer hover:bg-[#F4F7F6] dark:hover:bg-[#19272D] ${
                      isChecked ? 'opacity-85' : ''
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border transition-colors ${
                        isChecked
                          ? 'bg-[#0F766E] border-[#0F766E] text-white dark:bg-[#2DD4BF] dark:border-[#2DD4BF] dark:text-[#0B1114]'
                          : 'border-[#CFDAD6] dark:border-[#2C444E] bg-white dark:bg-[#121C21]'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="min-w-0 flex-1 text-sm font-normal">
                      <span className={`font-semibold block ${isChecked ? 'line-through text-[#758D94] dark:text-[#79949B]' : 'text-[#132226] dark:text-[#F4F7F6]'}`}>
                        {med.parsed.name}
                      </span>

                      {med.parsed.instructions && (
                        <span className="text-xs text-[#758D94] dark:text-[#79949B] block mt-0.5">
                          {med.parsed.instructions}
                        </span>
                      )}

                      {/* Stock warning only when low or out (amber text), show nothing when fine */}
                      {isOutStock ? (
                        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 block mt-0.5">
                          Out of stock (0 left)
                        </span>
                      ) : isLowStock ? (
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 block mt-0.5">
                          Low stock: {stock.stock} left
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Advice section: no checkbox, not required for verify all */}
          {adviceItems.length > 0 && (
            <div className="pt-2 border-t border-[#E0E7E5]/60 dark:border-[#21333A] space-y-1">
              <span className="text-xs font-semibold text-[#758D94] dark:text-[#79949B] uppercase tracking-wider block">
                Advice
              </span>
              {adviceItems.map((adv, idx) => (
                <p key={idx} className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">
                  • {adv.text.replace(/^[\d.)\s-]+/, '').trim()}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Footer Row: Ghost "Print label" & "Email notice" on left, single primary "Dispense (x/y)" on right */}
        <div className="pt-3 border-t border-[#E0E7E5] dark:border-[#21333A] flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedLabelApt(apt)}
              className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-medium text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#0F766E] dark:hover:text-[#2DD4BF] hover:bg-[#0F766E]/5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print label</span>
            </button>

            <button
              type="button"
              disabled={emailSendingId === apt.id}
              onClick={() => handleSendPickupEmail(apt)}
              className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                emailSent
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : emailErrorMap[apt.id]
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#0F766E] dark:hover:text-[#2DD4BF] hover:bg-[#0F766E]/5'
              }`}
            >
              {emailSendingId === apt.id ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : emailSent ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Email sent ✓</span>
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email notice</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            disabled={!isAllMedsChecked || processingId === apt.id}
            onClick={() => handleDispense(apt.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer ${
              isAllMedsChecked
                ? 'bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-white'
                : 'bg-[#E0E7E5]/60 dark:bg-[#21333A]/60 text-[#758D94] dark:text-[#79949B] cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {processingId === apt.id
                ? 'Dispensing...'
                : `Dispense (${checkedMedsCount}/${totalMedsCount})`}
            </span>
          </button>
        </div>
      </div>
    );
  };

  // Render Dispensed Compact Row (in single-column list, never stretched by neighbour)
  const renderDispensedRow = (apt) => {
    const isExpanded = Boolean(expandedDispensed[apt.id]);
    const cleanToken = getCleanTokenNumber(apt);
    const rxLines = parseRxLines(apt.prescription);

    const medItems = [];
    const adviceItems = [];

    rxLines.forEach((line, idx) => {
      if (isAdviceLine(line)) {
        adviceItems.push({ text: line, originalIdx: idx });
      } else {
        medItems.push({
          line,
          parsed: parseMedLine(line),
          originalIdx: idx,
          stockMatch: findStockMatch(line, pharmacyStock)
        });
      }
    });

    const emailSent = emailSentMap[apt.id];

    return (
      <div
        key={apt.id}
        className="bg-white dark:bg-[#121C21] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] shadow-2xs overflow-hidden transition-all hover:border-[#0F766E]/40"
      >
        {/* Compact Header Row: token, name, time, "Dispensed" dot, chevron */}
        <div
          onClick={() => setExpandedDispensed(prev => ({ ...prev, [apt.id]: !prev[apt.id] }))}
          className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer"
          title="Click to expand/collapse"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="px-2.5 py-1 bg-[#0F766E]/10 dark:bg-[#0D9488]/20 text-[#0F766E] dark:text-[#2DD4BF] rounded-lg font-mono text-xs font-bold shrink-0">
              {cleanToken}
            </span>
            <h4 className="font-semibold text-sm sm:text-base text-[#132226] dark:text-[#F4F7F6] truncate">
              {apt.patientName}
            </h4>
            <span className="text-xs text-[#758D94] dark:text-[#79949B] hidden sm:inline truncate">
              {apt.dispensedAt ? new Date(apt.dispensedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : apt.time || 'Today'}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Dispensed</span>
            </span>
            <ChevronDown className={`w-4 h-4 text-[#758D94] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Expanded Details Body: grows only itself vertically, completely isolated */}
        {isExpanded && (
          <div className="p-4 sm:p-5 pt-0 border-t border-[#E0E7E5] dark:border-[#21333A] space-y-3.5 animate-in fade-in duration-200">
            <div className="pt-3">
              <p className="text-xs text-[#758D94] dark:text-[#79949B]">
                Consulted by <strong className="text-[#132226] dark:text-[#F4F7F6]">{apt.doctorName}</strong> ({apt.specialization}) · {apt.date} {apt.patientPhone ? `· ${apt.patientPhone}` : ''}
              </p>
            </div>

            {apt.diagnosis && (
              <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">
                <strong className="font-semibold text-[#132226] dark:text-[#F4F7F6]">Dx:</strong> {apt.diagnosis}
              </p>
            )}

            {medItems.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-[#758D94] dark:text-[#79949B] uppercase tracking-wider block">
                  Dispensed Medicines
                </span>
                <div className="space-y-1.5">
                  {medItems.map((med) => (
                    <div key={med.originalIdx} className="flex items-center gap-2 text-sm text-[#132226] dark:text-[#F4F7F6]">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-medium">{med.parsed.name}</span>
                      {med.parsed.instructions && (
                        <span className="text-xs text-[#758D94] dark:text-[#79949B]">({med.parsed.instructions})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {adviceItems.length > 0 && (
              <div className="pt-2 border-t border-[#E0E7E5]/60 dark:border-[#21333A] space-y-1">
                <span className="text-xs font-semibold text-[#758D94] dark:text-[#79949B] uppercase tracking-wider block">
                  Advice
                </span>
                {adviceItems.map((adv, idx) => (
                  <p key={idx} className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">
                    • {adv.text.replace(/^[\d.)\s-]+/, '').trim()}
                  </p>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-[#E0E7E5] dark:border-[#21333A] flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedLabelApt(apt)}
                  className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-medium text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#0F766E] dark:hover:text-[#2DD4BF] hover:bg-[#0F766E]/5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print label</span>
                </button>

                <button
                  type="button"
                  disabled={emailSendingId === apt.id}
                  onClick={() => handleSendPickupEmail(apt)}
                  className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    emailSent
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : emailErrorMap[apt.id]
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#0F766E] dark:hover:text-[#2DD4BF] hover:bg-[#0F766E]/5'
                  }`}
                >
                  {emailSendingId === apt.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : emailSent ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Email sent ✓</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email notice</span>
                    </>
                  )}
                </button>
              </div>

              <span className="text-xs text-[#758D94] dark:text-[#79949B]">
                Dispensed at {apt.dispensedAt ? new Date(apt.dispensedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">

      {/* Header: Clean title + one-line subtitle */}
      <div>
        <h1 className="text-2xl font-black text-[#132226] dark:text-[#F4F7F6] tracking-tight font-heading">
          Pharmacy &amp; Dispensary
        </h1>
        <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA] mt-1">
          Verify digital prescriptions, package medications, and manage clinic formulary stock.
        </p>
      </div>

      {/* Slim Row of 4 Compact Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white dark:bg-[#121C21] rounded-xl border border-[#E0E7E5] dark:border-[#21333A] flex items-center justify-between shadow-2xs">
          <span className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">Awaiting</span>
          <span className="text-lg font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">{pendingCount}</span>
        </div>

        <div className="p-3 bg-white dark:bg-[#121C21] rounded-xl border border-[#E0E7E5] dark:border-[#21333A] flex items-center justify-between shadow-2xs">
          <span className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">Dispensed today</span>
          <span className="text-lg font-bold text-[#0F766E] dark:text-[#2DD4BF] font-heading">{dispensedCount}</span>
        </div>

        <div className="p-3 bg-white dark:bg-[#121C21] rounded-xl border border-[#E0E7E5] dark:border-[#21333A] flex items-center justify-between shadow-2xs">
          <span className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">Medicines</span>
          <span className="text-lg font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">{(pharmacyStock || []).length}</span>
        </div>

        <button
          type="button"
          onClick={() => {
            setActiveTab('stock');
            setStockFilter('low');
          }}
          className={`p-3 rounded-xl border flex items-center justify-between text-left transition-colors cursor-pointer shadow-2xs ${
            lowStockCount > 0
              ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 hover:border-amber-400'
              : 'bg-white dark:bg-[#121C21] border-[#E0E7E5] dark:border-[#21333A] hover:border-[#0F766E]/40'
          }`}
          title="Filter stock to low items"
        >
          <span className={`text-xs ${lowStockCount > 0 ? 'text-amber-800 dark:text-amber-300 font-medium' : 'text-[#5A7178] dark:text-[#9DB4BA]'}`}>
            Low stock
          </span>
          <span className={`text-lg font-bold font-heading ${lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-[#132226] dark:text-[#F4F7F6]'}`}>
            {lowStockCount}
          </span>
        </button>
      </div>

      {/* Main Navigation: Queue | Stock */}
      <div className="flex items-center p-1 bg-[#F4F7F6] dark:bg-[#19272D] rounded-xl border border-[#E0E7E5] dark:border-[#21333A] w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'queue'
              ? 'bg-white dark:bg-[#121C21] text-[#0F766E] dark:text-[#2DD4BF] shadow-xs'
              : 'text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#132226] dark:hover:text-[#F4F7F6]'
          }`}
        >
          Queue
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'stock'
              ? 'bg-white dark:bg-[#121C21] text-[#0F766E] dark:text-[#2DD4BF] shadow-xs'
              : 'text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#132226] dark:hover:text-[#F4F7F6]'
          }`}
        >
          Stock
        </button>
      </div>

      {/* QUEUE TAB */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          {/* Sub-navigation: Underline Tabs on left, Search on right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E0E7E5] dark:border-[#21333A] pb-2">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setFilter('pending')}
                className={`pb-2 text-xs font-semibold transition-colors cursor-pointer relative whitespace-nowrap ${
                  filter === 'pending'
                    ? 'text-[#0F766E] dark:text-[#2DD4BF]'
                    : 'text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#132226] dark:hover:text-[#F4F7F6]'
                }`}
              >
                Awaiting ({pendingCount})
                {filter === 'pending' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F766E] dark:bg-[#2DD4BF] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setFilter('dispensed')}
                className={`pb-2 text-xs font-semibold transition-colors cursor-pointer relative whitespace-nowrap ${
                  filter === 'dispensed'
                    ? 'text-[#0F766E] dark:text-[#2DD4BF]'
                    : 'text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#132226] dark:hover:text-[#F4F7F6]'
                }`}
              >
                Dispensed today ({dispensedCount})
                {filter === 'dispensed' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F766E] dark:bg-[#2DD4BF] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`pb-2 text-xs font-semibold transition-colors cursor-pointer relative whitespace-nowrap ${
                  filter === 'all'
                    ? 'text-[#0F766E] dark:text-[#2DD4BF]'
                    : 'text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#132226] dark:hover:text-[#F4F7F6]'
                }`}
              >
                All
                {filter === 'all' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F766E] dark:bg-[#2DD4BF] rounded-full" />
                )}
              </button>
            </div>

            {/* Search Bar on same row */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#758D94] dark:text-[#79949B] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search patient, token, medicine..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-xs text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF]"
              />
            </div>
          </div>

          {/* Prescriptions List */}
          {prescriptionAppointments.length === 0 ? (
            <div className="bg-[#F4F7F6] dark:bg-[#121C21] rounded-2xl border border-dashed border-[#CFDAD6] dark:border-[#21333A] p-12 text-center space-y-2">
              <p className="font-semibold text-sm text-[#132226] dark:text-[#F4F7F6]">No prescriptions in this view</p>
              <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">
                Doctor prescriptions will appear here automatically for packaging and dispensing.
              </p>
            </div>
          ) : filter === 'pending' ? (
            // Awaiting view: 2-column grid with items-start
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
              {awaitingAppointments.map((apt) => renderAwaitingCard(apt))}
            </div>
          ) : filter === 'dispensed' ? (
            // Dispensed view: separate single-column list of compact rows
            <div className="space-y-3">
              {dispensedAppointments.map((apt) => renderDispensedRow(apt))}
            </div>
          ) : (
            // All view: Awaiting group first (2-col items-start), then Dispensed section header and compact rows
            <div className="space-y-6">
              {awaitingAppointments.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                  {awaitingAppointments.map((apt) => renderAwaitingCard(apt))}
                </div>
              )}

              {dispensedAppointments.length > 0 && (
                <div className={awaitingAppointments.length > 0 ? "pt-4 border-t border-[#E0E7E5] dark:border-[#21333A] space-y-3" : "space-y-3"}>
                  <h3 className="text-sm font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">
                    Dispensed ({dispensedAppointments.length})
                  </h3>
                  <div className="space-y-3">
                    {dispensedAppointments.map((apt) => renderDispensedRow(apt))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* STOCK TAB */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          {/* Sub-header: Filter chips (All / Low) on left, Search on right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStockFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  stockFilter === 'all'
                    ? 'bg-[#0F766E] text-white border-[#0F766E] dark:bg-[#0D9488] dark:border-[#0D9488]'
                    : 'bg-white dark:bg-[#121C21] text-[#5A7178] dark:text-[#9DB4BA] border-[#CFDAD6] dark:border-[#2C444E]'
                }`}
              >
                All ({(pharmacyStock || []).length})
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('low')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  stockFilter === 'low'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white dark:bg-[#121C21] text-[#5A7178] dark:text-[#9DB4BA] border-[#CFDAD6] dark:border-[#2C444E]'
                }`}
              >
                Low ({lowStockCount})
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#758D94] dark:text-[#79949B] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search medicine by name or generic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-xs text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF]"
              />
            </div>
          </div>

          {/* Clean Stock Table */}
          <div className="bg-white dark:bg-[#121C21] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E0E7E5] dark:border-[#21333A] bg-[#F4F7F6]/80 dark:bg-[#0B1114] text-[#5A7178] dark:text-[#9DB4BA] font-bold uppercase tracking-wider text-xs">
                    <th className="py-3 px-4">Medicine</th>
                    <th className="py-3 px-4">Batch</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Min level</th>
                    <th className="py-3 px-4">Status</th>
                    {isAdmin && <th className="py-3 px-4 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E7E5] dark:divide-[#21333A]">
                  {sortedStock.map((med) => {
                    const stockQty = Number(med.stock) || 0;
                    const minLvl = med.minAlert || 50;
                    const isOut = stockQty <= 0;
                    const isLow = stockQty <= minLvl;

                    return (
                      <tr key={med.id} className="hover:bg-[#F4F7F6]/60 dark:hover:bg-[#19272D]/50 transition-colors">
                        {/* Medicine */}
                        <td className="py-3 px-4">
                          <p className="font-semibold text-xs text-[#132226] dark:text-[#F4F7F6]">{med.name}</p>
                          <p className="text-xs text-[#758D94] dark:text-[#79949B]">{med.generic || med.category}</p>
                        </td>

                        {/* Batch */}
                        <td className="py-3 px-4 font-mono text-xs text-[#5A7178] dark:text-[#9DB4BA]">
                          {med.batch || 'BCH-01'} <span className="opacity-75">({med.expiry || '2026'})</span>
                        </td>

                        {/* Stock */}
                        <td className="py-3 px-4 font-semibold text-xs text-[#132226] dark:text-[#F4F7F6]">
                          {med.stock} <span className="font-normal text-xs text-[#758D94] dark:text-[#79949B]">{med.unit}</span>
                        </td>

                        {/* Min level */}
                        <td className="py-3 px-4 text-xs text-[#5A7178] dark:text-[#9DB4BA]">
                          {med.minAlert} {med.unit}
                        </td>

                        {/* Status dot */}
                        <td className="py-3 px-4">
                          {isOut ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                              <span className="w-2 h-2 rounded-full bg-rose-500" />
                              <span>Out</span>
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              <span>Low</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span>OK</span>
                            </span>
                          )}
                        </td>

                        {/* Edit Icon (Admin only) */}
                        {isAdmin && (
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setRestockItem(med)}
                              className="p-1.5 rounded-lg text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#0F766E] dark:hover:text-[#2DD4BF] hover:bg-[#0F766E]/5 transition-colors cursor-pointer"
                              title="Restock medicine"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
                <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">SDG 3 Free Drug Supply • Counter #2</p>
              </div>

              {/* Dispensary Ticket Section */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4F7F6] dark:bg-[#19272D] border border-[#0F766E]/30 dark:border-[#2DD4BF]/30">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-[#5A7178] dark:text-[#9DB4BA] block">
                    Dispensary Ticket
                  </span>
                  <span className="text-2xl font-black font-mono tracking-wider text-[#0F766E] dark:text-[#2DD4BF]">
                    {getCleanTokenNumber(selectedLabelApt)}
                  </span>
                </div>
                <div className="text-right text-xs font-mono text-[#5A7178] dark:text-[#9DB4BA]">
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
                <span className="font-bold uppercase tracking-wider text-xs text-[#0F766E] dark:text-[#2DD4BF] block">
                  Prescription &amp; Dosage Instructions:
                </span>
                <p className="text-xs whitespace-pre-wrap font-medium">
                  {selectedLabelApt.prescription}
                </p>
              </div>

              <div className="pt-2 text-center text-xs text-[#758D94] leading-tight">
                Take medicines on time with clean water. Store in a cool dry place out of reach of children.
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
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

      {/* MODAL 2: RESTOCK MEDICINE (Admin only) */}
      {restockItem && isAdmin && createPortal(
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
              <p className="text-[#5A7178] dark:text-[#9DB4BA]">Current Stock: <strong>{restockItem.stock} {restockItem.unit}</strong></p>

              <div>
                <label className="block text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider mb-1 mt-3">
                  Add Quantity ({restockItem.unit}):
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] text-sm font-bold text-[#132226] dark:text-[#F4F7F6]"
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
                className="py-2 px-3 bg-white dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] text-xs font-semibold rounded-xl cursor-pointer"
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
