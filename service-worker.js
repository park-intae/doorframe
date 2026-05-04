// 서비스 워커 생명주기 관리
chrome.runtime.onInstalled.addListener(() => {
  console.log('Doorframe 확장 프로그램이 설치되었습니다.');
});

// 유튜브 탭으로 메시지 전달 함수
async function sendToYoutubeTab(message) {
  const [tab] = await chrome.tabs.query({ url: "*://*.youtube.com/*", active: true });
  if (tab) {
    return chrome.tabs.sendMessage(tab.id, message);
  }
  return Promise.reject('유튜브 탭을 찾을 수 없습니다.');
}

// 백그라운드 이벤트 리스너 추가
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === 'play-pause') {
    sendToYoutubeTab({ command: 'play-pause' })
      .then(sendResponse)
      .catch((err) => sendResponse({ error: err }));
    return true; // 비동기 응답 대기
  }
  
  if (request.action === 'status') {
    console.log(`YouTube 탭 상태 업데이트: ${request.state}`);
  }
  return true;
});
