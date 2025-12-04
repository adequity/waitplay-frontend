/**
 * Customer Layout
 * 고객용 페이지 레이아웃
 */

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {children}
    </div>
  );
}
