import React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function Toast() {
  const { toastMessage } = useData();

  if (!toastMessage) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#2D6A4F] dark:text-[#52B788] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[#B35F2B] dark:text-[#E58A54] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#2D6A4F] dark:text-[#52B788] shrink-0" />
  };

  const borderColors = {
    success: 'border-[#2D6A4F]/40 bg-white dark:bg-[#1C221C] text-[#22291F] dark:text-[#FAF7F2] shadow-xl',
    error: 'border-[#C97B4A]/50 bg-white dark:bg-[#1C221C] text-[#22291F] dark:text-[#FAF7F2] shadow-xl',
    info: 'border-[#E6DFC6] dark:border-[#2F3B2F] bg-white dark:bg-[#1C221C] text-[#22291F] dark:text-[#FAF7F2] shadow-xl'
  };

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[99999] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${borderColors[toastMessage.type] || borderColors.info}`}>
        {icons[toastMessage.type] || icons.info}
        <p className="text-sm font-medium">{toastMessage.message}</p>
      </div>
    </div>,
    document.body
  );
}
