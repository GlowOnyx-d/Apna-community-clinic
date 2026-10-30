import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { sendDirectEmail, generateStaffCredentialsEmailHtml } from '../../services/emailService';
import {
  ShieldCheck,
  UserPlus,
  Mail,
  Lock,
  Phone,
  User,
  Building,
  Key,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  X,
  Sparkles,
  Eye,
  EyeOff,
  Send,
  Users
} from 'lucide-react';

const COMMON_DESIGNATIONS = [
  'Clinic Operations Manager',
  'Lead Receptionist & Triage',
  'Dispensary Pharmacist',
  'Health Camp Coordinator',
  'Emergency Care Coordinator',
  'Clinical Records Officer'
];

export default function StaffManagementModal({ isOpen, onClose }) {
  const { provisionStaffAccount, currentUser } = useAuth();
  const { clinicStaff = [], addStaffMember, deleteStaffMember, showToast } = useData();

  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'add'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState(COMMON_DESIGNATIONS[0]);
  const [customDesignation, setCustomDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('wasd@121');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  // In-modal Email state
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailDeliveryReceipt, setEmailDeliveryReceipt] = useState(null);
  const [emailError, setEmailError] = useState('');

  if (!isOpen) return null;

  const handleCopyCredentials = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendCredentialsEmail = async (targetStaff) => {
    const targetEmail = (targetStaff.email || email || '').trim();
    if (!targetEmail) {
      setEmailError('Please enter a valid email address for credentials delivery.');
      return;
    }

    try {
      setIsSendingEmail(true);
      setEmailError('');
      const emailHtml = generateStaffCredentialsEmailHtml({
        name: targetStaff.name,
        email: targetEmail,
        password: targetStaff.password || password || 'wasd@121',
        designation: targetStaff.department || targetStaff.designation || designation
      });

      const receipt = await sendDirectEmail({
        recipientEmail: targetEmail,
        subject: '🔐 Apna Clinic Staff Access & Login Credentials',
        html: emailHtml,
        type: 'staff_credentials'
      });

      setEmailDeliveryReceipt(receipt);
      showToast(`Credentials email sent to ${targetStaff.name} (${targetEmail})!`, 'success');
    } catch (err) {
      setEmailError(err.message || 'Failed to dispatch credentials email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleProvisionStaff = async (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const finalDesignation = customDesignation.trim() || designation;

    if (!cleanName || !cleanEmail || !password) {
      setError('Please provide staff name, official email, and temporary password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessData(null);
      setEmailDeliveryReceipt(null);

      // 1. Provision account in Auth / Firestore
      const newStaff = await provisionStaffAccount({
        name: cleanName,
        email: cleanEmail,
        password,
        designation: finalDesignation,
        phone: phone.trim() || '+91 98765 00000'
      });

      // 2. Add to clinic staff list
      await addStaffMember({
        id: newStaff.uid,
        name: cleanName,
        email: cleanEmail,
        department: finalDesignation,
        phone: phone.trim() || '+91 98765 00000',
        password,
        status: 'Active',
        createdAt: new Date().toISOString()
      });

      setSuccessData({
        name: cleanName,
        email: cleanEmail,
        password,
        designation: finalDesignation,
        phone: phone.trim() || '+91 98765 00000'
      });

      // Reset form fields
      setName('');
      setEmail('');
      setPhone('');
      setPassword('wasd@121');
      setCustomDesignation('');
    } catch (err) {
      setError(err.message || 'Failed to provision staff account');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-[#121C21] rounded-3xl border border-[#E0E7E5] dark:border-[#21333A] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E0E7E5] dark:border-[#21333A] bg-gradient-to-r from-[#F4F7F6] to-white dark:from-[#19272D] dark:to-[#121C21] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F766E]/10 dark:bg-[#2DD4BF]/20 text-[#0F766E] dark:text-[#2DD4BF] flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">
                  Staff &amp; Admin Authorization Hub
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#0F766E]/10 text-[#0F766E] dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF] text-[10px] font-bold">
                  Restricted Access
                </span>
              </div>
              <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">
                Manage administrative personnel and issue private credentials without public self-registration.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#5A7178] hover:text-[#132226] dark:text-[#79949B] dark:hover:text-[#F4F7F6] hover:bg-[#F4F7F6] dark:hover:bg-[#19272D] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Banner Note */}
        <div className="px-6 py-2.5 bg-[#0F766E]/5 dark:bg-[#2DD4BF]/10 border-b border-[#0F766E]/10 dark:border-[#2DD4BF]/20 flex items-center justify-between text-[11px] text-[#0F766E] dark:text-[#2DD4BF]">
          <div className="flex items-center gap-1.5 font-medium">
            <Key className="w-3.5 h-3.5" />
            <span>Public registration for Admin / Staff is locked. Only clinic administrators can grant accounts here.</span>
          </div>
          <span className="hidden sm:inline font-bold">SDG 3 Clinic Security</span>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-[#E0E7E5] dark:border-[#21333A] flex items-center justify-between bg-white dark:bg-[#121C21]">
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab('list'); setSuccessData(null); }}
              className={`pb-3 px-3 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'list'
                  ? 'text-[#0F766E] dark:text-[#2DD4BF] border-b-2 border-[#0F766E] dark:border-[#2DD4BF]'
                  : 'text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#132226] dark:hover:text-[#F4F7F6]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Authorized Staff List ({clinicStaff.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('add')}
              className={`pb-3 px-3 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'add'
                  ? 'text-[#0F766E] dark:text-[#2DD4BF] border-b-2 border-[#0F766E] dark:border-[#2DD4BF]'
                  : 'text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#132226] dark:hover:text-[#F4F7F6]'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Provision New Staff Account</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* TAB 1: Staff Directory List */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">
                  These accounts have executive management privileges over specialist queues, patient records, and health camp drives.
                </p>
                <button
                  onClick={() => setActiveTab('add')}
                  className="px-3 py-1.5 bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-[#F4F7F6] text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Staff</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {clinicStaff.map((staff) => (
                  <div
                    key={staff.id || staff.email}
                    className="p-4 rounded-2xl bg-[#F4F7F6]/80 dark:bg-[#19272D]/60 border border-[#E0E7E5] dark:border-[#21333A] space-y-3 relative group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 dark:bg-[#2DD4BF]/20 text-[#0F766E] dark:text-[#2DD4BF] flex items-center justify-center font-bold text-sm shrink-0">
                          {staff.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#132226] dark:text-[#F4F7F6] truncate">
                            {staff.name}
                          </p>
                          <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA] truncate">
                            {staff.email}
                          </p>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full bg-[#0F766E]/10 text-[#0F766E] dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF] text-[10px] font-bold shrink-0">
                        {staff.role === 'admin' ? 'Admin' : 'Staff'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#E0E7E5]/60 dark:border-[#21333A] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[11px] font-medium text-[#455A60] dark:text-[#9DB4BA] block truncate">
                          {staff.department || staff.designation || 'Clinic Operations'}
                        </span>
                        <span className="text-[10px] text-[#758D94] dark:text-[#79949B]">
                          Phone: {staff.phone || '+91 98765 00000'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSendCredentialsEmail(staff)}
                          title="Email login credentials"
                          className="p-1.5 rounded-lg bg-white dark:bg-[#121C21] border border-[#CFDAD6] dark:border-[#2C444E] text-[#0F766E] dark:text-[#2DD4BF] hover:bg-[#0F766E]/10 transition-colors cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        {!staff.isSuperAdmin && staff.email !== currentUser?.email && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Revoke staff privileges for ${staff.name}?`)) {
                                deleteStaffMember(staff.id);
                              }
                            }}
                            title="Revoke staff account"
                            className="p-1.5 rounded-lg bg-white dark:bg-[#121C21] border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* In-Modal Email Error Alert */}
              {emailError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl text-xs flex items-center justify-between text-rose-800 dark:text-rose-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{emailError}</span>
                  </div>
                  <button onClick={() => setEmailError('')} className="text-xs text-rose-600 hover:underline cursor-pointer">
                    Dismiss
                  </button>
                </div>
              )}

              {/* In-Modal Email Delivery Alert */}
              {emailDeliveryReceipt && (
                <div className="p-3 bg-[#0F766E]/10 dark:bg-[#2DD4BF]/15 border border-[#0F766E]/25 dark:border-[#2DD4BF]/30 rounded-xl text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#0F766E] dark:text-[#2DD4BF]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Credentials email dispatched directly to recipient inbox ({emailDeliveryReceipt.recipientEmail})</span>
                  </div>
                  <button onClick={() => setEmailDeliveryReceipt(null)} className="text-xs text-[#0F766E] hover:underline cursor-pointer">
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Provisioning Form & Success Receipt */}
          {activeTab === 'add' && (
            <div className="space-y-6">
              
              {/* Success Result Card */}
              {successData ? (
                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <div>
                        <h3 className="text-sm font-bold">Staff Account Authorized &amp; Created</h3>
                        <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                          {successData.name} can now sign in at the official portal using these credentials.
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
                      Active
                    </span>
                  </div>

                  {/* Credentials Box */}
                  <div className="p-4 rounded-xl bg-white dark:bg-[#121C21] border border-emerald-200 dark:border-emerald-800/40 space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500">Official Portal Login:</span>
                      <span className="font-mono font-bold text-[#132226] dark:text-[#F4F7F6]">{successData.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500">Temporary Password:</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{successData.password}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500">Assigned Department:</span>
                      <span className="font-semibold text-[#132226] dark:text-[#F4F7F6]">{successData.designation}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-500">Registered Phone:</span>
                      <span className="font-medium text-[#132226] dark:text-[#F4F7F6]">{successData.phone}</span>
                    </div>
                  </div>

                  {/* Action Buttons: Copy & Send Email */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleCopyCredentials(
                        `APNA CLINIC STAFF LOGIN\nEmail: ${successData.email}\nPassword: ${successData.password}\nPortal: https://communityclinic.org/login`
                      )}
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2.5 px-4 bg-white dark:bg-[#121C21] hover:bg-gray-50 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? 'Credentials Copied!' : 'Copy Login Details'}</span>
                    </button>

                    <button
                      onClick={() => handleSendCredentialsEmail(successData)}
                      disabled={isSendingEmail}
                      className="flex-1 min-w-[160px] flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-[#F4F7F6] text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{isSendingEmail ? 'Dispatching Email...' : 'Send Details on Email'}</span>
                    </button>

                    <button
                      onClick={() => { setSuccessData(null); setActiveTab('list'); }}
                      className="py-2.5 px-4 bg-transparent hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Back to Staff List
                    </button>
                  </div>

                  {/* Email Delivery Error or Notice */}
                  {emailError && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl text-xs flex items-center justify-between text-rose-800 dark:text-rose-200">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{emailError}</span>
                      </div>
                      <button onClick={() => setEmailError('')} className="text-xs text-rose-600 hover:underline cursor-pointer">
                        Dismiss
                      </button>
                    </div>
                  )}

                  {emailDeliveryReceipt && (
                    <div className="p-3 bg-white/80 dark:bg-[#121C21]/80 rounded-xl border border-emerald-300 dark:border-emerald-700/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>Credentials email dispatched directly to {emailDeliveryReceipt.recipientEmail}.</span>
                    </div>
                  )}
                </div>
              ) : (
                /* The Provisioning Form */
                <form onSubmit={handleProvisionStaff} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#455A60] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                        Staff Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#758D94] dark:text-[#79949B] absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Dr. Sunita Rao or Ramesh Kumar"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] focus:outline-none focus:border-[#0F766E] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#455A60] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                        Official Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#758D94] dark:text-[#79949B] absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="staff.name@communityclinic.org"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] focus:outline-none focus:border-[#0F766E] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#455A60] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                        Department / Role Preset
                      </label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-[#758D94] dark:text-[#79949B] absolute left-3.5 top-3" />
                        <select
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] focus:outline-none focus:border-[#0F766E]"
                        >
                          {COMMON_DESIGNATIONS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#455A60] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                        Custom Designation (Optional)
                      </label>
                      <input
                        type="text"
                        value={customDesignation}
                        onChange={(e) => setCustomDesignation(e.target.value)}
                        placeholder="e.g. Lead Nurse, Lab Technician"
                        className="w-full px-4 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] focus:outline-none focus:border-[#0F766E]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#455A60] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                        Mobile Phone (For Records)
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-[#758D94] dark:text-[#79949B] absolute left-3.5 top-3" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] focus:outline-none focus:border-[#0F766E]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#455A60] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                        Temporary Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#758D94] dark:text-[#79949B] absolute left-3.5 top-3" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full pl-10 pr-10 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] focus:outline-none focus:border-[#0F766E]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-[#758D94] hover:text-[#132226] dark:text-[#79949B] cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('list')}
                      className="px-4 py-2.5 border border-[#CFDAD6] dark:border-[#2C444E] text-[#5A7178] dark:text-[#9DB4BA] text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-[#F4F7F6] text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{loading ? 'Authorizing & Creating...' : 'Grant Admin / Staff Access'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Note */}
        <div className="px-6 py-3.5 border-t border-[#E0E7E5] dark:border-[#21333A] bg-[#F4F7F6]/60 dark:bg-[#19272D]/60 flex items-center justify-between text-[11px] text-[#5A7178] dark:text-[#79949B]">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#2DD4BF]" />
            <span>Authorized staff can access all modules: Pharmacy, Appointments, Doctor Schedules, and Health Camps.</span>
          </div>
          <button onClick={onClose} className="hover:underline font-bold text-[#0F766E] dark:text-[#2DD4BF] cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
