import React from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle2, 
  HeartHandshake, 
  Edit3, 
  Trash2, 
  Clock 
} from 'lucide-react';

/**
 * Returns color config and primary tag styling for UN SDG tags
 */
export const getSdgColorConfig = (tags) => {
  const str = (tags || []).join(' ').toLowerCase();
  
  if (str.includes('sdg 5') || str.includes('gender')) {
    return {
      badge: 'bg-[#F97316]/12 text-[#EA580C] dark:bg-[#FB923C]/20 dark:text-[#FB923C] border-[#F97316]/30',
      shortLabel: 'SDG 5'
    };
  }
  if (str.includes('sdg 10') || str.includes('inequalities')) {
    return {
      badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-900/60',
      shortLabel: 'SDG 10'
    };
  }
  if (str.includes('sdg 2') || str.includes('hunger')) {
    return {
      badge: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/60',
      shortLabel: 'SDG 2'
    };
  }
  if (str.includes('sdg 6') || str.includes('water')) {
    return {
      badge: 'bg-cyan-50 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-900/60',
      shortLabel: 'SDG 6'
    };
  }
  // Default: SDG 3 (Good Health & Well-being)
  return {
    badge: 'bg-[#0F766E]/12 text-[#0F766E] dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF] border-[#0F766E]/25 dark:border-[#2DD4BF]/30',
    shortLabel: 'SDG 3'
  };
};

/**
 * Evaluates camp date against today to return "Upcoming", "This Week", or "Past"
 */
export const getCampDateStatus = (dateStr) => {
  if (!dateStr) {
    return {
      status: 'upcoming',
      badgeText: 'Upcoming',
      badgeStyle: 'bg-[#0F766E]/10 text-[#0F766E] dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF] border-[#0F766E]/25 dark:border-[#2DD4BF]/30'
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
      badgeStyle: 'bg-[#E0E7E5]/50 text-[#758D94] dark:bg-[#21333A] dark:text-[#79949B] border-[#CFDAD6] dark:border-[#2C444E]'
    };
  }

  if (diffDays === 0) {
    return {
      status: 'today',
      badgeText: 'Today',
      badgeStyle: 'bg-emerald-600 text-white dark:bg-emerald-500 font-bold border-emerald-700'
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
    badgeStyle: 'bg-[#0F766E]/10 text-[#0F766E] dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF] border-[#0F766E]/25 dark:border-[#2DD4BF]/30'
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
  const dateStatus = getCampDateStatus(ann.date);
  const isAdmin = role === 'admin';
  const isPast = dateStatus.status === 'past';

  const registered = ann.registeredCount || 0;
  const capacity = ann.capacity || 50;
  const percent = Math.min(Math.round((registered / capacity) * 100), 100);

  const fullSdgTooltip = ann.sdgTags && ann.sdgTags.length > 0 
    ? ann.sdgTags.join(' • ') 
    : 'SDG 3: Good Health & Well-being';

  return (
    <div
      className="h-full bg-white dark:bg-[#121C21] rounded-2xl border border-[#E0E7E5] dark:border-[#21333A] p-5 shadow-xs flex flex-col justify-between hover:border-[#0F766E]/40 dark:hover:border-[#2DD4BF]/40 transition-colors relative"
    >
      <div className="space-y-3.5">
        {/* Top Badges Row: Status badge top-left + SDG 3 chip top-right */}
        <div className="flex items-center justify-between gap-2">
          {/* Status Indicator */}
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${dateStatus.badgeStyle}`}>
            {dateStatus.badgeText}
          </span>

          {/* SDG chip */}
          <span
            title={fullSdgTooltip}
            className={`px-2 py-0.5 rounded-md text-xs font-bold border cursor-help ${sdgConfig.badge}`}
          >
            {sdgConfig.shortLabel}
          </span>
        </div>

        {/* Title & Organizer */}
        <div>
          <h3 className="text-base font-bold text-[#132226] dark:text-[#F4F7F6] font-heading leading-snug line-clamp-2">
            {ann.title}
          </h3>
          <p className="text-xs text-[#758D94] dark:text-[#79949B] mt-1 truncate">
            Organized by <span className="font-medium text-[#5A7178] dark:text-[#9DB4BA]">{ann.organizer || 'Apna Health Team'}</span>
          </p>
        </div>

        {/* Description */}
        {ann.description && (
          <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA] leading-relaxed line-clamp-2">
            {ann.description}
          </p>
        )}

        {/* 3 Compact Icon Rows: Date, Venue, Audience */}
        <div className="p-3 bg-[#F4F7F6] dark:bg-[#19272D] rounded-xl border border-[#E0E7E5] dark:border-[#21333A] space-y-2 text-xs">
          <div className="flex items-center gap-2 text-[#132226] dark:text-[#F4F7F6]">
            <Calendar className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#2DD4BF] shrink-0" />
            <span className="font-medium truncate">{ann.date}</span>
          </div>

          <div className="flex items-center gap-2 text-[#5A7178] dark:text-[#9DB4BA]">
            <MapPin className="w-3.5 h-3.5 text-[#F97316] dark:text-[#FB923C] shrink-0" />
            <span className="truncate">{ann.location}</span>
          </div>

          <div className="flex items-center gap-2 text-[#5A7178] dark:text-[#9DB4BA]">
            <Users className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#2DD4BF] shrink-0" />
            <span className="truncate">{ann.targetGroup || 'Open to All'}</span>
          </div>
        </div>

        {/* Progress Bar for Registered / Capacity */}
        <div>
          <div className="flex items-center justify-between text-xs text-[#758D94] dark:text-[#79949B] mb-1.5">
            <span>Registered</span>
            <span className="font-semibold text-[#132226] dark:text-[#F4F7F6]">
              {registered} / {capacity}
            </span>
          </div>
          <div className="w-full bg-[#E0E7E5] dark:bg-[#21333A] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#0F766E] dark:bg-[#2DD4BF] h-full rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Single Footer Row */}
      {isAdmin ? (
        <div className="flex items-center gap-2 pt-3 mt-3 border-t border-[#E0E7E5] dark:border-[#21333A]">
          <button
            type="button"
            onClick={() => onEdit && onEdit(ann)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#CFDAD6] dark:border-[#2C444E] hover:border-[#0F766E] dark:hover:border-[#2DD4BF] text-[#0F766E] dark:text-[#2DD4BF] text-xs font-semibold hover:bg-[#0F766E]/5 dark:hover:bg-[#0D9488]/10 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete && onDelete(ann)}
            className="p-2 text-[#758D94] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
            title="Delete Health Camp"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : onRsvp ? (
        <div className="pt-3 mt-3 border-t border-[#E0E7E5] dark:border-[#21333A]">
          <button
            type="button"
            disabled={isPast}
            onClick={() => onRsvp(ann.id)}
            className={`w-full flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isPast
                ? 'bg-[#E0E7E5]/50 dark:bg-[#21333A]/60 text-[#758D94] dark:text-[#79949B] cursor-not-allowed'
                : isRsvpd
                  ? 'bg-[#0F766E]/15 text-[#0F766E] dark:text-[#2DD4BF] border border-[#0F766E]/30 dark:border-[#2DD4BF]/30 hover:bg-[#0F766E]/25'
                  : 'bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-white shadow-xs'
            }`}
          >
            {isPast ? (
              <>
                <Clock className="w-3.5 h-3.5" />
                <span>Camp Concluded</span>
              </>
            ) : isRsvpd ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#2DD4BF]" />
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
      ) : null}
    </div>
  );
}
