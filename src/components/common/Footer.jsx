import React from 'react';
import { Link } from 'react-router-dom';
import {
  HeartHandshake,
  PhoneCall,
  Clock,
  MapPin,
  Award,
  Cloud,
  Heart,
  ChevronRight
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#F4F7F6]/80 dark:bg-[#0B1114]/85 backdrop-blur-md border-t border-[#E0E7E5] dark:border-[#21333A] text-[#5A7178] dark:text-[#9DB4BA] transition-colors mt-auto relative z-10">

      {/* Top Helpline Bar */}
      <div className="border-b border-[#E0E7E5] dark:border-[#21333A] bg-[#F4F7F6]/50 dark:bg-[#0B1114]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#0F766E]/15 text-[#0F766E] dark:text-[#2DD4BF] flex items-center justify-center shrink-0">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#132226] dark:text-[#F4F7F6] block">
                  Clinic Helpline &amp; Emergency Dispatch
                </span>
                <span className="text-[11px] text-[#758D94] dark:text-[#79949B]">
                  Toll-Free Emergency: <strong className="text-[#F97316] dark:text-[#FB923C]">108</strong> • Clinic Front Desk: <strong className="text-[#132226] dark:text-[#F4F7F6]">+91 (011) 2345-6789</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-[#5A7178] dark:text-[#9DB4BA]">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#2DD4BF]" />
                <span>Mon–Sat: <strong>8:00 AM – 8:00 PM</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#2DD4BF]" />
                <span>Gurugram, Main Health Center</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main 4-Column Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Col 1: Identity & SDG 3 Mission */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-[#0F766E] text-[#F4F7F6] flex items-center justify-center shadow-xs">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <span className="text-base font-extrabold text-[#132226] dark:text-[#F4F7F6] font-heading tracking-tight">
                Apna Clinic
              </span>
            </Link>

            <p className="text-xs leading-relaxed">
              Dignity-first primary health platform providing sequential token allocation, doctor consultation queues, and free community screenings with zero waiting room chaos.
            </p>

            <div className="pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F97316]/15 text-[#EA580C] dark:text-[#FB923C] text-[11px] font-bold border border-[#F97316]/30 dark:border-[#FB923C]/40">
                <Award className="w-3.5 h-3.5 text-[#F97316] dark:text-[#FB923C]" />
                <span>UN SDG 3: Good Health for All</span>
              </div>
            </div>
          </div>

          {/* Col 2: Patient Services */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#132226] dark:text-[#F4F7F6]">
              Patient Services
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/register" className="hover:text-[#0F766E] dark:hover:text-[#2DD4BF] transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-[#0F766E] dark:text-[#2DD4BF]" />
                  <span>Instant Queue Token Booking</span>
                </Link>
              </li>
              <li>
                <Link to="/patient/appointments" className="hover:text-[#0F766E] dark:hover:text-[#2DD4BF] transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-[#0F766E] dark:text-[#2DD4BF]" />
                  <span>My Appointments &amp; Digital Slips</span>
                </Link>
              </li>
              <li>
                <Link to="/announcements" className="hover:text-[#0F766E] dark:hover:text-[#2DD4BF] transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-[#0F766E] dark:text-[#2DD4BF]" />
                  <span>Free Community Health Drives</span>
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#0F766E] dark:hover:text-[#2DD4BF] transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-[#0F766E] dark:text-[#2DD4BF]" />
                  <span>Patient Medical History Records</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Clinical & Operations */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#132226] dark:text-[#F4F7F6]">
              Clinical Portals
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/doctor" className="hover:text-[#0F766E] dark:hover:text-[#2DD4BF] transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-[#0F766E] dark:text-[#2DD4BF]" />
                  <span>Doctor Consultation Queue Stream</span>
                </Link>
              </li>
              <li>
                <Link to="/doctor/patients" className="hover:text-[#0F766E] dark:hover:text-[#2DD4BF] transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-[#0F766E] dark:text-[#2DD4BF]" />
                  <span>Patient Diagnostic Records</span>
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-[#0F766E] dark:hover:text-[#2DD4BF] transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-[#0F766E] dark:text-[#2DD4BF]" />
                  <span>Clinic Administrator Hub</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/doctors" className="hover:text-[#0F766E] dark:hover:text-[#2DD4BF] transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-[#0F766E] dark:text-[#2DD4BF]" />
                  <span>Specialist Cabin &amp; Slot Management</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Cloud Security & Real-Time Sync Guarantee */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#132226] dark:text-[#F4F7F6]">
              Secure Cloud Architecture
            </h3>
            <p className="text-xs leading-relaxed">
              Powered by Cloud Firestore &amp; Firebase Auth. All clinical tokens, medical records, and queues sync in real-time across clinic devices.
            </p>
            <div className="p-3 rounded-xl bg-[#F4F7F6] dark:bg-[#121C21] border border-[#DCE5E2] dark:border-[#21333A] space-y-1.5 text-[11px]">
              <div className="flex items-center gap-1.5 text-[#0F766E] dark:text-[#2DD4BF] font-semibold">
                <Cloud className="w-3.5 h-3.5 shrink-0" />
                <span>Encrypted Firestore Storage</span>
              </div>
              <p className="text-[#758D94] dark:text-[#79949B]">
                HIPAA-ready encrypted ledger. Real-time multi-device sync.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Legal & Love Bar */}
      <div className="border-t border-[#DCE5E2] dark:border-[#21333A] py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p className="text-[#758D94] dark:text-[#79949B]">
            © {new Date().getFullYear()} Apna Community Health Platform. Dedicated to universal primary healthcare.
          </p>
          <div className="flex items-center gap-1 text-[#758D94] dark:text-[#79949B]">
            <span>Designed with</span>
            <Heart className="w-3 h-3 text-[#F97316] dark:text-[#FB923C] fill-[#F97316] dark:fill-[#FB923C]" />
            <span>for Community Clinics &amp; Patient Well-being</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
