import 'dotenv/config';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';


const TOKEN = process.env.DISCORD_TOKEN || '';
const CHID  = (process.env.DISCORD_CHANNEL_ID || '').trim();
const ROOT  = process.env.NEWS_ROOT || './ai-news';
const QFILE = path.join(ROOT, 'queue', 'urls.txt');

if(!TOKEN){
  console.error('[discord] DISCORD_TOKEN is empty');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

function extractUrls(text=''){
  const rx = /https?:\/\/[^\s<>()]+/g;
  return (text.match(rx) || []).map(u=>u.trim());
}

async function addQueue(urls){
  await fs.mkdir(path.dirname(QFILE), { recursive: true });
  const prev = await fs.readFile(QFILE,'utf8').catch(()=> '');
  const set = new Set(prev.split('\n').map(s=>s.trim()).filter(Boolean));
  let added = 0;
  for(const u of urls){
    if(!set.has(u)){ set.add(u); added++; }
  }
  await fs.writeFile(QFILE, Array.from(set).join('\n')+'\n', 'utf8');
  return added;
}

let timer = null;
function debounceIngest(ms=5000){
  clearTimeout(timer);
  timer = setTimeout(()=>{
    const p = spawn(process.execPath, ['.dev/scripts/ingest_urls.mjs'], { stdio: 'inherit' });
    p.on('exit', code=> console.log(`[discord] ingest exit ${code}`));
  }, ms);
}

client.on('ready', () => {
  console.log(`[discord] logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (msg)=>{
  try{
    if(msg.author.bot) return;
    if(CHID && msg.channelId !== CHID) return;

    const urls = extractUrls(msg.content || '');
    if(urls.length === 0) return;

    const added = await addQueue(urls);
    if(added > 0){
      console.log(`[discord] queued ${added} url(s)`);
      debounceIngest(3000);
    }
  }catch(e){
    console.error('[discord] on message error', e);
  }
});

client.login(TOKEN).catch(e=>{
  console.error('[discord] login failed', e);
  process.exit(1);
});
