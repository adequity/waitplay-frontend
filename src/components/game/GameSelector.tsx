'use client';

/**
 * Game Selector Component
 * 게임 선택 화면
 */

import { GAME_TYPES, GameType } from '@/game/config';

interface GameSelectorProps {
  onSelectGame: (gameType: GameType) => void;
  storeName: string;
  availableGames: {
    type: GameType;
    isActive: boolean;
    name: string;
    description: string;
  }[];
}

export default function GameSelector({ onSelectGame, storeName, availableGames }: GameSelectorProps) {
  const gameInfo: Record<GameType, { icon: string; color: string }> = {
    PINBALL: { icon: '🎯', color: 'from-blue-500 to-purple-600' },
    MATCH: { icon: '🃏', color: 'from-purple-500 to-pink-600' },
    SPOT: { icon: '🔍', color: 'from-pink-500 to-rose-600' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">{storeName}</h1>
        <p className="text-gray-300 text-lg">대기 시간 동안 게임을 즐기세요! 🎮</p>
      </div>

      {/* Game Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {availableGames.map((game) => {
          const info = gameInfo[game.type];
          return (
            <button
              key={game.type}
              onClick={() => game.isActive && onSelectGame(game.type)}
              disabled={!game.isActive}
              className={`
                relative overflow-hidden rounded-2xl p-8
                transition-all duration-300 transform
                ${game.isActive
                  ? 'hover:scale-105 hover:shadow-2xl cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
                }
                bg-gradient-to-br ${info.color}
              `}
            >
              {/* Icon */}
              <div className="text-6xl mb-4 text-center">{info.icon}</div>

              {/* Game Name */}
              <h3 className="text-2xl font-bold text-white mb-2 text-center">
                {game.name}
              </h3>

              {/* Description */}
              <p className="text-white/80 text-sm text-center mb-4">
                {game.description}
              </p>

              {/* Status Badge */}
              {!game.isActive && (
                <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                  준비중
                </div>
              )}

              {/* Play Button */}
              {game.isActive && (
                <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-lg py-2 text-white font-semibold text-center">
                  플레이하기 →
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Info */}
      <div className="mt-12 text-center text-gray-400">
        <p className="text-sm">게임 후 점수를 등록하고 혜택을 받으세요!</p>
      </div>
    </div>
  );
}
