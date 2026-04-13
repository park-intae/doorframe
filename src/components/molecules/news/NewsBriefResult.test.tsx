import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import NewsBriefResult from './NewsBriefResult';
import Typewriter from 'typewriter-effect';
import { CategorySummary } from '@/type/news';

// Typewriter를 함수형 컴포넌트로 모킹하여 호출 확인
vi.mock('typewriter-effect', () => ({
  default: vi.fn(() => <div data-testid="typewriter-mock" />)
}));

describe('NewsBriefResult', () => {
  it('로딩 중일 때 올바른 문구와 함께 Typewriter가 호출되어야 함', () => {
    render(<NewsBriefResult loading={true} error={null} categorySummary={null} />);
    
    // 1. 의도한 함수(Typewriter)가 호출되었는지 확인
    expect(Typewriter).toHaveBeenCalled();
    
    // 2. 의도한 데이터(문구들)가 options로 전달되었는지 확인
    const typewriterMock = vi.mocked(Typewriter);
    const lastCall = typewriterMock.mock.calls[0][0] as { options: { strings: string[] } };
    expect(lastCall.options.strings).toContain('최신 뉴스를 가져오는 중...');
    expect(lastCall.options.strings).toContain('키워드를 추출하고 있습니다...');
  });

  it('에러 발생 시 에러 메시지를 표시해야 함', () => {
    const errorMessage = '뉴스 요약 실패';
    const { getByText } = render(
      <NewsBriefResult loading={false} error={errorMessage} categorySummary={null} />
    );
    expect(getByText(errorMessage)).toBeDefined();
  });

  it('요약 데이터가 있을 때 키워드와 요약을 표시해야 함', () => {
    const mockSummary: CategorySummary = {
      category: 'IT',
      keywords: ['AI', 'Tech'],
      trendSummary: 'AI 기술이 빠르게 발전하고 있습니다.',
    };
    const { getByText } = render(
      <NewsBriefResult loading={false} error={null} categorySummary={mockSummary} />
    );
    expect(getByText('AI, Tech')).toBeDefined();
    expect(getByText('AI 기술이 빠르게 발전하고 있습니다.')).toBeDefined();
  });
});
