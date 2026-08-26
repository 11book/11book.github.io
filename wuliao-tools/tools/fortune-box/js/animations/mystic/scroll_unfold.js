/**
 * 玄学类动画：签文展开
 * 模拟从竹签筒中摇出一支签，签文缓缓展开
 */
import { Animation } from '../../domain/Animation.js';

export class ScrollUnfoldAnimation extends Animation {
  constructor() {
    super({
      id: 'mystic_scroll_unfold',
      name: '玄学类-签文展开',
      type: 'mystic',
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
      background: linear-gradient(180deg, #f5f0e8 0%, #ebe5d9 100%);
      position: relative;
      overflow: hidden;
    `;

    // 背景纹理
    const texture = document.createElement('div');
    texture.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
      pointer-events: none;
    `;
    container.appendChild(texture);

    // 签筒
    const tube = document.createElement('div');
    tube.style.cssText = `
      width: 60px;
      height: 200px;
      background: linear-gradient(90deg, #8b4513 0%, #a0522d 50%, #8b4513 100%);
      border-radius: 30px / 10px;
      position: relative;
      box-shadow: 
        0 10px 30px rgba(0,0,0,0.3),
        inset 0 2px 4px rgba(255,255,255,0.1);
      margin-bottom: 2rem;
    `;
    container.appendChild(tube);

    // 签筒顶部
    const tubeTop = document.createElement('div');
    tubeTop.style.cssText = `
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 70px;
      height: 20px;
      background: linear-gradient(180deg, #cd853f 0%, #8b4513 100%);
      border-radius: 10px 10px 0 0;
    `;
    tube.appendChild(tubeTop);

    // 竹签（摇晃中）
    const sticks = document.createElement('div');
    sticks.style.cssText = `
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 2px;
    `;
    tube.appendChild(sticks);

    for (let i = 0; i < 5; i++) {
      const stick = document.createElement('div');
      stick.style.cssText = `
        width: 4px;
        height: ${60 + Math.random() * 40}px;
        background: linear-gradient(180deg, #deb887 0%, #d2b48c 100%);
        border-radius: 2px;
        transform-origin: bottom center;
        animation: stickShake 0.3s ease infinite;
        animation-delay: ${i * 0.05}s;
      `;
      sticks.appendChild(stick);
    }

    // 签纸（隐藏）
    const scroll = document.createElement('div');
    scroll.style.cssText = `
      width: 90%;
      max-width: 320px;
      background: linear-gradient(180deg, #fff9e6 0%, #f5e6c8 100%);
      border-radius: 8px;
      padding: 2rem 1.5rem;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      opacity: 0;
      transform: translateY(50px) scale(0.9);
      transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
    `;
    container.appendChild(scroll);

    // 签头装饰
    const scrollHeader = document.createElement('div');
    scrollHeader.style.cssText = `
      text-align: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px dashed #d4af37;
    `;
    scrollHeader.innerHTML = `
      <div style="font-size: 2rem;">🏮</div>
      <div style="font-family: var(--font-display, serif); font-size: 1.5rem; color: #8b4513; margin-top: 0.5rem;">
        第 ${Math.floor(Math.random() * 100 + 1)} 签
      </div>
    `;
    scroll.appendChild(scrollHeader);

    // 签文
    const fortunes = [
      { title: '上上签', content: '春雷滚滚震天响，\n财源广进福满堂。\n出门遇贵人相助，\n心想事成万事昌。' },
      { title: '中平签', content: '山高路远莫慌张，\n稳扎稳打是良方。\n耐心等待时机到，\n自有清风送凉爽。' },
      { title: '下签', content: '船到江心补漏迟，\n不如当初仔细时。\n莫怨天来莫怨地，\n只因自己太大意。' },
      { title: '上签', content: '宝剑锋从磨砺出，\n梅花香自苦寒来。\n今日付出皆有数，\n他日收获自然来。' },
    ];

    const fortuneData = fortunes[Math.floor(Math.random() * fortunes.length)];

    const scrollTitle = document.createElement('div');
    scrollTitle.style.cssText = `
      font-family: var(--font-display, serif);
      font-size: 1.2rem;
      color: ${fortuneData.title === '上上签' ? '#c41e3a' : fortuneData.title === '下签' ? '#666' : '#8b4513'};
      text-align: center;
      margin-bottom: 1rem;
    `;
    scrollTitle.textContent = fortuneData.title;
    scroll.appendChild(scrollTitle);

    const scrollContent = document.createElement('div');
    scrollContent.style.cssText = `
      font-family: var(--font-display, serif);
      font-size: 1.1rem;
      color: #3c3c3c;
      line-height: 2;
      text-align: center;
      white-space: pre-line;
    `;
    scrollContent.textContent = fortuneData.content;
    scroll.appendChild(scrollContent);

    // 解读
    const interpretation = document.createElement('div');
    interpretation.style.cssText = `
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #d4af37;
      font-family: var(--font-body, sans-serif);
      font-size: 0.85rem;
      color: #666;
      text-align: center;
    `;
    interpretation.textContent = '✨ 解签：今日宜静心，方可遇良机';
    scroll.appendChild(interpretation);

    this.addStyles();

    // 动画序列
    await this.delay(1500);

    // 摇晃更剧烈
    sticks.style.animation = 'stickShake 0.15s ease infinite';

    await this.delay(1000);

    // 签跳出
    const jumpingStick = document.createElement('div');
    jumpingStick.style.cssText = `
      position: absolute;
      top: -60px;
      left: 50%;
      transform: translateX(-50%) rotate(${-15 + Math.random() * 30}deg);
      width: 8px;
      height: 120px;
      background: linear-gradient(180deg, #deb887 0%, #d2b48c 100%);
      border-radius: 4px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    tube.appendChild(jumpingStick);

    // 竹签飞出的数字
    const stickNumber = document.createElement('div');
    stickNumber.style.cssText = `
      position: absolute;
      top: -90px;
      left: 50%;
      transform: translateX(-50%);
      font-family: var(--font-display, serif);
      font-size: 1.5rem;
      color: #8b4513;
      font-weight: 700;
    `;
    stickNumber.textContent = Math.floor(Math.random() * 100 + 1);
    tube.appendChild(stickNumber);

    await this.delay(800);

    // 隐藏签筒
    tube.style.opacity = '0';
    tube.style.transition = 'opacity 0.5s ease';

    await this.delay(500);

    // 显示签纸
    scroll.style.opacity = '1';
    scroll.style.transform = 'translateY(0) scale(1)';

    await this.delay(3000);
    if (onComplete) onComplete();
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  addStyles() {
    if (document.getElementById('scroll-unfold-styles')) return;
    const style = document.createElement('style');
    style.id = 'scroll-unfold-styles';
    style.textContent = `
      @keyframes stickShake {
        0%, 100% { transform: rotate(-3deg); }
        50% { transform: rotate(3deg); }
      }
    `;
    document.head.appendChild(style);
  }
}
