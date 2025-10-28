// lib/summarize.mjs  (APIゼロ：ローカル簡易サマライズのみ)
export function summarizeLocal(text, { maxSentences = 3 } = {}) {
  const src = (text || '').replace(/\s+/g, ' ').trim();
  if (!src) return '';

  const hasJa = /[一-龠ぁ-んァ-ヶ]/.test(src);
  if (hasJa) {
    const sents = src.split(/(?<=。)/).map(s => s.trim()).filter(Boolean);
    const pick = [];
    for (const s of sents) {
      if (s.length < 8) continue;
      pick.push(s);
      if (pick.length >= maxSentences) break;
    }
    return pick.join(' ');
  }

  const sents = src.split(/(?<=[.!?])\s+/).slice(0, 40);
  if (sents.length <= maxSentences) return sents.join(' ');
  const stop = new Set('the a an to of in on for and or but is are was were be been being that with from this those these it its by as at we you they he she his her their our your not if then than which who while where when what how more most into over under again further such'.split(' '));
  const freq = Object.create(null);
  for (const s of sents) {
    for (const w of s.toLowerCase().match(/[a-z0-9]+/g) || []) {
      if (stop.has(w)) continue;
      freq[w] = (freq[w] || 0) + 1;
    }
  }
  const scored = sents.map(s => {
    let sc = 0;
    for (const w of s.toLowerCase().match(/[a-z0-9]+/g) || []) sc += (freq[w] || 0);
    return { s, sc };
  }).sort((a,b) => b.sc - a.sc).slice(0, maxSentences);
  return scored.map(x => x.s).join(' ');
}
