/**
 * 命运生成服务 v2
 * 抖音爆款反转段子生成器：「逆天改命」
 */
import { minimaxClient } from '../infrastructure/MinimaxClient.js';

const GRADIENT_PALETTE = [
  '#1a0a2e,#2d1b4e', // 深紫
  '#0f1c2e,#1a4a6e', // 深蓝
  '#1a0a0a,#3d1a1a', // 暗红
  '#0a1a0a,#1a3d1a', // 墨绿
  '#1a0a1a,#2d1b3d', // 深紫红
];

const EMOJI_POOL = ['💼', '💔', '🎯', '🔥', '⚡', '🎭', '💡', '🃏', '🔮', '📌'];

export class FortuneGenerator {
  constructor() {
    this.fallbackResults = [
      {
        title: '职场开挂 准点下班',
        answer: '从此面一路过，薪资直接翻倍',
        explanation: '系统帮你硬刚了所有下班临时会议，到点就能拎包走人。工作量半分没减，方案报表全得熬夜在家赶，顺便还帮公司省了电费。',
        emoji: '💼',
        bgGradient: '#1a0a2e,#2d1b4e'
      },
      {
        title: '心想事成 offer不断',
        answer: '面一路过 薪资翻倍',
        explanation: '你连过三面，薪资谈到了期望的两倍。入职第一天，发现面试官坐在你对面——他是来你这入职的。',
        emoji: '💼',
        bgGradient: '#0f1c2e,#1a4a6e'
      },
      {
        title: '房东护体 躺赢租金',
        answer: '找到买家 直接全款',
        explanation: '系统帮你匹配到全款买家。签合同那天，你发现这套房从来没在你名下——房东拿着房产证站在你对面，而那正是你爸的名字。',
        emoji: '🏠',
        bgGradient: '#1a0a0a,#3d1a1a'
      }
    ];
  }

  /**
   * @param {{ userInput: string, style: string, timestamp: string, randomSeed: string }} context
   * @returns {Promise<{title: string, answer: string, explanation: string, emoji: string, bgGradient: string}>}
   */
  async generate(context) {
    const { userInput, style, timestamp, randomSeed } = context;

    if (!minimaxClient.apiKey) {
      return this.getRandomFallback();
    }

    try {
      const result = await this.callAI({ userInput, style, timestamp, randomSeed });
      return this.validateResult(result);
    } catch (err) {
      console.error('[FortuneGenerator] AI error:', err);
      return this.getRandomFallback();
    }
  }

  async callAI(context) {
    const { userInput, style, timestamp, randomSeed } = context;

    const systemPrompt = `你是一个「逆天改命」反转段子生成器，专为抖音短视频/互动小程序生成整蛊搞笑内容。

【核心逻辑】
以一本正经的"改命宣判"口吻输出，先顺着用户"转运、翻盘、被好运眷顾"的心理拉满期待，最终给出出人意料却又情理之中的反转结局。

【结局类型】（随机选一种）
A. 扎心搞笑向：改命后反而更社死，更憋屈，精准戳中当代人日常痛点
B. 意外温情向：没实现预期的"大运"，却收获不起眼的小温暖

【风格调性】
- 强抖音传播节奏，短平快段子路线
- 落地职场、情感、生活等大众熟悉的日常场景
- 语言口语化有网感，禁止鸡汤、鼓励，禁止"天道酬勤""厚德载物"等话术
- 禁止"明天""后天"等时间词，禁止"系统预测"说法，用"通道""玄学"等概念引入

【输出格式】（严格JSON，每个字段必须有值）
{
  "title": "标题（6-12字，正向悬念，可直接做短视频封面标题）",
  "answer": "笃定式答案短句（12-20字，给用户制造"好运降临"的假象）",
  "explanation": "细节解释（50-70字，开头顺着answer拉期待，中后段突然反转，以扎心真相收尾）",
  "emoji": "单emoji（贴合主题，不超过2个字符）",
  "bgGradient": "渐变色值（如 \"#1a0a2e,#2d1b4e\"）"
}

【句式铁律】
- explanation 必须先制造假象（1-2句），再突然反转（1-2句），最后给一句收尾暴击
- answer 要让用户看到时产生"好运来了"的错觉
- explanation 最后一句必须是扎心真相，不能是感悟或鸡汤
- 场景必须具体（人名/地点/道具），不能抽象

【用户输入与生成内容的对应关系】
根据用户的真实诉求，自动识别其期望的"改命方向"，生成的 answer 必须顺着这个方向给出假象，explanation 必须在同一领域内反转，不能跑题。

【禁止清单】
✗ 禁止鸡汤：天道酬勤，厚德载物，一分耕耘一分收获
✗ 禁止时间词：明天，后天，下周，下个月
✗ 禁止"系统预测""AI分析""根据数据"等说法
✗ 禁止抽象总结，必须有具体人名/地点/道具`;

    const userMessage = `用户诉求: ${userInput}
氛围: ${style}`;

    const response = await minimaxClient.chat(systemPrompt, userMessage);

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Failed to parse AI response');
  }

  validateResult(result) {
    if (!result.title) result.title = '命运玄学';
    if (!result.answer) result.answer = '天机不可泄露';
    if (!result.explanation) result.explanation = '你信则有，不信则无。';
    if (!result.emoji) {
      result.emoji = EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
    }
    if (!result.bgGradient) {
      result.bgGradient = GRADIENT_PALETTE[Math.floor(Math.random() * GRADIENT_PALETTE.length)];
    }
    return result;
  }

  getRandomFallback() {
    const idx = Math.floor(Math.random() * this.fallbackResults.length);
    return { ...this.fallbackResults[idx] };
  }
}

export const fortuneGenerator = new FortuneGenerator();
