// src/index.js
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('ok', { status: 200 });

    const ct = request.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await request.json().catch(() => ({})) : {};
    const text = String(data.text || data.content || '');
    const m = text.match(/https?:\/\/[^\s<>()\[\]{}"'`]+/i);
    if (!m) {
      return new Response(JSON.stringify({ error: 'no url in text', text }), {
        status: 400, headers: { 'content-type': 'application/json' }
      });
    }
    const url = m[0];

    const body = {
      ref: env.WORKFLOW_REF || 'main',
      inputs: {
        url,
        style: env.DEFAULT_STYLE || 'general',
        lang: env.DEFAULT_LANG || 'ja',
        model: env.DEFAULT_MODEL || '' // 空なら repo var GEMINI_MODEL が使われる
      }
    };

    const api = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/actions/workflows/summarize.yml/dispatches`;
    const res = await fetch(api, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.GITHUB_TOKEN}`,
        accept: 'application/vnd.github+json',
        'content-type': 'application/json',
        'user-agent': 'ai-news-inbox-dispatch/1.0'
      },
      body: JSON.stringify(body)
    });

    const ok = res.status === 204;
    return new Response(JSON.stringify({ ok, status: res.status, sent: body.inputs }), {
      status: ok ? 200 : 500,
      headers: { 'content-type': 'application/json' }
    });
  }
};
