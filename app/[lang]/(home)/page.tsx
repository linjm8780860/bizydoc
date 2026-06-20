import Link from 'next/link';
import { BookOpen, Braces, FileCode2, Search } from 'lucide-react';
import { isValidLang, type Lang } from '@/lib/i18n';
import { notFound } from 'next/navigation';

const copy = {
  cn: {
    eyebrow: 'Fumadocs + Next.js + OpenAPI',
    title: '一个接近 SiliconFlow 风格的 API 文档系统起点',
    description:
      '左侧目录、正文目录、暗色模式、MDX 内容、OpenAPI 接口页都已经接好。你可以把品牌、导航和 OpenAPI schema 换成自己的业务内容。',
    docs: '打开文档',
    api: '查看接口示例',
    features: [
      {
        icon: BookOpen,
        title: '中文指南',
        description: '用 MDX 编写产品介绍、快速开始、鉴权说明和常见问题。',
      },
      {
        icon: Braces,
        title: 'OpenAPI 生成',
        description: '从 OpenAPI schema 自动生成接口页、参数表和响应示例。',
      },
      {
        icon: Search,
        title: '内置搜索',
        description: 'Fumadocs 提供文档树、目录、搜索入口和移动端侧栏。',
      },
    ],
  },
  en: {
    eyebrow: 'Fumadocs + Next.js + OpenAPI',
    title: 'An API documentation starter inspired by SiliconFlow Docs',
    description:
      'The sidebar, page table of contents, dark mode, MDX content, and OpenAPI pages are already wired. Replace the brand, navigation, and schema with your own product content.',
    docs: 'Open Docs',
    api: 'View API Example',
    features: [
      {
        icon: BookOpen,
        title: 'Localized Guides',
        description: 'Write product introductions, quick starts, authentication docs, and FAQs in MDX.',
      },
      {
        icon: Braces,
        title: 'OpenAPI Generation',
        description: 'Generate endpoint pages, parameter tables, and response examples from schemas.',
      },
      {
        icon: Search,
        title: 'Built-in Search',
        description: 'Fumadocs provides the page tree, search entry, table of contents, and mobile sidebar.',
      },
    ],
  },
} satisfies Record<Lang, {
  eyebrow: string;
  title: string;
  description: string;
  docs: string;
  api: string;
  features: Array<{
    icon: typeof BookOpen;
    title: string;
    description: string;
  }>;
}>;

export default async function HomePage({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isValidLang(lang)) notFound();
  const t = copy[lang];

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[linear-gradient(180deg,rgba(20,184,166,0.10),transparent_42%)]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 md:py-24">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-fd-card px-3 py-1 text-sm text-fd-muted-foreground">
            <FileCode2 className="size-4 text-fd-primary" />
            {t.eyebrow}
          </div>
          <h1 className="text-4xl font-bold tracking-normal text-fd-foreground md:text-6xl">
            {t.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-fd-muted-foreground">
            {t.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/${lang}/docs`}
              className="inline-flex items-center justify-center rounded-md bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground transition-colors hover:opacity-90"
            >
              {t.docs}
            </Link>
            <Link
              href={`/${lang}/docs/api/text/createChatCompletion`}
              className="inline-flex items-center justify-center rounded-md border bg-fd-card px-4 py-2 text-sm font-medium transition-colors hover:bg-fd-accent"
            >
              {t.api}
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {t.features.map((feature) => (
            <article key={feature.title} className="rounded-lg border bg-fd-card p-5">
              <feature.icon className="mb-4 size-5 text-fd-primary" />
              <h2 className="text-base font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
