import { SlashCommandBuilder } from "discord.js";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
const exec = promisify(execFile);

export const data = new SlashCommandBuilder()
  .setName("feeds")
  .setDescription("AI系フィードを収集 → 要約 → Publish（Gemini 2.5-flash）")
  .addBooleanOption(o => o.setName("dry").setDescription("収集のみ"));

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const dry = interaction.options.getBoolean("dry") ?? false;
  const seedPath = `seeds/ai-feeds-${new Date().toISOString().slice(0,10)}.txt`;

  try {
    await exec("node", ["scripts/fetch_ai_feeds.mjs"], { env: process.env });
    if (!dry) {
      await exec("gh", [
        "workflow", "run", "summarize.yml",
        "-f", `seed_file=${seedPath}`,
        "-f", "lang=ja",
        "-f", "style=general",
        "-f", "model=gemini-2.5-flash",
        "-f", "publish_to_docs=true",
        "-r", "main"
      ], { env: process.env });
    }
    await interaction.editReply(`✅ 収集${dry ? "のみ" : "→要約"} 完了: ${seedPath}`);
  } catch (e) {
    await interaction.editReply(`❌ 失敗: ${e.stderr || e.message}`);
  }
}
