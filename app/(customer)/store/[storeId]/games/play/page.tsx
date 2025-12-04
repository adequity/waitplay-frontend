'use client';

/**
 * Game Play Page
 * 실제 게임 플레이 페이지
 */

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import GameContainer from '@/components/game/GameContainer';
import { GameType } from '@/game/config';

function GamePlayContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const storeId = params.storeId as string;
  const gameType = searchParams.get('type') as GameType;

  const [gameEnded, setGameEnded] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  if (!gameType || !['PINBALL', 'MATCH', 'SPOT'].includes(gameType)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">잘못된 게임 타입</h2>
          <button
            onClick={() => router.push(`/store/${storeId}/games`)}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
          >
            게임 선택으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const handleGameEnd = (score: number) => {
    setFinalScore(score);
    setGameEnded(true);

    // 결과 페이지로 이동
    setTimeout(() => {
      router.push(`/store/${storeId}/games/result?type=${gameType}&score=${score}`);
    }, 2000);
  };

  const gameNames: Record<GameType, string> = {
    PINBALL: '핀볼 게임',
    MATCH: '카드 매칭',
    SPOT: '차이점 찾기'
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm('게임을 종료하시겠습니까?')) {
                  router.push(`/store/${storeId}/games`);
                }
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← 뒤로
            </button>
            <h1 className="text-xl font-bold text-white">
              {gameNames[gameType]}
            </h1>
          </div>
          <div className="text-sm text-gray-400">
            BBQ 홍대점
          </div>
        </div>
      </div>

      {/* Game Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        {gameEnded ? (
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-2">게임 종료!</h2>
            <p className="text-xl text-gray-300 mb-4">최종 점수: {finalScore}</p>
            <p className="text-gray-400">결과 페이지로 이동 중...</p>
          </div>
        ) : (
          <GameContainer
            gameType={gameType}
            storeId={storeId}
            onGameEnd={handleGameEnd}
          />
        )}
      </div>

      {/* Instructions */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span>⌨️</span>
              <span>키보드 또는 터치로 조작</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🎯</span>
              <span>높은 점수를 목표로!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GamePlayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    }>
      <GamePlayContent />
    </Suspense>
  );
}
