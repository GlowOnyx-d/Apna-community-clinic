import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { 
  Stethoscope, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Ticket,
  X,
  Search,
  Activity,
  History,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Pill,
  Heart,
  Thermometer,
  Wind,
  Droplet,
  Scale
} from 'lucide-react';
import VitalsModal from '../../components/common/VitalsModal';

// Web Audio Chime for consultation start
const playConsultationChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;
    
    // Note 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Note 2: A5 (880.00 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.12);
    gain2.gain.setValueAtTime(0.14, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (e) {
    console.warn('Audio chime cue not supported or blocked:', e);
  }
};

// Clinical Range Evaluator
const evaluateVital = (type, valStr) => {
  if (!valStr) return null;
  const str = String(valStr).trim();

  switch (type) {
    case 'bp': {
      const parts = str.split('/');
      const sys = parseFloat(parts[0]);
      const dia = parts[1] ? parseFloat(parts[1]) : 0;
      if (isNaN(sys)) return null;
      if (sys >= 140 || dia >= 90) {
        return { status: 'High Alert', level: 'alert', segment: 3, label: 'Stage 1/2 HTN', bg: 'bg-rose-500', pill: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60' };
      } else if (sys >= 120 || dia >= 80) {
        return { status: 'Pre-HTN', level: 'warning', segment: 2, label: 'Elevated', bg: 'bg-amber-500', pill: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60' };
      }
      return { status: 'Optimal', level: 'safe', segment: 1, label: 'Normal (<120/80)', bg: 'bg-emerald-500', pill: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60' };
    }
    case 'pulse': {
      const num = parseFloat(str.replace(/[^0-9.]/g, ''));
      if (isNaN(num)) return null;
      if (num < 60) {
        return { status: 'Bradycardia', level: 'warning', segment: 1, label: 'Low (<60)', bg: 'bg-amber-500', pill: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60' };
      } else if (num > 100) {
        return { status: 'Tachycardia', level: 'alert', segment: 3, label: 'High (>100)', bg: 'bg-rose-500', pill: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60' };
      }
      return { status: 'Optimal', level: 'safe', segment: 2, label: 'Normal (60-100)', bg: 'bg-emerald-500', pill: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60' };
    }
    case 'spo2': {
      const num = parseFloat(str.replace(/[^0-9.]/g, ''));
      if (isNaN(num)) return null;
      if (num < 90) {
        return { status: 'Hypoxia', level: 'alert', segment: 1, label: 'Critical (<90%)', bg: 'bg-rose-500', pill: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60' };
      } else if (num < 95) {
        return { status: 'Low Sat', level: 'warning', segment: 2, label: 'Attention (90-94%)', bg: 'bg-amber-500', pill: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60' };
      }
      return { status: 'Optimal', level: 'safe', segment: 3, label: 'Safe (95-100%)', bg: 'bg-emerald-500', pill: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60' };
    }
    case 'temperature': {
      const num = parseFloat(str.replace(/[^0-9.]/g, ''));
      if (isNaN(num)) return null;
      if (num >= 100.4) {
        return { status: 'Pyrexia', level: 'alert', segment: 3, label: 'High Fever (≥100.4°F)', bg: 'bg-rose-500', pill: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60' };
      } else if (num >= 99.0) {
        return { status: 'Mild Fever', level: 'warning', segment: 2, label: 'Elevated (99-100.3°F)', bg: 'bg-amber-500', pill: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60' };
      }
      return { status: 'Afebrile', level: 'safe', segment: 1, label: 'Normal (<99°F)', bg: 'bg-emerald-500', pill: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60' };
    }
    case 'bloodSugar': {
      const num = parseFloat(str.replace(/[^0-9.]/g, ''));
      if (isNaN(num)) return null;
      if (num >= 200) {
        return { status: 'High Alert', level: 'alert', segment: 3, label: 'Diabetic (≥200)', bg: 'bg-rose-500', pill: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60' };
      } else if (num > 140) {
        return { status: 'Elevated', level: 'warning', segment: 2, label: 'Pre-Diabetic (141-199)', bg: 'bg-amber-500', pill: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60' };
      }
      return { status: 'Optimal', level: 'safe', segment: 1, label: 'Normal (70-140)', bg: 'bg-emerald-500', pill: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60' };
    }
    default:
      return null;
  }
};

function VitalGaugeCard({ type, label, value, compact = false }) {
  const evalResult = evaluateVital(type, value);
  if (!value) return null;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-medium border ${evalResult ? evalResult.pill : 'bg-white dark:bg-[#1C221C] border-[#E6DFC6] dark:border-[#2F3B2F] text-[#22291F] dark:text-[#FAF7F2]'}`}>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${evalResult ? evalResult.bg : 'bg-[#2D6A4F]'}`} />
        <span className="font-bold">{label}:</span>
        <span>{value}</span>
        {evalResult && (
          <span className="text-[9px] opacity-80 uppercase tracking-wider font-bold">({evalResult.status})</span>
        )}
      </span>
    );
  }

  // Full Rich Gauge with 3-segment visual meter
  return (
    <div className="flex-1 min-w-[130px] p-2.5 rounded-xl bg-white dark:bg-[#1C221C] border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-2xs space-y-1.5">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-[#6B6B63] dark:text-[#C4CFC3]">{label}</span>
        {evalResult && (
          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${evalResult.pill}`}>
            {evalResult.status}
          </span>
        )}
      </div>
      <div className="text-sm font-extrabold text-[#22291F] dark:text-[#FAF7F2] tracking-tight">
        {value}
      </div>
      {/* Visual Range 3-Segment Bar */}
      <div className="space-y-0.5 pt-0.5">
        <div className="grid grid-cols-3 gap-1">
          <div className={`h-1.5 rounded-full transition-all ${evalResult?.segment === 1 ? 'bg-emerald-500 ring-2 ring-emerald-300 dark:ring-emerald-700' : 'bg-emerald-200 dark:bg-emerald-950/40 opacity-40'}`} />
          <div className={`h-1.5 rounded-full transition-all ${evalResult?.segment === 2 ? 'bg-amber-500 ring-2 ring-amber-300 dark:ring-amber-700' : 'bg-amber-200 dark:bg-amber-950/40 opacity-40'}`} />
          <div className={`h-1.5 rounded-full transition-all ${evalResult?.segment === 3 ? 'bg-rose-500 ring-2 ring-rose-300 dark:ring-rose-700' : 'bg-rose-200 dark:bg-rose-950/40 opacity-40'}`} />
        </div>
        {evalResult?.label && (
          <div className="text-[9px] text-[#8E8E84] dark:text-[#94A493] truncate pt-0.5">
            {evalResult.label}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  const { userProfile, role } = useAuth();
  const { appointments, doctors, labReports, completeConsultation, seedSampleClinicData } = useData();

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [vitalsModalAppointment, setVitalsModalAppointment] = useState(null);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showLabReportsDrawer, setShowLabReportsDrawer] = useState(true);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today'
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'completed'
  const [selectedDoctorView, setSelectedDoctorView] = useState('my_queue'); // 'my_queue' | doctorId | 'all'

  // Lock background scroll when consultation modal is open
  useEffect(() => {
    if (selectedAppointment) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedAppointment]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to normalize and match names / emails / UIDs
  const matchDoctor = (apt, profile) => {
    if (!profile) return false;
    // 1. Direct UID match
    if (apt.doctorId && profile.uid && apt.doctorId === profile.uid) return true;

    // 2. Direct Email match (case-insensitive)
    if (apt.doctorEmail && profile.email && apt.doctorEmail.toLowerCase() === profile.email.toLowerCase()) return true;

    // 3. Email alias match (e.g. rajesh.patel in email matches apt.doctorEmail or doctorId)
    if (profile.email) {
      const pEmail = profile.email.toLowerCase();
      const pPrefix = pEmail.split('@')[0];
      if (apt.doctorEmail && apt.doctorEmail.toLowerCase().includes(pPrefix)) return true;
      if (apt.doctorId && apt.doctorId.toLowerCase().includes(pPrefix.replace(/\./g, '_'))) return true;
      if (pEmail.includes('patel') && (apt.doctorId?.includes('patel') || apt.doctorName?.toLowerCase().includes('patel') || apt.doctorEmail?.includes('patel'))) return true;
      if (pEmail.includes('sarah') && (apt.doctorId?.includes('sarah') || apt.doctorName?.toLowerCase().includes('sarah') || apt.doctorEmail?.includes('sarah'))) return true;
      if (pEmail.includes('priya') && (apt.doctorId?.includes('priya') || apt.doctorName?.toLowerCase().includes('priya') || apt.doctorEmail?.includes('priya'))) return true;
      if (pEmail.includes('amitav') && (apt.doctorId?.includes('amitav') || apt.doctorName?.toLowerCase().includes('amitav') || apt.doctorEmail?.includes('amitav'))) return true;
      if (pEmail.includes('meera') && (apt.doctorId?.includes('meera') || apt.doctorName?.toLowerCase().includes('meera') || apt.doctorEmail?.includes('meera'))) return true;
    }

    // 4. Clean name match
    if (apt.doctorName && profile.name) {
      const cleanA = apt.doctorName.replace(/^Dr\.\s*/i, '').trim().toLowerCase();
      const cleanB = profile.name.replace(/^Dr\.\s*/i, '').trim().toLowerCase();
      if (cleanA === cleanB) return true;
      if (cleanA.includes(cleanB) || cleanB.includes(cleanA)) return true;
      const partsA = cleanA.split(/\s+/);
      const partsB = cleanB.split(/\s+/);
      if (partsA.some(p => p.length > 2 && partsB.includes(p))) return true;
    }

    return false;
  };

  // Match active doctor profile to read their daily slot capacity
  const activeDoctor = useMemo(() => {
    if (selectedDoctorView !== 'my_queue' && selectedDoctorView !== 'all') {
      return doctors.find(d => d.id === selectedDoctorView) || null;
    }
    if (role === 'admin' && selectedDoctorView === 'all') {
      return null;
    }
    return (
      doctors.find(d => matchDoctor({ doctorId: d.id, doctorEmail: d.email, doctorName: d.name }, userProfile)) ||
      doctors.find(d => d.email && userProfile?.email && d.email.toLowerCase() === userProfile.email.toLowerCase()) ||
      doctors.find(d => {
        if (!userProfile?.email || !d.email) return false;
        const uPrefix = userProfile.email.split('@')[0].toLowerCase();
        const dPrefix = d.email.split('@')[0].toLowerCase();
        return uPrefix === dPrefix || dPrefix.includes(uPrefix) || uPrefix.includes(dPrefix);
      }) ||
      doctors[0] ||
      null
    );
  }, [doctors, role, userProfile, selectedDoctorView]);

  // Filter appointments for this doctor (or selected doctor if admin / switcher)
  const doctorAppointments = useMemo(() => {
    return appointments.filter(apt => {
      // 1. Doctor selection
      if (selectedDoctorView === 'all') {
        // Show all clinic appointments
      } else if (selectedDoctorView !== 'my_queue') {
        const d = doctors.find(doc => doc.id === selectedDoctorView);
        const matches = apt.doctorId === selectedDoctorView || 
          (d && d.email && apt.doctorEmail && apt.doctorEmail.toLowerCase() === d.email.toLowerCase()) ||
          (d && d.name && apt.doctorName && apt.doctorName.toLowerCase().includes(d.name.replace(/^Dr\.\s*/i, '').toLowerCase()));
        if (!matches) return false;
      } else {
        // 'my_queue'
        if (role === 'admin') {
          // If admin without specific selection, show all
        } else {
          const matches = matchDoctor(apt, userProfile);
          if (!matches) return false;
        }
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
        const matchesDiagnosis = apt.diagnosis?.toLowerCase().includes(q);
        if (!matchesPatient && !matchesToken && !matchesReason && !matchesDiagnosis) return false;
      }

      return true;
    });
  }, [appointments, doctors, role, userProfile, selectedDoctorView, dateFilter, searchQuery, todayStr]);

  const pendingQueue = useMemo(() => {
    return doctorAppointments
      .filter(a => a.status === 'pending')
      .sort((a, b) => {
        const tA = a.tokenNumber || '';
        const tB = b.tokenNumber || '';
        return tA.localeCompare(tB, undefined, { numeric: true });
      });
  }, [doctorAppointments]);

  const completedVisits = useMemo(() => {
    return doctorAppointments
      .filter(a => a.status === 'done')
      .sort((a, b) => new Date(b.completedAt || b.createdAt || 0) - new Date(a.completedAt || a.createdAt || 0));
  }, [doctorAppointments]);

  // Appointments specifically scheduled for today to monitor daily schedule utilization
  const todayDoctorAppointments = useMemo(() => {
    return appointments.filter(apt => {
      if (apt.date !== todayStr) return false;
      if (selectedDoctorView === 'all') return true;
      if (selectedDoctorView !== 'my_queue') {
        const d = doctors.find(doc => doc.id === selectedDoctorView);
        return apt.doctorId === selectedDoctorView || 
          (d && d.email && apt.doctorEmail && apt.doctorEmail.toLowerCase() === d.email.toLowerCase());
      }
      if (role === 'admin') return true;
      return matchDoctor(apt, userProfile);
    });
  }, [appointments, role, userProfile, selectedDoctorView, doctors, todayStr]);

  const todayBookedCount = todayDoctorAppointments.length;
  const todayCompletedCount = todayDoctorAppointments.filter(a => a.status === 'done').length;
  const todayPendingCount = todayDoctorAppointments.filter(a => a.status === 'pending').length;

  const maxDailySlots = useMemo(() => {
    if (activeDoctor) {
      return activeDoctor.maxSlotsPerDay || activeDoctor.availableSlots?.length || 6;
    }
    if (selectedDoctorView === 'all' || (role === 'admin' && selectedDoctorView === 'my_queue')) {
      const sum = doctors.reduce((acc, d) => acc + (d.maxSlotsPerDay || d.availableSlots?.length || 4), 0);
      return sum > 0 ? sum : 20;
    }
    return 6;
  }, [activeDoctor, selectedDoctorView, role, doctors]);

  const bookedSlotsPct = maxDailySlots > 0 ? Math.round((todayBookedCount / maxDailySlots) * 100) : 0;
  const completionPct = todayBookedCount > 0 ? Math.round((todayCompletedCount / todayBookedCount) * 100) : 0;
  const queuePct = todayBookedCount > 0 ? Math.round((todayPendingCount / todayBookedCount) * 100) : 0;

  const handleOpenConsultation = (apt) => {
    playConsultationChime();
    setSelectedAppointment(apt);
    setDiagnosis(apt.diagnosis || '');
    setNotes(apt.notes || '');
    setPrescription(apt.prescription || '');
  };

  const handleSaveConsultation = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedAppointment || loading) return;

    if (!diagnosis.trim()) {
      alert('Please enter a clinical diagnosis before completing consultation.');
      return;
    }

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

  // Keyboard shortcuts listener: Esc to close, Ctrl+Enter / Cmd+Enter to complete consultation
  useEffect(() => {
    if (!selectedAppointment) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedAppointment(null);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSaveConsultation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAppointment, diagnosis, notes, prescription, loading]);

  const RX_TEMPLATES = [
    {
      name: 'Viral Fever',
      diagnosis: 'Acute Viral Syndrome / Upper Respiratory Infection',
      rx: '1. Tab Paracetamol 650mg TDS x 3 days\n2. Tab Cetirizine 10mg OD HS x 3 days\n3. ORS hydration sachet in 1L water daily',
      notes: 'Adequate rest and warm fluid intake. Review after 3 days if fever persists above 101°F.'
    },
    {
      name: 'Gastritis / Acidity',
      diagnosis: 'Acute Gastritis / Acid Reflux Dyspepsia',
      rx: '1. Cap Pantoprazole 40mg OD before breakfast x 5 days\n2. Antacid Gel 10ml TDS after food x 5 days',
      notes: 'Advised bland diet, avoid excessive spices, caffeine, and late night dinners.'
    },
    {
      name: 'Hypertension Routine',
      diagnosis: 'Essential Hypertension - Routine Clinical Review',
      rx: '1. Tab Amlodipine 5mg OD morning after breakfast\n2. Dietary salt restriction (<5g/day)',
      notes: 'Regular blood pressure monitoring. Advised 30 mins brisk walking daily. Review in 15 days.'
    },
    {
      name: 'Pediatric ORS',
      diagnosis: 'Acute Gastroenteritis / Mild Pediatric Dehydration',
      rx: '1. WHO-ORS solution after every loose stool\n2. Syrup Zinc 20mg OD x 14 days\n3. Syrup Paracetamol 120mg/5ml SOS for fever',
      notes: 'Continue normal fluids. Warning signs explained: sunken eyes, lethargy, decreased urine.'
    }
  ];

  const applyRxTemplate = (template) => {
    setDiagnosis(template.diagnosis);
    setPrescription(template.rx);
    setNotes(template.notes);
  };

  const patientPastVisits = useMemo(() => {
    if (!selectedAppointment) return [];
    return appointments.filter(a => 
      a.status === 'done' && 
      (a.patientId === selectedAppointment.patientId || (a.patientName && a.patientName === selectedAppointment.patientName)) && 
      a.id !== selectedAppointment.id
    );
  }, [appointments, selectedAppointment]);

  const patientLabReports = useMemo(() => {
    if (!selectedAppointment) return [];
    return (labReports || []).filter(rep => {
      const matchId = rep.patientId && selectedAppointment.patientId && rep.patientId === selectedAppointment.patientId;
      const matchName = rep.patientName && selectedAppointment.patientName && rep.patientName.toLowerCase() === selectedAppointment.patientName.toLowerCase();
      const matchEmail = rep.patientEmail && selectedAppointment.patientEmail && rep.patientEmail.toLowerCase() === selectedAppointment.patientEmail.toLowerCase();
      return matchId || matchName || matchEmail;
    });
  }, [labReports, selectedAppointment]);

  const handleAdminSeed = async () => {
    if (window.confirm('Load complete starter clinic dataset across all 3 dashboards (5 specialists, active consultation queues, triage vitals, and SDG 3 health camps)?')) {
      await seedSampleClinicData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#F0EBE1] dark:bg-[#1C221C] border border-[#E4DCCE] dark:border-[#2F3B2F] text-[#22291F] dark:text-[#FAF7F2] p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D6A4F]/10 dark:bg-[#52B788]/20 text-[#2D6A4F] dark:text-[#52B788] text-xs font-semibold border border-[#2D6A4F]/20 dark:border-[#52B788]/30">
              <Stethoscope className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788]" />
              <span>Doctor Clinical Consultation Queue</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-[#22291F] dark:text-[#FAF7F2]">
              Welcome, {activeDoctor?.name || userProfile?.name || 'Doctor'}
            </h1>
            <p className="text-sm text-[#6B6B63] dark:text-[#C4CFC3]">
              {activeDoctor ? `${activeDoctor.specialization} • ${activeDoctor.cabin || 'Cabin 101'}` : (userProfile?.specialization || 'Clinical Specialist')} • Manage daily patient token streams and record diagnostic notes.
            </p>
          </div>

          {role === 'admin' && (
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleAdminSeed}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/90 dark:bg-[#242C24] hover:bg-white dark:hover:bg-[#2F3B2F] text-[#2D6A4F] dark:text-[#52B788] border border-[#2D6A4F]/30 dark:border-[#52B788]/30 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                title="Hydrate all 3 dashboards with full clinic demo data"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788]" />
                <span>Load Sample Data</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1: In Queue */}
        <div 
          onClick={() => setActiveTab('queue')}
          className={`p-3.5 sm:p-5 rounded-2xl border shadow-sm flex flex-col justify-between cursor-pointer transition-all ${
            activeTab === 'queue'
              ? 'bg-white dark:bg-[#1C221C] border-[#2D6A4F] dark:border-[#52B788] ring-2 ring-[#2D6A4F]/15 dark:ring-[#52B788]/20'
              : 'bg-white dark:bg-[#1C221C] border-[#E6DFC6] dark:border-[#2F3B2F] hover:border-[#2D6A4F]/40'
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#C97B4A]/12 dark:bg-[#E58A54]/18 text-[#C97B4A] dark:text-[#E58A54] border border-[#C97B4A]/25 dark:border-[#E58A54]/30 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider">In Queue</p>
              <p className="text-xl sm:text-2xl font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">{pendingQueue.length}</p>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-[#E6DFC6]/60 dark:border-[#2F3B2F] space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#6B6B63] dark:text-[#C4CFC3]">Awaiting consult</span>
              <span className="font-semibold text-[#C97B4A] dark:text-[#E58A54]">
                {todayBookedCount > 0 ? `${queuePct}% today` : `${pendingQueue.length} waiting`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#FAF7F2] dark:bg-[#242C24] rounded-full overflow-hidden border border-[#E6DFC6]/60 dark:border-[#2F3B2F]">
              <div 
                className="h-full bg-[#C97B4A] dark:bg-[#E58A54] rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, todayBookedCount > 0 ? queuePct : (pendingQueue.length > 0 ? 50 : 0))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Completed */}
        <div 
          onClick={() => setActiveTab('completed')}
          className={`p-3.5 sm:p-5 rounded-2xl border shadow-sm flex flex-col justify-between cursor-pointer transition-all ${
            activeTab === 'completed'
              ? 'bg-white dark:bg-[#1C221C] border-[#2D6A4F] dark:border-[#52B788] ring-2 ring-[#2D6A4F]/15 dark:ring-[#52B788]/20'
              : 'bg-white dark:bg-[#1C221C] border-[#E6DFC6] dark:border-[#2F3B2F] hover:border-[#2D6A4F]/40'
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#2D6A4F]/10 dark:bg-[#52B788]/20 text-[#2D6A4F] dark:text-[#52B788] border border-[#2D6A4F]/20 dark:border-[#52B788]/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider">Completed</p>
              <p className="text-xl sm:text-2xl font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">{completedVisits.length}</p>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-[#E6DFC6]/60 dark:border-[#2F3B2F] space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#6B6B63] dark:text-[#C4CFC3]">Consultation rate</span>
              <span className="font-semibold text-[#2D6A4F] dark:text-[#52B788]">
                {todayBookedCount > 0 ? `${completionPct}% completed` : `${completedVisits.length} total`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#FAF7F2] dark:bg-[#242C24] rounded-full overflow-hidden border border-[#E6DFC6]/60 dark:border-[#2F3B2F]">
              <div 
                className="h-full bg-[#2D6A4F] dark:bg-[#52B788] rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, todayBookedCount > 0 ? completionPct : (completedVisits.length > 0 ? 100 : 0))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Total Appointments & Daily Slot Capacity */}
        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-[#1C221C] p-3.5 sm:p-5 rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#2D6A4F]/10 dark:bg-[#52B788]/20 text-[#2D6A4F] dark:text-[#52B788] border border-[#2D6A4F]/20 dark:border-[#52B788]/30 flex items-center justify-center shrink-0">
              <Ticket className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider">Total Appointments</p>
              <p className="text-xl sm:text-2xl font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">{doctorAppointments.length}</p>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-[#E6DFC6]/60 dark:border-[#2F3B2F] space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#6B6B63] dark:text-[#C4CFC3]">Today's schedule</span>
              <span className="font-semibold text-[#22291F] dark:text-[#FAF7F2]">
                {todayBookedCount} of {maxDailySlots} slots booked
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#FAF7F2] dark:bg-[#242C24] rounded-full overflow-hidden border border-[#E6DFC6]/60 dark:border-[#2F3B2F]">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  bookedSlotsPct >= 100 
                    ? 'bg-[#C97B4A] dark:bg-[#E58A54]' 
                    : 'bg-[#2D6A4F] dark:bg-[#52B788]'
                }`} 
                style={{ width: `${Math.min(100, bookedSlotsPct)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Queue Filter, Doctor Switcher & Search Toolbar */}
      <div className="bg-white dark:bg-[#1C221C] rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
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

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          
          {/* Doctor Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] font-medium hidden sm:inline">Doctor:</span>
            <select
              value={selectedDoctorView}
              onChange={(e) => setSelectedDoctorView(e.target.value)}
              className="px-3 py-1.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-xs font-semibold text-[#22291F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] cursor-pointer"
            >
              {role !== 'admin' && (
                <option value="my_queue">
                  My Queue ({activeDoctor?.name || 'Dr. Patel'})
                </option>
              )}
              <option value="all">All Clinic Specialists ({doctors.length})</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.specialization?.split('&')[0].trim() || 'Specialist'})
                </option>
              ))}
            </select>
          </div>

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

          {/* Tab Switcher */}
          <div className="flex bg-[#FAF7F2] dark:bg-[#242C24] p-1 rounded-xl gap-1 border border-[#D8CEB3] dark:border-[#2F3B2F]">
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'queue' ? 'bg-[#2D6A4F] dark:bg-[#357A5B] text-[#FAF7F2] shadow-xs' : 'text-[#6B6B63] dark:text-[#C4CFC3] hover:text-[#22291F] dark:hover:text-[#FAF7F2]'
              }`}
            >
              <span>Queue</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'queue' ? 'bg-white/20 text-white' : 'bg-[#E6DFC6] dark:bg-[#333] text-[#22291F] dark:text-white'}`}>
                {pendingQueue.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'completed' ? 'bg-[#2D6A4F] dark:bg-[#357A5B] text-[#FAF7F2] shadow-xs' : 'text-[#6B6B63] dark:text-[#C4CFC3] hover:text-[#22291F] dark:hover:text-[#FAF7F2]'
              }`}
            >
              <span>Completed</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'completed' ? 'bg-white/20 text-white' : 'bg-[#E6DFC6] dark:bg-[#333] text-[#22291F] dark:text-white'}`}>
                {completedVisits.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'queue' ? (
        /* TAB 1: ACTIVE PATIENT QUEUE */
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
            <div className="bg-[#FAF7F2] dark:bg-[#1C221C] rounded-2xl border border-dashed border-[#D8CEB3] dark:border-[#2F3B2F] p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#2D6A4F]/10 dark:bg-[#52B788]/20 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">No Patients in Queue</h3>
                <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] max-w-md mx-auto mt-1">
                  There are no pending consultation tokens right now. To load or refresh starter clinic data across all 3 dashboards, please switch to the Admin Dashboard (admin@communityclinic.org) and click "Load Sample Data".
                </p>
              </div>
              {role === 'admin' && (
                <button
                  type="button"
                  onClick={handleAdminSeed}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Load Sample Clinic Data</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingQueue.map((apt) => (
                <div key={apt.id} className="bg-white dark:bg-[#1C221C] rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] hover:border-[#2D6A4F]/40 dark:hover:border-[#445644] p-5 shadow-sm transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl bg-[#2D6A4F] dark:bg-[#357A5B] text-[#FAF7F2] font-bold text-sm tracking-wider shadow-xs">
                          {apt.tokenNumber || 'TK'}
                        </span>
                        {apt.doctorName && selectedDoctorView === 'all' && (
                          <span className="text-[11px] px-2 py-0.5 rounded-lg bg-[#2D6A4F]/10 dark:bg-[#52B788]/15 text-[#2D6A4F] dark:text-[#52B788] font-semibold truncate max-w-[130px]">
                            {apt.doctorName}
                          </span>
                        )}
                      </div>
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
                      <p className="text-[#22291F] dark:text-[#FAF7F2] font-medium">{apt.reason || 'General Consultation'}</p>
                    </div>

                    {/* Vitals summary chip preview */}
                    {apt.vitals ? (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#242C24] border border-[#E6DFC6] dark:border-[#2F3B2F] space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-[#2D6A4F] dark:text-[#52B788] flex items-center gap-1">
                            <Activity className="w-3 h-3" /> Triage Vitals
                          </span>
                          {apt.vitals.hasAlert ? (
                            <span className="px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold flex items-center gap-1 text-[9px] border border-rose-300 dark:border-rose-900/60">
                              <AlertCircle className="w-2.5 h-2.5" /> High Attention
                            </span>
                          ) : (
                            <span className="text-[9px] text-[#6B6B63] dark:text-[#C4CFC3]">Stable</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {apt.vitals.bp && (
                            <VitalGaugeCard type="bp" label="BP" value={apt.vitals.bp} compact={true} />
                          )}
                          {apt.vitals.pulse && (
                            <VitalGaugeCard type="pulse" label="Pulse" value={apt.vitals.pulse} compact={true} />
                          )}
                          {apt.vitals.spo2 && (
                            <VitalGaugeCard type="spo2" label="SpO2" value={apt.vitals.spo2} compact={true} />
                          )}
                          {apt.vitals.temperature && (
                            <VitalGaugeCard type="temperature" label="Temp" value={apt.vitals.temperature} compact={true} />
                          )}
                          {apt.vitals.bloodSugar && (
                            <VitalGaugeCard type="bloodSugar" label="Sugar" value={apt.vitals.bloodSugar} compact={true} />
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-[11px] text-[#6B6B63] dark:text-[#C4CFC3] italic flex items-center gap-1">
                        <Activity className="w-3 h-3 text-[#8E8E84]" /> Pre-consultation vitals not yet logged
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setVitalsModalAppointment(apt)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#FAF7F2] dark:bg-[#242C24] hover:bg-[#E6DFC6]/60 dark:hover:bg-[#2F3B2F] border border-[#D8CEB3] dark:border-[#2F3B2F] text-[#22291F] dark:text-[#FAF7F2] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      <Activity className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788]" />
                      <span>{apt.vitals ? 'Edit Vitals' : 'Log Vitals'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenConsultation(apt)}
                      className="flex-2 flex items-center justify-center gap-1.5 py-2 px-4 bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Start Consultation</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: COMPLETED CONSULTATIONS & CLINICAL RECORDS */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">
              Completed Consultations &amp; Clinical Records ({completedVisits.length})
            </h2>
            <span className="text-xs font-medium text-[#6B6B63] dark:text-[#C4CFC3]">
              Archived consultation notes &amp; digital prescriptions
            </span>
          </div>

          {completedVisits.length === 0 ? (
            <div className="bg-[#FAF7F2] dark:bg-[#1C221C] rounded-2xl border border-dashed border-[#D8CEB3] dark:border-[#2F3B2F] p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#2D6A4F]/10 dark:bg-[#52B788]/20 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">No Completed Visits Yet</h3>
                <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] max-w-md mx-auto mt-1">
                  Completed consultations will appear here with clinical diagnoses, prescribed medications, and doctor follow-up notes.
                </p>
              </div>
              {role === 'admin' && (
                <button
                  type="button"
                  onClick={handleAdminSeed}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Load Sample Clinic Data</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedVisits.map((apt) => (
                <div key={apt.id} className="bg-white dark:bg-[#1C221C] rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] p-5 shadow-sm space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E6DFC6]/60 dark:border-[#2F3B2F]">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#2D6A4F]/10 dark:bg-[#52B788]/20 text-[#2D6A4F] dark:text-[#52B788] font-bold text-xs">
                        {apt.tokenNumber || 'TK'}
                      </span>
                      <span className="text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3]">
                        {apt.date} • {apt.time}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" /> Consulted
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">{apt.patientName}</h3>
                    <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] mt-0.5">
                      {apt.patientGender || 'Adult'}, {apt.patientAge || 'Age N/A'} • {apt.doctorName}
                    </p>
                  </div>

                  {/* Diagnosis */}
                  {apt.diagnosis && (
                    <div className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#242C24] border border-[#E6DFC6] dark:border-[#2F3B2F]">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#2D6A4F] dark:text-[#52B788] block">Clinical Diagnosis</span>
                      <p className="text-xs font-bold text-[#22291F] dark:text-[#FAF7F2] mt-0.5">{apt.diagnosis}</p>
                    </div>
                  )}

                  {/* Prescription */}
                  {apt.prescription && (
                    <div className="p-2.5 rounded-xl bg-[#FAF7F2]/60 dark:bg-[#242C24]/60 border border-[#E6DFC6]/60 dark:border-[#2F3B2F] space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#6B6B63] dark:text-[#C4CFC3] flex items-center gap-1">
                        <Pill className="w-3 h-3 text-[#2D6A4F] dark:text-[#52B788]" /> Prescription &amp; Dosage
                      </span>
                      <p className="text-[11px] font-mono text-[#22291F] dark:text-[#FAF7F2] whitespace-pre-wrap">{apt.prescription}</p>
                    </div>
                  )}

                  {/* Observations / Notes */}
                  {apt.notes && (
                    <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] italic pt-1 border-t border-[#E6DFC6]/50 dark:border-[#2F3B2F]/60">
                      <strong>Notes:</strong> {apt.notes}
                    </p>
                  )}

                  {/* Vitals Chip */}
                  {apt.vitals && (
                    <div className="pt-2 border-t border-[#E6DFC6]/60 dark:border-[#2F3B2F] flex flex-wrap gap-2 text-[10px]">
                      {apt.vitals.bp && <span className="px-2 py-0.5 rounded bg-[#FAF7F2] dark:bg-[#242C24] border border-[#E6DFC6] dark:border-[#2F3B2F]"><strong>BP:</strong> {apt.vitals.bp}</span>}
                      {apt.vitals.pulse && <span className="px-2 py-0.5 rounded bg-[#FAF7F2] dark:bg-[#242C24] border border-[#E6DFC6] dark:border-[#2F3B2F]"><strong>Pulse:</strong> {apt.vitals.pulse}</span>}
                      {apt.vitals.spo2 && <span className="px-2 py-0.5 rounded bg-[#FAF7F2] dark:bg-[#242C24] border border-[#E6DFC6] dark:border-[#2F3B2F]"><strong>SpO2:</strong> {apt.vitals.spo2}</span>}
                      {apt.vitals.weight && <span className="px-2 py-0.5 rounded bg-[#FAF7F2] dark:bg-[#242C24] border border-[#E6DFC6] dark:border-[#2F3B2F]"><strong>Wt:</strong> {apt.vitals.weight}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Consultation Modal */}
      {selectedAppointment && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#1C221C] w-full max-w-xl rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-2xl p-6 space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6DFC6] dark:border-[#2F3B2F]">
              <div>
                <span className="text-xs font-semibold text-[#2D6A4F] dark:text-[#52B788] uppercase tracking-wider">Consultation Token: {selectedAppointment.tokenNumber}</span>
                <h3 className="text-lg font-bold text-[#22291F] dark:text-[#FAF7F2] mt-0.5 font-heading">
                  Patient: {selectedAppointment.patientName} ({selectedAppointment.patientAge || 'Adult'}y • {selectedAppointment.patientGender || 'Unspecified'})
                </h3>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-1.5 rounded-lg text-[#6B6B63] hover:bg-[#FAF7F2] dark:text-[#C4CFC3] dark:hover:bg-[#242C24] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vitals Triage Banner with Visual Range Meters */}
            {selectedAppointment.vitals ? (
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#242C24] border border-[#E6DFC6] dark:border-[#2F3B2F] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[11px] uppercase tracking-wider text-[#2D6A4F] dark:text-[#52B788] flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" />
                      Patient Triage Vitals &amp; Clinical Ranges
                    </span>
                    {selectedAppointment.vitals.hasAlert && (
                      <span className="px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold flex items-center gap-1 text-[9px] border border-rose-300 dark:border-rose-900/60">
                        <AlertCircle className="w-2.5 h-2.5" /> High Attention
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setVitalsModalAppointment(selectedAppointment)}
                    className="text-[11px] text-[#2D6A4F] dark:text-[#52B788] hover:underline font-semibold cursor-pointer"
                  >
                    Edit Vitals
                  </button>
                </div>

                {/* Segmented Visual Meters Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedAppointment.vitals.bp && (
                    <VitalGaugeCard type="bp" label="Blood Pressure" value={selectedAppointment.vitals.bp} />
                  )}
                  {selectedAppointment.vitals.pulse && (
                    <VitalGaugeCard type="pulse" label="Heart Rate" value={selectedAppointment.vitals.pulse} />
                  )}
                  {selectedAppointment.vitals.spo2 && (
                    <VitalGaugeCard type="spo2" label="Blood Oxygen" value={selectedAppointment.vitals.spo2} />
                  )}
                  {selectedAppointment.vitals.temperature && (
                    <VitalGaugeCard type="temperature" label="Body Temp" value={selectedAppointment.vitals.temperature} />
                  )}
                  {selectedAppointment.vitals.bloodSugar && (
                    <VitalGaugeCard type="bloodSugar" label="Blood Sugar" value={selectedAppointment.vitals.bloodSugar} />
                  )}
                  {selectedAppointment.vitals.weight && (
                    <div className="flex-1 min-w-[130px] p-2.5 rounded-xl bg-white dark:bg-[#1C221C] border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-2xs space-y-1.5">
                      <span className="font-semibold text-[#6B6B63] dark:text-[#C4CFC3] text-[11px] block">Patient Weight</span>
                      <div className="text-sm font-extrabold text-[#22291F] dark:text-[#FAF7F2] tracking-tight">
                        {selectedAppointment.vitals.weight}
                      </div>
                      <div className="text-[9px] text-[#8E8E84] dark:text-[#94A493] pt-0.5">Physical Metric</div>
                    </div>
                  )}
                </div>

                {selectedAppointment.vitals.notes && (
                  <p className="text-[11px] text-[#6B6B63] dark:text-[#C4CFC3] italic pt-1.5 border-t border-[#E6DFC6]/50 dark:border-[#2F3B2F]/60">
                    <strong>Nurse Note:</strong> {selectedAppointment.vitals.notes}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#242C24] border border-[#E6DFC6] dark:border-[#2F3B2F] text-xs">
                <span className="text-[#6B6B63] dark:text-[#C4CFC3]">Pre-consultation vitals not yet logged</span>
                <button
                  type="button"
                  onClick={() => setVitalsModalAppointment(selectedAppointment)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#2D6A4F]/10 hover:bg-[#2D6A4F]/20 text-[#2D6A4F] dark:text-[#52B788] rounded-lg font-semibold text-[11px] cursor-pointer"
                >
                  <Activity className="w-3 h-3" />
                  <span>+ Record Vitals</span>
                </button>
              </div>
            )}

            {/* Past Medical History Accordion */}
            {patientPastVisits.length > 0 && (
              <div className="rounded-xl border border-[#E6DFC6] dark:border-[#2F3B2F] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
                  className="w-full flex items-center justify-between p-3 bg-[#FAF7F2] dark:bg-[#242C24] text-xs font-semibold text-[#22291F] dark:text-[#FAF7F2] cursor-pointer hover:bg-[#E6DFC6]/40"
                >
                  <span className="flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788]" />
                    <span>Past Medical History ({patientPastVisits.length} previous visits)</span>
                  </span>
                  {showHistoryDrawer ? <ChevronUp className="w-4 h-4 text-[#6B6B63]" /> : <ChevronDown className="w-4 h-4 text-[#6B6B63]" />}
                </button>
                {showHistoryDrawer && (
                  <div className="p-3 bg-white dark:bg-[#1C221C] space-y-2 max-h-44 overflow-y-auto text-xs border-t border-[#E6DFC6] dark:border-[#2F3B2F]">
                    {patientPastVisits.map(pv => (
                      <div key={pv.id} className="p-2 rounded-lg bg-[#FAF7F2]/70 dark:bg-[#242C24]/70 border border-[#E6DFC6]/60 dark:border-[#2F3B2F] space-y-1">
                        <div className="flex justify-between text-[10px] text-[#6B6B63] dark:text-[#C4CFC3]">
                          <span className="font-semibold">{pv.date} • {pv.doctorName}</span>
                          <span>Token #{pv.tokenNumber}</span>
                        </div>
                        {pv.diagnosis && (
                          <p className="font-bold text-[#22291F] dark:text-[#FAF7F2] text-[11px]">Dx: {pv.diagnosis}</p>
                        )}
                        {pv.prescription && (
                          <p className="font-mono text-[10px] text-[#6B6B63] dark:text-[#C4CFC3] whitespace-pre-wrap">{pv.prescription}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Patient Diagnostic Lab Reports & Pathology Findings */}
            {patientLabReports.length > 0 && (
              <div className="rounded-xl border border-[#2D6A4F]/30 dark:border-[#52B788]/30 overflow-hidden bg-[#2D6A4F]/5 dark:bg-[#52B788]/10">
                <button
                  type="button"
                  onClick={() => setShowLabReportsDrawer(!showLabReportsDrawer)}
                  className="w-full flex items-center justify-between p-3 text-xs font-bold text-[#2D6A4F] dark:text-[#52B788] cursor-pointer hover:bg-[#2D6A4F]/10"
                >
                  <span className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Patient Diagnostic Lab Reports ({patientLabReports.length} available)</span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] bg-[#2D6A4F] text-white">Pathology</span>
                  </span>
                  {showLabReportsDrawer ? <ChevronUp className="w-4 h-4 text-[#2D6A4F]" /> : <ChevronDown className="w-4 h-4 text-[#2D6A4F]" />}
                </button>

                {showLabReportsDrawer && (
                  <div className="p-3 bg-white dark:bg-[#1C221C] space-y-2.5 max-h-48 overflow-y-auto text-xs border-t border-[#2D6A4F]/20">
                    {patientLabReports.map(rep => (
                      <div key={rep.id} className="p-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#242C24] border border-[#E6DFC6] dark:border-[#2F3B2F] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-[#22291F] dark:text-[#FAF7F2]">{rep.testName}</span>
                            <span className="text-[10px] text-[#6B6B63] dark:text-[#C4CFC3] block">{rep.testDate} • {rep.labName}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            rep.status === 'Alert' 
                              ? 'bg-rose-50 text-rose-700 border-rose-200' 
                              : rep.status === 'Borderline'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {rep.status}
                          </span>
                        </div>

                        {rep.keyMetrics && (
                          <div className="flex flex-wrap gap-2 text-[10px]">
                            {rep.keyMetrics.map((km, kIdx) => (
                              <span key={kIdx} className="px-2 py-0.5 bg-white dark:bg-[#1C221C] rounded border border-[#E6DFC6] dark:border-[#2F3B2F]">
                                <strong>{km.param}:</strong> <span className="font-mono text-[#2D6A4F] dark:text-[#52B788] font-bold">{km.value}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        {rep.summary && (
                          <p className="text-[11px] text-[#6B6B63] dark:text-[#C4CFC3] italic">
                            {rep.summary}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider">
                    Prescription &amp; Medication
                  </label>
                  <span className="text-[10px] font-semibold text-[#2D6A4F] dark:text-[#52B788] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Quick Presets:
                  </span>
                </div>
                {/* 1-Click Rx Presets Chips */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {RX_TEMPLATES.map(tmpl => (
                    <button
                      key={tmpl.name}
                      type="button"
                      onClick={() => applyRxTemplate(tmpl)}
                      className="px-2 py-0.5 rounded-lg bg-[#2D6A4F]/8 hover:bg-[#2D6A4F]/15 dark:bg-[#52B788]/15 dark:hover:bg-[#52B788]/25 text-[#2D6A4F] dark:text-[#52B788] border border-[#2D6A4F]/20 dark:border-[#52B788]/30 text-[10px] font-semibold transition-colors cursor-pointer"
                    >
                      + {tmpl.name}
                    </button>
                  ))}
                </div>
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

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E6DFC6] dark:border-[#2F3B2F]">
                <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#6B6B63] dark:text-[#C4CFC3]">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#E6DFC6] dark:border-[#2F3B2F] rounded text-[10px] font-mono shadow-2xs">Esc</kbd>
                    <span>Cancel</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#E6DFC6] dark:border-[#2F3B2F] rounded text-[10px] font-mono shadow-2xs">Ctrl + Enter</kbd>
                    <span>Complete</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedAppointment(null)}
                    className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium text-[#6B6B63] hover:bg-[#FAF7F2] dark:text-[#C4CFC3] dark:hover:bg-[#242C24] border border-[#D8CEB3] dark:border-[#2F3B2F] rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 sm:flex-none px-5 py-2 bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Saving Notes...' : 'Complete Consultation & Save Notes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Nurse / Doctor Vitals Triage Modal */}
      <VitalsModal 
        appointment={vitalsModalAppointment} 
        isOpen={Boolean(vitalsModalAppointment)} 
        onClose={() => setVitalsModalAppointment(null)} 
      />

    </div>
  );
}
