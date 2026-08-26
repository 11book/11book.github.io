/**
 * 预知类动画：喷嚏预言
 * "你将在 X 秒后打喷嚏" → 屏幕抖动模拟打喷嚏
 */
import { Animation } from '../../domain/Animation.js';

export class SneezeAnimation extends Animation {
  constructor() {
    super({
      id: 'prediction_sneeze',
      name: '预知类-喷嚏预言',
      type: 'prediction',
      rarity: 3  // 较稀有
    });
    this.defaultCountdown = 3;
  }

  /**
   * @param {import('../../domain/Animation.js').FortuneContext} ctx
   */
  async render(ctx) {
    const { container, fortune, onComplete } = ctx;
    const countdown = fortune?.generated?.params?.countdown || this.defaultCountdown;
    const theme = fortune?.style || 'dark-mysterious';

    container.innerHTML = '';
    container.style.cssText = `
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: var(--color-bg, #0a0a0f);
      position: relative;
      overflow: hidden;
    `;

    // 预言文字
    const prophecy = document.createElement('div');
    prophecy.style.cssText = `
      font-family: var(--font-display, serif);
      font-size: 1.5rem;
      color: var(--color-text, #c9b896);
      text-align: center;
      margin-bottom: 2rem;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.5s ease;
    `;
    prophecy.textContent = `你将在 ${countdown} 秒后打喷嚏`;
    container.appendChild(prophecy);

    // 倒计时显示
    const countdownEl = document.createElement('div');
    countdownEl.style.cssText = `
      font-family: var(--font-display, serif);
      font-size: 4rem;
      font-weight: 700;
      color: var(--color-primary, #d4af37);
      text-shadow: 0 0 30px var(--color-primary-glow, rgba(212,175,55,0.3));
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    countdownEl.textContent = countdown;
    container.appendChild(countdownEl);

    // 喷嚏文字（稍后显示）
    const sneezeText = document.createElement('div');
    sneezeText.style.cssText = `
      font-family: var(--font-display, serif);
      font-size: 2.5rem;
      color: var(--color-accent, #c41e3a);
      opacity: 0;
      transform: scale(0.5);
      transition: all 0.3s ease;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.5);
    `;
    sneezeText.textContent = '🤧 阿嚏！';
    container.appendChild(sneezeText);

    // 动画序列
    await this.delay(500);

    // 显示预言
    prophecy.style.opacity = '1';
    prophecy.style.transform = 'translateY(0)';
    await this.delay(1000);

    // 显示倒计时
    countdownEl.style.opacity = '1';
    await this.delay(500);

    // 倒计时
    for (let i = countdown - 1; i >= 1; i--) {
      countdownEl.textContent = i;
      countdownEl.style.transform = 'scale(1.2)';
      await this.delay(200);
      countdownEl.style.transform = 'scale(1)';
      await this.delay(800);
    }

    countdownEl.textContent = '🤧';

    // 触发喷嚏效果
    await this.delay(300);
    sneezeText.style.opacity = '1';
    sneezeText.style.transform = 'translate(-50%, -50%) scale(1.5)';

    // 屏幕抖动
    container.style.animation = 'sneezeShake 0.5s ease';
    this.addShakeKeyframes();

    await this.delay(1500);

    if (onComplete) onComplete();
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  addShakeKeyframes() {
    if (document.getElementById('sneeze-shake')) return;
    const style = document.createElement('style');
    style.id = 'sneeze-shake';
    style.textContent = `
      @keyframes sneezeShake {
        0%, 100% { transform: translateX(0); }
        10% { transform: translateX(-15px) rotate(-2deg); }
        20% { transform: translateX(15px) rotate(2deg); }
        30% { transform: translateX(-12px) rotate(-1deg); }
        40% { transform: translateX(12px) rotate(1deg); }
        50% { transform: translateX(-8px); }
        60% { transform: translateX(8px); }
        70% { transform: translateX(-5px); }
        80% { transform: translateX(5px); }
        90% { transform: translateX(-2px); }
      }
    `;
    document.head.appendChild(style);
  }
}
