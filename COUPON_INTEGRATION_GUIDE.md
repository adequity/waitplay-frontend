# 쿠폰 시스템 통합 가이드

## 개요
게임 완료 후 자동으로 쿠폰 혜택을 확인하고 사용자에게 제공하는 시스템입니다.

## 시스템 플로우

### 1. 게임 점수 제출
```typescript
// GameView.vue 또는 게임 컴포넌트에서
import gameService from '@/services/gameService'

async function submitScore(score: number) {
  const response = await gameService.submitScore({
    gameType: 'pinball', // 'memory', 'spot-difference' 등
    playerName: '플레이어',
    score: score,
    qrCode: qrCode,
    userId: userId // 로그인한 사용자인 경우
  })

  // response 구조:
  // {
  //   score: { ... },
  //   eligibleBenefit: {  // 점수가 조건을 만족하면 포함됨
  //     id: string,
  //     title: string,
  //     description: string,
  //     requiredScore: number
  //   }
  // }

  return response
}
```

### 2. 쿠폰 모달 표시
```vue
<template>
  <div class="game-container">
    <!-- 게임 화면 -->

    <!-- 쿠폰 보상 모달 -->
    <CouponRewardModal
      :is-open="showCouponModal"
      :benefit="eligibleBenefit"
      :user-id="userId"
      :game-score-id="gameScoreId"
      @close="handleCloseModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CouponRewardModal from '@/components/CouponRewardModal.vue'

const showCouponModal = ref(false)
const eligibleBenefit = ref<any>(null)
const gameScoreId = ref<string>('')
const userId = ref<string>('user-id-here')

async function onGameComplete(score: number) {
  const response = await submitScore(score)

  // 혜택이 있으면 모달 표시
  if (response.eligibleBenefit) {
    eligibleBenefit.value = response.eligibleBenefit
    gameScoreId.value = response.score.id
    showCouponModal.value = true
  }
}

function handleCloseModal() {
  showCouponModal.value = false
  // 게임 재시작 또는 결과 화면 표시
}
</script>
```

## 쿠폰 모달 작동 방식

### 초기 상태
- 혜택 정보 표시
- "지금 받기" / "나중에" 버튼

### 사용자가 "지금 받기" 선택
1. 쿠폰 코드 생성 API 호출
2. 5분 유효기간의 일회용 코드 생성
3. 큰 글씨로 쿠폰 코드 표시
4. 만료 시간 경고

### 사용자가 "나중에" 선택
- 모달 닫힘
- 쿠폰 기회 상실 (다시 받을 수 없음)

## 직원용 쿠폰 검증

### 접근 경로
- Admin 대시보드 → 사이드바 "쿠폰 검증" 버튼
- URL: `/admin/verify-coupon`

### 검증 프로세스
1. 고객이 쿠폰 코드 제시
2. 직원이 코드 입력
3. 시스템 자동 검증:
   - 코드 유효성
   - 만료 시간 확인
   - 중복 사용 확인
4. 성공 시:
   - 혜택 정보 표시
   - 자동으로 사용 처리
   - 5초 후 자동 초기화

## API 엔드포인트

### 게임 점수 제출 (자동 혜택 체크)
```
POST /api/game/score
Body: {
  gameType: string,
  playerName: string,
  score: number,
  qrCode?: string,
  userId?: string
}

Response: {
  score: GameScoreResponse,
  eligibleBenefit?: {
    id: string,
    title: string,
    description: string,
    requiredScore: number
  }
}
```

### 쿠폰 코드 생성
```
POST /api/coupons/generate
Body: {
  benefitId: string,
  userId: string,
  gameScoreId?: string
}

Response: {
  couponCode: string,
  benefitTitle: string,
  benefitDescription?: string,
  expiresAt: DateTime,
  expiresInMinutes: number
}
```

### 쿠폰 검증 및 사용
```
POST /api/coupons/verify
Body: {
  couponCode: string
}

Response: {
  isValid: boolean,
  benefitTitle: string,
  benefitDescription?: string,
  usedAt?: DateTime,
  message: string
}
```

## 데이터베이스 구조

### Benefits 테이블
- 혜택 설정 (게임별, 점수별 조건)
- 쿠폰 접두사, 유효기간 등

### BenefitIssuances 테이블
- 발급된 쿠폰 기록 (통계용)
- 사용 여부 및 사용 시간
- 만료 시간

## 중요 사항

### 쿠폰 철학
⚠️ **즉시 사용 원칙**
- 쿠폰은 저장되지 않음
- 게임 완료 즉시 사용해야 함
- "나중에" 선택 시 기회 상실
- 웨이팅 유도 목적

### 보안
- 쿠폰 코드는 5분간만 유효
- 일회용 (한 번 사용 후 무효화)
- 중복 사용 불가
- 만료된 코드 자동 거부

### 통계
- 발급/사용 추적
- 사용률 계산
- 게임별 분석

## 통합 체크리스트

- [ ] 게임 완료 시 점수 제출 API 연동
- [ ] 혜택 조건 만족 시 모달 표시
- [ ] CouponRewardModal 컴포넌트 import
- [ ] userId prop 전달 (로그인 사용자)
- [ ] gameScoreId prop 전달
- [ ] 모달 닫기 핸들러 구현
- [ ] 게임 재시작 로직 연결

## 테스트 시나리오

### 1. 정상 플로우
1. 게임 플레이
2. 높은 점수 달성 (혜택 조건 충족)
3. 쿠폰 모달 자동 표시
4. "지금 받기" 클릭
5. 쿠폰 코드 생성 및 표시
6. 직원 검증 페이지에서 코드 입력
7. 성공 메시지 확인

### 2. 만료 테스트
1. 쿠폰 코드 생성
2. 5분 대기
3. 코드 입력 시 만료 메시지 확인

### 3. 중복 사용 방지
1. 쿠폰 코드로 검증 성공
2. 동일 코드 재입력
3. "이미 사용된 쿠폰" 메시지 확인

## 예상 문제 및 해결

### 문제: 모달이 표시되지 않음
- userId가 제공되지 않았는지 확인
- 점수가 requiredScore 미만인지 확인
- 혜택이 비활성화되었는지 확인

### 문제: 쿠폰 생성 실패
- 발급 한도(MaxIssuance) 도달 확인
- 혜택이 활성 상태인지 확인
- 네트워크 오류 확인

### 문제: 검증 실패
- 코드 입력 오류 (대소문자 구분 없음)
- 만료 시간 확인
- 이미 사용된 코드인지 확인
