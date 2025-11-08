// bot.mjs
import 'dotenv/config';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { spawn } from 'node:child_process';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async () => {
  await client.application.fetch();
  const g = client.guilds.cache.get(process.env.GUILD_ID);
  console.log('Bot ready as', client.user.tag);
  console.log('appId=', client.application.id, 'env.CLIENT_ID=', process.env.CLIENT_ID, 'guildId=', process.env.GUILD_ID, 'joinedGuild=', !!g);
});

// —— ここが肝：到着直後に必ずACK（deferReply） ——
client.on(Events.InteractionCreate, async (i) => {
  try {
    if (!i.isChatInputCommand() || i.commandName !== 'ain') return;

    // 1) 先にACK。既に応答済みならスキップ
    if (!i.deferred && !i.replied) {
      await i.deferReply({ ephemeral: true }); // これで3秒タイムアウト回避
    }

    const sub = (i.options.getSubcommand && i.options.getSubcommand(false)) || 'clip';

    // /ain ping（疎通確認）
    if (sub === 'ping') {
      await i.editReply('🏓 pong');
      return;
    }

    // /ain clip
    if (sub === 'clip') {
      const url = i.options.getString('url', true);
      let md = i.options.getString('md') ?? '';
      const mdFile = i.options.getAttachment?.('md_file');

      // 添付があれば取得（ACK後なので時間かかってOK）
      if (!md && mdFile) {
        const res = await fetch(mdFile.url);
        if (!res.ok) throw new Error(`md_file fetch failed: ${res.status}`);
        md = await res.text();
      }
      if (!md) {
        await i.editReply('❌ クリップが空です。`md` か `md_file` を指定してください。');
        return;
      }

      await i.editReply('✅ 受領しました（CLIPPED優先）。処理を開始します。');

      // 既存CLIへパイプ（標準入力）
      const p = spawn('node', ['scripts/summarize_from_clip.mjs', '--url', url, '--clip-stdin'], { cwd: process.cwd() });
      p.stdin.write(md); p.stdin.end();

      let out = '', err = '';
      p.stdout.on('data', d => out += d.toString());
      p.stderr.on('data', d => err += d.toString());
      p.on('close', async (code) => {
        if (code === 0) {
          await i.followUp({ content: '✅ 要約ノート作成完了（articles/ に出力）。' });
        } else {
          await i.followUp({ content: `❌ 失敗\n\`\`\`\n${err || out}\n\`\`\``, ephemeral: true });
        }
      });
    }
  } catch (e) {
    console.error(e);
    if (i.deferred || i.replied) await i.editReply(`❌ エラー: ${e.message}`);
    else await i.reply({ content: `❌ エラー: ${e.message}`, ephemeral: true });
  }
});

client.login(process.env.DISCORD_TOKEN);
