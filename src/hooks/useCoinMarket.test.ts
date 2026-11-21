import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCoinMarket, DEFAULT_COIN_CODES } from './useCoinMarket';

class MockWebSocket {
  static OPEN = 1;
  static CONNECTING = 0;
  readyState = MockWebSocket.OPEN;
  binaryType = 'blob';
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  onclose: (() => void) | null = null;
  send = vi.fn();
  close = vi.fn();

  constructor(_url: string) {
    setTimeout(() => {
      this.onopen?.();
    }, 0);
  }
}

describe('useCoinMarket', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('WebSocket', MockWebSocket);
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        if (url.includes('/v1/market/all')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve([
                { market: 'KRW-BTC', korean_name: '비트코인', english_name: 'Bitcoin' },
                { market: 'KRW-ETH', korean_name: '이더리움', english_name: 'Ethereum' },
                { market: 'KRW-PEPE', korean_name: '페페', english_name: 'Pepe' },
                { market: 'BTC-ETH', korean_name: '이더리움', english_name: 'Ethereum' },
              ]),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                market: 'KRW-BTC',
                trade_price: 130000000,
                signed_change_price: 1000000,
                signed_change_rate: 0.01,
                change: 'RISE',
              },
            ]),
        });
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('기본 코인 목록(10개)과 KRW 마켓 카탈로그를 불러온다', async () => {
    const { result } = renderHook(() => useCoinMarket(true));

    await waitFor(() => {
      expect(result.current.selectedCodes).toEqual(DEFAULT_COIN_CODES);
      expect(result.current.allMarkets.some((m) => m.code === 'KRW-PEPE')).toBe(true);
      expect(result.current.allMarkets.some((m) => m.code === 'BTC-ETH')).toBe(false);
      expect(result.current.coins.some((c) => c.symbol === 'BTC' && c.price === 130000000)).toBe(true);
    });
  });

  it('사용자가 코인을 추가/삭제하고 기본값으로 복원할 수 있다', async () => {
    const { result } = renderHook(() => useCoinMarket(true));

    await waitFor(() => {
      expect(result.current.selectedCodes).toHaveLength(DEFAULT_COIN_CODES.length);
    });

    await act(async () => {
      result.current.toggleCoin('KRW-PEPE');
    });
    expect(result.current.selectedCodes).toContain('KRW-PEPE');

    await act(async () => {
      result.current.toggleCoin('KRW-PEPE');
    });
    expect(result.current.selectedCodes).not.toContain('KRW-PEPE');

    await act(async () => {
      result.current.toggleCoin('KRW-PEPE');
      result.current.resetCoins();
    });
    expect(result.current.selectedCodes).toEqual(DEFAULT_COIN_CODES);
  });
});
