// bot/index.mjs
import "dotenv/config";
import { Client, GatewayIntentBits, Partials } from "discord.js";

let _fetch = globalThis.fetch;
if (!_fetch) {
  const { default: f } = await import("node-fetch");
  _fetch = f;
}

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.REPO;
const EVENT_TYPE = process.env.EVENT_TYPE || "ai-news-url";

if (!DISCORD_TOKEN || !DISCORD_CHANNEL_ID || !GITHUB_TOKEN || !REPO) {
  console.error("Missing env. Please set DISCORD_TOKEN, DISCORD_CHANNEL_ID, GITHUB_TOKEN, REPO");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel]
});

client.once("ready", () => {
  console.log(`Discord bot online as ${client.user.tag}`);
});

const URL_RE = /(https?:\/\/[^\s>]+[^\s\.\)\]\}">])/i;

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;
    if (message.channel?.id !== DISCORD_CHANNEL_ID) return;

    const m = message.content.match(URL_RE);
    if (!m) return;

    const url = m[1];
    await message.react("✅").catch(()=>{});

    const res = await _fetch(`https://api.github.com/repos/${REPO}/dispatches`, {
      method: "POST",
      headers: {
        "authorization": `token ${GITHUB_TOKEN}`,
        "accept": "application/vnd.github+json"
      },
      body: JSON.stringify({
        event_type: EVENT_TYPE,
        client_payload: { url }
      })
    });

    if (!res.ok) {
      const txt = await res.text().catch(()=>String(res.status));
      console.error("dispatch failed:", res.status, txt);
      await message.reply("GitHub dispatch failed ❌").catch(()=>{});
    } else {
      await message.reply("GitHub Actions started 🚀").catch(()=>{});
    }
  } catch (e) {
    console.error(e);
  }
});

client.login(DISCORD_TOKEN);