// 서비스 워커 생명주기 관리
chrome.runtime.onInstalled.addListener(() => {
  console.log('Doorframe 확장 프로그램이 설치되었습니다.');
});

// 백그라운드 이벤트 리스너 추가
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 추후 필요한 백그라운드 로직 구현
  return true;
});
