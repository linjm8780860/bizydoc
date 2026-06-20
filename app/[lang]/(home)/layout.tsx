import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { isValidLang } from '@/lib/i18n';
import { notFound } from 'next/navigation';

export default async function Layout({
  children,
  params,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  return <HomeLayout {...baseOptions(lang)}>{children}</HomeLayout>;
}
