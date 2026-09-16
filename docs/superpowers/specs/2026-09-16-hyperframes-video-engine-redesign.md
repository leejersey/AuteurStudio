# Auteur Studio HyperFrames 视频引擎重构设计

## 1. 背景与结论

Auteur Studio 当前采用“LLM 生成结构化 JSON → 固定 React Slide 模板 → Remotion 预览与渲染”的链路。它适合批量生产高度标准化的视频，但当前成片受固定页面类型、固定布局和按文本估算时长限制，视觉表达接近动态 PPT，无法满足内容驱动、场景差异化和更高动效质量的目标。

项目尚未上线，不要求兼容既有视频或既有 Remotion 数据。因此本次采用一次性切换：删除 Remotion 视频层，以 HyperFrames 作为唯一视频创作、预览、校验和渲染引擎，不建设双引擎、不保留迁移适配层。

本次不是 Remotion API 的机械翻译。核心变化是把生成模型从“选择固定模板并填字段”改成“先锁定内容与音频，再规划 storyboard，最后生成每个场景的可编辑 composition”。

## 2. 目标

1. 同一条视频能够按内容混合动态排版、图片、流程图、数据图表、代码演示、SVG、Lottie 和 Three.js 等视觉形式。
2. TTS 音频和时间戳先于画面编排生成，场景节奏由真实音频决定。
3. 每个场景具有独立的视觉意图、构图、时间窗口和动画，而不是固定 Slide 类型的换皮。
4. 生成结果具备确定性、可 seek、可预览、可检查、可编辑和可重复渲染的特性。
5. Next.js 只负责产品交互与任务编排；长时间生成、校验和渲染由独立 Worker 执行。
6. 以最少的新抽象完成第一条高质量知识讲解视频的端到端闭环，再扩展场景能力。

## 3. 非目标

- 不兼容旧 Remotion Composition、模板或已生成项目。
- 不逐文件翻译 `src/remotion/`。
- 不在第一阶段建设通用 NLE、多人实时协作或任意关键帧编辑器。
- 不在第一阶段支持所有 HyperFrames 工作流；首个垂直切片只覆盖知识讲解/无真人出镜 explainer。
- 不允许渲染 Worker 直接信任或在主应用进程执行模型生成的 HTML/JavaScript。
- 不保留 `card/algo/knowledge/markdown` 作为渲染层级的四套 Composition；算法、代码和 Markdown 只作为内容或场景能力存在。

## 4. 总体架构

```text
用户输入
  │
  ▼
Next.js Studio
  │ 创建生成任务
  ▼
PostgreSQL: generation_jobs
  │
  ▼
Generation Worker（隔离进程/容器）
  ├─ 内容研究（DeepSeek + Tavily）
  ├─ SCRIPT.md
  ├─ TTS + 字词时间戳
  ├─ STORYBOARD.md
  ├─ design.md
  ├─ 素材解析与本地冻结
  ├─ HyperFrames composition 生成
  └─ lint / validate / inspect / snapshot
  │
  ▼
对象存储 / 本地开发存储
  ├─ 源项目
  ├─ 预览资源
  └─ 检查报告
  │
  ▼
<hyperframes-player> 预览
  │ 用户批准导出
  ▼
PostgreSQL: render_jobs
  │
  ▼
Render Worker / HyperFrames Lambda
  │
  ▼
MP4 + thumbnail + metadata
```

开发环境可使用本地目录和单 Worker；生产环境再替换为对象存储、持久队列和 Lambda。业务接口不依赖具体存储或执行器，但第一阶段不提前实现多种后端。

## 5. 核心领域模型

### 5.1 Project

保留项目作为用户可见的聚合根，但不再把 `video_data` 视作渲染真相。项目记录当前生成版本、状态、标题、目标比例、语言和最终产物地址。

### 5.2 Script

`SCRIPT.md` 是锁定的旁白层，包含：

- 完整旁白文本
- 语义段落
- 事实与来源
- 发音或停顿提示
- 语言和目标语气

脚本确认后才能生成 TTS。画面不反向改变已确认旁白，除非用户明确重新生成脚本。

### 5.3 AudioManifest

TTS 输出冻结为本地或对象存储文件，并记录：

- 音频路径
- 总时长
- 分段时间
- 字词时间戳
- 音色、语速和供应商元数据

Storyboard 的所有时间窗口以该 manifest 为依据，不再使用字符数估时作为正常路径。估时只允许在 TTS 失败的诊断预览中使用，不能用于最终渲染。

### 5.4 Storyboard

`STORYBOARD.md` 描述场景，而不是 React 组件：

- 场景目的和叙事功能
- 开始时间与持续时间
- 对应旁白区间
- 主视觉形式
- 画面层级和构图
- 所需素材
- 动效意图
- 转场意图
- 屏幕文字预算

Storyboard 经过校验后生成机器可读 manifest，供 composition builder 使用。

### 5.5 DesignSpec

`design.md` 定义整条视频共享的视觉宪法：

- 色板与对比度要求
- 字体与字级体系
- 间距、圆角和线条规则
- 图片处理方式
- 动效速度、缓动和密度
- 字幕位置与样式
- 禁止事项

DesignSpec 保证场景差异化不变成视觉混乱。

### 5.6 CompositionArtifact

每次生成得到不可变版本目录：

```text
generated/<project-id>/<version-id>/
├── index.html
├── SCRIPT.md
├── STORYBOARD.md
├── design.md
├── audio-manifest.json
├── media.json
├── compositions/
├── assets/
├── reports/
└── renders/
```

数据库只保存版本、状态和 artifact URI；源文件目录是渲染真相。重新生成创建新版本，不覆盖已通过审核的版本。

## 6. 场景与组件策略

第一阶段不建设一个覆盖所有可能性的模板平台，只实现知识讲解垂直切片所需的最小场景能力：

- `kinetic-title`：标题、章节和关键词强调
- `image-focus`：图片、遮罩、局部缩放和标注
- `comparison`：两组观点或数据比较
- `process-diagram`：流程、层级或因果关系
- `data-highlight`：单个关键数字或简洁图表
- `code-demo`：代码输入、行高亮和输出
- `quote`：引用、来源和视觉停顿
- `summary`：关键结论与 CTA

这些是可组合视觉积木，不是固定整页模板。Storyboard 可以决定是否使用、如何布局、持续多久以及与其他积木如何组合。

每个 composition 必须遵守 HyperFrames 合约：显式尺寸、`data-*` 时间属性、唯一 ID、单个暂停时间线、框架托管媒体、确定性动画。媒体文件冻结到 artifact 内，渲染时禁止临时联网。

## 7. 数据流

### 7.1 生成

1. Next.js 校验输入并创建 `generation_job`。
2. Worker 获取任务，生成并保存 Script。
3. Worker 调用 TTS，冻结音频并生成 AudioManifest。
4. 导演阶段基于脚本和真实时间戳生成 Storyboard 与 DesignSpec。
5. 素材阶段解析图片、图标、音乐和其他媒体到本地 artifact。
6. Composition builder 生成主 composition 和必要的子 composition。
7. Worker 依次执行 HyperFrames `lint`、`validate`、`inspect`。
8. 有子 composition 时，在场景中点执行 `snapshot` 并保存检查图。
9. 所有门禁通过后，版本状态变为 `ready_for_review`。
10. Studio 加载轻量 `<hyperframes-player>` 预览。

### 7.2 编辑

第一阶段只支持高价值的结构化编辑：

- 修改脚本并重新生成后续产物
- 调整场景顺序和时长边界
- 修改场景文字和素材
- 修改 DesignSpec 的颜色、字体和动效密度
- 重新生成单个场景

不实现通用 DOM 属性面板。精细时间线编辑交给 HyperFrames Studio；产品 UI 只承载稳定、可解释的结构化操作。

### 7.3 渲染

1. 用户批准当前版本后创建 `render_job`。
2. Render Worker 使用已冻结 artifact，不重新调用 LLM、TTS 或素材服务。
3. Worker 执行严格校验后渲染 MP4。
4. 使用 `ffprobe` 校验文件存在、时长合理且包含预期音视频流。
5. 上传产物并更新项目和任务状态。

## 8. Next.js 与 Worker 边界

Next.js 负责：

- 用户输入和工作流 UI
- 项目、版本和任务 API
- 状态查询
- 预览入口
- 用户批准和重新生成请求

Worker 负责：

- LLM 生成
- TTS 和素材处理
- 写入 artifact
- 执行 HyperFrames CLI
- 校验、快照和渲染
- 上传产物

API Route 不启动长时间渲染，不在内存 Map 中保存任务真相，不写入应用部署目录。任务状态必须持久化到 PostgreSQL。

## 9. 数据库调整

在现有项目表之外引入最少三类记录：

- `project_versions`：artifact URI、版本号、生成状态、预览地址、检查摘要
- `generation_jobs`：阶段、进度、错误、重试次数、输入和输出版本
- `render_jobs`：版本、渲染配置、进度、输出地址、错误

现有 `render_status`、`render_progress` 等项目级字段不再作为任务真相，可在删除旧模型时一并清理。第一阶段使用 PostgreSQL 的事务性抢占实现单 Worker 队列，达到吞吐瓶颈后再引入外部队列。

## 10. 预览与编辑体验

Studio 的中心区域改为 HyperFrames player。预览加载的是某个不可变版本，确保用户看到的内容与待渲染 artifact 相同。

用户执行结构化修改后创建新版本；新版本通过校验后替换当前预览。失败版本保留错误报告，但不能进入最终渲染。

高级编辑入口打开 HyperFrames Studio。第一阶段不把 HyperFrames Studio 的完整时间线复制进 Auteur Studio。

## 11. 错误处理与恢复

- 每个生成阶段单独记录状态和错误，失败时从最近的确定性产物继续。
- LLM 输出必须经过 schema/格式校验；非法 Storyboard 不进入 composition 构建。
- TTS、素材下载和生成调用设置超时、有限重试和明确错误分类。
- HyperFrames 任一静态或运行时门禁失败，版本保持 `failed_validation`，不能渲染。
- Worker 任务采用租约和心跳；进程退出后任务可重新领取。
- 渲染输出先写临时路径，验证通过后原子发布，防止半成品被下载。
- 重试复用已冻结输入，避免同一任务因外部服务变化产生不同结果。

## 12. 安全边界

模型生成的 HTML/JavaScript 视为不可信代码：

- 只在隔离 Worker 或容器中校验和渲染。
- 渲染时默认禁止外网；所有媒体必须预先冻结。
- 限制 CPU、内存、磁盘、执行时长和输出大小。
- artifact 路径由服务端生成，不接受用户提供的文件系统路径。
- 禁止读取应用密钥和宿主文件系统。
- 对 HTML、脚本和素材建立体积上限。

## 13. 验证策略

### 单元验证

- Storyboard manifest 解析与时间区间校验
- AudioManifest 与场景边界映射
- 任务状态机和租约恢复
- artifact 路径与版本规则

### 集成验证

- 固定脚本和音频生成可通过门禁的 composition
- Worker 从数据库领取任务并写回状态
- 预览和渲染读取同一个 artifact 版本
- 失败的 lint/validate/inspect 阻止版本进入 review

### 视觉验证

- 场景中点 snapshot
- 关键转场前后 snapshot
- 中文长文本、图片缺失和代码溢出样例
- 最终 MP4 的时长、音轨和随机抽帧检查

首个验收样片必须与当前 `KnowledgeVideo` 使用同一脚本和素材进行人工盲评，评价构图变化、信息密度、节奏、字幕同步和整体完成度。没有明显质量提升则不继续扩展场景库。

## 14. 删除与替换范围

完成首个垂直切片时删除：

- `src/remotion/`
- `remotion.config.ts`
- 所有 `remotion` 与 `@remotion/*` 依赖
- `src/lib/renderer.ts`
- Remotion 专用 Preview、时长计算和模板注册逻辑
- 旧 Render API 的内存任务 Map

保留并按新边界调整：

- Next.js 页面和产品导航
- PostgreSQL / Drizzle
- DeepSeek、Tavily、Unsplash、火山 TTS 集成
- 项目、媒体库和设置页面
- 可复用的品牌色、字体和内容 prompt 资产

## 15. 分阶段交付

由于完整重构包含生成、预览、任务和渲染多个子系统，实施按可运行垂直切片推进：

### 里程碑 1：HyperFrames 知识讲解垂直切片

固定输入脚本与 TTS，生成一个可校验、可预览、可渲染的 HyperFrames 项目。暂不接产品 UI。用于验证成片质量和技术可行性。

### 里程碑 2：持久任务与 artifact

加入 project version、generation job、render job 和本地 Worker，使生成和渲染脱离 Next.js 请求生命周期。

### 里程碑 3：Studio 集成

替换 Remotion Player，接入版本预览、批准、失败报告和重新生成单场景。

### 里程碑 4：删除 Remotion

新链路覆盖当前主要知识讲解流程后，一次性删除所有 Remotion 代码、依赖和旧数据字段。

### 里程碑 5：扩展场景能力

根据真实样片缺口按需增加算法、代码、图表、图片融合和更复杂运行时，不预先建设未被样片需要的组件。

## 16. 验收标准

首个端到端版本必须满足：

1. 仓库不再包含运行时 Remotion 依赖。
2. 输入主题可以生成 Script、真实 TTS、Storyboard、DesignSpec 和 HyperFrames artifact。
3. artifact 通过 `hyperframes lint`、`validate`、`inspect`，子 composition 通过 snapshot 冒烟检查。
4. Auteur Studio 能预览指定不可变版本。
5. 渲染任务在独立 Worker 中完成，服务重启后任务状态不丢失。
6. 输出 MP4 经 `ffprobe` 验证，音频和字幕同步在人工检查可接受范围内。
7. 与旧 KnowledgeVideo 的同内容对比中，新样片在构图变化、节奏、视觉相关性和整体完成度上获得明确人工偏好。
8. 失败的生成或渲染不会发布半成品，也不会阻塞后续任务。

## 17. 决策摘要

- 唯一视频引擎：HyperFrames。
- 迁移策略：一次性替换，不兼容旧项目，不翻译旧 Composition。
- 生成模型：Script → TTS/时间戳 → Storyboard/DesignSpec → Composition。
- 执行边界：Next.js 编排，隔离 Worker 生成和渲染。
- 编辑策略：产品提供结构化编辑，高级时间线使用 HyperFrames Studio。
- 存储策略：不可变版本目录是渲染真相，PostgreSQL 保存任务和索引。
- 首个范围：知识讲解垂直切片，以成片质量对比作为继续投入的门禁。
