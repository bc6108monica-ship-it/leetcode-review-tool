import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LeetCode 艾宾浩斯复习助手',
  description: '基于艾宾浩斯遗忘曲线的 LeetCode 刷题复习提醒工具',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <div className="min-h-screen">
          <header className="bg-white shadow">
            <div className="container mx-auto px-4 py-6">
              <h1 className="text-3xl font-bold text-blue-600">LeetCode 艾宾浩斯复习助手</h1>
              <p className="text-gray-600 mt-2">
                基于艾宾浩斯遗忘曲线的刷题复习提醒工具 - 科学记忆，高效刷题
              </p>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">{children}</main>
          <footer className="bg-white border-t mt-8 py-6">
            <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
              <p>© 2026 LeetCode 艾宾浩斯复习助手 | 阶段说明: 0-初次接触, 1-1天后, 2-7天后, 3-20天后, 4-已掌握</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}