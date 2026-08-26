#!/usr/bin/env node
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

function getAPIKey() {
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.openclaw/openclaw.json'), 'utf-8'));
    return cfg.mcp.servers.minimax.env.MINIMAX_API_KEY;
  } catch(e) { return ''; }
}

const PORT = 8080;
const API_KEY = getAPIKey();
const LOG_FILE = path.join(__dirname, 'logs', 'requests.jsonl');
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const log = (type, data) => {
  const entry = { t: new Date().toISOString(), type, ...data };
  fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
  console.log('[' + entry.t + '][' + type + ']', JSON.stringify(data));
};

// ===== MiniMax API Call =====
async function callMiniMax(prompt, maxTokens = 400) {
  const body = JSON.stringify({
    model: 'MiniMax-M3',
    max_tokens: maxTokens,
    temperature: 0.9,
    messages: [{ role: 'user', content: prompt }]
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.minimaxi.com',
      port: 443,
      path: '/anthropic/v1/messages',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) { reject(new Error(json.error.message || JSON.stringify(json.error))); return; }
          const raw = json.content;
          const txt = Array.isArray(raw) ? (raw[0] && raw[0].text || '') : (raw || '');
          resolve(txt);
        } catch(e) { reject(new Error('parse error: ' + data.slice(0, 100))); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ===== Type & Style Configs =====
const TYPE_CONFIG = {
  '职场': { emoji: '💼', gradient: '#1a2a4a,#2d4a6e' },
  '情感': { emoji: '💔', gradient: '#4a1a3a,#6e2d5e' },
  '金钱': { emoji: '💰', gradient: '#3a2a0a,#6e5a1a' },
  '健康': { emoji: '🏃', gradient: '#0a3a2a,#1a6e4a' },
  '家庭': { emoji: '🏠', gradient: '#2a1a3a,#4e2d6e' },
  '其他': { emoji: '🔮', gradient: '#1a0a2e,#2d1b4e' }
};

// ===== Pseudo-LangGraph Nodes =====

// Node 1: Classify intent
async function classifyIntent(userInput) {
  const prompt = '判断用户愿望属于哪个类别。只输出一个词：职场/情感/金钱/健康/家庭/其他。\n用户愿望：' + userInput;
  const result = (await callMiniMax(prompt, 30)).trim();
  const validTypes = ['职场', '情感', '金钱', '健康', '家庭'];
  return validTypes.includes(result) ? result : '其他';
}

// Node 2: Generate answer (the "good news" system notification)
async function generateAnswer(userInput, intentType) {
  const prompt = [
    '根据用户愿望，生成一条系统通知风格的好运消息。',
    '',
    '规则：',
    '- answer = 系统正式通知你"愿望已批准"',
    '- 语气：正式、笃定、像系统发通知',
    '- 长度：12-20字',
    '- 必须让用户感到"好运降临"',
    '',
    '直接输出answer文字，不要解释，不要引号，不要JSON。',
    '',
    '用户愿望：' + userInput
  ].join('\n');

  const result = (await callMiniMax(prompt, 80)).trim();
  return result.replace(/^["'""']|["'""']$/g, '');
}

// Node 3: Generate twist (the core punchline story)
async function generateTwist(userInput, answer, intentType) {
  const typeHints = {
    '职场': '职场、辞职、加班、工资、同事、老板场景',
    '情感': '恋爱、分手、相亲、婚姻、前任场景',
    '金钱': '赚钱、花钱、工资、彩票、理财、买房场景',
    '健康': '健身、减肥、看病、养生场景',
    '家庭': '买房、租房、家人、亲戚、父母场景',
    '其他': '日常生活各种场景'
  };

  const prompt = `生成一个抖音爆款反转段子，精准扎心。

用户愿望：${userInput}
系统批准：${answer}

要求：
- 总共2-4句话，不超过60个字
- 第1句：好运真的来了，具体可信（有人名/数字/道具）
- 最后1句：反转暴击，杀人诛心，是用户自己的问题造成的
- 禁止鸡汤、禁止"天道酬勤"、禁止时间词
- 禁止标注文字、禁止引号、禁止JSON

直接输出段子：`;

  const result = (await callMiniMax(prompt, 150)).trim();
  return result;
}

// Node 4: Score punchline
async function scorePunchline(explanation) {
  const prompt = [
    '对以下段子进行爆点评分（1-10分）。',
    '',
    '段子：' + explanation,
    '',
    '评分标准（每项2分，5项满分10分）：',
    '1. 反转力度：结局是否出人意料却又合理？',
    '2. 扎心程度：是否戳中当代人痛点？',
    '3. 具体程度：是否有具体人名/数字/场景？',
    '4. 可转发性：读完后是否想转发给朋友？',
    '5. 逻辑自洽：愿望→反转→落点是否通顺？',
    '',
    '输出格式（严格遵守）：',
    '分数：X',
    '理由：{一句话说明}'
  ].join('\n');

  const result = await callMiniMax(prompt, 80);
  const match = result.match(/分数[：:]([0-9]+)/);
  return match ? parseInt(match[1]) : 5;
}

// Node 5: Generate title
async function generateTitle(userInput, answer, explanation) {
  const prompt = [
    '根据以下内容，生成一个抖音封面风格的标题。',
    '',
    '用户愿望：' + userInput,
    '系统通知：' + answer,
    '段子：' + explanation.slice(0, 80),
    '',
    '要求：',
    '- 6-12字',
    '- 正向悬念感强',
    '- 能直接做短视频封面标题',
    '- 不要鸡汤或感叹词',
    '',
    '直接输出标题，不要引号，不要JSON。'
  ].join('\n');

  const result = (await callMiniMax(prompt, 60)).trim();
  return result.replace(/^["'""']|["'""']$/g, '').slice(0, 12);
}

// ===== Main Pseudo-LangGraph Pipeline =====
async function runFortuneGraph(userInput) {
  log('GRAPH', { step: 'start', input: userInput });

  // Node 1: Classify
  const intentType = await classifyIntent(userInput);
  log('GRAPH', { step: 'classify', result: intentType });

  // Node 2: Generate answer
  const answer = await generateAnswer(userInput, intentType);
  log('GRAPH', { step: 'answer', result: answer });

  // Node 3: Generate twist (with retry)
  let twist = '';
  let score = 0;
  for (let retry = 0; retry < 3; retry++) {
    twist = await generateTwist(userInput, answer, intentType);
    log('GRAPH', { step: 'twist_attempt', retry, twist: twist.slice(0, 50) });
    score = await scorePunchline(twist);
    log('GRAPH', { step: 'score', score });
    if (score >= 6) break;
  }

  // Node 4: Generate title
  const title = await generateTitle(userInput, answer, twist);
  log('GRAPH', { step: 'title', result: title });

  // Node 5: Format output
  const config = TYPE_CONFIG[intentType] || TYPE_CONFIG['其他'];

  return {
    title,
    answer,
    explanation: twist,
    emoji: config.emoji,
    bgGradient: config.gradient,
    type: 'revelation',
    mood: '逆天改命'
  };
}

// ===== Fallback (when API fails) =====
const FALLBACKS = [
  {
    title: '职场开挂 准点下班',
    answer: '系统已为你清除所有加班，直接永久下班',
    explanation: '改命系统执行：你的工位被清空了，所有个人物品被打包放在前台。HR说这是"优化"，补偿金够你撑3个月——够你找到下一份同样加班的工作。',
    emoji: '💼',
    bgGradient: '#1a2a4a,#2d4a6e',
    type: 'revelation',
    mood: '逆天改命'
  },
  {
    title: '心想事成 offer不断',
    answer: '系统已为你匹配到梦中情司，下周入职',
    explanation: '改命系统执行：你真的拿到了offer，薪资是你期望的两倍。入职第一天，你发现坐在你对面的面试官——正是你上家公司的HR，她是来交接你上家那个项目的。',
    emoji: '🎯',
    bgGradient: '#0f1c2e,#1a4a6e',
    type: 'revelation',
    mood: '逆天改命'
  },
  {
    title: '房东护体 躺赢租金',
    answer: '系统已为你的房产找到买家，净赚200万',
    explanation: '改命系统执行：真的有全款买家来签合同了，你刚签完字，对面那人看了一眼房产证——说这是他爸的名字。你这才知道，这套房从来不在你房东名下，是他爸留给他儿子的遗产。',
    emoji: '🏠',
    bgGradient: '#1a0a0a,#3d1a1a',
    type: 'revelation',
    mood: '逆天改命'
  }
];

function getFallback() {
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
}

// ===== 系统通知生成器（系统通知模式专用）=====
async function runSystemNotificationGraph(userInput, systemPrompt) {
  log('SN', { step: 'start', input: userInput });
  const prompt = systemPrompt || `你是一个「系统通知生成器」，生成一条玄学系统通知风格的反转文案。格式：{headline,result,items:[{icon,style,label,text}],footer,tip}。禁止鸡汤。\n用户愿望：${userInput}`;
  let raw;
  try {
    raw = await callMiniMax(prompt, 600);
    log('SN', { step: 'raw', raw: raw.slice(0, 80) });
  } catch(e) {
    log('SN', { step: 'error', msg: e.message });
    throw e;
  }
  // 提取JSON
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('AI返回非JSON：' + raw.slice(0, 100));
  const data = JSON.parse(m[0]);
  // 标准化items
  const iconMap = { ok: '✅', warn: '⚠️', info: 'ℹ️', neutral: 'ℹ️' };
  const styleMap = { ok: 'ok', warn: 'warn', info: 'info', neutral: 'neutral' };
  data.items = (data.items || []).slice(0, 6).map(i => ({
    icon: iconMap[i.style] || 'ℹ️',
    style: styleMap[i.style] || 'neutral',
    label: i.label || '通知',
    text: i.text || '',
  }));
  if (!data.headline) data.headline = '系统通知正在处理中...';
  if (!data.result) data.result = '处理完成。';
  if (!data.footer) data.footer = '如有疑问，请联系系统管理员。';
  if (!data.tip) data.tip = '本通知最终解释权归系统所有。';
  log('SN', { step: 'ok', headline: data.headline });
  return data;
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

function getSNFallback() { return SN_FALLBACKS[Math.floor(Math.random() * SN_FALLBACKS.length)]; }

// ===== 好友许愿生成器 =====
async function runFriendWishGraph(userInput) {
  const prompt = `你是一个「命运系统·好友许愿通道」的生成器。

严格按照以下格式输出，不要自由发挥：

【格式】
{"headline":"【命运系统·好友许愿通道已开启】","result":"您的愿望：${userInput}\n\n系统分析：\n优先想到朋友，而不是自己\n您的善良指数：超标\n您的好朋友获得：","items":[{"icon":"✅","style":"ok","label":"运势","text":"运势1"},{"icon":"✅","style":"ok","label":"运势","text":"运势2"},{"icon":"✅","style":"ok","label":"运势","text":"运势3"}],"footer":"作为系统\n我都觉得您对朋友太好了\n我相信您的朋友肯定会特别感激您\n哪怕是一杯奶茶一顿饭呢？\n您说呢？","tip":"@您的好朋友\n告诉他系统已为他开启"}

【运势池】（选3条）
- 财运涌入
- 意外之财降临
- 贵人运爆棚
- 颜值持续开挂
- 照镜子越看越满意
- 发朋友圈永远被点赞
- 好人缘爆棚
- 健康运开挂
- 学业运进步
- 桃花运爆棚

【铁律】
- 严格按格式输出，不要加任何额外文字
- 不要解释，不要标题，不要引号之外的内容
- 运势用运势池里的词，不要自己编
- result里把用户愿望原封不动放进去

直接输出JSON。`;

  log('FRIEND', { step: 'start', input: userInput });
  let raw;
  try {
    raw = await callMiniMax(prompt, 500);
    log('FRIEND', { step: 'raw', raw: raw.slice(0, 80) });
  } catch(e) {
    log('FRIEND', { step: 'error', msg: e.message });
    throw e;
  }
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('AI返回非JSON：' + raw.slice(0, 100));
  const data = JSON.parse(m[0]);
  const iconMap = { ok: '✅', warn: '⚠️', info: 'ℹ️', neutral: 'ℹ️' };
  const styleMap = { ok: 'ok', warn: 'warn', info: 'info', neutral: 'neutral' };
  data.items = (data.items || []).slice(0, 4).map(i => ({
    icon: iconMap[i.style] || '✅',
    style: styleMap[i.style] || 'ok',
    label: i.label || '运势',
    text: i.text || '',
  }));
  if (!data.headline) data.headline = '【命运系统 · 好友许愿通道已开启】';
  if (!data.result) data.result = '系统分析中...';
  if (!data.footer) data.footer = '作为系统，我相信您的朋友肯定会特别感激您。';
  if (!data.tip) data.tip = '@您的好朋友，告诉他系统已为他开启';
  log('FRIEND', { step: 'ok', headline: data.headline });
  return data;
}

const FRIEND_FALLBACKS = [
  {
    headline: '【命运系统·好友许愿通道已开启】',
    result: '您的愿望：想让好朋友发财\n\n系统分析：\n优先想到朋友，而不是自己\n您的善良指数：超标\n您的好朋友获得：',
    items: [
      { icon: '✅', style: 'ok', label: '运势', text: '财运涌入' },
      { icon: '✅', style: 'ok', label: '运势', text: '意外之财降临' },
      { icon: '✅', style: 'ok', label: '运势', text: '贵人运爆棚' },
    ],
    footer: '作为系统\n我都觉得您对朋友太好了\n朋友肯定会特别感激您\n哪怕是一杯奶茶一顿饭呢？\n您说呢？',
    tip: '现在就 @ 他',
    tipIcon: '👉',
  },
  {
    headline: '【命运系统·好友许愿通道已开启】',
    result: '您的愿望：想让闺蜜越来越美\n\n系统分析：\n她已经很美，但您还想要她更美\n您的闺蜜指数：满分\n您的好朋友获得：',
    items: [
      { icon: '✅', style: 'ok', label: '运势', text: '颜值持续开挂' },
      { icon: '✅', style: 'ok', label: '运势', text: '照镜子越看越满意' },
      { icon: '✅', style: 'ok', label: '运势', text: '发朋友圈永远被点赞' },
    ],
    footer: '作为系统\n我都觉得您对闺蜜太好了\n她肯定会特别感激您\n哪怕是一杯奶茶呢？\n您说呢？',
    tip: '现在就 @ 她',
    tipIcon: '👉',
  },
];

function getFriendFallback() { return FRIEND_FALLBACKS[Math.floor(Math.random() * FRIEND_FALLBACKS.length)]; }

// ===== HTTP Server =====
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon'
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let b = '';
    req.on('data', c => { b += c; });
    req.on('end', () => resolve(b));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, 'http://localhost:' + PORT);

  if (req.method === 'POST' && url.pathname === '/api/fortune') {
    try {
      const bd = await readBody(req);
      const { text, mode, systemPrompt } = JSON.parse(bd);
      const input = (text || 'random').trim();
      log('REQ', { text: input, mode });

      let result;
      if (mode === 'system-notification') {
        try {
          result = await runSystemNotificationGraph(input, systemPrompt);
        } catch(e) {
          result = getSNFallback();
          log('SN', { step: 'fallback', reason: e.message });
        }
      } else if (mode === 'friend-wish') {
        try {
          result = await runFriendWishGraph(input);
        } catch(e) {
          result = getFriendFallback();
          log('FRIEND', { step: 'fallback', reason: e.message });
        }
      } else {
        result = await runFortuneGraph(input);
      }

      log('OK', { text: input, mode, title: result.title || result.headline });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, data: result }));
    } catch(e) {
      log('ERR', { error: e.message });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
    return;
  }

  let fp = url.pathname === '/' ? '/index.html' : url.pathname;
  fp = path.join(__dirname, fp);
  if (!fp.startsWith(__dirname)) { res.writeHead(403); res.end('Forbidden'); return; }
  const ext = path.extname(fp);
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not Found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('v10 - 改命系统 LangGraph多节点流水线 (classify->answer->twist->score->title)');
  console.log('http://localhost:' + PORT + '/');
  console.log('http://192.168.31.186:' + PORT + '/');
});
