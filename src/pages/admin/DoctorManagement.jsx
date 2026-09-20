import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Stethoscope, 
  Plus, 
  User, 
  Mail, 
  Briefcase, 
  GraduationCap, 
  Building, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Trash2,
  Edit2,
  X,
  Key
} from 'lucide-react';

const DEFAULT_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DEFAULT_SLOTS = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:30 AM", "02:00 PM", "02:30 PM", "03:30 PM"];

export default function DoctorManagement() {
  const { doctors, addDoctor, deleteDoctor, updateDoctorSlots } = useData();
  const { createDoctorAccount } = useAuth();

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [doctorPassword, setDoctorPassword] = useState('Doctor@123');
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [cabin, setCabin] = useState('');
  const [experience, setExperience] = useState('');
  const [selectedDays, setSelectedDays] = useState(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
  const [slotsInput, setSlotsInput] = useState("09:00 AM, 10:00 AM, 11:00 AM, 02:00 PM, 03:00 PM");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editing Doctor state
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editCabin, setEditCabin] = useState('');
  const [editSlotsInput, setEditSlotsInput] = useState('');
  const [editDays, setEditDays] = useState([]);
  const [editLoading, setEditLoading] = useState(false);

  const toggleEditDay = (day) => {
    if (editDays.includes(day)) {
      setEditDays(editDays.filter(d => d !== day));
    } else {
      setEditDays([...editDays, day]);
    }
  };

  const handleUpdateDoctor = async (e) => {
    e.preventDefault();
    if (!editingDoctor) return;
    try {
      setEditLoading(true);
      const parsedSlots = editSlotsInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      await updateDoctorSlots(editingDoctor.id, {
        cabin: editCabin || editingDoctor.cabin,
        availableSlots: parsedSlots.length > 0 ? parsedSlots : editingDoctor.availableSlots,
        availableDays: editDays.length > 0 ? editDays : editingDoctor.availableDays
      });

      setSuccess(`Updated schedule and cabin for ${editingDoctor.name}`);
      setEditingDoctor(null);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Update doctor error:', err);
    } finally {
      setEditLoading(false);
    }
  };

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    if (!name || !email || !specialization) {
      setError('Please fill in doctor name, email, and specialization');
      return;
    }

    try {
      setError('');
      setLoading(true);

      const parsedSlots = slotsInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      // 1. Create or ensure doctor login account in users.json
      let doctorUid;
      try {
        const account = await createDoctorAccount({
          name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
          email,
          password: doctorPassword || 'Doctor@123',
          specialization,
          cabin: cabin || 'Cabin 101 - Primary Wing'
        });
        doctorUid = account?.uid;
      } catch (authErr) {
        console.warn('Doctor user account already exists or warning:', authErr);
      }

      // 2. Add doctor profile to doctors.json
      await addDoctor({
        id: doctorUid || `doc_${Date.now()}`,
        name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
        email,
        specialization,
        qualification: qualification || 'MBBS, MD',
        cabin: cabin || 'Cabin 101 - Primary Wing',
        experience: experience || '5+ years',
        avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80",
        availableDays: selectedDays.length > 0 ? selectedDays : ["Monday", "Wednesday", "Friday"],
        availableSlots: parsedSlots.length > 0 ? parsedSlots : DEFAULT_SLOTS.slice(0, 4),
        maxPatientsPerSlot: 4,
        rating: 5.0,
        consultationFee: "Free (Community Health Funded)"
      });

      setSuccess(`Doctor profile for ${name} registered successfully! Login credentials created (Password: ${doctorPassword || 'Doctor@123'}).`);
      setName('');
      setEmail('');
      setDoctorPassword('Doctor@123');
      setSpecialization('');
      setQualification('');
      setCabin('');
      setExperience('');
      setShowAddForm(false);
      setTimeout(() => setSuccess(''), 6000);
    } catch (err) {
      setError(err.message || 'Failed to add doctor');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#2D6A4F] dark:text-[#52B788] uppercase tracking-wider">Clinical Administration</span>
          <h1 className="text-2xl font-black text-[#22291F] dark:text-[#F5F1EA] tracking-tight mt-0.5 font-heading">
            Doctor &amp; Specialist Management
          </h1>
          <p className="text-xs text-[#6B6B63] dark:text-[#9EAA9A] mt-1">
            Register clinic physicians, configure consultation hours, and manage daily queue slots.
          </p>
        </div>

        <button
          onClick={() => { setShowAddForm(!showAddForm); setError(''); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2D6A4F] hover:bg-[#245740] text-[#F5F1EA] font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : 'Add New Doctor'}</span>
        </button>
      </div>

      {/* Success Notification */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-[#2D6A4F]/15 border border-[#2D6A4F]/30 rounded-xl text-xs font-medium text-[#2D6A4F] dark:text-[#52B788]">
          <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788] shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Add Doctor Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-[#222722] rounded-3xl border border-[#E6DFC6] dark:border-[#2D352C] shadow-sm p-6 sm:p-8 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#E6DFC6] dark:border-[#2D352C]">
            <div className="w-10 h-10 rounded-xl bg-[#2D6A4F]/10 dark:bg-[#2D6A4F]/20 border border-[#2D6A4F]/20 dark:border-[#2D6A4F]/30 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#22291F] dark:text-[#F5F1EA] font-heading">Register New Clinic Doctor</h2>
              <p className="text-xs text-[#6B6B63] dark:text-[#9EAA9A]">Provide credentials and consultation schedule for patient bookings</p>
            </div>
          </div>

          <form onSubmit={handleCreateDoctor} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-[#C97B4A]/10 border border-[#C97B4A]/30 rounded-xl text-xs font-medium text-[#C97B4A]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#9EAA9A] uppercase tracking-wider mb-1.5">
                  Doctor Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8E8E84] dark:text-[#71806F] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Patel"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] dark:bg-[#1A1D19] border border-[#D8CEB3] dark:border-[#2D352C] rounded-xl text-sm text-[#22291F] dark:text-[#F5F1EA] placeholder-[#8E8E84] dark:placeholder-[#71806F] focus:outline-none focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#9EAA9A] uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8E8E84] dark:text-[#71806F] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@communityclinic.org"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] dark:bg-[#1A1D19] border border-[#D8CEB3] dark:border-[#2D352C] rounded-xl text-sm text-[#22291F] dark:text-[#F5F1EA] placeholder-[#8E8E84] dark:placeholder-[#71806F] focus:outline-none focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#9EAA9A] uppercase tracking-wider mb-1.5">
                  Specialization *
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-[#8E8E84] dark:text-[#71806F] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. General Physician, Pediatrics, Cardiology"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] dark:bg-[#1A1D19] border border-[#D8CEB3] dark:border-[#2D352C] rounded-xl text-sm text-[#22291F] dark:text-[#F5F1EA] placeholder-[#8E8E84] dark:placeholder-[#71806F] focus:outline-none focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#9EAA9A] uppercase tracking-wider mb-1.5">
                  Qualifications
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-[#8E8E84] dark:text-[#71806F] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. MBBS, MD (Internal Medicine)"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] dark:bg-[#1A1D19] border border-[#D8CEB3] dark:border-[#2D352C] rounded-xl text-sm text-[#22291F] dark:text-[#F5F1EA] placeholder-[#8E8E84] dark:placeholder-[#71806F] focus:outline-none focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#9EAA9A] uppercase tracking-wider mb-1.5">
                  Cabin / Clinic Suite
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-[#8E8E84] dark:text-[#71806F] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={cabin}
                    onChange={(e) => setCabin(e.target.value)}
                    placeholder="e.g. Cabin 101 - Primary Wing"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] dark:bg-[#1A1D19] border border-[#D8CEB3] dark:border-[#2D352C] rounded-xl text-sm text-[#22291F] dark:text-[#F5F1EA] placeholder-[#8E8E84] dark:placeholder-[#71806F] focus:outline-none focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#9EAA9A] uppercase tracking-wider mb-1.5">
                  Years of Experience
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-[#8E8E84] dark:text-[#71806F] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 10 years"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] dark:bg-[#1A1D19] border border-[#D8CEB3] dark:border-[#2D352C] rounded-xl text-sm text-[#22291F] dark:text-[#F5F1EA] placeholder-[#8E8E84] dark:placeholder-[#71806F] focus:outline-none focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F] transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#9EAA9A] uppercase tracking-wider mb-1.5">
                Available Consultation Days
              </label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_DAYS.map((day) => {
                  const isSelected = selectedDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-[#2D6A4F] text-[#F5F1EA] border-[#2D6A4F] shadow-xs'
                          : 'bg-[#FAF7F2] dark:bg-[#1A1D19] text-[#6B6B63] dark:text-[#9EAA9A] border-[#D8CEB3] dark:border-[#2D352C] hover:text-[#22291F] dark:hover:text-[#F5F1EA] hover:border-[#2D6A4F]/40'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#9EAA9A] uppercase tracking-wider mb-1.5">
                Available Time Slots (comma-separated)
              </label>
              <input
                type="text"
                value={slotsInput}
                onChange={(e) => setSlotsInput(e.target.value)}
                placeholder="09:00 AM, 10:00 AM, 11:00 AM, 02:00 PM"
                className="w-full px-4 py-2.5 bg-[#FAF7F2] dark:bg-[#1A1D19] border border-[#D8CEB3] dark:border-[#2D352C] rounded-xl text-sm text-[#22291F] dark:text-[#F5F1EA] placeholder-[#8E8E84] dark:placeholder-[#71806F] focus:outline-none focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F] transition-all"
              />
              <p className="text-[11px] text-[#8E8E84] dark:text-[#71806F] mt-1">Patients will be able to book into these slots sequentially.</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 text-xs font-semibold text-[#6B6B63] hover:text-[#22291F] hover:bg-[#FAF7F2] dark:text-[#9EAA9A] dark:hover:text-[#F5F1EA] dark:hover:bg-[#1A1D19] border border-[#D8CEB3] dark:border-[#2D352C] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#2D6A4F] hover:bg-[#245740] text-[#F5F1EA] text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving Profile...' : 'Save Doctor Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Doctor Registry List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#22291F] dark:text-[#F5F1EA] font-heading">Registered Clinic Specialists ({doctors.length})</h2>

        {doctors.length === 0 ? (
          <div className="bg-[#FAF7F2] dark:bg-[#222722] rounded-3xl border border-dashed border-[#D8CEB3] dark:border-[#2D352C] p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2D6A4F]/10 dark:bg-[#2D6A4F]/20 border border-[#2D6A4F]/20 dark:border-[#2D6A4F]/30 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center mx-auto">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#22291F] dark:text-[#F5F1EA] font-heading">No Doctors Registered Yet</h3>
              <p className="text-xs text-[#6B6B63] dark:text-[#9EAA9A] max-w-sm mx-auto mt-1">
                Your clinic database is empty. Add your first specialist above so patients can begin booking queue tokens.
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2D6A4F] hover:bg-[#245740] text-[#F5F1EA] text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Doctor</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map((doctor) => (
              <div 
                key={doctor.id}
                className="bg-white dark:bg-[#222722] rounded-2xl border border-[#E6DFC6] dark:border-[#2D352C] p-5 shadow-sm flex flex-col justify-between hover:border-[#2D6A4F]/40 transition-colors"
              >
                <div>
                  <div className="flex items-start gap-3.5 mb-3">
                    <img 
                      src={doctor.avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100"} 
                      alt={doctor.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='%23FAF7F2' stroke='%232D6A4F' stroke-width='1.5'%3E%3Ccircle cx='12' cy='8' r='5'/%3E%3Cpath d='M20 21a8 8 0 1 0-16 0'/%3E%3C/svg%3E";
                      }}
                      className="w-12 h-12 rounded-2xl object-cover border border-[#E6DFC6] dark:border-[#2D352C] shrink-0 bg-[#FAF7F2] dark:bg-[#1A1D19]"
                    />
                    <div>
                      <h3 className="font-bold text-[#22291F] dark:text-[#F5F1EA] text-sm font-heading">{doctor.name}</h3>
                      <p className="text-xs font-medium text-[#2D6A4F] dark:text-[#52B788]">{doctor.specialization}</p>
                      <p className="text-[11px] text-[#8E8E84] dark:text-[#71806F] mt-0.5">{doctor.cabin || 'Cabin 101'}</p>
                    </div>
                  </div>

                  <div className="py-2.5 border-y border-[#E6DFC6] dark:border-[#2D352C] space-y-1.5 my-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#6B6B63] dark:text-[#9EAA9A]">Qualifications:</span>
                      <span className="font-semibold text-[#22291F] dark:text-[#F5F1EA]">{doctor.qualification || 'MBBS, MD'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B6B63] dark:text-[#9EAA9A]">Experience:</span>
                      <span className="font-semibold text-[#22291F] dark:text-[#F5F1EA]">{doctor.experience || '5+ years'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B6B63] dark:text-[#9EAA9A]">Available Slots:</span>
                      <span className="font-bold text-[#2D6A4F] dark:text-[#52B788]">{doctor.availableSlots?.length || 0} slots/day</span>
                    </div>
                  </div>

                  <div className="space-y-1 mb-2">
                    <span className="text-[10px] font-bold text-[#8E8E84] dark:text-[#71806F] uppercase tracking-wider">Days Available</span>
                    <div className="flex flex-wrap gap-1">
                      {doctor.availableDays?.map(day => (
                        <span key={day} className="px-2 py-0.5 bg-[#FAF7F2] dark:bg-[#1A1D19] border border-[#E6DFC6] dark:border-[#2D352C] text-[#6B6B63] dark:text-[#9EAA9A] rounded text-[10px] font-medium">
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E6DFC6] dark:border-[#2D352C] space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#8E8E84] dark:text-[#71806F]">
                    <span>Email:</span>
                    <span className="font-medium text-[#6B6B63] dark:text-[#9EAA9A] truncate max-w-[180px]">{doctor.email}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-[#FAF7F2] dark:bg-[#1A1D19] rounded-xl border border-[#E6DFC6] dark:border-[#2D352C] text-[11px]">
                    <span className="flex items-center gap-1 text-[#2D6A4F] dark:text-[#52B788] font-semibold">
                      <Key className="w-3 h-3" /> Initial Password:
                    </span>
                    <code className="font-mono text-[#22291F] dark:text-[#F5F1EA]">Doctor@123</code>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        setEditingDoctor(doctor);
                        setEditCabin(doctor.cabin || '');
                        setEditSlotsInput(doctor.availableSlots?.join(', ') || '');
                        setEditDays(doctor.availableDays || []);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#FAF7F2] hover:bg-[#E6DFC6]/60 dark:bg-[#1A1D19] dark:hover:bg-[#2D6A4F]/20 text-[#2D6A4F] dark:text-[#52B788] rounded-lg border border-[#D8CEB3] dark:border-[#2D352C] font-semibold transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Schedule</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to remove ${doctor.name} from the clinic?`)) {
                          deleteDoctor(doctor.id);
                        }
                      }}
                      className="p-1.5 text-[#8E8E84] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg border border-[#D8CEB3] dark:border-[#2D352C] transition-colors cursor-pointer"
                      title="Remove Doctor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Doctor Modal */}
      {editingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#222722] w-full max-w-lg rounded-2xl border border-[#E6DFC6] dark:border-[#2D352C] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6DFC6] dark:border-[#2D352C]">
              <div>
                <h3 className="font-bold text-base text-[#22291F] dark:text-[#F5F1EA] font-heading">
                  Edit Schedule: {editingDoctor.name}
                </h3>
                <p className="text-xs text-[#6B6B63] dark:text-[#9EAA9A]">{editingDoctor.specialization}</p>
              </div>
              <button
                onClick={() => setEditingDoctor(null)}
                className="p-1 text-[#6B6B63] hover:text-[#22291F] dark:text-[#9EAA9A] dark:hover:text-[#F5F1EA] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDoctor} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#6B6B63] dark:text-[#9EAA9A] mb-1">
                  Cabin / Clinic Suite
                </label>
                <input
                  type="text"
                  value={editCabin}
                  onChange={(e) => setEditCabin(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] dark:bg-[#1A1D19] border border-[#D8CEB3] dark:border-[#2D352C] rounded-xl text-xs text-[#22291F] dark:text-[#F5F1EA]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#6B6B63] dark:text-[#9EAA9A] mb-1">
                  Available Consultation Days
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_DAYS.map((day) => {
                    const isSelected = editDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleEditDay(day)}
                        className={`px-2.5 py-1 rounded-lg font-semibold border transition-all ${
                          isSelected
                            ? 'bg-[#2D6A4F] text-[#F5F1EA] border-[#2D6A4F]'
                            : 'bg-[#FAF7F2] dark:bg-[#1A1D19] text-[#6B6B63] dark:text-[#9EAA9A] border-[#D8CEB3] dark:border-[#2D352C]'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#6B6B63] dark:text-[#9EAA9A] mb-1">
                  Available Time Slots (comma-separated)
                </label>
                <input
                  type="text"
                  value={editSlotsInput}
                  onChange={(e) => setEditSlotsInput(e.target.value)}
                  placeholder="09:00 AM, 10:00 AM, 11:00 AM, 02:00 PM"
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] dark:bg-[#1A1D19] border border-[#D8CEB3] dark:border-[#2D352C] rounded-xl text-xs text-[#22291F] dark:text-[#F5F1EA]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E6DFC6] dark:border-[#2D352C]">
                <button
                  type="button"
                  onClick={() => setEditingDoctor(null)}
                  className="px-4 py-2 text-[#6B6B63] hover:text-[#22291F] dark:text-[#9EAA9A] dark:hover:text-[#F5F1EA] rounded-xl border border-[#D8CEB3] dark:border-[#2D352C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#245740] text-[#F5F1EA] font-semibold rounded-xl"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
