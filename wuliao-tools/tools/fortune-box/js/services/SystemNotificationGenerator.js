/**
 * 系统通知生成服务 v2.0
 * 「逆天改命」工具 · 系统通知模式
 * 用户输入愿望 → AI 生成系统通知内容（冷漠公文 + 隐藏反转）
 *
 * 2026-08-25 老虾 + 大哥
 */
import { minimaxClient } from '../infrastructure/MinimaxClient.js';

const ICONS = { ok: '✅', warn: '⚠️', info: 'ℹ️', neutral: 'ℹ️' };
const STYLES = { ok: 'ok', warn: 'warn', info: 'info', neutral: 'neutral' };

export class SystemNotificationGenerator {
  constructor() {
    this.initialized = false;
  }

  /**
   * AI 生成系统通知内容
   * @param {string} userInput - 用户输入的愿望
   * @param {string} style - 氛围风格（保留，可扩展）
   */
  async generate(userInput, style = 'dark-mysterious') {
    if (minimaxClient.apiKey) {
      try {
        return await this._generateAI(userInput, style);
      } catch (err) {
        console.error('[SNGenerator] AI failed, using fallback:', err);
      }
    }
    return this._fallback(userInput);
  }

  async _generateAI(userInput, style) {
    const systemPrompt = `你是一个「系统通知生成器」，专为抖音短视频和互动小程序生成"冷漠官方系统通知"风格的反转文案。

【核心风格】
冷冰冰的官方系统语气，用公文/通知格式，一本正经地"批准"用户的愿望。
但在细节中埋反转——用户必须仔细读才能发现：愿望确实实现了，但是代价/后果藏在每一条的括号/补充说明里。

【反转逻辑】
用户的愿望被"批准"了，但代价藏在细节中。反转精准戳中当代打工人痛点：
- 钱到账了但不是员工了
- 能下班但工作跟到家了
- 辞职批准了但0补偿
- AI理解你了但要付费

【句式铁律】
- 每条通知 = 主句（批准/实现）+ 括号补充（反转真相）
- 括号里的反转 = 具体、可信、有共鸣
- 最后一条tip = 整篇最狠的，杀人诛心

【输出格式】严格JSON，不要任何额外文字：
{
  "headline": "系统通知标题（30-50字，描述正在处理用户的XX申请）",
  "result": "处理完成。",
  "items": [
    {"icon": "✅", "style": "ok", "label": "标签", "text": "主句内容"},
    {"icon": "⚠️", "style": "warn", "label": "标签", "text": "主句内容（括号内藏反转）"}
  ],
  "footer": "结尾语（冷漠官方，5-15字）",
  "tip": "最后补刀（5-15字，杀人诛心）"
}

【items规范】
- 共4-6条
- 第1条：好消息/批准结果（icon: ✅, style: ok）
- 中间2-3条：中性或混合（icon: ⚠️, style: warn/info）
- 最后1-2条：反转/补充说明（icon: ⚠️, style: warn）
- 每条text控制在20-40字

【icon映射】
- icon=✅ style=ok：好事/批准（绿色）
- icon=⚠️ style=warn：反转/警告（红色）
- icon=ℹ️ style=info：补充说明（蓝色）
- icon=ℹ️ style=neutral：中性提示（灰色）

【禁止清单】
✗ 禁止鸡汤：天道酬勤、加油、你是最棒的
✗ 禁止太长：单条text不超过40字
✗ 禁止抽象：必须有人名/金额/日期/具体场景`;

    const userMessage = `用户愿望：${userInput}
氛围风格：${style}`;

    const response = await minimaxClient.chat(systemPrompt, userMessage);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in AI response');

    const data = JSON.parse(jsonMatch[0]);
    return this._normalize(data);
  }

  _normalize(data) {
    // 确保结构完整
    if (!data.headline) data.headline = '系统通知正在处理中...';
    if (!data.result) data.result = '处理完成。';
    if (!data.items || !Array.isArray(data.items)) {
      data.items = [
        { icon: '✅', style: 'ok', label: '结果', text: '已批准。' },
        { icon: '⚠️', style: 'warn', label: '补充', text: '详见下方说明。' },
      ];
    }
    if (!data.footer) data.footer = '如有疑问，请联系系统管理员。';
    if (!data.tip) data.tip = '本通知最终解释权归系统所有。';

    // 清理每条数据
    data.items = data.items.slice(0, 6).map(item => ({
      icon: ICONS[item.style] || ICONS.neutral,
      style: STYLES[item.style] || 'neutral',
      label: item.label || '通知',
      text: item.text || '',
    }));

    return data;
  }

  // 无AI时的本地兜底（随机选一个）
  _fallback(userInput) {
    const fallbacks = [
      {
        headline: `您的"不想当牛马"申请已提交，请等待处理。`,
        result: '处理完成。',
        items: [
          { icon: '✅', style: 'ok', label: '结果', text: '已批准。您的工位已清空，绿萝已由行政代为处理。' },
          { icon: '💰', style: 'neutral', label: '补偿金', text: '0元。（根据《员工手册》第3.7条：主动离职无补偿）' },
          { icon: '📋', style: 'neutral', label: '离职证明', text: '已开具，备注栏写着"个人原因"。' },
          { icon: '⚠️', style: 'warn', label: '社保状态', text: '已中断。请尽快自行缴纳，以免影响购房资格。' },
        ],
        footer: '祝您前程似锦。',
        tip: '提示：您的社保已中断，请尽快自行缴纳，以免影响购房资格。',
      },
      {
        headline: `您的"一夜暴富"请求已提交，系统正在处理…`,
        result: '处理完成。',
        items: [
          { icon: '💰', style: 'ok', label: '新增资产', text: '+8,000,000.00元（已到账）' },
          { icon: '💳', style: 'ok', label: '到账卡片', text: '您原工资卡（开户行：总行）' },
          { icon: '⚠️', style: 'warn', label: '在职状态', text: '已离职。（钱到账的那一秒，您已不是公司员工）' },
          { icon: '⚠️', style: 'warn', label: '银行卡状态', text: '已限额。（单笔转账上限：500.00元）' },
          { icon: '⚠️', style: 'warn', label: '社保状态', text: '已中断。（购房资格：已取消）' },
        ],
        footer: '详情请咨询客服。',
        tip: '提示：您的专属客服热线 12345 已上线，通话可能产生市话费用。',
      },
    ];

    const result = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    result.userInput = userInput;
    return result;
  }
}

export const systemNotificationGenerator = new SystemNotificationGenerator();
