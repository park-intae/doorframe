import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import CarouselContainer from './CarouselContainer';

describe('CarouselContainer', () => {
    it('아이템 개수만큼 인디케이터 버튼이 렌더링되어야 함', () => {
        const { getAllByRole } = render(
            <CarouselContainer>
                <div>Page 1</div>
                <div>Page 2</div>
            </CarouselContainer>
        );

        // 버튼이 2개 렌더링되는지 확인 (getAllByRole 사용)
        const buttons = getAllByRole('button');
        expect(buttons).toHaveLength(2);
    });
});
