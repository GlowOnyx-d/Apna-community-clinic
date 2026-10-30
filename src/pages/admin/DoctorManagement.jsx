import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

import ConfirmModal from '../../components/common/ConfirmModal';
import { getDoctorAvatar, getDoctorFallbackAvatar, getSpecialtyConfig } from '../../utils/doctorVisuals';

const DEFAULT_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DEFAULT_SLOTS = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:30 AM", "02:00 PM", "02:30 PM", "03:30 PM"];

export default function DoctorManagement() {
  const { doctors, addDoctor, deleteDoctor, updateDoctorSlots, toggleDoctorLeave } = useData();
  const { createDoctorAccount } = useAuth();

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [doctorPassword, setDoctorPassword] = useState('wasd@121');
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [cabin, setCabin] = useState('');
  const [experience, setExperience] = useState('');
  const [selectedDays, setSelectedDays] = useState(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
  const [slotsInput, setSlotsInput] = useState("09:00 AM, 10:00 AM, 11:00 AM, 02:00 PM, 03:00 PM");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [doctorToDelete, setDoctorToDelete] = useState(null);

  // Editing Doctor state
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editCabin, setEditCabin] = useState('');
  const [editSlotsInput, setEditSlotsInput] = useState('');
  const [editDays, setEditDays] = useState([]);
  const [editLoading, setEditLoading] = useState(false);

  // Lock background scroll when editing modal is open
  useEffect(() => {
    if (editingDoctor) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [editingDoctor]);

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

      // 1. Create or ensure doctor login account in Firestore users collection
      let doctorUid;
      try {
        const account = await createDoctorAccount({
          name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
          email,
          password: doctorPassword || 'wasd@121',
          specialization,
          cabin: cabin || 'Cabin 101 - Primary Wing'
        });
        doctorUid = account?.uid;
      } catch (authErr) {
        console.warn('Doctor user account already exists or warning:', authErr);
      }

      // 2. Add doctor profile to Firestore doctors collection
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

      setSuccess(`Doctor profile for ${name} registered successfully! Login credentials created (Password: ${doctorPassword || 'wasd@121'}).`);
      setName('');
      setEmail('');
      setDoctorPassword('wasd@121');
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
          <span className="text-xs font-bold text-[#0F766E] dark:text-[#2DD4BF] uppercase tracking-wider">Clinical Administration</span>
          <h1 className="text-2xl font-black text-[#132226] dark:text-[#F4F7F6] tracking-tight mt-0.5 font-heading">
            Doctor &amp; Specialist Management
          </h1>
          <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA] mt-1">
            Register clinic physicians, configure consultation hours, and manage daily queue slots.
          </p>
        </div>

        <button
          onClick={() => { setShowAddForm(!showAddForm); setError(''); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-[#F4F7F6] font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : 'Add New Doctor'}</span>
        </button>
      </div>

      {/* Success Notification */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-[#0F766E]/15 border border-[#0F766E]/30 dark:border-[#2DD4BF]/30 rounded-xl text-xs font-medium text-[#0F766E] dark:text-[#2DD4BF]">
          <CheckCircle2 className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF] shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Add Doctor Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-[#121C21] rounded-3xl border border-[#E0E7E5] dark:border-[#21333A] shadow-sm p-6 sm:p-8 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-[#E0E7E5] dark:border-[#21333A]">
            <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 dark:bg-[#0D9488]/20 border border-[#0F766E]/20 dark:border-[#2DD4BF]/30 text-[#0F766E] dark:text-[#2DD4BF] flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">Register New Clinic Doctor</h2>
              <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">Provide credentials and consultation schedule for patient bookings</p>
            </div>
          </div>

          <form onSubmit={handleCreateDoctor} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-[#F97316]/10 dark:bg-[#FB923C]/10 border border-[#F97316]/30 dark:border-[#FB923C]/30 rounded-xl text-xs font-medium text-[#EA580C] dark:text-[#FB923C]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                  Doctor Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#758D94] dark:text-[#79949B] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Patel"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#0F766E] dark:focus:ring-[#2DD4BF] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#758D94] dark:text-[#79949B] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@communityclinic.org"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#0F766E] dark:focus:ring-[#2DD4BF] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                  Specialization *
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-[#758D94] dark:text-[#79949B] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. General Physician, Pediatrics, Cardiology"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#0F766E] dark:focus:ring-[#2DD4BF] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                  Qualifications
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-[#758D94] dark:text-[#79949B] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. MBBS, MD (Internal Medicine)"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#0F766E] dark:focus:ring-[#2DD4BF] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                  Cabin / Clinic Suite
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-[#758D94] dark:text-[#79949B] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={cabin}
                    onChange={(e) => setCabin(e.target.value)}
                    placeholder="e.g. Cabin 101 - Primary Wing"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#0F766E] dark:focus:ring-[#2DD4BF] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                  Years of Experience
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-[#758D94] dark:text-[#79949B] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 10 years"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#0F766E] dark:focus:ring-[#2DD4BF] transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${isSelected
                          ? 'bg-[#0F766E] dark:bg-[#0D9488] text-[#F4F7F6] border-[#0F766E] dark:border-[#2DD4BF] shadow-xs'
                          : 'bg-[#F4F7F6] dark:bg-[#19272D] text-[#5A7178] dark:text-[#9DB4BA] border-[#CFDAD6] dark:border-[#2C444E] hover:text-[#132226] dark:hover:text-[#F4F7F6] hover:border-[#0F766E]/40 dark:hover:border-[#2DD4BF]/50'
                        }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                Available Time Slots (comma-separated)
              </label>
              <input
                type="text"
                value={slotsInput}
                onChange={(e) => setSlotsInput(e.target.value)}
                placeholder="09:00 AM, 10:00 AM, 11:00 AM, 02:00 PM"
                className="w-full px-4 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#0F766E] dark:focus:ring-[#2DD4BF] transition-all"
              />
              <p className="text-[11px] text-[#758D94] dark:text-[#79949B] mt-1">Patients will be able to book into these slots sequentially.</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 text-xs font-semibold text-[#5A7178] hover:text-[#132226] hover:bg-[#F4F7F6] dark:text-[#9DB4BA] dark:hover:text-[#F4F7F6] dark:hover:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-[#F4F7F6] text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Saving Profile...' : 'Save Doctor Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Doctor Registry List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">Registered Clinic Specialists ({doctors.length})</h2>

        {doctors.length === 0 ? (
          <div className="bg-[#F4F7F6] dark:bg-[#121C21] rounded-3xl border border-dashed border-[#CFDAD6] dark:border-[#21333A] p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0F766E]/10 dark:bg-[#0D9488]/20 border border-[#0F766E]/20 dark:border-[#2DD4BF]/30 text-[#0F766E] dark:text-[#2DD4BF] flex items-center justify-center mx-auto">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">No Doctors Registered Yet</h3>
              <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA] max-w-sm mx-auto mt-1">
                Your clinic database is empty. Add your first specialist above so patients can begin booking queue tokens.
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-[#F4F7F6] text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
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
                className="bg-white dark:bg-[#121C21] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] p-5 shadow-sm flex flex-col justify-between hover:border-[#0F766E]/40 dark:hover:border-[#2DD4BF]/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide border ${getSpecialtyConfig(doctor.specialization).badgeClass}`}>
                        {getSpecialtyConfig(doctor.specialization).label}
                      </span>
                      {doctor.isOnLeave && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60">
                          On Leave Today
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#758D94] dark:text-[#79949B]">{doctor.cabin || 'Cabin 101'}</span>
                  </div>

                  <div className="flex items-start gap-3.5 mb-3">
                    <img
                      src={getDoctorAvatar(doctor)}
                      alt={doctor.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getDoctorFallbackAvatar(doctor.name);
                      }}
                      className="w-12 h-12 rounded-2xl object-cover border border-[#E0E7E5] dark:border-[#21333A] shrink-0 bg-[#F4F7F6] dark:bg-[#19272D]"
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-[#132226] dark:text-[#F4F7F6] text-sm font-heading">{doctor.name}</h3>
                      <p className="text-xs font-medium text-[#0F766E] dark:text-[#2DD4BF] truncate">{doctor.specialization}</p>
                      <p className="text-[11px] text-[#758D94] dark:text-[#79949B] mt-0.5">{doctor.email}</p>
                    </div>
                  </div>

                  <div className="py-2.5 border-y border-[#E0E7E5] dark:border-[#21333A] space-y-1.5 my-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#5A7178] dark:text-[#9DB4BA]">Qualifications:</span>
                      <span className="font-semibold text-[#132226] dark:text-[#F4F7F6]">{doctor.qualification || 'MBBS, MD'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5A7178] dark:text-[#9DB4BA]">Experience:</span>
                      <span className="font-semibold text-[#132226] dark:text-[#F4F7F6]">{doctor.experience || '5+ years'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5A7178] dark:text-[#9DB4BA]">Available Slots:</span>
                      <span className="font-bold text-[#0F766E] dark:text-[#2DD4BF]">{doctor.availableSlots?.length || 0} slots/day</span>
                    </div>
                  </div>

                  <div className="space-y-1 mb-2">
                    <span className="text-[10px] font-bold text-[#758D94] dark:text-[#79949B] uppercase tracking-wider">Days Available</span>
                    <div className="flex flex-wrap gap-1">
                      {doctor.availableDays?.map(day => (
                        <span key={day} className="px-2 py-0.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#E0E7E5] dark:border-[#21333A] text-[#5A7178] dark:text-[#9DB4BA] rounded text-[10px] font-medium">
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E0E7E5] dark:border-[#21333A] space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#758D94] dark:text-[#79949B]">
                    <span>Email:</span>
                    <span className="font-medium text-[#5A7178] dark:text-[#9DB4BA] truncate max-w-[180px]">{doctor.email}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-[#F4F7F6] dark:bg-[#19272D] rounded-xl border border-[#E0E7E5] dark:border-[#21333A] text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${doctor.isOnLeave ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <span className="font-semibold text-[#132226] dark:text-[#F4F7F6]">
                        {doctor.isOnLeave ? 'On Leave' : 'Available'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleDoctorLeave(doctor.id, !doctor.isOnLeave)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer border ${
                        doctor.isOnLeave
                          ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600'
                          : 'bg-white dark:bg-[#121C21] text-[#5A7178] dark:text-[#9DB4BA] border-[#CFDAD6] dark:border-[#2C444E] hover:border-amber-500/50'
                      }`}
                    >
                      {doctor.isOnLeave ? 'Mark Present' : 'Mark On Leave'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-[#F4F7F6] dark:bg-[#19272D] rounded-xl border border-[#E0E7E5] dark:border-[#21333A] text-[11px]">
                    <span className="flex items-center gap-1 text-[#0F766E] dark:text-[#2DD4BF] font-semibold">
                      <Key className="w-3 h-3" /> Initial Password:
                    </span>
                    <code className="font-mono text-[#132226] dark:text-[#F4F7F6]">wasd@121</code>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        setEditingDoctor(doctor);
                        setEditCabin(doctor.cabin || '');
                        setEditSlotsInput(doctor.availableSlots?.join(', ') || '');
                        setEditDays(doctor.availableDays || []);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#F4F7F6] hover:bg-[#E0E7E5]/60 dark:bg-[#19272D] dark:hover:bg-[#0D9488]/20 text-[#0F766E] dark:text-[#2DD4BF] rounded-lg border border-[#CFDAD6] dark:border-[#2C444E] font-semibold transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Schedule</span>
                    </button>
                    <button
                      onClick={() => setDoctorToDelete(doctor)}
                      className="p-1.5 text-[#758D94] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg border border-[#CFDAD6] dark:border-[#2C444E] transition-colors cursor-pointer"
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
      {editingDoctor && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#121C21] w-full max-w-lg rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E7E5] dark:border-[#21333A]">
              <div>
                <h3 className="font-bold text-base text-[#132226] dark:text-[#F4F7F6] font-heading">
                  Edit Schedule: {editingDoctor.name}
                </h3>
                <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">{editingDoctor.specialization}</p>
              </div>
              <button
                onClick={() => setEditingDoctor(null)}
                className="p-1 text-[#5A7178] hover:text-[#132226] dark:text-[#9DB4BA] dark:hover:text-[#F4F7F6] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDoctor} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#5A7178] dark:text-[#9DB4BA] mb-1">
                  Cabin / Clinic Suite
                </label>
                <input
                  type="text"
                  value={editCabin}
                  onChange={(e) => setEditCabin(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-xs text-[#132226] dark:text-[#F4F7F6]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5A7178] dark:text-[#9DB4BA] mb-1">
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
                        className={`px-2.5 py-1 rounded-lg font-semibold border transition-all cursor-pointer ${isSelected
                            ? 'bg-[#0F766E] dark:bg-[#0D9488] text-[#F4F7F6] border-[#0F766E] dark:border-[#2DD4BF]'
                            : 'bg-[#F4F7F6] dark:bg-[#19272D] text-[#5A7178] dark:text-[#9DB4BA] border-[#CFDAD6] dark:border-[#2C444E]'
                          }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#5A7178] dark:text-[#9DB4BA] mb-1">
                  Available Time Slots (comma-separated)
                </label>
                <input
                  type="text"
                  value={editSlotsInput}
                  onChange={(e) => setEditSlotsInput(e.target.value)}
                  placeholder="09:00 AM, 10:00 AM, 11:00 AM, 02:00 PM"
                  className="w-full px-3.5 py-2 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-xs text-[#132226] dark:text-[#F4F7F6]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E0E7E5] dark:border-[#21333A]">
                <button
                  type="button"
                  onClick={() => setEditingDoctor(null)}
                  className="px-4 py-2 text-[#5A7178] hover:text-[#132226] dark:text-[#9DB4BA] dark:hover:text-[#F4F7F6] rounded-xl border border-[#CFDAD6] dark:border-[#2C444E] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-[#F4F7F6] font-semibold rounded-xl cursor-pointer"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Doctor Confirmation Modal */}
      <ConfirmModal
        isOpen={!!doctorToDelete}
        onClose={() => setDoctorToDelete(null)}
        onConfirm={async () => {
          if (doctorToDelete) {
            const idToRemove = doctorToDelete.id || doctorToDelete.docId;
            setDoctorToDelete(null);
            await deleteDoctor(idToRemove);
          }
        }}
        title="Remove Doctor"
        message={`Are you sure you want to remove ${doctorToDelete?.name || 'this doctor'} from the clinic directory? Their consultation slots will no longer be available.`}
        confirmText="Yes, Remove"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
