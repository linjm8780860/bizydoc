export const runtime = 'nodejs';

type FeishuVerificationBody = {
  challenge?: string;
  token?: string;
  type?: string;
  header?: {
    token?: string;
  };
};

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, init);
}

function getOptionalEnv(name: string) {
  const value = process.env[name];
  return value?.trim() || undefined;
}

async function triggerDeployHook() {
  const deployHookUrl = getOptionalEnv('VERCEL_DEPLOY_HOOK_URL');
  if (!deployHookUrl) {
    return {
      skipped: true,
      reason: 'Missing VERCEL_DEPLOY_HOOK_URL',
    };
  }

  const response = await fetch(deployHookUrl, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Deploy hook returned HTTP ${response.status}: ${await response.text()}`);
  }

  return {
    skipped: false,
    status: response.status,
  };
}

export async function POST(request: Request) {
  let body: FeishuVerificationBody;

  try {
    body = (await request.json()) as FeishuVerificationBody;
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const webhookSecret = getOptionalEnv('FEISHU_REBUILD_WEBHOOK_SECRET');
  if (webhookSecret) {
    const url = new URL(request.url);
    const authorization = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
    const headerSecret = request.headers.get('x-feishu-rebuild-secret')?.trim();
    const querySecret = url.searchParams.get('secret')?.trim();
    const bodyToken = body.token?.trim() || body.header?.token?.trim();

    if (![authorization, headerSecret, querySecret, bodyToken].includes(webhookSecret)) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  if (body.challenge) {
    return json({ challenge: body.challenge });
  }

  try {
    const deploy = await triggerDeployHook();
    return json({ ok: true, deploy });
  } catch (error) {
    return json(
      {
        error: error instanceof Error ? error.message : 'Failed to trigger deploy hook',
      },
      { status: 502 },
    );
  }
}
