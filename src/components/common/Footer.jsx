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
    <footer className="bg-[#F8F6F1]/80 dark:bg-[#131713]/85 backdrop-blur-md border-t border-[#E6DFC6] dark:border-[#2F3B2F] text-[#6B6B63] dark:text-[#C4CFC3] transition-colors mt-auto relative z-10">

      {/* Top Helpline Bar */}
      <div className="border-b border-[#E6DFC6] dark:border-[#2F3B2F] bg-[#F8F6F1]/50 dark:bg-[#131713]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#2D6A4F]/15 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center shrink-0">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#22291F] dark:text-[#FAF7F2] block">
                  Clinic Helpline &amp; Emergency Dispatch
                </span>
                <span className="text-[11px] text-[#8E8E84] dark:text-[#94A493]">
                  Toll-Free Emergency: <strong className="text-[#C97B4A] dark:text-[#E58A54]">108</strong> • Clinic Front Desk: <strong className="text-[#22291F] dark:text-[#FAF7F2]">+91 (011) 2345-6789</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-[#6B6B63] dark:text-[#C4CFC3]">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788]" />
                <span>Mon–Sat: <strong>8:00 AM – 8:00 PM</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788]" />
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
              <div className="w-8 h-8 rounded-xl bg-[#2D6A4F] text-[#FAF7F2] flex items-center justify-center shadow-xs">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <span className="text-base font-extrabold text-[#22291F] dark:text-[#FAF7F2] font-heading tracking-tight">
                Apna Clinic
              </span>
            </Link>

            <p className="text-xs leading-relaxed">
              Dignity-first primary health platform providing sequential token allocation, doctor consultation queues, and free community screenings with zero waiting room chaos.
            </p>

            <div className="pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C97B4A]/15 text-[#B35F2B] dark:text-[#E58A54] text-[11px] font-bold border border-[#C97B4A]/30 dark:border-[#E58A54]/40">
                <Award className="w-3.5 h-3.5 text-[#C97B4A] dark:text-[#E58A54]" />
                <span>UN SDG 3: Good Health for All</span>
              </div>
            </div>
          </div>

          {/* Col 2: Patient Services */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#22291F] dark:text-[#FAF7F2]">
              Patient Services
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/register" className="hover:text-[#2D6A4F] dark:hover:text-[#52B788] transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-[#2D6A4F] dark:text-[#52B788]" />
                  <span>Instant Queue Token Booking</span>
                </Link>
              </li>
              <li>
                <Link to="/patient/appointments" className="hover:text-[#2D6A4F] dark:hover:text-[#52B788] transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-[#2D6A4F] dark:text-[#52B788]" />
                  <span>My Appointments &amp; Digital Slips</span>
                </Link>
              </li>
              <li>
                <Link to="/announcements" className="hover:text-[#2D6A4F] dark:hover:text-[#52B788] transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-[#2D6A4F] dark:text-[#52B788]" />
                  <span>Free Community Health Drives</span>
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#2D6A4F] dark:hover:text-[#52B788] transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-[#2D6A4F] dark:text-[#52B788]" />
                  <span>Patient Medical History Records</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Clinical & Operations */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#22291F] dark:text-[#FAF7F2]">
              Clinical Portals
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/doctor" className="hover:text-[#2D6A4F] dark:hover:text-[#52B788] transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-[#2D6A4F] dark:text-[#52B788]" />
                  <span>Doctor Consultation Queue Stream</span>
                </Link>
              </li>
              <li>
                <Link to="/doctor/patients" className="hover:text-[#2D6A4F] dark:hover:text-[#52B788] transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-[#2D6A4F] dark:text-[#52B788]" />
                  <span>Patient Diagnostic Records</span>
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-[#2D6A4F] dark:hover:text-[#52B788] transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-[#2D6A4F] dark:text-[#52B788]" />
                  <span>Clinic Administrator Hub</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/doctors" className="hover:text-[#2D6A4F] dark:hover:text-[#52B788] transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-[#2D6A4F] dark:text-[#52B788]" />
                  <span>Specialist Cabin &amp; Slot Management</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Cloud Security & Real-Time Sync Guarantee */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#22291F] dark:text-[#FAF7F2]">
              Secure Cloud Architecture
            </h3>
            <p className="text-xs leading-relaxed">
              Powered by Cloud Firestore &amp; Firebase Auth. All clinical tokens, medical records, and queues sync in real-time across clinic devices.
            </p>
            <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#1C221C] border border-[#E4DCCE] dark:border-[#2F3B2F] space-y-1.5 text-[11px]">
              <div className="flex items-center gap-1.5 text-[#2D6A4F] dark:text-[#52B788] font-semibold">
                <Cloud className="w-3.5 h-3.5 shrink-0" />
                <span>Encrypted Firestore Storage</span>
              </div>
              <p className="text-[#8E8E84] dark:text-[#94A493]">
                HIPAA-ready encrypted ledger. Real-time multi-device sync.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Legal & Love Bar */}
      <div className="border-t border-[#E4DCCE] dark:border-[#2F3B2F] py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p className="text-[#8E8E84] dark:text-[#94A493]">
            © {new Date().getFullYear()} Apna Community Health Platform. Dedicated to universal primary healthcare.
          </p>
          <div className="flex items-center gap-1 text-[#8E8E84] dark:text-[#94A493]">
            <span>Designed with</span>
            <Heart className="w-3 h-3 text-[#C97B4A] dark:text-[#E58A54] fill-[#C97B4A] dark:fill-[#E58A54]" />
            <span>for Community Clinics &amp; Patient Well-being</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
