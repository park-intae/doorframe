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
    const [position, setPosition] = useState<{ top: number; bottom: number; left: number } | null>(null);

    useEffect(() => {
        if (isOpen && anchorRect) {
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
        } else {
            setPosition(null);
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

    if (!isOpen || !position) return null;

    return (
        <div
            ref={popoverRef}
            className="popoverDiv fixed p-3 rounded-lg bg-background transition-opacity duration-150"
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