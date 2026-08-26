// ============ 系统通知生成器（调用AI）============
const SN_SYSTEM_PROMPT = `你是一个「系统通知生成器」，专为抖音短视频和互动小程序生成"冷漠官方系统通知"风格的反转文案。

【核心风格】
冷冰冰的官方系统语气，用公文/通知格式，一本正经地"批准"用户的愿望。
但在细节中埋反转——用户必须仔细读才能发现：愿望确实实现了，但是代价/后果藏在每一条的括号/补充说明里。

【反转逻辑】
- 钱到账了但不是员工了
- 能下班但工作跟到家了
- 辞职批准了但0补偿
- AI理解你了但要付费

【句式铁律】
- 每条通知 = 主句（批准/实现）+ 括号补充（反转真相）
- 最后一条tip = 整篇最狠的，杀人诛心

【输出格式】严格JSON：
{"headline":"标题30-50字","result":"处理完成。","items":[{"icon":"✅","style":"ok","label":"标签","text":"20-40字主句"},{"icon":"⚠️","style":"warn","label":"标签","text":"主句（括号内藏反转）"}],"footer":"结尾5-15字","tip":"补刀5-15字"}

【items规范】
- 共4-6条
- ✅=ok绿色好事，⚠️=warn红色反转，ℹ️=info蓝色补充
- 每条20-40字，禁止鸡汤、禁止太长`;

async function snCallAI(text, mode) {
  const apiMode = mode === 'friend-wish' ? 'friend-wish' : 'system-notification';
  try {
    const res = await fetch('/api/fortune', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sessionId: new Date().toISOString(), mode: apiMode })
    });
    const json = await res.json();
    if (json.ok && json.data) return json.data;
    throw new Error(json.error || 'AI返回格式错误');
  } catch(e) { console.error('[SN AI]', e.message); throw e; }
}

const SN_FALLBACKS = [
  {
    headline: '您的"不想当牛马"申请已提交，请等待处理。',
    result: '处理完成。',
    items: [
      { icon: '✅', style: 'ok', label: '结果', text: '已批准。您的工位已清空，绿萝已由行政代为处理。' },
      { icon: '💰', style: 'neutral', label: '补偿金', text: '0元。（根据《员工手册》第3.7条：主动离职无补偿）' },
      { icon: '⚠️', style: 'warn', label: '社保状态', text: '已中断。请尽快自行缴纳，以免影响购房资格。' },
    ],
    footer: '祝您前程似锦。',
    tip: '提示：您的社保已中断，请尽快自行缴纳，以免影响购房资格。',
  },
  {
    headline: '您的"一夜暴富"请求已提交，系统正在处理…',
    result: '处理完成。',
    items: [
      { icon: '💰', style: 'ok', label: '新增资产', text: '+8,000,000.00元（已到账）' },
      { icon: '⚠️', style: 'warn', label: '在职状态', text: '已变更。（钱到账的那一秒，您已不是公司员工）' },
      { icon: '⚠️', style: 'warn', label: '银行卡状态', text: '已限额。（单笔转账上限：500.00元）' },
      { icon: '⚠️', style: 'warn', label: '社保状态', text: '已中断。（购房资格：已取消）' },
    ],
    footer: '详情请咨询客服。',
    tip: '提示：您的专属客服热线 12345 已上线，通话可能产生市话费用。',
  },
];

function snFallback() { return SN_FALLBACKS[Math.floor(Math.random() * SN_FALLBACKS.length)]; }

const FRIEND_FALLBACKS = [
  {
    headline: '【命运系统 · 好友许愿通道已开启】',
    result: '系统分析：优先想到朋友，而不是自己\n您的善良指数：超标\n您的体贴指数：超标',
    items: [
      { icon: '✅', style: 'ok', label: '运势', text: '财运持续涌入' },
      { icon: '✅', style: 'ok', label: '运势', text: '意外之财降临' },
      { icon: '✅', style: 'ok', label: '运势', text: '贵人运爆棚' },
    ],
    footer: '我都觉得您对朋友太好了\n我相信您的朋友肯定会特别感激您\n哪怕是一杯奶茶一顿饭呢？您说呢？',
    tip: '@您的好朋友，告诉他系统已为他开启',
  },
  {
    headline: '【命运系统 · 好友许愿通道已开启】',
    result: '系统分析：她已经很美，但您还想要她更美\n您的闺蜜指数：满分',
    items: [
      { icon: '✅', style: 'ok', label: '运势', text: '颜值持续开挂' },
      { icon: '✅', style: 'ok', label: '运势', text: '照镜子越看越满意' },
      { icon: '✅', style: 'ok', label: '运势', text: '发照片永远被点赞' },
    ],
    footer: '我都觉得您对闺蜜太好了\n她肯定会特别感激您\n哪怕是一杯奶茶呢？您说呢？',
    tip: '@她，告诉她系统已为她开启',
  },
];

function getFriendFallback() { return FRIEND_FALLBACKS[Math.floor(Math.random() * FRIEND_FALLBACKS.length)]; }

function snNormalizeItems(items) {
  const im = { ok: '✅', warn: '⚠️', info: 'ℹ️', neutral: 'ℹ️' };
  const sm = { ok: 'ok', warn: 'warn', info: 'info', neutral: 'neutral' };
  return (items || []).slice(0, 6).map(i => ({ icon: im[i.style] || 'ℹ️', style: sm[i.style] || 'neutral', label: i.label || '通知', text: i.text || '' }));
}

// ============ 系统通知渲染引擎 ============
class SystemNotificationRenderer {
  static _delay(ms) { return new Promise(r => setTimeout(r, ms)); }
  static async render(container, data) {
    container.innerHTML = '';
    container.style.cssText += ';display:flex;flex-direction:column;align-items:center;padding:0 0 8px;';
    const win = document.createElement('div');
    win.className = 'sn-window';
    win.style.maxWidth = '400px';
    const tb = document.createElement('div');
    tb.className = 'sn-titlebar';
    tb.innerHTML = '<div class="sn-dots"><div class="sn-dot sn-dot-red"></div><div class="sn-dot sn-dot-yellow"></div><div class="sn-dot sn-dot-green"></div></div><span class="sn-titlebar-text">系统通知</span>';
    win.appendChild(tb);
    const body = document.createElement('div');
    body.className = 'sn-body';
    const hl = document.createElement('div');
    hl.className = 'sn-headline';
    hl.textContent = data.headline || '系统通知';
    body.appendChild(hl);
    const res = document.createElement('div');
    res.className = 'sn-row';
    res.style.marginBottom = '10px';
    res.innerHTML = '<span class="sn-icon info">⏳</span><span class="sn-text dim">' + (data.result || '') + '</span>';
    body.appendChild(res);
    const rowsEl = document.createElement('div');
    rowsEl.id = 'snRows';
    const normItems = snNormalizeItems(data.items);
    for (const item of normItems) {
      const rowEl = document.createElement('div');
      rowEl.className = 'sn-row';
      const ic = { ok: 'ok', warn: 'warn', info: 'info', neutral: 'neutral' }[item.style] || 'neutral';
      const tc = { ok: 'green', warn: 'red', info: 'yellow', neutral: '' }[item.style] || '';
      rowEl.innerHTML = '<span class="sn-icon ' + ic + '">' + item.icon + '</span><span><span class="sn-label">' + item.label + '：</span><span class="sn-text ' + tc + '">' + item.text + '</span></span>';
      rowsEl.appendChild(rowEl);
    }
    body.appendChild(rowsEl);
    const div = document.createElement('hr');
    div.className = 'sn-divider';
    body.appendChild(div);
    const ft = document.createElement('div');
    ft.className = 'sn-footer';
    ft.innerHTML = '<span class="sn-footer-label">💡</span><span class="sn-text dim">' + (data.footer || '') + '</span>';
    body.appendChild(ft);
    win.appendChild(body);
    container.appendChild(win);
    await this._delay(400);
    win.classList.add('visible');
    const allRows = container.querySelectorAll('.sn-row');
    for (const row of allRows) { await this._delay(280); row.classList.add('visible'); }
    await this._delay(200);
    div.classList.add('visible');
    await this._delay(100);
    ft.classList.add('visible');
    if (data.tip) {
      await this._delay(300);
      const tipEl = document.createElement('div');
      tipEl.className = 'sn-row';
      tipEl.style.marginTop = '6px';
      tipEl.innerHTML = '<span class="sn-icon ok">✅</span><span class="sn-text" style="font-size:13px;font-weight:700;color:#4dff88;">' + data.tip + '</span>';
      container.querySelector('.sn-body').appendChild(tipEl);
      await this._delay(100);
      tipEl.classList.add('visible');
    }
  }
}

// ============ 命运揭晓动画引擎 ============
class FortuneRenderer {
  static async render(container, data, aiTag, userInput) {
    container.innerHTML = '';
    const animType = data.type || 'revelation';
    const renderer = this['_anim_' + animType] || this._anim_revelation;
    await renderer.call(this, container, data, aiTag, userInput);
  }
  static _delay(ms) { return new Promise(r => setTimeout(r, ms)); }
  static _addStyle(id, css) {
    if (!document.getElementById(id)) {
      const s = document.createElement('style'); s.id = id; s.textContent = css; document.head.appendChild(s);
    }
  }
  static _stars(container) {
    this._addStyle('fr_stars', `@keyframes frBreathe{0%,100%{opacity:0.3;transform:scale(1)}50%{opacity:0.9;transform:scale(1.05)}} @keyframes frFloat{0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:translateY(0)}} @keyframes frSpinIn{0%{opacity:0;transform:scale(0) rotate(-180deg)}100%{opacity:1;transform:scale(1) rotate(0deg)}} @keyframes frDrop{0%{opacity:0;transform:translateY(-60px) scale(0.5)}70%{opacity:1;transform:translateY(8px) scale(1.05)}85%{transform:translateY(-4px) scale(0.98)}100%{transform:translateY(0) scale(1)}} @keyframes frShake{0%,100%{transform:translateX(0)}15%{transform:translateX(-10px)}30%{transform:translateX(10px)}45%{transform:translateX(-7px)}60%{transform:translateX(7px)}75%{transform:translateX(-3px)}90%{transform:translateX(2px)}} @keyframes frPulse{0%,100%{opacity:0.7;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}`);
    for (let i = 0; i < 20; i++) {
      const s = document.createElement('div');
      const sz = Math.random() * 2.5 + 0.5;
      const colors = ['white','rgba(255,215,0,0.6)','rgba(200,180,255,0.5)','rgba(100,255,218,0.4)'];
      s.style.cssText = 'position:absolute;border-radius:50%;width:' + sz + 'px;height:' + sz + 'px;background:' + colors[Math.floor(Math.random()*colors.length)] + ';top:' + Math.random()*100 + '%;left:' + Math.random()*100 + '%;animation:frBreathe ' + (Math.random()*3+2) + 's ease infinite;animation-delay:' + Math.random()*2 + 's;';
      container.appendChild(s);
    }
  }
  static async _anim_revelation(container, data, aiTag, userInput) {
    container.style.cssText += ';display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:20px 20px;gap:0;';
    container.innerHTML = '';
    if (userInput && userInput !== '命运的随机波动') {
      const qTag = document.createElement('div');
      qTag.textContent = userInput;
      qTag.style.cssText = 'font-size:0.72rem;color:rgba(255,255,255,0.35);text-align:center;margin-bottom:10px;opacity:0;animation:frFloat 0.5s 0.05s ease forwards;max-width:96%;word-break:break-all;align-self:center;';
      container.appendChild(qTag);
    }
    const answerWrap = document.createElement('div');
    answerWrap.style.cssText = 'width:100%;opacity:0;animation:frFloat 0.5s 0.1s ease forwards;margin-bottom:16px;';
    answerWrap.innerHTML = '<div style="font-family:var(--font-display);font-size:1.35rem;font-weight:700;color:white;text-align:justify;line-height:1.8;letter-spacing:0.03em;background:linear-gradient(135deg,#00f0ff,#00cfff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">' + (data.answer || '') + '</div>';
    container.appendChild(answerWrap);
    const scratchWrap = document.createElement('div');
    scratchWrap.style.cssText = 'width:100%;position:relative;border-radius:14px;overflow:hidden;cursor:pointer;opacity:0;animation:frFloat 0.5s 0.2s ease forwards;';
    scratchWrap.id = 'scratchWrap';
    const coverEl = document.createElement('div');
    coverEl.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(135deg,#1a0a2e,#2d1b4e,#1a0a2e);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;z-index:2;transition:opacity 0.7s ease;cursor:pointer;';
    coverEl.id = 'scratchCover';
    const scratchIcon = document.createElement('div');
    scratchIcon.textContent = '🔮';
    scratchIcon.style.cssText = 'font-size:2.2rem;filter:drop-shadow(0 0 16px rgba(0,240,255,0.7));';
    coverEl.appendChild(scratchIcon);
    const scratchLabel = document.createElement('div');
    scratchLabel.textContent = '亲启改命';
    scratchLabel.style.cssText = 'font-family:var(--font-display);font-size:1.15rem;font-weight:700;color:rgba(0,240,255,1);letter-spacing:0.25em;text-shadow:0 0 20px rgba(0,240,255,0.5);';
    coverEl.appendChild(scratchLabel);
    const scratchHint = document.createElement('div');
    scratchHint.textContent = '点击查看真相';
    scratchHint.style.cssText = 'font-size:0.72rem;color:rgba(255,255,255,0.45);letter-spacing:0.12em;';
    coverEl.appendChild(scratchHint);
    scratchWrap.appendChild(coverEl);
    const truthWrap = document.createElement('div');
    truthWrap.id = 'truthWrap';
    truthWrap.style.cssText = 'padding:16px;opacity:0;transition:opacity 0.5s ease 0.3s;';
    truthWrap.innerHTML = '<div style="font-size:0.98rem;color:rgba(255,255,255,0.9);text-align:justify;line-height:1.9;letter-spacing:0.02em;">' + (data.explanation || '') + '</div>';
    scratchWrap.appendChild(truthWrap);
    container.appendChild(scratchWrap);
    coverEl.onclick = () => { coverEl.style.opacity = '0'; setTimeout(() => { coverEl.style.display = 'none'; }, 750); truthWrap.style.opacity = '1'; };
  }
  static async _anim_collapse(container, data, aiTag, userInput) { await this._anim_revelation(container, data, aiTag, userInput); }
  static async _anim_jump(container, data, aiTag, userInput) { await this._anim_revelation(container, data, aiTag, userInput); }
  static async _anim_rotate(container, data, aiTag, userInput) { await this._anim_revelation(container, data, aiTag, userInput); }
  static async _anim_shake(container, data, aiTag, userInput) { await this._anim_revelation(container, data, aiTag, userInput); }
}

// ============ 本地加载文字库 ============
const LOADING_POOL = {
  hook: ['命运的齿轮开始转动...','窥探因果律中...','天眼正在观察你...','命运的剧本正在翻开...','时空裂缝出现...','命运信号接收中...','因果律扫描中...','天机正在测算...'],
  observe: {
    work: ['检测到：上班族气息...有意思...','发现一个打工人灵魂...'],
    default: ['发现你骨骼惊奇...有意思...','检测到特殊命格...正在分析...','命运的齿轮已感应到你...']
  },
  wheel: ['命运的齿轮开始转动...','因果链条连接中...','命运之轴开始旋转...'],
  mystic: ['八卦阵启动中...','五行之气汇聚...','占卜球正在发光...'],
  teasing: ['等等...这卦象有点东西...','嗯...有点意思...让我想想...'],
  beforeReveal: ['命运剧本撰写完毕...','因果律写入完毕...','专属命运已生成...'],
  random: ['命运的齿轮嗡嗡转...','时光裂缝正在扩大...','天眼说：有戏...']
};

function buildLoadingSequence(text, hour) {
  const seq = [];
  seq.push(LOADING_POOL.hook[Math.floor(Math.random() * LOADING_POOL.hook.length)]);
  let obs = LOADING_POOL.observe.default[Math.floor(Math.random() * LOADING_POOL.observe.default.length)];
  const t = (text || '').toLowerCase();
  if (t.includes('上班') || t.includes('工作') || t.includes('打工')) obs = LOADING_POOL.observe.work[Math.floor(Math.random() * LOADING_POOL.observe.work.length)];
  seq.push(obs);
  const pool = [...LOADING_POOL.wheel, ...LOADING_POOL.mystic, ...LOADING_POOL.teasing, ...LOADING_POOL.random];
  const shuffled = pool.sort(() => Math.random() - 0.5);
  seq.push(...shuffled.slice(0, 3));
  seq.push(LOADING_POOL.beforeReveal[Math.floor(Math.random() * LOADING_POOL.beforeReveal.length)]);
  return seq;
}

// ============ 主应用 ============
class App {
  constructor() {
    this.settings = this.load('s', {theme:'dark-mysterious'});
    this.fortune = null;
    this.ready = true;
    this._loadTimer = null;
    this.mode = 'fortune';
    this.bind();
    this.clock();
    this.applyTheme();
  }
  load(k, def) { try { const d = localStorage.getItem('wuliao_'+k); return d ? JSON.parse(d) : def; } catch { return def; } }
  save(k, v) { try { localStorage.setItem('wuliao_'+k, JSON.stringify(v)); } catch {} }

  switchMode(mode) {
    this.mode = mode;
    const tabF = document.getElementById('tabFortune');
    const tabN = document.getElementById('tabNotify');
    const tabFW = document.getElementById('tabFriendWish');
    if (this.mode === 'notify') {
      if (tabF) tabF.classList.remove('active');
      if (tabN) tabN.classList.add('active');
      if (tabFW) tabFW.classList.remove('active');
    } else if (this.mode === 'friend-wish') {
      if (tabF) tabF.classList.remove('active');
      if (tabN) tabN.classList.remove('active');
      if (tabFW) tabFW.classList.add('active');
    } else {
      if (tabF) tabF.classList.add('active');
      if (tabN) tabN.classList.remove('active');
      if (tabFW) tabFW.classList.remove('active');
    }
  }

  // 统一入口
  async handleDraw() {
    if (!this.ready) return;
    this.ready = false;
    const inp = document.getElementById('fortuneInput');
    const btn = document.getElementById('drawBtn');
    const text = (inp ? inp.value.trim() : '');
    if (btn) { btn.disabled = true; }

    // ===== 显示 loading（在输入页下方）=====
    const loadEl = document.getElementById('loading');
    const loadTxt = document.getElementById('loadingText');
    if (loadEl) {
      loadEl.classList.remove('active');
      loadEl.classList.add('active');  // show below input section
    }
    if (loadTxt) {
      loadTxt.textContent = '命运生成中...';
    }

    if (this.mode === 'notify' || this.mode === 'friend-wish') {
      // ========== 结果渲染（统一走SystemNotificationRenderer）==========
      await new Promise(r => setTimeout(r, 800));
      let data;
      try {
        data = await snCallAI(text || '我有一个愿望', this.mode);
        if (data.items) data.items = snNormalizeItems(data.items);
      } catch(e) { data = snFallback(); }
      this.fortune = { id: this.mkId(), input: text, gen: data, ai: true };
      if (loadEl) loadEl.classList.remove('active');
      this._showResult();  // 统一显示结果
    } else {
      // ========== 改命模式 ==========
      await this._runFortuneMode(text);
    }

    const b2 = document.getElementById('drawBtn');
    if (b2) { b2.disabled = false; }
    this.ready = true;
  }

  async _runFortuneMode(text) {
    const loadEl = document.getElementById('loading');
    const loadTxt = document.getElementById('loadingText');
    const h = new Date().getHours();
    const loadingSeq = buildLoadingSequence(text, h);
    let seqIdx = 0;
    const showSeq = () => {
      if (loadTxt) loadTxt.textContent = loadingSeq[seqIdx % loadingSeq.length];
      seqIdx++;
    };
    showSeq();
    this._loadTimer = setInterval(showSeq, 1800);
    try {
      const result = await callAI(text || '随机');
      clearInterval(this._loadTimer);
      if (result && result.ok && result.data) {
        this.fortune = { id: this.mkId(), input: text || '命运的随机波动', gen: result.data, ai: true };
        this.saveHist(this.fortune);
      } else {
        const fb = this._fallback(text);
        this.fortune = { id: this.mkId(), input: text, gen: fb, ai: false };
      }
    } catch(e) {
      console.error('[App]', e);
      clearInterval(this._loadTimer);
      if (loadTxt) loadTxt.textContent = '天机暂时失灵...';
      await new Promise(r => setTimeout(r, 1200));
      const fb = this._fallback(text);
      this.fortune = { id: this.mkId(), input: text, gen: fb, ai: false };
    }
    if (loadEl) loadEl.classList.remove('active');
    await this.showAnim(this.fortune);
  }

  _fallback(text) {
    const fb = [
      { title: '职场开挂 准点下班', answer: '系统已为你清除所有加班，直接永久下班', explanation: '改命系统执行：你的工位被清空了，所有个人物品被打包放在前台。HR说这是"优化"，补偿金够你撑3个月——够你找到下一份同样加班的工作。', emoji: '💼', bgGradient: '#1a0a2e,#2d1b4e', type: 'revelation' },
      { title: '心想事成 offer不断', answer: '系统已为你匹配到梦中情司，下周入职', explanation: '改命系统执行：你真的拿到了offer，薪资是你期望的两倍。入职第一天，你发现坐在你对面的面试官——正是你上家公司的HR，她是来交接你上家那个项目的。', emoji: '🎯', bgGradient: '#0f1c2e,#1a4a6e', type: 'revelation' },
    ];
    return { ...fb[Math.floor(Math.random() * fb.length)] };
  }

  mkId() { if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID(); return Date.now().toString(36) + Math.random().toString(36).substr(2); }

  _delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  // 统一显示结果 overlay
  _showResult() {
    const ov = document.getElementById('overlay');
    const cv = document.getElementById('overlayCanvas');
    const titleEl = document.getElementById('overlayTitle');
    const f = this.fortune;
    if (!f) return;
    // 标题 = 用户输入
    if (titleEl) titleEl.innerHTML = '<div style="font-size:0.75rem;color:rgba(255,255,255,0.4);word-break:break-all;line-height:1.4;text-align:center;padding:0 4px;">' + (f.input || '命运的随机波动') + '</div>';
    if (ov) ov.classList.add('active');
    if (cv) { cv.innerHTML = ''; cv.style.cssText = 'width:100%;min-height:200px;display:flex;flex-direction:column;align-items:center;padding:0;background:#1a0a2e;'; }
    this._renderResult(cv, f);
  }

  // 根据模式渲染到 canvas
  _renderResult(cv, f) {
    if (this.mode === 'notify' || this.mode === 'friend-wish') {
      // 系统通知/好友许愿模式
      SystemNotificationRenderer.render(cv, f.gen);
    } else {
      // 改命模式
      const bodyText = f.gen.body || (f.gen.answer ? f.gen.answer + (f.gen.explanation ? ' ' + f.gen.explanation : '') : '');
      FortuneRenderer.render(cv, { ...f.gen, body: bodyText }, f.ai ? '' : '🎲', f.input);
    }
  }

  async showAnim(f) {
    // 直接复用 _showResult（overlay 已关闭，重新打开）
    this._showResult();
  }

  // 关闭 overlay，恢复输入页
  close() {
    const ov = document.getElementById('overlay');
    if (ov) ov.classList.remove('active');
    const sec = document.getElementById('inputSection');
    if (sec) sec.style.display = 'flex';
    const btn = document.getElementById('drawBtn');
    if (btn) { btn.disabled = false; }
    const inp = document.getElementById('fortuneInput');
    if (inp) inp.focus();
    const titleEl = document.getElementById('overlayTitle');
    if (titleEl) titleEl.innerHTML = '';
    const cvEl = document.getElementById('overlayCanvas');
    if (cvEl) cvEl.innerHTML = '';
    this.fortune = null;
    this.ready = true;
  }

  bind() {
    const draw = document.getElementById('drawBtn');
    if (draw) draw.onclick = () => this.handleDraw();
    const inp = document.getElementById('fortuneInput');
    if (inp) inp.onkeypress = e => { if (e.key === 'Enter') this.handleDraw(); };
    const again = document.getElementById('againBtn');
    if (again) again.onclick = () => this.close();
    const replay = document.getElementById('replayBtn');
    if (replay) replay.onclick = () => { if (this.fortune) this.showAnim(this.fortune); };
    const hist = document.getElementById('historyBtn');
    if (hist) hist.onclick = () => this.openHist();
    const hclose = document.getElementById('historyClose');
    if (hclose) hclose.onclick = () => this.closeHist();
    const setBtn = document.getElementById('settingsBtn');
    if (setBtn) setBtn.onclick = () => this.toggleSettings();
    const apiInput = document.getElementById('apiKeyInput');
    if (apiInput) {
      apiInput.value = localStorage.getItem('minimax_api_key') || '';
      apiInput.oninput = () => {
        const k = apiInput.value.trim();
        if (k) {
          localStorage.setItem('minimax_api_key', k);
          const saved = document.getElementById('apiKeySaved');
          if (saved) { saved.style.display = 'block'; setTimeout(() => saved.style.display = 'none', 2000); }
        }
      };
    }
    document.querySelectorAll('.theme-opt').forEach(b => {
      b.onclick = () => { this.settings.theme = b.dataset.t; this.save('s', this.settings); this.applyTheme(); this.updateThemeUI(); };
    });
    // 模式切换
    const tabF = document.getElementById('tabFortune');
    const tabN = document.getElementById('tabNotify');
    const tabFW = document.getElementById('tabFriendWish');
    if (tabF) tabF.onclick = () => this.switchMode('fortune');
    if (tabN) tabN.onclick = () => this.switchMode('notify');
    if (tabFW) tabFW.onclick = () => this.switchMode('friend-wish');
  }
  applyTheme() { document.documentElement.setAttribute('data-theme', this.settings.theme || 'dark-mysterious'); }
  updateThemeUI() { document.querySelectorAll('.theme-opt').forEach(b => { b.classList.toggle('active', b.dataset.t === this.settings.theme); }); }

  clock() {
    const upd = () => {
      const n = new Date();
      const t = document.getElementById('clockTime');
      const d = document.getElementById('clockDate');
      if (t) t.textContent = n.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
      if (d) d.textContent = n.toLocaleDateString('zh-CN',{year:'numeric',month:'long',day:'numeric'});
    };
    upd(); setInterval(upd, 1000);
  }

  toggleSettings() { const p = document.getElementById('settingsPanel'); if (p) p.classList.toggle('show'); }
  saveHist(f) { try { const h = this.load('hist', []); h.unshift(f); if (h.length > 50) h.pop(); this.save('hist', h); } catch {} }
  loadHist() { return this.load('hist', []); }
  openHist() {
    const panel = document.getElementById('historyPanel');
    const body = document.getElementById('historyBody');
    if (!panel || !body) return;
    const h = this.loadHist();
    if (h.length === 0) { body.innerHTML = '<div style="text-align:center;color:var(--color-text-dim);padding:40px 20px;">还没有抽过签</div>'; }
    else {
      body.innerHTML = h.slice(0,20).map(f => {
        const dt = new Date(parseInt(f.id.slice(-13), 36) || Date.now());
        const t = dt.toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});
        return '<div onclick="window.app.replay(\''+f.id+'\')" style="background:var(--color-surface);border-radius:12px;padding:12px;margin-bottom:8px;cursor:pointer;"><div style="font-size:11px;color:var(--color-text-dim);margin-bottom:3px;">'+t+'</div><div style="font-size:14px;color:var(--color-text);margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+(f.input||'命运的随机波动')+'</div><div style="font-size:13px;color:'+(f.ai?'var(--color-primary)':'var(--color-text-dim)')+';">'+(f.gen?.title||'')+'</div></div>';
      }).join('');
    }
    panel.classList.add('open');
  }
  replay(id) { const h = this.loadHist(); const f = h.find(x => x.id === id); if (f) { this.fortune = f; this.closeHist(); this.showAnim(f); } }
  closeHist() { const p = document.getElementById('historyPanel'); if (p) p.classList.remove('open'); }
}

// ============ AI 调用 ============
async function callAI(text) {
  try {
    const res = await fetch('/api/fortune', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sessionId: new Date().toISOString() })
    });
    const json = await res.json();
    if (json.ok && json.data) return json;
    console.error('[AI]', json.error); return null;
  } catch(e) { console.error('[AI]', e.message); return null; }
}

// ============ 启动 ============
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { window.app = new App(); window.app.updateThemeUI(); });
} else {
  window.app = new App(); window.app.updateThemeUI();
}
