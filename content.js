// YouTube 비디오 제어 및 Media Session 연동 Content Script
console.log('Doorframe: YouTube Content Script 로드됨');

const getVideoElement = () => document.querySelector('video');

if ('mediaSession' in navigator) {
  // Media Session 핸들러 등록
  navigator.mediaSession.setActionHandler('play', () => {
    const video = getVideoElement();
    if (video) {
      video.play();
      chrome.runtime.sendMessage({ action: 'status', state: 'playing' });
    }
  });

  navigator.mediaSession.setActionHandler('pause', () => {
    const video = getVideoElement();
    if (video) {
      video.pause();
      chrome.runtime.sendMessage({ action: 'status', state: 'paused' });
    }
  });
}

// Service Worker로부터 명령 수신
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const video = getVideoElement();
  if (!video) return;

  if (request.command === 'play-pause') {
    if (video.paused) {
      video.play();
      sendResponse({ status: 'playing' });
    } else {
      video.pause();
      sendResponse({ status: 'paused' });
    }
  }
  return true;
});
