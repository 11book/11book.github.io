# 职场生存法则 — 项目汇总

> 最后更新：2026-09-18

## 已完成词条

| # | 词语 | 拼音 | 主题配色 | HTML 链接 | 视频路径 | 状态 |
|---|------|------|---------|-----------|---------|------|
| 1 | 大家畅所欲言 | changsuoyanyu | theme-1 开会现场（深蓝+金） | https://11book.github.io/wuliao-tools/tools/biz-speak/scenes/changsuoyanyu.html | videos/changsuoyanyu.mp4 | ✅ |
| 2 | 简单补充两句 | jiandanhong | theme-1 开会现场（深蓝+金） | https://11book.github.io/wuliao-tools/tools/biz-speak/scenes/jiandanhong.html | videos/jiandanhong.mp4 | ✅ |
| 3 | 对接一下 | duijieyixia | theme-2 汇报沟通（绿黑） | https://11book.github.io/wuliao-tools/tools/biz-speak/scenes/duijieyixia.html | videos/duijieyixia.mp4 | ✅ |
| 4 | 弹性工作制 | dongxingongzuo | theme-3 绩效谈薪（红金） | https://11book.github.io/wuliao-tools/tools/biz-speak/scenes/dongxingongzuo.html | videos/dongxingongzuo.mp4 | ✅ |
| 5 | 人员优化 | renyuanyouhua | theme-4 优化前兆（黄黑警示） | https://11book.github.io/wuliao-tools/tools/biz-speak/scenes/renyuanyouhua.html | videos/renyuanyouhua.mp4 | ✅ |
| 6 | 拉通对齐 | latongduiqi | theme-5 跨部门协作（红蓝） | https://11book.github.io/wuliao-tools/tools/biz-speak/scenes/latongduiqi.html | videos/latongduiqi.mp4 | ✅ |
| 7 | 方案已读 | fanganyidu | theme-6 客户对接（蓝绿商务） | https://11book.github.io/wuliao-tools/tools/biz-speak/scenes/fanganyidu.html | videos/fanganyidu.mp4 | ✅ |
| 8 | 格局要大 | gejuyaoa | theme-7 领导相处（紫色） | https://11book.github.io/wuliao-tools/tools/biz-speak/scenes/gejuyaoa.html | videos/gejuyaoa.mp4 | ✅ |

## 主题配色说明

| 主题 | 配色 | 适用场景 |
|------|------|---------|
| theme-1 | 深蓝 + 金 | 开会现场 |
| theme-2 | 绿黑 | 汇报沟通 |
| theme-3 | 红金 | 绩效谈薪 |
| theme-4 | 黄黑警示 | 优化前兆 |
| theme-5 | 红蓝 | 跨部门协作 |
| theme-6 | 蓝绿商务 | 客户对接 |
| theme-7 | 紫色 | 领导相处 |

## 文件目录

```
biz-speak/
├── scenes/          # HTML 文件（上传 GitHub）
│   ├── changsuoyanyu.html
│   ├── jiandanhong.html
│   └── ...
├── videos/         # MP4 文件（本地，不上传 GitHub）
│   ├── changsuoyanyu.mp4
│   └── ...
└── README.md       # 本文件
```

## 制作流程

1. 大哥给词 → AI 分析主题配色 → 生成 HTML
2. 推 GitHub Pages → 返回 HTML 链接
3. exporter.py 导出 MP4 → 本地 videos/ 目录
4. 更新本文件（每次做完都要同步）

## 规范

- HTML 布局：旧版（flexbox + position:fixed，简单可靠）
- 揭示按钮：点击后变灰不可点击，文字保留
- 视频：1080×1920，30fps，crf15，不上传 GitHub
- 视频打包分享：需要时说"打包"
