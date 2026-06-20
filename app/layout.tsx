import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Noto_Sans_SC } from 'next/font/google';
import type { Metadata } from 'next';

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    default: 'BizyAir 文档',
    template: '%s | BizyAir 文档',
  },
  description: 'BizyAir 官方文档站点。',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="zh-CN" className={notoSansSC.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        {children}
      </body>
    </html>
  );
}
