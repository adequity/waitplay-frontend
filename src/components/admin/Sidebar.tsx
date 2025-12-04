'use client';

/**
 * Admin Sidebar Component
 * 관리자 사이드바 네비게이션
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

const navigation: NavItem[] = [
  { name: '대시보드', href: '/admin', icon: '📊' },
  { name: '게임 관리', href: '/admin/games', icon: '🎮' },
  { name: '매장 설정', href: '/admin/store', icon: '🏪' },
  { name: '고객 분석', href: '/admin/analytics', icon: '📈' },
  { name: 'CRM', href: '/admin/crm', icon: '💬' },
  { name: '쿠폰 관리', href: '/admin/coupons', icon: '🎁' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-900 min-h-screen border-r border-gray-800">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">
          🎮 WaitPlay
        </h1>
        <p className="text-sm text-gray-400 mt-1">Admin Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg
                transition-colors duration-200
                ${isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Info */}
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold">A</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Admin</p>
            <p className="text-xs text-gray-400">관리자</p>
          </div>
        </div>
      </div>
    </div>
  );
}
