import { generateFiles } from 'fumadocs-openapi';
import { createOpenAPI } from 'fumadocs-openapi/server';

const languages = ['cn', 'en'] as const;

async function main() {
  for (const lang of languages) {
    const server = createOpenAPI({
      input: {
        [lang]: `./openapi/${lang}.yaml`,
      },
    });

    await generateFiles({
      input: server,
      output: `./content/docs/${lang}/api`,
      per: 'operation',
      groupBy: 'tag',
      meta: {
        folderStyle: 'separator',
      },
      index: {
        items: [
          {
            path: 'index.mdx',
            title: lang === 'cn' ? 'API 手册' : 'API Reference',
            description:
              lang === 'cn'
                ? '由 OpenAPI schema 自动生成的接口索引。'
                : 'An endpoint index generated from OpenAPI schemas.',
            only: [lang],
          },
        ],
        url: {
          baseUrl: `/${lang}/docs/api`,
          contentDir: `./content/docs/${lang}/api`,
        },
      },
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
