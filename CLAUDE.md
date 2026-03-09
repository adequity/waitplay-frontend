# CLAUDE.md - WaitPlay Frontend

## 1. Project Overview

- **Type**: Frontend Web Application (Vue 3)
- **Stack**: Vue 3, Vite, TypeScript, Pinia (State), Vue Router
- **Game Engine**: Phaser 3, Pixi.js, Rapier2d (Physics)
- **Styling**: Custom CSS (Variables in `src/style.css`, Scoped styles), **No Tailwind**
- **Testing**: Cypress (E2E), `vue-tsc` (Type Checking)
- **Deployment**: Railway (Nixpacks)

## 2. Core Commands

| Command            | Description                                     |
| ------------------ | ----------------------------------------------- |
| `npm run dev`      | Start development server (Port 3000)            |
| `npm run build`    | Type check (`vue-tsc`) and build for production |
| `npm run preview`  | Preview production build locally                |
| `npm run cy:open`  | Open Cypress Test Runner (GUI)                  |
| `npm run cy:run`   | Run Cypress tests in headless mode              |
| `npm run test:e2e` | Start dev server and run E2E tests              |

## 3. Project Structure

- `src/components`: UI Components
- `src/views`: Page Views
- `src/stores`: Pinia Stores
- `src/game`: Game Logic (Phaser scenes, etc.)
- `src/services`: API Services (Axios wrappers)
- `src/types`: TypeScript Type Definitions
- `cypress/e2e`: End-to-End Tests
- `STABILITY_REPORT.md`: Backend/Infrastructure Stability Status

## 4. Coding Conventions

- **TypeScript**: Strict typing is enforced. Avoid `any`. Use interfaces/types in `src/types` or colocated.
- **Vue**: Use **Composition API** (`<script setup lang="ts">`).
- **Styling**:
  - Use CSS variables defined in `src/style.css` for colors/spacing.
  - Scoped styles for component-specific overrides.
  - **Do not install Tailwind** unless explicitly requested and approved.
- **Explicit Props**: Define explicit types for all props. Avoid inferring complex object structures without interfaces.
- **Async/Await**: Prefer `async/await` over promise chains.
- **Idempotency**: API limits and idempotency keys are enforced by backend. Ensure frontend handles 429 (Too Many Requests) and idempotent retries for payment/game actions.

## 5. Deployment & Stability

- **Platform**: Railway
- **Build**: Nixpacks (`nixpacks.toml`)
- **Stability**: Check `STABILITY_REPORT.md` for current infrastructure status (Rate limiting, DR, etc.).
- **Env Vars**: managed in Railway, local `.env` required for dev (API URL).
- **중요 — 프론트 변경 시 반드시 양쪽 레포 모두 커밋/푸시**:
  1. `npm run build` in waitplay-frontend
  2. `git add && git commit && git push` in **waitplay-frontend** (소스 보존)
  3. `rm -rf wwwroot/* && cp -r dist/* wwwroot/` in waitplay-backend
  4. `git add && git commit && git push` in **waitplay-backend** (배포)
  - 프론트 레포 푸시를 절대 빠뜨리지 말 것!

## 6. AI & "Vibe Coding" Integration

This project aims to transition from "vibe coding" to engineered stability.

- **Refactoring**: When refactoring, **ALWAYS** check for existing Cypress tests in `cypress/e2e`.
- **New Features**: Create a test plan first. "Vibe coding" allowed; but "Engineering verification" is mandatory.

## 7. Meaningful Claude Skills (Prompts)

Detailed prompt templates are available in `.claude/skills/`:

- **[Component Scaffolding](.claude/skills/component_scaffold.md)**: Generate Vue 3 components with explicit types and scoped CSS.
- **[Cypress Testing](.claude/skills/testing_guide.md)**: Generate robust E2E tests with API mocking.

### Quick Prompts

- **Refactor**: "Refactor [File]. Ensure strict typing and separation of concerns. Verify no regression with existing Cypress tests."
- **Stability**: "Review [File] for error handling and edge cases. Ensure it handles API failures gracefully (e.g., 429, 500)."

## 8. Admin Tab UI/CSS 패턴 가이드

모든 Admin 탭 컴포넌트는 Apple-inspired 디자인 시스템을 따릅니다. 새 탭 생성 시 반드시 이 패턴을 적용하세요.

### 루트 래퍼 (필수)

```css
.tab-content {
  padding: 50px 60px;
  background-color: #f5f5f7;
  min-height: 100vh;
  color: #1d1d1f;
  font-family: 'Noto Sans KR', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
}
@media (max-width: 768px) {
  .tab-content { padding: 30px 20px; }
}
```

### 컬러 시스템

| 용도 | 색상 |
|------|------|
| Primary Blue | `#0071e3` |
| Background | `#f5f5f7` |
| Text Primary | `#1d1d1f` |
| Text Secondary | `#86868b` |
| Text Tertiary | `#aeaeb2` |
| Border | `#d2d2d7` |
| Border Light | `#e5e5ea` |
| Surface | `#ffffff` |
| Surface Alt | `#fafafa` |
| Danger | `#ff3b30` |
| Success | `#34c759` |
| Warning | `#ff9500` |

### 주요 컴포넌트 패턴

- **페이지 헤더**: `font-size: 32px; font-weight: 800;` + 설명 `color: #86868b; font-size: 16px;` + `margin-bottom: 40px`
- **카드/섹션**: `background: white; border-radius: 20px; padding: 24~36px; box-shadow: 0 4px 24px rgba(0,0,0,0.04);`
- **테이블**: 카드 안에 래핑, `th { background: #fafafa; color: #86868b; font-size: 13px; }`, `td { font-size: 14px; }`
- **모달**: `border-radius: 24px; width: 560px; backdrop-filter: blur(8px);` + `surfaceRise` 애니메이션
- **버튼 Primary**: `background: #0071e3; border-radius: 12px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,113,227,0.3);`
- **버튼 Secondary**: `background: white; border: 2px solid #e5e5ea; border-radius: 12px;`
- **폼 입력**: `border: 2px solid #e5e5ea; border-radius: 12px; padding: 14px 16px; background: #fafafa;` focus시 `border-color: #0071e3`
- **배지**: `padding: 4px 10px; border-radius: 6px; font-size: 12px;` + 색상별 변형 (blue/green/red/yellow/gray/purple)
- **빈 상태**: `border-radius: 20px; padding: 80px 40px; text-align: center;` + 80px 원형 아이콘

### 폰트 크기 체계

| 용도 | 크기 / 무게 |
|------|-------------|
| 페이지 타이틀 | 32px / 800 |
| 섹션 타이틀 | 20px / 700 |
| 카드 타이틀 | 18px / 700 |
| 본문 | 14-15px / 400 |
| 라벨 | 14px / 600 |
| 테이블 헤더 | 13px / 600 |
| 배지 | 11-12px / 600 |
| KPI 숫자 | 28-36px / 700-800 |

### 간격 체계

| 용도 | 값 |
|------|-----|
| 탭 패딩 | 50px 60px (데스크톱) / 30px 20px (모바일) |
| 헤더 하단 여백 | 40px |
| 카드 패딩 | 24~36px |
| 폼 그룹 간격 | 24px |
| 그리드 간격 | 20~30px |
| 모달 패딩 | 28-32px |

### 반응형 브레이크포인트

- `1200px`: 그리드 2열 축소
- `768px`: 모바일 (padding 축소, 1열, 모달 95%)
- `600px`: 그리드 1열

> **참고**: 상세 CSS 코드 스니펫은 `memory/admin-tab-css-patterns.md` 참조
