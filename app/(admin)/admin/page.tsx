/**
 * Admin Dashboard Page
 * 관리자 대시보드 메인 페이지
 */

import StatCard from '@/components/admin/StatCard';

export default function AdminDashboard() {
  // TODO: 실제 데이터는 API에서 가져오기
  const stats = {
    todayPlays: 156,
    totalUsers: 1234,
    activeCoupons: 45,
    conversionRate: 32.5
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">대시보드</h1>
        <p className="text-gray-400">매장 운영 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="오늘 게임 플레이"
          value={stats.todayPlays}
          icon="🎮"
          trend={{ value: 12.5, isPositive: true }}
          color="blue"
        />
        <StatCard
          title="누적 사용자"
          value={stats.totalUsers}
          icon="👥"
          trend={{ value: 8.3, isPositive: true }}
          color="green"
        />
        <StatCard
          title="발급된 쿠폰"
          value={stats.activeCoupons}
          icon="🎁"
          trend={{ value: 5.2, isPositive: false }}
          color="purple"
        />
        <StatCard
          title="전환율"
          value={`${stats.conversionRate}%`}
          icon="📈"
          trend={{ value: 3.1, isPositive: true }}
          color="orange"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Game Activity */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">최근 게임 활동</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-white">🎮</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">유저{i}님</p>
                    <p className="text-gray-400 text-sm">핀볼 게임 플레이</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-indigo-400 font-bold">1,250점</p>
                  <p className="text-gray-500 text-sm">방금 전</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Games */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">인기 게임</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="text-white font-medium">핀볼 게임</p>
                  <p className="text-gray-400 text-sm">89회 플레이</p>
                </div>
              </div>
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600" style={{ width: '89%' }}></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🃏</span>
                <div>
                  <p className="text-white font-medium">카드 매칭</p>
                  <p className="text-gray-400 text-sm">42회 플레이</p>
                </div>
              </div>
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600" style={{ width: '42%' }}></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔍</span>
                <div>
                  <p className="text-white font-medium">차이점 찾기</p>
                  <p className="text-gray-400 text-sm">25회 플레이</p>
                </div>
              </div>
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-pink-600" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
