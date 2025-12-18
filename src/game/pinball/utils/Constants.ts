/**
 * Hyper-Pinball Constants
 * 물리 상수 및 게임 설정값 - 튜닝 포인트
 */

// ===== 뷰포트 설정 =====
export const VIEWPORT = {
  // 논리 해상도 (9:16 비율)
  LOGICAL_WIDTH: 1080,
  LOGICAL_HEIGHT: 1920,

  // 테이블 영역 (논리 좌표 기준)
  TABLE_TOP: 200,
  TABLE_BOTTOM: 1800,
  TABLE_LEFT: 50,
  TABLE_RIGHT: 1030,
} as const;

// ===== 물리 설정 =====
export const PHYSICS = {
  // 중력 (핀볼 테이블 경사각 6.5° 시뮬레이션)
  GRAVITY_X: 0,
  GRAVITY_Y: 15, // 약한 중력 (실제 중력의 약 0.15배)

  // 공 속성
  BALL: {
    RADIUS: 20,
    DENSITY: 1.0,
    RESTITUTION: 0.6, // 탄성 (0-1)
    FRICTION: 0.1,
    LINEAR_DAMPING: 0.01, // 공기 저항 (거의 없음)
    ANGULAR_DAMPING: 0.05,
    CCD_ENABLED: true, // Continuous Collision Detection
  },

  // 플리퍼 속성
  FLIPPER: {
    LENGTH: 180,
    WIDTH: 30,
    PIVOT_OFFSET: 20, // 회전축 오프셋
    REST_ANGLE: 0.5, // 대기 각도 (라디안)
    ACTIVE_ANGLE: -0.5, // 활성화 각도 (라디안)
    ANGULAR_VELOCITY: 35, // 회전 속도
    RESTITUTION: 0.4,
    FRICTION: 0.8, // 높은 마찰로 스핀 효과
  },

  // 범퍼 속성
  BUMPER: {
    RADIUS: 40,
    RESTITUTION: 1.5, // 반발력 (1보다 크면 에너지 추가)
    FORCE_MULTIPLIER: 800, // 충돌 시 가해지는 힘
  },

  // 벽 속성
  WALL: {
    RESTITUTION: 0.5,
    FRICTION: 0.3,
  },

  // 발사대
  PLUNGER: {
    MIN_FORCE: 500,
    MAX_FORCE: 2000,
    CHARGE_RATE: 1500, // 초당 충전량
  },
} as const;

// ===== 게임 설정 =====
export const GAME = {
  INITIAL_BALLS: 3,
  MAX_COMBO_MULTIPLIER: 10,
  COMBO_TIMEOUT: 2000, // ms

  // 점수
  SCORE: {
    BUMPER_BASE: 100,
    TARGET_BASE: 500,
    LANE_BONUS: 1000,
    RAMP_BONUS: 2000,
  },

  // 틸트 (흔들기 제한)
  TILT: {
    WARNING_THRESHOLD: 3, // 경고 횟수
    SENSITIVITY: 15, // 감도 (낮을수록 민감)
    COOLDOWN: 500, // ms
  },
} as const;

// ===== 렌더링 설정 =====
export const RENDER = {
  BACKGROUND_COLOR: 0x1a1a2e,

  // 색상 팔레트
  COLORS: {
    PRIMARY: 0x667eea,
    SECONDARY: 0x764ba2,
    ACCENT: 0x4facfe,
    SUCCESS: 0x10b981,
    DANGER: 0xef4444,
    WARNING: 0xfbbf24,
    BALL: 0xc0c0c0, // 은색 공
    FLIPPER: 0xe74c3c, // 빨간 플리퍼
    BUMPER_ACTIVE: 0xff6b6b,
    BUMPER_INACTIVE: 0xcc5555,
  },

  // 이펙트
  EFFECTS: {
    TRAIL_LENGTH: 10,
    TRAIL_ALPHA_DECAY: 0.1,
    PARTICLE_COUNT: 20,
  },
} as const;

// ===== 입력 설정 =====
export const INPUT = {
  // 터치 영역 분할 (화면 너비 기준 비율)
  LEFT_ZONE_END: 0.5, // 0~50% = 왼쪽 플리퍼
  RIGHT_ZONE_START: 0.5, // 50~100% = 오른쪽 플리퍼

  // 자이로 설정
  GYRO: {
    NUDGE_THRESHOLD: 12, // 흔들기 감지 임계값
    NUDGE_FORCE: 200, // 흔들기 힘
    MAX_TILT_ANGLE: 5, // 최대 기울기 각도 (도)
  },
} as const;

// ===== 햅틱 설정 =====
export const HAPTICS = {
  BUMP: 10, // ms - 가벼운 충돌
  FLIP: 30, // ms - 플리퍼 타격
  SCORE: [20, 10, 20], // 패턴 - 점수 획득
  TILT_WARNING: [50, 30, 50, 30, 50], // 패턴 - 틸트 경고
} as const;

// ===== 테이블 레이아웃 =====
export const TABLE_LAYOUT = {
  // 플리퍼 위치 (테이블 중앙 하단)
  LEFT_FLIPPER: { x: 380, y: 1580 },
  RIGHT_FLIPPER: { x: 700, y: 1580 },

  // 범퍼 위치 (상단 중앙 영역)
  BUMPERS: [
    { x: 540, y: 450, radius: 50 },   // 중앙 상단
    { x: 350, y: 600, radius: 45 },   // 왼쪽
    { x: 730, y: 600, radius: 45 },   // 오른쪽
    { x: 540, y: 750, radius: 40 },   // 중앙 하단
  ],

  // 타겟 위치 (양쪽 레인)
  TARGETS: [
    { x: 150, y: 450 },
    { x: 150, y: 600 },
    { x: 930, y: 450 },
    { x: 930, y: 600 },
  ],

  // 발사대 위치 (오른쪽 레인)
  PLUNGER: { x: 980, y: 1650 },

  // 공 시작 위치 (발사대 레인 안)
  BALL_START: { x: 980, y: 1400 },

  // 드레인 (플리퍼 아래 중앙)
  DRAIN: { x: 540, y: 1750, width: 200, height: 60 },
} as const;
