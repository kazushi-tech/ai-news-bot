import fs from 'node:fs/promises';
import path from 'node:path';

export class GeminiUsageManager {
  constructor(stateDir) {
    this.stateDir = stateDir;
    this.stateFile = path.join(stateDir, 'usage_gemini.json');
    this.budget = parseInt(process.env.GEMINI_RPD_BUDGET || '15', 10);
  }

  async _loadState() {
    try {
      const data = await fs.readFile(this.stateFile, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return {};
      }
      throw err;
    }
  }

  async _saveState(state) {
    await fs.mkdir(this.stateDir, { recursive: true });
    await fs.writeFile(this.stateFile, JSON.stringify(state, null, 2), 'utf8');
  }

  _getTodayKey() {
    // UTC YYYY-MM-DD
    return new Date().toISOString().slice(0, 10);
  }

  async checkBudget() {
    const state = await this._loadState();
    const today = this._getTodayKey();
    const dayState = state[today] || { count: 0, limitReached: false };

    if (dayState.limitReached) {
      return { allowed: false, reason: 'limit_reached' };
    }

    if (this.budget > 0 && dayState.count >= this.budget) {
      return { allowed: false, reason: 'budget_exceeded' };
    }

    return { allowed: true };
  }

  async increment() {
    const state = await this._loadState();
    const today = this._getTodayKey();
    
    if (!state[today]) {
      state[today] = { count: 0, limitReached: false };
    }
    
    state[today].count += 1;
    await this._saveState(state);
    return state[today].count;
  }

  async markLimitReached() {
    const state = await this._loadState();
    const today = this._getTodayKey();

    if (!state[today]) {
      state[today] = { count: 0, limitReached: false };
    }

    state[today].limitReached = true;
    await this._saveState(state);
    console.log(`[GeminiUsageManager] Marked limit reached for ${today}`);
  }
}
