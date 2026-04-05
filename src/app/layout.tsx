import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QuickRemove - AI 智能消除图片背景',
  description: '免费 AI 工具，3秒消除图片背景。拖拽上传，自动处理，完全免费。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className="antialiased">{children}</body>
    </html>
  );
}
