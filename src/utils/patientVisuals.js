/**
 * Visual styling and avatar helpers for clinic patients.
 * Provides verified portrait photos and resilient SVG avatar fallbacks.
 */

export const PATIENT_PHOTO_MAP = {
  // Harish Chandra (Senior Male - 62y)
  'harish chandra': '/patients/harish_chandra.jpg',
  'usr_patient_harish': '/patients/harish_chandra.jpg',
  'harish': '/patients/harish_chandra.jpg',

  // Riya Sen (Young Girl - 6y)
  'riya sen': '/patients/riya_sen.jpg',
  'usr_patient_riya': '/patients/riya_sen.jpg',
  'riya': '/patients/riya_sen.jpg',

  // Maya Sharma (Female - 28y)
  'maya sharma': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'usr_patient_maya': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',

  // Ramesh Kumar (Male - 45y)
  'ramesh kumar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'usr_patient_ramesh': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',

  // Sunita Devi (Female - 52y)
  'sunita devi': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'usr_patient_sunita': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',

  // Vikram Singh (Male - 34y)
  'vikram singh': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'usr_patient_vikram': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
};

/**
 * Returns an illustrated SVG data URI for patients without a photo.
 */
export const getPatientFallbackAvatar = (name = 'Patient', gender = 'Female') => {
  const cleanName = (name || 'Patient').trim();
  const initial = (cleanName[0] || 'P').toUpperCase();
  const isMale = (gender || '').toLowerCase() === 'male';

  const bgColor = isMale ? '#2D6A4F' : '#C97B4A';
  const lightBg = isMale ? '#EAF3EE' : '#FDF4ED';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <circle cx="50" cy="50" r="48" fill="${lightBg}" stroke="${bgColor}" stroke-width="2"/>
    <circle cx="50" cy="40" r="18" fill="${bgColor}"/>
    <path d="M22 84c0-18 12-28 28-28s28 10 28 28" fill="${bgColor}" opacity="0.85"/>
    <text x="50" y="46" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${initial}</text>
  </svg>`.replace(/\n\s*/g, '');

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Returns the best available avatar photo URL or fallback illustrated SVG for a patient.
 * Accepts appointment object or patient name.
 */
export const getPatientAvatar = (item) => {
  if (!item) return getPatientFallbackAvatar('Patient');

  // If item is string (name or id)
  if (typeof item === 'string') {
    const key = item.toLowerCase().trim();
    if (PATIENT_PHOTO_MAP[key]) return PATIENT_PHOTO_MAP[key];
    return getPatientFallbackAvatar(item);
  }

  // Intercept broken neon sign photo URL for Riya Sen
  const rawAvatar = item.patientAvatar || item.avatar || '';
  if (rawAvatar && rawAvatar.includes('photo-1543332164-6e82f355badc')) {
    return '/patients/riya_sen.jpg';
  }
  if (rawAvatar && rawAvatar.includes('photo-1544717305-2782549b5136')) {
    return '/patients/harish_chandra.jpg';
  }

  // Check explicit patientAvatar field
  if (item.patientAvatar && item.patientAvatar.trim() !== '') {
    return item.patientAvatar;
  }
  if (item.avatar && item.avatar.trim() !== '') {
    return item.avatar;
  }

  // Lookup by patientId
  if (item.patientId && PATIENT_PHOTO_MAP[item.patientId.toLowerCase()]) {
    return PATIENT_PHOTO_MAP[item.patientId.toLowerCase()];
  }

  // Lookup by patientName
  const cleanName = (item.patientName || '').toLowerCase().trim();
  if (cleanName && PATIENT_PHOTO_MAP[cleanName]) {
    return PATIENT_PHOTO_MAP[cleanName];
  }

  // Partial match check
  for (const [key, url] of Object.entries(PATIENT_PHOTO_MAP)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      return url;
    }
  }

  return getPatientFallbackAvatar(item.patientName || 'Patient', item.patientGender);
};
