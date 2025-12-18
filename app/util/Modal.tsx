import { ReactNode } from "react";

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
    if (!isOpen) return null;

    return (
        <div
            className="background fixed inset-0 bg-black bg-opacity-50 flex item-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="modal bg-white rounded-lg p-5 max-w-full mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                {(title || showCloseButton) && (
                    <div>
                        {title && <h3>{title}</h3>}
                    </div>
                )}

            </div>
        </div>
    )
}