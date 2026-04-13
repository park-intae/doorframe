# DoorFrame

## 프로젝트 개요

나만의 시작 페이지 - 한 곳에서 관리하는 북마크, 메모, 할 일

> ⚠️ 이 프로젝트는 개인 포트폴리오 용이며, 외부 기여나 배포는 허용되지 않습니다.

![Doorframe_screen_shot](./Doorframe_screes_shot.png)

## 기술 스택

### Core

- React 18 + TypeScript
- Vite

### State & Data

- Redux Toolkit
- Chrome Storage API
- Supabase (Authentication & Edge Functions)
- Google Gemini API (AI News Summarization)

### UI & Styling

- Tailwind CSS v4
- Lucide React (Icons)
- @dnd-kit (Drag & Drop)
- Typewriter-effect (Loading UI)

## 주요기능

### AI 뉴스 브리핑 (New!)

- 구글 및 네이버 뉴스를 기반으로 한 최신 뉴스 요약 서비스
- 카테고리별 뉴스 필터링 및 사용자 정의 키워드 검색 지원
- **Google Gemini API**를 활용한 핵심 키워드 추출 및 트렌드 분석 요약
- 반응형 레이아웃 (데스크탑/태블릿/모바일 최적화)

### 실시간 날씨

- 현재 위치 기반 날씨 제공 (기상청 날씨 API + 국토교통부 Geocoder API)
- 온도, 날씨상태, 지역 표시
- 클라이언트 캐싱 방식

### 북마크

- 자주 방문하는 사이트 북마크
- 사이드 바로 구현해 접근성 향상
- 드래그 앤 드롭으로 순서 변경
- 로그인 상태에 따라 ChromeStorage에 저장

### 메모 & 할 일

- 간단한 메모 작성
- 체크박스를 활용한 할 일 관리
- 로그인 상태에 따라 ChromeStorage에 저장

## 개발 및 로컬 실행 방법

### 개발 환경 설정

1. **저장소 클론**

```bash
git clone https://github.com/yourusername/doorframe.git
cd doorframe
```

2. **의존성 설치**

```bash
npm install
```

3. **환경 변수 설정**

`.env` 파일 생성:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_WEATHER_API_KEY=your_weather_api_key
VITE_GEOCODER_API_KEY=your_geocoder_api_key
```

4. **개발 서버 실행**

```bash
npm run dev
```

### Chrome Extension 빌드

> 본 확장 프로그램은 Chrome Web Store에 등록되지 않았기 때문에 아래와 같은 방식으로 로컬에서 직접 로드해야 합니다.

1. **프로덕션 빌드**

```bash
npm run build
```

2. **Chrome Extension 로드**
   - Chrome에서 `chrome://extensions/` 접속
   - 우측 상단 "개발자 모드" 활성화
   - "압축해제된 확장 프로그램을 로드합니다" 클릭
   - `dist/` 폴더 선택

## 🔧 설정 가이드

### Supabase 설정

1. [Supabase](https://supabase.com) 프로젝트 생성
2. Authentication > Providers > Google 활성화
3. Google OAuth Client ID/Secret 입력
4. Project URL과 anon key를 `.env`에 추가

### 기상청 API 키 발급

1. [공공데이터포털](https://www.data.go.kr/) 회원가입
2. "기상청\_단기예보 조회서비스" 신청
3. 발급받은 서비스키를 `.env`에 추가

### VWorld API 키 발급

1. [VWorld](https://www.vworld.kr/) 회원가입
2. 오픈API 신청
3. 발급받은 키를 `.env`에 추가

## 📁 프로젝트 구조

```
doorframe/
├── public/
│   ├── manifest.json       # Chrome Extension 설정
│   └── icons/              # 아이콘 리소스
├── src/
│   ├── components/         # React 컴포넌트
│   │   ├── container/
│   │   │   └── subcomponents/
│   │   │       └── mainSec/
│   │   │           └── newsBrief/ # 뉴스 브리핑 UI 컴포넌트
│   │   ├── favBar/
│   │   └── modal/
│   ├── hooks/             # 커스텀 훅 (비즈니스 로직 분리)
│   ├── store/             # Redux 스토어
│   ├── type/              # 전역 타입 정의
│   ├── util/              # 유틸리티 함수
│   ├── config/            # 설정 파일
│   ├── App.tsx
│   └── styles/
│       └── global.css      # 전역 스타일 및 테마
├── supabase/
│   └── functions/          # Edge Functions (News Summarizer, Weather Proxy)
├── .env                   # 환경 변수
├── vite.config.ts
└── package.json
```

## 🎨 커스터마이징

### 색상 및 폰트 테마

`src/styles/global.css`에서 테마 수정:

- **Font**: `Paperlogy` (기본 폰트)
- **Colors**: `main`, `background`, `point`, `important`, `title`, `context`

---

### Supabase Edge Function 설정

1. [Supabase CLI](https://supabase.com/docs/guides/cli) 설치 및 로그인
2. `supabase/functions/news-briefing/` 경로의 환경 변수 설정
3. Google Gemini API 키 발급 및 Edge Function Secret에 추가:
   ```bash
   supabase secrets set GEMINI_API_KEY=your_gemini_key
   ```
4. Edge Function 배포:
   ```bash
   ### 기상청 API 키 발급

1. [공공데이터포털](https://www.data.go.kr/) 회원가입
2. "기상청_단기예보 조회서비스" 신청
3. 발급받은 서비스키를 `.env`에 추가

### VWorld API 키 발급

1. [VWorld](https://www.vworld.kr/) 회원가입
2. 오픈API 신청
3. 발급받은 키를 `.env`에 추가

## 🐛 트러블슈팅

### Rate Limit 에러

기상청 API 및 Gemini API는 호출 제한이 있을 수 있습니다. 캐싱이 적용되어 있으나, 반복적인 요청 시 잠시 기다려주세요.

### 로그인 안 됨

- Supabase 프로젝트에서 Google Provider가 활성화되어 있는지 확인
- Google OAuth 리디렉션 URI 설정 확인
- `.env` 파일의 Supabase 키 확인

### 위치 권한 오류

브라우저에서 위치 권한을 허용해주세요.

## 🔮 향후 계획

- Chrome Web Store 등록 검토
- 사용자 설정 동기화 기능 추가
- 테마 커스터마이징 고도화
- 야간 모드

## 🚀 릴리스 노트

### v1.1.2 (2026-04-12)
- **웹 접근성(a11y) 최적화**: 
  - 시맨틱 마크업(header, nav, main, article, footer) 재구조화
  - ARIA 속성(aria-live, aria-busy, aria-label) 전수 적용
  - 전역 :focus-visible 스타일 도입 및 키보드 네비게이션 고도화
  - 이미지 alt 및 WCAG 색상 대비 표준 준수 보강

### v1.1.1 (2026-04-12)
- **성능 최적화**: Lighthouse 지표 대폭 개선 (FCP 0.5s, LCP 0.6s 달성)
  - `manualChunks` 전략으로 번들 크기 최적화 및 코드 스플리팅 적용
  - 핵심 리소스 `modulepreload` 및 `fetchpriority="high"` 적용
- **에셋 및 리소스**: 
  - 빌드 파이프라인 정립 및 CSS/아이콘 렌더링 최적화
  - CLS(레이아웃 변경) 방지를 위한 레이아웃 및 이미지 사이즈 명시적 지정

## 개발자

박인태
