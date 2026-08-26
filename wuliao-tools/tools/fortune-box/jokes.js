/**
 * 段子灵感库 - 基于真实高赞段子匹配
 * 用户输入 → 分析场景/痛点 → 匹配最佳段子 → 作为AI生成素材
 */

const fs = require('fs');
const path = require('path');

let JOKES_DB = null;

function loadJokes() {
  if (JOKES_DB) return JOKES_DB;
  const dbPath = path.join(__dirname, 'jokes.json');
  try {
    if (fs.existsSync(dbPath)) {
      JOKES_DB = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      console.log(`[jokes] Loaded ${JOKES_DB.length} jokes`);
    } else {
      JOKES_DB = [];
      console.log('[jokes] jokes.json not found, using empty database');
    }
  } catch(e) {
    console.error('[jokes] Load error:', e.message);
    JOKES_DB = [];
  }
  return JOKES_DB;
}

/**
 * 分析用户输入，返回场景和痛点关键词
 */
function analyzeInput(text) {
  const t = text.toLowerCase();
  const scenes = [];
  const pains = [];
  const tags = [];

  // 场景识别
  const sceneMap = {
    '职场': ['上班', '工作', '加班', '辞职', '跳槽', '老板', '同事', '开会', '甲方', 'KPI', '绩效', '年终', '请假', '打工', '面试', 'offer'],
    '恋爱': ['喜欢', '恋爱', '表白', '分手', '前任', '暧昧', '相亲', '约会', '追', '桃花', '暗恋', '女神', '男神', '结婚', '单身'],
    '金钱': ['钱', '发财', '赚钱', '存款', '花呗', '信用卡', '负债', '贫穷', '月光', '工资', '加薪', '财务', '投资', '彩票', '破产'],
    '生活': ['吃饭', '外卖', '租房', '搬家', '减肥', '健身', '睡眠', '健康', '看病', '旅行', '网购', '快递'],
    '社交': ['朋友', '聚会', '社死', '社恐', '随份子', '随礼', '红包'],
    '家庭': ['爸妈', '父母', '亲戚', '催婚', '相亲', '回家', '过年', '催生'],
    '健康': ['减肥', '健身', '熬夜', '失眠', '累', '生病', '头发']
  };

  for (const [scene, keywords] of Object.entries(sceneMap)) {
    for (const kw of keywords) {
      if (t.includes(kw)) {
        if (!scenes.includes(scene)) scenes.push(scene);
        break;
      }
    }
  }

  // 痛点识别
  const painMap = {
    '加班': ['加班', '996', '熬夜', '通宵', '累', '困'],
    '单身': ['单身', '暗恋', '喜欢', '表白', '追', '恋爱', '暧昧', '相亲'],
    '贫穷': ['没钱', '花呗', '信用卡', '负债', '月光', '穷', '存款', '工资', '发财', '赚钱'],
    '减肥': ['减肥', '胖', '健身', '瘦', '体重'],
    '租房': ['租房', '房租', '搬家', '房东'],
    '相亲': ['相亲', '催婚', '父母', '亲戚', '催生'],
    '社死': ['社死', '尴尬', '丢人', '出糗'],
    '内卷': ['卷', '竞争', '绩效', 'KPI'],
    '健康': ['累', '困', '失眠', '熬夜', '头发', '生病']
  };

  for (const [pain, keywords] of Object.entries(painMap)) {
    for (const kw of keywords) {
      if (t.includes(kw)) {
        if (!pains.includes(pain)) pains.push(pain);
        break;
      }
    }
  }

  // 标签匹配
  const tagWords = {
    '花呗': ['花呗', '借呗', '信用卡', '分期'],
    '外卖': ['外卖', '快递', '吃饭'],
    '相亲': ['相亲', '催婚', '家长'],
    '打工人': ['上班', '加班', '老板', '同事'],
    '社死': ['社死', '尴尬'],
    '鸡汤': ['加油', '努力', '奋斗']
  };

  for (const [tag, keywords] of Object.entries(tagWords)) {
    for (const kw of keywords) {
      if (t.includes(kw)) {
        if (!tags.includes(tag)) tags.push(tag);
        break;
      }
    }
  }

  // 默认
  if (scenes.length === 0) scenes.push('生活');
  if (pains.length === 0) pains.push('贫穷');

  return { scenes, pains, tags };
}

/**
 * 打分函数：段子与用户输入的匹配度
 */
function scoreJoke(joke, scenes, pains, tags) {
  let score = 0;

  // 场景匹配
  for (const s of scenes) {
    if (joke.scene === s) score += 3;
  }

  // 痛点匹配
  for (const p of pains) {
    if (joke.pain === p) score += 4;
  }

  // 标签匹配
  for (const tag of tags) {
    if (joke.tags && joke.tags.some(t => t.includes(tag) || tag.includes(t))) {
      score += 2;
    }
  }

  // 点赞加成
  if (joke.likes && joke.likes > 1000) score += 1;

  // 反转型加分
  if (joke.type === '反转' || joke.type === '神转折') score += 2;

  return score;
}

/**
 * 搜索最匹配的N条段子
 */
function searchJokes(text, limit = 5) {
  const db = loadJokes();
  if (db.length === 0) return [];

  const { scenes, pains, tags } = analyzeInput(text);

  const scored = db.map(j => ({
    joke: j,
    score: scoreJoke(j, scenes, pains, tags)
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(s => s.joke);
}

/**
 * 直接提取段子的反转结构，作为AI生成模板
 * 格式：[场景] [铺垫] → [反转结果]
 */
function formatInspiration(jokes, userInput) {
  if (!jokes || jokes.length === 0) return '';

  // 取最匹配的那条，直接作为结构模板
  const best = jokes[0];

  // 提取段子的核心结构（铺垫→反转）
  const text = best.text;
  // 找常见的反转关键词位置
  const reversal_signs = ['结果', '但是', '没想到', '其实', '只是', '没想到', '没想到', '于是', '然后'];
  let structure = '';

  // 简化：直接把段子结构给AI看
  const template = `
【结构模板参考】（直接套用这个反转结构，换场景和细节）
核心套路：${text}
→ 用同样结构生成一个关于「${userInput}」的段子
→ 铺垫要正经/正向 → 反转要出乎意料又真实可信`;

  return template;
}

module.exports = { loadJokes, analyzeInput, searchJokes, formatInspiration };
