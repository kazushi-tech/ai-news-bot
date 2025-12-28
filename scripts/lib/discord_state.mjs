// scripts/lib/discord_state.mjs
// Discord Approval用の状態管理（discord_map.json, decisions.json）

import fs from 'node:fs/promises';
import path from 'node:path';
import { STATE_DIR } from './paths.mjs';

const DISCORD_MAP_FILE = path.join(STATE_DIR, 'discord_map.json');
const DECISIONS_FILE = path.join(STATE_DIR, 'decisions.json');

/**
 * Discord Mapを読み込み
 */
export async function loadDiscordMap() {
  try {
    const content = await fs.readFile(DISCORD_MAP_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return {};
    }
    throw err;
  }
}

/**
 * Discord Mapを保存
 */
export async function saveDiscordMap(map) {
  await fs.mkdir(STATE_DIR, { recursive: true });
  await fs.writeFile(DISCORD_MAP_FILE, JSON.stringify(map, null, 2), 'utf8');
}

/**
 * メッセージIDから候補情報を取得
 */
export async function getCandidateByMessageId(messageId) {
  const map = await loadDiscordMap();
  return map[messageId] || null;
}

/**
 * メッセージIDと候補情報をマッピング
 */
export async function mapMessageToCandidate(messageId, candidateData) {
  const map = await loadDiscordMap();
  map[messageId] = {
    ...candidateData,
    postedAt: new Date().toISOString()
  };
  await saveDiscordMap(map);
}

/**
 * Decisionsを読み込み
 */
export async function loadDecisions() {
  try {
    const content = await fs.readFile(DECISIONS_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return {};
    }
    throw err;
  }
}

/**
 * Decisionsを保存
 */
export async function saveDecisions(decisions) {
  await fs.mkdir(STATE_DIR, { recursive: true });
  await fs.writeFile(DECISIONS_FILE, JSON.stringify(decisions, null, 2), 'utf8');
}

/**
 * 決定を記録
 */
export async function recordDecision(url, decision, userId) {
  const decisions = await loadDecisions();
  decisions[url] = {
    decision, // 'approved' or 'rejected'
    decidedBy: userId,
    decidedAt: new Date().toISOString()
  };
  await saveDecisions(decisions);
}

/**
 * URLの決定履歴を確認
 */
export async function getDecision(url) {
  const decisions = await loadDecisions();
  return decisions[url] || null;
}
