import React, { useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  ShieldCheck, 
  Stethoscope, 
  Megaphone, 
  Plus, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Ticket,
  Download,
  Upload,
  Cloud,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Sparkles,
  RotateCcw,
  Pill,
  Users
} from 'lucide-react';
import StaffManagementModal from './StaffManagementModal';

const PIE_COLORS = ['#0F766E', '#14B8A6', '#2DD4BF', '#FB923C', '#5EEAD4', '#D97706'];

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const { 
    doctors, 
    appointments, 
    announcements, 
    clinicStaff = [],
    exportBackup, 
    restoreBackup,
    seedSampleClinicData,
    resetClinicData
  } = useData();
  const { isDark } = useTheme();
  const fileInputRef = useRef(null);
  const [restoreError, setRestoreError] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  const [staffModalOpen, setStaffModalOpen] = useState(false);

  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const completedAppointments = appointments.filter(a => a.status === 'done');

  // 1. Prepare 7-day appointment volume data for AreaChart
  const appointmentTrends = useMemo(() => {
    const dayMap = new Map();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      dayMap.set(str, { date: label, count: 0, completed: 0 });
    }

    appointments.forEach((apt) => {
      if (apt.date && dayMap.has(apt.date)) {
        const item = dayMap.get(apt.date);
        item.count += 1;
        if (apt.status === 'done') item.completed += 1;
      }
    });

    return Array.from(dayMap.values());
  }, [appointments]);

  // 2. Prepare Specialization breakdown data for PieChart
  const specializationData = useMemo(() => {
    const specCount = {};
    if (doctors.length === 0) {
      return [{ name: 'General Medicine', value: 1 }];
    }
    doctors.forEach((doc) => {
      const spec = doc.specialization ? doc.specialization.split('(')[0].trim() : 'General Medicine';
      specCount[spec] = (specCount[spec] || 0) + 1;
    });

    return Object.entries(specCount).map(([name, value]) => ({ name, value }));
  }, [doctors]);

  // Handle Restore File Selection
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setRestoreError('');
      setIsRestoring(true);
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed.data) {
        throw new Error('Invalid clinic backup file. Missing "data" container.');
      }

      if (window.confirm(`Restore clinic backup from "${file.name}"? This will update users, doctors, appointments, and announcements.`)) {
        await restoreBackup(parsed);
      }
    } catch (err) {
      setRestoreError(err.message || 'Failed to parse backup file');
    } finally {
      setIsRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#E8F0EE] dark:bg-[#121C21] border border-[#DCE5E2] dark:border-[#21333A] text-[#132226] dark:text-[#F4F7F6] p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F97316]/15 text-[#EA580C] dark:text-[#FB923C] text-xs font-semibold border border-[#F97316]/30 dark:border-[#FB923C]/30">
              <ShieldCheck className="w-4 h-4 text-[#EA580C] dark:text-[#FB923C]" />
              <span>Executive Operations &amp; Primary Health Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-[#132226] dark:text-[#F4F7F6]">
              Welcome, {userProfile?.name || 'Administrator'}
            </h1>
            <p className="text-sm text-[#5A7178] dark:text-[#9DB4BA]">
              Manage clinical operations, specialist schedules, patient queues, and SDG 3 community health drives.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 w-full sm:w-auto">
            <Link
              to="/pharmacy"
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-[#F4F7F6] text-xs font-semibold rounded-xl transition-colors shadow-xs text-center cursor-pointer"
            >
              <Pill className="w-4 h-4 shrink-0" />
              <span>Pharmacy Desk</span>
            </Link>
            <Link
              to="/admin/doctors"
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 border border-[#CFDAD6] dark:border-[#21333A] bg-white dark:bg-[#19272D] hover:bg-[#0F766E]/10 dark:hover:bg-[#21333A] text-[#132226] dark:text-[#9DB4BA] hover:text-[#0F766E] dark:hover:text-[#F4F7F6] text-xs font-medium rounded-xl transition-colors shadow-xs text-center cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Add Doctor</span>
            </Link>
            <Link
              to="/admin/announcements"
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 border border-[#CFDAD6] dark:border-[#21333A] bg-white dark:bg-[#19272D] hover:bg-[#0F766E]/10 dark:hover:bg-[#21333A] text-[#132226] dark:text-[#9DB4BA] hover:text-[#0F766E] dark:hover:text-[#F4F7F6] text-xs font-medium rounded-xl transition-colors shadow-xs text-center cursor-pointer"
            >
              <Megaphone className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF] shrink-0" />
              <span className="truncate">New Health Camp</span>
            </Link>
            <button
              onClick={() => setStaffModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 border border-[#0F766E]/30 dark:border-[#2DD4BF]/30 bg-[#0F766E]/10 dark:bg-[#2DD4BF]/15 hover:bg-[#0F766E]/20 dark:hover:bg-[#2DD4BF]/25 text-[#0F766E] dark:text-[#2DD4BF] text-xs font-bold rounded-xl transition-colors shadow-xs text-center cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Staff &amp; Admin Access</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row (2x2 on mobile, 4-col on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#121C21] p-3.5 sm:p-5 rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#0F766E]/10 dark:bg-[#2DD4BF]/20 text-[#0F766E] dark:text-[#2DD4BF] border border-[#0F766E]/20 dark:border-[#2DD4BF]/30 flex items-center justify-center shrink-0">
            <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider">Registered Doctors</p>
            <p className="text-xl sm:text-2xl font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">{doctors.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121C21] p-3.5 sm:p-5 rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#F97316]/12 dark:bg-[#FB923C]/18 text-[#F97316] dark:text-[#FB923C] border border-[#F97316]/25 dark:border-[#FB923C]/30 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider">Pending Queue</p>
            <p className="text-xl sm:text-2xl font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">{pendingAppointments.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121C21] p-3.5 sm:p-5 rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#0F766E]/10 dark:bg-[#2DD4BF]/20 text-[#0F766E] dark:text-[#2DD4BF] border border-[#0F766E]/20 dark:border-[#2DD4BF]/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider">Completed Visits</p>
            <p className="text-xl sm:text-2xl font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">{completedAppointments.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121C21] p-3.5 sm:p-5 rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#F97316]/12 dark:bg-[#FB923C]/18 text-[#F97316] dark:text-[#FB923C] border border-[#F97316]/25 dark:border-[#FB923C]/30 flex items-center justify-center shrink-0">
            <Megaphone className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider">Health Camps</p>
            <p className="text-xl sm:text-2xl font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">{announcements.length}</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Consultation Volume Area Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121C21] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#132226] dark:text-[#F4F7F6] flex items-center gap-2 font-heading">
                <TrendingUp className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" />
                <span>Weekly Consultation Volume</span>
              </h2>
              <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">Total appointments booked vs completed consultations over the past 7 days</p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 bg-[#0F766E]/10 dark:bg-[#2DD4BF]/20 text-[#0F766E] dark:text-[#2DD4BF] rounded-lg border border-[#0F766E]/20 dark:border-[#2DD4BF]/30">
              Total Booked: {appointments.length}
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={appointmentTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDark ? "#2DD4BF" : "#0F766E"} stopOpacity={0.45}/>
                    <stop offset="95%" stopColor={isDark ? "#2DD4BF" : "#0F766E"} stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorDone" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDark ? "#FB923C" : "#F97316"} stopOpacity={0.45}/>
                    <stop offset="95%" stopColor={isDark ? "#FB923C" : "#F97316"} stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#21333A" : "#E8DFD1"} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? '#9DB4BA' : '#758D94' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: isDark ? '#9DB4BA' : '#758D94' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#121C21' : '#FFFFFF', 
                    color: isDark ? '#F4F7F6' : '#132226', 
                    borderRadius: '12px', 
                    border: isDark ? '1px solid #21333A' : '1px solid #E0E7E5',
                    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.25)'
                  }}
                  labelStyle={{ fontWeight: 'bold', color: isDark ? '#F4F7F6' : '#132226', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="count" name="Appointments Booked" stroke={isDark ? "#2DD4BF" : "#0F766E"} strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                <Area type="monotone" dataKey="completed" name="Completed Visits" stroke={isDark ? "#FB923C" : "#F97316"} strokeWidth={2} fillOpacity={1} fill="url(#colorDone)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clinical Specialty Breakdown Donut Chart (1 col) */}
        <div className="bg-white dark:bg-[#121C21] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] shadow-sm p-6 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#132226] dark:text-[#F4F7F6] flex items-center gap-2 font-heading">
              <BarChart3 className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF]" />
              <span>Specialist Distribution</span>
            </h2>
            <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">Clinical specialties available in the clinic</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={specializationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {specializationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#121C21' : '#FFFFFF', 
                    color: isDark ? '#F4F7F6' : '#132226', 
                    borderRadius: '12px', 
                    border: isDark ? '1px solid #21333A' : '1px solid #E0E7E5',
                    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.25)'
                  }}
                  labelStyle={{ fontWeight: 'bold', color: isDark ? '#F4F7F6' : '#132226' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] pt-2 border-t border-[#E0E7E5] dark:border-[#21333A]">
            {specializationData.map((item, idx) => (
              <span key={item.name} className="flex items-center gap-1 text-[#5A7178] dark:text-[#9DB4BA]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                <span>{item.name} ({item.value})</span>
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Master Appointments Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">Recent Appointments &amp; Queue Activity</h2>
            <Link to="/admin/appointments" className="text-xs font-semibold text-[#0F766E] dark:text-[#2DD4BF] hover:underline flex items-center gap-1">
              <span>View All ({appointments.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {appointments.length === 0 ? (
            <div className="bg-[#F4F7F6] dark:bg-[#121C21] rounded-2xl border border-dashed border-[#CFDAD6] dark:border-[#21333A] p-8 text-center space-y-2">
              <Ticket className="w-8 h-8 text-[#758D94] dark:text-[#79949B] mx-auto" />
              <h3 className="text-sm font-semibold text-[#132226] dark:text-[#F4F7F6] font-heading">No Appointments Scheduled Yet</h3>
              <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA] max-w-sm mx-auto">
                Once patients register and book slots with your clinic specialists, their live token queue slips will appear here.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#121C21] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] shadow-sm overflow-hidden">
              <div className="divide-y divide-[#E0E7E5] dark:divide-[#21333A]">
                {appointments.slice(0, 5).map((apt) => (
                  <div key={apt.id} className="p-4 flex items-center justify-between gap-3 hover:bg-[#F4F7F6] dark:hover:bg-[#19272D]/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-[#0F766E]/10 dark:bg-[#2DD4BF]/20 text-[#0F766E] dark:text-[#2DD4BF] font-semibold text-xs rounded-lg border border-[#0F766E]/20 dark:border-[#2DD4BF]/30">
                        {apt.tokenNumber || 'TK'}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">{apt.patientName}</p>
                        <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">{apt.doctorName} • {apt.date}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      apt.status === 'done' 
                        ? 'bg-[#0F766E]/15 text-[#0F766E] dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF] border border-[#0F766E]/30 dark:border-[#2DD4BF]/30' 
                        : apt.status === 'cancelled'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300 dark:border-rose-900/40'
                        : 'bg-[#F97316]/15 text-[#EA580C] dark:text-[#FB923C] border border-[#F97316]/30 dark:border-[#FB923C]/30'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Clinic Doctors Quick View */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">Clinic Doctors</h2>
            <Link to="/admin/doctors" className="text-xs font-semibold text-[#0F766E] dark:text-[#2DD4BF] hover:underline flex items-center gap-1">
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {doctors.length === 0 ? (
            <div className="bg-[#F4F7F6] dark:bg-[#121C21] rounded-2xl border border-dashed border-[#CFDAD6] dark:border-[#21333A] p-8 text-center space-y-3">
              <Stethoscope className="w-8 h-8 text-[#758D94] dark:text-[#79949B] mx-auto" />
              <h3 className="text-sm font-semibold text-[#132226] dark:text-[#F4F7F6] font-heading">No Doctors Added Yet</h3>
              <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">
                Register clinic specialists to begin accepting patient bookings.
              </p>
              <Link
                to="/admin/doctors"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-[#F4F7F6] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Doctor</span>
              </Link>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#121C21] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] shadow-sm divide-y divide-[#E0E7E5] dark:divide-[#21333A] overflow-hidden">
              {doctors.map((doc) => (
                <div key={doc.id} className="p-3.5 flex items-center gap-3 hover:bg-[#F4F7F6] dark:hover:bg-[#19272D]/60 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-[#0F766E]/10 dark:bg-[#2DD4BF]/20 text-[#0F766E] dark:text-[#2DD4BF] border border-[#0F766E]/20 dark:border-[#2DD4BF]/30 flex items-center justify-center font-bold text-xs shrink-0">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#132226] dark:text-[#F4F7F6] truncate font-heading">{doc.name}</p>
                    <p className="text-[11px] text-[#0F766E] dark:text-[#2DD4BF] truncate">{doc.specialization}</p>
                  </div>
                  <span className="text-[10px] text-[#5A7178] dark:text-[#9DB4BA] shrink-0">
                    {doc.availableSlots?.length || 0} slots
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Backup & Clinic Data Management Hub */}
      <div className="bg-white dark:bg-[#121C21] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E0E7E5] dark:border-[#21333A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 dark:bg-[#2DD4BF]/20 text-[#0F766E] dark:text-[#2DD4BF] border border-[#0F766E]/20 dark:border-[#2DD4BF]/30 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">Clinic Data Backup &amp; Restore Center</h2>
              <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">Securely snapshot, archive, or restore Cloud Firestore clinic records</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                if (window.confirm('Load complete clinic dataset across all 3 dashboards (5 specialists, active doctor consultation queues, patient tokens, and SDG 3 health camps)?')) {
                  seedSampleClinicData();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#0F766E]/15 hover:bg-[#0F766E]/25 text-[#0F766E] dark:text-[#2DD4BF] border border-[#0F766E]/30 dark:border-[#2DD4BF]/30 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              title="Load sample doctors, appointments, and health camps"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Sample Data</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all clinic data to empty? This will clear doctors, appointments, and camps.')) {
                  resetClinicData();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              title="Clear all clinic records"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Database</span>
            </button>

            <button
              onClick={exportBackup}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-[#F4F7F6] text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Backup (.json)</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isRestoring}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F4F7F6] hover:bg-[#E8F0EE] dark:bg-[#19272D] dark:hover:bg-[#21333A] border border-[#CFDAD6] dark:border-[#21333A] text-[#132226] dark:text-[#F4F7F6] text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#5A7178] dark:text-[#9DB4BA]" />
              <span>{isRestoring ? 'Restoring...' : 'Restore File'}</span>
            </button>
          </div>
        </div>

        {restoreError && (
          <div className="flex items-center gap-2 p-3 bg-rose-100 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900/40 rounded-xl text-xs font-medium text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{restoreError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#5A7178] dark:text-[#9DB4BA]">
          <div className="p-3.5 bg-[#F4F7F6] dark:bg-[#19272D] rounded-xl border border-[#E0E7E5] dark:border-[#21333A]">
            <p className="font-semibold text-[#132226] dark:text-[#F4F7F6] font-heading">Encrypted Cloud Storage</p>
            <p className="text-[11px] text-[#758D94] dark:text-[#79949B] mt-0.5">Your clinical records are stored securely in Cloud Firestore with role-based access rules and schema validation.</p>
          </div>
          <div className="p-3.5 bg-[#F4F7F6] dark:bg-[#19272D] rounded-xl border border-[#E0E7E5] dark:border-[#21333A]">
            <p className="font-semibold text-[#132226] dark:text-[#F4F7F6] font-heading">Instant Disaster Recovery</p>
            <p className="text-[11px] text-[#758D94] dark:text-[#79949B] mt-0.5">Restoring an archive updates live Cloud Firestore collections with automatic real-time sync to all connected devices.</p>
          </div>
          <div className="p-3.5 bg-[#F4F7F6] dark:bg-[#19272D] rounded-xl border border-[#E0E7E5] dark:border-[#21333A]">
            <p className="font-semibold text-[#132226] dark:text-[#F4F7F6] font-heading">Multi-Device Migration</p>
            <p className="text-[11px] text-[#758D94] dark:text-[#79949B] mt-0.5">Export portable clinic snapshots to migrate datasets or preserve point-in-time clinical archives.</p>
          </div>
        </div>
      </div>

      {/* Official Staff & Admin Management Modal */}
      <StaffManagementModal
        isOpen={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
      />

    </div>
  );
}
