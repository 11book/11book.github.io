/**
 * 穿越类动画：你妈叫你吃饭
 * 模拟时光倒流回放用户输入时的场景
 */
import { Animation } from '../../domain/Animation.js';

export class MomCallAnimation extends Animation {
  constructor() {
    super({
      id: 'timetravel_mom_call',
      name: '穿越类-你妈叫你吃饭',
      type: 'timetravel',
      rarity: 2  // 很稀有
    });
  }

  async render(ctx) {
    const { container, fortune, onComplete } = ctx;
    const userInput = fortune?.input || '某句话';

    container.innerHTML = '';
    container.style.cssText = `
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
      position: relative;
      overflow: hidden;
    `;

    // 时间显示
    const timeDisplay = document.createElement('div');
    timeDisplay.style.cssText = `
      font-family: var(--font-display, monospace);
      font-size: 1rem;
      color: rgba(255,255,255,0.5);
      position: absolute;
      top: 1rem;
      left: 50%;
      transform: translateX(-50%);
    `;
    container.appendChild(timeDisplay);

    // 录像带效果
    const vhs = document.createElement('div');
    vhs.style.cssText = `
      width: 80%;
      max-width: 320px;
      background: #111;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    `;
    container.appendChild(vhs);

    // 录像带标签
    const label = document.createElement('div');
    label.style.cssText = `
      background: linear-gradient(135deg, #c41e3a, #8b1528);
      color: white;
      padding: 0.3rem 0.8rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 600;
      margin-bottom: 0.8rem;
      display: inline-block;
    `;
    label.textContent = '📼 时间回放';
    vhs.appendChild(label);

    // 回放内容框
    const playback = document.createElement('div');
    playback.style.cssText = `
      background: #222;
      border: 2px solid #333;
      border-radius: 8px;
      padding: 1rem;
      position: relative;
    `;
    vhs.appendChild(playback);

    // 回放文字
    const replayText = document.createElement('div');
    replayText.style.cssText = `
      font-family: var(--font-body, sans-serif);
      font-size: 0.9rem;
      color: #888;
      line-height: 1.6;
    `;
    playback.appendChild(replayText);

    // 时光倒流感
    const timeline = document.createElement('div');
    timeline.style.cssText = `
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 0.5rem;
      align-items: center;
    `;
    container.appendChild(timeline);

    for (let i = 0; i < 5; i++) {
      const dot = document.createElement('div');
      dot.style.cssText = `
        width: 8px;
        height: 8px;
        background: rgba(255,255,255,0.2);
        border-radius: 50%;
        transition: all 0.3s ease;
      `;
      dot.dataset.index = i;
      timeline.appendChild(dot);
    }

    this.addStyles();

    // 动画序列
    const now = new Date();
    timeDisplay.textContent = now.toLocaleTimeString('zh-CN');

    // 输入内容逐字显示
    await this.delay(500);
    vhs.style.opacity = '0';
    vhs.style.transform = 'scale(0.9)';
    vhs.style.transition = 'all 0.5s ease';
    await this.delay(100);
    vhs.style.opacity = '1';
    vhs.style.transform = 'scale(1)';

    // 模拟"正在回放"
    replayText.textContent = '正在回放...';
    await this.delay(1000);

    // 时光倒流效果
    for (let i = 0; i < 5; i++) {
      const dots = timeline.querySelectorAll('div');
      dots[i].style.background = '#c41e3a';
      dots[i].style.transform = 'scale(1.5)';
      await this.delay(400);
    }

    // 显示回放内容
    replayText.innerHTML = '';
    replayText.style.color = '#fff';
    const chars = userInput.split('');
    for (let char of chars) {
      replayText.textContent += char;
      await this.delay(50);
    }

    await this.delay(1000);

    // 插入妈妈的话
    const momCall = document.createElement('div');
    momCall.style.cssText = `
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px dashed #444;
      font-size: 1rem;
      color: #ffcc00;
      animation: momCallPulse 1s ease infinite;
    `;
    momCall.textContent = '👵 "吃饭了！"';
    playback.appendChild(momCall);

    await this.delay(2000);
    if (onComplete) onComplete();
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  addStyles() {
    if (document.getElementById('mom-call-styles')) return;
    const style = document.createElement('style');
    style.id = 'mom-call-styles';
    style.textContent = `
      @keyframes momCallPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
    `;
    document.head.appendChild(style);
  }
}
