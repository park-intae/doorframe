import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import NewsBriefResult from './NewsBriefResult';

describe('NewsBriefResult', () => {
  it('로딩 중일 때 로딩 메시지를 표시해야 함', () => {
    const { getByText } = render(
      <NewsBriefResult loading={true} error={null} categorySummary={null} />
    );
    expect(getByText(/최신 뉴스를 가져오는 중.../i)).toBeDefined();
  });

  it('에러 발생 시 에러 메시지를 표시해야 함', () => {
    const errorMessage = '뉴스 요약 실패';
    const { getByText } = render(
      <NewsBriefResult loading={false} error={errorMessage} categorySummary={null} />
    );
    expect(getByText(errorMessage)).toBeDefined();
  });

  it('요약 데이터가 있을 때 키워드와 요약을 표시해야 함', () => {
    const mockSummary = {
      category: 'IT',
      keywords: ['AI', 'Tech'],
      trendSummary: 'AI 기술이 빠르게 발전하고 있습니다.',
    };
    const { getByText } = render(
      <NewsBriefResult loading={false} error={null} categorySummary={mockSummary as any} />
    );
    expect(getByText('AI, Tech')).toBeDefined();
    expect(getByText('AI 기술이 빠르게 발전하고 있습니다.')).toBeDefined();
  });
});
