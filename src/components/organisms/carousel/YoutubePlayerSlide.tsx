import React, { useEffect, useRef } from 'react';
import { useAppDispatch } from '../../../store/hooks';
import { setPlaying } from '../../../store/slice/mediaSlice';

/**
 * 캐러셀 내 유튜브 재생 슬라이드 (IFrame API 방식, 기본 컨트롤러 사용)
 */
export default function YoutubePlayerSlide() {
    const dispatch = useAppDispatch();
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
                    'origin': window.location.origin,
                    'controls': 1, // 유튜브 내장 컨트롤러 사용
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

    return (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center rounded-lg overflow-hidden relative">
            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
}
