/**
 * 整蛊类动画：倒计时反转
 * 显示倒计时到0，然后...回到10再倒计一次，再反转
 */
import { Animation } from '../../domain/Animation.js';

export class CountdownTrickAnimation extends Animation {
  constructor() {
    super({
      id: 'prank_countdown_trick',
      name: '整蛊类-倒计时反转',
      type: 'prank',
      rarity: 3
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
      background: var(--color-bg, #0a0a0f);
      position: relative;
      overflow: hidden;
    `;

    // 标题
    const title = document.createElement('div');
    title.style.cssText = `
      font-family: var(--font-display, sans-serif);
      font-size: 1rem;
      color: var(--color-text-dim, #666);
      margin-bottom: 2rem;
      text-transform: uppercase;
      letter-spacing: 4px;
    `;
    title.textContent = '命运倒计时';
    container.appendChild(title);

    // 数字显示
    const number = document.createElement('div');
    number.style.cssText = `
      font-family: var(--font-display, monospace);
      font-size: 10rem;
      font-weight: 700;
      color: var(--color-primary, #d4af37);
      text-shadow: 0 0 60px var(--color-primary-glow, rgba(212,175,55,0.5));
      line-height: 1;
    `;
    number.textContent = '10';
    container.appendChild(number);

    // 提示
    const hint = document.createElement('div');
    hint.style.cssText = `
      font-family: var(--font-body, sans-serif);
      font-size: 0.9rem;
      color: var(--color-text-dim, #666);
      margin-top: 2rem;
    `;
    hint.textContent = '准备迎接你的命运...';
    container.appendChild(hint);

    // 光环效果
    const halo = document.createElement('div');
    halo.style.cssText = `
      position: absolute;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--color-primary-glow, rgba(212,175,55,0.2)) 0%, transparent 70%);
      animation: haloPulse 2s ease infinite;
    `;
    container.appendChild(halo);

    this.addStyles();

    // 第一次倒计时
    for (let i = 10; i >= 0; i--) {
      number.textContent = i;
      number.style.transform = 'scale(1.2)';
      number.style.opacity = '0.8';
      await this.delay(300);
      number.style.transform = 'scale(1)';
      number.style.opacity = '1';
      await this.delay(700);
    }

    // 第一次到0 - 惊喜！
    await this.delay(500);
    number.textContent = '0';
    number.style.color = '#ff4444';
    hint.textContent = '时间到了！';
    await this.delay(1000);

    // 反转！回到10
    number.style.transition = 'all 0.3s ease';
    hint.textContent = '等等...好像不对？';

    for (let i = 10; i >= 0; i--) {
      number.textContent = i;
      number.style.transform = `rotate(${(10-i) * 10}deg)`;
      await this.delay(150);
    }

    await this.delay(500);
    hint.textContent = '再等一下...';

    // 又反转！
    number.style.color = '#4ade80';
    hint.textContent = '好吧，这次是真的！';

    for (let i = 0; i <= 5; i++) {
      number.textContent = 5 - i;
      number.style.transform = 'scale(1.3)';
      await this.delay(200);
      number.style.transform = 'scale(1)';
      await this.delay(300);
    }

    await this.delay(500);

    // 最终结果
    number.style.fontSize = '3rem';
    number.textContent = '🎁';
    hint.textContent = '你的命运已经注定：今天适合躺平！';
    hint.style.color = '#4ade80';

    halo.style.display = 'none';

    await this.delay(2500);
    if (onComplete) onComplete();
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  addStyles() {
    if (document.getElementById('countdown-trick-styles')) return;
    const style = document.createElement('style');
    style.id = 'countdown-trick-styles';
    style.textContent = `
      @keyframes haloPulse {
        0%, 100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.2); opacity: 0.8; }
      }
    `;
    document.head.appendChild(style);
  }
}
