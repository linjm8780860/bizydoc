import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import type { Lang } from './i18n';
import { appName, gitConfig } from './shared';

const labels = {
  cn: {
    console: 'BizyAir',
    status: 'GitHub',
  },
  en: {
    console: 'BizyAir',
    status: 'GitHub',
  },
} satisfies Record<Lang, Record<'console' | 'status', string>>;

export function baseOptions(lang: Lang = 'cn'): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: appName,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    links: [
      {
        text: labels[lang].console,
        url: 'https://www.bizyair.cn',
      },
      {
        text: labels[lang].status,
        url: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
      },
    ],
  };
}
