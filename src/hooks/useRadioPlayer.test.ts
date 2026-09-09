import React from 'react';
import { renderHook } from '@testing-library/react';
import { useRadioPlayer } from './useRadioPlayer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import mediaReducer from '../store/slice/mediaSlice';
import { describe, it, expect, vi } from 'vitest';

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
    const store = configureStore({
      reducer: {
        media: mediaReducer,
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Provider, { store }, children);

    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useRadioPlayer(ref as any), { wrapper });
    
    expect(result.current.togglePlay).toBeDefined();
  });
});
