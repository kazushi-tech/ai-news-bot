import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';

const cmd = new SlashCommandBuilder().setName('ain').setDescription('AI News commands')
  .addSubcommand(sc => sc.setName('ping').setDescription('health check'))
  .addSubcommand(sc => sc.setName('clip').setDescription('URL と CLIPPED を送る')
    .addStringOption(o => o.setName('url').setDescription('Source URL').setRequired(true))
    .addStringOption(o => o.setName('md').setDescription('CLIPPED markdown（短文用）').setRequired(false).setMaxLength(6000))
    .addAttachmentOption(o => o.setName('md_file').setDescription('clip.md/.txt を添付').setRequired(false)));

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
await rest.put(
  Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
  { body: [cmd.toJSON()] }
);
console.log('Slash commands deployed');
