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
                    initial={{ x: direction > 0 ? '100%' : '-100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: direction > 0 ? '-100%' : '100%', opacity: 0 }}
                    transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                    className="absolute w-full h-full"
                >
                    {children[index]}
                </motion.div>
            </AnimatePresence>

            {/* 컨트롤 버튼: 하단 고정 */}
            <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 z-10">
                <button 
                    onClick={() => onPaginate(-1)} 
                    disabled={index === 0} 
                    className='text-context/50 hover:text-point'
                >
                    ◀
                </button>
                <div className="text-xs text-context">{index + 1} / {total}</div>
                <button 
                    onClick={() => onPaginate(1)} 
                    disabled={index === total - 1} 
                    className='text-context/50 hover:text-point'
                >
                    ▶
                </button>
            </div>
        </div>
    );
}
