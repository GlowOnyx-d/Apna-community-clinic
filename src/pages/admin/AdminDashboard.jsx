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
  HardDrive,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Sparkles,
  RotateCcw
} from 'lucide-react';

const PIE_COLORS = ['#2D6A4F', '#40916C', '#52B788', '#C97B4A', '#74C69D', '#95D5B2'];

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const { 
    doctors, 
    appointments, 
    announcements, 
    exportBackup, 
    restoreBackup,
    seedSampleClinicData,
    resetClinicData
  } = useData();
  const { isDark } = useTheme();
  const fileInputRef = useRef(null);
  const [restoreError, setRestoreError] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);

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
      <div className="relative overflow-hidden rounded-2xl bg-[#F0EBE1] dark:bg-[#222722] border border-[#E4DCCE] dark:border-[#2D352C] text-[#22291F] dark:text-[#F5F1EA] p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C97B4A]/15 text-[#C97B4A] text-xs font-semibold border border-[#C97B4A]/30">
              <ShieldCheck className="w-4 h-4 text-[#C97B4A]" />
              <span>Executive Operations &amp; Primary Health Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-[#22291F] dark:text-[#F5F1EA]">
              Welcome, {userProfile?.name || 'Administrator'}
            </h1>
            <p className="text-sm text-[#6B6B63] dark:text-[#9EAA9A]">
              Manage clinical operations, specialist schedules, patient queues, and SDG 3 community health drives.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 w-full sm:w-auto">
            <Link
              to="/admin/doctors"
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-[#2D6A4F] hover:bg-[#23543E] text-[#F5F1EA] text-xs font-semibold rounded-xl transition-colors shadow-xs text-center"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Add Doctor</span>
            </Link>
            <Link
              to="/admin/announcements"
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 border border-[#D8CEB3] dark:border-[#2D352C] bg-white dark:bg-[#1A1D19] hover:bg-[#2D6A4F]/10 text-[#22291F] dark:text-[#9EAA9A] hover:text-[#2D6A4F] dark:hover:text-[#F5F1EA] text-xs font-medium rounded-xl transition-colors shadow-xs text-center"
            >
              <Megaphone className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788] shrink-0" />
              <span className="truncate">New Health Camp</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row (2x2 on mobile, 4-col on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#222722] p-3.5 sm:p-5 rounded-2xl border border-[#E6DFC6] dark:border-[#2D352C] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#2D6A4F]/10 dark:bg-[#2D6A4F]/25 text-[#2D6A4F] dark:text-[#52B788] border border-[#2D6A4F]/20 dark:border-[#2D6A4F]/30 flex items-center justify-center shrink-0">
            <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[#6B6B63] dark:text-[#9EAA9A] uppercase tracking-wider">Registered Doctors</p>
            <p className="text-xl sm:text-2xl font-bold text-[#22291F] dark:text-[#F5F1EA] font-heading">{doctors.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#222722] p-3.5 sm:p-5 rounded-2xl border border-[#E6DFC6] dark:border-[#2D352C] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#2D6A4F]/10 dark:bg-[#2D6A4F]/25 text-[#2D6A4F] dark:text-[#52B788] border border-[#2D6A4F]/20 dark:border-[#2D6A4F]/30 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[#6B6B63] dark:text-[#9EAA9A] uppercase tracking-wider">Pending Queue</p>
            <p className="text-xl sm:text-2xl font-bold text-[#22291F] dark:text-[#F5F1EA] font-heading">{pendingAppointments.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#222722] p-3.5 sm:p-5 rounded-2xl border border-[#E6DFC6] dark:border-[#2D352C] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#2D6A4F]/10 dark:bg-[#2D6A4F]/25 text-[#2D6A4F] dark:text-[#52B788] border border-[#2D6A4F]/20 dark:border-[#2D6A4F]/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[#6B6B63] dark:text-[#9EAA9A] uppercase tracking-wider">Completed Visits</p>
            <p className="text-xl sm:text-2xl font-bold text-[#22291F] dark:text-[#F5F1EA] font-heading">{completedAppointments.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#222722] p-3.5 sm:p-5 rounded-2xl border border-[#E6DFC6] dark:border-[#2D352C] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#2D6A4F]/10 dark:bg-[#2D6A4F]/25 text-[#2D6A4F] dark:text-[#52B788] border border-[#2D6A4F]/20 dark:border-[#2D6A4F]/30 flex items-center justify-center shrink-0">
            <Megaphone className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[#6B6B63] dark:text-[#9EAA9A] uppercase tracking-wider">Health Camps</p>
            <p className="text-xl sm:text-2xl font-bold text-[#22291F] dark:text-[#F5F1EA] font-heading">{announcements.length}</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Consultation Volume Area Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#222722] rounded-2xl border border-[#E6DFC6] dark:border-[#2D352C] shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#22291F] dark:text-[#F5F1EA] flex items-center gap-2 font-heading">
                <TrendingUp className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788]" />
                <span>Weekly Consultation Volume</span>
              </h2>
              <p className="text-xs text-[#6B6B63] dark:text-[#9EAA9A]">Total appointments booked vs completed consultations over the past 7 days</p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 bg-[#2D6A4F]/10 dark:bg-[#2D6A4F]/20 text-[#2D6A4F] dark:text-[#52B788] rounded-lg border border-[#2D6A4F]/20 dark:border-[#2D6A4F]/30">
              Total Booked: {appointments.length}
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={appointmentTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.45}/>
                    <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorDone" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C97B4A" stopOpacity={0.45}/>
                    <stop offset="95%" stopColor="#C97B4A" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#2D352C" : "#E8DFD1"} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? '#71806F' : '#8E8E84' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: isDark ? '#71806F' : '#8E8E84' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1A1D19' : '#FFFFFF', 
                    color: isDark ? '#F5F1EA' : '#22291F', 
                    borderRadius: '12px', 
                    border: isDark ? '1px solid #2D352C' : '1px solid #E6DFC6',
                    boxShadow: '0 4px 20px -2px rgba(34, 41, 31, 0.08)'
                  }}
                  labelStyle={{ fontWeight: 'bold', color: isDark ? '#F5F1EA' : '#22291F', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="count" name="Appointments Booked" stroke="#2D6A4F" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                <Area type="monotone" dataKey="completed" name="Completed Visits" stroke="#C97B4A" strokeWidth={2} fillOpacity={1} fill="url(#colorDone)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clinical Specialty Breakdown Donut Chart (1 col) */}
        <div className="bg-white dark:bg-[#222722] rounded-2xl border border-[#E6DFC6] dark:border-[#2D352C] shadow-sm p-6 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#22291F] dark:text-[#F5F1EA] flex items-center gap-2 font-heading">
              <BarChart3 className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788]" />
              <span>Specialist Distribution</span>
            </h2>
            <p className="text-xs text-[#6B6B63] dark:text-[#9EAA9A]">Clinical specialties available in the clinic</p>
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
                    backgroundColor: isDark ? '#1A1D19' : '#FFFFFF', 
                    color: isDark ? '#F5F1EA' : '#22291F', 
                    borderRadius: '12px', 
                    border: isDark ? '1px solid #2D352C' : '1px solid #E6DFC6',
                    boxShadow: '0 4px 20px -2px rgba(34, 41, 31, 0.08)'
                  }}
                  labelStyle={{ fontWeight: 'bold', color: isDark ? '#F5F1EA' : '#22291F' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] pt-2 border-t border-[#E6DFC6] dark:border-[#2D352C]">
            {specializationData.map((item, idx) => (
              <span key={item.name} className="flex items-center gap-1 text-[#6B6B63] dark:text-[#9EAA9A]">
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
            <h2 className="text-lg font-bold text-[#22291F] dark:text-[#F5F1EA] font-heading">Recent Appointments &amp; Queue Activity</h2>
            <Link to="/admin/appointments" className="text-xs font-semibold text-[#2D6A4F] dark:text-[#52B788] hover:underline flex items-center gap-1">
              <span>View All ({appointments.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {appointments.length === 0 ? (
            <div className="bg-[#FAF7F2] dark:bg-[#222722] rounded-2xl border border-dashed border-[#D8CEB3] dark:border-[#2D352C] p-8 text-center space-y-2">
              <Ticket className="w-8 h-8 text-[#8E8E84] dark:text-[#71806F] mx-auto" />
              <h3 className="text-sm font-semibold text-[#22291F] dark:text-[#F5F1EA] font-heading">No Appointments Scheduled Yet</h3>
              <p className="text-xs text-[#6B6B63] dark:text-[#9EAA9A] max-w-sm mx-auto">
                Once patients register and book slots with your clinic specialists, their live token queue slips will appear here.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#222722] rounded-2xl border border-[#E6DFC6] dark:border-[#2D352C] shadow-sm overflow-hidden">
              <div className="divide-y divide-[#E6DFC6] dark:divide-[#2D352C]">
                {appointments.slice(0, 5).map((apt) => (
                  <div key={apt.id} className="p-4 flex items-center justify-between gap-3 hover:bg-[#FAF7F2] dark:hover:bg-[#1A1D19]/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-[#2D6A4F]/10 dark:bg-[#2D6A4F]/20 text-[#2D6A4F] dark:text-[#52B788] font-semibold text-xs rounded-lg border border-[#2D6A4F]/20 dark:border-[#2D6A4F]/30">
                        {apt.tokenNumber || 'TK'}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-[#22291F] dark:text-[#F5F1EA] font-heading">{apt.patientName}</p>
                        <p className="text-xs text-[#6B6B63] dark:text-[#9EAA9A]">{apt.doctorName} • {apt.date}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      apt.status === 'done' 
                        ? 'bg-[#2D6A4F]/15 text-[#2D6A4F] dark:bg-[#2D6A4F]/20 dark:text-[#52B788] border border-[#2D6A4F]/30' 
                        : apt.status === 'cancelled'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300 dark:border-rose-900/40'
                        : 'bg-[#C97B4A]/15 text-[#C97B4A] border border-[#C97B4A]/30'
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
            <h2 className="text-lg font-bold text-[#22291F] dark:text-[#F5F1EA] font-heading">Clinic Doctors</h2>
            <Link to="/admin/doctors" className="text-xs font-semibold text-[#2D6A4F] dark:text-[#52B788] hover:underline flex items-center gap-1">
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {doctors.length === 0 ? (
            <div className="bg-[#FAF7F2] dark:bg-[#222722] rounded-2xl border border-dashed border-[#D8CEB3] dark:border-[#2D352C] p-8 text-center space-y-3">
              <Stethoscope className="w-8 h-8 text-[#8E8E84] dark:text-[#71806F] mx-auto" />
              <h3 className="text-sm font-semibold text-[#22291F] dark:text-[#F5F1EA] font-heading">No Doctors Added Yet</h3>
              <p className="text-xs text-[#6B6B63] dark:text-[#9EAA9A]">
                Register clinic specialists to begin accepting patient bookings.
              </p>
              <Link
                to="/admin/doctors"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2D6A4F] hover:bg-[#23543E] text-[#F5F1EA] rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Doctor</span>
              </Link>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#222722] rounded-2xl border border-[#E6DFC6] dark:border-[#2D352C] shadow-sm divide-y divide-[#E6DFC6] dark:divide-[#2D352C] overflow-hidden">
              {doctors.map((doc) => (
                <div key={doc.id} className="p-3.5 flex items-center gap-3 hover:bg-[#FAF7F2] dark:hover:bg-[#1A1D19]/50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-[#2D6A4F]/10 dark:bg-[#2D6A4F]/25 text-[#2D6A4F] dark:text-[#52B788] border border-[#2D6A4F]/20 dark:border-[#2D6A4F]/30 flex items-center justify-center font-bold text-xs shrink-0">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#22291F] dark:text-[#F5F1EA] truncate font-heading">{doc.name}</p>
                    <p className="text-[11px] text-[#2D6A4F] dark:text-[#52B788] truncate">{doc.specialization}</p>
                  </div>
                  <span className="text-[10px] text-[#6B6B63] dark:text-[#9EAA9A] shrink-0">
                    {doc.availableSlots?.length || 0} slots
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Backup & Clinic Data Management Hub */}
      <div className="bg-white dark:bg-[#222722] rounded-2xl border border-[#E6DFC6] dark:border-[#2D352C] shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6DFC6] dark:border-[#2D352C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D6A4F]/10 dark:bg-[#2D6A4F]/25 text-[#2D6A4F] dark:text-[#52B788] border border-[#2D6A4F]/20 dark:border-[#2D6A4F]/30 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#22291F] dark:text-[#F5F1EA] font-heading">Clinic Data Backup &amp; Restore Center</h2>
              <p className="text-xs text-[#6B6B63] dark:text-[#9EAA9A]">Securely archive or migrate all clinic records (JSON format)</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                if (window.confirm('Load starter clinic dataset (4 specialists, queues, and SDG 3 health camps)?')) {
                  seedSampleClinicData();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#2D6A4F]/15 hover:bg-[#2D6A4F]/25 text-[#2D6A4F] dark:text-[#52B788] border border-[#2D6A4F]/30 text-xs font-bold rounded-xl transition-colors cursor-pointer"
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
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2D6A4F] hover:bg-[#23543E] text-[#F5F1EA] text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
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
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF7F2] hover:bg-[#F0EBE1] dark:bg-[#1A1D19] dark:hover:bg-[#2D6A4F]/15 border border-[#D8CEB3] dark:border-[#2D352C] text-[#22291F] dark:text-[#F5F1EA] text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#6B6B63] dark:text-[#9EAA9A]" />
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#6B6B63] dark:text-[#9EAA9A]">
          <div className="p-3.5 bg-[#FAF7F2] dark:bg-[#1A1D19] rounded-xl border border-[#E6DFC6] dark:border-[#2D352C]">
            <p className="font-semibold text-[#22291F] dark:text-[#F5F1EA] font-heading">100% Client-Side Privacy</p>
            <p className="text-[11px] text-[#8E8E84] dark:text-[#71806F] mt-0.5">Your exported JSON includes users, doctors, appointments, and announcements with zero cloud reliance.</p>
          </div>
          <div className="p-3.5 bg-[#FAF7F2] dark:bg-[#1A1D19] rounded-xl border border-[#E6DFC6] dark:border-[#2D352C]">
            <p className="font-semibold text-[#22291F] dark:text-[#F5F1EA] font-heading">Instant Disaster Recovery</p>
            <p className="text-[11px] text-[#8E8E84] dark:text-[#71806F] mt-0.5">Restoring an exported file updates both disk files and browser local cache in a single click.</p>
          </div>
          <div className="p-3.5 bg-[#FAF7F2] dark:bg-[#1A1D19] rounded-xl border border-[#E6DFC6] dark:border-[#2D352C]">
            <p className="font-semibold text-[#22291F] dark:text-[#F5F1EA] font-heading">Multi-Device Migration</p>
            <p className="text-[11px] text-[#8E8E84] dark:text-[#71806F] mt-0.5">Seamlessly move your community clinic data to another computer or browser.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
