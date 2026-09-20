import React from 'react';
import { useData } from '../../context/DataContext';
import { Megaphone, Award, Calendar, MapPin, Users, CheckCircle2, HeartHandshake } from 'lucide-react';

export default function CommunityAnnouncements() {
  const { announcements, rsvpAnnouncement } = useData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C97B4A]/15 text-[#B35F2B] dark:text-[#C97B4A] text-xs font-bold border border-[#C97B4A]/30 mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>UN SDG 3: Good Health &amp; Well-being</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#22291F] dark:text-[#F5F1EA] font-heading tracking-tight">
            Community Health Initiatives &amp; Camps
          </h1>
          <p className="text-xs text-[#6B6B63] dark:text-[#9EAA9A] mt-1">
            Free community health screenings, immunizations, and wellness drives open to all residents.
          </p>
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white dark:bg-[#222722] rounded-3xl border border-dashed border-[#D8CEB3] dark:border-[#2D352C] p-12 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#2D6A4F]/15 border border-[#2D6A4F]/30 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center mx-auto">
            <Megaphone className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#22291F] dark:text-[#F5F1EA] font-heading">
            No Community Health Camps Announced Yet
          </h3>
          <p className="text-xs text-[#6B6B63] dark:text-[#9EAA9A] max-w-sm mx-auto">
            There are currently no active public health drives scheduled. Check back soon for free community screenings and maternal health initiatives.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((ann) => {
            const isRsvpd = typeof window !== 'undefined' && localStorage.getItem(`Apna_rsvp_${ann.id}`) === 'true';

            return (
              <div
                key={ann.id}
                className="bg-white dark:bg-[#222722] rounded-2xl border border-[#E6DFC6] dark:border-[#2D352C] hover:border-[#2D6A4F]/40 p-6 shadow-sm space-y-4 flex flex-col justify-between transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {ann.sdgTags?.map(tag => (
                      <span key={tag} className="px-2.5 py-0.5 rounded-md bg-[#2D6A4F]/12 dark:bg-[#2D6A4F]/20 text-[#2D6A4F] dark:text-[#52B788] text-[10px] font-bold border border-[#2D6A4F]/25 dark:border-[#2D6A4F]/30">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-lg font-bold text-[#22291F] dark:text-[#F5F1EA] font-heading leading-snug">
                    {ann.title}
                  </h3>

                  <p className="text-xs text-[#6B6B63] dark:text-[#9EAA9A] leading-relaxed">
                    {ann.description}
                  </p>

                  <div className="p-3 bg-[#FAF7F2] dark:bg-[#1A1D19] rounded-xl border border-[#E6DFC6] dark:border-[#2D352C] space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-[#22291F] dark:text-[#F5F1EA]">
                      <Calendar className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788] shrink-0" />
                      <span className="font-semibold">{ann.date}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[#6B6B63] dark:text-[#9EAA9A]">
                      <MapPin className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788] shrink-0" />
                      <span className="truncate">{ann.location}</span>
                    </div>

                    {ann.targetGroup && (
                      <div className="flex items-center gap-2 text-[#6B6B63] dark:text-[#9EAA9A]">
                        <Users className="w-3.5 h-3.5 text-[#C97B4A] shrink-0" />
                        <span className="truncate">For: {ann.targetGroup}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E6DFC6] dark:border-[#2D352C] flex items-center justify-between gap-3">
                  <div className="text-[11px] font-semibold text-[#8E8E84] dark:text-[#71806F]">
                    <span className="text-[#2D6A4F] dark:text-[#52B788] font-bold text-sm">
                      {ann.registeredCount || 0}
                    </span> Registered Attendees
                  </div>

                  <button
                    onClick={() => rsvpAnnouncement(ann.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer ${isRsvpd
                      ? 'bg-[#2D6A4F]/15 text-[#2D6A4F] dark:text-[#52B788] border border-[#2D6A4F]/30'
                      : 'bg-[#2D6A4F] hover:bg-[#23543E] text-[#FAF7F2]'
                      }`}
                  >
                    {isRsvpd ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Registered ✓</span>
                      </>
                    ) : (
                      <>
                        <HeartHandshake className="w-3.5 h-3.5" />
                        <span>Free RSVP</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
