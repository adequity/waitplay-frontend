'use client';

/**
 * CRM Page
 * 고객 관계 관리 - 메시지 발송 및 고객 분석
 */

import { useState } from 'react';

export default function CRMPage() {
  const [selectedTarget, setSelectedTarget] = useState<'ALL' | 'VIP' | 'NEW' | 'AT_RISK'>('ALL');
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');

  const targetGroups = [
    { value: 'ALL', label: '전체 고객', count: 1234, icon: '👥' },
    { value: 'VIP', label: '단골 고객', count: 156, icon: '⭐' },
    { value: 'NEW', label: '신규 고객', count: 89, icon: '🆕' },
    { value: 'AT_RISK', label: '이탈 위험', count: 45, icon: '⚠️' }
  ];

  const recentMessages = [
    {
      id: 1,
      title: '주말 특별 이벤트',
      target: 'ALL',
      sentCount: 1234,
      sentAt: '2025-12-03 14:30'
    },
    {
      id: 2,
      title: '단골 감사 쿠폰',
      target: 'VIP',
      sentCount: 156,
      sentAt: '2025-12-01 10:00'
    }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">CRM</h1>
        <p className="text-gray-400">고객에게 메시지를 발송하고 관리하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Composer */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6">메시지 작성</h3>

            {/* Target Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                발송 대상
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {targetGroups.map((group) => (
                  <button
                    key={group.value}
                    onClick={() => setSelectedTarget(group.value as any)}
                    className={`
                      p-4 rounded-lg border-2 transition-all
                      ${selectedTarget === group.value
                        ? 'border-indigo-600 bg-indigo-600/20'
                        : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                      }
                    `}
                  >
                    <div className="text-3xl mb-2">{group.icon}</div>
                    <div className="text-sm font-medium text-white">{group.label}</div>
                    <div className="text-xs text-gray-400 mt-1">{group.count}명</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                제목
              </label>
              <input
                type="text"
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
                placeholder="메시지 제목을 입력하세요"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Message Content */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                내용
              </label>
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="고객에게 전달할 메시지를 작성하세요"
                rows={6}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:outline-none resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors">
                임시저장
              </button>
              <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors">
                발송하기
              </button>
            </div>
          </div>
        </div>

        {/* Recent Messages & Stats */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h4 className="text-lg font-bold text-white mb-4">발송 통계</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">이번 달 발송</span>
                <span className="text-white font-bold">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">총 수신자</span>
                <span className="text-white font-bold">3,456</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">평균 도달률</span>
                <span className="text-green-400 font-bold">98.5%</span>
              </div>
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h4 className="text-lg font-bold text-white mb-4">최근 발송 내역</h4>
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div key={msg.id} className="p-3 bg-gray-900 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="text-white font-medium text-sm">{msg.title}</h5>
                    <span className="text-xs text-indigo-400">{msg.target}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>{msg.sentCount}명 발송</span>
                    <span>{msg.sentAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
