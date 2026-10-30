import React from 'react';
import { createPortal } from 'react-dom';
import { Cloud, CheckCircle, ShieldCheck, RefreshCw } from 'lucide-react';

export default function StorageModal({ onConnect, onSkip, isConnecting }) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#121C21] rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 border border-[#E0E7E5] dark:border-[#21333A] relative">
        <div className="flex items-center justify-center w-16 h-16 bg-[#0F766E]/15 dark:bg-[#0D9488]/20 border border-[#0F766E]/30 dark:border-[#2DD4BF]/30 text-[#0F766E] dark:text-[#2DD4BF] rounded-2xl mx-auto mb-5 shadow-xs">
          <Cloud className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-[#132226] dark:text-[#F4F7F6] text-center mb-2 font-heading">
          Cloud Database &amp; Secure Sync
        </h2>
        <p className="text-[#5A7178] dark:text-[#9DB4BA] text-sm text-center mb-6 leading-relaxed">
          Apna Community Clinic is connected to Cloud Firestore. All patient records, specialist schedules, and live token queues are securely synchronized in real-time across all devices.
        </p>

        <div className="space-y-3 mb-6 bg-[#F4F7F6] dark:bg-[#19272D] p-4 rounded-xl border border-[#E0E7E5] dark:border-[#21333A] text-xs text-[#5A7178] dark:text-[#9DB4BA]">
          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF] flex-shrink-0 mt-0.5" />
            <span><strong className="text-[#132226] dark:text-[#F4F7F6]">Encrypted Cloud Ledger:</strong> Clinical data is secured in Google Cloud Firestore with real-time replication.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <RefreshCw className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF] flex-shrink-0 mt-0.5" />
            <span><strong className="text-[#132226] dark:text-[#F4F7F6]">Real-Time Multi-Device:</strong> Queue calling, token booking, and doctor consultations sync instantly.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF] flex-shrink-0 mt-0.5" />
            <span><strong className="text-[#132226] dark:text-[#F4F7F6]">Secure Backups:</strong> Administrators can export portable encrypted JSON snapshots anytime.</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onSkip || onConnect}
            className="flex-1 bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-[#F4F7F6] font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm text-sm cursor-pointer"
          >
            <Cloud className="w-4 h-4" />
            Connected to Cloud Firestore
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
