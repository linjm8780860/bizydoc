import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const sourceRoot = '/Users/linjm/Desktop/work/allWork/BizyDocs/docs';
const targetRoot = '/Users/linjm/Desktop/work/allWork/fumadocs-api-docs/content/docs';

const sectionOrder = [
  ['index.md', 'index.mdx'],
  ['guides/install.md', 'guide/quick-start.mdx'],
  ['guides/signin.md', 'guide/authentication.mdx'],
  ['capabilities/model-plaza.md', 'capabilities/model-plaza.mdx'],
  ['capabilities/workflow-plaza.md', 'capabilities/workflow-plaza.mdx'],
  ['capabilities/sharecode.md', 'capabilities/sharecode.mdx'],
  ['capabilities/message-box.md', 'capabilities/message-box.mdx'],
  ['capabilities/model-details.md', 'capabilities/model-details.mdx'],
  ['api/asynctask-tutorial.md', 'api/asynctask-tutorial.mdx'],
  ['api/webhook-tutorial.md', 'api/webhook-tutorial.mdx'],
  ['api/upload-tutorial.md', 'api/upload-tutorial.mdx'],
  ['api/api-reference.md', 'api/api-reference.mdx'],
  ['api/response-codes.md', 'api/response-codes.mdx'],
  ['tools/CLI.md', 'tools/CLI.mdx'],
  ['price/index.md', 'price/index.mdx'],
  ['price/instruction.md', 'price/instruction.mdx'],
  ['price/price.md', 'price/price.mdx'],
  ['price/FAQ.md', 'price/FAQ.mdx'],
  ['terms/terms.md', 'terms/terms.mdx'],
  ['FAQ/index.md', 'FAQ/index.mdx'],
  ['FAQ/upload-model.md', 'FAQ/upload-model.mdx'],
  ['FAQ/api.md', 'FAQ/api.mdx'],
  ['FAQ/gift.md', 'FAQ/gift.mdx'],
  ['FAQ/invoice.md', 'FAQ/invoice.mdx'],
  ['FAQ/AI-application.md', 'FAQ/AI-application.mdx'],
  ['FAQ/consuption-details.md', 'FAQ/consuption-details.mdx'],
  ['FAQ/coupon.md', 'FAQ/coupon.mdx'],
  ['FAQ/API-pricelist.md', 'FAQ/API-pricelist.mdx'],
  ['FAQ/feedback.md', 'FAQ/feedback.mdx'],
  ['FAQ/error-code.md', 'FAQ/error-code.mdx'],
  ['FAQ/mcp.md', 'FAQ/mcp.mdx'],
  ['FAQ/view-works.md', 'FAQ/view-works.mdx'],
  ['FAQ/regenerate.md', 'FAQ/regenerate.mdx'],
  ['FAQ/start.md', 'FAQ/start.mdx'],
];

const titleMap = new Map([
  ['index', '产品简介'],
  ['guide/quick-start', '在线使用'],
  ['guide/authentication', '注册账号'],
  ['capabilities/model-plaza', '模型广场'],
  ['capabilities/workflow-plaza', '工作流广场'],
  ['capabilities/sharecode', '分享直达码'],
  ['capabilities/message-box', '消息盒子'],
  ['capabilities/model-details', '模型详情页'],
  ['api/asynctask-tutorial', '异步查询使用教程'],
  ['api/webhook-tutorial', 'WebHook 使用教程'],
  ['api/upload-tutorial', '文件上传使用教程'],
  ['api/api-reference', 'API 参考'],
  ['api/response-codes', '错误码说明'],
  ['tools/CLI', '命令行工具'],
  ['price/index', 'BizyAir 计费简介'],
  ['price/instruction', '充值指南'],
  ['price/price', '节点价格参考'],
  ['price/FAQ', '价格 FAQ'],
  ['terms/terms', 'BizyAir 充值服务协议'],
  ['FAQ/index', 'FAQ 常见问题'],
  ['FAQ/upload-model', '如何上传模型'],
  ['FAQ/api', '如何API调用'],
  ['FAQ/gift', '如何使用兑换码'],
  ['FAQ/invoice', '如何发票开具'],
  ['FAQ/AI-application', '如何发布AI应用'],
  ['FAQ/consuption-details', '如何查看消费明细'],
  ['FAQ/coupon', '如何领取优惠券'],
  ['FAQ/API-pricelist', '如何查看API价格表'],
  ['FAQ/feedback', '如何意见反馈'],
  ['FAQ/error-code', '如何查看错误码说明'],
  ['FAQ/mcp', '如何查看MCP'],
  ['FAQ/view-works', '如何查看作品'],
  ['FAQ/regenerate', '如何再次生成'],
  ['FAQ/start', '上手使用教程'],
]);

const descMap = new Map([
  ['index', 'BizyAir 平台与文档总览。'],
  ['guide/quick-start', 'BizyAir 在线使用与本地安装指引。'],
  ['guide/authentication', 'BizyAir 账号与鉴权说明。'],
  ['capabilities/model-plaza', '模型广场功能说明。'],
  ['capabilities/workflow-plaza', '工作流广场功能说明。'],
  ['capabilities/sharecode', '分享直达码说明。'],
  ['capabilities/message-box', '消息盒子功能说明。'],
  ['capabilities/model-details', '模型详情页说明。'],
  ['api/asynctask-tutorial', 'BizyAir 异步查询使用教程。'],
  ['api/webhook-tutorial', 'BizyAir WebHook 使用教程。'],
  ['api/upload-tutorial', 'BizyAir 文件上传使用教程。'],
  ['api/api-reference', 'BizyAir API 参考文档。'],
  ['api/response-codes', 'BizyAir 错误码说明。'],
  ['tools/CLI', 'BizyAir CLI 工具说明。'],
  ['price/index', 'BizyAir 计费简介。'],
  ['price/instruction', 'BizyAir 充值与开票说明。'],
  ['price/price', 'BizyAir 节点价格参考。'],
  ['price/FAQ', 'BizyAir 计费 FAQ。'],
  ['terms/terms', 'BizyAir 充值服务协议。'],
  ['FAQ/index', 'BizyAir 常见问题汇总。'],
  ['FAQ/upload-model', '如何上传模型。'],
  ['FAQ/api', '如何API调用。'],
  ['FAQ/gift', '如何使用兑换码。'],
  ['FAQ/invoice', '如何发票开具。'],
  ['FAQ/AI-application', '如何发布AI应用。'],
  ['FAQ/consuption-details', '如何查看消费明细。'],
  ['FAQ/coupon', '如何领取优惠券。'],
  ['FAQ/API-pricelist', '如何查看API价格表。'],
  ['FAQ/feedback', '如何意见反馈。'],
  ['FAQ/error-code', '如何查看错误码说明。'],
  ['FAQ/mcp', '如何查看MCP。'],
  ['FAQ/view-works', '如何查看作品。'],
  ['FAQ/regenerate', '如何再次生成。'],
  ['FAQ/start', '上手使用教程。'],
]);

const folderMeta = {
  cn: [
    ['guide', '上手指南', ['quick-start', 'authentication']],
    ['capabilities', '产品能力', ['model-plaza', 'workflow-plaza', 'sharecode', 'message-box', 'model-details']],
    ['api', 'API', ['asynctask-tutorial', 'webhook-tutorial', 'upload-tutorial', 'api-reference', 'response-codes']],
    ['tools', '工具', ['CLI']],
    ['price', 'BizyAir 价格', ['index', 'instruction', 'price', 'FAQ']],
    ['terms', '条款与协议', ['terms']],
    ['FAQ', 'FAQ', ['index', 'upload-model', 'api', 'gift', 'invoice', 'AI-application', 'consuption-details', 'coupon', 'API-pricelist', 'feedback', 'error-code', 'mcp', 'view-works', 'regenerate', 'start']],
  ],
  en: [
    ['guide', 'Guides', ['quick-start', 'authentication']],
    ['capabilities', 'Capabilities', ['model-plaza', 'workflow-plaza', 'sharecode', 'message-box', 'model-details']],
    ['api', 'API', ['asynctask-tutorial', 'webhook-tutorial', 'upload-tutorial', 'api-reference', 'response-codes']],
    ['tools', 'Tools', ['CLI']],
    ['price', 'Pricing', ['index', 'instruction', 'price', 'FAQ']],
    ['terms', 'Terms', ['terms']],
    ['FAQ', 'FAQ', ['index', 'upload-model', 'api', 'gift', 'invoice', 'AI-application', 'consuption-details', 'coupon', 'API-pricelist', 'feedback', 'error-code', 'mcp', 'view-works', 'regenerate', 'start']],
  ],
};

function titleFor(rel) {
  return titleMap.get(rel) ?? rel.split('/').pop();
}

function descriptionFor(rel) {
  return descMap.get(rel) ?? '';
}

function baseName(rel) {
  return rel.replace(/\.mdx$/, '').replace(/\.md$/, '');
}

function normalizeLink(link, currentRel) {
  let href = link;
  const hashIndex = href.indexOf('#');
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : '';
  if (hashIndex >= 0) href = href.slice(0, hashIndex);
  const qIndex = href.indexOf('?');
  const query = qIndex >= 0 ? href.slice(qIndex) : '';
  if (qIndex >= 0) href = href.slice(0, qIndex);
  if (/^[a-z]+:|^\/\//i.test(href)) return link;
  if (href.startsWith('/')) return link;
  if (!href.startsWith('.')) return link;
  const currentDir = path.posix.dirname(currentRel);
  const abs = path.posix.normalize(path.posix.join(currentDir, href));
  const assetExt = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.avif', '.ico', '.mp4', '.webm', '.ogg', '.mp3', '.wav', '.pdf']);
  const ext = path.posix.extname(abs).toLowerCase();
  if (assetExt.has(ext)) return link;
  const withExt = ext === '.md' || ext === '.mdx' ? abs.replace(/\.md$/, '.mdx') : `${abs}.mdx`;
  const relative = path.posix.relative(path.posix.dirname(currentRel), withExt);
  return `${relative.startsWith('.') ? relative : `./${relative}`}${query}${hash}`;
}

function rewriteLinks(text, currentRel) {
  return text.replace(/(!?)\[([^\]]+)\]\(([^)]+)\)/g, (m, bang, label, target) => {
    if (bang) return m;
    const normalized = normalizeLink(target, currentRel);
    return `[${label}](${normalized})`;
  });
}

function replaceInclude(text) {
  return text.replace(/```([^\n`]*)\n(?:\s*\n)*--8<--\s+"([^"]+)"\n(?:\s*\n)*```/g, (_, fenceMeta, includePath) => {
    const abs = path.posix.normalize(includePath.replace(/^docs\//, ''));
    const sourcePath = path.join(sourceRoot, abs);
    const code = readFileSync(sourcePath, 'utf8').trimEnd();
    return ['```' + fenceMeta, code, '```'].join('\n');
  });
}

function convertAdmonitions(text) {
  return text
    .replace(/^!!!\s+(warning|tip|info|note|example|danger)\s+"([^"]+)"\n([\s\S]*?)(?=\n(?:!!!|###|##|#|---|```|===|\?\?\?|$))/gm, (_, kind, title, body) => {
      const typeMap = { warning: 'warning', tip: 'info', info: 'info', note: 'info', example: 'idea', danger: 'error' };
      const rendered = body.replace(/^    /gm, '').trimEnd();
      return `<Callout type="${typeMap[kind] || 'info'}" title="${title}">\n${rendered}\n</Callout>`;
    });
}

function convertQuestions(text) {
  return text.replace(/^\?\?\?\s+question\s+"([^"]+)"\n([\s\S]*?)(?=\n(?:\?\?\?|!!!|###|##|#|---|```|===|$))/gm, (_, title, body) => {
    const rendered = body.replace(/^    /gm, '').trimEnd();
    return `<details>\n<summary>${title}</summary>\n\n${rendered}\n\n</details>`;
  });
}

function convertTabs(text) {
  const lines = text.split(/\r?\n/);
  const out = [];

  for (let i = 0; i < lines.length;) {
    const match = lines[i].match(/^===\s+"([^"]+)"\s*$/);
    if (!match) {
      out.push(lines[i]);
      i += 1;
      continue;
    }

    const titles = [];
    const blocks = [];

    while (i < lines.length) {
      const header = lines[i].match(/^===\s+"([^"]+)"\s*$/);
      if (!header) break;
      titles.push(header[1]);
      i += 1;

      const block = [];
      while (i < lines.length) {
        const nextHeader = lines[i].match(/^===\s+"([^"]+)"\s*$/);
        if (nextHeader) break;
        const line = lines[i];
        if (line.trim() === '') {
          block.push('');
          i += 1;
          continue;
        }
        if (!line.startsWith('    ')) break;
        block.push(line.slice(4));
        i += 1;
      }
      blocks.push(block.join('\n').trimEnd());
    }

    out.push(`<Tabs items={[${titles.map((title) => JSON.stringify(title)).join(', ')}]}>`);
    for (const block of blocks) {
      out.push('<Tab>');
      if (block) out.push(block);
      out.push('</Tab>');
    }
    out.push('</Tabs>');
  }

  return out.join('\n');
}

function convertReadCsv(text, currentRel) {
  return text.replace(/\{\{\s*read_csv\('([^']+)'\)\s*\}\}/g, (_, csvName) => {
    const csvPath = path.join(sourceRoot, path.dirname(currentRel), csvName);
    const csv = readFileSync(csvPath, 'utf8').trimEnd();
    const rows = csv.split(/\r?\n/).filter(Boolean).map((line) => line.split(','));
    const header = rows.shift();
    if (!header) return '';
    const md = [
      `| ${header.join(' | ')} |`,
      `| ${header.map(() => '---').join(' | ')} |`,
      ...rows.map((r) => `| ${r.join(' | ')} |`),
    ].join('\n');
    return md;
  });
}

function stripHtml(text) {
  return text.replace(/^<br\s*\/?>(\s*)$/gm, '');
}

function removeMkdocsNoise(text) {
  return text
    .replace(/\[\^.*?\]:.*\n/g, '')
    .replace(/^\s*---\s*$/gm, '---')
    .replace(/^\s*\*\*\*\s*$/gm, '---');
}

function convertMd(text, currentRel) {
  let out = text;
  out = removeMkdocsNoise(out);
  out = replaceInclude(out);
  out = convertReadCsv(out, currentRel);
  out = convertAdmonitions(out);
  out = convertQuestions(out);
  out = convertTabs(out);
  out = rewriteLinks(out, currentRel);
  out = stripHtml(out);
  out = out.replace(/\!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, src) => {
    if (/^[a-z]+:|^\/\//i.test(src) || src.startsWith('/')) return m;
    return `![${alt}](${src.replace(/%20/g, ' ')})`;
  });
  out = out.replace(/\n{3,}/g, '\n\n');
  return out.trimEnd() + '\n';
}

async function ensureDir(file) {
  await fs.mkdir(path.dirname(file), { recursive: true });
}

async function writeDoc(relSrc, relDst, lang) {
  const srcPath = path.join(sourceRoot, relSrc);
  const dstPath = path.join(targetRoot, lang, relDst);
  const raw = await fs.readFile(srcPath, 'utf8');
  const relKey = baseName(relDst);
  const title = titleFor(relKey);
  const description = descriptionFor(relKey);
  const body = lang === 'cn' ? convertMd(raw, relSrc) : '';
  const frontmatter = ['---', `title: ${title}`, ...(description ? [`description: ${description}`] : []), '---', ''];
  const content = lang === 'cn' ? `${frontmatter.join('\n')}${body}` : `${frontmatter.join('\n')}`;
  await ensureDir(dstPath);
  await fs.writeFile(dstPath, content, 'utf8');
}

async function copyAsset(relPath) {
  const srcPath = path.join(sourceRoot, relPath);
  const dstPath = path.join(targetRoot, relPath);
  await ensureDir(dstPath);
  await fs.copyFile(srcPath, dstPath);
}

async function writeMetaFiles(lang) {
  for (const [dir, title, pages] of folderMeta[lang]) {
    const file = path.join(targetRoot, lang, dir, 'meta.json');
    await ensureDir(file);
    await fs.writeFile(
      file,
      JSON.stringify(
        {
          title,
          pages,
        },
        null,
        2,
      ) + '\n',
    );
  }
}

async function main() {
  // Clean target content except existing language roots created below.
  await fs.rm(path.join(targetRoot, 'cn'), { recursive: true, force: true });
  await fs.rm(path.join(targetRoot, 'en'), { recursive: true, force: true });
  await fs.rm(path.join(targetRoot, '.DS_Store'), { force: true });

  // Copy shared assets.
  const assetFiles = [
    'assets/markdown_bg.png',
    'assets/其他说明.png',
    'assets/coin.png',
    'assets/membership.png',
    'assets/icons/logo.png',
    'assets/icons/app-icon3.svg',
    'assets/icons/app-icon1.svg',
    'assets/logo.png',
    'assets/price.png',
    'assets/membership-introduction.png',
    'assets/qqImage.jpeg',
    'assets/code.png',
    'css/light.css',
    'css/custom.css',
    'css/footer-custom.css',
    'javascripts/extra.js',
    'tools/bizyair-cli download.png',
    'api/asynctask-tutorial/outputs.sh',
    'api/asynctask-tutorial/req.sh',
    'api/asynctask-tutorial/async_task.py',
    'api/asynctask-tutorial/main.sh',
    'api/asynctask-tutorial/detail.sh',
    'price/image_api_pricing.csv',
    'price/third_parts_node.csv',
    'price/llm_price.csv',
    'price/vlm_price.csv',
    'price/nodes_price.csv',
  ];
  for (const file of assetFiles) {
    const src = path.join(sourceRoot, file);
    const dst = path.join(targetRoot, file);
    await ensureDir(dst);
    await fs.copyFile(src, dst);
  }

  // Remove legacy starter artifact.
  await fs.rm(path.join(targetRoot, 'cn/guide/quick-start copy.mdx'), { force: true });

  for (const [srcRel, dstRel] of sectionOrder) {
    await writeDoc(srcRel, dstRel, 'cn');
    const enDst = dstRel;
    const enPath = path.join(targetRoot, 'en', enDst);
    await ensureDir(enPath);
    const relKey = baseName(dstRel);
    const title = titleFor(relKey);
    const description = descriptionFor(relKey);
    const frontmatter = ['---', `title: ${title}`, ...(description ? [`description: ${description}`] : []), '---', ''];
    await fs.writeFile(enPath, frontmatter.join('\n'), 'utf8');
  }

  // Build cn/en meta navigation.
  const cnMeta = {
    title: 'BizyAir 文档',
    pages: [
      'index',
      '---上手指南---',
      'guide/quick-start',
      'guide/authentication',
      '---产品能力---',
      'capabilities/model-plaza',
      'capabilities/workflow-plaza',
      'capabilities/sharecode',
      'capabilities/message-box',
      'capabilities/model-details',
      '---API---',
      'api/asynctask-tutorial',
      'api/webhook-tutorial',
      'api/upload-tutorial',
      'api/api-reference',
      'api/response-codes',
      '---工具---',
      'tools/CLI',
      '---BizyAir 价格---',
      'price/index',
      'price/instruction',
      'price/price',
      'price/FAQ',
      '---条款与协议---',
      'terms/terms',
      '---FAQ---',
      'FAQ/index',
      'FAQ/upload-model',
      'FAQ/api',
      'FAQ/gift',
      'FAQ/invoice',
      'FAQ/AI-application',
      'FAQ/consuption-details',
      'FAQ/coupon',
      'FAQ/API-pricelist',
      'FAQ/feedback',
      'FAQ/error-code',
      'FAQ/mcp',
      'FAQ/view-works',
      'FAQ/regenerate',
      'FAQ/start',
    ],
  };
  const enMeta = {
    title: 'BizyAir Docs',
    pages: [
      'index',
      '---Guides---',
      'guide/quick-start',
      'guide/authentication',
      '---Capabilities---',
      'capabilities/model-plaza',
      'capabilities/workflow-plaza',
      'capabilities/sharecode',
      'capabilities/message-box',
      'capabilities/model-details',
      '---API---',
      'api/asynctask-tutorial',
      'api/webhook-tutorial',
      'api/upload-tutorial',
      'api/api-reference',
      'api/response-codes',
      '---Tools---',
      'tools/CLI',
      '---Pricing---',
      'price/index',
      'price/instruction',
      'price/price',
      'price/FAQ',
      '---Terms---',
      'terms/terms',
      '---FAQ---',
      'FAQ/index',
      'FAQ/upload-model',
      'FAQ/api',
      'FAQ/gift',
      'FAQ/invoice',
      'FAQ/AI-application',
      'FAQ/consuption-details',
      'FAQ/coupon',
      'FAQ/API-pricelist',
      'FAQ/feedback',
      'FAQ/error-code',
      'FAQ/mcp',
      'FAQ/view-works',
      'FAQ/regenerate',
      'FAQ/start',
    ],
  };

  await fs.mkdir(path.join(targetRoot, 'cn'), { recursive: true });
  await fs.mkdir(path.join(targetRoot, 'en'), { recursive: true });
  await fs.writeFile(path.join(targetRoot, 'cn/meta.json'), JSON.stringify(cnMeta, null, 2) + '\n');
  await fs.writeFile(path.join(targetRoot, 'en/meta.json'), JSON.stringify(enMeta, null, 2) + '\n');
  await writeMetaFiles('cn');
  await writeMetaFiles('en');

  // Remove stale/generated starter directories that conflict with new content.
  await fs.rm(path.join(targetRoot, 'cn/api/meta.json'), { force: true });
  await fs.rm(path.join(targetRoot, 'cn/api/index.mdx'), { force: true });
  await fs.rm(path.join(targetRoot, 'en/api/meta.json'), { force: true });
  await fs.rm(path.join(targetRoot, 'en/api/index.mdx'), { force: true });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
