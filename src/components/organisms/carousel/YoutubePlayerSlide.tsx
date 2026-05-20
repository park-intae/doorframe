import React, { useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setPlaylist, setCurrentVideoId } from '../../../store/slice/mediaSlice';
import { useRadioPlayer } from '../../../hooks/useRadioPlayer';
import { youtubeService } from '../../../util/youtubeService';

/**
 * 캐러셀 내 유튜브 뮤직 라디오 슬라이드 (인증 상태 기반 조건부 렌더링)
 */
export default function YoutubePlayerSlide() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { togglePlay } = useRadioPlayer(containerRef);
    const dispatch = useAppDispatch();
    
    // 인증 상태 확인
    const { user } = useAppSelector((state) => state.auth);

    // 실제 데이터 기반 플레이리스트 초기화
    useEffect(() => {
        if (user) {
            youtubeService.getRecentPlayHistory()
                .then((data) => {
                    if (data.playlist && data.playlist.length > 0) {
                        dispatch(setPlaylist(data.playlist));
                        dispatch(setCurrentVideoId(data.playlist[0]));
                    }
                })
                .catch((err) => console.error("플레이리스트 로드 실패:", err));
        }
    }, [dispatch, user]);

    if (!user) {
        return (
            <div className="w-full h-full bg-black/90 flex flex-col items-center justify-center rounded-lg text-white p-4 text-center">
                <p className="text-lg font-bold mb-2">라디오를 이용하려면 로그인이 필요합니다</p>
                <p className="text-sm text-gray-400">Google 계정으로 로그인하여 나만의 음악 감상을 시작하세요.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center rounded-lg overflow-hidden relative">
            <div ref={containerRef} className="w-full h-full" />
            
            <button 
                onClick={togglePlay}
                className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full z-10"
            >
                Play / Pause
            </button>
        </div>
    );
}
