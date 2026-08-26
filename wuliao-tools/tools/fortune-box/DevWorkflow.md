# 无厘头盲盒卜卦生成器 · LangGraph 开发流程

> **版本**：v1.0 | **日期**：2026-08-21 | **专题**：017-无厘头实验室

---

## 一、流程总览（LangGraph State Machine）

```
                                    ┌─────────────┐
                                    │   START     │
                                    │  开始开发   │
                                    └──────┬──────┘
                                           │
                                    ┌──────▼──────┐
                                    │  PLAN       │
                                    │  任务规划   │
                                    │  输出TODO   │
                                    └──────┬──────┘
                                           │
                         ┌─────────────────┼─────────────────┐
                         │                 │                 │
                  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
                  │  CSS风格开发 │  │  动画模块   │  │  AI生成逻辑 │
                  │  (4种氛围)   │  │  开发       │  │  开发       │
                  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
                         │                 │                 │
                         └─────────────────┼─────────────────┘
                                           │
                                    ┌──────▼──────┐
                                    │  INTEGRATE  │
                                    │  集成联调   │
                                    └──────┬──────┘
                                           │
                         ┌─────────────────┼─────────────────┐
                         │                 │                 │
                  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
                  │ 单元测试    │  │ 质量审查    │  │ 演示验证   │
                  │ 覆盖核心逻辑 │  │ 符合SPEC    │  │ 实际运行   │
                  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
                         │                 │                 │
                         └─────────────────┼─────────────────┘
                                           │
                                    ┌──────▼──────┐
                              ┌─────│   GATE      │
                              │YES  │  质量门禁   │◄──┐
                              │     └──────┬──────┘   │
                              │            │ NO        │
                              │     ┌──────▼──────┐   │
                              │     │   FIX       │───┘
                              │     │  修复问题   │
                              │     └─────────────┘
                              │
                         ┌────▼─────┐
                         │  DELIVER  │
                         │  交付发布 │
                         └───────────┘
```

---

## 二、节点定义

### 2.1 START
**输入**：大哥确认开发
**输出**：创建开发分支
**动作**：
```bash
cd ~/Documents/baize-workspace/10-topics/017-wuliao-lab/outputs/wuliao-fortune-box
git checkout -b feature/wuliao-fortune-box-v1
```

---

### 2.2 PLAN
**输入**：SPEC.md
**输出**：结构化TODO清单
**动作**：
```
根据 SPEC.md 生成 Phase1 MVP 的 TODO：

TODO.md:
- [ ] 创建项目骨架（目录结构 + package.json）
- [ ] 实现 CSS 变量系统（variables.css）
- [ ] 实现暗黑神秘风格（dark-mysterious.css）
- [ ] 实现赛博朋克风格（cyberpunk.css）
- [ ] 实现日式神社风格（japanese-shrine.css）
- [ ] 实现中式玄学风格（chinese-mystic.css）
- [ ] 实现动画注册表（registry.js）
- [ ] 实现预知类动画 x2（prediction/）
- [ ] 实现穿越类动画 x2（timetravel/）
- [ ] 实现整蛊类动画 x2（prank/）
- [ ] 实现玄学类动画 x2（mystic/）
- [ ] 实现坏签类动画 x1（badluck/）
- [ ] 实现 AI 生成服务（FortuneGenerator.js）
- [ ] 实现存储适配器（StorageAdapter.js）
- [ ] 实现展示模式页面（index.html）
- [ ] 联调测试（全部动画跑一遍）
- [ ] 质量审查（对照SPEC）
- [ ] 演示验证（截图/录屏）
```

---

### 2.3 CSS风格开发
**输入**：SPEC.md 第三节（4种风格定义）
**输出**：4个CSS文件 + variables.css
**质量标准**：
- [ ] 每个风格有明确的 CSS 变量定义
- [ ] 风格切换只改 `data-theme` 属性
- [ ] 时钟动画适配每种风格
- [ ] 响应式（移动端可用）

**交付物**：
- `css/variables.css`
- `css/dark-mysterious.css`
- `css/cyberpunk.css`
- `css/japanese-shrine.css`
- `css/chinese-mystic.css`

---

### 2.4 动画模块开发
**输入**：SPEC.md 第四节（5类动画定义）
**输出**：每类至少1个动画模块，共8个以上
**质量标准**：
- [ ] 每个模块符合 AnimationModule 接口
- [ ] 动画时长 3-8 秒
- [ ] 有明确的「意外」效果
- [ ] 可配置参数映射到 `params`

**交付物**（`js/animations/`）：
```
registry.js          # 注册表
prediction/
  sneeze.js         # 预知-喷嚏预言
  earthquake.js     # 预知-地震预警（假）
timetravel/
  mom_call.js       # 穿越-你妈叫你吃饭
  flashback.js      # 穿越-时光倒流
prank/
  fake_bsod.js      # 整蛊-假蓝屏
  countdown_trick.js # 整蛊-倒计时反转
mystic/
  coin_divine.js    # 玄学-铜钱摇卦
 签文展开.js        # 玄学-签文动画
badluck/
  today_not_good.js # 坏签-今日不宜
```

---

### 2.5 AI生成逻辑开发
**输入**：SPEC.md 第五节（AI生成协议）
**输出**：`FortuneGenerator.js` + `MinimaxClient.js`
**质量标准**：
- [ ] Prompt 包含时间戳+随机种子
- [ ] 返回结构严格校验
- [ ] 失败降级（hardcode fallback）
- [ ] 支持模拟模式（无需真实API）

**Prompt 示例**：
```
当前时间: {timestamp}
用户输入: {user_input}
随机种子: {random_seed}
风格: {style}

你是一个无厘头卜卦大师，根据用户输入生成一个出奇制胜的卜卦结果。
必须出人意料，不能平庸。

返回严格JSON格式...
```

---

### 2.6 INTEGRATE（集成联调）
**输入**：所有模块
**输出**：`index.html` 可运行
**联调清单**：
- [ ] 风格切换正常
- [ ] 抽签流程跑通（输入→AI→动画→保存）
- [ ] 动画播放正常（8个全测）
- [ ] localStorage 存储正常
- [ ] 页面响应式

---

### 2.7 质量门禁（GATE）
**输入**：联调结果
**判断逻辑**：
```
IF 单元测试通过
   AND 质量审查通过（对照SPEC）
   AND 演示验证通过
THEN → DELIVER
ELSE → FIX（问题节点）
```

---

## 三、状态定义

```javascript
state = {
  current_node: "START" | "PLAN" | "CSS" | "ANIMATIONS" | "AI" | "INTEGRATE" | "GATE" | "FIX" | "DELIVER",
  todo_list: string[],
  completed: string[],
  issues: string[],
  artifacts: {
    css_done: boolean,
    animations_done: number,  // 计数
    ai_done: boolean,
    integrate_done: boolean
  },
  gate_result: "pending" | "pass" | "fail"
}
```

---

## 四、执行规则

1. **按顺序执行**：START → PLAN → CSS → ANIMATIONS → AI → INTEGRATE → GATE
2. **GATE失败则跳回FIX**：FIX修复后重新过GATE
3. **每个节点必须有交付物**：不能跳步
4. **大哥验收**：每个phase完成后截图/录屏给大哥确认
5. **Git提交**：每个节点完成后提交，保持历史可追溯

---

## 五、Phase 1 任务分配

| 节点 | 执行者 | 预计时间 |
|------|--------|---------|
| START | 老虾 | 5min |
| PLAN | 老虾 | 10min |
| CSS风格 | 老虾 | 1h |
| 动画模块 | 老虾 | 2h |
| AI生成 | 老虾 | 1h |
| INTEGRATE | 老虾 | 1h |
| GATE | 老虾 + 大哥 | 30min |

**总计 Phase 1**：约 5.5 小时（可分多次完成）
