import { X } from "lucide-react";
import { ReactNode, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    showCloseButton?: boolean
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    showCloseButton = true
}: ModalProps) {
    const [mounted] = useState(true);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div
            className="background fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] transition-opacity"
            onClick={onClose}
        >
            <div
                className="modal bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-[28px] shadow-2xl p-8 max-w-full w-[450px] m-5 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {(title || showCloseButton) && (
                    <div className="flex flex-row justify-between items-center mb-6">
                        {title && <h3 className="text-xl font-bold text-title">{title}</h3>}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                aria-label="모달 닫기"
                                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-context hover:text-delete transition-all active:scale-90"
                            >
                                <X className="w-5 h-5" aria-hidden="true" />
                            </button>
                        )}
                    </div>
                )}
                <div className="modal-content">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    )
}