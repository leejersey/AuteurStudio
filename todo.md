# Auteur Studio Todo

## 1. 成片完整包装：开场 Hook + 结尾总结页 + 自动 BGM 混音
- [ ] **片头 Hook（2.5s）**：为 `CodeStage` 和 `AlgoStage` 增加自动开场标题页（大标题 + 副标题 + 语言/复杂度徽标 + Dracula/主题色动效入场）
- [ ] **结尾总结页（3.0s）**：自动提炼本条视频 3 条核心要点 + 点赞/收藏/关注 CTA 卡片
- [ ] **自动 BGM 混音**：支持挂载 `public/audio/bgm-tech-01.wav` 等背景音乐，人声出现时自动 ducking 压低音量，首尾平滑淡入淡出
- [ ] **UI 开关**：在 `/code-studio` 左侧提供「片头/片尾包装」与「背景音乐」独立开关

## 2. 实战端到端审片与调优
- [ ] 在 `.env.local` 配置 `DEEPSEEK_API_KEY`（或兼容的 OpenAI API Key）
- [ ] 在 `/code-studio` 用真实 LLM 生成 1 条语法演进视频（`CodeStage`）与 1 条算法沙箱动画（`AlgoStage`，如 DP 矩阵或单调栈）
- [ ] 启用火山 V3 语音配音与字级字幕同步，导出 1080p 横屏（16:9）与竖屏（9:16）MP4 成片
- [ ] 根据真实成片观感微调动画节奏、字号比例与字幕换行策略
