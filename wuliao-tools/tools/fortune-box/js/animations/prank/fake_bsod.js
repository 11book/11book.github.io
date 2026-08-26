/**
 * 整蛊类动画：假蓝屏
 * 模拟Windows蓝屏死机，然后显示"开玩笑的"
 */
export class FakeBSODAnimation {
  constructor() {
    this.id = 'prank_fake_bsod';
    this.name = '整蛊类-假蓝屏';
    this.type = 'prank';
    this.rarity = 5;
  }

  async render(ctx) {
    const { container, fortune, onComplete } = ctx;

    container.innerHTML = '';
    container.style.cssText = `
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      background: #0078d4; position: relative; overflow: hidden;
    `;

    const bsod = document.createElement('div');
    bsod.style.cssText = `
      width: 100%; height: 100%;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      background: linear-gradient(180deg, #0078d4 0%, #005a9e 100%);
      position: absolute; top: 0; left: 0;
    `;
    container.appendChild(bsod);

    const emoji = document.createElement('div');
    emoji.style.cssText = 'font-size: 5rem; margin-bottom: 2rem; filter: grayscale(100%);';
    emoji.textContent = '🙁';
    bsod.appendChild(emoji);

    const message = document.createElement('div');
    message.style.cssText = `
      font-family: "Segoe UI", "Microsoft YaHei", sans-serif;
      font-size: 1.2rem; color: white; text-align: center;
      max-width: 500px; line-height: 1.8;
    `;
    message.innerHTML = `
      <div style="font-size: 1.4rem; font-weight: 600; margin-bottom: 1rem;">
        噢，你的计算机遇到了问题
      </div>
      <div style="margin-bottom: 1.5rem;">
        我们只收集某些错误信息，然后我们可以为你重新启动。
      </div>
      <div style="font-size: 0.9rem; opacity: 0.8;">
        代码：CRITICAL_PROCESS_DIED
      </div>
    `;
    bsod.appendChild(message);

    const progress = document.createElement('div');
    progress.style.cssText = `
      position: absolute; bottom: 80px; left: 50%;
      transform: translateX(-50%); width: 300px; height: 4px;
      background: rgba(255,255,255,0.2); border-radius: 2px; overflow: hidden;
    `;
    bsod.appendChild(progress);

    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
      height: 100%; background: white; width: 0%; transition: width 0.1s linear;
    `;
    progress.appendChild(progressBar);

    const percent = document.createElement('div');
    percent.style.cssText = `
      position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
      font-family: "Segoe UI", sans-serif; font-size: 0.9rem;
      color: white; opacity: 0.8;
    `;
    percent.textContent = '0%';
    bsod.appendChild(percent);

    // 抖动效果
    container.style.animation = 'bsodShake 0.1s linear infinite';
    this.addStyles();

    for (let i = 0; i <= 100; i += 3) {
      progressBar.style.width = i + '%';
      percent.textContent = i + '%';
      await this.delay(60);
    }

    await this.delay(2000);

    // 切换到玩笑内容
    bsod.style.transition = 'opacity 0.3s ease';
    bsod.style.opacity = '0';
    await this.delay(300);

    container.style.animation = 'none';
    container.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';

    const punchline = document.createElement('div');
    punchline.style.cssText = `
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      width: 100%; height: 100%;
    `;
    punchline.innerHTML = `
      <div style="font-size: 4rem; margin-bottom: 1.5rem;">😂</div>
      <div style="font-family: var(--font-display, sans-serif); font-size: 1.8rem; color: #4ade80; font-weight: 700; margin-bottom: 1rem;">
        骗你的！
      </div>
      <div style="font-family: var(--font-body, sans-serif); font-size: 1rem; color: rgba(255,255,255,0.7); margin-bottom: 1.5rem;">
        你的电脑没事，这是个无厘头整蛊动画
      </div>
      <div style="font-family: var(--font-body, sans-serif); font-size: 1.2rem; color: #ffd700;">
        🎁 今日运势：你可能会捡到钱
      </div>
    `;
    container.appendChild(punchline);
    punchline.style.opacity = '0';
    await this.delay(100);
    punchline.style.transition = 'opacity 0.5s ease';
    punchline.style.opacity = '1';

    await this.delay(3000);
    if (onComplete) onComplete();
  }

  async delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  addStyles() {
    if (document.getElementById('bsod-styles')) return;
    const style = document.createElement('style');
    style.id = 'bsod-styles';
    style.textContent = `
      @keyframes bsodShake {
        0%, 100% { transform: translate(0, 0); }
        25% { transform: translate(-2px, 1px); }
        50% { transform: translate(2px, -1px); }
        75% { transform: translate(-1px, -1px); }
      }
    `;
    document.head.appendChild(style);
  }
}
