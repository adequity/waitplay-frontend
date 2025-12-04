export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Hero Section */}
      <main className="relative">
        <div className="container mx-auto px-6 py-20">
          {/* Logo & Badge */}
          <div className="flex flex-col items-center text-center mb-12 animate-fade-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/40 border border-white/10">
                <span className="text-3xl">▶</span>
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight">
                  Wait<span className="text-purple-400">Play</span>
                </h1>
                <p className="text-xs text-slate-400 tracking-widest uppercase font-bold">Smart Waiting Solution</p>
              </div>
            </div>

            <div className="inline-block bg-purple-500/10 text-purple-400 px-6 py-2 rounded-full text-sm font-bold border border-purple-500/20 mb-8">
              ✨ 대기 시간을 브랜드 경험으로 전환하는 B2B SaaS
            </div>
          </div>

          {/* Main Heading */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent leading-tight">
              알아서 줄 서는<br />가게의 비밀
            </h2>
            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              단순한 대기 관리 도구가 아닙니다.<br />
              고객의 지루한 시간을 <strong className="text-purple-300">브랜드 경험</strong>으로 바꾸는 마법입니다.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
            {/* Card 1 */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-purple-900/30 to-slate-900/50 p-8 border border-purple-500/20 backdrop-blur-sm hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6">
                  🎮
                </div>
                <h3 className="text-2xl font-bold mb-3">즐거운 놀이</h3>
                <p className="text-slate-400 leading-relaxed">
                  핀볼, 매칭 게임 등 재미있는 게임으로 대기 시간이 순삭됩니다
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-blue-900/30 to-slate-900/50 p-8 border border-blue-500/20 backdrop-blur-sm hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6">
                  🎯
                </div>
                <h3 className="text-2xl font-bold mb-3">브랜드 각인</h3>
                <p className="text-slate-400 leading-relaxed">
                  게임 속 로고와 메뉴로 자연스럽게 브랜드를 기억시킵니다
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-green-900/30 to-slate-900/50 p-8 border border-green-500/20 backdrop-blur-sm hover:border-green-500/40 transition-all duration-300 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6">
                  📊
                </div>
                <h3 className="text-2xl font-bold mb-3">데이터 자산</h3>
                <p className="text-slate-400 leading-relaxed">
                  고객 데이터를 분석하여 스마트한 CRM 마케팅을 지원합니다
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="inline-flex flex-col sm:flex-row gap-4">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105">
                무료 체험 시작하기 →
              </button>
              <button className="border-2 border-white/20 hover:border-purple-400 hover:bg-white/5 text-white px-10 py-4 rounded-full font-bold text-lg transition-all">
                데모 보기
              </button>
            </div>
            <p className="text-slate-500 mt-6 text-sm">
              설치 시간 5분 | 별도 하드웨어 불필요 | 무료 체험 가능
            </p>
          </div>

          {/* Stats */}
          <div className="mt-20 max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-black text-purple-400 mb-2">85%</div>
              <div className="text-slate-400 text-sm">게임 참여율</div>
            </div>
            <div>
              <div className="text-4xl font-black text-blue-400 mb-2">20%</div>
              <div className="text-slate-400 text-sm">메뉴 주문율 증가</div>
            </div>
            <div>
              <div className="text-4xl font-black text-green-400 mb-2">5분</div>
              <div className="text-slate-400 text-sm">설치 완료</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
          <p>© 2025 WaitPlay. All rights reserved.</p>
          <p className="mt-2">Built with Next.js, TypeScript, Tailwind CSS, and Phaser</p>
        </div>
      </footer>
    </div>
  );
}

