import { NextRequest, NextResponse } from 'next/server';
import type { NextFetchEvent } from 'next/server';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { i18n } from '@/lib/i18n';
import { localizedDocsContentRoute, localizedDocsRoute } from '@/lib/shared';

const { rewrite: rewriteDocs } = rewritePath(
  `${localizedDocsRoute}{/*path}`,
  `${localizedDocsContentRoute}{/*path}/content.md`,
);
const { rewrite: rewriteSuffix } = rewritePath(
  `${localizedDocsRoute}{/*path}.md`,
  `${localizedDocsContentRoute}{/*path}/content.md`,
);
const i18nMiddleware = createI18nMiddleware(i18n);

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const result = rewriteSuffix(request.nextUrl.pathname);
  if (result) {
    return NextResponse.rewrite(new URL(result, request.nextUrl));
  }

  if (isMarkdownPreferred(request)) {
    const result = rewriteDocs(request.nextUrl.pathname);

    if (result) {
      return NextResponse.rewrite(new URL(result, request.nextUrl));
    }
  }

  return i18nMiddleware(request, event);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml).*)',
  ],
};
