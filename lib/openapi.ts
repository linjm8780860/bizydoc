import { createOpenAPI } from 'fumadocs-openapi/server';

export const openapi = createOpenAPI({
  input: {
    cn: './openapi/cn.yaml',
    en: './openapi/en.yaml',
  },
});
