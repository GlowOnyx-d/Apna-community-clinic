import React from 'react';
import { FolderPlus, HardDrive, CheckCircle, ShieldCheck } from 'lucide-react';

export default function StorageModal({ onConnect, onSkip, isConnecting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#222722] rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 border border-[#E6DFC6] dark:border-[#2D352C] relative">
        <div className="flex items-center justify-center w-16 h-16 bg-[#2D6A4F]/15 border border-[#2D6A4F]/30 text-[#2D6A4F] dark:text-[#52B788] rounded-2xl mx-auto mb-5 shadow-xs">
          <FolderPlus className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-[#22291F] dark:text-[#F5F1EA] text-center mb-2 font-heading">
          Connect Local Storage Folder
        </h2>
        <p className="text-[#6B6B63] dark:text-[#9EAA9A] text-sm text-center mb-6 leading-relaxed">
          Apna Community Clinic operates 100% locally. Connect a local folder (e.g., <code className="bg-[#FAF7F2] dark:bg-[#1A1D19] border border-[#E6DFC6] dark:border-[#2D352C] text-[#2D6A4F] dark:text-[#52B788] px-1.5 py-0.5 rounded font-mono text-xs">local-data</code>) to store your clinical appointments, doctors, and patient records directly as real JSON files on your device.
        </p>

        <div className="space-y-3 mb-6 bg-[#FAF7F2] dark:bg-[#1A1D19] p-4 rounded-xl border border-[#E6DFC6] dark:border-[#2D352C] text-xs text-[#6B6B63] dark:text-[#9EAA9A]">
          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788] flex-shrink-0 mt-0.5" />
            <span><strong className="text-[#22291F] dark:text-[#F5F1EA]">Zero Cloud / Zero Server:</strong> All data stays private and stored directly on your disk.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <HardDrive className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788] flex-shrink-0 mt-0.5" />
            <span><strong className="text-[#22291F] dark:text-[#F5F1EA]">Auto-Saved to JSON:</strong> Saves to <code className="font-mono text-[#2D6A4F] dark:text-[#52B788]">users.json</code>, <code className="font-mono text-[#2D6A4F] dark:text-[#52B788]">appointments.json</code>, and <code className="font-mono text-[#2D6A4F] dark:text-[#52B788]">doctors.json</code>.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788] flex-shrink-0 mt-0.5" />
            <span><strong className="text-[#22291F] dark:text-[#F5F1EA]">Persistent Access:</strong> Browser remembers folder permission across sessions.</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onConnect}
            disabled={isConnecting}
            className="flex-1 bg-[#2D6A4F] hover:bg-[#245740] text-[#FAF7F2] font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 text-sm cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            {isConnecting ? 'Connecting...' : 'Choose Data Folder'}
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="px-4 py-3 rounded-xl border border-[#D8CEB3] dark:border-[#2D352C] text-[#6B6B63] dark:text-[#9EAA9A] hover:text-[#22291F] dark:hover:text-[#F5F1EA] hover:bg-[#FAF7F2] dark:hover:bg-[#1A1D19] font-medium text-sm transition-colors cursor-pointer"
          >
            Use Browser Storage
          </button>
        </div>
      </div>
    </div>
  );
}
