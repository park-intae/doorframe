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
            <div className="flex flex-col w-full h-full p-6 glass font-paperlogy overflow-hidden bg-black/20">
                <h2 className="text-xl font-bold text-title mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-point rounded-full" />
                    뮤직 라디오
                </h2>
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <p className="text-lg font-bold mb-2 text-title">라디오를 이용하려면 로그인이 필요합니다</p>
                    <p className="text-sm text-context">Google 계정으로 로그인하여 나만의 음악 감상을 시작하세요.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-full p-6 glass font-paperlogy overflow-hidden relative">
            <h2 className="text-xl font-bold text-title mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-point rounded-full" />
                뮤직 라디오
            </h2>
            <div className="flex-1 bg-black/40 backdrop-blur-md border border-white/10 shadow-inner flex flex-col items-center justify-center rounded-2xl overflow-hidden relative">
                <div ref={containerRef} className="w-full h-full mix-blend-screen opacity-90" />
                
                <button 
                    onClick={togglePlay}
                    className="absolute bottom-4 left-4 glass-button text-white px-6 py-2 rounded-full z-10 hover:scale-105 active:scale-95 transition-all text-sm font-medium"
                >
                    Play / Pause
                </button>
            </div>
        </div>
    );
}
