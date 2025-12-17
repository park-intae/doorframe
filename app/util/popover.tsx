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
    const [position, setPosition] = useState({ top: 0, bottom: 0, left: 0 });

    useEffect(() => {
        if (isOpen && popoverRef.current && anchorRect) {
            let left = anchorRect.left + (anchorRect.width / 2) - (width / 2);

            // 좌우 경계
            if (left < 10) {
                left = 10
            }

            if (left + width > window.innerWidth - 10) {
                left = window.innerWidth - width - 10
            }

            //세로 기준 위치
            if (placement === 'top') {
                const bottom = window.innerHeight - anchorRect.top + 5
                setPosition({ bottom, left, top: 0 })
            } else {
                const top = anchorRect.bottom + 5;
                setPosition({ top, left, bottom: 0 })
            }
        }
    }, [isOpen, anchorRect, width, placement])

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

    if (!isOpen) return null;

    return (
        <div
            ref={popoverRef}
            className="popoverDiv fixed min-h-30 p-3 rounded-lg border bg-white"
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