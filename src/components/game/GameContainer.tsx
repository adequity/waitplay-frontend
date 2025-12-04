'use client';

/**
 * Game Container Component
 * Phaser 게임을 React 컴포넌트로 감싸는 컨테이너
 */

import { useEffect, useRef, useState } from 'react';
import { gameManager } from '@/game/GameManager';
import { GameType } from '@/game/config';

interface GameContainerProps {
  gameType: GameType;
  storeId: string;
  onGameEnd: (score: number) => void;
}

export default function GameContainer({ gameType, storeId, onGameEnd }: GameContainerProps) {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!gameContainerRef.current) return;

    // 게임 초기화
    const game = gameManager.initGame(gameType, 'phaser-game-container');
    setIsLoading(false);

    // 게임 종료 이벤트 리스너
    const scene = game.scene.scenes[0];

    const handleGameOver = (data: { score: number }) => {
      onGameEnd(data.score);
    };

    const handleGameWin = (data: { score: number }) => {
      onGameEnd(data.score);
    };

    scene.events.on('gameOver', handleGameOver);
    scene.events.on('gameWin', handleGameWin);

    // 클린업
    return () => {
      scene.events.off('gameOver', handleGameOver);
      scene.events.off('gameWin', handleGameWin);
      gameManager.destroyGame();
    };
  }, [gameType, storeId, onGameEnd]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-white text-xl">Loading game...</div>
        </div>
      )}
      <div
        id="phaser-game-container"
        ref={gameContainerRef}
        className="max-w-full max-h-full"
      />
    </div>
  );
}
