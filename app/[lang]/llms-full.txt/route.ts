import { isValidLang } from '@/lib/i18n';
import { getLLMText, source } from '@/lib/source';
import { notFound } from 'next/navigation';

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/[lang]/llms-full.txt'>) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();

  const scan = source.getPages(lang).map(getLLMText);
  const scanned = await Promise.all(scan);

  return new Response(scanned.join('\n\n'));
}

export function generateStaticParams() {
  return source.getLanguages().map(({ language }) => ({
    lang: language,
  }));
}
