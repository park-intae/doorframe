import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CarouselViewProps {
    index: number;
    direction: number;
    total: number;
    children: React.ReactNode[];
    onPaginate: (newDirection: number) => void;
}

export default function CarouselView({ index, direction, total, children, onPaginate }: CarouselViewProps) {
    return (
        <div className="relative w-full h-full overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={index}
                    custom={direction}
                    initial={{ y: direction > 0 ? '100%' : '-100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: direction > 0 ? '-100%' : '100%', opacity: 0 }}
                    transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    onDragEnd={(e, { offset, velocity }) => {
                        const swipe = Math.abs(offset.y) > 50;
                        if (swipe) {
                            onPaginate(offset.y > 0 ? -1 : 1);
                        }
                    }}
                    className="absolute w-full h-full"
                >
                    {children[index]}
                </motion.div>
            </AnimatePresence>

            {/* 컨트롤 버튼 및 페이지네이션 점 - 글래스모피즘 적용 */}
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
