// scripts/utils/dify.js
import { fetch as undiciFetch } from "undici";

const fetchImpl = globalThis.fetch || undiciFetch;

export async function summarizeUrlJP(url) {
  const key = process.env.DIFY_API_KEY_SUMMARY;
  if (!key) throw new Error("DIFY_API_KEY_SUMMARY is required");

  const endpoint =
    process.env.DIFY_ENDPOINT && /api\.dify\.ai/.test(process.env.DIFY_ENDPOINT)
      ? process.env.DIFY_ENDPOINT
      : "https://api.dify.ai/v1/workflows/run";

  const workflow_id = process.env.DIFY_WORKFLOW_SUMMARY || "ai-news-summarize-jp";
  const body = {
    inputs: { url },
    user: "github-actions",
    response_mode: "blocking",
    workflow_id
  };

  const res = await fetchImpl(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text().catch(()=> "");
    throw new Error(`Dify ${res.status}: ${text.slice(0,200)}`);
  }
  const data = await res.json();
  // Difyの出力フォーマットに合わせて適宜調整
  const out = data?.data?.outputs || data?.data || data || {};
  return {
    title_ja: out.title_ja || out.title || "",
    summary_ja: out.summary_ja || out.summary || "",
    key_points: out.key_points || [],
    lang: out.lang || "ja"
  };
}
