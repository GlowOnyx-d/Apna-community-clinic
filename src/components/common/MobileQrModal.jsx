import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Copy, 
  Check, 
  HeartHandshake,
  Wifi,
  Settings2
} from 'lucide-react';
import QRCodeImage from './QRCodeImage';
import { getMobileReachableUrl } from '../../utils/networkUrl';

export default function MobileQrModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [customIp, setCustomIp] = useState('192.168.1.6');
  const [showIpConfig, setShowIpConfig] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent background scrolling while modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const mobileUrl = useMemo(() => {
    return getMobileReachableUrl(customIp);
  }, [customIp]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(mobileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#1E231E] rounded-3xl max-w-sm w-full border border-[#E6DFC6] dark:border-[#2D352C] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-center relative"
        onClick={(e) => e.stopPropagation()} // Prevent click inside from closing
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E6DFC6] dark:border-[#2D352C] bg-[#FAF7F2] dark:bg-[#161916]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#2D6A4F] text-[#FAF7F2] flex items-center justify-center shadow-xs">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#22291F] dark:text-[#F5F1EA] font-heading">
              Open on Smartphone
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B6B63] hover:text-[#22291F] dark:text-[#9EAA9A] dark:hover:text-[#F5F1EA] rounded-xl hover:bg-[#E6DFC6]/50 dark:hover:bg-[#222722] transition-colors cursor-pointer"
            title="Close (or press Esc)"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-3.5">
          <div className="space-y-1">
            <p className="text-xs text-[#6B6B63] dark:text-[#9EAA9A] leading-relaxed">
              Connect your phone to the <strong>same Wi-Fi network</strong> and point your camera at this QR code.
            </p>
          </div>

          {/* Crisp QR Code Container */}
          <div className="flex justify-center my-1">
            <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-[#2D6A4F]/30 shadow-md inline-block">
              <QRCodeImage 
                value={mobileUrl} 
                size={160} 
                darkColor="#1A1D19" 
                lightColor="#FFFFFF"
                alt="Clinic Mobile Portal QR Code"
              />
            </div>
          </div>

          {/* Wi-Fi Indicator Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] dark:bg-[#2D6A4F]/20 dark:text-[#52B788] text-[11px] font-bold">
            <Wifi className="w-3.5 h-3.5" />
            <span>Wi-Fi LAN: {customIp}:5173</span>
          </div>

          {/* Copy Link Bar */}
          <div className="p-2.5 bg-[#FAF7F2] dark:bg-[#161916] rounded-xl border border-[#E6DFC6] dark:border-[#2D352C] flex items-center justify-between gap-2 text-xs">
            <span className="text-[#6B6B63] dark:text-[#9EAA9A] font-mono truncate text-[11px] select-all pl-1">
              {mobileUrl}
            </span>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs ${
                copied 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-[#2D6A4F] hover:bg-[#23543E] text-white'
              }`}
              title="Copy mobile URL to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* Advanced Wi-Fi IP Config Toggle */}
          {isLocalhost && (
            <div className="pt-1 text-[11px]">
              <button
                type="button"
                onClick={() => setShowIpConfig(!showIpConfig)}
                className="text-[#6B6B63] dark:text-[#9EAA9A] hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <Settings2 className="w-3 h-3" />
                <span>{showIpConfig ? 'Hide IP settings' : 'Different Wi-Fi IP?'}</span>
              </button>

              {showIpConfig && (
                <div className="mt-2 p-2 bg-[#FAF7F2] dark:bg-[#161916] rounded-xl border border-[#E6DFC6] dark:border-[#2D352C] space-y-1.5 text-left">
                  <label className="text-[10px] text-[#6B6B63] dark:text-[#9EAA9A] block">
                    Enter your computer's Wi-Fi IPv4:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customIp}
                      onChange={(e) => setCustomIp(e.target.value.trim())}
                      placeholder="e.g. 192.168.1.6"
                      className="flex-1 px-2.5 py-1 text-xs border rounded-lg bg-white dark:bg-[#1A1D19] border-[#E6DFC6] dark:border-[#2D352C] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomIp('192.168.1.6')}
                      className="px-2 py-1 text-[10px] bg-white dark:bg-[#222722] border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 border-t border-[#E6DFC6] dark:border-[#2D352C] bg-[#FAF7F2] dark:bg-[#161916] flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-[#222722] hover:bg-[#F0EBE1] dark:hover:bg-[#2A312A] text-[#22291F] dark:text-[#F5F1EA] border border-[#D8CEB3] dark:border-[#2D352C] text-xs font-bold transition-colors cursor-pointer"
          >
            Done / Close
          </button>
        </div>

      </div>
    </div>
  );

  // Mount directly onto document.body so that fixed positioning is truly viewport-relative
  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
