import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setPlaying } from '../../../store/slice/mediaSlice';

/**
 * 캐러셀 내 유튜브 재생 슬라이드
 */
export default function YoutubePlayerSlide() {
    const dispatch = useAppDispatch();
    const isPlaying = useAppSelector((state) => state.media.isPlaying);

    const togglePlay = useCallback(() => {
        chrome.runtime.sendMessage({ command: 'play-pause' }, (response) => {
            if (response && response.status) {
                dispatch(setPlaying(response.status === 'playing'));
            }
        });
    }, [dispatch]);

    return (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center rounded-lg overflow-hidden relative">
            <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?enablejsapi=1"
                title="YouTube player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
            <button
                onClick={togglePlay}
                className="absolute bottom-4 left-4 bg-white/80 hover:bg-white text-black px-4 py-2 rounded-full font-bold shadow-lg transition-all"
            >
                {isPlaying ? '일시정지' : '재생'}
            </button>
        </div>
    );
}
