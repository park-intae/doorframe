import React, { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setPlaying } from '../../../store/slice/mediaSlice';

/**
 * 캐러셀 내 유튜브 재생 슬라이드 (IFrame API 방식)
 */
export default function YoutubePlayerSlide() {
    const dispatch = useAppDispatch();
    const isPlaying = useAppSelector((state) => state.media.isPlaying);
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // YouTube IFrame API 로드
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        (window as any).onYouTubeIframeAPIReady = () => {
            playerRef.current = new window.YT.Player(containerRef.current, {
                height: '100%',
                width: '100%',
                videoId: 'dQw4w9WgXcQ',
                playerVars: {
                    'enablejsapi': 1,
                    'origin': window.location.origin
                },
                events: {
                    onStateChange: (event: any) => {
                        dispatch(setPlaying(event.data === window.YT.PlayerState.PLAYING));
                    }
                }
            });
        };

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, [dispatch]);

    const togglePlay = useCallback(() => {
        chrome.runtime.sendMessage({ command: 'play-pause' }, (response) => {
            if (response && response.status) {
                dispatch(setPlaying(response.status === 'playing'));
            }
        });
    }, [dispatch]);

    return (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center rounded-lg overflow-hidden relative">
            <div ref={containerRef} className="w-full h-full" />
            <button
                onClick={togglePlay}
                className="absolute bottom-4 left-4 bg-white/80 hover:bg-white text-black px-4 py-2 rounded-full font-bold shadow-lg transition-all"
            >
                {isPlaying ? '일시정지' : '재생'}
            </button>
        </div>
    );
}
