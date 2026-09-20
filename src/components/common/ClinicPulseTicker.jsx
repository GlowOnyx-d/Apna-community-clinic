import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  Stethoscope, 
  Ticket, 
  Award
} from 'lucide-react';

export default function ClinicPulseTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const updates = [
    {
      id: 1,
      badge: 'Clinic Status',
      badgeColor: 'bg-[#2D6A4F]/15 text-[#2D6A4F] dark:bg-[#2D6A4F]/25 dark:text-[#52B788] border-[#2D6A4F]/30',
      icon: Clock,
      title: 'Main Clinic Active Today',
      description: 'Open 8:00 AM – 8:00 PM • Digital queue tokens & priority pediatric triaging active',
      ctaText: 'Book Token',
      ctaLink: '/register'
    },
    {
      id: 2,
      badge: 'Live Queue',
      badgeColor: 'bg-[#C97B4A]/15 text-[#B35F2B] dark:text-[#C97B4A] border-[#C97B4A]/30',
      icon: Ticket,
      title: 'Real-Time Queue Wait: ~10 Mins',
      description: 'Zero crowded waiting rooms • Receive immediate digital token slips on your device',
      ctaText: 'Get Token',
      ctaLink: '/register'
    },
    {
      id: 3,
      badge: 'Doctor Availability',
      badgeColor: 'bg-[#2D6A4F]/15 text-[#2D6A4F] dark:bg-[#2D6A4F]/25 dark:text-[#52B788] border-[#2D6A4F]/30',
      icon: Stethoscope,
      title: 'Specialists Consulting Today',
      description: 'General Medicine, Pediatrics & Diagnostic consultants in Cabins 101–104',
      ctaText: 'View Schedule',
      ctaLink: '/register'
    },
    {
      id: 4,
      badge: 'SDG 3 Health Camp',
      badgeColor: 'bg-[#C97B4A]/15 text-[#B35F2B] dark:text-[#C97B4A] border-[#C97B4A]/30',
      icon: Award,
      title: 'Free Community Health Camp',
      description: 'Blood pressure, glucose checks & maternal wellness • UN Sustainable Development Goal 3',
      ctaText: 'Camp Details',
      ctaLink: '/announcements'
    }
  ];

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % updates.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, updates.length]);

  const current = updates[currentIndex];
  const Icon = current.icon;

  return (
    <div 
      className="bg-[#F0EBE1] dark:bg-[#1E231E] border-b border-[#E6DFC6] dark:border-[#2D352C] transition-colors"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1.5 sm:py-2.5">
        <div className="flex items-center justify-between gap-2 sm:gap-3 text-xs">
          
          {/* Live Indicator Beacon */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2D6A4F] dark:bg-[#52B788] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-[#2D6A4F] dark:bg-[#52B788]"></span>
            </span>
            <span className="font-bold text-[10px] sm:text-[11px] uppercase tracking-wider text-[#2D6A4F] dark:text-[#52B788] hidden sm:inline">
              Live Clinic Pulse
            </span>
          </div>

          {/* Ticker Content */}
          <div className="flex-1 flex items-center justify-start gap-2 min-w-0 overflow-hidden">
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 rounded-md text-[10px] font-bold border shrink-0 ${current.badgeColor}`}>
              <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>{current.badge}</span>
            </span>

            <span className="font-bold text-[#22291F] dark:text-[#F5F1EA] text-[11px] sm:text-xs truncate">
              {current.title}
            </span>

            <span className="text-[#6B6B63] dark:text-[#9EAA9A] hidden md:inline truncate">
              — {current.description}
            </span>
          </div>

          {/* Controls & Action */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link
              to={current.ctaLink}
              className="inline-flex items-center gap-0.5 sm:gap-1 font-bold text-[#2D6A4F] dark:text-[#52B788] hover:underline text-[10px] sm:text-[11px]"
            >
              <span>{current.ctaText}</span>
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Link>

            {/* Arrows only on tablet and desktop */}
            <div className="hidden sm:flex items-center border-l border-[#E6DFC6] dark:border-[#2D352C] pl-2 ml-1">
              <button
                onClick={() => setCurrentIndex((prev) => (prev - 1 + updates.length) % updates.length)}
                className="p-1 rounded text-[#6B6B63] hover:text-[#22291F] dark:text-[#9EAA9A] dark:hover:text-[#F5F1EA] hover:bg-[#E6DFC6]/50 dark:hover:bg-[#2D352C] transition-colors cursor-pointer"
                aria-label="Previous update"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % updates.length)}
                className="p-1 rounded text-[#6B6B63] hover:text-[#22291F] dark:text-[#9EAA9A] dark:hover:text-[#F5F1EA] hover:bg-[#E6DFC6]/50 dark:hover:bg-[#2D352C] transition-colors cursor-pointer"
                aria-label="Next update"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
