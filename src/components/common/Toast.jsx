import React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function Toast() {
  const { toastMessage } = useData();

  if (!toastMessage) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#0F766E] dark:text-[#2DD4BF] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[#EA580C] dark:text-[#FB923C] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#0F766E] dark:text-[#2DD4BF] shrink-0" />
  };

  const borderColors = {
    success: 'border-[#0F766E]/40 bg-white dark:bg-[#121C21] text-[#132226] dark:text-[#F4F7F6] shadow-xl',
    error: 'border-[#F97316]/50 bg-white dark:bg-[#121C21] text-[#132226] dark:text-[#F4F7F6] shadow-xl',
    info: 'border-[#E0E7E5] dark:border-[#21333A] bg-white dark:bg-[#121C21] text-[#132226] dark:text-[#F4F7F6] shadow-xl'
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
