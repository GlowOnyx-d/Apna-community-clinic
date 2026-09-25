/**
 * Visual styling and avatar helpers for clinic specialists.
 * Provides consistent specialty badges, verified high-resolution portraits,
 * and elegant medical SVG avatar fallbacks.
 */

export const DOCTOR_PHOTO_MAP = {
  'doc_priya_nair': 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=300&auto=format&fit=crop&q=80',
  'priya nair': 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=300&auto=format&fit=crop&q=80',
  'doc_sarah_jenkins': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
  'sarah jenkins': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
  'doc_amitav_roy': 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=300&auto=format&fit=crop&q=80',
  'amitav roy': 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=300&auto=format&fit=crop&q=80',
  'doc_meera_iyer': 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=300&auto=format&fit=crop&q=80',
  'meera iyer': 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=300&auto=format&fit=crop&q=80',
  'doc_vikram_patel': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
  'vikram patel': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80'
};

/**
 * Returns an illustrated SVG data URI for doctors without a photo or on image load failure.
 */
export const getDoctorFallbackAvatar = (name = 'Doctor') => {
  const cleanName = (name || 'Doctor').replace(/^Dr\.\s*/i, '').trim();
  const initial = (cleanName[0] || 'D').toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#EAF3EE"/>
        <stop offset="100%" stop-color="#D7E8DC"/>
      </linearGradient>
      <linearGradient id="coatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#EFF5F1"/>
      </linearGradient>
    </defs>
    <circle cx="60" cy="60" r="58" fill="url(#bgGrad)" stroke="#BEDBC5" stroke-width="2"/>
    <circle cx="60" cy="45" r="22" fill="#E2BA99"/>
    <path d="M38 43c0-13 10-23 22-23s22 10 22 23c0 3-1 6-2 7-3-8-10-13-20-13s-17 5-20 13c-1-1-2-4-2-7z" fill="#3D2E28"/>
    <path d="M22 110c2-26 18-38 38-38s36 12 38 38" fill="url(#coatGrad)" stroke="#C8D6CD" stroke-width="1.5"/>
    <polygon points="60,86 48,72 72,72" fill="#2D6A4F"/>
    <polygon points="46,72 60,110 52,110 40,72" fill="#FFFFFF" stroke="#C8D6CD" stroke-width="1"/>
    <polygon points="74,72 60,110 68,110 80,72" fill="#FFFFFF" stroke="#C8D6CD" stroke-width="1"/>
    <path d="M49 74c0 10 4 16 11 16s11-6 11-16" fill="none" stroke="#2D6A4F" stroke-width="3" stroke-linecap="round"/>
    <circle cx="60" cy="94" r="4" fill="#52B788" stroke="#2D6A4F" stroke-width="1.5"/>
    <circle cx="92" cy="28" r="14" fill="#2D6A4F" stroke="#FFFFFF" stroke-width="2"/>
    <text x="92" y="33" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#FAF7F2" text-anchor="middle">${initial}</text>
  </svg>`.replace(/\n\s*/g, '');

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Returns the best available avatar photo URL or fallback illustrated SVG.
 */
export const getDoctorAvatar = (doctor) => {
  if (!doctor) return getDoctorFallbackAvatar('Doctor');

  const cleanName = (doctor.name || '').replace(/^Dr\.\s*/i, '').trim().toLowerCase();

  // If avatar is the broken Unsplash link for Dr. Priya Nair, swap to confirmed working portrait
  if (doctor.avatar && doctor.avatar.includes('photo-1594824813580-b2f7685600cb')) {
    return DOCTOR_PHOTO_MAP['doc_priya_nair'];
  }

  // If valid external photo exists
  if (doctor.avatar && !doctor.avatar.startsWith('data:image/svg+xml') && doctor.avatar.trim() !== '') {
    return doctor.avatar;
  }

  // Lookup in portrait map by ID or clean name
  if (doctor.id && DOCTOR_PHOTO_MAP[doctor.id]) {
    return DOCTOR_PHOTO_MAP[doctor.id];
  }
  if (cleanName && DOCTOR_PHOTO_MAP[cleanName]) {
    return DOCTOR_PHOTO_MAP[cleanName];
  }

  return getDoctorFallbackAvatar(doctor.name || 'Doctor');
};

/**
 * Returns consistent specialty configuration (badge classes and label) for visual scanning.
 */
export const getSpecialtyConfig = (specialization = '') => {
  const s = (specialization || '').toLowerCase();

  if (s.includes('pediatric') || s.includes('child')) {
    return {
      key: 'pediatrics',
      label: 'Pediatrics',
      badgeClass: 'bg-[#C97B4A]/12 text-[#B35F2B] border-[#C97B4A]/30 dark:bg-[#E58A54]/18 dark:text-[#E58A54] dark:border-[#E58A54]/30'
    };
  }

  if (s.includes('dent') || s.includes('oral')) {
    return {
      key: 'dental',
      label: 'Dental Care',
      badgeClass: 'bg-sky-500/12 text-sky-700 border-sky-500/30 dark:bg-sky-500/18 dark:text-sky-300 dark:border-sky-500/30'
    };
  }

  if (s.includes('diagnost') || s.includes('patholog') || s.includes('screen') || s.includes('lab')) {
    return {
      key: 'diagnostics',
      label: 'Diagnostics',
      badgeClass: 'bg-purple-500/12 text-purple-700 border-purple-500/30 dark:bg-purple-500/18 dark:text-purple-300 dark:border-purple-500/30'
    };
  }

  if (s.includes('general') || s.includes('family') || s.includes('physician') || s.includes('internal') || s.includes('medicine')) {
    return {
      key: 'general',
      label: 'General Medicine',
      badgeClass: 'bg-[#2D6A4F]/10 text-[#2D6A4F] border-[#2D6A4F]/25 dark:bg-[#52B788]/15 dark:text-[#52B788] dark:border-[#52B788]/30'
    };
  }

  const cleanSpecialty = specialization ? specialization.split('&')[0].trim() : 'Specialist';
  return {
    key: 'other',
    label: cleanSpecialty.length > 20 ? cleanSpecialty.slice(0, 18) + '...' : cleanSpecialty,
    badgeClass: 'bg-stone-500/12 text-stone-700 border-stone-500/30 dark:bg-stone-500/18 dark:text-stone-300 dark:border-stone-500/30'
  };
};
