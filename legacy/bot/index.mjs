import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { fetch } from 'undici';

const {
  DISCORD_TOKEN,
  DISCORD_CHANNEL_ID,
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_PAT, // repo + workflow 権限を付与したPAT
} = process.env;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

const urlRe = /\bhttps?:\/\/[^\s<>()]+/gi;

client.on('messageCreate', async (msg) => {
  try {
    if (msg.author.bot) return;
    if (DISCORD_CHANNEL_ID && msg.channelId !== DISCORD_CHANNEL_ID) return;

    const urls = (msg.content.match(urlRe) || []).slice(0, 3);
    for (const url of urls) {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${GITHUB_PAT}`,
          'Accept': 'application/vnd.github+json'
        },
        body: JSON.stringify({
          event_type: 'summarize_url',
          client_payload: { url }
        })
      });

      if (res.ok) {
        await msg.react('✅');
      } else {
        const text = await res.text().catch(() => '');
        await msg.reply(`GitHub dispatch失敗: ${res.status} ${res.statusText} ${text.slice(0, 120)}`);
      }
    }
  } catch (e) {
    console.error(e);
  }
});

client.login(DISCORD_TOKEN);
