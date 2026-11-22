# 🎬 Auteur Studio | 灵感制片厂

> **面向代码展示与算法教学的 AI 视频创作引擎** — 基于 **HyperFrames + Shiki + GSAP + Agent Loop + 火山 V3 字级时间戳**，将自然语言主题或自有源码一键转化为可预览、可微调、可导出的 16:9 / 9:16 高清技术讲解视频。

---

## ✨ 核心能力

| 能力 | 描述 |
| :--- | :--- |
| 🧩 **`CodeStage`（代码演进舞台）** | 面向语法基础、API 教学与代码重构：构建期 **Shiki AST 语法高亮** + **行级 LCS Diff（Magic Move 平滑位移）** + 局部行聚光灯 + 悬浮批注卡 + 模拟终端输出 |
| 🧮 **`AlgoStage`（算法沙箱动画）** | **Code-as-Truth**：在隔离 `vm` 沙箱中真实运行算法代码产出确定性 `ExecutionTrace`（零 LLM 脑算幻觉），左侧执行光标 `▶` + 右上数据结构 SVG 动画 + 右下 `VARIABLES WATCH` 变更变量高亮 |
| 📊 **5 大数据结构可视化原语** | 原生支持 `array`（含比例柱条、多指针自动错位与 `swappedPair` 弧线互换）、`linked-list`（含弧形反转边）、`tree`（自动层次布局）、`matrix`（DP 填表与状态转移箭头）、`stack-queue`（栈 / 队列 / 调用栈） |
| ⚡ **双轨创作：AI 模板 + 免 AI 参数模板** | 默认 **新建视频（AI）** 支持「输入主题 → 选 7 套视频模板 → 模板快速 1 轮 / Agent Loop 3 轮自检」；另有 **免 AI 参数模板**，0 Token 修改数组/目标值/链表节点/DP 网格 1 秒沙箱直出 |
| 🎬 **片头 Hook / 结尾 CTA / BGM 自动避让** | 原生支持 2.5s 片头卡片、3.0s 结尾核心要点总结页，以及内置科技感循环 BGM（支持旁白响起时 GSAP Auto-Ducking 自动压低音量与上传自定义音频） |
| 🔁 **双 Agent Loop 自修复闭环** | 自动串联 `LLM 生成 → Schema/预算门禁 → 沙箱执行（AlgoStage） → HyperFrames 编译 → hyperframes lint/inspect`，失败时将精准诊断或运行时堆栈回传模型自动修复 |
| 🎙️ **火山 V3 配音与逐词字幕** | 集成火山引擎 Seed TTS V3（`enable_subtitle: true`），实测音频时长自动重排时间轴，支持逐词高亮字幕与浏览器有声实时预览 |
| 📝 **自有源码拆解 & 步骤微调** | 支持直接粘贴或上传本地源码文件（`.ts/.py/.go/.rs/.java/.cpp` 等）拆解成教学视频；支持在工坊中按步骤修改代码/聚焦行/旁白并毫秒级无损重编译 |
| 📱 **16:9 / 9:16 一键切换** | 同一份脚本与配音支持一键切换横屏（1920×1080，B 站/YouTube）与竖屏（1080×1920，抖音/小红书/视频号）自适应排版 |
| 🎨 **全站 Dracula + 5 套舞台主题** | 默认经典 Dracula 紫粉暗夜主题，内置 `Dracula`、`Tokyo Night`、`GitHub Dark`、`Catppuccin Mocha`、`One Dark Pro` 5 套整套舞台色板 |
| 🚀 **持久化异步渲染队列** | 后台异步调用 `hyperframes render` 导出 1080p MP4，实时进度轮询并持久化至磁盘，刷新页面不丢任务 |

---

## 🏗️ 系统架构

```text
用户输入（主题 / 粘贴或上传自有源码 / 免 AI 参数模板）
  │
  ▼
Next.js 16 Studio (/code-studio · /export · /library · /templates · /settings)
  │
  ├── 免 AI 参数模板 (/api/stage-template/create) ──▶ 0 Token 1 秒沙箱/样板直出
  │
  ├── CodeStage（模板快速 1 轮 / Agent Loop）──▶ Zod/版面语义门禁 ──▶ Shiki + LCS Diff ──▶ HyperFrames 编译 & lint
  │
  └── AlgoStage（模板快速 1 轮 / Agent Loop）──▶ 隔离 vm 沙箱真跑出 Trace ──▶ Trace 校验 ──▶ SVG/GSAP 三屏联动编译 & lint
                                        │
                                        ▼
                       片头 Hook + 结尾 CTA + Auto-Ducking BGM 包装
                       火山引擎 V3 TTS（真实 MP3 + 字级时间戳对齐）
                                        │
                                        ▼
                 浏览器 16:9 / 9:16 有声实时预览 + 步骤微调重编译
                                        │
                                        ▼
                 持久化异步渲染队列 (/api/stage-render) ──▶ public/renders/*.mp4
```

---

## 🛠️ 技术栈

- **框架**：Next.js 16 (App Router + Turbopack) + React 19 + TypeScript 5 + Tailwind CSS 4
- **视频渲染引擎**：HyperFrames (`0.8.x`) + GSAP (`3.14.x`)
- **语法高亮**：Shiki (`4.x`，构建期静态 Token 化，零运行时依赖)
- **AI 编排**：Vercel AI SDK (`ai` + `@ai-sdk/openai`) + Zod 4（兼容 DeepSeek / OpenAI 接口）
- **语音与字幕**：火山引擎 Seed TTS V3（单向流 + 字级时间戳）+ `ffprobe` 精确测时
- **测试**：Node 内置 `node:test` + `tsx`

---

## 📁 核心目录结构

```text
AuteurStudio/
├── src/
│   ├── code-stage/                   # CodeStage 语法/代码演进引擎
│   │   ├── schema.ts                 #   CodeStageSpec Zod 契约（支持 16:9 / 9:16）
│   │   ├── diff.ts                   #   行级 LCS Diff（Magic Move 位移映射）
│   │   ├── highlighter.ts            #   Shiki 构建期语法高亮
│   │   ├── stage-themes.ts           #   5 套舞台主题色板（默认 Dracula）
│   │   ├── builder.ts                #   HyperFrames HTML/CSS/GSAP 确定性编译器
│   │   ├── prompt.ts                 #   教学脚本与定向修复 Prompt
│   │   ├── validator.ts              #   版面语义门禁 + HyperFrames CLI 校验器
│   │   ├── agent.ts                  #   多轮自检修复 Agent Loop
│   │   ├── volcengine-tts-v3.ts      #   火山 V3 单向流 TTS + 字级时间戳解析
│   │   ├── packaging.ts              #   片头 Hook / 结尾 CTA / Auto-Ducking BGM 包装系统
│   │   └── demos/python-decorator.ts #   内置 Python 装饰器样片
│   ├── algo-stage/                   # AlgoStage 算法沙箱动画引擎
│   │   ├── schema.ts                 #   ExecutionTrace 协议（5 大数据结构）
│   │   ├── sandbox.ts                #   Node vm 安全沙箱执行器（超时/步数熔断）
│   │   ├── renderers.ts              #   array / linked-list / tree / matrix / stack-queue SVG 渲染器
│   │   ├── builder.ts                #   三屏联动 HyperFrames 编译器（含 Swap 弧线动画）
│   │   ├── prompt.ts & agent.ts      #   沙箱驱动自修复 Agent Loop
│   │   └── demos/                    #   内置二分查找 & 单链表反转样片
│   ├── lib/
│   │   ├── stage-projects.ts         #   HyperFrames 工程扫描
│   │   ├── stage-template-catalog.ts #   免 AI 参数模板目录（前端安全元数据）
│   │   ├── stage-templates.ts        #   参数化模板服务端沙箱与编译引擎
│   │   ├── stage-tts.ts              #   统一配音与字级时间戳重编服务
│   │   ├── stage-settings.ts         #   持久化偏好配置与环境变量状态检测
│   │   └── render-jobs.ts            #   持久化异步 MP4 渲染队列
│   ├── components/code-studio/       # 前端工坊核心组件
│   │   ├── CodeStudioClient.tsx      #   主创作台（双轨新建 / 源码上传 / 画幅切换 / 轨迹日志）
│   │   ├── StagePlayer.tsx           #   16:9 / 9:16 有声实时播放器与步骤跳转轨道
│   │   ├── StepEditorDrawer.tsx      #   步骤可视化微调与毫秒级重编译面板
│   │   └── PackagingPanel.tsx        #   片头 Hook / 结尾 CTA / BGM 自动避让配置抽屉
│   └── app/
│       ├── (app)/
│       │   ├── code-studio/          #   代码工坊（主创作台）
│       │   ├── export/               #   异步导出与渲染队列中心
│       │   ├── library/              #   HyperFrames 工程与 MP4 成片媒体库
│       │   ├── templates/            #   5 套舞台配色主题中心
│       │   └── settings/             #   偏好设置与模型/语音服务检测
│       └── api/
│           ├── code-stage/generate/  #   CodeStage Agent Loop 生成接口
│           ├── algo-stage/generate/  #   AlgoStage 沙箱 Agent Loop 生成接口
│           ├── stage-projects/       #   工程列表查询
│           ├── stage-preview/[...path]/ # 安全静态预览与音画同步桥接
│           ├── stage-spec/           #   Spec 读取与毫秒级无损重编译
│           ├── stage-audio/          #   内置 BGM 列表与自定义 BGM 上传
│           ├── stage-template/create/#   免 AI 参数模板秒级编译生成
│           ├── stage-tts/            #   一键火山 V3 配音合成
│           ├── stage-render/         #   异步 MP4 渲染任务 CRUD
│           ├── stage-library/        #   工程与 MP4 成片管理
│           └── stage-settings/       #   偏好设置持久化
├── scripts/
│   ├── code-stage/                   # CodeStage CLI 构建与生成脚本
│   └── algo-stage/                   # AlgoStage CLI 构建与生成脚本
├── hyperframes/                      # 构建产出的离线 HyperFrames 工程与任务记录
├── public/renders/                   # 导出的高清 MP4 成片
└── todo.md                           # 后续迭代计划（片头/片尾/BGM 与实战审片）
```

---

## 🚀 快速开始

### 1. 环境要求
- **Node.js** >= 22
- **FFmpeg / ffprobe**（用于音频精准测时与视频渲染）
- **Google Chrome / Chromium**（HyperFrames 本地校验与渲染）

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
在项目根目录创建 `.env.local`：
```bash
# LLM（二选一：默认优先使用 DeepSeek，也支持任意 OpenAI 兼容接口）
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
# OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
# OPENAI_BASE_URL=https://api.openai.com/v1
# OPENAI_MODEL=gpt-4o-mini

# 火山引擎 Seed TTS V3（可选，不配置可正常生成无声视频）
VOLC_TTS_API_KEY=your_volc_v3_api_key
VOLC_TTS_RESOURCE_ID=seed-tts-2.0
VOLC_TTS_SPEAKER=zh_female_vv_uranus_bigtts
```

### 4. 构建内置演示样片（可选，无需 API Key）
```bash
npm run code-stage:build
npm run algo-stage:build -- --demo binary-search
npm run algo-stage:build -- --demo reverse-linked-list
```

### 5. 启动 Web 创作台
```bash
npm run dev
```
打开浏览器访问 **[http://localhost:3000/code-studio](http://localhost:3000/code-studio)**：
- **新建视频（AI）**：输入任意语法/重构/算法主题（可粘贴或上传自有源码）→ 选择 7 套视频模板 → 选择「模板快速生成（1 轮）」或「Agent Loop 自检（3 轮）」一键生成；
- **免 AI 参数模板**：无需 LLM API Key，修改数组、目标值、链表节点或 DP 网格行列，1 秒本地沙箱生成算法动画或代码样板；
- **实时预览与包装**：支持 16:9 / 9:16 一键切换、「片头 / BGM」包装、「微调步骤」、「一键配音 / 重新配音」与「导出高清 MP4」。

---

## ⌨️ CLI 与测试命令

```bash
# 运行全部单元测试（CodeStage 10 项 + AlgoStage 8 项 + 模板库 6 套）
npm run test:code-stage && npm run test:algo-stage && npx tsx --test src/lib/stage-templates.test.ts

# CLI 一键生成语法演进视频（支持 --with-tts 与 --inspect）
npm run code-stage:gen -- "TypeScript 泛型入门" --lang typescript --with-tts

# CLI 一键生成算法沙箱动画（支持 array / linked-list / tree / matrix / stack-queue）
npm run algo-stage:gen -- "滑动窗口求最长无重复子串" --structure array --with-tts

# 生产构建
npm run build
```

---

## 🗺️ 后续计划

详见 [todo.md](./todo.md)（端到端实战审片与视觉调优等）。

## 📄 License

MIT
