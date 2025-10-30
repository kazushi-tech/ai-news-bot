import { fetch } from 'undici';

function endpoint() {
  const raw = process.env.DIFY_ENDPOINT;
  if (!raw || !/api\.dify\.ai/.test(raw)) return 'https://api.dify.ai/v1/workflows/run';
  return raw;
}

export async function summarizeUrlJP(url) {
  const key = process.env.DIFY_API_KEY_SUMMARY;
  if (!key) throw new Error('DIFY_API_KEY_SUMMARY is required');

  const body = {
    inputs: { url },
    response_mode: 'blocking',
    user: 'github-actions',
    workflow_id: process.env.DIFY_WORKFLOW_SUMMARY || 'ai-news-summarize-jp'
  };

  const res = await fetch(endpoint(), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const json = await res.json().catch(() => ({}));
  const out = json?.data?.outputs || json?.outputs || json || {};
  const title_ja = out.title_ja || out.title || '';
  const summary_ja = out.summary_ja || out.summary || out.text || '';
  const key_points = out.key_points || out.points || [];
  const lang = out.lang || 'ja';
  return { title_ja, summary_ja, key_points, lang };
}
