'use client';

/**
 * Coupon Page
 * 쿠폰 표시 및 사용 페이지
 */

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

interface Coupon {
  id: string;
  code: string;
  rewardName: string;
  storeId: string;
  storeName: string;
  issuedAt: string;
  status: 'ISSUED' | 'USED' | 'EXPIRED';
}

function CouponContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const storeId = params.storeId as string;
  const rewardId = searchParams.get('rewardId');

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [using, setUsing] = useState(false);

  useEffect(() => {
    // TODO: API에서 쿠폰 정보 가져오기
    setTimeout(() => {
      setCoupon({
        id: 'coupon123',
        code: 'WP-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        rewardName: '콜라 1개',
        storeId: storeId,
        storeName: 'BBQ 홍대점',
        issuedAt: new Date().toISOString(),
        status: 'ISSUED'
      });
      setLoading(false);
    }, 500);
  }, [storeId, rewardId]);

  const handleUseCoupon = async () => {
    if (!coupon) return;

    if (confirm('쿠폰을 사용하시겠습니까?\n사용 후에는 복구할 수 없습니다.')) {
      setUsing(true);

      // TODO: API로 쿠폰 사용 처리
      setTimeout(() => {
        setCoupon({ ...coupon, status: 'USED' });
        setUsing(false);
      }, 1000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">🎁</div>
          <p className="text-white text-xl">쿠폰 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">쿠폰을 찾을 수 없습니다</h2>
          <button
            onClick={() => router.push(`/store/${storeId}/games`)}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
          >
            게임 하러 가기
          </button>
        </div>
      </div>
    );
  }

  const isUsed = coupon.status === 'USED';

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isUsed ? '사용 완료' : '쿠폰'}
          </h1>
          <p className="text-gray-400">
            {isUsed ? '이미 사용된 쿠폰입니다' : '직원에게 보여주세요'}
          </p>
        </div>

        {/* Coupon Card */}
        <div className={`relative overflow-hidden rounded-3xl p-8 mb-6 ${
          isUsed
            ? 'bg-gray-800/50 border-2 border-gray-700'
            : 'bg-gradient-to-br from-indigo-600 to-purple-600 border-2 border-white/20 shadow-2xl'
        }`}>
          {/* Used Stamp */}
          {isUsed && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-9xl opacity-10 transform rotate-[-15deg]">
                ✓
              </div>
            </div>
          )}

          {/* Store Logo/Icon */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3">
              <span className="text-4xl">🏪</span>
            </div>
            <h3 className="text-lg font-semibold text-white/90">
              {coupon.storeName}
            </h3>
          </div>

          {/* Reward Name */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">🎁</div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {coupon.rewardName}
            </h2>
            <p className={`text-sm ${isUsed ? 'text-gray-500' : 'text-white/70'}`}>
              게임 달성 보상
            </p>
          </div>

          {/* Coupon Code */}
          <div className={`text-center py-4 rounded-xl mb-4 ${
            isUsed ? 'bg-gray-900/50' : 'bg-white/10 backdrop-blur-sm'
          }`}>
            <p className={`text-xs font-medium mb-1 ${
              isUsed ? 'text-gray-500' : 'text-white/70'
            }`}>
              쿠폰 코드
            </p>
            <p className={`text-2xl font-mono font-bold tracking-wider ${
              isUsed ? 'text-gray-600 line-through' : 'text-white'
            }`}>
              {coupon.code}
            </p>
          </div>

          {/* Issue Date */}
          <div className="text-center">
            <p className={`text-xs ${isUsed ? 'text-gray-600' : 'text-white/60'}`}>
              발급일시: {new Date(coupon.issuedAt).toLocaleString('ko-KR')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {!isUsed ? (
          <>
            {/* Instructions */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div className="flex-1">
                  <p className="text-blue-400 font-semibold mb-1">사용 방법</p>
                  <p className="text-sm text-gray-300">
                    직원에게 이 화면을 보여주고<br />
                    아래 "사용하기" 버튼을 눌러주세요
                  </p>
                </div>
              </div>
            </div>

            {/* Use Button */}
            <button
              onClick={handleUseCoupon}
              disabled={using}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-4 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 mb-3"
            >
              {using ? '사용 처리 중...' : '사용하기 ✓'}
            </button>
          </>
        ) : (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✅</span>
              <div className="flex-1">
                <p className="text-green-400 font-bold text-lg">사용 완료!</p>
                <p className="text-sm text-gray-400">
                  쿠폰이 성공적으로 사용되었습니다
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => router.push(`/store/${storeId}/games`)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-colors"
          >
            다시 게임하기 🎮
          </button>
          <button
            onClick={() => router.push(`/store/${storeId}`)}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-xl transition-colors"
          >
            처음으로
          </button>
        </div>

        {/* Warning */}
        {!isUsed && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              ⚠️ 쿠폰은 1회만 사용 가능하며, 사용 후 복구할 수 없습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CouponPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    }>
      <CouponContent />
    </Suspense>
  );
}
