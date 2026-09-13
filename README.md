# DoorFrame

## 프로젝트 개요

나만의 시작 페이지 - 한 곳에서 관리하는 북마크, 메모, 할 일

🔗 **[웹 데모 바로가기 (Live Demo)](https://park-intae.github.io/doorframe/)**

> ⚠️ 이 프로젝트는 개인 포트폴리오 용이며, 외부 기여나 배포는 허용되지 않습니다.

![DoorFrame_Hero](./DoorFrame_Hero.png)

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

### 실시간 코인 시세

- 업비트(Upbit) API를 활용한 실시간 코인 가격 조회
- KRW 기준 실시간 변동률(%) 및 변동액(원) 시각화
- 반응형 레이아웃 지원

### 단기/초단기 날씨 예보 (Updated!)

- **기상청 및 행정동 기반 실시간 예보**: 대한민국 기상청 단기예보와 국토교통부 주소 변환(VWorld)을 연동하여 현재 위치의 실시간 기온, 강수, 행정동 동네 이름을 정확히 표시합니다.
- **24시간 멈추지 않는 비상 백업 날씨망 (Dual Fallback)**: 정부 공공데이터 서버 점검이나 일시적 오류가 발생해도 해외 기상망(Open-Meteo)과 글로벌 지오코더로 자동 전환되어, 날씨 화면이 멈추거나 꺼지지 않고 24시간 안정적으로 작동합니다.
- **깜빡임 없는 부드러운 로딩 (스켈레톤 UI)**: 날씨를 불러오는 동안 화면이 덜컹거리거나 깨지지 않도록, 실제 카드 모양과 똑같은 은은한 로딩 애니메이션을 먼저 보여줍니다.
- **위아래로 넘겨보는 부드러운 슬라이드 & 제스처**: 마우스 휠이나 터치 드래그로 '현재 날씨'와 '3일 예보'를 위아래로 부드럽게 넘겨볼 수 있습니다.
- **우측 세로형 도트 네비게이션**: 상하 슬라이드에 맞춰 오른쪽에 세로형 버튼을 배치하여 현재 보고 있는 화면을 직관적으로 확인하고 클릭 전환할 수 있습니다.
- **3일 단기 예보 날씨 아이콘 시각화**: 오늘, 내일, 모레 날씨 카드에 날씨 아이콘(맑음, 구름, 비 등)을 표시하고, 기온 꺾은선 그래프 꼭대기가 잘리지 않도록 다듬었습니다.

### 북마크

- 자주 방문하는 사이트 북마크
- 사이드 바로 구현해 접근성 향상
- 드래그 앤 드롭으로 순서 변경
- 로그인 상태에 따라 브라우저 스토리지에 안전하게 저장

### 캘린더 연동 메모 & 할 일 (Updated!)

- **시원한 전폭 카드 UI**: 비좁았던 분할 화면을 없애고, 상단 날짜 선택 / 중앙 일정 목록 / 하단 입력창이 하나로 이어지는 넓고 시원한 카드 구조로 개편했습니다.
- **날짜 연동 즉시 입력 & 마감일(Deadline) 설정**: 원하는 날짜를 누르고 메모나 할 일을 바로 적을 수 있으며, 마감일을 지정할 수 있습니다.
- **마감 임박 붉은 강조 알림 (D-Day, D-1)**: 오늘 마감되거나 기한이 지난 미완료 할 일은 눈에 띄는 붉은색 배경으로 강조 표시되어 중요한 일정을 놓치지 않게 도와줍니다.
- **일정 기간 달력 연속 노출**: 마감일이 있는 할 일은 등록한 날부터 끝나는 날까지 달력에서 계속 확인하고 관리할 수 있습니다.
- **간편한 완료 및 삭제**: 체크박스로 완료 처리하고, 직관적인 휴지통 아이콘으로 손쉽게 삭제할 수 있습니다.

### 데스크탑 2열 반응형 대시보드 (New!)

- **넓은 모니터에 딱 맞춘 좌우 2열 배치**: 왼쪽에는 **시계 + 날씨 카드**, 오른쪽에는 **할 일/메모/뉴스 캐러셀**을 나란히 배치해 데스크탑 화면 공간을 시원하고 알차게 활용합니다.
- **창 크기 조절 시 자동 1열 전환**: 창을 작게 줄이거나 화면을 반으로 분할했을 때도 내용이 잘리지 않고 위아래 1열로 자연스럽게 정렬되어 스크롤할 수 있습니다.
- **일체형 검색창**: 좌우 2열 대시보드 전체 너비에 딱 맞춘 깔끔한 반투명 검색창을 제공합니다.

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

프로젝트 루트에 `.env` 파일 생성 (클라이언트 번들에는 공개용 Supabase 키만 주입됩니다):

```env
VITE_SUPABASE_URL=https://your_project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> 💡 **보안 안내**: 기상청, VWorld, Gemini 등 외부 API 키는 클라이언트 번들에 노출되지 않도록 **Supabase Edge Functions Secrets**에서 안전하게 관리됩니다.

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

## 🔧 아키텍처 및 외부 API 연동 가이드

### 🛡️ 보안 프록시 아키텍처 (Secure Edge Proxy Architecture)

Chrome 확장 프로그램 특성상 클라이언트 코드(`dist/`)에 민감한 API 키가 포함되면 누구나 개발자 도구를 통해 키를 탈취할 수 있습니다. 이를 근본적으로 방지하기 위해 **Supabase Edge Functions**를 보안 프록시 계층으로 구축했습니다:

1. **클라이언트 (Frontend)**:
   * 오직 공개 가능한 **Supabase Project URL**과 **Anon Public Key**만 `.env`에 포함합니다.
   * `anon` 키는 RLS(행 단위 보안) 및 Auth 정책으로 안전하게 보호됩니다.
2. **서버리스 백엔드 (Supabase Edge Functions)**:
   * 비용 및 호출 할당량이 연결된 민감한 외부 API 키들을 **Supabase Secrets**에만 안전하게 격리 보관합니다.
   * 클라이언트 요청을 받아 외부 API를 대리 호출(Proxy)하고, 응답 데이터를 정제/가공하여 클라이언트에 반환합니다.

---

### 🔑 외부 API 발급처 및 연동 내역

| 서비스/기능 | 외부 API 발급처 | 사용 목적 및 연동 엔드포인트 | 저장 위치 |
| :--- | :--- | :--- | :--- |
| **인증 & 백엔드 연동** | [Supabase](https://supabase.com/dashboard) | Google OAuth 로그인, 파비콘 Storage 업로드, 엣지 함수 호출 | 클라이언트 [`.env`](file:///C:/Users/pit19/OneDrive/바탕%20화면/프로그래밍/doorframe/.env)<br>(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) |
| **단기/초단기 날씨 예보**<br>(1순위 주 엔진) | [공공데이터포털](https://www.data.go.kr/)<br>(`기상청_단기예보 조회서비스`) | - `getUltraSrtNcst`: 현재 시각 실시간 기온/강수 실황<br>- `getVilageFcst`: 24시간 시간별 기온 및 3일 예보 데이터 | Supabase Secrets<br>(`VITE_PUBLIC_WEATHER_API_KEY`) |
| **위치 역지오코딩**<br>(1순위 주 엔진) | [VWorld 국가공간정보포털](https://www.vworld.kr/)<br>(`오픈API 지오코더`) | GPS 위경도(`lat`, `lon`, `EPSG:4326`) 좌표를 '서울특별시 중구 명동' 등 사용자 친화적 행정동 명칭으로 변환 | Supabase Secrets<br>(`VITE_PUBLIC_GEOCODER_API_KEY`) |
| **무료 기상/지오코딩 백업**<br>(2순위 장애 대비 엔진) | [Open-Meteo](https://open-meteo.com/)<br>& [BigDataCloud](https://www.bigdatacloud.com/) | 공공데이터포털/VWorld 서버 점검, 일일 할당량 초과, 키 만료 시 실시간 기온/24시간 차트 및 한글 주소를 무중단 대리 공급 | Supabase Edge Function 내부<br>(별도 키 발급 불필요, 무제한 오픈 API) |
| **AI 뉴스 요약 및 키워드** | [Google AI Studio](https://aistudio.google.com/)<br>(`Gemini API`) | 최신 구글/네이버 뉴스 피드를 분석하여 카테고리별 핵심 키워드 추출 및 트렌드 3줄 요약 | Supabase Secrets<br>(`GEMINI_API_KEY`) |

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

### Supabase Edge Function 설정 및 배포

1. [Supabase CLI](https://supabase.com/docs/guides/cli) 로그인 및 프로젝트 연결:
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   ```
2. 외부 API 키 Secrets 등록:
   ```bash
   npx supabase secrets set VITE_PUBLIC_WEATHER_API_KEY="your_weather_key"
   npx supabase secrets set VITE_PUBLIC_GEOCODER_API_KEY="your_vworld_key"
   npx supabase secrets set GEMINI_API_KEY="your_gemini_key"
   ```
3. Edge Functions 배포:
   ```bash
   npx supabase functions deploy weather
   npx supabase functions deploy news-briefing
   npx supabase functions deploy favicon-proxy
   ```

## 🐛 트러블슈팅

## 🐛 트러블슈팅

### 1. 로그인 없이 사용할 때 새로고침 시 데이터가 초기화되던 문제
- **증상**: 
  - 로그인하지 않고 서비스를 사용하다가 새로고침하면 프로필에 빈 껍데기('사용자') 계정이 뜨고, 저장해 둔 북마크와 메모/할 일 목록이 사라지거나 초기화됨.
- **원인 분석**:
  - 북마크 파비콘 저장 등 백엔드 통신을 위해 발급받던 임시 '익명 세션'이 실제 구글 로그인 계정으로 잘못 처리됨.
  - 이로 인해 새로고침할 때마다 매번 새로운 임시 아이디(UUID)가 발급되면서 기존 게스트 저장소를 찾지 못하고 빈 데이터로 덮어쓰는 문제가 발생함.
- **해결 방법**:
  1. **게스트 모드와 정식 로그인 분리**: 실제 구글 로그인 계정만 정식 유저로 처리하고, 로그인하지 않은 사용자는 순수 손님(게스트) 모드로 유지하며 고정된 게스트 저장 키를 사용하도록 수정.
  2. **로그인 시 데이터 자동 이어받기**: 손님 모드로 서비스를 쓰다가 나중에 구글 로그인을 하면, 작성해 둔 북마크와 할 일이 새 계정으로 자동 복사·이전되어 그대로 유지되도록 구현.
  3. **브라우저 종료 시 데이터 보존**: 할 일이나 메모를 적고 바로 탭을 닫거나 새로고침해도 데이터가 날아가지 않도록 즉시 강제 저장하는 안전장치 적용.

### 2. 확장 프로그램에서 구글 로그인이 차단되던 문제 (`400 Bad Request`)
- **증상**: 크롬 확장 프로그램에서 로그인 버튼을 누르면 구글 로그인 페이지에서 "보안되지 않은 브라우저" 오류가 뜨며 진행이 막힘.
- **원인**: 구글 보안 정책상 크롬 확장 프로그램의 작은 내장 팝업(웹뷰) 환경에서의 로그인이 전면 차단됨.
- **해결 방법**: 작은 팝업 대신 일반 브라우저 새 탭을 열어 안전하게 구글 로그인을 진행하고, 로그인이 성공하면 인증 코드를 받아온 뒤 해당 탭을 자동으로 닫도록 개선.

### 3. Supabase 리디렉션 URI 설정
- Supabase 대시보드 (`Authentication > URL Configuration > Redirect URLs`)에 확장 프로그램 ID 기반 URI 등록 확인:
  - `chrome-extension://<YOUR_EXTENSION_ID>/**`
  - `https://<YOUR_EXTENSION_ID>.chromiumapp.org/**`
- Supabase 대시보드 (`Authentication > Providers > Google`) 활성화 및 Client ID / Secret 설정 확인
- 클라이언트 `.env` 파일의 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 확인

### 4. API 호출 제한 및 위치 권한 안내
- **호출 제한**: 기상청 및 Gemini API는 일일/분당 무료 호출 한도가 있습니다. 단시간에 새로고침을 너무 많이 할 경우 잠시 후 다시 이용해주세요.
- **위치 권한 안내**: 내 동네 날씨를 정확히 보려면 브라우저 위치 권한을 허용해주세요. (권한을 끄면 기본 백업 날씨로 안내됩니다)

## 🔮 향후 계획

- Chrome Web Store 정식 등록 검토
- 사용자 설정 동기화 기능 추가
- 테마 커스터마이징 고도화
- 야간 모드

## 🚀 릴리스 노트
### v1.3.04 (2026-09-12)
- **넓은 모니터에 최적화된 좌우 2열 대시보드 개편**:
  - 데스크탑 환경에서 왼쪽(시계/날씨)과 오른쪽(할 일/메모/뉴스)을 양옆 2열로 시원하게 배치.
  - 창 크기를 줄이거나 화면을 반으로 쪼개도 내용이 잘리지 않고 위아래 1열로 자동 정렬되어 세로 스크롤 지원.
  - 비좁았던 캘린더 슬라이드를 넓은 단일 카드 구조로 개편하여 날짜 선택부터 리스트 확인, 입력까지 한곳에서 편리하게 이용.
  - 2열 대시보드 전체 너비에 딱 맞춘 깔끔한 일체형 검색창 적용.
- **날씨 카드 조작감 및 시각 디자인 개선**:
  - 마우스 휠이나 드래그로 현재 날씨와 3일 예보를 위아래로 슥 넘겨볼 수 있는 상하 제스처 지원.
  - 오른쪽에 세로형 도트 버튼을 배치하여 현재 보고 있는 날씨 페이지를 한눈에 파악하고 원클릭 전환.
  - 날씨 불러오는 동안 화면이 깜빡이지 않도록 실제 카드 모양의 은은한 로딩 애니메이션(스켈레톤 UI) 적용.
  - 3일 예보에 날씨 아이콘(맑음, 비 등)을 표시하고 기온 꺾은선 그래프 곡선이 잘리지 않도록 다듬음.
- **Todo 마감일(Deadline) 시각화 및 마감 임박 강조**:
  - 마감일 당일(`D-Day`)이나 하루 전(`D-1`), 기한이 지난 할 일은 눈에 띄는 붉은색 배경으로 강조.
  - 마감일이 있는 일정은 등록한 날부터 끝나는 날까지 달력 날짜 탐색 시 계속 보이도록 개선.
- **스크롤 간섭 차단 및 화면 표시 속도 최적화**:
  - 메모/할 일/뉴스 목록을 스크롤할 때 바깥쪽 큰 슬라이드가 함께 넘어가지 않도록 스크롤 영역 완벽 분리.
  - 외부 인터넷에서 글꼴을 불러오던 방식을 로컬 글꼴 탑재로 바꾸어 페이지 열리는 속도 대폭 개선.

### v1.3.03 (2026-09-11)
- **비로그인 시 데이터 초기화 및 껍데기 계정 문제 완벽 해결**:
  - 로그인 없이 사용할 때 새로고침하면 빈 '사용자' 계정이 뜨고 데이터가 날아가던 오류를 원천 차단.
  - 손님(게스트) 모드로 작성하던 북마크와 메모/할 일이 처음 구글 로그인했을 때 새 계정으로 그대로 이어지도록 자동 이전 기능 추가.
  - 글 작성 중 탭을 바로 닫아도 데이터가 유실되지 않도록 강제 즉시 저장 안전장치 적용.

### v1.3.02 (2026-09-09)
- **날씨 멈춤 방지 (비상 백업 날씨망 연동) 및 지도 좌표 보정**:
  - 기상청이나 지도 서버가 점검 중이거나 터져도 해외 무료 기상망으로 자동 전환되어 날씨 화면이 꺼지지 않고 24시간 작동.
  - 위치 좌표 변환 오류를 바로잡아 '알 수 없는 지역'으로 뜨던 현상 해결.
- **크롬 확장 프로그램 구글 로그인 정상화**:
  - 구글 보안 정책으로 확장 프로그램 안에서 로그인이 차단되던 문제를 새 브라우저 탭 인증 방식으로 해결.
- **메모/할 일 입력 편의성 개선**:
  - 우측 하단에 흩어져 있던 메뉴를 없애고 캘린더 화면 안에서 직접 일정과 메모를 입력하도록 합침.
  - 삭제 아이콘을 직관적인 휴지통 모양으로 바꾸고 라이트/다크 테마 디자인 일체감 개선.

### v1.3.01 (2026-09-09)
- **확장 프로그램 보안 강화 및 첫 배포 준비**:
  - 유료/민감한 외부 API 키가 겉으로 드러나지 않도록 서버 뒷단으로 안전하게 숨김.
  - 유튜브 슬라이드를 제외하고 핵심 3종(캘린더, AI 뉴스, 실시간 코인 시세)으로 캐러셀 최적화.

### v1.3.0 (2026-05-25)
- **UI/UX 폴리싱 및 레이아웃 최적화**:
  - 내비게이션 Popover 너비 제어 일관성 확보 및 테마별 아이콘 가시성 개선
  - 메모/할 일 팝업 정보 계층화, 입력 피드백 강화 및 글래스모피즘 테마 통일
  - 캘린더 슬라이드 연동 및 날짜 기반 메모/할 일 관리 시스템 구축
  - 하단 캐러셀 슬라이드 표준화 (캘린더 연동, AI 뉴스, 실시간 코인 시세 3종 중심 재편)
- **보안 및 테스트 스위트 강화**:
  - 클라이언트 번들 내 민감 키 제거 및 Supabase Edge Functions Secrets로 환경 격리
  - Vitest 단위 테스트 스위트 전수 최신화 및 100% 정상 통과 보장 (17개 파일 37개 테스트)

### v1.2.0.1 (2026-05-03)
- **확장 프로그램 아키텍처 재구조화**:
  - Manifest V3 기반 안정적 빌드 환경 및 서비스 워커 연동
  - 팝업 전용 엔트리 포인트 구성 및 Chrome Storage 기반 상태 영속성(Persistence) 확보
  - 최소 권한 원칙(Principle of Least Privilege) 준수를 위한 보안 권한(identity 등) 최적화
  - 확장 프로그램용 멀티 엔트리 빌드 파이프라인 정비 (Vite)

### v1.2.0 (2026-04-26)
- **날씨 시스템 고도화**:
  - 기상청 데이터 엔진 연동 및 실시간 예보 파이프라인 구축
  - Chart.js 기반 24시간 기온 추이 시각화
  - 인터랙티브 듀얼 모드 캐러셀(스크롤 전환) 및 스마트 툴팁 탑재
  - Flex 레이아웃 리팩토링 및 UX 폴리싱

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
