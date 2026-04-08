import React, { useState } from 'react';
import CarouselView from './CarouselView';

interface CarouselContainerProps {
    children: React.ReactNode[];
}

export default function CarouselContainer({ children }: CarouselContainerProps) {
    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const paginate = (newDirection: number) => {
        const nextIndex = index + newDirection;
        if (nextIndex >= 0 && nextIndex < children.length) {
            setIndex(nextIndex);
            setDirection(newDirection);
        }
    };

    return (
        <CarouselView 
            index={index}
            direction={direction}
            total={children.length}
            children={children}
            onPaginate={paginate}
        />
    );
}
