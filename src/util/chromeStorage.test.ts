import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { chromeStorage } from './chromeStorage';

describe('chromeStorage 유틸리티', () => {
  beforeEach(() => {
    localStorage.clear();
    delete (global as any).chrome;
  });

  afterEach(() => {
    delete (global as any).chrome;
  });

  describe('localStorage 폴백 환경', () => {
    it('set과 get이 localStorage를 통해 정상 동작해야 함', async () => {
      await chromeStorage.set('testKey', { name: 'doorframe' });
      const value = await chromeStorage.get<{ name: string }>('testKey');
      expect(value).toEqual({ name: 'doorframe' });
    });

    it('존재하지 않는 키 조회 시 null을 반환해야 함', async () => {
      const value = await chromeStorage.get('nonExistentKey');
      expect(value).toBeNull();
    });
  });

  describe('chrome.storage.local 확장 프로그램 환경', () => {
    it('set과 get이 chrome.storage.local을 통해 정상 동작해야 함', async () => {
      const mockStorage: Record<string, any> = {};

      (global as any).chrome = {
        storage: {
          local: {
            get: vi.fn(async (key: string) => ({ [key]: mockStorage[key] })),
            set: vi.fn(async (obj: Record<string, any>) => {
              Object.assign(mockStorage, obj);
            }),
          },
        },
      };

      await chromeStorage.set('extKey', [1, 2, 3]);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ extKey: [1, 2, 3] });

      const result = await chromeStorage.get<number[]>('extKey');
      expect(chrome.storage.local.get).toHaveBeenCalledWith('extKey');
      expect(result).toEqual([1, 2, 3]);
    });
  });
});
