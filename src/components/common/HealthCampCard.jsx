import React from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle2, 
  HeartHandshake, 
  Edit3, 
  Trash2, 
  Activity, 
  Baby, 
  Eye, 
  Stethoscope, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';

/**
 * Returns color config and primary tag styling for UN SDG tags
 */
export const getSdgColorConfig = (tags) => {
  const str = (tags || []).join(' ').toLowerCase();
  
  if (str.includes('sdg 5') || str.includes('gender')) {
    return {
      border: 'border-l-[#C97B4A] dark:border-l-[#E58A54]',
      badge: 'bg-[#C97B4A]/12 text-[#B35F2B] dark:bg-[#E58A54]/20 dark:text-[#E58A54] border-[#C97B4A]/30',
      iconBg: 'bg-[#C97B4A]/12 text-[#B35F2B] dark:bg-[#E58A54]/20 dark:text-[#E58A54]',
      name: 'SDG 5: Gender Equality'
    };
  }
  if (str.includes('sdg 10') || str.includes('inequalities')) {
    return {
      border: 'border-l-rose-500 dark:border-l-rose-400',
      badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-900/60',
      iconBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
      name: 'SDG 10: Reduced Inequalities'
    };
  }
  if (str.includes('sdg 2') || str.includes('hunger')) {
    return {
      border: 'border-l-amber-500 dark:border-l-amber-400',
      badge: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/60',
      iconBg: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
      name: 'SDG 2: Zero Hunger'
    };
  }
  if (str.includes('sdg 6') || str.includes('water')) {
    return {
      border: 'border-l-cyan-600 dark:border-l-cyan-400',
      badge: 'bg-cyan-50 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-900/60',
      iconBg: 'bg-cyan-50 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300',
      name: 'SDG 6: Clean Water'
    };
  }
  // Default: SDG 3 (Good Health & Well-being)
  return {
    border: 'border-l-[#2D6A4F] dark:border-l-[#52B788]',
    badge: 'bg-[#2D6A4F]/12 text-[#2D6A4F] dark:bg-[#52B788]/20 dark:text-[#52B788] border-[#2D6A4F]/25 dark:border-[#52B788]/30',
    iconBg: 'bg-[#2D6A4F]/12 text-[#2D6A4F] dark:bg-[#52B788]/20 dark:text-[#52B788]',
    name: 'SDG 3: Good Health'
  };
};

/**
 * Returns a specialized medical icon for the camp based on title and category
 */
export const getCampIcon = (ann) => {
  const text = `${ann.title || ''} ${ann.category || ''} ${ann.description || ''}`.toLowerCase();
  
  if (text.includes('vision') || text.includes('eye') || text.includes('cataract') || text.includes('glaucoma') || text.includes('optical')) {
    return Eye;
  }
  if (text.includes('maternal') || text.includes('infant') || text.includes('child') || text.includes('vaccin') || text.includes('immuniz') || text.includes('baby') || text.includes('pediatric')) {
    return Baby;
  }
  if (text.includes('hypertension') || text.includes('diabetes') || text.includes('heart') || text.includes('blood pressure') || text.includes('cardio') || text.includes('pulse')) {
    return Activity;
  }
  if (text.includes('screening') || text.includes('diagnostic')) {
    return ShieldCheck;
  }
  return Stethoscope;
};

/**
 * Evaluates camp date against today to return "Upcoming", "This Week", or "Past"
 */
export const getCampDateStatus = (dateStr) => {
  if (!dateStr) {
    return {
      status: 'upcoming',
      badgeText: 'Upcoming',
      badgeStyle: 'bg-[#2D6A4F]/10 text-[#2D6A4F] dark:bg-[#52B788]/20 dark:text-[#52B788] border-[#2D6A4F]/25 dark:border-[#52B788]/30'
    };
  }

  const [y, m, d] = dateStr.split('-').map(Number);
  const campDate = new Date(y, m - 1, d);
  campDate.setHours(0, 0, 0, 0);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = campDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

  if (diffDays < 0) {
    return {
      status: 'past',
      badgeText: 'Past',
      badgeStyle: 'bg-[#E6DFC6]/50 text-[#8E8E84] dark:bg-[#2F3B2F] dark:text-[#94A493] border-[#D8CEB3] dark:border-[#445644]'
    };
  }

  if (diffDays === 0) {
    return {
      status: 'today',
      badgeText: 'Today',
      badgeStyle: 'bg-emerald-600 text-white dark:bg-emerald-500 font-extrabold shadow-xs animate-pulse border-emerald-700'
    };
  }

  if (diffDays <= 7) {
    return {
      status: 'this_week',
      badgeText: 'This Week',
      badgeStyle: 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800'
    };
  }

  return {
    status: 'upcoming',
    badgeText: 'Upcoming',
    badgeStyle: 'bg-[#2D6A4F]/10 text-[#2D6A4F] dark:bg-[#52B788]/20 dark:text-[#52B788] border-[#2D6A4F]/25 dark:border-[#52B788]/30'
  };
};

export default function HealthCampCard({
  ann,
  role = 'patient',
  onEdit,
  onDelete,
  onRsvp,
  isRsvpd = false
}) {
  const sdgConfig = getSdgColorConfig(ann.sdgTags);
  const CampIcon = getCampIcon(ann);
  const dateStatus = getCampDateStatus(ann.date);
  const isAdmin = role === 'admin';
  const isPast = dateStatus.status === 'past';

  return (
    <div
      className={`bg-white dark:bg-[#1C221C] rounded-2xl border border-[#E6DFC6] dark:border-[#2F3B2F] border-l-[5px] ${sdgConfig.border} p-5 sm:p-6 shadow-sm flex flex-col justify-between hover:border-[#2D6A4F]/40 dark:hover:border-[#52B788]/40 transition-all hover:shadow-md relative overflow-hidden`}
    >
      <div className="space-y-4">
        {/* Top Badges Row: SDG Tags & Status Indicator */}
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex flex-wrap items-center gap-1.5">
            {ann.sdgTags && ann.sdgTags.length > 0 ? (
              ann.sdgTags.map((tag) => (
                <span
                  key={tag}
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${sdgConfig.badge}`}
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${sdgConfig.badge}`}>
                SDG 3: Good Health &amp; Well-being
              </span>
            )}
          </div>

          {/* Status Indicator (Upcoming / This Week / Past) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${dateStatus.badgeStyle}`}>
              {dateStatus.badgeText}
            </span>

            {/* Admin Management Actions: Edit & Delete */}
            {isAdmin && (
              <div className="flex items-center gap-1 ml-1 pl-2 border-l border-[#E6DFC6] dark:border-[#2F3B2F]">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(ann)}
                    title="Edit Camp Details"
                    className="p-1.5 text-[#6B6B63] dark:text-[#C4CFC3] hover:text-[#2D6A4F] dark:hover:text-[#52B788] hover:bg-[#2D6A4F]/10 dark:hover:bg-[#357A5B]/20 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(ann)}
                    title="Delete Camp Announcement"
                    className="p-1.5 text-[#6B6B63] dark:text-[#C4CFC3] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title Row with Relevant Health Specialty Icon */}
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl ${sdgConfig.iconBg} flex items-center justify-center shrink-0 mt-0.5 border border-black/5 dark:border-white/10 shadow-2xs`}>
            <CampIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading leading-snug">
              {ann.title}
            </h3>
            {ann.organizer && (
              <p className="text-[11px] text-[#8E8E84] dark:text-[#94A493] mt-0.5">
                Organized by: <span className="font-medium text-[#6B6B63] dark:text-[#C4CFC3]">{ann.organizer}</span>
              </p>
            )}
          </div>
        </div>

        {/* Camp Description */}
        <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] leading-relaxed line-clamp-3">
          {ann.description}
        </p>

        {/* Event Schedule & Location Box */}
        <div className="p-3 bg-[#FAF7F2] dark:bg-[#242C24] rounded-xl border border-[#E6DFC6] dark:border-[#2F3B2F] space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[#22291F] dark:text-[#FAF7F2]">
              <Calendar className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788] shrink-0" />
              <span className="font-semibold">{ann.date}</span>
            </div>
            {dateStatus.status === 'today' && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                • Active Now
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[#6B6B63] dark:text-[#C4CFC3]">
            <MapPin className="w-3.5 h-3.5 text-[#C97B4A] dark:text-[#E58A54] shrink-0" />
            <span className="truncate">{ann.location}</span>
          </div>

          {ann.targetGroup && (
            <div className="flex items-center gap-2 text-[#6B6B63] dark:text-[#C4CFC3]">
              <Users className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788] shrink-0" />
              <span className="truncate">Target: {ann.targetGroup}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Registered Count (Shared by ALL roles) + Role Action */}
      <div className="pt-4 mt-4 border-t border-[#E6DFC6] dark:border-[#2F3B2F] flex items-center justify-between gap-3">
        {/* RSVP / Registered Count with People Icon (Requirement 2) */}
        <div className="flex items-center gap-1.5 text-xs text-[#6B6B63] dark:text-[#C4CFC3]">
          <div className="w-6 h-6 rounded-lg bg-[#2D6A4F]/10 dark:bg-[#52B788]/20 flex items-center justify-center text-[#2D6A4F] dark:text-[#52B788] shrink-0">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-sm font-black font-heading text-[#22291F] dark:text-[#FAF7F2]">
              {ann.registeredCount || 0}
            </span>
            <span className="text-[11px] font-medium text-[#8E8E84] dark:text-[#94A493] ml-1">
              registered
            </span>
          </div>
        </div>

        {/* Action: Patient RSVP Button OR Admin Indicator OR Doctor Info */}
        {onRsvp && !isAdmin ? (
          <button
            type="button"
            disabled={isPast}
            onClick={() => onRsvp(ann.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isPast
                ? 'bg-[#E6DFC6]/50 dark:bg-[#2F3B2F]/60 text-[#8E8E84] dark:text-[#94A493] cursor-not-allowed'
                : isRsvpd
                  ? 'bg-[#2D6A4F]/15 text-[#2D6A4F] dark:text-[#52B788] border border-[#2D6A4F]/30 dark:border-[#52B788]/30 hover:bg-[#2D6A4F]/25'
                  : 'bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2]'
            }`}
          >
            {isPast ? (
              <>
                <Clock className="w-3.5 h-3.5" />
                <span>Camp Concluded</span>
              </>
            ) : isRsvpd ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#52B788]" />
                <span>Registered ✓</span>
              </>
            ) : (
              <>
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Free RSVP</span>
              </>
            )}
          </button>
        ) : isAdmin ? (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(ann)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2D6A4F]/10 hover:bg-[#2D6A4F]/20 text-[#2D6A4F] dark:text-[#52B788] text-xs font-bold transition-colors cursor-pointer border border-[#2D6A4F]/20"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Camp</span>
              </button>
            )}
          </div>
        ) : (
          <span className="text-[11px] font-semibold text-[#2D6A4F] dark:text-[#52B788] bg-[#2D6A4F]/10 dark:bg-[#52B788]/20 px-2.5 py-1 rounded-lg">
            Community Drive
          </span>
        )}
      </div>
    </div>
  );
}
