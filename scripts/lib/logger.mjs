// scripts/lib/logger.mjs
// シンプルなログユーティリティ（秘密情報除外）

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const CURRENT_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL?.toLowerCase()] ?? LOG_LEVELS.info;

/**
 * 秘密情報をマスク
 */
function maskSecrets(str) {
  if (typeof str !== 'string') return str;
  // API Keys, Tokens
  return str
    .replace(/([A-Za-z0-9_-]{20,})/g, (m) => {
      if (m.length > 30) return m.slice(0, 8) + '...' + m.slice(-4);
      return m;
    })
    .replace(/(Bearer\s+)[^\s]+/gi, '$1[MASKED]')
    .replace(/(api[_-]?key[=:\s]+)[^\s&"']+/gi, '$1[MASKED]')
    .replace(/(token[=:\s]+)[^\s&"']+/gi, '$1[MASKED]');
}

function formatArgs(args) {
  return args.map(arg => {
    if (typeof arg === 'string') return maskSecrets(arg);
    if (arg instanceof Error) return maskSecrets(arg.stack || arg.message);
    try { return maskSecrets(JSON.stringify(arg)); } catch { return String(arg); }
  }).join(' ');
}

function timestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

export const logger = {
  debug: (...args) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.debug) {
      console.debug(`[${timestamp()}] DEBUG:`, formatArgs(args));
    }
  },
  info: (...args) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.info) {
      console.log(`[${timestamp()}] INFO:`, formatArgs(args));
    }
  },
  warn: (...args) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.warn) {
      console.warn(`[${timestamp()}] WARN:`, formatArgs(args));
    }
  },
  error: (...args) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.error) {
      console.error(`[${timestamp()}] ERROR:`, formatArgs(args));
    }
  }
};

export default logger;
