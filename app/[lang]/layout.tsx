import { isValidLang, translations } from '@/lib/i18n';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { i18nProvider } from 'fumadocs-ui/i18n';
import { notFound } from 'next/navigation';

export default async function LangLayout({
  children,
  params,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  return <RootProvider i18n={i18nProvider(translations, lang)}>{children}</RootProvider>;
}

export function generateStaticParams() {
  return [{ lang: 'cn' }, { lang: 'en' }];
}
