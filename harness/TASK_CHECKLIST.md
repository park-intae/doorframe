# Doorframe Remaster - Project Advance

## Back-log Tasks

## In-Progress Task

## Completed Tasks
- [✔️] **데이터 영속성 및 저장/인증 안정화 (Data Persistence & Storage Reliability Fix)**
  - [✔️] 1. 백엔드 익명 인증과 프론트엔드 전역 세션 분리 (Separate Anonymous Auth from UI State)
    - 파비콘 업로드(`iconUploader`)를 위한 Supabase 익명 세션 기능은 백엔드용으로 안전하게 유지
    - `App.tsx`에서 익명 계정(`is_anonymous: true`)이 Redux `auth.user`로 들어와 껍데기 프로필이 노출되던 문제 차단
    - Google 소셜 로그인 시 `user_metadata`(아바타, 이름, 이메일) 온전한 복원 및 프로필 정상 노출 (문제 1 해결)
  - [✔️] 2. 스토리지 키 일원화 및 게스트 ↔ 소셜 로그인 데이터 마이그레이션 (Storage Key Normalization & Migration)
    - 임의의 익명 UUID로 인한 로컬 스토리지 키 분절 방지: 비로그인/익명 상태에서는 항상 안정적인 고정 키(`guest_fav_items`, `guest_list_items`) 사용
    - 비로그인(게스트) 상태에서 저장된 북마크/할 일/메모가 소셜 로그인 시 소실되지 않고 사용자 계정 키로 안전 병합(Merge) (문제 2, 4 해결)
  - [✔️] 3. 비동기 로딩 대기 가드 및 초기화 전 덮어쓰기 방지 (Prevent Premature Overwrite & Default Reset)
    - `loadBookmarksFromStorage`, `loadListFromStorage` 완료 전 Redux의 빈 초기 상태(`[]`)가 스토리지에 저장되는 경합 차단
    - 저장소에 기존 데이터가 있음에도 로딩 타이밍이나 `null` 판정으로 기본값(`defaultBookmarks`, 빈 배열)으로 리셋되는 버그 해결 (문제 2, 4 해결)
  - [✔️] 4. 메모/할 일 영속성 관리자 및 디바운스 즉시 플러시(Flush) 강화 (Memo/Todo Persistence & Flush)
    - `ListPersistence`의 500ms 디바운스 중 브라우저 새로고침/탭 닫힘/언마운트 시 미저장 데이터 즉시 플러시(`beforeunload`, `pagehide`)
    - 북마크(`useFavBar`) 및 리스트(`ListPersistence`)의 영속성 로직 라이프사이클 통일 (문제 3 해결)
  - [✔️] 5. 단위 테스트 및 실환경(웹/확장프로그램) 시나리오 검증 (Testing & Verification)
    - 세션 복구 및 프로필 노출 테스트 보강
    - 재접속 시 북마크 및 메모/할 일 데이터 보존 검증
    - 전체 테스트 스위트 100% 통과 보장 (18개 테스트 파일, 41개 테스트 전수 통과)
- [✔️] **라이트 모드 테두리 가시성 개선 (Light Mode Border Visibility Improvement)**
  - [✔️] 1. 주요 컴포넌트 테두리 클래스 동적 변경 (border-black/50 적용)
  - [✔️] 2. 라이트 모드 가시성 확보 및 인코딩 오류 복구 완료
- [✔️] **메모/할 일 팝업 UI 디자인 개선 (Memo/Todo Popup UI Enhancement)**
  - [✔️] 1. 팝업 레이아웃의 정보 계층 구조 개선 (입력창, 날짜 선택, 카테고리 분리)
  - [✔️] 2. 입력 창(ItemInput)의 가시성 및 인터랙션 피드백 강화
  - [✔️] 3. 전체적인 디자인을 기존 글래스모피즘 테마와 일관되게 폴리싱
  - [✔️] 4. 데스크탑 환경에서의 팝업 크기 및 배치 최적화
- [✔️] **메모/할 일 데이터 통합 및 캘린더 연동 (Data Integration & Calendar Sync)**
  - [✔️] 1. 전역 상태(`listSlice`)와 캐러셀 캘린더 슬라이드 간 데이터 동기화 로직 검증
  - [✔️] 2. 하단 팝업창에서 항목 추가 시 선택된 날짜 정보 자동 매핑 로직 구현
  - [✔️] 3. 캐러셀 캘린더 뷰에서 항목 조작(삭제, 완료) 시 전역 상태 및 DB 실시간 반영
  - [✔️] 4. 하단 팝업 메뉴와 캐러셀 간의 실시간 업데이트(Redux 상태 변화 감지) 보장
- [✔️] **하단 캐러셀 UI/UX 통일 (Bottom Carousel UI/UX Uniformity)**
  - [✔️] 모든 슬라이드 공통 글래스모피즘(.glass) 및 패딩 적용
  - [✔️] 타이틀 디자인 표준화 (포인트 바 + 텍스트)
  - [✔️] 유튜브 슬라이드 다크 글래스(Dark Glass) 스타일로 최적화
  - [✔️] 내부 리스트 영역 스타일(glass-sub) 통일
- [✔️] **케러셀 UI 조정**
  - [✔️] 하단부 캐러셀 너비 통일(넓은 너비로 통일)
  - [✔️] 커스텀 브레이크 포인트 smDT일 때 캐러셀 UI 조절
    - [✔️] 상단부 캐러셀 flex column으로 변경
    - [✔️] 하단부 캐러셀 위치를 상단부 캐러셀 옆으로 이동
- [✔️] **메모/할 일 캘린더 연동 (Memo/Todo Calendar Integration)**
  - [✔️] 1. 레이아웃 생성
  - [✔️] 2. 가상의 캘린더에 데이터 저장하는 구조로 제작
  - [✔️] 3. 날짜 넘기기 기능
- [✔️] **유튜브 뮤직 라디오 구현 (YouTube Music Radio Integration)**
  - [✔️] YouTube Music API/스트리밍 연동
  - [✔️] 라디오 스테이션 및 플레이리스트 관리
- [✔️] **사용자 경험 및 UI 폴리싱 (UX/UI Polishing)**
  - [✔️] 다크/라이트 모드 테마 최적화
  - [✔️] 캐러셀 애니메이션 및 성능 최적화
- [✔️] **확장프로그램 구동 환경 구현 (Extension Architecture Setup)**
  - [✔️] Manifest V3 설정 및 파이프라인 정비
  - [✔️] 팝업 환경 및 보안 정책 최적화
- [✔️] **초기 로딩 및 성능 최적화**
  - [✔️] 코어 라이브러리 지연 로딩 전략 수립
  - [✔️] 데이터 프리페칭 및 체감 속도 개선
- [✔️] **날씨 데이터 고도화 (Weather System Expansion)**
  - [✔️] 기상 데이터 소스 및 상태 관리 구축
  - [✔️] 날씨 시각화 및 UX 고도화
- [✔️] **캐러셀 항목으로 코인 리스트 제공**
  - [✔️] 웹소켓 실시간 데이터 동기화
  - [✔️] UI 시각화 및 반응형 레이아웃 구성
