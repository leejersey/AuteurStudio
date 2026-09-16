# Auteur Studio HyperFrames 视频引擎重构设计

## 1. 背景与结论

Auteur Studio 当前采用“LLM 生成结构化 JSON → 固定 React Slide 模板 → Remotion 预览与渲染”的链路。它适合批量生产高度标准化的视频，但当前成片受固定页面类型、固定布局和按文本估算时长限制，视觉表达接近动态 PPT，无法满足内容驱动、场景差异化和更高动效质量的目标。

项目尚未上线，不要求兼容既有视频或既有 Remotion 数据。最终状态是删除 Remotion 视频层，以 HyperFrames 作为唯一视频创作、预览、校验和渲染引擎，不建设双引擎产品能力、不保留迁移适配层。实施期间允许隔离的 HyperFrames 样片与旧代码短暂共存；只有新链路完成产品集成后才删除 Remotion。

本次不是 Remotion API 的机械翻译。核心变化是把生成模型从“选择固定模板并填字段”改成“先锁定内容与音频，再规划 storyboard，最后生成每个场景的可编辑 composition”。

## 2. 目标

1. 同一条视频能够按内容选择并组合最合适的视觉形式，而不是套用固定 Slide 页面。
2. TTS 音频和时间戳先于画面编排生成，场景节奏由真实音频决定。
3. 每个场景具有独立的视觉意图、构图、时间窗口和动画，而不是固定 Slide 类型的换皮。
4. 生成结果具备确定性、可 seek、可预览、可检查、可编辑和可重复渲染的特性。
5. Next.js 只负责产品交互与任务编排；长时间生成、校验和渲染由独立 Worker 执行。
6. 首个样片只实现内容确实需要的 3–4 种视觉形式，以最少的新抽象验证质量提升；Lottie、Three.js 和完整场景库按后续真实需求增加。

## 3. 非目标

- 不兼容旧 Remotion Composition、模板或已生成项目。
- 不逐文件翻译 `src/remotion/`。
- 不在第一阶段建设通用 NLE、多人实时协作或任意关键帧编辑器。
- 不在第一阶段支持所有 HyperFrames 工作流；首个垂直切片只覆盖知识讲解/无真人出镜 explainer。
- 不允许 Worker 或浏览器预览直接信任模型生成的 HTML/JavaScript；两者都必须运行在隔离边界内。
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
  ├─ script.json → SCRIPT.md
  ├─ TTS + 对齐时间戳
  ├─ storyboard.json → STORYBOARD.md
  ├─ design.json → design.md
  ├─ 素材解析与本地冻结
  ├─ 可信 Host Builder 生成 HyperFrames composition
  └─ lint / validate / inspect / assembled snapshots
  │
  ▼
对象存储 / 本地开发存储
  ├─ 源项目
  ├─ 预览资源
  └─ 检查报告
  │
  ▼
独立无凭据预览域 + sandboxed iframe
  └─ <hyperframes-player> 预览
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

严格校验的 `script.json` 是锁定的旁白数据源，`SCRIPT.md` 只是供人审阅的投影。数据包含：

- 稳定段落 ID
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

Storyboard 的所有时间窗口以该 manifest 为依据，不再使用字符数估时作为正常路径。现有火山 TTS 封装只返回音频，不提供时间戳，因此里程碑 1 的第一个技术门禁是验证火山时间戳 API 或本地 forced alignment，并明确粒度、置信度和失败行为。没有真实对齐结果时禁止最终渲染；估时只允许用于失败诊断预览。

### 5.4 Storyboard

严格校验的应用自有 `storyboard.json` 是 LLM 与 Builder 之间的唯一首期契约，`STORYBOARD.md` 只是供人审阅的投影。LLM 不直接输出可执行 HTML/JavaScript。每个场景包含：

- 稳定场景 ID
- 场景目的和叙事功能
- 单调、不重叠的开始时间与持续时间
- 对应旁白段落和字词区间
- 有界的视觉意图枚举
- 画面层级和构图
- 只引用 manifest 内资产的媒体 ID
- 动效和转场意图
- 屏幕文字预算

Schema 拒绝未知字段、外部 URL、重复 ID、无效时间范围和首期不支持的场景能力。可信 Composition Builder 独占全局 ID、轨道、媒体提升和运行时导入；每个阶段记录输入/输出 SHA-256，只有输入哈希未变化的阶段可以断点复用。

### 5.5 DesignSpec

严格校验的 `design.json` 定义整条视频共享的视觉宪法，`design.md` 是供人审阅的投影：

- 色板与对比度要求
- 字体与字级体系
- 间距、圆角和线条规则
- 图片处理方式
- 动效速度、缓动和密度
- 字幕位置与样式
- 禁止事项

DesignSpec 保证场景差异化不变成视觉混乱。

### 5.6 CompositionArtifact

编辑发生在临时 workspace；通过校验后发布为不可变源 artifact：

```text
workspaces/<job-id>/                 # 可写、不可批准
artifacts/<project-id>/<version-id>/ # 发布后只读
├── manifest.json                    # 路径、大小、SHA-256、工具链版本、入口、尺寸、FPS、时长
├── index.html
├── script.json
├── storyboard.json
├── design.json
├── SCRIPT.md
├── STORYBOARD.md
├── design.md
├── audio-manifest.json
├── media.json
├── compositions/
└── assets/

derived/<project-id>/<version-id>/<artifact-digest>/
├── reports/
├── snapshots/
├── thumbnails/
└── renders/
```

数据库保存版本、状态、artifact URI 和 manifest digest；源 artifact 是渲染真相，报告和渲染物是关联到 digest 的派生对象。批准操作保存 digest，`render_job` 固定 `project_version_id + artifact_digest`，Worker 渲染前重新校验 digest。HyperFrames Studio 编辑 copy-on-write workspace，重新校验并发布为新版本，绝不修改已批准 artifact。

## 6. 场景、Builder 与媒体策略

里程碑 1 不建设通用模板平台。先锁定一条 30–90 秒样片，再只实现该内容需要的 3–4 种视觉形式，优先从 `kinetic-title`、`image-focus`、`process-diagram`、`data-highlight`、`quote`、`summary` 中选择。`comparison`、`code-demo`、Lottie 和 Three.js 只有在样片明确需要时才加入。

这些能力是可组合视觉积木，不是固定整页模板。Storyboard 决定使用方式、布局意图和持续时间，可信 Builder 把意图编译成确定性 DOM 与时间线。

可信 Host Builder 必须统一执行 HyperFrames 装配规则：

- 主 root 显式设置尺寸、FPS、总时长并注册唯一的暂停主时间线。
- 所有 `<video>` 和 `<audio>` 都提升为 `index.html` host root 的直接子元素，拥有全局时间、轨道和唯一 ID。
- 子 composition 只拥有自身 DOM/SVG/Canvas，不托管音视频，也不能驱动 host 媒体。
- 场景局部时间由 Builder 转换为主时间线的全局时间；host 媒体动画只写入主时间线。
- 所有装配后 ID 全局唯一；字体、运行时库和媒体全部冻结到 artifact，渲染时禁止联网。
- 禁止 wall clock、输入状态、未播种随机数、无限动画、运行时 fetch 和异步时间线注册。
- 只使用 HyperFrames 可 seek 的运行时适配器；根背景放在 full-bleed 子元素而非 root 自身。

变量只用于受限的字符串、数字、颜色、布尔和枚举控制。场景数组、顺序、时长或媒体变化必须重新构建、校验并发布 artifact，不能依赖 HyperFrames scalar variables 动态改结构。

## 7. 数据流

### 7.1 生成

1. Next.js 校验输入并创建 `generation_job`。
2. Worker 获取任务，生成并校验 `script.json`，再投影为 `SCRIPT.md`。
3. Worker 调用 TTS 和选定的时间戳/forced-alignment 方案，冻结音频并生成 AudioManifest；无真实对齐则停止。
4. 导演阶段基于脚本和真实时间戳生成并校验 `storyboard.json` 与 `design.json`，再输出 Markdown 投影。
5. 素材阶段解析图片、图标、音乐和其他媒体，拒绝外部 URL 后冻结到 workspace。
6. 可信 Host Builder 生成主 composition 和必要的无媒体子 composition，并生成 artifact manifest。
7. Worker 使用固定 Node >=22 和固定 HyperFrames 版本，以 JSON 模式执行 `lint`、`validate`、`inspect`。
8. Worker 对装配后的项目在首帧、每场中点、每个转场前后和末帧执行 `snapshot`。
9. 选定帧重复捕获两次并进行哈希或约定像素差比较，验证确定性。
10. 所有门禁通过后原子发布只读 artifact，版本状态变为 `ready_for_review`。
11. 独立预览域在 sandboxed iframe 中加载 `<hyperframes-player>`。

### 7.2 编辑

产品接入阶段只支持高价值的结构化编辑；里程碑 1 的质量样片不实现编辑 UI：

- 修改脚本并重新生成后续产物
- 调整场景顺序和时长边界
- 修改场景文字和素材
- 修改 DesignSpec 的颜色、字体和动效密度
- 重新生成单个场景

所有结构变化都会在 copy-on-write workspace 中重新构建、校验并发布新版本；修改时长也会重写 root `data-duration`。不实现通用 DOM 属性面板。精细时间线编辑交给运行在隔离预览域的 HyperFrames Studio；产品 UI 只承载稳定、可解释的结构化操作。

### 7.3 渲染

1. 用户批准当前版本及其 manifest digest 后创建固定 `project_version_id + artifact_digest` 的 `render_job`。
2. Render Worker 重新计算并核对 digest，使用只读 artifact，不重新调用 LLM、TTS 或素材服务。
3. Worker 执行 `render --docker --strict --strict-variables` 后生成临时 MP4。
4. 使用 `ffprobe` 校验文件存在、音视频流完整，且视频时长与 AudioManifest 的差值不超过 1 帧。
5. 验证通过后原子发布派生产物并以 compare-and-swap 更新任务；digest 不符或任务租约失效时不得发布。

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

现有 `render_status`、`render_progress` 等项目级字段不再作为任务真相，可在删除旧模型时一并清理。产品接入阶段使用 PostgreSQL 队列：通过 `FOR UPDATE SKIP LOCKED` 抢占，记录 `lease_owner`、不可复用的 lease token、`attempt`、`lease_expires_at`、幂等键和取消状态；完成和发布必须校验 lease token 并 compare-and-swap。`current_version_id` 使用乐观并发，旧任务不能覆盖用户更新后的新版本。状态机只允许 `queued → running → succeeded|failed|cancelled`，租约过期的 `running` 可回到 `queued`，达到最大尝试次数后进入 `failed`。达到真实吞吐瓶颈后再引入外部队列。

## 10. 预览与编辑体验

Studio 的可信 Next.js shell 不直接执行 artifact。预览资源部署在独立无应用凭据的 origin，通过不含 `allow-same-origin`、top-navigation、popups 或 forms 权限的 sandboxed iframe 加载 `<hyperframes-player>`；使用严格 CSP 禁止任意外联。shell 与预览只通过窄化、校验过的 `postMessage` 协议交换播放、seek 和只读状态，artifact 不能读取父 DOM、cookie、localStorage 或已认证 API。

预览加载指定 artifact digest，确保用户看到的源文件与待渲染源文件一致。用户执行结构化修改后创建 copy-on-write workspace 和新版本；新版本通过校验后替换当前预览。失败版本保留错误报告，但不能进入最终渲染。

高级编辑入口在同一隔离预览域打开 HyperFrames Studio。首个质量样片不实现产品编辑；产品接入阶段也不把 HyperFrames Studio 的完整时间线复制进 Auteur Studio。

## 11. 错误处理与恢复

- 每个生成阶段单独记录状态、输入/输出哈希和错误；仅当输入哈希未变时从最近的确定性产物继续。
- LLM 输出必须经过严格 schema 校验；非法 Script、Storyboard 或 DesignSpec 不进入下一阶段。
- TTS、对齐、素材下载和生成调用设置超时、有限重试和明确错误分类。
- HyperFrames 任一静态或运行时门禁失败，版本保持 `failed_validation`，不能发布或渲染。
- Worker 使用租约、心跳、幂等键和 compare-and-swap；进程退出后任务可重新领取，失效 Worker 不能发布结果。
- artifact 和渲染输出先写临时路径，校验后原子发布，防止半成品被下载。
- 覆盖 crash-after-upload、租约过期、重复投递、取消、过期任务竞争以及失败任务后续健康任务仍能完成的故障注入测试。

## 12. 安全边界

模型生成和用户提供的源文件、媒体及 HTML 均视为不可信输入：

- 只在无密钥、无 host mount、只读输入和 tmpfs 输出的隔离 Worker/容器中校验与渲染。
- 渲染和预览默认禁止外网；所有字体、运行时和媒体必须预先冻结，禁止 `file://` 和远程脚本。
- 限制 CPU、内存、磁盘、执行时长、文件数量、解压后体积和输出大小。
- artifact 路径由服务端生成；每个 manifest 路径 canonicalize 后必须位于 artifact root，拒绝遍历、符号链接和本地 URL。
- 只允许白名单 MIME；拒绝活动 SVG/HTML 资产、解压炸弹和未知可执行格式。
- Worker 和预览不能读取应用密钥、宿主文件系统、云 metadata endpoint 或应用凭据。
- 每个 project/version/job API 校验租户所有权；预览和下载使用短期签名 URL。
- 浏览器预览安全边界按 §10 执行，并用恶意 fixture 验证无法访问父 DOM、cookie、storage、认证 API 或任意网络地址。

## 13. 验证策略

### 单元验证

- `script.json`、`storyboard.json`、`design.json` 和 AudioManifest schema
- 单调非重叠时间区间、旁白引用和媒体引用
- Host Builder 的全局 ID、track、媒体提升和局部到全局时间转换
- 任务状态机、幂等键、租约恢复和 compare-and-swap
- artifact digest、路径 canonicalization 与版本规则

### 集成验证

- 固定脚本和真实对齐音频生成可通过门禁的 composition
- 含子场景图片、视频、音频和重复 ID 的 contract fixtures
- 装配后所有音视频均为 host root 直接子元素，且子 composition 不驱动 host 媒体
- Worker 从数据库领取任务并原子写回状态
- 预览批准与渲染固定相同 artifact digest
- 失败的 lint/validate/inspect 或 digest 校验阻止版本进入 review/render
- 恶意预览 fixture 无法访问可信 shell 和网络

### 确定性与视觉验证

- 固定 Node >=22、HyperFrames、Chrome/容器和字体版本
- JSON 模式 `lint`、`validate`、`inspect`
- 装配后首帧、每场中点、转场前后和末帧 snapshots
- 选定帧两次捕获的哈希一致或像素差低于预声明阈值
- 中文长文本、图片缺失、媒体提升和内容溢出样例
- `render --docker --strict --strict-variables` 与 `ffprobe` 检查

### 质量门禁

使用同一锁定脚本和事实来源进行盲评，同时输出“相同素材”和“各自最佳素材选择”两组对比。预先选定 3 名不知道引擎来源的评审者，分别评价构图变化、节奏、视觉相关性和整体完成度；新样片至少在 4 个维度中的 3 个获得多数偏好，平票视为未通过。技术阈值为：视频时长与 AudioManifest 差值不超过 1 帧；必须包含预期音视频流；人工标注样本的字幕词边界误差中位数不超过 100ms、P95 不超过 250ms；命名 snapshots 中关键文字零裁切/溢出。未通过质量门禁则停止扩展场景库。

## 14. 删除与替换范围

里程碑 3 完成预览、批准和渲染集成后，在里程碑 4 一次性删除：

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

### 里程碑 1：隔离的 HyperFrames 质量样片

使用一条固定的 30–90 秒 `script.json`、真实 TTS/对齐结果和内容需要的 3–4 种视觉形式，生成可校验、可 sandbox 预览、可 Docker 严格渲染的 HyperFrames artifact。暂不接数据库、产品 UI、编辑器、Lambda 或通用场景库。通过 §13 的技术与盲评质量门禁才继续。

### 里程碑 2：持久任务与 artifact

加入 project version、generation job、render job、本地 Worker、只读 artifact/digest 和派生产物，使生成和渲染脱离 Next.js 请求生命周期。通过故障注入和幂等发布测试。

### 里程碑 3：Studio 集成

在独立预览域替换 Remotion Player，接入版本预览、批准、失败报告和重新生成单场景。证明预览与渲染固定相同 digest，并通过恶意预览 fixture。

### 里程碑 4：删除 Remotion

新链路覆盖当前主要知识讲解流程且里程碑 3 验收通过后，一次性删除所有 Remotion 代码、依赖和旧数据字段。最终仓库只保留 HyperFrames 引擎，不提供双引擎产品能力。

### 里程碑 5：按样片缺口扩展

根据真实样片缺口按需增加算法、代码、图表、图片融合、Lottie、Three.js、云渲染或外部队列，不预先建设未被需求证明的能力。

## 16. 验收标准

### 里程碑 1

1. 固定样片具有严格校验的 Script、真实 TTS/对齐、Storyboard、DesignSpec 和 HyperFrames artifact。
2. artifact 满足 Host Builder 媒体/ID/时间线契约，并通过固定工具链的 lint、validate、inspect、边界 snapshots、确定性复捕和 Docker strict render。
3. 输出 MP4 通过 §13 的时长、音视频流、字幕对齐和盲评质量阈值。
4. sandboxed cross-origin 预览通过恶意 fixture；未通过质量或安全门禁则不进入里程碑 2。

### 里程碑 2–3

1. 生成和渲染任务在独立 Worker 中完成，服务重启、租约过期和重复投递不会丢状态或重复发布。
2. artifact 发布后只读，批准和渲染固定并复核相同 digest。
3. Auteur Studio 在隔离预览域预览指定版本；结构编辑发布新版本而不修改旧 artifact。
4. 失败任务不发布半成品，故障任务之后的健康任务能在测试规定的租约回收时间内完成。

### 里程碑 4

1. 仓库不再包含 `src/remotion/`、`remotion.config.ts`、运行时 Remotion 依赖、旧 Renderer、旧 Player 或内存任务 Map。
2. 主要知识讲解流程仅通过 HyperFrames 完成生成、预览、批准和渲染。
3. 构建、类型检查、相关测试和端到端样片门禁全部通过。

## 17. 决策摘要

- 唯一视频引擎：HyperFrames。
- 迁移策略：最终一次性切除 Remotion，不兼容旧项目、不翻译旧 Composition；切除前先完成隔离样片和产品集成门禁。
- 生成模型：严格 JSON Script → TTS/真实对齐 → 严格 JSON Storyboard/DesignSpec → 可信 Host Builder。
- 执行边界：Next.js 编排，隔离 Worker 生成和渲染，独立无凭据 origin 负责预览。
- 编辑策略：产品提供结构化编辑，高级时间线使用隔离的 HyperFrames Studio；结构变化总是发布新 artifact。
- 存储策略：带 manifest digest 的不可变源 artifact 是渲染真相，派生产物分离，PostgreSQL 保存任务和索引。
- 首个范围：一条固定知识讲解样片和内容需要的 3–4 种视觉形式，以量化技术门禁与盲评质量门禁决定是否继续。
