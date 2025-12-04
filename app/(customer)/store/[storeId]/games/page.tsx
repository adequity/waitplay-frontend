'use client';

/**
 * Games Selection Page
 * 게임 선택 페이지
 */

import { useParams, useRouter } from 'next/navigation';
import GameSelector from '@/components/game/GameSelector';
import { GameType } from '@/game/config';

export default function GamesPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;

  // TODO: API에서 매장 및 게임 정보 가져오기
  const availableGames = [
    {
      type: 'PINBALL' as GameType,
      name: '핀볼 게임',
      description: '공을 튕겨서 벽돌을 깨고 높은 점수를 획득하세요!',
      isActive: true
    },
    {
      type: 'MATCH' as GameType,
      name: '카드 매칭',
      description: '같은 그림의 카드를 찾아 짝을 맞춰보세요!',
      isActive: true
    },
    {
      type: 'SPOT' as GameType,
      name: '차이점 찾기',
      description: '두 그림에서 차이점 5개를 찾으세요!',
      isActive: true
    }
  ];

  const handleSelectGame = (gameType: GameType) => {
    router.push(`/store/${storeId}/games/play?type=${gameType}`);
  };

  return (
    <GameSelector
      onSelectGame={handleSelectGame}
      storeName="BBQ 홍대점"
      availableGames={availableGames}
    />
  );
}
