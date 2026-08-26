/**
 * 存储适配器
 * 负责本地存储操作
 */
import { Fortune } from '../domain/Fortune.js';

export class StorageAdapter {
  constructor() {
    this.storageKey = 'wuliao_fortune_history';
    this.settingsKey = 'wuliao_fortune_settings';
  }

  /**
   * 获取历史记录
   * @returns {Fortune[]}
   */
  getHistory() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];

      const parsed = JSON.parse(data);
      return parsed.map(item => Fortune.fromJSON(item));
    } catch (error) {
      console.error('[Storage] Failed to get history:', error);
      return [];
    }
  }

  /**
   * 保存一条记录
   * @param {Fortune} fortune
   */
  saveFortune(fortune) {
    try {
      const history = this.getHistory();
      history.unshift(fortune);  // 最新在前

      // 最多保存 100 条
      if (history.length > 100) {
        history.pop();
      }

      localStorage.setItem(this.storageKey, JSON.stringify(history.map(f => f.toJSON())));
      console.log('[Storage] Fortune saved:', fortune.id);
    } catch (error) {
      console.error('[Storage] Failed to save fortune:', error);
    }
  }

  /**
   * 获取单条记录
   * @param {string} id
   * @returns {Fortune|null}
   */
  getFortune(id) {
    const history = this.getHistory();
    return history.find(f => f.id === id) || null;
  }

  /**
   * 清空历史
   */
  clearHistory() {
    localStorage.removeItem(this.storageKey);
    console.log('[Storage] History cleared');
  }

  /**
   * 导出历史为 JSON
   * @returns {string}
   */
  exportHistory() {
    const history = this.getHistory();
    return JSON.stringify(history.map(f => f.toJSON()), null, 2);
  }

  /**
   * 导入历史
   * @param {string} jsonStr
   */
  importHistory(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      const fortunes = data.map(item => Fortune.fromJSON(item));
      localStorage.setItem(this.storageKey, JSON.stringify(fortunes.map(f => f.toJSON())));
      console.log('[Storage] History imported:', fortunes.length, 'items');
    } catch (error) {
      console.error('[Storage] Failed to import history:', error);
      throw error;
    }
  }

  /**
   * 获取设置
   * @returns {Object}
   */
  getSettings() {
    try {
      const data = localStorage.getItem(this.settingsKey);
      if (!data) return this.getDefaultSettings();
      return { ...this.getDefaultSettings(), ...JSON.parse(data) };
    } catch (error) {
      console.error('[Storage] Failed to get settings:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * 保存设置
   * @param {Object} settings
   */
  saveSettings(settings) {
    try {
      localStorage.setItem(this.settingsKey, JSON.stringify(settings));
      console.log('[Storage] Settings saved');
    } catch (error) {
      console.error('[Storage] Failed to save settings:', error);
    }
  }

  /**
   * 默认设置
   */
  getDefaultSettings() {
    return {
      theme: 'dark-mysterious',  // 氛围
      animationWeights: {        // 动画类型权重
        prediction: 20,
        timetravel: 20,
        prank: 25,
        mystic: 20,
        badluck: 15
      },
      soundEnabled: false,        // 音效
      apiKey: ''                  // API Key
    };
  }
}

// 导出单例
export const storageAdapter = new StorageAdapter();
