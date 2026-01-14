
import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  footer,
  maxWidth = 'max-w-3xl' 
}) => {
  if (!isOpen) return null;

  // Use createPortal to render the modal outside the current DOM hierarchy (e.g., inside 'main')
  // This solves issues where parent transforms (like animations) break 'position: fixed'.
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`bg-slate-50 w-full ${maxWidth} max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-200 border border-slate-200`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              {title}
            </h3>
            {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-white border-t border-slate-200 flex gap-3 justify-end shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
