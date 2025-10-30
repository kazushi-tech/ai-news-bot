// src/index.js
/**
 * Env:
 *  - DISCORD_PUBLIC_KEY (Secret)
 *  - DISCORD_APP_ID
 *  - DISCORD_TOKEN
 *  - DIFY_API_KEY (Secret)
 *  - DIFY_ENDPOINT (default: https://api.dify.ai/v1/workflows/run)
 *  - (optional) BYPASS_GITHUB_DISPATCH = "1"  // 有効化でWorkerから直接GitHub dispatch
 *  - (optional) GITHUB_PAT (Secret)           // 直POST用のPAT（Fine-grained, Actions:write, Contents:read, Metadata:read）
 *  - (optional) GITHUB_OWNER_REPO             // 例: "kazushi-tech/ai-news-bot"（未設定なら既定値を使用）
 */

const json = (obj, init = {}) =>
  new Response(JSON.stringify(obj), {
    headers: { "content-type": "application/json; charset=utf-8" },
    ...init,
  });

function hexToU8(hex) {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) arr[i] = parseInt(hex.substr(i * 2, 2), 16);
  return arr;
}

async function verifySignature(req, publicKeyHex) {
  const sig = req.headers.get("X-Signature-Ed25519");
  const ts = req.headers.get("X-Signature-Timestamp");
  if (!sig || !ts) return false;

  const body = await req.text();
  const key = await crypto.subtle.importKey(
    "raw",
    hexToU8(publicKeyHex),
    { name: "Ed25519" },
    false,
    ["verify"]
  );
  const ok = await crypto.subtle.verify(
    "Ed25519",
    key,
    hexToU8(sig),
    new TextEncoder().encode(ts + body)
  );
  return { ok, rawBody: body };
}

async function postJSON(url, body, headers = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* ignore */
  }
  return { status: res.status, data, text };
}

export default {
  async fetch(req, env, ctx) {
    if (req.method !== "POST") return new Response("OK", { status: 200 });

    // Discord signature verify
    const v = await verifySignature(req, env.DISCORD_PUBLIC_KEY);
    if (!v || !v.ok) return new Response("Bad signature", { status: 401 });

    const interaction = JSON.parse(v.rawBody || "{}");
    const type = interaction.type;

    // PING
    if (type === 1) return json({ type: 1 });

    // Application Command
    if (type === 2) {
      const name = interaction.data?.name;
      if (name !== "inbox-url") {
        return json({
          type: 4,
          data: { content: "未知のコマンドです。", flags: 64 },
        });
      }

      // ---- 取り出し強化（空対策のフォールバック付き）
      let optionText =
        interaction?.data?.options?.find((o) => o.name === "text")?.value ??
        interaction?.data?.options?.[0]?.value ??
        "";
      const userId =
        interaction?.member?.user?.id || interaction?.user?.id || "unknown";

      // instrumentation: 入力を可視化
      console.log("discord text:", optionText ?? "<undefined>");

      // 即時ACK（エフェメラル）
      const ack = json({
        type: 4,
        data: {
          content: "受け付けたよ。URL抽出→Inbox投入までやるね。",
          flags: 64, // EPHEMERAL
        },
      });

      // バックグラウンドでDify実行→（必要なら）GitHub直POST→Discordフォローアップ
      ctx.waitUntil(
        (async () => {
          // 1) Dify Workflow 実行
          // --- Dify エンドポイントの強制ガード ---
const DIFY_API_URL_DEFAULT = "https://api.dify.ai/v1/workflows/run";
let difyEndpoint = DIFY_API_URL_DEFAULT;
if (typeof env.DIFY_ENDPOINT === "string") {
  const candidate = env.DIFY_ENDPOINT.trim();
  if (/^https:\/\/api\.dify\.ai\//.test(candidate)) {
    difyEndpoint = candidate;            // 正しい形式だけ採用
  } else {
    console.log("[sanity] invalid DIFY_ENDPOINT ->", candidate, "(fallback to default)");
    // 誤値は無視して既定URLを使う
  }
}
// -----------------------------------------

          const difyHeaders = { Authorization: `Bearer ${env.DIFY_API_KEY}` };
          const difyBody = {
            inputs: { text: optionText },
            user: `discord:${userId}`,
            response_mode: "blocking",
          };

          // instrumentation: Dify リクエスト内容
          try {
            console.log(
              "dify request:",
              JSON.stringify({
                url: difyEndpoint,
                body: difyBody,
                headers: { Authorization: "Bearer ***" }, // マスク済み
              })
            );
          } catch {}

          const difyRes = await postJSON(difyEndpoint, difyBody, difyHeaders);
          console.log(`POST Dify -> ${difyRes.status}`);

          // Dify返却の取り出し（data.data.outputs / outputs の両対応）
          const outputs =
            difyRes?.data?.data?.outputs ||
            difyRes?.data?.outputs ||
            {};
          // instrumentation: 返却全体
          try {
            console.log("dify outputs:", JSON.stringify(outputs));
          } catch {}

          let urls = [];
          try {
            const candidate = outputs?.urls;
            urls = Array.isArray(candidate) ? candidate : [];
          } catch {}
          console.log(
            "dify outputs.urls.length =",
            Array.isArray(urls) ? urls.length : "<not-array>"
          );

          // 2) （オプション）Workerから直接 GitHub dispatch
          // - BYPASS_GITHUB_DISPATCH=1 もしくは GITHUB_PAT が設定されている場合のみ実行
          let manualGhStatus = null;
          if (
            (env.BYPASS_GITHUB_DISPATCH === "1" || env.GITHUB_PAT) &&
            Array.isArray(urls)
          ) {
            const ownerRepo =
              env.GITHUB_OWNER_REPO || "kazushi-tech/ai-news-bot";
            const ghUrl = `https://api.github.com/repos/${ownerRepo}/dispatches`;
            const ghHeaders = {
              Accept: "application/vnd.github+json",
              "X-GitHub-Api-Version": "2022-11-28",
              Authorization: `Bearer ${env.GITHUB_PAT}`,
            };
            const ghBody = {
              event_type: "inbox_url",
              client_payload: { urls, source: "discord" },
            };

            const ghRes = await postJSON(ghUrl, ghBody, ghHeaders);
            manualGhStatus = ghRes.status;
            console.log(`GitHub dispatch (worker) -> ${ghRes.status}`);
            if (ghRes.status >= 400) {
              console.log("GitHub dispatch error body:", ghRes.text || ghRes.data);
            }
          }

          // 3) Discord フォローアップ（エフェメラル）
          //    - DifyのHTTPノードを使っている構成では outputs.status にHTTPノードのstatusが入っている想定
          const ghStatusFromDify = outputs?.status;
          const effectiveGhStatus =
            manualGhStatus ??
            (typeof ghStatusFromDify === "number"
              ? ghStatusFromDify
              : "<via-dify>");

          const followupUrl = `https://discord.com/api/v10/webhooks/${env.DISCORD_APP_ID}/${interaction.token}`;
          const lines = [];
          if (Array.isArray(urls) && urls.length > 0) {
            // 3件までだけ詳細表示（長すぎ回避）
            const head = urls.slice(0, 3);
            lines.push(
              `抽出URL: ${urls.length}件\n${head.map((u) => `- ${u}`).join("\n")}${
                urls.length > 3 ? `\n…and ${urls.length - 3} more` : ""
              }`
            );
          } else {
            lines.push("抽出URL: 0件");
          }
          lines.push(`Dify: ${difyRes.status}`);
          lines.push(`GitHub dispatch: ${effectiveGhStatus}`);

          const followupBody = { content: lines.join("\n"), flags: 64 };

          const fw = await postJSON(followupUrl, followupBody, {
            Authorization: `Bot ${env.DISCORD_TOKEN}`,
            "X-RateLimit-Precision": "millisecond",
          });
          console.log(`POST Discord followup -> ${fw.status}`);
          if (fw.status >= 400) {
            console.log("Discord followup error body:", fw.text || fw.data);
          }
        })()
      );

      return ack;
    }

    return new Response("Unsupported interaction", { status: 400 });
  },
};
