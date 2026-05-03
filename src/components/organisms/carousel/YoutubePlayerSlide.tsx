import React from 'react';

/**
 * 캐러셀 내 유튜브 재생 슬라이드
 * TODO: YouTube IFrame Player API 연동 및 제어 로직 보강
 */
export default function YoutubePlayerSlide() {
    return (
        <div className="w-full h-full bg-black flex items-center justify-center rounded-lg overflow-hidden">
            <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?enablejsapi=1"
                title="YouTube player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        </div>
    );
}
