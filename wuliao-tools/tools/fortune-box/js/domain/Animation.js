/**
 * Animation 实体 - 动画模块标准接口
 * 所有动画模块必须实现此接口
 */

/**
 * @typedef {Object} AnimationType
 * @property {string} id - 唯一标识，如 'prediction_001'
 * @property {string} name - 显示名称，如 '预知类-喷嚏预言'
 * @property {'prediction'|'timetravel'|'prank'|'mystic'|'badluck'} type - 类型
 * @property {number} rarity - 稀有度 1-10，越小越稀有
 */

/**
 * @typedef {Object} FortuneContext
 * @property {import('./Fortune.js').Fortune} fortune - 命运实体
 * @property {HTMLElement} container - 动画容器
 * @property {Function} onComplete - 动画完成回调
 */

export class Animation {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.rarity = config.rarity || 5;
  }

  /**
   * 渲染动画
   * @param {FortuneContext} ctx
   * @returns {Promise<void>}
   */
  async render(ctx) {
    throw new Error('Animation.render() must be implemented');
  }

  /**
   * 获取配置参数
   * @returns {Object}
   */
  getConfig() {
    return {};
  }

  /**
   * 创建默认上下文
   * @param {HTMLElement} container
   * @returns {FortuneContext}
   */
  createContext(container) {
    return {
      container,
      fortune: null,
      onComplete: null
    };
  }
}
