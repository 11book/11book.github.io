(() => {
  // js/domain/Fortune.js
  var Fortune = class _Fortune {
    constructor({
      id = crypto.randomUUID(),
      input,
      style = "dark-mysterious",
      generated = null,
      animationId = null,
      animationModule = null,
      createdAt = (/* @__PURE__ */ new Date()).toISOString()
    }) {
      this.id = id;
      this.input = input;
      this.style = style;
      this.generated = generated;
      this.animationId = animationId;
      this.animationModule = animationModule;
      this.createdAt = createdAt;
    }
    // 从存储恢复
    static fromJSON(json) {
      return new _Fortune(json);
    }
    // 序列化为JSON
    toJSON() {
      return {
        id: this.id,
        input: this.input,
        style: this.style,
        generated: this.generated,
        animationId: this.animationId,
        animationModule: this.animationModule,
        createdAt: this.createdAt
      };
    }
    // 获取类型标签
    getTypeLabel() {
      const labels = {
        prediction: "\u9884\u77E5\u7C7B",
        timetravel: "\u7A7F\u8D8A\u7C7B",
        prank: "\u6574\u86CA\u7C7B",
        mystic: "\u7384\u5B66\u7C7B",
        badluck: "\u574F\u7B7E\u7C7B"
      };
      return labels[this.generated?.type] || "\u672A\u77E5";
    }
    // 格式化时间
    getFormattedTime() {
      const date = new Date(this.createdAt);
      return date.toLocaleString("zh-CN", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
  };

  // js/domain/Animation.js
  var Animation = class {
    constructor(config) {
      this.id = config.id;
      this.name = config.name;
      this.type = config.type;
      this.rarity = config.rarity || 5;
    }
    /**
     * 渲染动画
     * @param {FortuneContext} ctx
     * @returns {Promise<void>}
     */
    async render(ctx) {
      throw new Error("Animation.render() must be implemented");
    }
    /**
     * 获取配置参数
     * @returns {Object}
     */
    getConfig() {
      return {};
    }
    /**
     * 创建默认上下文
     * @param {HTMLElement} container
     * @returns {FortuneContext}
     */
    createContext(container) {
      return {
        container,
        fortune: null,
        onComplete: null
      };
    }
  };

  // js/animations/prediction/sneeze.js
  var SneezeAnimation = class extends Animation {
    constructor() {
      super({
        id: "prediction_sneeze",
        name: "\u9884\u77E5\u7C7B-\u55B7\u568F\u9884\u8A00",
        type: "prediction",
        rarity: 3
        // 较稀有
      });
      this.defaultCountdown = 3;
    }
    /**
     * @param {import('../../domain/Animation.js').FortuneContext} ctx
     */
    async render(ctx) {
      const { container, fortune, onComplete } = ctx;
      const countdown = fortune?.generated?.params?.countdown || this.defaultCountdown;
      const theme = fortune?.style || "dark-mysterious";
      container.innerHTML = "";
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
      const prophecy = document.createElement("div");
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
      prophecy.textContent = `\u4F60\u5C06\u5728 ${countdown} \u79D2\u540E\u6253\u55B7\u568F`;
      container.appendChild(prophecy);
      const countdownEl = document.createElement("div");
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
      const sneezeText = document.createElement("div");
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
      sneezeText.textContent = "\u{1F927} \u963F\u568F\uFF01";
      container.appendChild(sneezeText);
      await this.delay(500);
      prophecy.style.opacity = "1";
      prophecy.style.transform = "translateY(0)";
      await this.delay(1e3);
      countdownEl.style.opacity = "1";
      await this.delay(500);
      for (let i = countdown - 1; i >= 1; i--) {
        countdownEl.textContent = i;
        countdownEl.style.transform = "scale(1.2)";
        await this.delay(200);
        countdownEl.style.transform = "scale(1)";
        await this.delay(800);
      }
      countdownEl.textContent = "\u{1F927}";
      await this.delay(300);
      sneezeText.style.opacity = "1";
      sneezeText.style.transform = "translate(-50%, -50%) scale(1.5)";
      container.style.animation = "sneezeShake 0.5s ease";
      this.addShakeKeyframes();
      await this.delay(1500);
      if (onComplete) onComplete();
    }
    async delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    addShakeKeyframes() {
      if (document.getElementById("sneeze-shake")) return;
      const style = document.createElement("style");
      style.id = "sneeze-shake";
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
  };

  // js/animations/prediction/earthquake.js
  var EarthquakeAnimation = class extends Animation {
    constructor() {
      super({
        id: "prediction_earthquake",
        name: "\u9884\u77E5\u7C7B-\u5730\u9707\u9884\u8B66",
        type: "prediction",
        rarity: 4
      });
    }
    async render(ctx) {
      const { container, fortune, onComplete } = ctx;
      container.innerHTML = "";
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
      const warning = document.createElement("div");
      warning.innerHTML = "\u26A0\uFE0F";
      warning.style.cssText = `
      font-size: 5rem;
      margin-bottom: 1.5rem;
      animation: warningPulse 0.5s ease infinite;
    `;
      container.appendChild(warning);
      const alertText = document.createElement("div");
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
      alertText.textContent = "\u26A1 \u5730\u9707\u9884\u8B66 \u26A1";
      container.appendChild(alertText);
      const subtitle = document.createElement("div");
      subtitle.style.cssText = `
      font-family: var(--font-body, sans-serif);
      font-size: 1rem;
      color: #ff8888;
      margin-top: 0.5rem;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
      subtitle.textContent = "\u6B63\u5728\u5B9A\u4F4D\u9707\u6E90...";
      container.appendChild(subtitle);
      const countdown = document.createElement("div");
      countdown.style.cssText = `
      font-family: var(--font-display, monospace);
      font-size: 3rem;
      color: #ff6666;
      margin-top: 1.5rem;
      opacity: 0;
    `;
      countdown.textContent = "5";
      container.appendChild(countdown);
      const result = document.createElement("div");
      result.style.cssText = `
      font-family: var(--font-display, sans-serif);
      font-size: 1.5rem;
      color: #4ade80;
      margin-top: 2rem;
      opacity: 0;
      transform: translateY(20px);
    `;
      result.textContent = "\u{1F602} \u5F00\u73A9\u7B11\u7684\u5566\uFF01";
      container.appendChild(result);
      this.addStyles();
      await this.delay(800);
      alertText.style.opacity = "1";
      subtitle.style.opacity = "1";
      countdown.style.opacity = "1";
      countdown.style.animation = "countdownShake 1s ease infinite";
      await this.delay(1e3);
      countdown.textContent = "4";
      await this.delay(1e3);
      countdown.textContent = "3";
      await this.delay(1e3);
      countdown.textContent = "2";
      await this.delay(500);
      container.style.animation = "earthquakeShake 0.8s ease";
      countdown.textContent = "1";
      countdown.style.color = "#ff0000";
      countdown.style.fontSize = "4rem";
      await this.delay(800);
      container.style.animation = "none";
      countdown.style.opacity = "0";
      subtitle.textContent = "......";
      await this.delay(500);
      subtitle.textContent = "\u5176\u5B9E\u6CA1\u4E8B";
      subtitle.style.color = "#4ade80";
      await this.delay(800);
      result.style.opacity = "1";
      result.style.transform = "translateY(0)";
      await this.delay(1500);
      if (onComplete) onComplete();
    }
    async delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    addStyles() {
      if (document.getElementById("earthquake-styles")) return;
      const style = document.createElement("style");
      style.id = "earthquake-styles";
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
  };

  // js/animations/timetravel/mom_call.js
  var MomCallAnimation = class extends Animation {
    constructor() {
      super({
        id: "timetravel_mom_call",
        name: "\u7A7F\u8D8A\u7C7B-\u4F60\u5988\u53EB\u4F60\u5403\u996D",
        type: "timetravel",
        rarity: 2
        // 很稀有
      });
    }
    async render(ctx) {
      const { container, fortune, onComplete } = ctx;
      const userInput = fortune?.input || "\u67D0\u53E5\u8BDD";
      container.innerHTML = "";
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
      const timeDisplay = document.createElement("div");
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
      const vhs = document.createElement("div");
      vhs.style.cssText = `
      width: 80%;
      max-width: 320px;
      background: #111;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    `;
      container.appendChild(vhs);
      const label = document.createElement("div");
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
      label.textContent = "\u{1F4FC} \u65F6\u95F4\u56DE\u653E";
      vhs.appendChild(label);
      const playback = document.createElement("div");
      playback.style.cssText = `
      background: #222;
      border: 2px solid #333;
      border-radius: 8px;
      padding: 1rem;
      position: relative;
    `;
      vhs.appendChild(playback);
      const replayText = document.createElement("div");
      replayText.style.cssText = `
      font-family: var(--font-body, sans-serif);
      font-size: 0.9rem;
      color: #888;
      line-height: 1.6;
    `;
      playback.appendChild(replayText);
      const timeline = document.createElement("div");
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
        const dot = document.createElement("div");
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
      const now = /* @__PURE__ */ new Date();
      timeDisplay.textContent = now.toLocaleTimeString("zh-CN");
      await this.delay(500);
      vhs.style.opacity = "0";
      vhs.style.transform = "scale(0.9)";
      vhs.style.transition = "all 0.5s ease";
      await this.delay(100);
      vhs.style.opacity = "1";
      vhs.style.transform = "scale(1)";
      replayText.textContent = "\u6B63\u5728\u56DE\u653E...";
      await this.delay(1e3);
      for (let i = 0; i < 5; i++) {
        const dots = timeline.querySelectorAll("div");
        dots[i].style.background = "#c41e3a";
        dots[i].style.transform = "scale(1.5)";
        await this.delay(400);
      }
      replayText.innerHTML = "";
      replayText.style.color = "#fff";
      const chars = userInput.split("");
      for (let char of chars) {
        replayText.textContent += char;
        await this.delay(50);
      }
      await this.delay(1e3);
      const momCall = document.createElement("div");
      momCall.style.cssText = `
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px dashed #444;
      font-size: 1rem;
      color: #ffcc00;
      animation: momCallPulse 1s ease infinite;
    `;
      momCall.textContent = '\u{1F475} "\u5403\u996D\u4E86\uFF01"';
      playback.appendChild(momCall);
      await this.delay(2e3);
      if (onComplete) onComplete();
    }
    async delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    addStyles() {
      if (document.getElementById("mom-call-styles")) return;
      const style = document.createElement("style");
      style.id = "mom-call-styles";
      style.textContent = `
      @keyframes momCallPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
    `;
      document.head.appendChild(style);
    }
  };

  // js/animations/timetravel/flashback.js
  var FlashbackAnimation = class extends Animation {
    constructor() {
      super({
        id: "timetravel_flashback",
        name: "\u7A7F\u8D8A\u7C7B-\u65F6\u5149\u5012\u6D41",
        type: "timetravel",
        rarity: 4
      });
    }
    async render(ctx) {
      const { container, fortune, onComplete } = ctx;
      container.innerHTML = "";
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
      const scene = document.createElement("div");
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
      const icon = document.createElement("div");
      icon.style.cssText = `
      font-size: 4rem;
      margin-bottom: 1rem;
    `;
      icon.textContent = "\u23F0";
      scene.appendChild(icon);
      const sceneText = document.createElement("div");
      sceneText.style.cssText = `
      font-family: var(--font-display, sans-serif);
      font-size: 1.2rem;
      color: white;
      font-weight: 600;
    `;
      sceneText.textContent = "\u73B0\u5728";
      scene.appendChild(sceneText);
      const yearDisplay = document.createElement("div");
      yearDisplay.style.cssText = `
      font-family: var(--font-display, monospace);
      font-size: 3rem;
      font-weight: 700;
      color: var(--color-primary, #333);
      margin-top: 2rem;
      letter-spacing: 4px;
    `;
      yearDisplay.textContent = "2026";
      container.appendChild(yearDisplay);
      const hint = document.createElement("div");
      hint.style.cssText = `
      position: absolute;
      bottom: 2rem;
      font-size: 0.9rem;
      color: #888;
    `;
      hint.textContent = "\u6B63\u5728\u7A7F\u8D8A\u65F6\u7A7A...";
      container.appendChild(hint);
      const noise = document.createElement("div");
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
      await this.delay(1e3);
      const years = ["2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018"];
      const scenes = [
        { icon: "\u{1F4F1}", text: "\u667A\u80FD\u65F6\u4EE3", color: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
        { icon: "\u{1F3AC}", text: "\u77ED\u89C6\u9891\u5143\u5E74", color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
        { icon: "\u{1F680}", text: "\u79D1\u6280\u98DE\u8DC3", color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
        { icon: "\u2615", text: "\u6162\u751F\u6D3B", color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
        { icon: "\u{1F4E6}", text: "\u7F51\u8D2D\u65F6\u4EE3", color: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)" },
        { icon: "\u{1F3AE}", text: "\u6E38\u620F\u4E3B\u673A", color: "linear-gradient(135deg, #0fd850 0%, #f9f047 100%)" },
        { icon: "\u{1F308}", text: "\u591A\u5F69\u4E16\u754C", color: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" },
        { icon: "\u2728", text: "\u65B0\u7EAA\u5143", color: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)" }
      ];
      for (let i = 0; i < years.length; i++) {
        yearDisplay.textContent = years[i];
        const sceneData = scenes[i];
        scene.style.background = sceneData.color;
        icon.textContent = sceneData.icon;
        sceneText.textContent = sceneData.text;
        noise.style.opacity = "0.3";
        await this.delay(100);
        noise.style.opacity = "0";
        await this.delay(400);
        const grayValue = Math.floor(i / years.length * 60);
        container.style.filter = `grayscale(${grayValue}%)`;
      }
      await this.delay(500);
      scene.style.background = "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)";
      icon.textContent = "\u{1F570}\uFE0F";
      icon.style.fontSize = "3rem";
      sceneText.textContent = "\u65F6\u5149\u6DF1\u5904";
      sceneText.style.color = "#333";
      yearDisplay.textContent = "\u90A3\u5E74";
      yearDisplay.style.color = "#999";
      hint.textContent = "\u4F60\u8F93\u5165\u7684\u90A3\u4E00\u523B\uFF0C\u65F6\u95F4\u4EFF\u4F5B\u5012\u6D41\u4E86";
      container.style.filter = "none";
      await this.delay(2500);
      if (onComplete) onComplete();
    }
    async delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    addStyles() {
      if (document.getElementById("flashback-styles")) return;
      const style = document.createElement("style");
      style.id = "flashback-styles";
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
  };

  // js/animations/prank/fake_bsod.js
  var FakeBSODAnimation = class {
    constructor() {
      this.id = "prank_fake_bsod";
      this.name = "\u6574\u86CA\u7C7B-\u5047\u84DD\u5C4F";
      this.type = "prank";
      this.rarity = 5;
    }
    async render(ctx) {
      const { container, fortune, onComplete } = ctx;
      container.innerHTML = "";
      container.style.cssText = `
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      background: #0078d4; position: relative; overflow: hidden;
    `;
      const bsod = document.createElement("div");
      bsod.style.cssText = `
      width: 100%; height: 100%;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      background: linear-gradient(180deg, #0078d4 0%, #005a9e 100%);
      position: absolute; top: 0; left: 0;
    `;
      container.appendChild(bsod);
      const emoji = document.createElement("div");
      emoji.style.cssText = "font-size: 5rem; margin-bottom: 2rem; filter: grayscale(100%);";
      emoji.textContent = "\u{1F641}";
      bsod.appendChild(emoji);
      const message = document.createElement("div");
      message.style.cssText = `
      font-family: "Segoe UI", "Microsoft YaHei", sans-serif;
      font-size: 1.2rem; color: white; text-align: center;
      max-width: 500px; line-height: 1.8;
    `;
      message.innerHTML = `
      <div style="font-size: 1.4rem; font-weight: 600; margin-bottom: 1rem;">
        \u5662\uFF0C\u4F60\u7684\u8BA1\u7B97\u673A\u9047\u5230\u4E86\u95EE\u9898
      </div>
      <div style="margin-bottom: 1.5rem;">
        \u6211\u4EEC\u53EA\u6536\u96C6\u67D0\u4E9B\u9519\u8BEF\u4FE1\u606F\uFF0C\u7136\u540E\u6211\u4EEC\u53EF\u4EE5\u4E3A\u4F60\u91CD\u65B0\u542F\u52A8\u3002
      </div>
      <div style="font-size: 0.9rem; opacity: 0.8;">
        \u4EE3\u7801\uFF1ACRITICAL_PROCESS_DIED
      </div>
    `;
      bsod.appendChild(message);
      const progress = document.createElement("div");
      progress.style.cssText = `
      position: absolute; bottom: 80px; left: 50%;
      transform: translateX(-50%); width: 300px; height: 4px;
      background: rgba(255,255,255,0.2); border-radius: 2px; overflow: hidden;
    `;
      bsod.appendChild(progress);
      const progressBar = document.createElement("div");
      progressBar.style.cssText = `
      height: 100%; background: white; width: 0%; transition: width 0.1s linear;
    `;
      progress.appendChild(progressBar);
      const percent = document.createElement("div");
      percent.style.cssText = `
      position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
      font-family: "Segoe UI", sans-serif; font-size: 0.9rem;
      color: white; opacity: 0.8;
    `;
      percent.textContent = "0%";
      bsod.appendChild(percent);
      container.style.animation = "bsodShake 0.1s linear infinite";
      this.addStyles();
      for (let i = 0; i <= 100; i += 3) {
        progressBar.style.width = i + "%";
        percent.textContent = i + "%";
        await this.delay(60);
      }
      await this.delay(2e3);
      bsod.style.transition = "opacity 0.3s ease";
      bsod.style.opacity = "0";
      await this.delay(300);
      container.style.animation = "none";
      container.style.background = "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)";
      const punchline = document.createElement("div");
      punchline.style.cssText = `
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      width: 100%; height: 100%;
    `;
      punchline.innerHTML = `
      <div style="font-size: 4rem; margin-bottom: 1.5rem;">\u{1F602}</div>
      <div style="font-family: var(--font-display, sans-serif); font-size: 1.8rem; color: #4ade80; font-weight: 700; margin-bottom: 1rem;">
        \u9A97\u4F60\u7684\uFF01
      </div>
      <div style="font-family: var(--font-body, sans-serif); font-size: 1rem; color: rgba(255,255,255,0.7); margin-bottom: 1.5rem;">
        \u4F60\u7684\u7535\u8111\u6CA1\u4E8B\uFF0C\u8FD9\u662F\u4E2A\u65E0\u5398\u5934\u6574\u86CA\u52A8\u753B
      </div>
      <div style="font-family: var(--font-body, sans-serif); font-size: 1.2rem; color: #ffd700;">
        \u{1F381} \u4ECA\u65E5\u8FD0\u52BF\uFF1A\u4F60\u53EF\u80FD\u4F1A\u6361\u5230\u94B1
      </div>
    `;
      container.appendChild(punchline);
      punchline.style.opacity = "0";
      await this.delay(100);
      punchline.style.transition = "opacity 0.5s ease";
      punchline.style.opacity = "1";
      await this.delay(3e3);
      if (onComplete) onComplete();
    }
    async delay(ms) {
      return new Promise((r) => setTimeout(r, ms));
    }
    addStyles() {
      if (document.getElementById("bsod-styles")) return;
      const style = document.createElement("style");
      style.id = "bsod-styles";
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
  };

  // js/animations/prank/countdown_trick.js
  var CountdownTrickAnimation = class extends Animation {
    constructor() {
      super({
        id: "prank_countdown_trick",
        name: "\u6574\u86CA\u7C7B-\u5012\u8BA1\u65F6\u53CD\u8F6C",
        type: "prank",
        rarity: 3
      });
    }
    async render(ctx) {
      const { container, fortune, onComplete } = ctx;
      container.innerHTML = "";
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
      const title = document.createElement("div");
      title.style.cssText = `
      font-family: var(--font-display, sans-serif);
      font-size: 1rem;
      color: var(--color-text-dim, #666);
      margin-bottom: 2rem;
      text-transform: uppercase;
      letter-spacing: 4px;
    `;
      title.textContent = "\u547D\u8FD0\u5012\u8BA1\u65F6";
      container.appendChild(title);
      const number = document.createElement("div");
      number.style.cssText = `
      font-family: var(--font-display, monospace);
      font-size: 10rem;
      font-weight: 700;
      color: var(--color-primary, #d4af37);
      text-shadow: 0 0 60px var(--color-primary-glow, rgba(212,175,55,0.5));
      line-height: 1;
    `;
      number.textContent = "10";
      container.appendChild(number);
      const hint = document.createElement("div");
      hint.style.cssText = `
      font-family: var(--font-body, sans-serif);
      font-size: 0.9rem;
      color: var(--color-text-dim, #666);
      margin-top: 2rem;
    `;
      hint.textContent = "\u51C6\u5907\u8FCE\u63A5\u4F60\u7684\u547D\u8FD0...";
      container.appendChild(hint);
      const halo = document.createElement("div");
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
      for (let i = 10; i >= 0; i--) {
        number.textContent = i;
        number.style.transform = "scale(1.2)";
        number.style.opacity = "0.8";
        await this.delay(300);
        number.style.transform = "scale(1)";
        number.style.opacity = "1";
        await this.delay(700);
      }
      await this.delay(500);
      number.textContent = "0";
      number.style.color = "#ff4444";
      hint.textContent = "\u65F6\u95F4\u5230\u4E86\uFF01";
      await this.delay(1e3);
      number.style.transition = "all 0.3s ease";
      hint.textContent = "\u7B49\u7B49...\u597D\u50CF\u4E0D\u5BF9\uFF1F";
      for (let i = 10; i >= 0; i--) {
        number.textContent = i;
        number.style.transform = `rotate(${(10 - i) * 10}deg)`;
        await this.delay(150);
      }
      await this.delay(500);
      hint.textContent = "\u518D\u7B49\u4E00\u4E0B...";
      number.style.color = "#4ade80";
      hint.textContent = "\u597D\u5427\uFF0C\u8FD9\u6B21\u662F\u771F\u7684\uFF01";
      for (let i = 0; i <= 5; i++) {
        number.textContent = 5 - i;
        number.style.transform = "scale(1.3)";
        await this.delay(200);
        number.style.transform = "scale(1)";
        await this.delay(300);
      }
      await this.delay(500);
      number.style.fontSize = "3rem";
      number.textContent = "\u{1F381}";
      hint.textContent = "\u4F60\u7684\u547D\u8FD0\u5DF2\u7ECF\u6CE8\u5B9A\uFF1A\u4ECA\u5929\u9002\u5408\u8EBA\u5E73\uFF01";
      hint.style.color = "#4ade80";
      halo.style.display = "none";
      await this.delay(2500);
      if (onComplete) onComplete();
    }
    async delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    addStyles() {
      if (document.getElementById("countdown-trick-styles")) return;
      const style = document.createElement("style");
      style.id = "countdown-trick-styles";
      style.textContent = `
      @keyframes haloPulse {
        0%, 100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.2); opacity: 0.8; }
      }
    `;
      document.head.appendChild(style);
    }
  };

  // js/animations/mystic/coin_divine.js
  var CoinDivineAnimation = class extends Animation {
    constructor() {
      super({
        id: "mystic_coin_divine",
        name: "\u7384\u5B66\u7C7B-\u94DC\u94B1\u6447\u5366",
        type: "mystic",
        rarity: 4
      });
    }
    async render(ctx) {
      const { container, fortune, onComplete } = ctx;
      container.innerHTML = "";
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
      const bagua = document.createElement("div");
      bagua.innerHTML = "\u262F\uFE0F";
      bagua.style.cssText = `
      position: absolute;
      font-size: 15rem;
      opacity: 0.05;
      color: #ffd700;
    `;
      container.appendChild(bagua);
      const title = document.createElement("div");
      title.style.cssText = `
      font-family: var(--font-display, serif);
      font-size: 1.2rem;
      color: #ffd700;
      margin-bottom: 2rem;
      letter-spacing: 8px;
    `;
      title.textContent = "\u91D1\u94B1\u5366";
      container.appendChild(title);
      const coinsContainer = document.createElement("div");
      coinsContainer.style.cssText = `
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
    `;
      container.appendChild(coinsContainer);
      const coins = [];
      for (let i = 0; i < 3; i++) {
        const coin = document.createElement("div");
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
        coin.innerHTML = "\xA5";
        coinsContainer.appendChild(coin);
        coins.push(coin);
      }
      coins.forEach((coin) => {
        const hole = document.createElement("div");
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
      const result = document.createElement("div");
      result.style.cssText = `
      font-family: var(--font-display, serif);
      font-size: 1.5rem;
      color: #ffd700;
      text-align: center;
      opacity: 0;
      margin-bottom: 1rem;
    `;
      container.appendChild(result);
      const hexagram = document.createElement("div");
      hexagram.style.cssText = `
      font-family: var(--font-display, serif);
      font-size: 3rem;
      color: #ffd700;
      letter-spacing: 0.5rem;
      opacity: 0;
      text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
    `;
      container.appendChild(hexagram);
      const interpretation = document.createElement("div");
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
      await this.delay(500);
      for (let shake = 0; shake < 3; shake++) {
        coins.forEach((coin) => {
          coin.style.transition = "transform 0.3s ease";
          coin.style.transform = "translateY(-100px) rotate(720deg)";
        });
        await this.delay(400);
        coins.forEach((coin) => {
          coin.style.transform = "translateY(0) rotate(0deg)";
        });
        await this.delay(300);
        const randomRotations = [360, 540, 720];
        coins.forEach((coin, i) => {
          coin.style.transition = "transform 0.5s ease-out";
          coin.style.transform = `rotate(${randomRotations[i]}deg)`;
        });
        await this.delay(600);
      }
      await this.delay(500);
      const results = ["\u9633", "\u9634"];
      const hexagrams = ["\u2630", "\u2631", "\u2632", "\u2633", "\u2634", "\u2635", "\u2636", "\u2637"];
      const guaNames = ["\u4E7E", "\u5151", "\u79BB", "\u9707", "\u5DFD", "\u574E", "\u826E", "\u5764"];
      const interpretations = [
        "\u5929\u884C\u5065\uFF0C\u541B\u5B50\u4EE5\u81EA\u5F3A\u4E0D\u606F\u3002\u4ECA\u65E5\u8BF8\u4E8B\u5927\u5409\u3002",
        "\u5151\u4E0A\u7EBF\u4E0B\uFF0C\u4ECA\u65E5\u9002\u5408\u4E0E\u4EBA\u4EA4\u6D41\uFF0C\u4F1A\u6709\u610F\u5916\u6536\u83B7\u3002",
        "\u79BB\u706B\u660E\u4EAE\uFF0C\u4ECA\u65E5\u5FC3\u60C5\u6109\u60A6\uFF0C\u9002\u5408\u505A\u521B\u9020\u6027\u7684\u4E8B\u3002",
        "\u9707\u96F7\u60CA\u767E\u866B\uFF0C\u4ECA\u65E5\u4F1A\u6709\u8BA9\u4F60\u60CA\u8BB6\u7684\u4E8B\u60C5\u53D1\u751F\u3002",
        "\u5DFD\u4E3A\u98CE\uFF0C\u4ECA\u65E5\u9002\u5408\u7075\u6D3B\u5E94\u53D8\uFF0C\u987A\u52BF\u800C\u4E3A\u3002",
        "\u574E\u4E3A\u6C34\uFF0C\u4ECA\u65E5\u8D22\u8FD0\u6D41\u52A8\uFF0C\u53EF\u80FD\u6709\u5C0F\u94B1\u94B1\u5165\u8D26\u3002",
        "\u826E\u4E3A\u5C71\uFF0C\u4ECA\u65E5\u5B9C\u9759\u4E0D\u5B9C\u52A8\uFF0C\u9002\u5408\u601D\u8003\u89C4\u5212\u3002",
        "\u5764\u4E3A\u5730\uFF0C\u4ECA\u65E5\u8BF8\u4E8B\u5E73\u7A33\uFF0C\u8E0F\u5B9E\u524D\u884C\u53EF\u83B7\u597D\u8FD0\u3002"
      ];
      const randIndex = () => Math.floor(Math.random() * 2);
      const guaIndex = Math.floor(Math.random() * 8);
      result.textContent = results[randIndex()] + results[randIndex()] + results[randIndex()];
      result.style.opacity = "1";
      result.style.animation = "resultGlow 1s ease infinite";
      await this.delay(1e3);
      hexagram.textContent = guaNames[guaIndex];
      hexagram.style.opacity = "1";
      hexagram.style.animation = "hexagramReveal 0.5s ease";
      await this.delay(800);
      interpretation.textContent = interpretations[guaIndex];
      interpretation.style.opacity = "1";
      await this.delay(3e3);
      if (onComplete) onComplete();
    }
    async delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    addStyles() {
      if (document.getElementById("coin-divine-styles")) return;
      const style = document.createElement("style");
      style.id = "coin-divine-styles";
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
  };

  // js/animations/mystic/scroll_unfold.js
  var ScrollUnfoldAnimation = class extends Animation {
    constructor() {
      super({
        id: "mystic_scroll_unfold",
        name: "\u7384\u5B66\u7C7B-\u7B7E\u6587\u5C55\u5F00",
        type: "mystic",
        rarity: 4
      });
    }
    async render(ctx) {
      const { container, fortune, onComplete } = ctx;
      container.innerHTML = "";
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
      const texture = document.createElement("div");
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
      const tube = document.createElement("div");
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
      const tubeTop = document.createElement("div");
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
      const sticks = document.createElement("div");
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
        const stick = document.createElement("div");
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
      const scroll = document.createElement("div");
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
      const scrollHeader = document.createElement("div");
      scrollHeader.style.cssText = `
      text-align: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px dashed #d4af37;
    `;
      scrollHeader.innerHTML = `
      <div style="font-size: 2rem;">\u{1F3EE}</div>
      <div style="font-family: var(--font-display, serif); font-size: 1.5rem; color: #8b4513; margin-top: 0.5rem;">
        \u7B2C ${Math.floor(Math.random() * 100 + 1)} \u7B7E
      </div>
    `;
      scroll.appendChild(scrollHeader);
      const fortunes = [
        { title: "\u4E0A\u4E0A\u7B7E", content: "\u6625\u96F7\u6EDA\u6EDA\u9707\u5929\u54CD\uFF0C\n\u8D22\u6E90\u5E7F\u8FDB\u798F\u6EE1\u5802\u3002\n\u51FA\u95E8\u9047\u8D35\u4EBA\u76F8\u52A9\uFF0C\n\u5FC3\u60F3\u4E8B\u6210\u4E07\u4E8B\u660C\u3002" },
        { title: "\u4E2D\u5E73\u7B7E", content: "\u5C71\u9AD8\u8DEF\u8FDC\u83AB\u614C\u5F20\uFF0C\n\u7A33\u624E\u7A33\u6253\u662F\u826F\u65B9\u3002\n\u8010\u5FC3\u7B49\u5F85\u65F6\u673A\u5230\uFF0C\n\u81EA\u6709\u6E05\u98CE\u9001\u51C9\u723D\u3002" },
        { title: "\u4E0B\u7B7E", content: "\u8239\u5230\u6C5F\u5FC3\u8865\u6F0F\u8FDF\uFF0C\n\u4E0D\u5982\u5F53\u521D\u4ED4\u7EC6\u65F6\u3002\n\u83AB\u6028\u5929\u6765\u83AB\u6028\u5730\uFF0C\n\u53EA\u56E0\u81EA\u5DF1\u592A\u5927\u610F\u3002" },
        { title: "\u4E0A\u7B7E", content: "\u5B9D\u5251\u950B\u4ECE\u78E8\u783A\u51FA\uFF0C\n\u6885\u82B1\u9999\u81EA\u82E6\u5BD2\u6765\u3002\n\u4ECA\u65E5\u4ED8\u51FA\u7686\u6709\u6570\uFF0C\n\u4ED6\u65E5\u6536\u83B7\u81EA\u7136\u6765\u3002" }
      ];
      const fortuneData = fortunes[Math.floor(Math.random() * fortunes.length)];
      const scrollTitle = document.createElement("div");
      scrollTitle.style.cssText = `
      font-family: var(--font-display, serif);
      font-size: 1.2rem;
      color: ${fortuneData.title === "\u4E0A\u4E0A\u7B7E" ? "#c41e3a" : fortuneData.title === "\u4E0B\u7B7E" ? "#666" : "#8b4513"};
      text-align: center;
      margin-bottom: 1rem;
    `;
      scrollTitle.textContent = fortuneData.title;
      scroll.appendChild(scrollTitle);
      const scrollContent = document.createElement("div");
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
      const interpretation = document.createElement("div");
      interpretation.style.cssText = `
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #d4af37;
      font-family: var(--font-body, sans-serif);
      font-size: 0.85rem;
      color: #666;
      text-align: center;
    `;
      interpretation.textContent = "\u2728 \u89E3\u7B7E\uFF1A\u4ECA\u65E5\u5B9C\u9759\u5FC3\uFF0C\u65B9\u53EF\u9047\u826F\u673A";
      scroll.appendChild(interpretation);
      this.addStyles();
      await this.delay(1500);
      sticks.style.animation = "stickShake 0.15s ease infinite";
      await this.delay(1e3);
      const jumpingStick = document.createElement("div");
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
      const stickNumber = document.createElement("div");
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
      tube.style.opacity = "0";
      tube.style.transition = "opacity 0.5s ease";
      await this.delay(500);
      scroll.style.opacity = "1";
      scroll.style.transform = "translateY(0) scale(1)";
      await this.delay(3e3);
      if (onComplete) onComplete();
    }
    async delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    addStyles() {
      if (document.getElementById("scroll-unfold-styles")) return;
      const style = document.createElement("style");
      style.id = "scroll-unfold-styles";
      style.textContent = `
      @keyframes stickShake {
        0%, 100% { transform: rotate(-3deg); }
        50% { transform: rotate(3deg); }
      }
    `;
      document.head.appendChild(style);
    }
  };

  // js/animations/badluck/today_not_good.js
  var TodayNotGoodAnimation = class extends Animation {
    constructor() {
      super({
        id: "badluck_today_not_good",
        name: "\u574F\u7B7E\u7C7B-\u4ECA\u65E5\u4E0D\u5B9C",
        type: "badluck",
        rarity: 3
      });
    }
    async render(ctx) {
      const { container, fortune, onComplete } = ctx;
      container.innerHTML = "";
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
      const clouds = document.createElement("div");
      clouds.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 150px;
      background: linear-gradient(180deg, #333 0%, transparent 100%);
    `;
      container.appendChild(clouds);
      const cloudEmoji = document.createElement("div");
      cloudEmoji.style.cssText = `
      position: absolute;
      top: 30px;
      font-size: 4rem;
      animation: cloudFloat 3s ease infinite;
    `;
      cloudEmoji.textContent = "\u2601\uFE0F";
      clouds.appendChild(cloudEmoji);
      const content = document.createElement("div");
      content.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 1;
    `;
      container.appendChild(content);
      const warning = document.createElement("div");
      warning.innerHTML = "\u26A0\uFE0F";
      warning.style.cssText = `
      font-size: 5rem;
      margin-bottom: 1rem;
      animation: warningBounce 1s ease infinite;
    `;
      content.appendChild(warning);
      const mainText = document.createElement("div");
      mainText.style.cssText = `
      font-family: var(--font-display, sans-serif);
      font-size: 2rem;
      font-weight: 700;
      color: #ff6b6b;
      text-align: center;
      margin-bottom: 1rem;
      text-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
    `;
      mainText.textContent = "\u4ECA\u65E5\u4E0D\u5B9C";
      content.appendChild(mainText);
      const subtitle = document.createElement("div");
      subtitle.style.cssText = `
      font-family: var(--font-body, sans-serif);
      font-size: 1rem;
      color: #888;
      margin-bottom: 2rem;
    `;
      subtitle.textContent = "\u8BF8\u4E8B\u4E0D\u5B9C\uFF0C\u4FDD\u5B88\u4E3A\u4E0A";
      content.appendChild(subtitle);
      const badEvents = document.createElement("div");
      badEvents.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      opacity: 0;
      transition: opacity 0.5s ease;
    `;
      content.appendChild(badEvents);
      const events = [
        { emoji: "\u{1F4BC}", text: "\u51FA\u95E8\u8E29\u5230\u72D7\u5C4E" },
        { emoji: "\u{1F4F1}", text: "\u624B\u673A\u6389\u6C34\u91CC\u4E86" },
        { emoji: "\u{1F4B8}", text: "\u4E22\u4E86\u4E2A\u94B1\u5305" },
        { emoji: "\u{1F634}", text: "\u5931\u7720\u4E00\u6574\u591C" }
      ];
      events.forEach((event) => {
        const item = document.createElement("div");
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
      const twist = document.createElement("div");
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
      <div style="margin-bottom: 0.5rem;">\u{1F602} \u5176\u5B9E...</div>
      <div style="font-size: 1.5rem; font-weight: 700;">\u4E0D\u5B9C\u7684\u662F\u574F\u4E8B\uFF01</div>
      <div style="font-size: 0.9rem; margin-top: 0.5rem; color: #888;">
        \u597D\u8FD0\u4F1A\u81EA\u5DF1\u627E\u4E0A\u95E8 \u{1F389}
      </div>
    `;
      container.appendChild(twist);
      const lightning = document.createElement("div");
      lightning.style.cssText = `
      position: absolute;
      top: 20px;
      right: 30px;
      font-size: 3rem;
      opacity: 0;
    `;
      lightning.innerHTML = "\u26A1";
      container.appendChild(lightning);
      this.addStyles();
      await this.delay(800);
      mainText.style.animation = "textShake 0.5s ease infinite";
      await this.delay(1e3);
      lightning.style.animation = "lightningFlash 0.5s ease infinite";
      await this.delay(300);
      lightning.style.opacity = "1";
      await this.delay(500);
      badEvents.style.opacity = "1";
      const items = badEvents.querySelectorAll("div");
      for (let i = 0; i < items.length; i++) {
        items[i].style.opacity = "0";
        items[i].style.transform = "translateX(-20px)";
        items[i].style.transition = "all 0.3s ease";
        await this.delay(300);
        items[i].style.opacity = "1";
        items[i].style.transform = "translateX(0)";
        if (i < items.length - 1) {
          await this.delay(200);
        }
      }
      await this.delay(1500);
      clouds.style.opacity = "0";
      lightning.style.display = "none";
      await this.delay(500);
      mainText.textContent = "\u7B49\u7B49\uFF01";
      mainText.style.color = "#ffd700";
      subtitle.textContent = "\u8BA9\u6211\u91CD\u65B0\u89E3\u8BFB\u4E00\u4E0B...";
      await this.delay(1e3);
      mainText.textContent = "\u4ECA\u65E5\u5927\u5409\uFF01";
      mainText.style.color = "#4ade80";
      subtitle.textContent = "\u597D\u8FD0\u6B63\u5728\u6D3E\u9001\u4E2D \u{1F680}";
      badEvents.style.opacity = "0";
      await this.delay(500);
      twist.style.opacity = "1";
      twist.style.transform = "translateY(0)";
      const celebration = document.createElement("div");
      celebration.style.cssText = `
      position: absolute;
      top: 50px;
      font-size: 2rem;
      animation: celebrationBounce 1s ease infinite;
    `;
      celebration.innerHTML = "\u{1F38A} \u{1F381} \u{1F389}";
      container.appendChild(celebration);
      await this.delay(2500);
      if (onComplete) onComplete();
    }
    async delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    addStyles() {
      if (document.getElementById("today-not-good-styles")) return;
      const style = document.createElement("style");
      style.id = "today-not-good-styles";
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
  };

  // js/animations/registry.js
  var AnimationRegistry = class {
    constructor() {
      this.modules = /* @__PURE__ */ new Map();
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
        throw new Error("Module must be an instance of Animation");
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
      return this.getAll().filter((m) => m.type === type);
    }
    /**
     * 按稀有度获取（范围）
     * @param {number} min - 最小稀有度
     * @param {number} max - 最大稀有度
     * @returns {Animation[]}
     */
    byRarityRange(min, max) {
      return this.getAll().filter((m) => m.rarity >= min && m.rarity <= max);
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
      const weights = all.map((m) => 11 - m.rarity);
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
      console.log(`[Registry] Routed: ${type} \u2192 ${mapped.id}`);
      return mapped;
    }
  };
  var animationRegistry = new AnimationRegistry();

  // js/infrastructure/MinimaxClient.js
  var MinimaxClient = class {
    constructor(apiKey = null) {
      this.apiKey = apiKey || this.getApiKey();
      this.baseUrl = "https://api.minimax.chat/v1";
      this.model = "MiniMax-M2.7";
    }
    getApiKey() {
      return localStorage.getItem("minimax_api_key") || "";
    }
    setApiKey(key) {
      this.apiKey = key;
      localStorage.setItem("minimax_api_key", key);
    }
    /**
     * 发送聊天请求
     * @param {string} systemPrompt
     * @param {string} userMessage
     * @returns {Promise<string>}
     */
    async chat(systemPrompt, userMessage) {
      if (!this.apiKey) {
        throw new Error("API key not set");
      }
      try {
        const response = await fetch(`${this.baseUrl}/text/chatcompletion_v2`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage }
            ],
            temperature: 0.9,
            // 高随机性
            max_tokens: 500
          })
        });
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "";
      } catch (error) {
        console.error("[MinimaxClient] Chat error:", error);
        throw error;
      }
    }
  };
  var minimaxClient = new MinimaxClient();

  // js/services/FortuneGenerator.js
  var FortuneGenerator = class {
    constructor() {
      this.fallbackResults = [
        {
          type: "prediction",
          title: "\u795E\u79D8\u9884\u77E5",
          text: "\u4F60\u5C06\u57283\u79D2\u540E\u6253\u55B7\u568F\u3002\u4E0D\u4FE1\u4F60\u6570\u7740\u3002",
          params: { countdown: 3, effect: "sneeze" }
        },
        {
          type: "timetravel",
          title: "\u65F6\u5149\u5012\u6D41",
          text: "\u56DE\u653E\u4E00\u4E0B\uFF1A\u4F60\u521A\u624D\u8F93\u5165\u7684\u65F6\u5019\uFF0C\u4F60\u5988\u5176\u5B9E\u5728\u9694\u58C1\u53EB\u4F60\u3002",
          params: { scene: "mom_call" }
        },
        {
          type: "prank",
          title: "\u6574\u86CA\u8B66\u544A",
          text: "\u68C0\u6D4B\u5230\u7CFB\u7EDF\u5373\u5C06\u5D29\u6E83...\u5F00\u73A9\u7B11\u7684\uFF0C\u4F60\u7684\u597D\u8FD0\u6B63\u5728\u52A0\u8F7D\u4E2D\u3002",
          params: { fake_error: true }
        },
        {
          type: "mystic",
          title: "\u4E0A\u4E0A\u7B7E",
          text: "\u6447\u51FA\u4E00\u652F\u7B7E\uFF1A\u7B2C88\u7B7E\u3002\u5927\u5409\u3002\u4ECA\u65E5\u51FA\u95E8\u4F1A\u6361\u5230\u94B1\u3002",
          params: { gua: 88, level: "super_lucky" }
        },
        {
          type: "badluck",
          title: "\u4ECA\u65E5\u4E0D\u5B9C",
          text: "\u8BF8\u4E8B\u4E0D\u5B9C...\u4E0D\u5B9C\u7684\u662F\u574F\u4E8B\u3002\u597D\u8FD0\u4F1A\u81EA\u5DF1\u627E\u4E0A\u95E8\u7684\uFF01",
          params: { reversed: true }
        },
        {
          type: "prediction",
          title: "\u55B7\u568F\u9884\u8A00",
          text: "\u4F60\u521A\u624D\u6253\u55B7\u568F\u7684\u65F6\u5019\uFF0C\u6709\u4EBA\u5728\u60F3\u4F60\u3002\u662F\u8C01\uFF1F\u662F\u4F60\u81EA\u5DF1\u3002",
          params: { countdown: 5, effect: "sneeze" }
        },
        {
          type: "timetravel",
          title: "\u7A7F\u8D8A\u65F6\u7A7A",
          text: "\u6839\u636E\u5927\u6570\u636E\u5206\u6790\uFF0C\u4F60\u4E0A\u8F88\u5B50\u662F\u4E2A\u65E0\u5FE7\u65E0\u8651\u7684\u4EBA\u3002\u8FD9\u8F88\u5B50\u4E5F\u662F\u3002",
          params: { era: "past_life" }
        },
        {
          type: "prank",
          title: "\u5012\u8BA1\u65F6\u60CA\u559C",
          text: "10...9...8...\u4F60\u7684\u597D\u8FD0\u5012\u8BA1\u65F6\u5F00\u59CB\u4E86\uFF01",
          params: { countdown: 10 }
        },
        {
          type: "mystic",
          title: "\u94DC\u94B1\u5366",
          text: "\u4E09\u679A\u94DC\u94B1\u843D\u5730\uFF1A\u9633\u3001\u9634\u3001\u9633\u3002\u8FD9\u662F\u5927\u5409\u4E4B\u5146\u3002",
          params: { coins: ["yang", "yin", "yang"] }
        },
        {
          type: "badluck",
          title: "\u5C0F\u574F\u8FD0",
          text: "\u4ECA\u5929\u53EF\u80FD\u4F1A\u6454\u4E00\u8DE4...\u4F46\u662F\u4F1A\u6709\u4EBA\u6276\u4F60\u8D77\u6765\u3002",
          params: { bad: true, mitigated: true }
        }
      ];
    }
    /**
     * 生成命运
     * @param {Object} context
     * @param {string} context.userInput - 用户输入
     * @param {string} context.style - 氛围风格
     * @param {string} context.timestamp - 当前时间戳
     * @param {string} context.randomSeed - 随机种子
     * @returns {Promise<Object>} { type, title, text, params }
     */
    async generate(context) {
      const { userInput, style, timestamp, randomSeed } = context;
      if (!minimaxClient.apiKey) {
        console.log("[FortuneGenerator] No API key, using fallback");
        return this.getRandomFallback();
      }
      try {
        const result = await this.callAI(context);
        return this.validateResult(result);
      } catch (error) {
        console.error("[FortuneGenerator] AI error:", error);
        return this.getRandomFallback();
      }
    }
    /**
     * 调用 AI
     */
    async callAI(context) {
      const { userInput, style, timestamp, randomSeed } = context;
      const systemPrompt = `\u4F60\u662F\u4E00\u4E2A\u65E0\u5398\u5934\u7684\u535C\u5366\u5927\u5E08\uFF0C\u4E13\u95E8\u751F\u6210\u51FA\u5947\u5236\u80DC\u3001\u8BA9\u4EBA\u4F1A\u5FC3\u4E00\u7B11\u7684\u535C\u5366\u7ED3\u679C\u3002

\u89C4\u5219\uFF1A
1. \u5FC5\u987B\u51FA\u4EBA\u610F\u6599\uFF0C\u4E0D\u80FD\u5E73\u5EB8
2. \u8981\u6709\u65E0\u5398\u5934\u7684\u5E7D\u9ED8\u611F
3. \u6839\u636E\u7528\u6237\u8F93\u5165\u968F\u673A\u751F\u6210\u4E0D\u540C\u7C7B\u578B\u7684\u7ED3\u679C
4. \u6BCF\u6B21\u90FD\u8981\u4E0D\u4E00\u6837

\u7C7B\u578B\u8BF4\u660E\uFF1A
- prediction\uFF08\u9884\u77E5\u7C7B\uFF09\uFF1A\u9884\u8A00\u4E00\u4EF6\u5373\u5C06\u53D1\u751F\u7684\u641E\u7B11\u5C0F\u4E8B
- timetravel\uFF08\u7A7F\u8D8A\u7C7B\uFF09\uFF1A\u7A7F\u8D8A\u5230\u67D0\u4E2A\u641E\u7B11\u573A\u666F
- prank\uFF08\u6574\u86CA\u7C7B\uFF09\uFF1A\u5148\u5413\u4F60\u4E00\u8DF3\u518D\u53CD\u8F6C
- mystic\uFF08\u7384\u5B66\u7C7B\uFF09\uFF1A\u7528\u7384\u5B66\u8BED\u8A00\u5305\u88C5\u4E00\u4E2A\u641E\u7B11\u7ED3\u8BBA
- badluck\uFF08\u574F\u7B7E\u7C7B\uFF09\uFF1A\u5148\u8BF4\u4E0D\u597D\u7684\u518D\u8BF4\u53CD\u8F6C

\u8FD4\u56DE\u683C\u5F0F\uFF08\u5FC5\u987B\u662F\u4E25\u683CJSON\uFF09\uFF1A
{
  "type": "prediction|timetravel|prank|mystic|badluck",
  "title": "\u6807\u9898\uFF085\u5B57\u5185\uFF09",
  "text": "\u65E0\u5398\u5934\u6587\u6848\uFF0820-50\u5B57\uFF0C\u8981\u51FA\u4EBA\u610F\u6599\uFF09",
  "params": {
    // \u7C7B\u578B\u7279\u5B9A\u53C2\u6570\uFF0C\u7528\u4E8E\u9A71\u52A8\u52A8\u753B
  }
}`;
      const userMessage = `\u5F53\u524D\u65F6\u95F4: ${timestamp}
\u968F\u673A\u79CD\u5B50: ${randomSeed}
\u7528\u6237\u8F93\u5165: ${userInput}
\u6C1B\u56F4\u98CE\u683C: ${style}

\u8BF7\u751F\u6210\u4E00\u4E2A\u65E0\u5398\u5934\u7684\u535C\u5366\u7ED3\u679C\u3002`;
      const response = await minimaxClient.chat(systemPrompt, userMessage);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error("Failed to parse AI response");
    }
    /**
     * 验证结果结构
     */
    validateResult(result) {
      const validTypes = ["prediction", "timetravel", "prank", "mystic", "badluck"];
      if (!validTypes.includes(result.type)) {
        result.type = validTypes[Math.floor(Math.random() * validTypes.length)];
      }
      if (!result.title) result.title = "\u65E0\u5398\u5934";
      if (!result.text) result.text = "\u8FD9\u5C31\u662F\u4F60\u7684\u547D\u8FD0\uFF0C\u81EA\u5DF1\u4F53\u4F1A\u5427\u3002";
      if (!result.params) result.params = {};
      return result;
    }
    /**
     * 获取随机 fallback
     */
    getRandomFallback() {
      const index = Math.floor(Math.random() * this.fallbackResults.length);
      return this.fallbackResults[index];
    }
  };
  var fortuneGenerator = new FortuneGenerator();

  // js/infrastructure/StorageAdapter.js
  var StorageAdapter = class {
    constructor() {
      this.storageKey = "wuliao_fortune_history";
      this.settingsKey = "wuliao_fortune_settings";
    }
    /**
     * 获取历史记录
     * @returns {Fortune[]}
     */
    getHistory() {
      try {
        const data = localStorage.getItem(this.storageKey);
        if (!data) return [];
        const parsed = JSON.parse(data);
        return parsed.map((item) => Fortune.fromJSON(item));
      } catch (error) {
        console.error("[Storage] Failed to get history:", error);
        return [];
      }
    }
    /**
     * 保存一条记录
     * @param {Fortune} fortune
     */
    saveFortune(fortune) {
      try {
        const history = this.getHistory();
        history.unshift(fortune);
        if (history.length > 100) {
          history.pop();
        }
        localStorage.setItem(this.storageKey, JSON.stringify(history.map((f) => f.toJSON())));
        console.log("[Storage] Fortune saved:", fortune.id);
      } catch (error) {
        console.error("[Storage] Failed to save fortune:", error);
      }
    }
    /**
     * 获取单条记录
     * @param {string} id
     * @returns {Fortune|null}
     */
    getFortune(id) {
      const history = this.getHistory();
      return history.find((f) => f.id === id) || null;
    }
    /**
     * 清空历史
     */
    clearHistory() {
      localStorage.removeItem(this.storageKey);
      console.log("[Storage] History cleared");
    }
    /**
     * 导出历史为 JSON
     * @returns {string}
     */
    exportHistory() {
      const history = this.getHistory();
      return JSON.stringify(history.map((f) => f.toJSON()), null, 2);
    }
    /**
     * 导入历史
     * @param {string} jsonStr
     */
    importHistory(jsonStr) {
      try {
        const data = JSON.parse(jsonStr);
        const fortunes = data.map((item) => Fortune.fromJSON(item));
        localStorage.setItem(this.storageKey, JSON.stringify(fortunes.map((f) => f.toJSON())));
        console.log("[Storage] History imported:", fortunes.length, "items");
      } catch (error) {
        console.error("[Storage] Failed to import history:", error);
        throw error;
      }
    }
    /**
     * 获取设置
     * @returns {Object}
     */
    getSettings() {
      try {
        const data = localStorage.getItem(this.settingsKey);
        if (!data) return this.getDefaultSettings();
        return { ...this.getDefaultSettings(), ...JSON.parse(data) };
      } catch (error) {
        console.error("[Storage] Failed to get settings:", error);
        return this.getDefaultSettings();
      }
    }
    /**
     * 保存设置
     * @param {Object} settings
     */
    saveSettings(settings) {
      try {
        localStorage.setItem(this.settingsKey, JSON.stringify(settings));
        console.log("[Storage] Settings saved");
      } catch (error) {
        console.error("[Storage] Failed to save settings:", error);
      }
    }
    /**
     * 默认设置
     */
    getDefaultSettings() {
      return {
        theme: "dark-mysterious",
        // 氛围
        animationWeights: {
          // 动画类型权重
          prediction: 20,
          timetravel: 20,
          prank: 25,
          mystic: 20,
          badluck: 15
        },
        soundEnabled: false,
        // 音效
        apiKey: ""
        // API Key
      };
    }
  };
  var storageAdapter = new StorageAdapter();

  // js/app.js
  var WuliaoFortuneApp = class {
    constructor() {
      this.settings = storageAdapter.getSettings();
      this.currentFortune = null;
      this.init();
    }
    init() {
      this.applySettings();
      this.bindEvents();
      this.startClock();
      this.updateThemeSelector();
      document.getElementById("app").classList.add("show-settings");
      console.log("[App] Wuliao Fortune Box initialized");
    }
    applySettings() {
      document.documentElement.setAttribute("data-theme", this.settings.theme || "dark-mysterious");
    }
    bindEvents() {
      document.getElementById("drawBtn")?.addEventListener("click", () => this.handleDraw());
      document.getElementById("fortuneInput")?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.handleDraw();
      });
      document.getElementById("againBtn")?.addEventListener("click", () => {
        this.closeOverlay();
        document.getElementById("fortuneInput")?.focus();
      });
      document.getElementById("replayBtn")?.addEventListener("click", () => {
        if (this.currentFortune) this.playAnimation(this.currentFortune);
      });
      document.getElementById("historyBtn")?.addEventListener("click", () => this.openHistory());
      document.getElementById("historyClose")?.addEventListener("click", () => this.closeHistory());
      document.querySelectorAll(".theme-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const theme = btn.dataset.theme;
          document.documentElement.setAttribute("data-theme", theme);
          this.settings.theme = theme;
          storageAdapter.saveSettings(this.settings);
        });
      });
    }
    startClock() {
      const update = () => {
        const now = /* @__PURE__ */ new Date();
        const timeEl = document.getElementById("clockTime");
        const dateEl = document.getElementById("clockDate");
        if (timeEl) {
          timeEl.textContent = now.toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
          });
        }
        if (dateEl) {
          dateEl.textContent = now.toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric"
          });
        }
      };
      update();
      setInterval(update, 1e3);
    }
    updateThemeSelector() {
      document.querySelectorAll(".theme-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.theme === this.settings.theme);
      });
    }
    async handleDraw() {
      const input = document.getElementById("fortuneInput");
      const btn = document.getElementById("drawBtn");
      const inputSection = document.getElementById("inputSection");
      const loading = document.getElementById("loading");
      if (!input || !btn) return;
      const userInput = input.value.trim() || "\u547D\u8FD0\u7684\u968F\u673A\u6CE2\u52A8";
      btn.disabled = true;
      inputSection.style.display = "none";
      loading.classList.add("active");
      try {
        const generated = await fortuneGenerator.generate({
          userInput,
          style: this.settings.theme || "dark-mysterious",
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          randomSeed: Math.random().toString(36)
        });
        const animation = animationRegistry.routeByType(generated.type);
        this.currentFortune = new Fortune({
          input: userInput,
          style: this.settings.theme,
          generated,
          animationId: animation.id,
          animationModule: animation.name
        });
        storageAdapter.saveFortune(this.currentFortune);
        await this.playAnimation(this.currentFortune);
      } catch (error) {
        console.error("[App] Draw error:", error);
        alert("\u751F\u6210\u547D\u8FD0\u65F6\u51FA\u9519\u4E86\uFF0C\u8BF7\u91CD\u8BD5");
      } finally {
        btn.disabled = false;
        inputSection.style.display = "flex";
        loading.classList.remove("active");
      }
    }
    async playAnimation(fortune) {
      const overlay = document.getElementById("animationOverlay");
      const titleEl = document.getElementById("animationTitle");
      const textEl = document.getElementById("animationText");
      const canvas = document.getElementById("animationCanvas");
      if (!overlay) return;
      overlay.classList.add("active");
      if (titleEl) titleEl.textContent = fortune.generated?.title || "";
      if (textEl) textEl.textContent = fortune.generated?.text || "";
      if (canvas) canvas.innerHTML = "";
      const animation = animationRegistry.get(fortune.animationId) || animationRegistry.randomByType(fortune.generated?.type);
      await animation.render({
        fortune,
        container: canvas,
        onComplete: () => {
        }
      });
    }
    closeOverlay() {
      const overlay = document.getElementById("animationOverlay");
      if (overlay) overlay.classList.remove("active");
    }
    openHistory() {
      const panel = document.getElementById("historyPanel");
      const list = document.getElementById("historyList");
      if (!panel || !list) return;
      const history = storageAdapter.getHistory();
      if (history.length === 0) {
        list.innerHTML = '<div class="history-empty">\u8FD8\u6CA1\u6709\u62BD\u8FC7\u7B7E</div>';
      } else {
        list.innerHTML = history.slice(0, 20).map((f) => `
        <div class="history-item" data-id="${f.id}">
          <div class="history-item-time">${f.getFormattedTime()}</div>
          <div class="history-item-input">${f.input}</div>
          <div class="history-item-result">${f.generated?.title || ""}</div>
        </div>
      `).join("");
        list.querySelectorAll(".history-item").forEach((item) => {
          item.addEventListener("click", () => {
            const f = storageAdapter.getFortune(item.dataset.id);
            if (f) {
              this.closeHistory();
              this.currentFortune = f;
              this.playAnimation(f);
            }
          });
        });
      }
      panel.classList.add("open");
    }
    closeHistory() {
      const panel = document.getElementById("historyPanel");
      if (panel) panel.classList.remove("open");
    }
  };
  document.addEventListener("DOMContentLoaded", () => {
    window.app = new WuliaoFortuneApp();
  });
})();
//# sourceMappingURL=bundle.js.map
