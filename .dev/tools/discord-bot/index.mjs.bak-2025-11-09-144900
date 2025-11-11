// tools/discord-bot/index.mjs
import 'dotenv/config';
import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';

const {
  DISCORD_TOKEN, // Bot Token
  APP_ID,        // Application (Client) ID
  GUILD_ID,      // Guild ID
  GH_TOKEN,      // GitHub token (repo権限)
  GH_REPO        // "owner/repo"
} = process.env;

function assertEnv() {
  const need = ['DISCORD_TOKEN','APP_ID','GUILD_ID','GH_TOKEN','GH_REPO'];
  const miss = need.filter(k => !process.env[k]);
  if (miss.length) {
    console.error('Missing env:', miss.join(', '));
    process.exit(1);
  }
}

async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName('news')
      .setDescription('Ingest a news article URL into ai-news')
      .addStringOption(o =>
        o.setName('url')
         .setDescription('Article URL')
         .setRequired(true)
      ).toJSON()
  ];
  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
  await rest.put(Routes.applicationGuildCommands(APP_ID, GUILD_ID), { body: commands });
  console.log('✅ Registered: /news');
}

async function githubDispatch(url) {
  const res = await fetch(`https://api.github.com/repos/${GH_REPO}/dispatches`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${GH_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ event_type: 'ingest_url', client_payload: { url } })
  });
  if (!res.ok) throw new Error(`GitHub dispatch failed: ${res.status} ${await res.text()}`);
}

async function main() {
  assertEnv();

  // 1回だけ登録したいとき: `node tools/discord-bot/index.mjs register`
  if (process.argv[2] === 'register') {
    await registerCommands();
    process.exit(0);
  }

  // 起動時に念のため毎回登録（冪等）
  await registerCommands();

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once('ready', () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
  });

  client.on('interactionCreate', async (interaction) => {
    try {
      if (!interaction.isChatInputCommand()) return;
      if (interaction.commandName !== 'news') return;
      const url = interaction.options.getString('url', true);
      await interaction.deferReply({ ephemeral: true });
      await githubDispatch(url);
      await interaction.editReply(`📰 queued: ${url}`);
    } catch (e) {
      const msg = e?.message || String(e);
      if (interaction.isRepliable()) {
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply(`❌ ${msg}`);
        } else {
          await interaction.reply({ content: `❌ ${msg}`, ephemeral: true });
        }
      }
      console.error(e);
    }
  });

  await client.login(DISCORD_TOKEN);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
