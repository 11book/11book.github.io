/**
 * 预知类动画：地震预警（假）
 * 显示"检测到地震" → 屏幕剧烈晃动 → "开玩笑的"
 */
import { Animation } from '../../domain/Animation.js';

export class EarthquakeAnimation extends Animation {
  constructor() {
    super({
      id: 'prediction_earthquake',
      name: '预知类-地震预警',
      type: 'prediction',
      rarity: 4
    });
  }

  async render(ctx) {
    const { container, fortune, onComplete } = ctx;

    container.innerHTML = '';
    container.style.cssText = `
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a0a0a 0%, #2a1515 100%);
      position: relative;
      overflow: hidden;
    `;

    // 警告图标
    const warning = document.createElement('div');
    warning.innerHTML = '⚠️';
    warning.style.cssText = `
      font-size: 5rem;
      margin-bottom: 1.5rem;
      animation: warningPulse 0.5s ease infinite;
    `;
    container.appendChild(warning);

    // 警告文字
    const alertText = document.createElement('div');
    alertText.style.cssText = `
      font-family: var(--font-display, sans-serif);
      font-size: 1.8rem;
      font-weight: 700;
      color: #ff4444;
      text-align: center;
      text-shadow: 0 0 20px rgba(255, 68, 68, 0.5);
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    alertText.textContent = '⚡ 地震预警 ⚡';
    container.appendChild(alertText);

    // 副标题
    const subtitle = document.createElement('div');
    subtitle.style.cssText = `
      font-family: var(--font-body, sans-serif);
      font-size: 1rem;
      color: #ff8888;
      margin-top: 0.5rem;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    subtitle.textContent = '正在定位震源...';
    container.appendChild(subtitle);

    // 倒计时
    const countdown = document.createElement('div');
    countdown.style.cssText = `
      font-family: var(--font-display, monospace);
      font-size: 3rem;
      color: #ff6666;
      margin-top: 1.5rem;
      opacity: 0;
    `;
    countdown.textContent = '5';
    container.appendChild(countdown);

    // 结果文字
    const result = document.createElement('div');
    result.style.cssText = `
      font-family: var(--font-display, sans-serif);
      font-size: 1.5rem;
      color: #4ade80;
      margin-top: 2rem;
      opacity: 0;
      transform: translateY(20px);
    `;
    result.textContent = '😂 开玩笑的啦！';
    container.appendChild(result);

    this.addStyles();

    // 动画序列
    await this.delay(800);
    alertText.style.opacity = '1';
    subtitle.style.opacity = '1';
    countdown.style.opacity = '1';
    countdown.style.animation = 'countdownShake 1s ease infinite';

    await this.delay(1000);
    countdown.textContent = '4';
    await this.delay(1000);
    countdown.textContent = '3';
    await this.delay(1000);
    countdown.textContent = '2';

    // 地震效果
    await this.delay(500);
    container.style.animation = 'earthquakeShake 0.8s ease';
    countdown.textContent = '1';
    countdown.style.color = '#ff0000';
    countdown.style.fontSize = '4rem';

    await this.delay(800);

    // 停止地震，显示结果
    container.style.animation = 'none';
    countdown.style.opacity = '0';
    subtitle.textContent = '......';
    await this.delay(500);
    subtitle.textContent = '其实没事';
    subtitle.style.color = '#4ade80';

    await this.delay(800);
    result.style.opacity = '1';
    result.style.transform = 'translateY(0)';

    await this.delay(1500);
    if (onComplete) onComplete();
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  addStyles() {
    if (document.getElementById('earthquake-styles')) return;
    const style = document.createElement('style');
    style.id = 'earthquake-styles';
    style.textContent = `
      @keyframes warningPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      @keyframes countdownShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-3px); }
        75% { transform: translateX(3px); }
      }
      @keyframes earthquakeShake {
        0%, 100% { transform: translate(0, 0); }
        10% { transform: translate(-15px, -10px); }
        20% { transform: translate(15px, 10px); }
        30% { transform: translate(-12px, 8px); }
        40% { transform: translate(12px, -8px); }
        50% { transform: translate(-8px, 5px); }
        60% { transform: translate(8px, -5px); }
        70% { transform: translate(-5px, 3px); }
        80% { transform: translate(5px, -3px); }
        90% { transform: translate(-2px, 1px); }
      }
    `;
    document.head.appendChild(style);
  }
}
