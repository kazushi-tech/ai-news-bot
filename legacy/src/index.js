export default {
  async fetch(req, env) {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const body = await req.text();
    const sig = req.headers.get("x-signature") || "";
    const ok = await verifyHmac(body, sig, env.SECRET);
    if (!ok) return new Response("bad signature", { status: 401 });

    const payloadIn = JSON.parse(body || "{}");
    const url = String(payloadIn.url || "");
    const seed_file = String(payloadIn.seed_file || "");
    const style = String(payloadIn.style || "general");
    const lang = String(payloadIn.lang || "ja");
    const publish_to_docs = true; // 常に保存する想定
    const docs_path = "news";     // Obsidianで直接見える場所に固定

    const ghOwner = env.GITHUB_OWNER || "kazushi-tech";
    const ghRepo  = env.GITHUB_REPO  || "ai-news-bot";
    const wfRef   = env.WORKFLOW_REF || "main";
    const wfFile  = env.GH_WORKFLOW  || "summarize.yml";

    const ep = `https://api.github.com/repos/${ghOwner}/${ghRepo}/actions/workflows/${encodeURIComponent(wfFile)}/dispatches`;
    const ghPayload = {
      ref: wfRef,
      inputs: {
        url, seed_file, style, lang,
        model: "gemini-2.5-flash",
        publish_to_docs: String(!!publish_to_docs),
        docs_path
      }
    };

    const r = await fetch(ep, {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.GH_TOKEN}`,
        "user-agent": "ai-news-bot-worker",
        accept: "application/vnd.github+json",
        "content-type": "application/json",
      },
      body: JSON.stringify(ghPayload),
    });

    if (!r.ok) return new Response(await r.text(), { status: r.status });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } });
  },
};

async function verifyHmac(body, sig, secret) {
  if (!secret) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return sig === hex;
}
