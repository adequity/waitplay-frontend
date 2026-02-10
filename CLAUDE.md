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
