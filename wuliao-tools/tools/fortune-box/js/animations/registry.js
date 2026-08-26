/**
 * 动画注册表
 * 管理所有动画模块，支持按类型/稀有度随机抽取
 */
import { Animation } from '../domain/Animation.js';

// 预知类动画
import { SneezeAnimation } from './prediction/sneeze.js';
import { EarthquakeAnimation } from './prediction/earthquake.js';

// 穿越类动画
import { MomCallAnimation } from './timetravel/mom_call.js';
import { FlashbackAnimation } from './timetravel/flashback.js';

// 整蛊类动画
import { FakeBSODAnimation } from './prank/fake_bsod.js';
import { CountdownTrickAnimation } from './prank/countdown_trick.js';

// 玄学类动画
import { CoinDivineAnimation } from './mystic/coin_divine.js';
import { ScrollUnfoldAnimation } from './mystic/scroll_unfold.js';

// 坏签类动画
import { TodayNotGoodAnimation } from './badluck/today_not_good.js';

export class AnimationRegistry {
  constructor() {
    /** @type {Map<string, Animation>} */
    this.modules = new Map();

    // 注册所有动画
    this.register(new SneezeAnimation());
    this.register(new EarthquakeAnimation());
    this.register(new MomCallAnimation());
    this.register(new FlashbackAnimation());
    this.register(new FakeBSODAnimation());
    this.register(new CountdownTrickAnimation());
    this.register(new CoinDivineAnimation());
    this.register(new ScrollUnfoldAnimation());
    this.register(new TodayNotGoodAnimation());
  }

  /**
   * 注册动画模块
   * @param {Animation} module
   */
  register(module) {
    if (!(module instanceof Animation)) {
      throw new Error('Module must be an instance of Animation');
    }
    this.modules.set(module.id, module);
    console.log(`[Registry] Registered: ${module.id} (${module.type})`);
  }

  /**
   * 获取动画
   * @param {string} id
   * @returns {Animation|undefined}
   */
  get(id) {
    return this.modules.get(id);
  }

  /**
   * 获取所有动画
   * @returns {Animation[]}
   */
  getAll() {
    return Array.from(this.modules.values());
  }

  /**
   * 按类型获取动画
   * @param {string} type
   * @returns {Animation[]}
   */
  byType(type) {
    return this.getAll().filter(m => m.type === type);
  }

  /**
   * 按稀有度获取（范围）
   * @param {number} min - 最小稀有度
   * @param {number} max - 最大稀有度
   * @returns {Animation[]}
   */
  byRarityRange(min, max) {
    return this.getAll().filter(m => m.rarity >= min && m.rarity <= max);
  }

  /**
   * 完全随机抽取一个
   * @returns {Animation}
   */
  random() {
    const all = this.getAll();
    return all[Math.floor(Math.random() * all.length)];
  }

  /**
   * 根据类型随机抽取
   * @param {string} type
   * @returns {Animation}
   */
  randomByType(type) {
    const matches = this.byType(type);
    if (matches.length === 0) return this.random();
    return matches[Math.floor(Math.random() * matches.length)];
  }

  /**
   * 根据稀有度加权随机抽取
   * 稀有度越低（数字越小）越容易抽到
   * @returns {Animation}
   */
  weightedRandom() {
    const all = this.getAll();

    // 稀有度权重：1-10 对应权重 10-1（稀有度数字越小，权重越大）
    const weights = all.map(m => 11 - m.rarity);
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    let random = Math.random() * totalWeight;
    for (let i = 0; i < all.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return all[i];
      }
    }
    return all[all.length - 1];
  }

  /**
   * 根据Fortune生成的type字段路由到对应动画
   * @param {string} type - 'prediction'|'timetravel'|'prank'|'mystic'|'badluck'
   * @returns {Animation}
   */
  routeByType(type) {
    const mapped = this.randomByType(type);
    console.log(`[Registry] Routed: ${type} → ${mapped.id}`);
    return mapped;
  }
}

// 导出单例
export const animationRegistry = new AnimationRegistry();
