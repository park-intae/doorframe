import { X } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div
            className="background fixed inset-0 bg-black/50 flex items-center justify-center z-[999]"
            onClick={onClose}
        >
            <div className="flex justify-center items-center bg-background rounded-lg">
                <div
                    className="modal bg-white rounded-lg p-5 max-w-full w-100 m-5"
                    onClick={(e) => e.stopPropagation()}
                >
                    {(title || showCloseButton) && (
                        <div className="flex flex-row justify-between items-center mb-4">
                            {title && <h3>{title}</h3>}
                            {showCloseButton && (
                                <button
                                    onClick={onClose}
                                    className="bg-red-500 text-white rounded hover:"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    )}
                    {children}
                </div>
            </div>
        </div>,
        document.body
    )
}