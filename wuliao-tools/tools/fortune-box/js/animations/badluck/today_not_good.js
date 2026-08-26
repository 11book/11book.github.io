/**
 * 坏签类动画：今日不宜
 * 抽到"今日不宜"，播放一个倒霉动画，然后反转说"不宜的是坏事"
 */
import { Animation } from '../../domain/Animation.js';

export class TodayNotGoodAnimation extends Animation {
  constructor() {
    super({
      id: 'badluck_today_not_good',
      name: '坏签类-今日不宜',
      type: 'badluck',
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
      background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
      position: relative;
      overflow: hidden;
    `;

    // 乌云
    const clouds = document.createElement('div');
    clouds.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 150px;
      background: linear-gradient(180deg, #333 0%, transparent 100%);
    `;
    container.appendChild(clouds);

    // 乌云emoji
    const cloudEmoji = document.createElement('div');
    cloudEmoji.style.cssText = `
      position: absolute;
      top: 30px;
      font-size: 4rem;
      animation: cloudFloat 3s ease infinite;
    `;
    cloudEmoji.textContent = '☁️';
    clouds.appendChild(cloudEmoji);

    // 主要内容
    const content = document.createElement('div');
    content.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 1;
    `;
    container.appendChild(content);

    // 警告图标
    const warning = document.createElement('div');
    warning.innerHTML = '⚠️';
    warning.style.cssText = `
      font-size: 5rem;
      margin-bottom: 1rem;
      animation: warningBounce 1s ease infinite;
    `;
    content.appendChild(warning);

    // 主文字
    const mainText = document.createElement('div');
    mainText.style.cssText = `
      font-family: var(--font-display, sans-serif);
      font-size: 2rem;
      font-weight: 700;
      color: #ff6b6b;
      text-align: center;
      margin-bottom: 1rem;
      text-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
    `;
    mainText.textContent = '今日不宜';
    content.appendChild(mainText);

    // 副标题
    const subtitle = document.createElement('div');
    subtitle.style.cssText = `
      font-family: var(--font-body, sans-serif);
      font-size: 1rem;
      color: #888;
      margin-bottom: 2rem;
    `;
    subtitle.textContent = '诸事不宜，保守为上';
    content.appendChild(subtitle);

    // 倒霉事件列表
    const badEvents = document.createElement('div');
    badEvents.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      opacity: 0;
      transition: opacity 0.5s ease;
    `;
    content.appendChild(badEvents);

    const events = [
      { emoji: '💼', text: '出门踩到狗屎' },
      { emoji: '📱', text: '手机掉水里了' },
      { emoji: '💸', text: '丢了个钱包' },
      { emoji: '😴', text: '失眠一整夜' },
    ];

    events.forEach(event => {
      const item = document.createElement('div');
      item.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.8rem;
        font-size: 0.9rem;
        color: #999;
      `;
      item.innerHTML = `<span>${event.emoji}</span><span>${event.text}</span>`;
      badEvents.appendChild(item);
    });

    // 反转文字（隐藏）
    const twist = document.createElement('div');
    twist.style.cssText = `
      position: absolute;
      bottom: 80px;
      font-family: var(--font-display, sans-serif);
      font-size: 1.3rem;
      color: #4ade80;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.5s ease;
      text-align: center;
    `;
    twist.innerHTML = `
      <div style="margin-bottom: 0.5rem;">😂 其实...</div>
      <div style="font-size: 1.5rem; font-weight: 700;">不宜的是坏事！</div>
      <div style="font-size: 0.9rem; margin-top: 0.5rem; color: #888;">
        好运会自己找上门 🎉
      </div>
    `;
    container.appendChild(twist);

    // 闪电
    const lightning = document.createElement('div');
    lightning.style.cssText = `
      position: absolute;
      top: 20px;
      right: 30px;
      font-size: 3rem;
      opacity: 0;
    `;
    lightning.innerHTML = '⚡';
    container.appendChild(lightning);

    this.addStyles();

    // 动画序列
    await this.delay(800);

    // 显示警告
    mainText.style.animation = 'textShake 0.5s ease infinite';

    await this.delay(1000);

    // 闪电
    lightning.style.animation = 'lightningFlash 0.5s ease infinite';
    await this.delay(300);
    lightning.style.opacity = '1';

    await this.delay(500);

    // 显示倒霉事件
    badEvents.style.opacity = '1';

    // 逐个显示事件
    const items = badEvents.querySelectorAll('div');
    for (let i = 0; i < items.length; i++) {
      items[i].style.opacity = '0';
      items[i].style.transform = 'translateX(-20px)';
      items[i].style.transition = 'all 0.3s ease';

      await this.delay(300);
      items[i].style.opacity = '1';
      items[i].style.transform = 'translateX(0)';

      // 每个事件显示时抖动一下
      if (i < items.length - 1) {
        await this.delay(200);
      }
    }

    await this.delay(1500);

    // 乌云散去
    clouds.style.opacity = '0';
    lightning.style.display = 'none';

    await this.delay(500);

    // 显示反转
    mainText.textContent = '等等！';
    mainText.style.color = '#ffd700';
    subtitle.textContent = '让我重新解读一下...';

    await this.delay(1000);

    // 好运降临
    mainText.textContent = '今日大吉！';
    mainText.style.color = '#4ade80';
    subtitle.textContent = '好运正在派送中 🚀';

    // 隐藏倒霉事件
    badEvents.style.opacity = '0';

    await this.delay(500);

    // 显示反转文字
    twist.style.opacity = '1';
    twist.style.transform = 'translateY(0)';

    // 庆祝emoji
    const celebration = document.createElement('div');
    celebration.style.cssText = `
      position: absolute;
      top: 50px;
      font-size: 2rem;
      animation: celebrationBounce 1s ease infinite;
    `;
    celebration.innerHTML = '🎊 🎁 🎉';
    container.appendChild(celebration);

    await this.delay(2500);
    if (onComplete) onComplete();
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  addStyles() {
    if (document.getElementById('today-not-good-styles')) return;
    const style = document.createElement('style');
    style.id = 'today-not-good-styles';
    style.textContent = `
      @keyframes warningBounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      @keyframes textShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-2px); }
        75% { transform: translateX(2px); }
      }
      @keyframes cloudFloat {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(20px); }
      }
      @keyframes lightningFlash {
        0%, 100% { opacity: 0; }
        50% { opacity: 1; }
      }
      @keyframes celebrationBounce {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-10px) rotate(5deg); }
      }
    `;
    document.head.appendChild(style);
  }
}
