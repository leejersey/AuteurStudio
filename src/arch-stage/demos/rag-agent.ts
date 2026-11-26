import type { ArchStageSpec } from "../schema";

export const ragAgentDemoSpec: ArchStageSpec = {
  engine: "arch-stage",
  meta: {
    id: "arch-stage-rag-agent",
    title: "一图看懂企业级 RAG + AI Agent 全链路",
    subtitle: "向量检索 · Rerank 精排 · Prompt 注入 · 工具调用闭环",
    domain: "AI ARCHITECTURE",
    theme: "dracula",
    width: 1920,
    height: 1080,
    fps: 30,
  },
  nodes: [
    { id: "user", label: "用户提问", sublabel: "Query / 多轮对话", kind: "client", col: 0, row: 0, badge: "INPUT" },
    { id: "orch", label: "Agent 编排器", sublabel: "意图路由与状态机", kind: "gateway", col: 1, row: 0, badge: "ROUTER" },
    { id: "embed", label: "Embedding & 检索", sublabel: "向量库 + BM25 混合召回", kind: "database", col: 2, row: 0, badge: "VECTOR DB" },
    { id: "rerank", label: "Rerank 精排", sublabel: "Top-20 → Top-3 高相关片段", kind: "cache", col: 2, row: 1, badge: "RERANKER" },
    { id: "llm", label: "大模型推理", sublabel: "Grounded Answer 生成", kind: "llm", col: 1, row: 1, badge: "LLM" },
    { id: "tools", label: "业务 Tools / API", sublabel: "查库 / 发工单 / 算数据", kind: "external", col: 0, row: 1, badge: "MCP / TOOL" },
  ],
  edges: [
    { id: "e-u-o", from: "user", to: "orch", label: "自然语言请求", style: "solid" },
    { id: "e-o-e", from: "orch", to: "embed", label: "改写 Query", style: "solid" },
    { id: "e-e-r", from: "embed", to: "rerank", label: "Top-20 候选", style: "solid" },
    { id: "e-r-l", from: "rerank", to: "llm", label: "Top-3 证据片段", style: "solid" },
    { id: "e-l-t", from: "llm", to: "tools", label: "Tool Call", style: "dashed" },
    { id: "e-t-u", from: "tools", to: "user", label: "带引用流式回答", style: "solid" },
  ],
  steps: [
    {
      id: "step-1",
      badge: "01 · 意图路由与改写",
      headline: "编排器先理解意图并改写检索词",
      start: 0,
      duration: 5.5,
      activeNodes: ["user", "orch", "embed"],
      activeEdges: ["e-u-o", "e-o-e"],
      packets: [
        { edgeId: "e-u-o", label: "怎么报销差旅?", tone: "primary" },
        { edgeId: "e-o-e", label: "2026 差旅报销规范", tone: "warn" },
      ],
      nodeStates: {
        orch: "补全指代 & 关键词",
        embed: "向量化 1536 维",
      },
      metrics: [
        { label: "QUERY REWRITE", value: "命中知识检索路由", tone: "primary" },
        { label: "LATENCY", value: "42 ms", tone: "success" },
      ],
      callout: {
        title: "为什么不能直接拿原话去搜？",
        body: "口语提问常缺上下文，编排器先做 Query 改写，再做向量 + 关键词混合召回，召回率能直接翻倍。",
      },
      narration: "用户提问先进入 Agent 编排器，由它识别意图并改写成精准检索词，再送入向量数据库做混合召回。",
    },
    {
      id: "step-2",
      badge: "02 · 粗排召回 + Rerank 精排",
      headline: "两阶段检索过滤噪音，只保留最准的 Top-3",
      start: 5.5,
      duration: 5.5,
      activeNodes: ["embed", "rerank", "llm"],
      activeEdges: ["e-e-r", "e-r-l"],
      packets: [
        { edgeId: "e-e-r", label: "20 段候选文档", tone: "warn" },
        { edgeId: "e-r-l", label: "Top-3 精准证据", tone: "success" },
      ],
      nodeStates: {
        rerank: "交叉编码器重打分",
        llm: "注入 System Prompt",
      },
      metrics: [
        { label: "RECALL → PRECISION", value: "Top-20 → Top-3", tone: "success" },
        { label: "HALLUCINATION", value: "下降 68%", tone: "success" },
      ],
      callout: {
        title: "Rerank 是防幻觉的分水岭",
        body: "把 20 条杂乱片段全塞给大模型只会稀释注意力；Rerank 精排只留 3 条高分证据，既省 Token 又稳准。",
      },
      narration: "混合检索先快速捞出 20 段候选文档，再由 Rerank 模型精准打分，只把最相关的前三条证据注入大模型上下文。",
    },
    {
      id: "step-3",
      badge: "03 · 工具调用与实时取数",
      headline: "静态文档不够时，LLM 主动触发 MCP / Tool Call",
      start: 11.0,
      duration: 5.5,
      activeNodes: ["llm", "tools"],
      activeEdges: ["e-l-t"],
      packets: [
        { edgeId: "e-l-t", label: "get_quota(uid)", tone: "primary" },
        { edgeId: "e-l-t", label: "剩余额度 ¥3200", tone: "success", reverse: true },
      ],
      nodeStates: {
        llm: "结构化函数调用",
        tools: "实时查询 ERP 数据库",
      },
      metrics: [
        { label: "TOOL CALL", value: "JSON Schema 强约束", tone: "primary" },
        { label: "DATA FRESHNESS", value: "毫秒级实时", tone: "success" },
      ],
      callout: {
        title: "RAG + Tools 才是完整体",
        body: "知识库负责静态规章制度，Tool Call 负责查实时余额或提单，两者结合让 Agent 真正能办事。",
      },
      narration: "如果问题涉及实时业务数据，大模型会主动发起工具调用查询系统接口，把最新结果和制度文档合并推理。",
    },
    {
      id: "step-4",
      badge: "04 · 带引用流式交付",
      headline: "汇总证据与工具结果，输出可溯源的最终答案",
      start: 16.5,
      duration: 5.0,
      activeNodes: ["llm", "tools", "user"],
      activeEdges: ["e-t-u"],
      packets: [
        { edgeId: "e-t-u", label: "流式答案 + [引用1]", tone: "success" },
      ],
      nodeStates: {
        user: "首字延迟 < 800ms",
      },
      metrics: [
        { label: "GROUNDING", value: "100% 附带出处", tone: "success" },
        { label: "TTFT", value: "0.78 s", tone: "primary" },
      ],
      callout: {
        title: "企业级落地三要素",
        body: "混合检索保召回、Rerank 控精准、Tool Call 接实时业务，这就是现代 AI Agent 系统的标准骨架。",
      },
      narration: "最后大模型结合检索证据与工具返回，向用户流式输出带原文引用的准确答复，完成整个企业级 RAG Agent 闭环。",
    },
  ],
  packaging: {
    enableIntro: true,
    introDuration: 2.5,
    enableOutro: true,
    outroDuration: 3.0,
    outroPoints: [
      "Query 改写 + 混合召回，大幅提升复杂提问的文档命中率",
      "Rerank 精排过滤噪音，是压低大模型幻觉的关键防线",
      "RAG 管静态知识、Tool Call 接实时业务，组成完整 Agent 闭环",
    ],
    outroCta: "点赞 · 收藏 · 关注，持续拆解硬核 AI 工程架构",
    bgmFile: "bgm-tech-01.wav",
    bgmLevel: "balanced",
  },
};
