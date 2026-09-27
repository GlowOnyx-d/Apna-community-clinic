import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Megaphone, Award } from 'lucide-react';
import HealthCampCard from '../../components/common/HealthCampCard';

export default function CommunityAnnouncements() {
  const { announcements, rsvpAnnouncement } = useData();
  const { role } = useAuth();
  const [rsvpSync, setRsvpSync] = useState(0);

  const handleRsvp = async (annId) => {
    await rsvpAnnouncement(annId);
    setRsvpSync(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C97B4A]/15 text-[#B35F2B] dark:text-[#E09463] text-xs font-bold border border-[#C97B4A]/30 mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>UN SDG 3: Good Health &amp; Well-being</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#22291F] dark:text-[#FAF7F2] font-heading tracking-tight">
            Community Health Initiatives &amp; Camps
          </h1>
          <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] mt-1">
            Free community health screenings, immunizations, and wellness drives open to all residents.
          </p>
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white dark:bg-[#1C221C] rounded-3xl border border-dashed border-[#D8CEB3] dark:border-[#2F3B2F] p-12 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#2D6A4F]/15 border border-[#2D6A4F]/30 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center mx-auto">
            <Megaphone className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">
            No Community Health Camps Announced Yet
          </h3>
          <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] max-w-sm mx-auto">
            There are currently no active public health drives scheduled. Check back soon for free community screenings and maternal health initiatives.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((ann) => {
            const isRsvpd = typeof window !== 'undefined' && localStorage.getItem(`Apna_rsvp_${ann.id}`) === 'true';

            return (
              <HealthCampCard
                key={`${ann.id}_${rsvpSync}`}
                ann={ann}
                role={role || 'patient'}
                onRsvp={role === 'doctor' ? null : handleRsvp}
                isRsvpd={isRsvpd}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
