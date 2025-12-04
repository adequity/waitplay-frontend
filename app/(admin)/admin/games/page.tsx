'use client';

/**
 * Games Management Page
 * 게임 관리 페이지 - 게임 ON/OFF 및 리워드 설정
 */

import { useState } from 'react';

interface Game {
  id: string;
  type: 'PINBALL' | 'MATCH' | 'SPOT';
  name: string;
  isActive: boolean;
  rewards: {
    targetScore: number;
    rewardName: string;
    probability: number;
  }[];
}

export default function GamesManagementPage() {
  const [games, setGames] = useState<Game[]>([
    {
      id: '1',
      type: 'PINBALL',
      name: '핀볼 게임',
      isActive: true,
      rewards: [
        { targetScore: 1000, rewardName: '콜라 1개', probability: 100 },
        { targetScore: 2000, rewardName: '치킨 1개', probability: 50 }
      ]
    },
    {
      id: '2',
      type: 'MATCH',
      name: '카드 매칭',
      isActive: true,
      rewards: [
        { targetScore: 800, rewardName: '사이드 메뉴', probability: 100 }
      ]
    },
    {
      id: '3',
      type: 'SPOT',
      name: '차이점 찾기',
      isActive: false,
      rewards: []
    }
  ]);

  const [editingGame, setEditingGame] = useState<Game | null>(null);

  const toggleGame = (gameId: string) => {
    setGames(games.map(game =>
      game.id === gameId ? { ...game, isActive: !game.isActive } : game
    ));
  };

  const gameIcons: Record<string, string> = {
    PINBALL: '🎯',
    MATCH: '🃏',
    SPOT: '🔍'
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">게임 관리</h1>
        <p className="text-gray-400">게임 활성화 및 리워드를 설정하세요</p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <div
            key={game.id}
            className={`
              bg-gray-800 rounded-xl p-6 border-2 transition-all
              ${game.isActive ? 'border-indigo-600' : 'border-gray-700'}
            `}
          >
            {/* Game Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{gameIcons[game.type]}</span>
                <div>
                  <h3 className="text-xl font-bold text-white">{game.name}</h3>
                  <p className="text-sm text-gray-400">{game.type}</p>
                </div>
              </div>
              <button
                onClick={() => toggleGame(game.id)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full
                  transition-colors focus:outline-none
                  ${game.isActive ? 'bg-indigo-600' : 'bg-gray-600'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${game.isActive ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {/* Status Badge */}
            <div className="mb-4">
              <span className={`
                inline-block px-3 py-1 rounded-full text-sm font-medium
                ${game.isActive
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-gray-600/20 text-gray-400'
                }
              `}>
                {game.isActive ? '● 활성화' : '○ 비활성화'}
              </span>
            </div>

            {/* Rewards */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">리워드 설정</h4>
              {game.rewards.length > 0 ? (
                <div className="space-y-2">
                  {game.rewards.map((reward, idx) => (
                    <div key={idx} className="bg-gray-900 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-white font-medium">{reward.rewardName}</span>
                        <span className="text-xs text-indigo-400">{reward.probability}%</span>
                      </div>
                      <p className="text-sm text-gray-400">{reward.targetScore}점 이상</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">리워드 없음</p>
              )}
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setEditingGame(game)}
              disabled={!game.isActive}
              className={`
                w-full py-2 rounded-lg font-medium transition-colors
                ${game.isActive
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              리워드 설정
            </button>
          </div>
        ))}
      </div>

      {/* Edit Modal (간단 버전) */}
      {editingGame && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-white mb-4">
              {editingGame.name} 리워드 설정
            </h3>
            <p className="text-gray-400 mb-6">
              게임 점수에 따른 리워드를 설정하세요
            </p>

            {/* TODO: 리워드 추가/수정 폼 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  목표 점수
                </label>
                <input
                  type="number"
                  placeholder="1000"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  리워드 이름
                </label>
                <input
                  type="text"
                  placeholder="예: 콜라 1개"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  당첨 확률 (%)
                </label>
                <input
                  type="number"
                  placeholder="100"
                  min="0"
                  max="100"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingGame(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium"
              >
                취소
              </button>
              <button
                onClick={() => {
                  // TODO: 저장 로직
                  setEditingGame(null);
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
