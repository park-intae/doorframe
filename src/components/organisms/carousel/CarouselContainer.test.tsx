import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import CarouselContainer from './CarouselContainer';

describe('CarouselContainer', () => {
    it('아이템 개수만큼 인디케이터 버튼이 렌더링되어야 함', () => {
        const { getAllByRole } = render(
            <CarouselContainer>
                <div>Page 1</div>
                <div>Page 2</div>
            </CarouselContainer>
        );

        const buttons = getAllByRole('button');
        expect(buttons).toHaveLength(2);
    });

    it('인디케이터 버튼 클릭 시 해당 페이지로 이동(paginate)해야 함', () => {
        const { getAllByRole, getByText } = render(
            <CarouselContainer>
                <div>Page 1</div>
                <div>Page 2</div>
            </CarouselContainer>
        );

        const buttons = getAllByRole('button');
        // 두 번째 인디케이터 클릭 (Page 2로 이동)
        fireEvent.click(buttons[1]);
        expect(getByText('Page 2')).toBeDefined();

        // 첫 번째 인디케이터 클릭 (Page 1로 복귀)
        fireEvent.click(buttons[0]);
        expect(getByText('Page 1')).toBeDefined();
    });
});
