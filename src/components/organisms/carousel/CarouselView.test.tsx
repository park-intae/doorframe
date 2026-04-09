import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import CarouselView from './CarouselView';

describe('CarouselView', () => {
    const mockOnPaginate = vi.fn();
    const children = [
        <div key="1">Page 1</div>,
        <div key="2">Page 2</div>
    ];

    it('현재 index에 맞는 자식 컴포넌트를 렌더링해야 함', () => {
        const { getByText } = render(
            <CarouselView index={0} direction={0} total={2} children={children} onPaginate={mockOnPaginate} />
        );
        expect(getByText('Page 1')).toBeDefined();
    });

    it('인디케이터 버튼 클릭 시 onPaginate가 호출되어야 함', () => {
        const { getAllByRole } = render(
            <CarouselView index={0} direction={0} total={2} children={children} onPaginate={mockOnPaginate} />
        );
        const buttons = getAllByRole('button');
        fireEvent.click(buttons[1]); // 두 번째 페이지 버튼 클릭
        expect(mockOnPaginate).toHaveBeenCalledWith(1);
    });

    it('휠 이벤트 발생 시 onPaginate가 호출되어야 함', () => {
        const { container } = render(
            <CarouselView index={0} direction={0} total={2} children={children} onPaginate={mockOnPaginate} />
        );
        const wrapper = container.firstChild as HTMLElement;
        
        // 휠 아래로
        fireEvent.wheel(wrapper, { deltaY: 50 });
        expect(mockOnPaginate).toHaveBeenCalledWith(1);
    });
});
