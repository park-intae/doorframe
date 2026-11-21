import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useStockMarket, DEFAULT_STOCK_OPTIONS } from './useStockMarket';
import { supabase } from '@/config/supabase';

vi.mock('@/config/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('useStockMarket', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    (supabase.functions.invoke as ReturnType<typeof vi.fn>).mockImplementation(
      (_name: string, options: { body: { action: string; symbols?: string[]; query?: string } }) => {
        if (options.body.action === 'search') {
          return Promise.resolve({
            data: {
              results: [{ symbol: 'PLTR', name: 'Palantir', market: 'US' }],
            },
            error: null,
          });
        }
        return Promise.resolve({
          data: {
            quotes: (options.body.symbols || []).map((symbol) => ({
              symbol,
              name: symbol,
              market: symbol.endsWith('.KS') ? 'KR' : 'US',
              currency: symbol.endsWith('.KS') ? 'KRW' : 'USD',
              price: symbol.endsWith('.KS') ? 70000 : 180,
              previousClose: symbol.endsWith('.KS') ? 69000 : 175,
              changeAmount: symbol.endsWith('.KS') ? 1000 : 5,
              changeRate: 1.5,
              change: 'RISE',
              marketState: 'REGULAR',
            })),
            updatedAt: Date.now(),
          },
          error: null,
        });
      }
    );
  });

  it('국장/미장/전체 필터링이 동작한다', async () => {
    const { result } = renderHook(() => useStockMarket(true));

    await waitFor(() => {
      expect(result.current.stocks).toHaveLength(DEFAULT_STOCK_OPTIONS.length);
    });

    await act(async () => {
      result.current.setMarketFilter('kr');
    });
    expect(result.current.filteredSelectedStocks.every((s) => s.market === 'KR')).toBe(true);

    await act(async () => {
      result.current.setMarketFilter('us');
    });
    expect(result.current.filteredSelectedStocks.every((s) => s.market === 'US')).toBe(true);

    await act(async () => {
      result.current.setMarketFilter('all');
    });
    expect(result.current.filteredSelectedStocks).toHaveLength(DEFAULT_STOCK_OPTIONS.length);
  });

  it('종목 검색 및 커스텀 추가/삭제가 동작한다', async () => {
    const { result } = renderHook(() => useStockMarket(true));

    await act(async () => {
      await result.current.searchStocks('PLTR');
    });
    expect(result.current.searchResults).toEqual([
      { symbol: 'PLTR', name: 'Palantir', market: 'US' },
    ]);

    await act(async () => {
      result.current.toggleStock({ symbol: 'PLTR', name: '팔란티어', market: 'US' });
    });
    expect(result.current.selectedStocks.some((s) => s.symbol === 'PLTR')).toBe(true);

    await act(async () => {
      result.current.resetStocks();
    });
    expect(result.current.selectedStocks).toEqual(DEFAULT_STOCK_OPTIONS);
  });
});
