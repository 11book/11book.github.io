/**
 * 玄学类动画：铜钱摇卦
 * 三枚铜钱摇晃，最终显示卦象
 */
import { Animation } from '../../domain/Animation.js';

export class CoinDivineAnimation extends Animation {
  constructor() {
    super({
      id: 'mystic_coin_divine',
      name: '玄学类-铜钱摇卦',
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
      background: linear-gradient(180deg, #1a0a0a 0%, #2d1810 100%);
      position: relative;
      overflow: hidden;
    `;

    // 八卦背景
    const bagua = document.createElement('div');
    bagua.innerHTML = '☯️';
    bagua.style.cssText = `
      position: absolute;
      font-size: 15rem;
      opacity: 0.05;
      color: #ffd700;
    `;
    container.appendChild(bagua);

    // 标题
    const title = document.createElement('div');
    title.style.cssText = `
      font-family: var(--font-display, serif);
      font-size: 1.2rem;
      color: #ffd700;
      margin-bottom: 2rem;
      letter-spacing: 8px;
    `;
    title.textContent = '金钱卦';
    container.appendChild(title);

    // 铜钱容器
    const coinsContainer = document.createElement('div');
    coinsContainer.style.cssText = `
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
    `;
    container.appendChild(coinsContainer);

    // 三枚铜钱
    const coins = [];
    for (let i = 0; i < 3; i++) {
      const coin = document.createElement('div');
      coin.style.cssText = `
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ffd700 0%, #b8860b 50%, #ffd700 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        color: #8b4513;
        font-weight: 700;
        box-shadow: 
          0 4px 15px rgba(255, 215, 0, 0.3),
          inset 0 2px 4px rgba(255, 255, 255, 0.3),
          inset 0 -2px 4px rgba(0, 0, 0, 0.2);
        position: relative;
        transition: transform 0.1s ease;
      `;
      coin.innerHTML = '¥';
      coinsContainer.appendChild(coin);
      coins.push(coin);
    }

    // 方孔
    coins.forEach(coin => {
      const hole = document.createElement('div');
      hole.style.cssText = `
        position: absolute;
        width: 24px;
        height: 24px;
        background: #2d1810;
        border-radius: 2px;
        transform: rotate(45deg);
      `;
      coin.appendChild(hole);
    });

    // 结果文字
    const result = document.createElement('div');
    result.style.cssText = `
      font-family: var(--font-display, serif);
      font-size: 1.5rem;
      color: #ffd700;
      text-align: center;
      opacity: 0;
      margin-bottom: 1rem;
    `;
    container.appendChild(result);

    // 卦象
    const hexagram = document.createElement('div');
    hexagram.style.cssText = `
      font-family: var(--font-display, serif);
      font-size: 3rem;
      color: #ffd700;
      letter-spacing: 0.5rem;
      opacity: 0;
      text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
    `;
    container.appendChild(hexagram);

    // 解读
    const interpretation = document.createElement('div');
    interpretation.style.cssText = `
      font-family: var(--font-body, sans-serif);
      font-size: 0.9rem;
      color: rgba(255, 215, 0, 0.7);
      text-align: center;
      max-width: 280px;
      line-height: 1.8;
      margin-top: 1.5rem;
      opacity: 0;
    `;
    container.appendChild(interpretation);

    this.addStyles();

    // 摇晃动画
    await this.delay(500);

    for (let shake = 0; shake < 3; shake++) {
      // 抛起
      coins.forEach(coin => {
        coin.style.transition = 'transform 0.3s ease';
        coin.style.transform = 'translateY(-100px) rotate(720deg)';
      });
      await this.delay(400);

      // 落下
      coins.forEach(coin => {
        coin.style.transform = 'translateY(0) rotate(0deg)';
      });
      await this.delay(300);

      // 停止时的旋转
      const randomRotations = [360, 540, 720];
      coins.forEach((coin, i) => {
        coin.style.transition = 'transform 0.5s ease-out';
        coin.style.transform = `rotate(${randomRotations[i]}deg)`;
      });
      await this.delay(600);
    }

    // 显示结果
    await this.delay(500);

    // 随机生成卦象
    const results = ['阳', '阴'];
    const hexagrams = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'];
    const guaNames = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];
    const interpretations = [
      '天行健，君子以自强不息。今日诸事大吉。',
      '兑上线下，今日适合与人交流，会有意外收获。',
      '离火明亮，今日心情愉悦，适合做创造性的事。',
      '震雷惊百虫，今日会有让你惊讶的事情发生。',
      '巽为风，今日适合灵活应变，顺势而为。',
      '坎为水，今日财运流动，可能有小钱钱入账。',
      '艮为山，今日宜静不宜动，适合思考规划。',
      '坤为地，今日诸事平稳，踏实前行可获好运。'
    ];

    const randIndex = () => Math.floor(Math.random() * 2);
    const guaIndex = Math.floor(Math.random() * 8);

    result.textContent = results[randIndex()] + results[randIndex()] + results[randIndex()];
    result.style.opacity = '1';
    result.style.animation = 'resultGlow 1s ease infinite';

    await this.delay(1000);

    hexagram.textContent = guaNames[guaIndex];
    hexagram.style.opacity = '1';
    hexagram.style.animation = 'hexagramReveal 0.5s ease';

    await this.delay(800);

    interpretation.textContent = interpretations[guaIndex];
    interpretation.style.opacity = '1';

    await this.delay(3000);
    if (onComplete) onComplete();
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  addStyles() {
    if (document.getElementById('coin-divine-styles')) return;
    const style = document.createElement('style');
    style.id = 'coin-divine-styles';
    style.textContent = `
      @keyframes resultGlow {
        0%, 100% { text-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
        50% { text-shadow: 0 0 40px rgba(255, 215, 0, 0.8); }
      }
      @keyframes hexagramReveal {
        from { transform: scale(0) rotate(-180deg); opacity: 0; }
        to { transform: scale(1) rotate(0deg); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
}
