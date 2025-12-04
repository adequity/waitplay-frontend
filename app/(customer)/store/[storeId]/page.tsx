'use client';

/**
 * Store Landing Page
 * QR 스캔 후 첫 랜딩 페이지 - 매장 소개 및 게임 시작
 */

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface StoreInfo {
  id: string;
  name: string;
  logoUrl?: string;
  themeColor: string;
  games: {
    id: string;
    type: 'PINBALL' | 'MATCH' | 'SPOT';
    name: string;
    description: string;
    isActive: boolean;
  }[];
}

export default function StoreLandingPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;

  const [store, setStore] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: API에서 매장 정보 가져오기
    // 임시 데이터
    setTimeout(() => {
      setStore({
        id: storeId,
        name: 'BBQ 홍대점',
        logoUrl: '',
        themeColor: '#6366f1',
        games: [
          {
            id: '1',
            type: 'PINBALL',
            name: '핀볼 게임',
            description: '공을 튕겨서 높은 점수를 획득하세요!',
            isActive: true
          },
          {
            id: '2',
            type: 'MATCH',
            name: '카드 매칭',
            description: '같은 카드를 찾아 짝을 맞춰보세요!',
            isActive: true
          },
          {
            id: '3',
            type: 'SPOT',
            name: '차이점 찾기',
            description: '두 그림의 차이점 5개를 찾으세요!',
            isActive: true
          }
        ]
      });
      setLoading(false);
    }, 500);
  }, [storeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎮</div>
          <p className="text-white text-xl">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">매장을 찾을 수 없습니다</h2>
          <p className="text-gray-400">올바른 QR 코드를 스캔해주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex flex-col">
      {/* Header */}
      <div className="text-center mb-8 mt-8">
        {store.logoUrl ? (
          <img
            src={store.logoUrl}
            alt={store.name}
            className="w-24 h-24 mx-auto mb-4 rounded-2xl"
          />
        ) : (
          <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <span className="text-5xl">🏪</span>
          </div>
        )}
        <h1 className="text-4xl font-bold text-white mb-3">{store.name}</h1>
        <p className="text-xl text-gray-300">대기하는 동안 게임을 즐기세요!</p>
      </div>

      {/* Welcome Card */}
      <div className="max-w-2xl mx-auto w-full mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-3">
              🎁 게임하고 혜택 받기
            </h2>
            <p className="text-gray-300">
              게임에서 높은 점수를 획득하면<br />
              특별한 쿠폰을 드립니다!
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🎮</div>
              <p className="text-sm text-white font-medium">무료 게임</p>
              <p className="text-xs text-gray-400">앱 설치 불필요</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-sm text-white font-medium">점수 경쟁</p>
              <p className="text-xs text-gray-400">최고 점수 도전</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🎁</div>
              <p className="text-sm text-white font-medium">즉시 혜택</p>
              <p className="text-xs text-gray-400">쿠폰 즉시 사용</p>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={() => router.push(`/store/${storeId}/games`)}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xl font-bold py-4 rounded-xl shadow-lg transform transition-all hover:scale-105"
          >
            게임 시작하기 →
          </button>
        </div>
      </div>

      {/* Available Games Preview */}
      <div className="max-w-2xl mx-auto w-full">
        <h3 className="text-xl font-bold text-white mb-4 text-center">
          플레이 가능한 게임
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {store.games.filter(g => g.isActive).map((game) => (
            <div
              key={game.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center"
            >
              <div className="text-4xl mb-2">
                {game.type === 'PINBALL' && '🎯'}
                {game.type === 'MATCH' && '🃏'}
                {game.type === 'SPOT' && '🔍'}
              </div>
              <p className="text-sm font-medium text-white">{game.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8 text-center">
        <p className="text-gray-400 text-sm">
          Powered by <span className="font-bold text-white">WaitPlay</span>
        </p>
      </div>
    </div>
  );
}
