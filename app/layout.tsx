import './globals.css'

export const metadata = {
  title: '지공 뉴스룸 | AI 자동화 뉴스',
  description: '고물 노트북이 낳은 기적, AI가 전하는 오늘의 뉴스',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <header className="bg-white border-b p-4 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-600 tracking-tighter">지공 NEWSROOM</h1>
            <nav className="text-sm text-gray-500">v0.1 Alpha</nav>
          </div>
        </header>
        <main className="max-w-4xl mx-auto p-4">{children}</main>
        <footer className="text-center p-10 text-gray-400 text-xs">
          © 2026 지공무역. Powered by 14년 된 노트북 & Gemini
        </footer>
      </body>
    </html>
  )
}
