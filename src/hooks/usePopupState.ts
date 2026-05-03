import { useState, useEffect } from 'react';
import { chromeStorage } from '../util/chromeStorage';

/**
 * 팝업 상태를 Chrome Storage와 동기화하는 커스텀 훅
 * @param key 스토리지 키
 * @param initialValue 기본값
 */
export function usePopupState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 팝업 마운트 시 데이터 로드
    chromeStorage.get<T>(key).then((storedValue) => {
      if (storedValue !== null) {
        setState(storedValue);
      }
      setIsLoaded(true);
    });
  }, [key]);

  useEffect(() => {
    // 상태 변경 시 데이터 저장
    if (isLoaded) {
      chromeStorage.set(key, state);
    }
  }, [key, state, isLoaded]);

  return [state, setState] as const;
}
