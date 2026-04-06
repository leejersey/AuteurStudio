# 🎬 灵感制片厂 | Auteur Studio

> **AI 驱动的自动化视频生成 Agent** — 通过自然语言对话或 Markdown 输入，一键生成图文卡片、算法动画、知识讲解和技术教程视频。

## ✨ 项目简介

灵感制片厂（Auteur Studio）是一个 AI 视频自动化创作平台，将 **LLM 结构化内容生成**、**Remotion 程序化视频渲染** 和 **TTS 语音合成** 整合为端到端的创作工作流。用户只需在对话界面输入创意描述或粘贴 Markdown，AI Agent 即可自动编排内容结构、渲染视频画面并合成配音。

### 核心能力

| 能力 | 描述 |
|------|------|
| 🤖 **AI 对话驱动** | 通过 DeepSeek LLM 将自然语言转化为结构化视频数据 |
| 🎴 **图文卡片视频** | 自动生成 9:16 竖屏社交媒体视频，支持标题、列表、对比、步骤等 6 种幻灯片模板 |
| 🧮 **算法可视化视频** | 自动生成 16:9 横屏算法教学视频，支持网格动画、逐步演示、代码高亮 |
| 📚 **知识讲解视频** | 自动生成 16:9 横屏科普视频，支持分段标题和摘要式排版 |
| 📝 **Markdown 视频** | 直接粘贴 Markdown 生成 16:9 技术教程视频，支持代码语法高亮 |
| 🎨 **多模板系统** | 可切换视频风格模板（暗黑科技 / 极简白色），基于注册表架构可扩展 |
| 🎛️ **模板参数化配置** | 支持通过可视化面板实时调整颜色、字体、动画等模板参数 |
| 🔊 **TTS 语音合成** | 集成火山引擎大模型语音，支持多种中文音色与语速调节 |
| 🖼️ **智能配图** | 集成 Unsplash API，根据内容自动搜索匹配配图 |
| 🎥 **实时预览 & 导出** | Remotion Player 实时预览，服务端渲染导出 MP4 |

## 🏗️ 系统架构

```
用户对话输入 / Markdown 粘贴
    │
    ▼
┌───────────────────────────────────────────────────────┐
│  Next.js Frontend (App Router)                        │
│  ┌───────────┐ ┌──────────┐ ┌───────────────────────┐ │
│  │ Studio    │ │ Library  │ │ Templates / Settings  │ │
│  │ (创作台)  │ │ (媒体库) │ │ (模板/设置中心)       │ │
│  └─────┬─────┘ └──────────┘ └───────────────────────┘ │
│        │                                              │
│        ▼                                              │
│  ┌──────────────┐   ┌──────────────────────────────┐  │
│  │  API Routes   │   │  Remotion Engine             │  │
│  │  /api/workflow │──▶│  CardVideo    AlgoVideo     │  │
│  │  /api/render  │   │  KnowledgeVideo              │  │
│  │  /api/tts     │   │  MarkdownVideo               │  │
│  │               │   │  Template Registry            │  │
│  └──────┬───────┘   └──────────────────────────────┘  │
│         │                                             │
└─────────┼─────────────────────────────────────────────┘
          │
    ┌─────┼──────────────────────────────────┐
    │     │                                  │
    ▼     ▼                    ▼             ▼
┌──────────────┐ ┌───────────────┐ ┌───────────────┐
│ DeepSeek API │ │ 火山引擎 TTS  │ │  PostgreSQL   │
│ (内容生成)   │ │ (语音合成)    │ │  (数据持久化) │
└──────────────┘ └───────────────┘ └───────────────┘
```

## 🛠️ 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| **框架** | Next.js (App Router + Turbopack) | 16.x |
| **语言** | TypeScript | 5.x |
| **视频引擎** | Remotion (Player + Renderer + Bundler) | 4.0.x |
| **数据库** | PostgreSQL | 16.x |
| **ORM** | Drizzle ORM + drizzle-kit | 0.45.x |
| **AI SDK** | Vercel AI SDK + @ai-sdk/openai | 6.x |
| **LLM** | DeepSeek Chat (OpenAI-compatible) | — |
| **搜索增强** | Tavily Search (联网调研) | — |
| **配图服务** | Unsplash API (智能配图) | — |
| **TTS** | 火山引擎大模型语音 (Volcengine TTS) | V1 |
| **数据校验** | Zod | 4.x |
| **样式** | Tailwind CSS | 4.x |
| **中文字体** | @remotion/google-fonts (Noto Sans SC) + @fontsource | — |
| **西文字体** | Inter + Space Grotesk + Material Symbols | — |

## 📁 项目结构

```
AiVideo/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── globals.css             # 全局样式 & Design Tokens
│   │   ├── (marketing)/            # 落地页路由组
│   │   ├── (auth)/                 # 登录/注册路由组（预留）
│   │   ├── (app)/                  # SaaS 主体路由组
│   │   │   ├── studio/             #   AI 创作台 (对话 + 预览)
│   │   │   ├── library/            #   视频媒体库
│   │   │   ├── export/             #   导出中心
│   │   │   ├── templates/          #   模板管理中心
│   │   │   └── settings/           #   偏好设置
│   │   └── api/
│   │       ├── workflow/            # 工作流 API
│   │       │   ├── topics/          #   AI 选题
│   │       │   ├── script/          #   脚本生成
│   │       │   ├── video/           #   视频数据生成 + TTS
│   │       │   ├── markdown/        #   Markdown 旁白生成
│   │       │   └── markdown-video/  #   Markdown 视频数据生成
│   │       ├── chat/                # 对话式视频生成 API
│   │       ├── tts/                 # TTS 语音合成 API
│   │       ├── render/              # 视频渲染 API (Remotion → MP4)
│   │       └── projects/            # 项目 CRUD API
│   │
│   ├── components/                 # UI 组件
│   │   ├── ChatPanel.tsx           # 对话面板 (含模板选择器)
│   │   ├── VideoPreview.tsx        # 视频预览 (Remotion Player)
│   │   ├── ControlPanel.tsx        # 右侧控制面板
│   │   ├── SlideEditor.tsx         # 幻灯片内容编辑器
│   │   ├── TemplateConfigPanel.tsx # 模板参数化配置面板
│   │   ├── VoiceConfigPanel.tsx    # 语音/音色配置面板
│   │   ├── landing/                # 落地页组件 (Hero, Features)
│   │   ├── layout/                 # 布局组件 (SideNavBar, TopNavBar)
│   │   ├── workflow/               # 工作流步骤组件
│   │   │   ├── TopicSelector.tsx   #   选题阶段
│   │   │   ├── ScriptEditor.tsx    #   脚本编辑阶段
│   │   │   ├── VideoGenerator.tsx  #   视频生成阶段
│   │   │   ├── MarkdownInput.tsx   #   Markdown 输入
│   │   │   ├── TemplateSelector.tsx #   模板选择器
│   │   │   └── WorkflowStepper.tsx #   工作流步骤导航
│   │   ├── library/                # 媒体库组件
│   │   └── export/                 # 导出相关组件
│   │
│   ├── hooks/                      # 自定义 Hooks
│   │   ├── useWorkflow.ts          # 工作流状态管理 (选题→文案→生成)
│   │   ├── useVideoData.ts         # 视频数据状态管理
│   │   ├── useRenderTask.ts        # 渲染任务管理
│   │   └── useProjects.ts          # 项目列表管理
│   │
│   ├── lib/                        # 核心逻辑层
│   │   ├── db/                     # 数据库层
│   │   │   ├── schema.ts           #   Drizzle 表定义 (video_projects)
│   │   │   └── index.ts            #   PostgreSQL 连接池单例
│   │   ├── deepseek.ts             # DeepSeek API 封装
│   │   ├── tavily.ts               # Tavily 联网搜索封装
│   │   ├── unsplash.ts             # Unsplash 智能配图封装
│   │   ├── renderer.ts             # Remotion 服务端渲染封装
│   │   ├── volcengine-tts.ts       # 火山引擎 TTS 封装 (含 Mock 模式)
│   │   ├── markdown-parser.ts      # Markdown → Slides 解析器
│   │   ├── project-store.ts        # 项目持久化 (PostgreSQL + Drizzle)
│   │   ├── prompts/                # Prompt 模板
│   │   │   ├── card-video.ts       #   图文卡片 Prompt + Zod Schema
│   │   │   ├── algo-video.ts       #   算法可视化 Prompt + Zod Schema
│   │   │   ├── landscape-video.ts  #   知识讲解 Prompt + Zod Schema
│   │   │   ├── topic-prompts.ts    #   选题 Prompt
│   │   │   └── script-prompts.ts   #   脚本生成 Prompt
│   │   └── types/                  # TypeScript 类型定义
│   │       ├── card-video.ts       #   CardVideoData
│   │       ├── algo-video.ts       #   AlgoVideoData
│   │       ├── landscape-video.ts  #   KnowledgeVideoData
│   │       ├── markdown-video.ts   #   MarkdownVideoData
│   │       └── workflow.ts         #   WorkflowState
│   │
│   └── remotion/                   # Remotion 视频模块
│       ├── index.tsx               # Composition 注册入口
│       ├── template-registry.ts    # 🎨 动态模板注册表
│       ├── template-theme.ts       # 模板主题类型 + 合并逻辑
│       ├── TemplateThemeContext.tsx # 主题 Context Provider
│       ├── default-themes.ts       # 默认主题配置
│       ├── compositions/           # 视频 Composition
│       │   ├── CardVideo.tsx       #   图文卡片视频 (9:16)
│       │   ├── AlgoVideo.tsx       #   算法可视化视频 (16:9)
│       │   ├── KnowledgeVideo.tsx  #   知识讲解视频 (16:9)
│       │   └── MarkdownVideo.tsx   #   Markdown 视频 (16:9)
│       ├── template-packs/         # 可切换风格模板包
│       │   ├── dark-tech/          #   暗黑科技 (默认)
│       │   │   ├── card/           #     卡片视频 Slides
│       │   │   ├── knowledge/      #     知识讲解 Slides
│       │   │   ├── algo/           #     算法视频 Slides
│       │   │   └── markdown/       #     Markdown 视频 Slides
│       │   └── minimal-white/      #   极简白色
│       │       ├── card/           #     卡片视频 Slides
│       │       ├── knowledge/      #     知识讲解 Slides
│       │       ├── algo/           #     算法视频 Slides
│       │       └── markdown/       #     Markdown 视频 Slides
│       ├── shared/                 # 共享动画组件
│       │   ├── NarrationSubtitle.tsx # 旁白字幕 (支持逐词高亮)
│       │   └── SlideImage.tsx       # 幻灯片配图组件
│       └── styles/                 # 视频全局样式 & 主题
│
├── scripts/                        # 工具脚本
│   └── migrate-json-to-pg.ts       # JSON → PostgreSQL 数据迁移
├── drizzle/                        # Drizzle 迁移文件 (自动生成)
├── drizzle.config.ts               # Drizzle Kit 配置
├── remotion.config.ts              # Remotion CLI 配置
├── next.config.ts                  # Next.js 配置
├── package.json                    # 依赖管理
└── .env.local                      # 环境变量 (不提交)
```

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.x
- **PostgreSQL** >= 14.x
- **pnpm** / npm / yarn
- **DeepSeek API Key** — [申请地址](https://platform.deepseek.com/)
- **Tavily API Key** (可选) — 用于联网调研增强内容质量
- **Unsplash Access Key** (可选) — 用于智能配图
- **火山引擎 TTS** (可选) — 未配置时自动降级为静默音频 Mock

### 1. 克隆并安装

```bash
git clone <repository-url>
cd AiVideo
npm install
```

### 2. 配置数据库

确保 PostgreSQL 正在运行，然后创建数据库：

```bash
# 创建数据库
psql -U postgres -c "CREATE DATABASE auteur_studio;"

# 同步表结构
npm run db:push
```

### 3. 配置环境变量

创建 `.env.local` 并填入配置：

```bash
# DeepSeek API
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx

# PostgreSQL
DATABASE_URL=postgresql://localhost:5432/auteur_studio

# Tavily 搜索 (可选)
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxx

# Unsplash 配图 (可选)
UNSPLASH_ACCESS_KEY=your_access_key

# 火山引擎 TTS (可选，不配置则使用 Mock 模式)
VOLC_TTS_APPID=your_appid
VOLC_TTS_TOKEN=your_token
VOLC_TTS_CLUSTER=volcano_tts

# Remotion
REMOTION_SERVE_URL=http://localhost:3000
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 打开应用。

### 5. 使用 Remotion Studio (可选)

```bash
npx remotion studio
```

独立预览和调试 Remotion Composition。

### 6. 数据库管理 (可选)

```bash
# 打开 Drizzle Studio GUI 管理数据
npm run db:studio

# Schema 变更后重新同步
npm run db:push

# 生成 SQL 迁移文件 (生产部署用)
npm run db:generate
```

## 📖 使用指南

### 图文卡片视频 (9:16 竖屏)

在对话框中输入内容主题，选择 **图文卡片** 模式：

```
示例输入: "GPT-5 发布了哪些新功能？帮我做一个科技资讯短视频"
```

AI 将自动生成包含标题、列表、对比、总结等模块的 9:16 竖屏视频，适用于抖音、小红书等短视频平台。

### 知识讲解视频 (16:9 横屏)

选择 **16:9 横屏** 模式，输入科普或教学主题：

```
示例输入: "新能源汽车行业趋势分析"
```

AI 将自动生成分段式横屏讲解视频，适用于 B 站、YouTube 等平台。

### Markdown 视频 (16:9 横屏)

选择 **Markdown** 模式，直接粘贴 `.md` 内容：

AI 将解析 Markdown 结构，自动拆分章节，生成含代码语法高亮、打字机动画的技术教程视频。

### 算法可视化视频 (16:9 横屏)

在对话框中输入算法主题，选择 **算法视频** 模式：

```
示例输入: "用 BFS 解决腐烂橘子问题，生成逐步演示视频"
```

AI 将自动生成包含网格动画、代码高亮和旁白解说的 16:9 横屏教学视频。

## 🎨 视频模板

### 模板系统

项目使用 **模板注册表 + 主题参数化** 架构，每个模板包包含四种视频类型的完整 Slide 组件集：

| 模板 | 风格 | 适用场景 |
|------|------|----------|
| `dark-tech` | 暗黑科技（默认） | 技术讲解、算法演示 |
| `minimal-white` | 极简白色 | 科普教育、商业汇报 |

每个模板支持通过 `TemplateConfigPanel` 实时调整：
- 🎨 配色方案（主色/辅色/背景色）
- 📝 字体组合（标题/正文字体）
- ⚡ 动画参数（入场方式/速度）

### 卡片视频 - 6 种幻灯片类型

| 类型 | 组件 | 用途 |
|------|------|------|
| `title` | TitleSlide | 视频标题页，支持关键词高亮 |
| `numbered_list` | NumberedListSlide | 编号列表，适合要点罗列 |
| `comparison` | ComparisonSlide | 左右对比，适合优劣分析 |
| `steps` | StepsSlide | 步骤指引，支持链接卡片 |
| `quote` | QuoteSlide | 引用金句，附来源和讨论 |
| `ending` | EndingSlide | 结束页，作者信息 + CTA |

### 算法视频 — 4 个 Remotion 子组件

| 组件 | 文件 | 功能 |
|------|------|------|
| GridBoard | `remotion/algo/GridBoard.tsx` | 网格/矩阵面板，支持淡入动画 + 高亮脉动 |
| StepIndicator | `remotion/algo/StepIndicator.tsx` | 步骤进度指示器 + 标注 + 描述 |
| CodeHighlight | `remotion/algo/CodeHighlight.tsx` | 代码逐行高亮，支持自定义代码 |
| NarrationSubtitle | `remotion/shared/NarrationSubtitle.tsx` | 旁白字幕，支持 TTS 时间戳逐词同步 |

## 🎨 设计系统

项目采用 **Material Design 3** 风格的暗色主题：

- **主色调** — 紫色渐变 (`primary` / `secondary` / `tertiary`)
- **字体** — Inter (正文) + Space Grotesk (标题) + Noto Sans SC (中文) + Material Symbols (图标)
- **动效** — 基于 Remotion `interpolate` + `spring` 的流畅过渡动画
- **BGM** — 默认背景音乐支持淡入淡出（1s fade-in / 2s fade-out）

## 🔧 API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/chat` | POST | 对话式视频生成 (直接对话) |
| `/api/workflow/topics` | POST | AI 智能选题 (多方向) |
| `/api/workflow/script` | POST | AI 脚本/分镜生成 |
| `/api/workflow/video` | POST | 视频数据生成 + TTS 合成 |
| `/api/workflow/markdown` | POST | Markdown 旁白生成 |
| `/api/workflow/markdown-video` | POST | Markdown 视频数据 + TTS |
| `/api/tts` | POST | TTS 语音合成 |
| `/api/render` | POST/GET | 服务端视频渲染 (Remotion → MP4) |
| `/api/projects` | GET/POST/DELETE | 项目 CRUD |
| `/api/projects/[id]` | GET | 获取单个项目详情 |

## 🗄️ 数据库

项目使用 **PostgreSQL + Drizzle ORM** 进行数据持久化。

### 表结构

| 字段 | 类型 | 描述 |
|------|------|------|
| `id` | UUID | 主键 |
| `title` | TEXT | 项目标题 |
| `description` | TEXT | 项目描述 |
| `video_type` | TEXT | 视频类型 (card/algo/knowledge/markdown) |
| `video_data` | JSONB | 完整视频数据 (slides/steps/narration) |
| `created_at` | TIMESTAMPTZ | 创建时间 |
| `updated_at` | TIMESTAMPTZ | 更新时间 |
| `duration` | INTEGER | 视频时长 (秒) |
| `aspect_ratio` | TEXT | 画面比例 (9:16/16:9) |
| `tags` | TEXT[] | 标签数组 |
| `thumbnail` | TEXT | 缩略图 (CSS 渐变) |
| `render_status` | TEXT | 渲染状态 (idle/rendering/completed/failed) |
| `render_output_path` | TEXT | 渲染输出路径 |
| `render_progress` | INTEGER | 渲染进度 (0-100) |

### NPM 数据库脚本

| 命令 | 描述 |
|------|------|
| `npm run db:push` | 同步 Schema 到数据库 (开发) |
| `npm run db:generate` | 生成 SQL 迁移文件 (生产) |
| `npm run db:studio` | 启动 Drizzle Studio GUI |
| `npm run db:migrate` | 运行旧数据迁移脚本 |

## 📝 开发说明

### 添加新的视觉模板

项目使用 **模板注册表架构**，添加新风格无需修改 Composition 源码：

1. 在 `src/remotion/template-packs/` 下创建新目录（如 `gradient-purple/`）
2. 实现各视频类型的 Slide 组件（card / knowledge / algo / markdown）
3. 在 `index.ts` 中调用 `registerTemplate()` 注册
4. 在 `src/remotion/index.tsx` 中添加 side-effect import
5. 在 `TemplateSelector.tsx` 的 `ALL_TEMPLATES` 中添加配置

### 添加新的视频类型

1. 在 `src/lib/types/` 中定义数据类型
2. 在 `src/remotion/compositions/` 中创建 Composition
3. 在 `src/remotion/index.tsx` 中注册 Composition
4. 在各模板包中实现对应的 Slide 组件并注册
5. 创建对应的 Prompt 模板和 API 路由

### 数据库 Schema 变更

修改 `src/lib/db/schema.ts` 后：

```bash
# 开发环境：直接推送
npm run db:push

# 生产环境：生成迁移文件
npm run db:generate
```

### TTS Mock 模式

当未配置 `VOLC_TTS_APPID` 或 `VOLC_TTS_TOKEN` 时，TTS 自动降级为 Mock 模式，返回静默 WAV 音频，方便本地开发调试。

## 📄 License

MIT
