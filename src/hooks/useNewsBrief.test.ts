import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNewsBrief } from './useNewsBrief';
import { supabase } from '../config/supabase';

vi.mock('../config/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('useNewsBrief 훅', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('요약 요청 시 올바른 데이터를 받아와야 함', async () => {
    const mockData = {
      category: 'IT',
      keywords: ['AI', 'Gemini'],
      trendSummary: 'AI 트렌드 요약 내용',
    };

    (supabase.functions.invoke as any).mockResolvedValue({
      data: mockData,
      error: null,
    });

    const { result } = renderHook(() => useNewsBrief());

    await act(async () => {
      await result.current.handleSummarize();
    });

    expect(result.current.categorySummary).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('API 실패 시 에러 상태를 처리해야 함', async () => {
    (supabase.functions.invoke as any).mockResolvedValue({
      data: null,
      error: { message: 'API 호출 실패' },
    });

    const { result } = renderHook(() => useNewsBrief());

    await act(async () => {
      await result.current.handleSummarize();
    });

    expect(result.current.error).toBe('API 호출 실패');
    expect(result.current.loading).toBe(false);
  });
});
