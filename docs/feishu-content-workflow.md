# 飞书文档维护流程

这份文档给内容维护者和技术发布同学使用。

## 内容维护者

你只需要维护飞书文档。

### 写作规则

- 每个站点页面对应一篇飞书文档。
- 中文和英文分开维护，不要在一篇文档里混写两种语言。
- 正文从页面内容开始写；页面标题、描述、图标由技术侧配置。
- 标题层级从二级标题开始更稳妥，例如 `快速开始` 页面正文里使用“安装依赖”“发起请求”这类小标题。
- 可以使用普通段落、标题、列表、代码块、表格。
- 少用复杂飞书组件，例如多维表格、嵌入白板、互动组件；这些不一定能稳定同步到站点。

### 发布流程

1. 在飞书里完成修改。
2. 请同事 review。
3. 告诉技术发布同学同步站点。
4. 发布后检查线上页面。

## 技术发布同学

### 首次配置

在项目根目录创建 `.env.local`：

```bash
cp .env.example .env.local
```

填入飞书开放平台应用凭证：

```bash
FEISHU_APP_ID=...
FEISHU_APP_SECRET=...
FEISHU_REBUILD_WEBHOOK_SECRET=...
VERCEL_DEPLOY_HOOK_URL=...
```

确保飞书应用有读取文档权限，并且对应文档已授权给该应用或应用所在组织。

### 当前同步方式

当前站点使用一篇飞书总文档作为中文内容源：

```txt
https://siliconflow.feishu.cn/wiki/Y4X2wZovMivnM8kqdcjcGKwunSb
```

`content/feishu-docs.config.json` 里的 `collections` 会把这篇总文档按二级标题拆成多个站点页面。维护内容时，保留这些二级标题即可：

```md
## 产品简介
## 上手指南 / 安装
## 产品能力 / 模型广场
```

这些标题是同步锚点；标题改名后，需要同步修改 `content/feishu-docs.config.json` 里的 `sourceHeading`。

### 接入新页面

编辑 `content/feishu-docs.config.json`，新增或修改页面映射：

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

`slug` 决定站点 URL。例如 `guide/quick-start` 会生成：

```txt
/cn/docs/guide/quick-start
/en/docs/guide/quick-start
```

### 同步命令

```bash
pnpm docs:sync-feishu
```

只同步中文：

```bash
pnpm docs:sync-feishu -- --lang cn
```

只检查映射，不写文件：

```bash
pnpm docs:sync-feishu -- --dry-run
```

### 发布前检查

```bash
pnpm types:check
pnpm build
```

## 注意事项

- `content/docs/*/*.mdx` 是站点最终读取的文件。
- 如果某个页面已经接入飞书同步，不要手动改对应 MDX 文件；下次同步会覆盖。
- API 文档仍然来自 `openapi/cn.yaml` 和 `openapi/en.yaml`，不走飞书同步。

## 自动同步和重新构建

推荐把飞书作为内容源，把站点构建作为发布动作。当前仓库已经配置 GitHub Actions：

```txt
.github/workflows/sync-feishu-and-deploy.yml
```

在 GitHub Actions 里手动运行 `Sync Feishu and Deploy` 后会执行：

```txt
读取飞书总文档
  -> 拆分并生成 content/docs/cn/*.mdx
  -> 提交回仓库
  -> Vercel Git 集成自动部署
```

GitHub 仓库需要配置这些 Secrets：

```bash
FEISHU_APP_ID=...
FEISHU_APP_SECRET=...
```

也可以进一步把飞书事件订阅接到 Deploy Hook：

```txt
飞书文档更新
  -> 飞书事件订阅回调
  -> /api/feishu/rebuild
  -> Vercel Deploy Hook
  -> pnpm build
  -> pnpm docs:sync-feishu
  -> next build
```

这样内容维护者只需要编辑飞书文档，不需要接触代码仓库。

### 1. 配置 Vercel Deploy Hook

在 Vercel 项目里创建 Deploy Hook，并把生成的 URL 配到环境变量：

```bash
VERCEL_DEPLOY_HOOK_URL=https://api.vercel.com/v1/integrations/deploy/...
```

生产环境还需要配置飞书读取凭证：

```bash
FEISHU_APP_ID=...
FEISHU_APP_SECRET=...
```

`pnpm build` 已经会先运行 `pnpm docs:sync-feishu`，再运行 `next build`。如果只是本地临时构建、不想拉飞书，可以使用：

```bash
pnpm build:local
```

### 2. 配置回调密钥

设置一个随机密钥：

```bash
FEISHU_REBUILD_WEBHOOK_SECRET=一段足够长的随机字符串
```

飞书事件订阅的回调地址使用：

```txt
https://你的站点域名/api/feishu/rebuild?secret=一段足够长的随机字符串
```

这个密钥只用于防止外部随便触发重新部署，不要公开到文档正文里。

### 3. 配置飞书事件订阅

在飞书开放平台应用里开启事件订阅，把回调 URL 填成上面的地址。

推荐订阅云文档相关的“文件编辑/文档更新”事件。事件触发后，站点不会直接在运行时读飞书，而是触发一次重新部署；部署时再把飞书内容同步到 `content/docs`，然后生成静态站点。

### 4. 接入页面映射

只有 `content/feishu-docs.config.json` 里 `enabled: true` 且配置了 `source` 的页面会被同步。示例：

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
      "enabled": false,
      "source": "",
      "title": "Quick Start",
      "description": "Send your first request with an API key."
    }
  }
}
```

如果当前只维护中文，可以只打开 `cn.enabled`；英文先保留空文件或后续再接入英文飞书文档。
