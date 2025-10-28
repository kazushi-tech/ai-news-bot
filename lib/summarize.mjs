// lib/summarize.mjs
// 軽量TextRank: 依存ゼロ、和文でも実用ライン
export function summarizeLocal(text, { maxSentences = 3 } = {}) {
  if (!text) return '';
  const sentences = splitSentences(text).filter(s => s.length > 5);
  if (sentences.length <= maxSentences) return sentences.join(' ');
  const tf = buildTf(sentences);
  const sim = cosineMatrix(tf);
  const scores = pageRank(sim, 20, 0.85);
  const ranked = sentences
    .map((s, i) => ({ s, i, score: scores[i] }))
    .sort((a,b)=>b.score-a.score)
    .slice(0, maxSentences)
    .sort((a,b)=>a.i-b.i)
    .map(x=>x.s);
  return ranked.join(' ');
}

function splitSentences(t) {
  // 句点ベース＋英語ピリオドにもほどほど対応
  return t.replace(/\s+/g,' ')
          .split(/(?<=[。．！？!?]|(?:\.\s))/)
          .map(s=>s.trim())
          .filter(Boolean);
}
function tokenize(s) {
  return s.toLowerCase().normalize('NFKC')
    .replace(/[“”"'\u3000]/g,' ')
    .replace(/[()[\]{}|/\\!?@#$%^&*_=+~:;.,<>-]/g,' ')
    .split(/\s+/).filter(w=>w && w.length>1);
}
function buildTf(sentences) {
  const docs = sentences.map(tokenize);
  const df = new Map();
  for (const d of docs) {
    for (const w of new Set(d)) df.set(w, (df.get(w)||0)+1);
  }
  const N = docs.length;
  return docs.map(d=>{
    const tf = new Map();
    for (const w of d) tf.set(w, (tf.get(w)||0)+1);
    // tf-idf
    const v = new Map();
    for (const [w, c] of tf) {
      const idf = Math.log((N+1)/((df.get(w)||1)+1)) + 1;
      v.set(w, c*idf);
    }
    return v;
  });
}
function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  const keys = new Set([...a.keys(), ...b.keys()]);
  for (const k of keys) {
    const va = a.get(k)||0, vb = b.get(k)||0;
    dot += va*vb; na += va*va; nb += vb*vb;
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na)*Math.sqrt(nb));
}
function cosineMatrix(tf) {
  const n = tf.length;
  const m = Array.from({length:n},()=>Array(n).fill(0));
  for (let i=0;i<n;i++) {
    for (let j=i+1;j<n;j++) {
      const c = cosine(tf[i], tf[j]);
      m[i][j]=c; m[j][i]=c;
    }
  }
  return m;
}
function pageRank(sim, iters=20, d=0.85) {
  const n = sim.length;
  const s = new Array(n).fill(1/n);
  const outSum = sim.map(row=>row.reduce((a,b)=>a+b,0));
  for (let k=0;k<iters;k++){
    const ns = new Array(n).fill((1-d)/n);
    for (let i=0;i<n;i++){
      for (let j=0;j<n;j++){
        if (outSum[j]>0) ns[i]+= d*(sim[j][i]/outSum[j])*s[j];
      }
    }
    s.splice(0,n,...ns);
  }
  return s;
}

// 任意：OpenAI（APIキーがある時だけ）
export async function summarizeOpenAI(text, { model = process.env.OPENAI_MODEL || 'gpt-4o-mini' } = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return summarizeLocal(text); // セーフフォールバック
  const body = {
    model,
    messages: [
      { role: 'system', content: 'あなたは優秀な要約者です。重要ポイントを簡潔に日本語で3文以内にまとめてください。' },
      { role: 'user', content: text.slice(0, 8000) }
    ],
    temperature: 0.2
  };
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) return summarizeLocal(text);
  const data = await res.json();
  const out = data?.choices?.[0]?.message?.content?.trim();
  return out || summarizeLocal(text);
}
