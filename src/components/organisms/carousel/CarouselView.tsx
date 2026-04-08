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
    const [isAnimating, setIsAnimating] = useState(false);

    const handleWheel = (e: React.WheelEvent) => {
        if (isAnimating) return;
        
        // 휠을 아래로 굴리면 index 증가, 위로 굴리면 감소
        if (e.deltaY > 20 && index < total - 1) {
            onPaginate(1);
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 500); // 휠 전환 쿨타임
        } else if (e.deltaY < -20 && index > 0) {
            onPaginate(-1);
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 500);
        }
    };

    return (
        <div className="relative w-full h-full overflow-hidden" onWheel={handleWheel}>
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={index}
                    custom={direction}
                    initial={{ y: direction > 0 ? '100%' : '-100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: direction > 0 ? '-100%' : '100%', opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    onDragEnd={(e, { offset }) => {
                        if (Math.abs(offset.y) > 50) {
                            onPaginate(offset.y > 0 ? -1 : 1);
                        }
                    }}
                    className="absolute w-full h-full"
                >
                    {children[index]}
                </motion.div>
            </AnimatePresence>

            {/* 글래스모피즘 인디케이터 */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col justify-center gap-3 z-10 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
                {Array.from({ length: total }).map((_, i) => (
                    <button 
                        key={i}
                        onClick={() => onPaginate(i - index)} 
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
