// scripts/discord_inbox_bot.mjs
// Discord Inbox Approval Bot
// 候補をDiscordに投稿し、リアクションで承認/否認を処理

import 'dotenv/config';
import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import { spawn } from 'node:child_process';
import { loadInbox, updateInboxStatus, findInboxCandidate } from './lib/inbox_manager.mjs';
import { 
  getCandidateByMessageId, 
  mapMessageToCandidate,
  recordDecision,
  getDecision 
} from './lib/discord_state.mjs';
import { REPO_ROOT, QUEUE_DIR } from './lib/paths.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';

// ============================================================================
// Configuration
// ============================================================================

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const ALLOWED_USER_IDS = (process.env.DISCORD_ALLOWED_USER_IDS || '')
  .split(',')
  .map(id => id.trim())
  .filter(Boolean);

const BATCH_SIZE = parseInt(process.env.INBOX_POST_BATCH_SIZE || '10', 10);

if (!TOKEN) {
  console.error('ERROR: DISCORD_BOT_TOKEN is not set');
  process.exit(1);
}

if (!CHANNEL_ID) {
  console.error('ERROR: DISCORD_CHANNEL_ID is not set');
  process.exit(1);
}

if (ALLOWED_USER_IDS.length === 0) {
  console.warn('WARN: DISCORD_ALLOWED_USER_IDS is not set. All users will be allowed.');
}

// ============================================================================
// Discord Client
// ============================================================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ]
});

// ============================================================================
// Utilities
// ============================================================================

function log(...args) {
  console.log('[inbox-bot]', ...args);
}

function isAllowedUser(userId) {
  if (ALLOWED_USER_IDS.length === 0) return true;
  return ALLOWED_USER_IDS.includes(userId);
}

async function runScript(scriptPath, args = []) {
  return new Promise((resolve) => {
    log(`Running: node ${scriptPath} ${args.join(' ')}`);
    const child = spawn(process.execPath, [scriptPath, ...args], {
      cwd: REPO_ROOT,
      stdio: 'inherit'
    });
    child.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

async function addToQueue(url) {
  const queueFile = path.join(QUEUE_DIR, 'urls.txt');
  await fs.mkdir(QUEUE_DIR, { recursive: true });
  await fs.appendFile(queueFile, url + '\n', 'utf8');
  log(`Added to queue: ${url}`);
}

// ============================================================================
// Approval Pipeline
// ============================================================================

async function processApproval(url, userId) {
  log(`Processing approval for: ${url}`);
  
  // Record decision
  await recordDecision(url, 'approved', userId);
  
  // Add to queue (queue_worker will handle it)
  await addToQueue(url);
  
  // Run queue worker
  const summarizeScript = path.join(REPO_ROOT, 'scripts', 'summarize_article.mjs');
  const finishScript = path.join(REPO_ROOT, 'scripts', 'finish_up.mjs');
  
  const success = await runScript(summarizeScript, [url]);
  
  if (success) {
    await runScript(finishScript);
    await updateInboxStatus(url, 'approved');
    log(`✅ Approved and registered: ${url}`);
    return true;
  } else {
    log(`❌ Failed to process: ${url}`);
    return false;
  }
}

async function processRejection(url, userId) {
  log(`Processing rejection for: ${url}`);
  
  await recordDecision(url, 'rejected', userId);
  await updateInboxStatus(url, 'rejected');
  
  log(`❌ Rejected: ${url}`);
  return true;
}

// ============================================================================
// Commands
// ============================================================================

async function handleInboxCommand(message) {
  const candidates = await loadInbox('pending');
  
  if (candidates.length === 0) {
    await message.reply('📭 Inbox is empty (no pending candidates).');
    return;
  }
  
  const summary = `📬 **Inbox Summary**\n${candidates.length} pending candidates\n\nUse \`/post-candidates\` to post them to Discord.`;
  await message.reply(summary);
}

async function handlePostCandidates(message, count = BATCH_SIZE) {
  const candidates = await loadInbox('pending');
  
  if (candidates.length === 0) {
    await message.reply('📭 No pending candidates to post.');
    return;
  }
  
  const toPost = candidates.slice(0, count);
  
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
    
    const msg = await message.channel.send({ embeds: [embed] });
    
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
  }
  
  await message.reply(`📬 Posted ${toPost.length} candidates.`);
}

async function handleApproveCommand(message, candidateId) {
  if (!candidateId) {
    await message.reply('Usage: `/approve <id>` (e.g., `/approve A001`)');
    return;
  }
  
  const candidates = await loadInbox('pending');
  const candidate = candidates.find(c => c.id === candidateId.toUpperCase());
  
  if (!candidate) {
    await message.reply(`❌ Candidate ${candidateId} not found.`);
    return;
  }
  
  const success = await processApproval(candidate.url, message.author.id);
  
  if (success) {
    await message.reply(`✅ Approved and registered: [${candidate.id}] ${candidate.title}`);
  } else {
    await message.reply(`❌ Failed to register: [${candidate.id}] ${candidate.title}`);
  }
}

async function handleRejectCommand(message, candidateId) {
  if (!candidateId) {
    await message.reply('Usage: `/reject <id>` (e.g., `/reject A001`)');
    return;
  }
  
  const candidates = await loadInbox('all');
  const candidate = candidates.find(c => c.id === candidateId.toUpperCase());
  
  if (!candidate) {
    await message.reply(`❌ Candidate ${candidateId} not found.`);
    return;
  }
  
  await processRejection(candidate.url, message.author.id);
  await message.reply(`❌ Rejected: [${candidate.id}] ${candidate.title}`);
}

// ============================================================================
// Event Handlers
// ============================================================================

client.once('ready', () => {
  log(`Logged in as ${client.user.tag}`);
  log(`Watching channel: ${CHANNEL_ID}`);
  log(`Allowed users: ${ALLOWED_USER_IDS.length > 0 ? ALLOWED_USER_IDS.join(', ') : 'ALL'}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channelId !== CHANNEL_ID) return;
  if (!isAllowedUser(message.author.id)) return;
  
  const content = message.content.trim();
  
  if (content === '/inbox') {
    await handleInboxCommand(message);
  } else if (content.startsWith('/post-candidates')) {
    const parts = content.split(' ');
    const count = parts[1] ? parseInt(parts[1], 10) : BATCH_SIZE;
    await handlePostCandidates(message, count);
  } else if (content.startsWith('/approve ')) {
    const candidateId = content.split(' ')[1];
    await handleApproveCommand(message, candidateId);
  } else if (content.startsWith('/reject ')) {
    const candidateId = content.split(' ')[1];
    await handleRejectCommand(message, candidateId);
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  if (!isAllowedUser(user.id)) {
    log(`Reaction from unauthorized user: ${user.tag}`);
    return;
  }
  
  // Fetch message if partial
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      log('Error fetching reaction:', error);
      return;
    }
  }
  
  const messageId = reaction.message.id;
  const candidate = await getCandidateByMessageId(messageId);
  
  if (!candidate) {
    // Not a candidate message
    return;
  }
  
  // Check if already decided
  const decision = await getDecision(candidate.url);
  if (decision) {
    log(`Already decided: ${candidate.url} (${decision.decision})`);
    return;
  }
  
  if (reaction.emoji.name === '✅') {
    log(`Approval reaction from ${user.tag} for: ${candidate.url}`);
    
    const success = await processApproval(candidate.url, user.id);
    
    if (success) {
      await reaction.message.reply(`✅ Registered: [${candidate.candidateId}] ${candidate.title}`);
    } else {
      await reaction.message.reply(`❌ Failed to register: [${candidate.candidateId}] ${candidate.title}`);
    }
  } else if (reaction.emoji.name === '❌') {
    log(`Rejection reaction from ${user.tag} for: ${candidate.url}`);
    
    await processRejection(candidate.url, user.id);
    await reaction.message.reply(`❌ Rejected: [${candidate.candidateId}] ${candidate.title}`);
  }
});

// ============================================================================
// Start
// ============================================================================

client.login(TOKEN).catch((err) => {
  console.error('Failed to login:', err);
  process.exit(1);
});
