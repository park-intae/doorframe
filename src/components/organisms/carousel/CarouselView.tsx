import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CarouselViewProps {
    index: number;
    direction: number;
    total: number;
    children: React.ReactNode[];
    onPaginate: (newDirection: number) => void;
}

export default function CarouselView({ index, direction, total, children, onPaginate }: CarouselViewProps) {
    const isAnimating = React.useRef(false);

    const handlePaginate = (newDirection: number) => {
        if (isAnimating.current) return;
        
        onPaginate(newDirection);
        isAnimating.current = true;
        setTimeout(() => {
            isAnimating.current = false;
        }, 500);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (e.deltaY > 20 && index < total - 1) {
            handlePaginate(1);
        } else if (e.deltaY < -20 && index > 0) {
            handlePaginate(-1);
        }
    };

    return (
        <div className="relative w-full h-full" onWheel={handleWheel}>
            <div className="w-full h-full overflow-hidden">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={index}
                        custom={direction}
                        initial={{ y: direction > 0 ? '20%' : '-20%', opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: direction > 0 ? '-20%' : '20%', opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 200, damping: 25 }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        onDragEnd={(e, { offset }) => {
                            if (Math.abs(offset.y) > 50) {
                                handlePaginate(offset.y > 0 ? -1 : 1);
                            }
                        }}
                        className="absolute w-full h-full"
                    >
                        {children[index]}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* 글래스모피즘 인디케이터 (캐러셀 외부 우측 배치) */}
            <div className="absolute -right-10 top-1/2 -translate-y-1/2 flex flex-col justify-center gap-3 z-10 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
                {Array.from({ length: total }).map((_, i) => (
                    <button 
                        key={i}
                        onClick={() => onPaginate(i - index)} 
                        aria-label={`${i + 1}번째 슬라이드로 이동`}
                        aria-current={index === i ? 'page' : undefined}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === i 
                                ? 'bg-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.8)]' 
                                : 'bg-white/40 hover:bg-white/60'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
