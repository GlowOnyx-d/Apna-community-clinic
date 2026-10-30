import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

/**
 * Shared, Viewport-Centered Confirmation Modal Component
 * 
 * - Rendered directly onto document.body via createPortal to guarantee
 *   true viewport vertical & horizontal centering, immune to header backdrop-filters.
 * - Generous breathing room, polished typography, and smooth animations.
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // 'warning' | 'danger' | 'info' | 'logout'
  loading = false,
  icon: CustomIcon
}) {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Icon and tone styling based on type
  const typeConfig = {
    logout: {
      Icon: LogOut,
      iconBg: 'bg-[#EA580C]/10 dark:bg-[#FB923C]/20 text-[#EA580C] dark:text-[#FB923C] border border-[#EA580C]/20',
      confirmBtn: 'bg-[#EA580C] hover:bg-[#C2410C] dark:bg-[#FB923C] dark:hover:bg-[#d97c45] text-white dark:text-[#0B1114]'
    },
    danger: {
      Icon: AlertCircle,
      iconBg: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20',
      confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white'
    },
    warning: {
      Icon: AlertTriangle,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20',
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white'
    },
    info: {
      Icon: Info,
      iconBg: 'bg-[#0F766E]/10 text-[#0F766E] dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF] border border-[#0F766E]/20',
      confirmBtn: 'bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-white'
    }
  };

  const config = typeConfig[type] || typeConfig.warning;
  const DisplayIcon = CustomIcon || config.Icon;

  const modalMarkup = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => !loading && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="bg-white dark:bg-[#121C21] rounded-3xl border border-[#E0E7E5] dark:border-[#21333A] shadow-2xl p-7 sm:p-8 max-w-md w-full text-center relative animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close "X" button in top-right */}
        {!loading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-[#758D94] hover:text-[#132226] dark:text-[#79949B] dark:hover:text-[#F4F7F6] hover:bg-[#F4F7F6] dark:hover:bg-[#19272D] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Prominent Header Icon with Generous Spacing */}
        <div className={`w-16 h-16 rounded-2xl ${config.iconBg} flex items-center justify-center mx-auto mb-5 shadow-xs`}>
          <DisplayIcon className="w-8 h-8" />
        </div>

        {/* Title with Proper Breathing Padding */}
        <h3
          id="confirm-modal-title"
          className="text-xl sm:text-2xl font-black text-[#132226] dark:text-[#F4F7F6] font-heading tracking-tight mb-2.5 px-2"
        >
          {title}
        </h3>

        {/* Message Body with Comfortable Line Height and Margin */}
        <p className="text-sm text-[#455A60] dark:text-[#9DB4BA] leading-relaxed max-w-sm mx-auto mb-7 px-1">
          {message}
        </p>

        {/* Two-Button Action Cluster with Balanced Spacing */}
        <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-[#E0E7E5]/70 dark:border-[#21333A]">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl border border-[#CFDAD6] dark:border-[#2C444E] text-[#455A60] hover:text-[#132226] dark:text-[#9DB4BA] dark:hover:text-[#F4F7F6] bg-[#F4F7F6] dark:bg-[#19272D] hover:bg-[#E0E7E5]/50 text-xs sm:text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${config.confirmBtn}`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalMarkup, document.body) : null;
}
