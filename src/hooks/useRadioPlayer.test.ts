import { renderHook } from '@testing-library/react';
import { useRadioPlayer } from './useRadioPlayer';
import { useRef } from 'react';

// Mocking window.YT
(window as any).YT = {
  PlayerState: {
    PLAYING: 1,
    ENDED: 0,
  },
  Player: vi.fn().mockImplementation(() => ({
    loadVideoById: vi.fn(),
    setVolume: vi.fn(),
    pauseVideo: vi.fn(),
    playVideo: vi.fn(),
    destroy: vi.fn(),
  })),
};

describe('useRadioPlayer', () => {
  it('should initialize correctly', () => {
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useRadioPlayer(ref as any));
    
    expect(result.current.togglePlay).toBeDefined();
  });
});
