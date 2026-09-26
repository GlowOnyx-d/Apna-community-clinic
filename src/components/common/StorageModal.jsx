import React from 'react';
import { createPortal } from 'react-dom';
import { Cloud, CheckCircle, ShieldCheck, RefreshCw } from 'lucide-react';

export default function StorageModal({ onConnect, onSkip, isConnecting }) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1C221C] rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 border border-[#E6DFC6] dark:border-[#2F3B2F] relative">
        <div className="flex items-center justify-center w-16 h-16 bg-[#2D6A4F]/15 dark:bg-[#357A5B]/20 border border-[#2D6A4F]/30 dark:border-[#52B788]/30 text-[#2D6A4F] dark:text-[#52B788] rounded-2xl mx-auto mb-5 shadow-xs">
          <Cloud className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-[#22291F] dark:text-[#FAF7F2] text-center mb-2 font-heading">
          Cloud Database &amp; Secure Sync
        </h2>
        <p className="text-[#6B6B63] dark:text-[#C4CFC3] text-sm text-center mb-6 leading-relaxed">
          Apna Community Clinic is connected to Cloud Firestore. All patient records, specialist schedules, and live token queues are securely synchronized in real-time across all devices.
        </p>

        <div className="space-y-3 mb-6 bg-[#FAF7F2] dark:bg-[#242C24] p-4 rounded-xl border border-[#E6DFC6] dark:border-[#2F3B2F] text-xs text-[#6B6B63] dark:text-[#C4CFC3]">
          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788] flex-shrink-0 mt-0.5" />
            <span><strong className="text-[#22291F] dark:text-[#FAF7F2]">Encrypted Cloud Ledger:</strong> Clinical data is secured in Google Cloud Firestore with real-time replication.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <RefreshCw className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788] flex-shrink-0 mt-0.5" />
            <span><strong className="text-[#22291F] dark:text-[#FAF7F2]">Real-Time Multi-Device:</strong> Queue calling, token booking, and doctor consultations sync instantly.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788] flex-shrink-0 mt-0.5" />
            <span><strong className="text-[#22291F] dark:text-[#FAF7F2]">Secure Backups:</strong> Administrators can export portable encrypted JSON snapshots anytime.</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onSkip || onConnect}
            className="flex-1 bg-[#2D6A4F] hover:bg-[#245740] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm text-sm cursor-pointer"
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
