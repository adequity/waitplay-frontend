'use client';

/**
 * Login Modal Component
 * 소셜 로그인 모달
 */

import { useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userData: any) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleKakaoLogin = async () => {
    setLoading(true);
    try {
      // TODO: 실제 카카오 로그인 구현
      // 임시로 성공 처리
      setTimeout(() => {
        onLoginSuccess({
          id: 'user123',
          nickname: '테스트유저',
          provider: 'kakao'
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Kakao login failed:', error);
      setLoading(false);
    }
  };

  const handleNaverLogin = async () => {
    setLoading(true);
    try {
      // TODO: 실제 네이버 로그인 구현
      setTimeout(() => {
        onLoginSuccess({
          id: 'user456',
          nickname: '테스트유저',
          provider: 'naver'
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Naver login failed:', error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-700">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎁</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            로그인하고 쿠폰 받기
          </h2>
          <p className="text-gray-400">
            점수를 등록하고 혜택을 확인하세요
          </p>
        </div>

        {/* Login Buttons */}
        <div className="space-y-3">
          {/* Kakao Login */}
          <button
            onClick={handleKakaoLogin}
            disabled={loading}
            className="w-full bg-[#FEE500] hover:bg-[#FDD800] text-[#000000] font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.5 1.5 4.7 3.8 6.1l-1 3.6c-.1.3.2.6.5.5l4.2-2.8c.8.1 1.6.2 2.5.2 5.5 0 10-3.5 10-7.5S17.5 3 12 3z"/>
            </svg>
            <span>카카오로 시작하기</span>
          </button>

          {/* Naver Login */}
          <button
            onClick={handleNaverLogin}
            disabled={loading}
            className="w-full bg-[#03C75A] hover:bg-[#02B350] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"/>
            </svg>
            <span>네이버로 시작하기</span>
          </button>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-gray-500 mt-6">
          로그인 시 WaitPlay의{' '}
          <button className="underline hover:text-gray-400">이용약관</button>과{' '}
          <button className="underline hover:text-gray-400">개인정보처리방침</button>에<br />
          동의하게 됩니다
        </p>

        {/* Guest Continue */}
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-sm underline"
          >
            로그인 없이 계속하기
          </button>
        </div>
      </div>
    </div>
  );
}
