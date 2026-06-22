import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const langs = ['cn', 'en'] as const;

type Lang = (typeof langs)[number];

type TranslationConfig = {
  enabled?: boolean;
  source?: string;
  title?: string;
  description?: string;
  icon?: string;
};

type DocumentConfig = {
  slug: string;
  icon?: string;
  sourceHeading?: string;
  translations: Partial<Record<Lang, TranslationConfig>>;
};

type SyncConfig = {
  documents?: DocumentConfig[];
  collections?: CollectionConfig[];
};

type CollectionConfig = {
  source: string;
  lang?: Lang;
  documents: DocumentConfig[];
};

type FeishuDocument = {
  title?: string;
  content: string;
  revisionId?: string;
};

const defaultConfigPath = 'content/feishu-docs.config.json';

function readArgValue(name: string) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;

  return process.argv[index + 1];
}

function hasArg(name: string) {
  return process.argv.includes(name);
}

async function loadDotEnv(filePath = '.env.local') {
  try {
    const content = await readFile(filePath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const separator = trimmed.indexOf('=');
      if (separator === -1) continue;

      const key = trimmed.slice(0, separator).trim();
      const value = trimmed
        .slice(separator + 1)
        .trim()
        .replace(/^['"]|['"]$/g, '');

      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== 'ENOENT') throw error;
  }
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Put it in your shell or .env.local before syncing Feishu docs.`,
    );
  }

  return value;
}

function extractFeishuToken(source: string) {
  const match = source.match(/\/(?:docx|doc|wiki)\/([a-zA-Z0-9]+)/);

  return match?.[1] ?? source.trim();
}

function quoteFrontmatter(value: string) {
  return JSON.stringify(value);
}

function stripMarkdown(value: string) {
  return value
    .replace(/[`*_>#-]/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferDescription(markdown: string) {
  const firstParagraph = markdown
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith('#') && !line.startsWith('```'));

  if (!firstParagraph) return 'Synced from Feishu.';

  const description = stripMarkdown(firstParagraph);

  return description.length > 140 ? `${description.slice(0, 137)}...` : description;
}

function normalizeMarkdown(content: string, title: string) {
  const normalized = content.replace(/\r\n/g, '\n').trim();
  const lines = normalized.split('\n');
  const first = lines[0]?.trim();

  if (first === title || first === `# ${title}`) {
    lines.shift();
  }

  return lines.join('\n').trim() || '<!-- This Feishu document is empty. -->';
}

function renderMdx({
  title,
  description,
  icon,
  body,
  source,
  revisionId,
}: {
  title: string;
  description: string;
  icon?: string;
  body: string;
  source: string;
  revisionId?: string;
}) {
  const frontmatter = [
    '---',
    `title: ${quoteFrontmatter(title)}`,
    `description: ${quoteFrontmatter(description)}`,
    icon ? `icon: ${icon}` : undefined,
    '---',
  ]
    .filter(Boolean)
    .join('\n');

  const marker = [
    '{/*',
    '  This file is synced from Feishu. Do not edit it directly.',
    `  Source: ${source}`,
    revisionId ? `  Revision: ${revisionId}` : undefined,
    '*/}',
  ]
    .filter(Boolean)
    .join('\n');

  return `${frontmatter}\n\n${marker}\n\n${body}\n`;
}

async function feishuJson<T>(url: string, init: RequestInit = {}) {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Feishu HTTP ${response.status}: ${await response.text()}`);
  }

  const data = (await response.json()) as { code?: number; msg?: string; data?: T };
  if (data.code !== 0) {
    throw new Error(`Feishu API error ${data.code}: ${data.msg ?? 'Unknown error'}`);
  }

  return data.data as T;
}

async function getTenantAccessToken() {
  const data = await feishuJson<{ tenant_access_token: string }>(
    'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: requireEnv('FEISHU_APP_ID'),
        app_secret: requireEnv('FEISHU_APP_SECRET'),
      }),
    },
  );

  return data.tenant_access_token;
}

async function resolveFeishuSource(source: string, accessToken: string) {
  const token = extractFeishuToken(source);
  if (source.includes('/docx/') || source.includes('/doc/')) {
    return token;
  }

  try {
    const data = await feishuJson<{
      node?: {
        obj_token?: string;
        obj_type?: string;
      };
    }>(`https://open.feishu.cn/open-apis/wiki/v2/spaces/get_node?token=${token}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const node = data.node;
    if (!node?.obj_token) return token;
    if (node.obj_type !== 'docx' && node.obj_type !== 'doc') {
      throw new Error(`Unsupported Feishu wiki object type: ${node.obj_type}`);
    }

    return node.obj_token;
  } catch (error) {
    if (source.includes('/wiki/')) throw error;

    return token;
  }
}

async function readFeishuDocument(source: string, accessToken: string): Promise<FeishuDocument> {
  const documentId = await resolveFeishuSource(source, accessToken);
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };
  const [raw, info] = await Promise.all([
    feishuJson<{ content?: string }>(
      `https://open.feishu.cn/open-apis/docx/v1/documents/${documentId}/raw_content`,
      { headers },
    ),
    feishuJson<{
      document?: {
        title?: string;
        revision_id?: string;
      };
    }>(`https://open.feishu.cn/open-apis/docx/v1/documents/${documentId}`, { headers }),
  ]);

  return {
    title: info.document?.title,
    content: raw.content ?? '',
    revisionId: info.document?.revision_id,
  };
}

async function loadConfig(configPath: string) {
  const raw = await readFile(configPath, 'utf8');
  return JSON.parse(raw) as SyncConfig;
}

function getActiveEntries(config: SyncConfig) {
  return (config.documents ?? []).flatMap((doc) =>
    langs.flatMap((lang) => {
      const translation = doc.translations[lang];
      if (!translation?.source || translation.enabled === false) return [];

      return [{ doc, lang, translation }];
    }),
  );
}

function normalizeHeading(value: string) {
  return value.replace(/\s+/g, ' ').trim().toLowerCase();
}

function trimSectionSeparators(content: string) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');

  while (lines.length > 0 && (!lines[0].trim() || lines[0].trim() === '---')) {
    lines.shift();
  }

  while (lines.length > 0 && (!lines[lines.length - 1].trim() || lines[lines.length - 1].trim() === '---')) {
    lines.pop();
  }

  return lines.join('\n').trim();
}

function splitMarkdownByHeadings(content: string, headings: string[]) {
  const sections = new Map<string, string>();
  const targetHeadings = new Set(headings.map(normalizeHeading));
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  let currentHeadingKey: string | undefined;
  let currentLines: string[] = [];

  function flush() {
    if (!currentHeadingKey) return;

    sections.set(currentHeadingKey, trimSectionSeparators(currentLines.join('\n')));
  }

  for (const line of lines) {
    const match = line.match(/^##\s+(.+?)\s*#*\s*$/);
    const headingKey = match ? normalizeHeading(match[1]) : undefined;

    if (headingKey && targetHeadings.has(headingKey)) {
      if (currentHeadingKey === headingKey && currentLines.every((item) => !item.trim())) {
        currentLines.push(line);
        continue;
      }

      flush();
      currentHeadingKey = headingKey;
      currentLines = [];
      continue;
    }

    if (currentHeadingKey) {
      currentLines.push(line);
    }
  }

  flush();

  return sections;
}

function findSectionBody(sections: Map<string, string>, heading: string) {
  return sections.get(normalizeHeading(heading));
}

async function syncSingleDocuments(config: SyncConfig, accessToken: string, onlyLang?: Lang, dryRun = false) {
  let entries = getActiveEntries(config);

  if (onlyLang) {
    entries = entries.filter((entry) => entry.lang === onlyLang);
  }

  for (const { doc, lang, translation } of entries) {
    const source = translation.source?.trim();
    if (!source) continue;

    const feishuDoc = await readFeishuDocument(source, accessToken);
    const title = translation.title ?? feishuDoc.title ?? doc.slug;
    const body = normalizeMarkdown(feishuDoc.content, title);
    const description = translation.description ?? inferDescription(body);
    const icon = translation.icon ?? doc.icon;
    const output = path.join('content', 'docs', lang, `${doc.slug}.mdx`);
    const mdx = renderMdx({
      title,
      description,
      icon,
      body,
      source,
      revisionId: feishuDoc.revisionId,
    });

    if (dryRun) {
      console.log(`[dry-run] ${source} -> ${output}`);
      continue;
    }

    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, mdx, 'utf8');
    console.log(`Synced ${source} -> ${output}`);
  }
}

async function syncCollections(config: SyncConfig, accessToken: string, onlyLang?: Lang, dryRun = false) {
  for (const collection of config.collections ?? []) {
    const lang = collection.lang ?? 'cn';
    if (onlyLang && lang !== onlyLang) continue;

    const source = collection.source.trim();
    if (!source) continue;

    const feishuDoc = await readFeishuDocument(source, accessToken);
    const sourceHeadings = collection.documents.map((doc) => {
      const translation = doc.translations[lang];

      return doc.sourceHeading ?? translation?.title ?? doc.slug;
    });
    const sections = splitMarkdownByHeadings(feishuDoc.content, sourceHeadings);

    for (const doc of collection.documents) {
      const translation = doc.translations[lang];
      if (translation?.enabled === false) continue;

      const title = translation?.title ?? doc.sourceHeading ?? doc.slug;
      const heading = doc.sourceHeading ?? title;
      const sectionBody = findSectionBody(sections, heading);
      if (sectionBody === undefined) {
        throw new Error(`Missing section "${heading}" in ${source}. Update the Feishu heading or content/feishu-docs.config.json.`);
      }

      const body = normalizeMarkdown(sectionBody ?? '', title);
      const description = translation?.description ?? inferDescription(body);
      const icon = translation?.icon ?? doc.icon;
      const output = path.join('content', 'docs', lang, `${doc.slug}.mdx`);
      const mdx = renderMdx({
        title,
        description,
        icon,
        body,
        source: `${source}#${heading}`,
        revisionId: feishuDoc.revisionId,
      });

      if (dryRun) {
        console.log(`[dry-run] ${source}#${heading} -> ${output}`);
        continue;
      }

      await mkdir(path.dirname(output), { recursive: true });
      await writeFile(output, mdx, 'utf8');
      console.log(`Synced ${source}#${heading} -> ${output}`);
    }
  }
}

async function sync() {
  await loadDotEnv();

  const configPath = readArgValue('--config') ?? defaultConfigPath;
  const onlyLang = readArgValue('--lang') as Lang | undefined;
  const dryRun = hasArg('--dry-run');
  const config = await loadConfig(configPath);
  const hasSingleDocuments = getActiveEntries(config).length > 0;
  const hasCollections = (config.collections ?? []).length > 0;

  if (onlyLang) {
    if (!langs.includes(onlyLang)) throw new Error(`Unsupported language: ${onlyLang}`);
  }

  if (!hasSingleDocuments && !hasCollections) {
    console.log(
      `No Feishu documents are enabled in ${configPath}. Add source URLs and set enabled to true.`,
    );
    return;
  }

  const accessToken = await getTenantAccessToken();

  await syncSingleDocuments(config, accessToken, onlyLang, dryRun);
  await syncCollections(config, accessToken, onlyLang, dryRun);
}

sync().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
