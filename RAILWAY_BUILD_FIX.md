# Railway Frontend 빌드 실패 해결 가이드

## 🚨 현재 상태: 빌드 실패

**Frontend URL**: https://waitplay-frontend-production.up.railway.app (404)
**상태**: Build Failed

---

## 🔍 1단계: Railway 로그 확인 (가장 중요!)

### Railway Dashboard에서:

1. https://railway.com/project/83af42d4-94b5-47a4-8438-9697f391ba8d
2. **Frontend 서비스** 클릭
3. **Deployments** 탭 선택
4. 최신 deployment (빨간색 X) 클릭
5. **로그 전체 읽기** - 빨간색 에러 메시지 찾기

---

## 📋 일반적인 Next.js 빌드 에러와 해결책

### 에러 1: `Module not found` 또는 `Cannot find module`

**원인**: Dependencies 설치 실패

**해결**:
```bash
cd C:\Users\User\Desktop\waitplay-frontend

# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# 로컬 빌드 테스트
npm run build

# 정상 빌드 확인 후 커밋
git add package-lock.json
git commit -m "fix: Update package-lock.json"
git push origin main
```

---

### 에러 2: `Type error` 또는 TypeScript 에러

**원인**: TypeScript 타입 에러

**해결**:
```bash
# 로컬에서 TypeScript 체크
npm run build

# 에러 확인 후 수정
# 또는 임시로 빌드 에러 무시:
```

`next.config.ts` 수정:
```typescript
typescript: {
  ignoreBuildErrors: true, // 임시
}
```

---

### 에러 3: `ESLint` 에러

**원인**: ESLint 규칙 위반

**해결**:
```bash
# 로컬에서 ESLint 실행
npm run lint

# 에러 수정 또는 임시로 무시:
```

`next.config.ts` 수정:
```typescript
eslint: {
  ignoreDuringBuilds: true, // 임시
}
```

---

### 에러 4: `FATAL ERROR: Reached heap limit` (메모리 부족)

**원인**: Railway 빌드 메모리 부족

**해결**:

`package.json`의 `scripts` 수정:
```json
"scripts": {
  "build": "NODE_OPTIONS='--max_old_space_size=4096' next build"
}
```

---

### 에러 5: 환경 변수 부족

**원인**: `NEXT_PUBLIC_API_URL` 등 빌드 시 필요한 변수 없음

**해결**:

Railway Dashboard → Frontend 서비스 → **Variables** 확인:
```env
NEXT_PUBLIC_API_URL=https://waitplay-production.up.railway.app
DATABASE_URL=${{Postgres.DATABASE_URL}}
NEXTAUTH_URL=https://waitplay-frontend-production.up.railway.app
NEXTAUTH_SECRET=3Tki3SPQCH62nY6Rx4w2tlCIbg0yLZfWya0BhOt0Uh4
```

---

### 에러 6: Prisma 관련 에러

**원인**: Prisma 클라이언트 생성 실패

**해결**:

`package.json`에 postinstall 스크립트 추가:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "postinstall": "prisma generate"
}
```

---

## ✅ 빠른 해결 순서

### 1. 환경 변수 확인
```
Railway → Frontend 서비스 → Variables
최소 4개 변수 있어야 함
```

### 2. 로컬 빌드 테스트
```bash
cd C:\Users\User\Desktop\waitplay-frontend
npm install
npm run build
```

### 3. 빌드 에러 수정
```
TypeScript 에러, ESLint 에러 수정
또는 임시로 ignoreBuildErrors: true
```

### 4. 커밋 & 푸시
```bash
git add .
git commit -m "fix: Railway 빌드 에러 수정"
git push origin main
```

### 5. Railway 재배포 확인
```
Deployments 탭에서 초록색 체크마크 확인
```

---

## 🔧 임시 해결책 (빠른 배포)

### next.config.ts 수정:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // 임시: TypeScript 에러 무시
  },
  eslint: {
    ignoreDuringBuilds: true, // 임시: ESLint 에러 무시
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
```

### package.json에 postinstall 추가:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "postinstall": "prisma generate"
}
```

커밋 & 푸시:
```bash
git add next.config.ts package.json
git commit -m "fix: Railway 빌드 설정 임시 수정"
git push origin main
```

---

## 🎯 체크리스트

빌드 성공을 위한 확인 사항:

- [ ] Railway Variables에 환경 변수 4개 설정
- [ ] 로컬에서 `npm run build` 성공
- [ ] `package.json`에 postinstall 스크립트 추가
- [ ] `next.config.ts` 빌드 설정 확인
- [ ] Git 커밋 & 푸시
- [ ] Railway Deployments에서 초록색 체크마크
- [ ] Frontend URL 접속 확인

---

## 💡 디버깅 팁

**Railway 로그에서 찾을 키워드**:
- `ERROR`
- `FATAL`
- `Failed to compile`
- `Type error`
- `Module not found`
- `Cannot find module`

**로그 예시**:
```
✖ Type error: Property 'X' does not exist on type 'Y'
  → TypeScript 에러: 타입 수정 필요

✖ Module not found: Can't resolve 'phaser'
  → Dependencies 설치 실패: npm install 재실행

✖ FATAL ERROR: Reached heap limit
  → 메모리 부족: NODE_OPTIONS 설정 필요
```

---

**Railway Deployment 로그에서 어떤 에러가 보이나요?**

에러 메시지를 알려주시면 정확한 해결책을 제시하겠습니다!

**작성일**: 2025-12-05
