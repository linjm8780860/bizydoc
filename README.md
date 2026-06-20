# API Docs Starter

这是一个基于 Fumadocs 的双语 API 文档系统 starter，结构接近 SiliconFlow API Docs 这类产品文档站。

## 技术栈

- Next.js 16
- React 19
- Fumadocs UI / MDX
- Fumadocs OpenAPI
- Tailwind CSS 4
- Lucide icons

## 上游开源项目

SiliconFlow API Docs 页面源码里可以看到 `fumadocs-theme`、`fd-*` 样式和 Next.js 路由 chunk，技术形态与 Fumadocs 高度一致。这个 starter 采用的是同一类开源方案：

- Fumadocs：<https://github.com/fuma-nama/fumadocs>
- Fumadocs OpenAPI：<https://www.fumadocs.dev/docs/integrations/openapi>
- 官方 Next.js starter：<https://github.com/fuma-nama/fumadocs-ui-template>

## 本地启动

```bash
pnpm install
pnpm docs:generate-api
pnpm dev
```

默认打开 `http://localhost:3000`。如果 3000 被占用，Next.js 会自动切到下一个端口，例如 `http://localhost:3001`。

当前默认语言是中文，入口会跳转到 `/cn`。英文站点在 `/en`。

## 主要目录

- `content/docs/cn`：中文 MDX 文档内容
- `content/docs/en`：英文 MDX 文档内容
- `content/feishu-docs.config.json`：飞书文档到站点页面的同步映射
- `openapi/cn.yaml`：中文 OpenAPI 定义
- `openapi/en.yaml`：英文 OpenAPI 定义
- `scripts/sync-feishu-docs.ts`：从飞书同步普通文档
- `scripts/generate-openapi.ts`：从 OpenAPI 生成 API 页面
- `lib/i18n.ts`：语言列表、默认语言和 UI 翻译
- `lib/shared.ts`：站点名称、文档路由和 GitHub 仓库配置
- `lib/layout.shared.tsx`：顶部导航配置

## 内容维护

推荐把飞书作为内容源，Fumadocs 作为展示层。这样内容维护者只需要编辑飞书文档，不需要理解 MDX、目录结构或命令行。

### 内容维护者流程

1. 在飞书里编辑对应文档。
2. 中文和英文建议分别维护独立飞书文档。
3. 不要在飞书正文里写站点标题配置；标题、描述、图标由同步配置统一管理。
4. 通知技术同学同步发布，或者后续接入自动同步。

### 技术侧同步流程

首次配置飞书开放平台应用密钥：

```bash
cp .env.example .env.local
```

然后在 `.env.local` 填入：

```bash
FEISHU_APP_ID=你的飞书应用 App ID
FEISHU_APP_SECRET=你的飞书应用 App Secret
FEISHU_REBUILD_WEBHOOK_SECRET=用于保护重构建回调的随机字符串
VERCEL_DEPLOY_HOOK_URL=Vercel Deploy Hook 地址
```

在 `content/feishu-docs.config.json` 里把每个页面对应到飞书文档 URL：

```json
{
  "slug": "guide/quick-start",
  "icon": "Rocket",
  "translations": {
    "cn": {
      "enabled": true,
      "source": "https://your-domain.feishu.cn/docx/xxxx",
      "title": "快速开始",
      "description": "用 API Key 发起第一个请求。"
    },
    "en": {
      "enabled": true,
      "source": "https://your-domain.feishu.cn/docx/yyyy",
      "title": "Quick Start",
      "description": "Send your first request with an API key."
    }
  }
}
```

同步飞书内容：

```bash
pnpm docs:sync-feishu
```

生产构建会自动先同步飞书内容：

```bash
pnpm build
```

本地只想构建当前文件内容、不拉飞书时使用：

```bash
pnpm build:local
```

### 自动发布

可以把飞书事件订阅关联到站点的回调地址：

```txt
https://你的站点域名/api/feishu/rebuild?secret=FEISHU_REBUILD_WEBHOOK_SECRET
```

飞书文档更新后，这个回调会触发 `VERCEL_DEPLOY_HOOK_URL`，Vercel 重新构建时会先运行 `pnpm docs:sync-feishu`，再生成站点。

更完整的配置步骤见 `docs/feishu-content-workflow.md`。

只同步一个语言：

```bash
pnpm docs:sync-feishu -- --lang cn
```

先检查映射但不写文件：

```bash
pnpm docs:sync-feishu -- --dry-run
```

### 普通文档

普通文档最终会落到对应语言目录下的 MDX 文件。两个语言目录结构建议保持一致：

```txt
content/docs/cn/guide/quick-start.mdx
content/docs/en/guide/quick-start.mdx
```

如果这个页面已经接入飞书同步，不要直接编辑生成后的 MDX 文件，下一次同步会覆盖它。

每个 MDX 文件顶部用 frontmatter 维护标题、描述和图标：

```mdx
---
title: 快速开始
description: 用 API Key 发起第一个请求。
icon: Rocket
---

正文内容...
```

侧栏顺序和分组标题由每个语言目录下的 `meta.json` 控制：

```txt
content/docs/cn/meta.json
content/docs/en/meta.json
```

新增页面时，建议同时新增中英文两个文件，并把文件名加入对应的 `meta.json`。

### API 文档

接口文档不要直接改 `content/docs/*/api` 里的生成文件，因为它们会被重新生成覆盖。维护入口是 OpenAPI schema：

```txt
openapi/cn.yaml
openapi/en.yaml
```

改完 OpenAPI schema 后运行：

```bash
pnpm docs:generate-api
```

### 国际化配置

- 语言列表和默认语言：`lib/i18n.ts`
- UI 文案翻译：`lib/i18n.ts`
- 首页文案：`app/[lang]/(home)/page.tsx`
- 顶部导航：`lib/layout.shared.tsx`
- 文档路由：`/cn/docs`、`/en/docs`
- Markdown/LLM 文档：`/cn/llms.txt`、`/en/llms.txt`

## 常用命令

```bash
pnpm docs:generate-api
pnpm docs:sync-feishu
pnpm types:check
pnpm build
```
