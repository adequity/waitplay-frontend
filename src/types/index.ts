export type Store = {
    id: string;
    ownerId: string;
    name: string;
    logoUrl?: string | null;
    themeColor?: string | null;
    subscriptionStatus: 'ACTIVE' | 'INACTIVE';
    qrCodeUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type Game = {
    id: string;
    storeId: string;
    gameType: 'PINBALL' | 'MATCH' | 'SPOT';
    isActive: boolean;
    config?: any;
    createdAt: Date;
    updatedAt: Date;
};

export type Reward = {
    id: string;
    storeId: string;
    gameId: string;
    targetScore: number;
    rewardName: string;
    rewardImage?: string | null;
    probability: number;
    createdAt: Date;
};

export type Coupon = {
    id: string;
    code: string;
    userId: string;
    storeId: string;
    rewardName: string;
    status: 'ISSUED' | 'USED' | 'EXPIRED';
    issuedAt: Date;
    usedAt?: Date | null;
};

export type GameLog = {
    id: string;
    userId?: string | null;
    storeId: string;
    gameId: string;
    gameType: 'PINBALL' | 'MATCH' | 'SPOT';
    score: number;
    playedAt: Date;
};

export type CRMMessage = {
    id: string;
    storeId: string;
    title: string;
    content: string;
    targetGroup: 'ALL' | 'VIP' | 'NEW' | 'AT_RISK';
    sentCount: number;
    sentAt?: Date | null;
    createdAt: Date;
};
