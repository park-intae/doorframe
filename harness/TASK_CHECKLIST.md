# Doorframe Remaster - Project Advance

## Back-log Tasks
- [🔼] **확장프로그램 구동 환경 구현 (Extension Architecture Setup)**
  - [✔️] **Manifest V3 설정 및 구성 최적화**
    - [✔️] manifest.json 보안 정책(CSP) 설정: 필요한 API 및 외부 도메인(Supabase, API 서버 등) 권한 최소화.
    - [✔️] 백그라운드 서비스 워커(Service Worker) 등록 및 생명주기 관리 설정.
  - [ ] **팝업(Popup) 및 샌드박스 환경 구축**
    - [ ] popup.html 및 React 렌더링 엔트리 포인트 연동 확인.
    - [ ] 확장 프로그램 팝업 닫힘 방지 및 상태 유지 로직 검토(Chrome Storage API 연동).
  - [ ] **개발 및 빌드 파이프라인 정비**
    - [ ] vite.config.ts 설정: 확장 프로그램 빌드 시 manifest.json 생성 및 정적 에셋 복사 프로세스 자동화.
    - [ ] HMR(Hot Module Replacement) 지원을 위한 개발 모드 환경 설정.
  - [ ] **초기 로딩 및 성능 최적화**
    - [ ] 필수 코어 라이브러리(React, Redux) 지연 로딩 전략 수립.
    - [ ] 사용자 데이터 프리페칭(Pre-fetching)을 통한 체감 속도 개선.
  - [ ] **권한 및 보안(Security)**
    - [ ] 사용자 데이터 보호: 로컬 환경(Chrome Storage) 민감 정보 암호화 적용 방안 수립.
    - [ ] 권한 요청 전략: 최소 권한 원칙(Principle of Least Privilege)에 따른 권한 요청 범위 확인.

- [ ] **통합 미디어 플레이어 구현 (Media Player Integration)**
  - [ ] 레이아웃 설계: 캐러셀 내 플레이어 영역 UI 정의 (앨범 아트, 재생/일시정지, 프로그레스 바)
  - [ ] 서비스 연동: YouTube Music API 또는 타사 라이브러리 연동 (OAuth 인증 포함)
  - [ ] 글로벌 제어 기능: 
    - [ ] 브라우저 팝업/확장 프로그램 탭 간 상태 공유 (Zustand 기반 상태 동기화)
    - [ ] 미디어 세션 API(Media Session API) 활용: 브라우저 상단 미디어 컨트롤러 지원 및 백그라운드 재생 제어
  - [ ] 최적화: 탭 전환 시 재생 유지 및 리소스 효율적 관리를 위한 웹 워커(Web Worker) 고려

- [ ] **사용자 경험 및 UI 폴리싱 (UX/UI Polishing)**
  - [ ] 다크/라이트 모드 대응: 색상 테마 변수(CSS Variables) 세분화 및 UI 전체 적용
  - [ ] 모션 디자인: 캐러셀 전환 시 Framer Motion을 활용한 부드러운 트랜지션 애니메이션 강화
  - [ ] 성능 최적화: 코드 스플리팅(Code Splitting) 및 지연 로딩(Lazy Loading)을 통한 초기 로딩 속도 개선

## In-Progress Task

## Completed Tasks
- [✔️] **날씨 데이터 고도화 (Weather System Expansion)**
  - [✔️] **데이터 소스 및 상태 관리 구축**
    - *Backend:* 기상청 단기예보(VilageFcst) 및 초단기실황(UltraSrtNcst) API 연동.
    - *Logic:* 위경도 격자 변환, 업데이트 주기(45분) 대응 BaseTime 동적 보정 및 예보 기반 폴백 로직 적용 완료.
    - *State:* Redux Toolkit을 활용한 시계열 데이터(Hourly, Forecast) 배열 관리 및 타입 시스템 정립 완료.
  - [✔️] **시각화 UI 및 UX 고도화**
    - *Visualization:* Chart.js 기반 24시간 기온 추이 선 그래프 구현 (상단 마진 제거 및 가독성 최적화).
    - *Interaction:* Framer Motion 기반 캐러셀(클릭 및 **마우스 휠 스크롤** 전환 지원).
    - *UI:* Flex 기반 가로 레이아웃, 마우스 트래킹 커스텀 툴팁(최고/최저/강수확률 색상 강조) 적용 완료.
- [✔️] **캐러셀 항목으로 코인 리스트 제공**
  - [✔️] websocket 이용해서 즉각적으로 데이터 가져오기
  - [✔️] 코인 리스트 최대 5개 표시, 스크롤 내려서 볼 수 있음
  - [✔️] 심볼, 코인 이름, 현재 가격, 변동률, 변동금액 (krw 기준)
  - [✔️] 24시간 기준 정보 제공
  - [✔️] 상승 하락은 색으로 표시
