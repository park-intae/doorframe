import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setPlaying, setCurrentVideoId } from '../store/slice/mediaSlice';

export const useRadioPlayer = (containerRef: React.RefObject<HTMLDivElement>) => {
  const dispatch = useAppDispatch();
  const { currentVideoId, isPlaying, volume, playlist } = useAppSelector((state) => state.media);
  const playerRef = useRef<any>(null);

  // YouTube IFrame API 로드
  useEffect(() => {
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // 플레이어 초기화
  useEffect(() => {
    (window as any).onYouTubeIframeAPIReady = () => {
      playerRef.current = new (window as any).YT.Player(containerRef.current, {
        height: '100%',
        width: '100%',
        playerVars: {
          'enablejsapi': 1,
          'origin': window.location.origin,
          'controls': 1,
        },
        events: {
          onStateChange: (event: any) => {
            dispatch(setPlaying(event.data === (window as any).YT.PlayerState.PLAYING));
            
            // 곡이 끝났을 때 다음 곡으로 이동
            if (event.data === (window as any).YT.PlayerState.ENDED) {
                const currentIndex = playlist.indexOf(currentVideoId || '');
                if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
                    dispatch(setCurrentVideoId(playlist[currentIndex + 1]));
                } else if (playlist.length > 0) {
                    dispatch(setCurrentVideoId(playlist[0])); // 무한 반복
                }
            }
          }
        }
      });
    };
  }, [containerRef, dispatch, playlist, currentVideoId]);

  // 영상 변경 시 재생
  useEffect(() => {
    if (playerRef.current && currentVideoId) {
      playerRef.current.loadVideoById(currentVideoId);
    }
  }, [currentVideoId]);

  // 볼륨 조절
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [isPlaying]);

  return { togglePlay };
};
