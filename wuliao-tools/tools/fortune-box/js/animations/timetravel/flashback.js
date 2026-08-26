/**
 * 穿越类动画：时光倒流
 * 画面逐渐变灰、倒放，最终显示"回到过去"
 */
import { Animation } from '../../domain/Animation.js';

export class FlashbackAnimation extends Animation {
  constructor() {
    super({
      id: 'timetravel_flashback',
      name: '穿越类-时光倒流',
      type: 'timetravel',
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
      background: #f5f5f5;
      position: relative;
      overflow: hidden;
      transition: filter 1s ease;
    `;

    // 主画面
    const scene = document.createElement('div');
    scene.style.cssText = `
      width: 90%;
      max-width: 300px;
      aspect-ratio: 4/3;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      transition: all 0.8s ease;
      position: relative;
      overflow: hidden;
    `;
    container.appendChild(scene);

    // 场景图标
    const icon = document.createElement('div');
    icon.style.cssText = `
      font-size: 4rem;
      margin-bottom: 1rem;
    `;
    icon.textContent = '⏰';
    scene.appendChild(icon);

    // 场景文字
    const sceneText = document.createElement('div');
    sceneText.style.cssText = `
      font-family: var(--font-display, sans-serif);
      font-size: 1.2rem;
      color: white;
      font-weight: 600;
    `;
    sceneText.textContent = '现在';
    scene.appendChild(sceneText);

    // 年份显示
    const yearDisplay = document.createElement('div');
    yearDisplay.style.cssText = `
      font-family: var(--font-display, monospace);
      font-size: 3rem;
      font-weight: 700;
      color: var(--color-primary, #333);
      margin-top: 2rem;
      letter-spacing: 4px;
    `;
    yearDisplay.textContent = '2026';
    container.appendChild(yearDisplay);

    // 提示文字
    const hint = document.createElement('div');
    hint.style.cssText = `
      position: absolute;
      bottom: 2rem;
      font-size: 0.9rem;
      color: #888;
    `;
    hint.textContent = '正在穿越时空...';
    container.appendChild(hint);

    // 噪点覆盖层
    const noise = document.createElement('div');
    noise.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      opacity: 0;
      pointer-events: none;
      mix-blend-mode: overlay;
    `;
    container.appendChild(noise);

    this.addStyles();

    // 动画序列
    await this.delay(1000);

    // 开始倒流
    const years = ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];
    const scenes = [
      { icon: '📱', text: '智能时代', color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
      { icon: '🎬', text: '短视频元年', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
      { icon: '🚀', text: '科技飞跃', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
      { icon: '☕', text: '慢生活', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
      { icon: '📦', text: '网购时代', color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
      { icon: '🎮', text: '游戏主机', color: 'linear-gradient(135deg, #0fd850 0%, #f9f047 100%)' },
      { icon: '🌈', text: '多彩世界', color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
      { icon: '✨', text: '新纪元', color: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
    ];

    for (let i = 0; i < years.length; i++) {
      yearDisplay.textContent = years[i];

      // 场景渐变
      const sceneData = scenes[i];
      scene.style.background = sceneData.color;
      icon.textContent = sceneData.icon;
      sceneText.textContent = sceneData.text;

      // 闪烁效果
      noise.style.opacity = '0.3';
      await this.delay(100);
      noise.style.opacity = '0';
      await this.delay(400);

      // 灰度加深
      const grayValue = Math.floor((i / years.length) * 60);
      container.style.filter = `grayscale(${grayValue}%)`;
    }

    await this.delay(500);

    // 回到彩色
    scene.style.background = 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)';
    icon.textContent = '🕰️';
    icon.style.fontSize = '3rem';
    sceneText.textContent = '时光深处';
    sceneText.style.color = '#333';
    yearDisplay.textContent = '那年';
    yearDisplay.style.color = '#999';
    hint.textContent = '你输入的那一刻，时间仿佛倒流了';

    container.style.filter = 'none';

    await this.delay(2500);
    if (onComplete) onComplete();
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  addStyles() {
    if (document.getElementById('flashback-styles')) return;
    const style = document.createElement('style');
    style.id = 'flashback-styles';
    style.textContent = `
      .flashback-flicker {
        animation: flashbackFlicker 0.1s linear infinite;
      }
      @keyframes flashbackFlicker {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
    `;
    document.head.appendChild(style);
  }
}
