import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { getPatientAvatar } from '../../utils/patientVisuals';

/**
 * PatientAvatar component
 * Renders patient profile photo with guaranteed initials fallback (e.g. "RS" or "HC")
 * or generic User icon. Prevents broken images or black boxes when an image URL fails to load.
 */
export default function PatientAvatar({
  patient,
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  showBorder = true
}) {
  const [imgError, setImgError] = useState(false);

  const name = typeof patient === 'string' ? patient : (patient?.patientName || patient?.name || 'Patient');
  const gender = typeof patient === 'object' ? (patient?.patientGender || patient?.gender || '') : '';
  const photoUrl = getPatientAvatar(patient);

  // Reset imgError if photoUrl changes
  useEffect(() => {
    setImgError(false);
  }, [photoUrl]);

  // Compute initials (e.g. "Riya Sen" -> "RS", "Harish Chandra" -> "HC")
  const cleanName = (name || 'Patient').trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : cleanName.slice(0, 2).toUpperCase();

  const isMale = (gender || '').toLowerCase() === 'male';

  const sizeClasses = {
    sm: 'w-8 h-8 text-[11px]',
    md: 'w-11 h-11 text-xs',
    lg: 'w-14 h-14 text-sm font-bold'
  }[size] || 'w-11 h-11 text-xs';

  const borderClass = showBorder ? 'border border-[#CFDAD6] dark:border-[#2C444E]' : '';

  // If image errored or no photo is available, render clean initials or icon placeholder badge
  if (imgError || !photoUrl) {
    return (
      <div
        className={`${sizeClasses} rounded-xl shrink-0 flex items-center justify-center font-bold select-none ${borderClass} ${
          isMale
            ? 'bg-[#0F766E]/15 dark:bg-[#2DD4BF]/20 text-[#0F766E] dark:text-[#2DD4BF]'
            : 'bg-[#F97316]/15 dark:bg-[#FB923C]/20 text-[#EA580C] dark:text-[#FB923C]'
        } ${className}`}
        title={name}
      >
        {initials ? (
          <span className="tracking-wide">{initials}</span>
        ) : (
          <User className="w-1/2 h-1/2 opacity-75" />
        )}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses} rounded-xl overflow-hidden shrink-0 shadow-xs relative bg-[#F4F7F6] dark:bg-[#19272D] ${borderClass} ${className}`}>
      <img
        src={photoUrl}
        alt={name}
        className="w-full h-full object-cover object-top"
        onError={() => setImgError(true)}
      />
    </div>
  );
}
