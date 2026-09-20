import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import BookAppointmentModal from '../../components/patient/BookAppointmentModal';
import TokenSlipModal from '../../components/patient/TokenSlipModal';
import { 
  Calendar, 
  Ticket, 
  Stethoscope, 
  PlusCircle, 
  Award, 
  ChevronRight, 
  Sparkles,
  FileCheck,
  Megaphone,
  MapPin
} from 'lucide-react';

export default function PatientDashboard() {
  const { userProfile } = useAuth();
  const { doctors, appointments, announcements } = useData();
  
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [activeSlipAppointment, setActiveSlipAppointment] = useState(null);

  // Filter appointments for current patient
  const myAppointments = appointments.filter(
    a => a.patientId === userProfile?.uid || a.patientEmail === userProfile?.email
  );

  const pendingAppointments = myAppointments.filter(a => a.status === 'pending');
  const nextAppointment = pendingAppointments[0] || null;
  const completedAppointments = myAppointments.filter(a => a.status === 'done');

  const handleOpenBooking = (doc = null) => {
    setSelectedDoctorForBooking(doc);
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = (bookedAppointment) => {
    setBookingModalOpen(false);
    setActiveSlipAppointment(bookedAppointment);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#F0EBE1] dark:bg-[#222722] border border-[#E4DCCE] dark:border-[#2D352C] text-[#22291F] dark:text-[#F5F1EA] p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C97B4A]/15 text-[#B35F2B] dark:text-[#C97B4A] text-xs font-semibold border border-[#C97B4A]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#B35F2B] dark:text-[#C97B4A]" />
              <span>Community Primary Health Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-[#22291F] dark:text-[#F5F1EA]">
              Hello, {userProfile?.name || 'Community Member'}
            </h1>
            <p className="text-sm text-[#6B6B63] dark:text-[#9EAA9A] leading-relaxed font-sans">
              Book consultations with clinic specialists, access digital queue tokens in real-time, and explore free community health camps under SDG 3.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleOpenBooking()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#23543E] text-[#FAF7F2] font-semibold text-sm transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-[#FAF7F2]" />
              <span>Book Appointment</span>
            </button>
            <Link
              to="/patient/appointments"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D8CEB3] dark:border-[#2D352C] bg-[#FAF7F2] dark:bg-[#1A1D19] hover:bg-[#E6DFC6]/60 dark:hover:bg-[#2D6A4F]/10 text-[#6B6B63] hover:text-[#22291F] dark:text-[#9EAA9A] dark:hover:text-[#F5F1EA] font-medium text-sm transition-colors"
            >
              <FileCheck className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788]" />
              <span>Visit History ({completedAppointments.length})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Queue / Next Appointment Tracker */}
      {nextAppointment && (
        <div className="rounded-2xl bg-white dark:bg-[#222722] border border-[#E6DFC6] dark:border-[#2D352C] p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-13 h-13 rounded-xl bg-[#2D6A4F] text-[#FAF7F2] flex flex-col items-center justify-center shrink-0 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3C9B8]">Token</span>
                <span className="text-xl font-black">{nextAppointment.tokenNumber}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#2D6A4F]/15 text-[#2D6A4F] dark:bg-[#2D6A4F]/20 dark:text-[#52B788] border border-[#2D6A4F]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] dark:bg-[#52B788]"></span>
                    Active in Queue
                  </span>
                  <span className="text-xs text-[#6B6B63] dark:text-[#9EAA9A] font-medium">{nextAppointment.date}</span>
                </div>
                <h3 className="text-base font-bold text-[#22291F] dark:text-[#F5F1EA] mt-1 font-heading">
                  Consultation with {nextAppointment.doctorName}
                </h3>
                <p className="text-xs text-[#6B6B63] dark:text-[#9EAA9A]">
                  {nextAppointment.specialization} • Scheduled Slot: <strong className="text-[#22291F] dark:text-[#F5F1EA]">{nextAppointment.time}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <button
                onClick={() => setActiveSlipAppointment(nextAppointment)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#FAF7F2] dark:bg-[#1A1D19] hover:bg-[#E6DFC6]/60 dark:hover:bg-[#2D6A4F]/15 border border-[#D8CEB3] dark:border-[#2D352C] hover:border-[#2D6A4F]/50 text-[#22291F] dark:text-[#F5F1EA] text-xs font-semibold rounded-xl transition-colors shadow-xs"
              >
                <Ticket className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788]" />
                <span>View Digital Token</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#222722] border border-[#E6DFC6] dark:border-[#2D352C] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#2D6A4F]/12 dark:bg-[#2D6A4F]/25 text-[#2D6A4F] dark:text-[#52B788] border border-[#2D6A4F]/25 dark:border-[#2D6A4F]/30 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[#6B6B63] dark:text-[#9EAA9A] uppercase tracking-wider">Pending Visits</p>
            <p className="text-xl sm:text-2xl font-bold text-[#22291F] dark:text-[#F5F1EA] font-heading">{pendingAppointments.length}</p>
          </div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#222722] border border-[#E6DFC6] dark:border-[#2D352C] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#2D6A4F]/12 dark:bg-[#2D6A4F]/25 text-[#2D6A4F] dark:text-[#52B788] border border-[#2D6A4F]/25 dark:border-[#2D6A4F]/30 flex items-center justify-center shrink-0">
            <FileCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[#6B6B63] dark:text-[#9EAA9A] uppercase tracking-wider">Completed</p>
            <p className="text-xl sm:text-2xl font-bold text-[#22291F] dark:text-[#F5F1EA] font-heading">{completedAppointments.length}</p>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#222722] border border-[#E6DFC6] dark:border-[#2D352C] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#2D6A4F]/12 dark:bg-[#2D6A4F]/25 text-[#2D6A4F] dark:text-[#52B788] border border-[#2D6A4F]/25 dark:border-[#2D6A4F]/30 flex items-center justify-center shrink-0">
            <Megaphone className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-[#6B6B63] dark:text-[#9EAA9A] uppercase tracking-wider">Health Camps</p>
            <p className="text-xl sm:text-2xl font-bold text-[#22291F] dark:text-[#F5F1EA] font-heading">{announcements.length}</p>
          </div>
        </div>
      </div>

      {/* Available Doctors Directory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#22291F] dark:text-[#F5F1EA] font-heading">Clinic Specialists &amp; Availability</h2>
            <p className="text-xs text-[#6B6B63] dark:text-[#9EAA9A]">Choose a department specialist and reserve your daily token</p>
          </div>
        </div>

        {doctors.length === 0 ? (
          <div className="bg-white dark:bg-[#222722] rounded-2xl border border-dashed border-[#D8CEB3] dark:border-[#2D352C] p-8 text-center space-y-3">
            <div className="w-11 h-11 rounded-xl bg-[#2D6A4F]/15 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center mx-auto">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#22291F] dark:text-[#F5F1EA] font-heading">No Doctors Added Yet</h3>
            <p className="text-xs text-[#6B6B63] dark:text-[#9EAA9A] max-w-sm mx-auto">
              The clinic administrator has not registered any doctors yet. Please check back soon or contact clinic administration.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {doctors.map((doctor) => (
              <div 
                key={doctor.id}
                className="bg-white dark:bg-[#222722] rounded-2xl border border-[#E6DFC6] dark:border-[#2D352C] hover:border-[#2D6A4F]/40 dark:hover:border-[#384337] p-5 transition-all flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-start gap-3 mb-3.5">
                    <img 
                      src={doctor.avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100"} 
                      alt={doctor.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='%23FAF7F2' stroke='%232D6A4F' stroke-width='1.5'%3E%3Ccircle cx='12' cy='8' r='5'/%3E%3Cpath d='M20 21a8 8 0 1 0-16 0'/%3E%3C/svg%3E";
                      }}
                      className="w-12 h-12 rounded-xl object-cover border border-[#E6DFC6] dark:border-[#2D352C] shrink-0 bg-[#FAF7F2] dark:bg-[#1A1D19]"
                    />
                    <div>
                      <h3 className="font-bold text-[#22291F] dark:text-[#F5F1EA] text-sm font-heading">{doctor.name}</h3>
                      <p className="text-xs font-medium text-[#2D6A4F] dark:text-[#52B788]">{doctor.specialization}</p>
                      <p className="text-[11px] text-[#6B6B63] dark:text-[#9EAA9A] mt-0.5">{doctor.cabin || 'Cabin 101'}</p>
                    </div>
                  </div>

                  <div className="py-2.5 border-y border-[#E6DFC6] dark:border-[#2D352C] space-y-1.5 my-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B6B63] dark:text-[#9EAA9A]">Available Slots:</span>
                      <span className="font-medium text-[#22291F] dark:text-[#F5F1EA]">{doctor.availableSlots?.length || 4} slots / day</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B6B63] dark:text-[#9EAA9A]">Experience:</span>
                      <span className="font-medium text-[#22291F] dark:text-[#F5F1EA]">{doctor.experience || '10+ yrs'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B6B63] dark:text-[#9EAA9A]">Consultation:</span>
                      <span className="font-semibold text-[#2D6A4F] dark:text-[#52B788]">Free (Community Care)</span>
                    </div>
                  </div>

                  {/* Available Days Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(doctor.availableDays || ["Mon", "Tue", "Wed", "Thu", "Fri"]).slice(0, 4).map(day => (
                      <span key={day} className="px-2 py-0.5 bg-[#FAF7F2] dark:bg-[#1A1D19] text-[#6B6B63] dark:text-[#9EAA9A] border border-[#E6DFC6] dark:border-[#2D352C] rounded-md text-[10px] font-medium">
                        {day.slice(0, 3)}
                      </span>
                    ))}
                    {doctor.availableDays?.length > 4 && (
                      <span className="px-1.5 py-0.5 bg-[#FAF7F2] dark:bg-[#1A1D19] text-[#8E8E84] dark:text-[#71806F] rounded-md text-[10px]">
                        +{doctor.availableDays.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenBooking(doctor)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#2D6A4F] hover:bg-[#23543E] text-[#FAF7F2] font-semibold text-xs rounded-xl transition-colors shadow-xs"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Book Appointment &amp; Token</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Community Health Camp Highlights */}
      <div className="bg-[#F0EBE1] dark:bg-[#222722] border border-[#E4DCCE] dark:border-[#2D352C] text-[#22291F] dark:text-[#F5F1EA] rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C97B4A]/15 text-[#B35F2B] dark:text-[#C97B4A] text-xs font-semibold border border-[#C97B4A]/30 mb-2">
              <Award className="w-3.5 h-3.5 text-[#B35F2B] dark:text-[#C97B4A]" />
              <span>UN Sustainable Development Goal 3</span>
            </div>
            <h2 className="text-xl font-bold font-heading text-[#22291F] dark:text-[#F5F1EA]">Upcoming Free Community Health Camps</h2>
            <p className="text-xs text-[#6B6B63] dark:text-[#9EAA9A]">Preventive checkups, pediatric nutrition, and awareness drives</p>
          </div>
          <Link
            to="/patient/announcements"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#2D6A4F] dark:text-[#52B788] hover:underline"
          >
            <span>View All Announcements</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {announcements.length === 0 ? (
          <div className="bg-[#FAF7F2] dark:bg-[#1A1D19] border border-dashed border-[#D8CEB3] dark:border-[#2D352C] rounded-xl p-8 text-center text-[#6B6B63] dark:text-[#9EAA9A]">
            <p className="text-sm font-medium">No Community Health Camps Announced Yet</p>
            <p className="text-xs text-[#8E8E84] dark:text-[#71806F] mt-1">Check back later for updates on upcoming free health screenings and outreach drives.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {announcements.slice(0, 3).map((ann) => (
              <div key={ann.id} className="bg-white dark:bg-[#1A1D19] border border-[#E4DCCE] dark:border-[#2D352C] rounded-xl p-4 hover:border-[#D8CEB3] dark:hover:border-[#384337] transition-colors shadow-xs">
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {ann.sdgTags?.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-[#2D6A4F]/12 dark:bg-[#2D6A4F]/20 text-[#2D6A4F] dark:text-[#52B788] font-medium text-[10px] border border-[#2D6A4F]/25 dark:border-[#2D6A4F]/30">
                      {tag}
                    </span>
                  ))}
                </div>
                <h4 className="font-semibold text-sm text-[#22291F] dark:text-[#F5F1EA] mb-1.5 font-heading">{ann.title}</h4>
                <p className="text-xs text-[#6B6B63] dark:text-[#9EAA9A] line-clamp-2 mb-3">{ann.description}</p>
                <div className="flex items-center gap-3 text-[11px] text-[#8E8E84] dark:text-[#71806F] pt-2 border-t border-[#E4DCCE] dark:border-[#2D352C]">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788]" /> {ann.date}</span>
                  <span className="flex items-center gap-1 truncate"><MapPin className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788]" /> {ann.location}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {bookingModalOpen && (
        <BookAppointmentModal
          initialDoctor={selectedDoctorForBooking}
          onClose={() => setBookingModalOpen(false)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {activeSlipAppointment && (
        <TokenSlipModal
          appointment={activeSlipAppointment}
          onClose={() => setActiveSlipAppointment(null)}
        />
      )}

    </div>
  );
}
