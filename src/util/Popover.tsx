import { ReactNode, useEffect, useRef, useState } from "react";

type PopoverPlacement = 'top' | 'bottom'

interface PopoverProps {
    isOpen: boolean;
    onClose: () => void;
    anchorRect?: DOMRect | null;
    children: ReactNode;
    width?: number;
    placement?: PopoverPlacement;
}

export default function Popover({
    isOpen,
    onClose,
    anchorRect,
    children,
    width = 320,
    placement = 'bottom',
}: PopoverProps) {
    const popoverRef = useRef<HTMLDivElement>(null);
    // 위치 계산 로직을 렌더링 중 계산하도록 수정하여 동기적 setState 방지
    const getPosition = () => {
        if (!isOpen || !anchorRect) return null;

        let left = anchorRect.left + (anchorRect.width / 2) - (width / 2);

        if (left < 10) left = 10;
        if (left + width > window.innerWidth - 10) left = window.innerWidth - width - 10;

        if (placement === 'top') {
            const bottom = window.innerHeight - anchorRect.top + 10;
            return { bottom, left, top: 0 };
        } else {
            const top = anchorRect.bottom + 10;
            return { top, left, bottom: 0 };
        }
    };

    const position = getPosition();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 0);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, onClose]);

    useEffect(() => {
        const handleEscae = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscae);
        };

        return () => {
            document.removeEventListener('keydown', handleEscae);
        };
    }, [isOpen, onClose])

    if (!isOpen || !position) return null;

    return (
        <div
            ref={popoverRef}
            className="fixed p-3 transition-opacity duration-150 z-[9999] glass"
            style={{
                ...(placement === 'top'
                    ? { bottom: `${position.bottom}px` }
                    : { top: `${position.top}px` }
                ),
                left: `${position.left}px`,
                width: `${width}px`,
            }}
        >
            {children}
        </div>
    )
}