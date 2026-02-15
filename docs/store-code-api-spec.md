# Store Code API 명세

매장 코드(Store Code)를 통한 빠른 쿠폰 사용 처리 기능을 위한 Backend API 명세입니다.

## 개요

매장 코드는 직원이 고객의 쿠폰을 빠르게 사용 처리할 수 있도록 하는 6자리 인증 코드입니다.
기존 Admin 패널에서 쿠폰 코드를 일일이 입력하는 방식 외에, 고객의 쿠폰 화면에서 직원이 매장 코드만 입력하면 바로 사용 처리됩니다.

## API 엔드포인트

### 1. 매장 코드로 쿠폰 사용 처리

고객의 쿠폰 화면에서 직원이 매장 코드를 입력하여 쿠폰을 사용 처리합니다.

```
POST /api/coupons/redeem-with-store-code
```

**Request Body:**
```json
{
  "couponCode": "ABC123",    // 쿠폰 코드 (필수)
  "storeCode": "X7K9P2"      // 매장 코드 (필수, 6자리)
}
```

**Response (성공):**
```json
{
  "success": true,
  "message": "쿠폰이 사용되었습니다",
  "usedAt": "2024-01-15T10:30:00Z"
}
```

**Response (실패):**
```json
{
  "success": false,
  "message": "매장 코드가 올바르지 않습니다"
}
```

**에러 케이스:**
- 400: 잘못된 요청 (필수 필드 누락)
- 401: 매장 코드가 유효하지 않음
- 404: 쿠폰을 찾을 수 없음
- 409: 이미 사용된 쿠폰
- 410: 만료된 쿠폰

---

### 1-2. 매장 코드로 혜택 직접 인정 (쿠폰 생성 실패 시)

쿠폰 생성이 실패했을 때, 매장 코드로 혜택을 직접 인정합니다.
쿠폰 없이 benefitId와 storeCode로 직접 처리합니다.

```
POST /api/coupons/redeem-benefit-direct
```

**Request Body:**
```json
{
  "benefitId": "uuid-benefit-id",   // 혜택 ID (필수)
  "userId": "uuid-user-id",         // 사용자 ID (필수)
  "storeCode": "X7K9P2",            // 매장 코드 (필수, 6자리)
  "gameScoreId": "uuid-score-id"    // 게임 점수 ID (선택)
}
```

**Response (성공):**
```json
{
  "success": true,
  "message": "혜택이 인정되었습니다",
  "redeemedAt": "2024-01-15T10:30:00Z"
}
```

**Response (실패):**
```json
{
  "success": false,
  "message": "매장 코드가 올바르지 않습니다"
}
```

**에러 케이스:**
- 400: 잘못된 요청 (필수 필드 누락)
- 401: 매장 코드가 유효하지 않음
- 404: 혜택을 찾을 수 없음
- 403: 해당 혜택을 받을 자격이 없음 (점수 미달 등)

**비즈니스 로직:**
1. storeCode가 해당 benefitId의 QR 코드와 연결된 매장 코드인지 확인
2. 사용자가 해당 혜택을 받을 자격이 있는지 확인 (점수 등)
3. 직접 인정 기록 생성 (BenefitRedemption 테이블)
4. 통계에 반영

---

### 2. 매장 코드 조회

현재 설정된 매장 코드와 사용 통계를 조회합니다.

```
GET /api/store-code/{qrCodeId}
```

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (성공):**
```json
{
  "storeCode": "X7K9P2",
  "createdAt": "2024-01-01T00:00:00Z",
  "stats": {
    "todayUsed": 5,
    "weekUsed": 32,
    "totalUsed": 128
  }
}
```

**Response (코드 없음):**
```json
{
  "storeCode": null,
  "stats": null
}
```
- HTTP 404 반환 가능

---

### 3. 매장 코드 생성/재생성

새로운 매장 코드를 생성합니다. 기존 코드가 있으면 무효화되고 새 코드가 생성됩니다.

```
POST /api/store-code/{qrCodeId}/regenerate
```

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (성공):**
```json
{
  "storeCode": "M3N8Q1",
  "createdAt": "2024-01-15T10:30:00Z",
  "previousCodeInvalidated": true
}
```

**권한:**
- Admin 또는 Company 역할을 가진 사용자만 접근 가능
- 해당 QR 코드의 소유자여야 함

---

## 데이터베이스 스키마

### StoreCode 테이블

```sql
CREATE TABLE "StoreCodes" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "QrCodeId" UUID NOT NULL REFERENCES "QrCodes"("Id"),
    "Code" VARCHAR(10) NOT NULL UNIQUE,
    "CreatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "IsActive" BOOLEAN DEFAULT TRUE,
    "UsageCount" INTEGER DEFAULT 0,

    CONSTRAINT "FK_StoreCodes_QrCodes"
        FOREIGN KEY ("QrCodeId") REFERENCES "QrCodes"("Id") ON DELETE CASCADE
);

CREATE INDEX "IX_StoreCodes_Code" ON "StoreCodes"("Code");
CREATE INDEX "IX_StoreCodes_QrCodeId" ON "StoreCodes"("QrCodeId");
```

### StoreCodeUsageLog 테이블 (선택적)

매장 코드 사용 이력을 추적합니다.

```sql
CREATE TABLE "StoreCodeUsageLogs" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "StoreCodeId" UUID NOT NULL REFERENCES "StoreCodes"("Id"),
    "CouponId" UUID NOT NULL REFERENCES "Coupons"("Id"),
    "UsedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT "FK_StoreCodeUsageLogs_StoreCodes"
        FOREIGN KEY ("StoreCodeId") REFERENCES "StoreCodes"("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_StoreCodeUsageLogs_Coupons"
        FOREIGN KEY ("CouponId") REFERENCES "Coupons"("Id") ON DELETE CASCADE
);
```

---

## 구현 노트

### 매장 코드 생성 규칙
- 6자리 영문 대문자 + 숫자 조합
- 혼동하기 쉬운 문자 제외: O, 0, I, 1, L
- 사용 가능 문자: `ABCDEFGHJKMNPQRSTUVWXYZ23456789`

### 보안 고려사항
1. 매장 코드는 QR 코드 소유자만 조회/재생성 가능
2. 쿠폰 사용 처리 시 매장 코드가 해당 쿠폰의 QR 코드와 연결되어 있는지 확인
3. 매장 코드 재생성 시 기존 코드 즉시 무효화
4. Rate limiting 적용 권장 (브루트포스 방지)

### 통계 계산
- `todayUsed`: 오늘 자정 이후 사용 건수
- `weekUsed`: 이번 주 월요일 이후 사용 건수
- `totalUsed`: 전체 사용 건수 (StoreCode.UsageCount 또는 로그 집계)

---

## 프론트엔드 연동

### 파일 위치
- 쿠폰 화면 UI: `src/components/GameResultModal.vue`
- API 서비스: `src/services/couponsService.ts`
- 매장 코드 관리: `src/components/StoreCodeManagement.vue`
- 설정 탭: `src/components/SettingsTab.vue`

### 추가된 API 함수
```typescript
// couponsService.ts

// 쿠폰 코드 + 매장 코드로 사용 처리
async redeemWithStoreCode(request: RedeemWithStoreCodeRequest): Promise<RedeemWithStoreCodeResponse>

// 쿠폰 생성 실패 시 매장 코드로 혜택 직접 인정
async redeemBenefitDirect(request: RedeemBenefitDirectRequest): Promise<RedeemBenefitDirectResponse>
```

### 사용 시나리오

**시나리오 1: 정상 흐름**
1. 사용자 게임 완료 → 쿠폰 생성 성공 → 쿠폰 코드 표시
2. 직원이 매장 코드 입력 → `redeemWithStoreCode` API 호출 → 사용 완료

**시나리오 2: 쿠폰 생성 실패 시**
1. 사용자 게임 완료 → 쿠폰 생성 실패 (서버 오류 등)
2. 에러 화면에서 매장 코드 입력란 표시
3. 직원이 매장 코드 입력 → `redeemBenefitDirect` API 호출 → 혜택 인정 완료
