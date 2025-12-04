'use client';

/**
 * Game Result Page
 * 게임 결과 및 쿠폰 발급 페이지
 */

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import LoginModal from '@/components/customer/LoginModal';
import { GameType } from '@/game/config';

interface Reward {
  id: string;
  name: string;
  targetScore: number;
  achieved: boolean;
}

function GameResultContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const storeId = params.storeId as string;
  const gameType = searchParams.get('type') as GameType;
  const score = parseInt(searchParams.get('score') || '0');

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [couponIssued, setCouponIssued] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    // TODO: API에서 리워드 정보 가져오기
    // 임시 데이터
    setRewards([
      {
        id: '1',
        name: '콜라 1개',
        targetScore: 500,
        achieved: score >= 500
      },
      {
        id: '2',
        name: '사이드 메뉴',
        targetScore: 1000,
        achieved: score >= 1000
      },
      {
        id: '3',
        name: '치킨 1마리',
        targetScore: 2000,
        achieved: score >= 2000
      }
    ]);
  }, [score]);

  const achievedReward = rewards.find(r => r.achieved);
  const bestReward = rewards.filter(r => r.achieved).sort((a, b) => b.targetScore - a.targetScore)[0];

  const handleRegisterScore = () => {
    setShowLoginModal(true);
  };

  const handleLoginSuccess = async (userData: any) => {
    setShowLoginModal(false);
    setIsLoggedIn(true);

    // TODO: API로 점수 등록 및 쿠폰 발급
    setTimeout(() => {
      setCouponIssued(true);
    }, 500);
  };

  const handleUseCoupon = () => {
    if (bestReward) {
      router.push(`/store/${storeId}/coupon?rewardId=${bestReward.id}`);
    }
  };

  const gameNames: Record<GameType, string> = {
    PINBALL: '핀볼 게임',
    MATCH: '카드 매칭',
    SPOT: '차이점 찾기'
  };

  const gameIcons: Record<GameType, string> = {
    PINBALL: '🎯',
    MATCH: '🃏',
    SPOT: '🔍'
  };

  return (
    <>
      <div className="min-h-screen p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full">
          {/* Result Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-6">
            {/* Game Info */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">{gameIcons[gameType]}</div>
              <h2 className="text-xl font-semibold text-gray-300 mb-2">
                {gameNames[gameType]}
              </h2>
              <div className="text-5xl font-bold text-white mb-2">
                {score.toLocaleString()}
              </div>
              <p className="text-gray-400">점</p>
            </div>

            {/* Achievement Status */}
            {achievedReward ? (
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🎉</div>
                  <div className="flex-1">
                    <p className="text-green-400 font-bold text-lg">
                      목표 달성!
                    </p>
                    <p className="text-white text-sm">
                      {bestReward?.name} 쿠폰을 받으실 수 있습니다
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">💪</div>
                  <div className="flex-1">
                    <p className="text-gray-300 font-semibold">
                      조금 더 힘내세요!
                    </p>
                    <p className="text-gray-400 text-sm">
                      다음 목표: {rewards[0]?.targetScore}점 ({rewards[0]?.name})
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rewards List */}
            <div className="space-y-2 mb-6">
              <p className="text-sm font-semibold text-gray-400 mb-3">리워드 현황</p>
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    reward.achieved
                      ? 'bg-green-500/20 border border-green-500/30'
                      : 'bg-gray-800/50 border border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {reward.achieved ? '✅' : '⭕'}
                    </span>
                    <span className={`font-medium ${
                      reward.achieved ? 'text-white' : 'text-gray-400'
                    }`}>
                      {reward.name}
                    </span>
                  </div>
                  <span className={`text-sm ${
                    reward.achieved ? 'text-green-400' : 'text-gray-500'
                  }`}>
                    {reward.targetScore}점
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            {!isLoggedIn ? (
              <div className="space-y-3">
                {achievedReward && (
                  <button
                    onClick={handleRegisterScore}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105"
                  >
                    쿠폰 받기 🎁
                  </button>
                )}
                <button
                  onClick={() => router.push(`/store/${storeId}/games`)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-xl transition-colors"
                >
                  다시 플레이하기
                </button>
              </div>
            ) : couponIssued ? (
              <div className="space-y-3">
                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
                  <p className="text-green-400 font-bold mb-1">쿠폰이 발급되었습니다!</p>
                  <p className="text-white text-sm">{bestReward?.name}</p>
                </div>
                <button
                  onClick={handleUseCoupon}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all"
                >
                  쿠폰 사용하기
                </button>
                <button
                  onClick={() => router.push(`/store/${storeId}/games`)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-xl transition-colors"
                >
                  다시 플레이하기
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-white">점수 등록 중...</p>
              </div>
            )}
          </div>

          {/* Share Button */}
          <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl transition-colors">
            친구에게 공유하기 📤
          </button>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

export default function GameResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    }>
      <GameResultContent />
    </Suspense>
  );
}
