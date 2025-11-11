import 'dotenv/config';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { Client, GatewayIntentBits, Partials } from 'discord.js';

const TOKEN = process.env.DISCORD_TOKEN || '';
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || '';
const AUTO_PUSH = process.env.AUTO_PUSH === '1';
const LOOKBACK_MIN = Number(process.env.POLL_LOOKBACK_MIN || 30); // 過去30分

if (!TOKEN || !CHANNEL_ID) {
  console.error('[poll] DISCORD_TOKEN / DISCORD_CHANNEL_ID が未設定です。');
  process.exit(1);
}

function extractUrls(text=''){
  return (text.match(/https?:\/\/\S+/g) || []).map(s=>s.replace(/[)>]+$/,''));
}
function runNode(scriptRelPath, args=[]){
  return new Promise((resolve, reject)=>{
    const p = spawn(process.execPath, [path.resolve(scriptRelPath), ...args], { stdio: 'inherit' });
    p.on('close', code => code === 0 ? resolve() : reject(new Error(`${scriptRelPath} exited ${code}`)));
  });
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel, Partials.Message]
});

client.once('ready', async () => {
  try {
    const ch = await client.channels.fetch(CHANNEL_ID);
    if (!ch?.isTextBased?.()) throw new Error('Channel is not text-based');

    const since = Date.now() - LOOKBACK_MIN * 60 * 1000;
    let collected = [];
    let lastId = undefined;

    // 最大300件程度を安全に遡る（3ページ）
    for (let round=0; round<3; round++){
      const batch = await ch.messages.fetch({ limit: 100, before: lastId }).catch(()=>null);
      if (!batch?.size) break;
      const arr = Array.from(batch.values());
      arr.sort((a,b)=>b.createdTimestamp - a.createdTimestamp);
      for (const m of arr) {
        if (m.createdTimestamp < since) break;
        if (m.author?.bot) continue;
        const urls = extractUrls(m.content || '');
        if (urls.length) collected.push(...urls);
      }
      const oldest = arr[arr.length - 1];
      lastId = oldest?.id;
      if (!lastId || oldest.createdTimestamp < since) break;
    }

    const dedup = Array.from(new Set(collected));
    if (!dedup.length) {
      console.log(`[poll] 対象期間(${LOOKBACK_MIN}分)でURLはありませんでした。`);
      await client.destroy();
      process.exit(0);
    }

    console.log(`[poll] 収集URL: ${dedup.length} 件 → add_url → ingest`);
    await runNode('.dev/scripts/add_url.mjs', dedup);
    await runNode('.dev/scripts/ingest_urls.mjs');
    if (AUTO_PUSH) await runNode('.dev/scripts/push.mjs');

    await client.destroy();
  } catch (e) {
    console.error('[poll] error:', e?.message || e);
    await client.destroy();
    process.exit(1);
  }
});

client.login(TOKEN).catch(err=>{
  console.error('[poll] login failed:', err?.message || err);
  process.exit(1);
});
