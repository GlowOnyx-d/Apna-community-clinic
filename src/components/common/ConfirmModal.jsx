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
      iconBg: 'bg-[#A85222]/10 dark:bg-[#E58A54]/20 text-[#A85222] dark:text-[#E58A54] border border-[#A85222]/20',
      confirmBtn: 'bg-[#A85222] hover:bg-[#91451C] dark:bg-[#E58A54] dark:hover:bg-[#d97c45] text-white dark:text-[#151915]'
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
      iconBg: 'bg-[#2D6A4F]/10 text-[#2D6A4F] dark:bg-[#52B788]/20 dark:text-[#52B788] border border-[#2D6A4F]/20',
      confirmBtn: 'bg-[#2D6A4F] hover:bg-[#23543E] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-white'
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
        className="bg-white dark:bg-[#1C221C] rounded-3xl border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-2xl p-7 sm:p-8 max-w-md w-full text-center relative animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close "X" button in top-right */}
        {!loading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-[#8E8E84] hover:text-[#22291F] dark:text-[#94A493] dark:hover:text-[#FAF7F2] hover:bg-[#FAF7F2] dark:hover:bg-[#242C24] transition-colors cursor-pointer"
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
          className="text-xl sm:text-2xl font-black text-[#22291F] dark:text-[#FAF7F2] font-heading tracking-tight mb-2.5 px-2"
        >
          {title}
        </h3>

        {/* Message Body with Comfortable Line Height and Margin */}
        <p className="text-sm text-[#52584E] dark:text-[#C4CFC3] leading-relaxed max-w-sm mx-auto mb-7 px-1">
          {message}
        </p>

        {/* Two-Button Action Cluster with Balanced Spacing */}
        <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-[#E6DFC6]/70 dark:border-[#2F3B2F]">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl border border-[#D8CEB3] dark:border-[#445644] text-[#52584E] hover:text-[#22291F] dark:text-[#C4CFC3] dark:hover:text-[#FAF7F2] bg-[#FAF7F2] dark:bg-[#242C24] hover:bg-[#E6DFC6]/50 text-xs sm:text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
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
