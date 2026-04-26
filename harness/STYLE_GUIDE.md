이 문서에는 모든 코드 작업 시 반드시 준수해야 하는 규칙이 작성되어있음
AI의 코드 생성 작업 시 이 가이드를 반드시 우선 참조해야 함

## 1. 코드 아키텍처 및 네이밍 규칙
- **Naming**
  - Components: `PascalCase`
  - Functions/Variables: `camelCase`
  - Types/Interfaces: `PascalCase`
- **Structure**
  - 컴포넌트는 `Logic`과 `View`를 명확히 분리할 것
  - 비즈니스 로직은 `hooks/` 디렉토리에 커스텀 훅으로 추출하는 것을 우선할 것
  - Props는 `type/` 디렉토리에 명시적으로 타입을 정의해 참조할 것

## 2. 성능 최적화
- **Image Optimization:** 
  - 정적 에셋은 적절한 포맷(WebP 권장) 및 사이즈를 사용하며, 필요 시 `img` 태그의 `loading="lazy"` 속성을 활용할 것.
- **Rendering:** 
  - 불필요한 리렌더링 방지를 위해 `useMemo`, `useCallback` 적절히 활용.
  - 대규모 리스트 렌더링 시 가상화(Virtualization) 고려.
- **Bundle Analysis:** 
  - 라이브러리 추가 시 번들 사이즈를 고려, 외부 라이브러리 도입은 최소화.
  - 코드 분할(Code Splitting) 및 동적 임포트(Dynamic Import)를 통해 초기 로드 속도 개선.
- **Data Fetching:** 
  - API 호출 시 `SWR`이나 `React Query` 등을 통한 캐싱 및 상태 관리 최적화.

## 3. UI/UX 및 스타일링
- **Tailwind CSS:**
  - **Utility-First 원칙:** 컴포넌트의 스타일은 최대한 Tailwind 유틸리티 클래스를 조합하여 작성하며, 중복되는 스타일은 `@apply` 대신 UI 컴포넌트 단위로 캡슐화할 것.
  - **색상 및 테마:** `tailwind.config.js`에 정의된 색상 팔레트와 디자인 토큰을 우선적으로 사용하며, 하드코딩된 HEX 값 사용을 지양할 것.
  - **반응형 디자인:** `mobile-first` 전략을 따르며, 기본 스타일은 모바일 기준으로 작성하고 `md:`, `lg:` 등의 브레이크포인트를 활용해 확장할 것.

- **Framer Motion:**
  - **선언적 애니메이션:** 가급적 `motion` 컴포넌트의 `initial`, `animate`, `exit` 속성을 사용하여 선언적으로 구현할 것.
  - **성능 고려:** 레이아웃 애니메이션은 `layout` 속성을 활용하고, 하드웨어 가속이 가능한 `transform`(`x`, `y`, `scale`) 및 `opacity` 속성 위주로 애니메이션을 적용할 것.
  - **사용자 경험:** 사용자의 시스템 설정(`prefers-reduced-motion`)을 존중하여, 과도한 움직임이 필요한 곳에는 애니메이션을 조건부로 비활성화하는 로직을 고려할 것.

## 4. 에러 핸들링 & 접근성
- **Error Handling:**
  - **Graceful Degradation:** 사용자에게 명확한 에러 메시지를 제공하고, 기능이 차단될 경우 복구할 수 있는 수단(예: 재시도 버튼)을 제공할 것.
  - **Error Boundaries:** React Error Boundary를 활용해 애플리케이션의 특정 컴포넌트 오류가 전체 UI의 붕괴로 이어지지 않도록 할 것.
  - **Logging:** 모든 에러는 `errorLogs/` 혹은 모니터링 툴을 통해 수집하여 추적 가능하게 관리할 것.
- **Accessibility (a11y):**
  - **Semantic HTML:** 의미론적인 HTML 태그를 우선 사용하고, 폼 요소에는 반드시 `label`을 연결할 것.
  - **Keyboard Navigation:** 모든 인터랙티브 요소는 키보드만으로 접근/조작이 가능해야 하며, 포커스 상태(`:focus-visible`)를 시각적으로 명확히 표시할 것.
  - **Screen Readers:** 이미지는 `alt` 속성을, 동적 상태 변경은 `aria-live` 등을 적절히 사용하여 접근성을 보장할 것.

## 5. 주석 및 문서화
- **Code Comments:**
  - **Context-driven:** "어떻게" 보다는 "왜" 이 코드가 작성되었는지에 대한 의도를 기술하며, 지나치게 당연한 코드는 주석을 생략할 것.
  - **Language:** 모든 코드 내 주석과 설명은 **한국어**로 작성할 것.
  - **TODOs:** 임시 구현이나 추후 수정이 필요한 곳에는 `// TODO: 내용` 주석을 활용하여 추적할 것.
- **Documentation:**
  - **README/Manual:** 프로젝트 루트의 `README.md`와 `PATCHNOTE.md` 및 `./harness`폴더의 `TASK_CHECKLIST.md`를 최신화하여 아키텍처 의사결정 기록을 보존할 것. 
    - `PATCHNOTE.md`업데이트 시 기능이나 수정이 적용된 날짜를 기준으로 작성 (예. [00.00일 패치] 주요 패치내역 설명)
    - `TASK_CHECKLIST.md`에서 진행예정은 [], 진행 중은 [🔼], 진행 완료는 [✔️]로 표기할 것
  - **JSDoc:** 복잡한 함수나 공통 라이브러리 인터페이스에는 JSDoc을 사용하여 매개변수와 반환값의 의도를 명확히 할 것.