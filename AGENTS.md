# DriveTalk development context

Current implementation: Phase 0 and Phase 1 only, following section 12 of the supplied brief. Later phases are not implemented or represented as complete. Continue to follow explicit user instructions about scope.

Use Node.js 22 and pnpm 10.6.5. Run pnpm typecheck, pnpm lint, pnpm test and pnpm build before committing. No API keys or paid services are needed in this phase.

## 1. 🎯 작업 목표

레이싱 게임 수준의 3D 그래픽·차량 물리·사운드를 가진 드라이빙 게임 안에, 실시간 음성 대화 기반 영어 학습을 **게임 메커니즘 자체로** 통합한 크로스플랫폼 앱을 구축한다.

**한 문장 정의:** "운전이 재미있어서 계속 하다 보니 영어가 늘어 있는 앱." 학습 화면 위에 자동차를 얹은 앱이 **아니다.**

**성공 기준 (제품 KPI)**

- D7 리텐션 30% 이상 (학습앱 평균 대비 2배)
- 세션당 평균 발화(영어) 횟수 15회 이상
- 세션당 평균 플레이 12분 이상
- 신규 단어 7일 후 재인출 정답률 75% 이상

---

## 2. 📋 배경 컨텍스트 및 제품 원칙

### 2.1 반드시 지켜야 할 설계 원칙 5가지

| # 원칙 구현상 의미  |                 |                                                                                |
| ------------ | --------------- | ------------------------------------------------------------------------------ |
| P1           | **Game-first**  | 학습 요소를 전부 제거해도 "그냥 재미있는 드라이빙 게임"이어야 한다. 학습이 게임을 방해하면 학습을 깎는다.                  |
| P2           | **인지부하 분리**     | 주행 중에는 **오디오 전용**(듣기·말하기). 정차/피트인 상태에서만 **텍스트·문법·복습** 노출. 주행 중 긴 텍스트 읽기 UI 금지. |
| P3           | **발화가 곧 조작**    | 영어 발화가 게임 상태를 실제로 바꿔야 한다. (내비 지시를 영어로 말해야 경로가 열림, 주유소에서 주문해야 연료 충전 등)          |
| P4           | **실패는 계속 굴러간다** | 오답/발음 실패 시 게임 정지 금지. 페널티는 시간·연료·점수로만. 모달 팝업으로 흐름을 끊지 않는다.                      |
| P5           | **개인화는 데이터로**   | 난이도·어휘·NPC 발화 속도는 하드코딩이 아니라 학습자 모델(CEFR + FSRS 상태)에서 파생된다.                     |

### 2.2 핵심 게임 루프

```
[차고/피트] → 미션 선택 → [주행 시작]
   ↓
주행 중 이벤트가 스트리밍으로 발생:
  · 도로 표지판 = 어휘 인풋 (Merge, Yield, Detour Ahead...)
  · 무전(라디오) NPC = 실시간 음성 대화 (길 안내, 배달 지시, 잡담)
  · 스피드 게이트 = 리스닝 문제 (들은 대로 올바른 게이트 통과)
  · 픽업 아이템 = 목표 어휘 수집
   ↓
[결승/도착] → 리절트 화면 → 정차 상태에서만 텍스트 복습(FSRS 큐)
   ↓
보상(차량 파츠·페인트·신규 코스) → 차고로 복귀

```

### 2.3 안전 고지 (법적 필수)

앱 최초 실행 및 매 세션 시작 시 **"실제 운전 중 사용 금지"** 경고를 표시하고 동의를 받는다. 기기 이동 속도가 감지되면(Geolocation, 선택적) 세션을 자동 차단하는 옵션 제공. 이 요구사항은 삭제·축소 대상이 아니다.

---

## 3. 🔧 기술 스택 (버전 고정)

### 3.1 채택 스택 — Web/PWA 우선

```
런타임    : Node.js 22 LTS, pnpm 10 (workspace), Turborepo
언어      : TypeScript 5.7+ (strict: true, noUncheckedIndexedAccess: true)
프론트    : React 19 + Vite 6
3D        : three.js (r17x 최신) + @react-three/fiber v9 + @react-three/drei
렌더링    : WebGPURenderer(TSL) 우선, WebGL2 자동 폴백
물리      : @react-three/rapier (Rapier3D, raycast vehicle controller)
후처리    : @react-three/postprocessing (Bloom, SMAA, MotionBlur, ToneMapping)
상태      : Zustand (게임 상태는 React 밖) + Immer / TanStack Query (서버 상태)
스타일    : Tailwind CSS 4 + CSS Modules(게임 HUD 전용)
오디오    : Web Audio API 직접 제어 (엔진음 RPM 피치 시프트) + Howler(UI SFX)
백엔드    : Hono on Node/Edge (또는 Next.js 15 Route Handlers)
DB        : PostgreSQL + Drizzle ORM (Supabase 또는 Neon)
인증      : Better Auth 또는 Supabase Auth
배포      : Vercel / Cloudflare (에셋은 R2 또는 S3 + CDN)
테스트    : Vitest + React Testing Library + Playwright

```

### 3.2 대안 스택 (필요 시에만)

모바일 네이티브에서 **콘솔급** 그래픽이 반드시 필요하면 \*\*Unity 6 (URP) + C#\*\*으로 전환한다. 단 그 경우 개발 속도와 LLM 연동 편의성이 크게 떨어진다. **기본 결정: Web/PWA 스택으로 시작하고, 그래픽 벤치마크 미달 시에만 Unity로 전환.** `[[결정필요]]` — 이 결정을 뒤집을 거면 Phase 0 이전에 확정할 것.

### 3.3 AI 모델 계층

```
대화 브레인 : gpt-6-astra   (2026-09-03 출시, 1M 컨텍스트)
경량/저비용 : 상위 모델의 mini/경량 티어 (실시간 판정·짧은 응답용)
음성        : Realtime API (speech-to-speech, 서버 릴레이 경유)
발음 평가   : 전용 발음 평가 API 또는 음소 정렬(forced alignment) 기반 스코어러

```

> **필수 구현 규칙:** 모델 ID를 코드에 하드코딩하지 말 것. `packages/llm`의 provider adapter를 통해서만 접근하고, 모델 ID는 환경변수(`MODEL_DIALOGUE`, `MODEL_FAST`, `MODEL_REALTIME`)로 주입한다. GPT-6 Astra는 출시 직후 단계적 롤아웃 중이며 티어별 접근 권한과 가격($10/$50 per 1M tokens 수준)이 유동적이므로, **모델 교체가 1줄 환경변수 변경으로 끝나야 한다.** 접근 불가 시 자동 폴백 체인을 구성할 것.

---

## 4. 🏗 아키텍처 요구사항

### 4.1 모노레포 구조

```
drivetalk/
├─ apps/
│  ├─ web/                  # React 19 + R3F 게임 클라이언트
│  └─ api/                  # Hono 서버 (LLM 프록시, 학습 상태, 인증)
├─ packages/
│  ├─ game-core/            # 순수 TS: 물리 튜닝, 게임 루프, 이벤트 스케줄러 (React 의존 0)
│  ├─ learning-engine/      # FSRS 스케줄러, CEFR 레벨링, 어휘 모델 (순수 TS)
│  ├─ llm/                  # provider adapter, 스키마, 프롬프트 템플릿, 폴백
│  ├─ audio/                # 엔진 사운드 신스, 3D 오디오, 더킹(ducking)
│  ├─ ui/                   # 공용 HUD 컴포넌트
│  └─ schema/               # zod 스키마 + Drizzle 스키마 (단일 진실 공급원)
└─ tools/                   # 에셋 파이프라인 (glTF 압축, KTX2 변환)

```

### 4.2 렌더 루프 규칙 (성능의 핵심)

- **게임 상태는 React state가 아니다.** 차량 위치·속도·RPM은 Zustand의 non-reactive ref 또는 mutable store에 두고 `useFrame`에서 직접 갱신한다.
- **프레임당 React 리렌더 0회**가 목표. HUD 숫자(속도계 등)는 `useRef` + 직접 DOM 텍스트 갱신 또는 throttled subscribe(최대 10Hz)로 처리한다.
- `useFrame` 안에서 객체·배열·클로저 신규 할당 금지. 벡터·쿼터니언은 모듈 스코프에 재사용 인스턴스를 둔다.
- 물리 tick은 고정 60Hz, 렌더는 가변. 보간(interpolation) 적용.

### 4.3 LLM 통합 규칙

- API 키는 **절대** 클라이언트에 노출하지 않는다. 모든 호출은 `apps/api` 경유.
- 게임 상태를 바꾸는 모든 LLM 출력은 **structured output(JSON schema)** 으로 받는다. 자유 텍스트 파싱 금지.
- 사용자당 일일 토큰 상한과 세션당 상한을 서버에서 강제한다. 초과 시 사전 생성된 정적 대화 팩으로 우아하게 폴백.
- 자주 쓰이는 NPC 대사·표지판 문구는 빌드 타임에 **사전 생성 후 캐시**한다. 런타임 LLM 호출은 "진짜 개인화가 필요한 곳"에만.
- 모든 LLM 호출에 타임아웃(대화 3s, 판정 800ms)과 재시도 1회, 그리고 폴백 응답을 반드시 구현한다.

---

