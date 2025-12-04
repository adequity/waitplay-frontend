'use client';

/**
 * Store Settings Page
 * 매장 설정 페이지 - 브랜딩, QR 코드 관리
 */

import { useState } from 'react';

export default function StoreSettingsPage() {
  const [storeInfo, setStoreInfo] = useState({
    name: 'BBQ 홍대점',
    logoUrl: '',
    themeColor: '#6366f1',
    qrCodeUrl: 'https://waitplay.com/store/abc123'
  });

  const handleSave = () => {
    // TODO: API 저장 로직
    alert('저장되었습니다!');
  };

  const handleGenerateQR = () => {
    // TODO: QR 코드 재생성 로직
    alert('QR 코드가 갱신되었습니다!');
  };

  const handleDownloadQR = () => {
    // TODO: QR 코드 다운로드 로직
    alert('QR 코드 다운로드 시작!');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">매장 설정</h1>
        <p className="text-gray-400">매장 정보와 브랜딩을 관리하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Store Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6">기본 정보</h3>

            <div className="space-y-4">
              {/* Store Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  매장명
                </label>
                <input
                  type="text"
                  value={storeInfo.name}
                  onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                  placeholder="매장 이름을 입력하세요"
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  매장 로고
                </label>
                <div className="flex items-center gap-4">
                  {storeInfo.logoUrl ? (
                    <img
                      src={storeInfo.logoUrl}
                      alt="Store Logo"
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-3xl">🏪</span>
                    </div>
                  )}
                  <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    파일 선택
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  권장 크기: 200x200px, PNG 또는 JPG 형식
                </p>
              </div>

              {/* Theme Color */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  테마 컬러
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={storeInfo.themeColor}
                    onChange={(e) => setStoreInfo({ ...storeInfo, themeColor: e.target.value })}
                    className="w-20 h-12 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={storeInfo.themeColor}
                    onChange={(e) => setStoreInfo({ ...storeInfo, themeColor: e.target.value })}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    placeholder="#6366f1"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  고객이 보는 게임 화면의 브랜드 컬러로 사용됩니다
                </p>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              변경사항 저장
            </button>
          </div>

          {/* Subscription Info */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">구독 정보</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 mb-1">현재 플랜</p>
                <p className="text-2xl font-bold text-white">프로 플랜</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 mb-1">다음 결제일</p>
                <p className="text-lg font-semibold text-white">2025-01-15</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors">
                플랜 변경
              </button>
              <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors">
                결제 내역
              </button>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="space-y-6">
          {/* QR Code Card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">QR 코드</h3>

            {/* QR Code Display */}
            <div className="bg-white rounded-xl p-6 mb-4">
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                {/* TODO: 실제 QR 코드로 교체 */}
                <div className="text-center">
                  <div className="text-6xl mb-2">📱</div>
                  <p className="text-sm text-gray-600">QR 코드</p>
                </div>
              </div>
            </div>

            {/* QR URL */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                접속 URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={storeInfo.qrCodeUrl}
                  readOnly
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(storeInfo.qrCodeUrl);
                    alert('복사되었습니다!');
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  복사
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleDownloadQR}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                QR 코드 다운로드
              </button>
              <button
                onClick={handleGenerateQR}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors"
              >
                QR 코드 재생성
              </button>
            </div>

            {/* Info */}
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-400">
                💡 매장 정보가 변경되면 QR 코드가 자동으로 갱신됩니다
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h4 className="text-lg font-bold text-white mb-4">QR 스캔 통계</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">오늘</span>
                <span className="text-white font-bold">45</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">이번 주</span>
                <span className="text-white font-bold">312</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">이번 달</span>
                <span className="text-white font-bold">1,234</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
