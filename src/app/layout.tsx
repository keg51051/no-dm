import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: '노뎀 (no dm) — DM 없이 알아내는 인스타그램 정보',
  description:
    '인스타그램에서 "댓글 남겨주세요"에 지치셨나요? 게시물 URL만 입력하면 AI가 숨겨진 정보를 찾아드립니다.',
  openGraph: {
    title: '노뎀 (no dm)',
    description: 'DM 없이 알아내는 인스타그램 정보',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
