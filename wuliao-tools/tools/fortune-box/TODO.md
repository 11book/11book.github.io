# 无厘头盲盒卜卦生成器 · Phase 1 TODO

> **版本**：v1.0 | **目标**：MVP最小可行版本

## 项目骨架
- [x] 创建目录结构 ✅
- [x] `index.html` 展示模式页面 ✅

## CSS 风格系统
- [x] `css/variables.css`（CSS变量定义）✅
- [x] 4种氛围通过 data-theme 切换 ✅

## 动画模块（共9个）✅

### 预知类
- [x] `prediction/sneeze.js`（喷嚏预言）✅
- [x] `prediction/earthquake.js`（地震预警-假）✅

### 穿越类
- [x] `timetravel/mom_call.js`（你妈叫你吃饭）✅
- [x] `timetravel/flashback.js`（时光倒流）✅

### 整蛊类
- [x] `prank/fake_bsod.js`（假蓝屏）✅
- [x] `prank/countdown_trick.js`（倒计时反转）✅

### 玄学类
- [x] `mystic/coin_divine.js`（铜钱摇卦）✅
- [x] `mystic/签文展开.js`（签文展开动画）✅

### 坏签类
- [x] `badluck/today_not_good.js`（今日不宜）✅

### 核心
- [x] `js/animations/registry.js`（动画注册表）✅

## AI 生成
- [x] `js/infrastructure/MinimaxClient.js` ✅
- [x] `js/services/FortuneGenerator.js` ✅

## 存储
- [x] `js/infrastructure/StorageAdapter.js` ✅

## 主应用
- [x] `js/domain/Fortune.js` ✅
- [x] `js/domain/Animation.js` ✅
- [x] `js/app.js` ✅

## 页面
- [x] `index.html`（展示模式）✅

## 联调验证
- [ ] 全部9个动画跑通
- [ ] 风格切换正常
- [ ] 存储正常
- [ ] 大哥验收

---

**完成时间**：2026-08-21
**实际耗时**：约30分钟
**状态**：核心功能开发完成，待联调验证

---

## Phase 2：系统通知模式（v2.0）
- [x] `css/system-notify.css`（系统通知样式）✅ 2026-08-25
- [x] `js/services/SystemNotificationGenerator.js`（AI生成服务，可独立调用）✅ 2026-08-25
- [x] `js/app.js`（模式切换 + 渲染引擎）✅ 2026-08-25
- [x] `index.html`（模式切换移至设置面板）✅ 2026-08-25
- [x] `server.cjs`（新增系统通知API路由）✅ 2026-08-25
- [ ] 联调验证（大哥验收）

