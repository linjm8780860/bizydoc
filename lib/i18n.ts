import { defineI18n } from 'fumadocs-core/i18n';
import { openapiTranslations } from 'fumadocs-openapi/i18n';
import { uiTranslations } from 'fumadocs-ui/i18n';

export const i18n = defineI18n({
  defaultLanguage: 'cn',
  languages: ['cn', 'en'],
  parser: 'dir',
});

export const translations = i18n
  .translations()
  .extend(uiTranslations())
  .extend(openapiTranslations())
  .add({
    cn: {
      displayName: '简体中文',
      'Search(search trigger)': '搜索',
      'Search(search dialog)': '搜索文档',
      'No results found(search dialog)': '没有找到结果',
      'On this page(table of contents)': '本页目录',
      'Choose a language(language switcher)': '选择语言',
      'Last updated on(page footer)': '最后更新于',
      'Previous Page(pagination)': '上一页',
      'Next Page(pagination)': '下一页',
      'Copy Markdown(page actions)': '复制 Markdown',
      'View as Markdown(page actions)': '查看 Markdown',
      'Request Body(operation page)': '请求体',
      'Response Body(operation page)': '响应体',
      'Example Requests(operation page)': '请求示例',
      'Authorization(operation page)': '鉴权',
      'Query Parameters(operation page)': '查询参数',
      'Path Parameters(operation page)': '路径参数',
      'Header Parameters(operation page)': '请求头参数',
      'Send(playground)': '发送',
    },
    en: {
      displayName: 'English',
    },
  });

export type Lang = (typeof i18n.languages)[number];

export function isValidLang(lang: string): lang is Lang {
  return i18n.languages.includes(lang as Lang);
}

export function getLangUrl(lang: Lang, pathname = '') {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;

  return `/${lang}${path === '/' ? '' : path}`;
}
