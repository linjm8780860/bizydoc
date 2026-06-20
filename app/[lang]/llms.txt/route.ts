import { isValidLang } from '@/lib/i18n';
import { source } from '@/lib/source';
import { llms } from 'fumadocs-core/source';
import { notFound } from 'next/navigation';

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/[lang]/llms.txt'>) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  return new Response(llms(source).index(lang));
}

export function generateStaticParams() {
  return source.getLanguages().map(({ language }) => ({
    lang: language,
  }));
}
