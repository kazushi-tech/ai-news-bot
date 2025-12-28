#!/usr/bin/env node
// scripts/post_candidates_to_discord.mjs
// GitHub Actions用: Inbox候補をDiscordに投稿するスタンドアロンスクリプト

import 'dotenv/config';
import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import { loadInbox } from './lib/inbox_manager.mjs';
import { mapMessageToCandidate } from './lib/discord_state.mjs';

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const BATCH_SIZE = parseInt(process.env.INBOX_POST_BATCH_SIZE || '10', 10);

if (!TOKEN) {
  console.error('ERROR: DISCORD_BOT_TOKEN is not set');
  process.exit(1);
}

if (!CHANNEL_ID) {
  console.error('ERROR: DISCORD_CHANNEL_ID is not set');
  process.exit(1);
}

async function postCandidates() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages
    ]
  });

  await client.login(TOKEN);
  
  console.log(`[post-candidates] Logged in as ${client.user.tag}`);
  
  const candidates = await loadInbox('pending');
  
  if (candidates.length === 0) {
    console.log('[post-candidates] No pending candidates to post.');
    await client.destroy();
    return;
  }
  
  const toPost = candidates.slice(0, BATCH_SIZE);
  console.log(`[post-candidates] Posting ${toPost.length} candidates...`);
  
  const channel = await client.channels.fetch(CHANNEL_ID);
  
  for (const candidate of toPost) {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`[${candidate.id}] ${candidate.title}`)
      .setURL(candidate.url)
      .addFields(
        { name: 'Source', value: candidate.source, inline: true },
        { name: 'Date', value: candidate.date, inline: true }
      )
      .setFooter({ text: `React with ✅ to approve, ❌ to reject` });
    
    const msg = await channel.send({ embeds: [embed] });
    
    // Add reactions
    await msg.react('✅');
    await msg.react('❌');
    
    // Map message to candidate
    await mapMessageToCandidate(msg.id, {
      url: candidate.url,
      title: candidate.title,
      source: candidate.source,
      candidateId: candidate.id,
      status: 'pending'
    });
    
    console.log(`[post-candidates] Posted: [${candidate.id}] ${candidate.title}`);
  }
  
  console.log(`[post-candidates] Successfully posted ${toPost.length} candidates.`);
  
  await client.destroy();
}

postCandidates().catch(err => {
  console.error('[post-candidates] Error:', err);
  process.exit(1);
});
