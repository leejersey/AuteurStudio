import type { ArchStageSpec } from "../schema";

export const eventLoopDemoSpec: ArchStageSpec = {
  engine: "arch-stage",
  meta: {
    id: "arch-stage-event-loop",
    title: "30 秒彻底搞懂 JS 事件循环（Event Loop）",
    subtitle: "Call Stack · Web APIs · 微任务优先插队机制",
    domain: "JS RUNTIME",
    theme: "dracula",
    width: 1920,
    height: 1080,
    fps: 30,
  },
  nodes: [
    { id: "stack", label: "Call Stack", sublabel: "主线程调用栈", kind: "runtime", col: 0, row: 0, badge: "SYNC" },
    { id: "webapi", label: "Web APIs", sublabel: "定时器 / Fetch / DOM", kind: "browser", col: 2, row: 0, badge: "ASYNC" },
    { id: "micro", label: "Microtask Queue", sublabel: "Promise.then / queueMicrotask", kind: "queue", col: 1, row: 1, badge: "VIP 优先" },
    { id: "macro", label: "Macrotask Queue", sublabel: "setTimeout / I/O / Click", kind: "queue", col: 2, row: 1, badge: "NORMAL" },
    { id: "loop", label: "Event Loop", sublabel: "轮询调度器", kind: "gateway", col: 0, row: 1, badge: "SCHEDULER" },
  ],
  edges: [
    { id: "e-stack-api", from: "stack", to: "webapi", label: "挂起异步任务", style: "solid" },
    { id: "e-api-micro", from: "webapi", to: "micro", label: "Promise resolve", style: "solid" },
    { id: "e-api-macro", from: "webapi", to: "macro", label: "Timer 到期", style: "dashed" },
    { id: "e-micro-loop", from: "micro", to: "loop", label: "优先清空", style: "solid" },
    { id: "e-macro-loop", from: "macro", to: "loop", label: "每次取 1 个", style: "dashed" },
    { id: "e-loop-stack", from: "loop", to: "stack", label: "推入主线程", style: "solid" },
  ],
  steps: [
    {
      id: "step-1",
      badge: "01 · 同步执行与挂起",
      headline: "同步代码入栈，异步任务交给 Web APIs",
      start: 0,
      duration: 5.5,
      activeNodes: ["stack", "webapi"],
      activeEdges: ["e-stack-api"],
      packets: [
        { edgeId: "e-stack-api", label: "setTimeout(0)", tone: "warn" },
        { edgeId: "e-stack-api", label: "Promise.then", tone: "primary" },
      ],
      nodeStates: {
        stack: "执行同步 console.log",
        webapi: "同时托管 2 个回调",
      },
      metrics: [
        { label: "CALL STACK", value: "main() 运行中", tone: "primary" },
        { label: "MICROTASK", value: "0 待执行", tone: "default" },
        { label: "MACROTASK", value: "0 待执行", tone: "default" },
      ],
      callout: {
        title: "为什么 JS 单线程却不卡死？",
        body: "遇到 setTimeout 或网络请求时，主线程不会傻等，而是直接把回调交给浏览器 Web APIs 后台计时。",
      },
      narration: "同步代码会直接压入主线程调用栈执行；遇到定时器或网络请求，主线程会立刻交给 Web APIs 后台托管，自己继续往下跑。",
    },
    {
      id: "step-2",
      badge: "02 · 回调分流进队列",
      headline: "异步完成后分流进入微任务与宏任务队列",
      start: 5.5,
      duration: 5.5,
      activeNodes: ["webapi", "micro", "macro"],
      activeEdges: ["e-api-micro", "e-api-macro"],
      packets: [
        { edgeId: "e-api-micro", label: "then() 回调", tone: "success" },
        { edgeId: "e-api-macro", label: "timer 回调", tone: "warn" },
      ],
      nodeStates: {
        micro: "入队: Promise.then",
        macro: "入队: setTimeout",
      },
      metrics: [
        { label: "CALL STACK", value: "即将清空", tone: "default" },
        { label: "MICROTASK", value: "1 (VIP)", tone: "success" },
        { label: "MACROTASK", value: "1 (普通)", tone: "warn" },
      ],
      callout: {
        title: "两条队列，两种优先级",
        body: "Promise.then 进入高优先级微任务队列，而 setTimeout(0) 即使延迟是 0，也必须去宏任务队列排队。",
      },
      narration: "等异步结果就绪后，Promise 的回调进入高优先级微任务队列，而 setTimeout 回调则进入普通宏任务队列等待。",
    },
    {
      id: "step-3",
      badge: "03 · 微任务 VIP 插队",
      headline: "主栈一空，Event Loop 必须先清空全部微任务",
      start: 11.0,
      duration: 5.5,
      activeNodes: ["micro", "loop", "stack"],
      activeEdges: ["e-micro-loop", "e-loop-stack"],
      packets: [
        { edgeId: "e-micro-loop", label: "取出微任务", tone: "success" },
        { edgeId: "e-loop-stack", label: "优先执行!", tone: "primary" },
      ],
      nodeStates: {
        loop: "检查微任务队列",
        stack: "执行 Promise.then",
      },
      metrics: [
        { label: "输出顺序", value: "Promise 先于 Timer", tone: "success" },
        { label: "MICROTASK", value: "全部清空 → 0", tone: "success" },
        { label: "MACROTASK", value: "1 仍在等待", tone: "warn" },
      ],
      callout: {
        title: "面试必考核心规则",
        body: "只要调用栈清空，Event Loop 第一件事就是把微任务队列彻底清空，哪怕微任务里又产生了新微任务。",
      },
      narration: "一旦主线程调用栈清空，事件循环会先检查微任务队列并全部执行完毕，所以 Promise 永远比 setTimeout 先输出。",
    },
    {
      id: "step-4",
      badge: "04 · 下一轮宏任务",
      headline: "微任务清零后，再取 1 个宏任务进入下一轮循环",
      start: 16.5,
      duration: 5.5,
      activeNodes: ["macro", "loop", "stack"],
      activeEdges: ["e-macro-loop", "e-loop-stack"],
      packets: [
        { edgeId: "e-macro-loop", label: "setTimeout 回调", tone: "warn" },
        { edgeId: "e-loop-stack", label: "下一轮 Tick", tone: "primary" },
      ],
      nodeStates: {
        stack: "执行 setTimeout",
        loop: "进入下一轮 Tick",
      },
      metrics: [
        { label: "循环节奏", value: "1 宏任务 + 全微任务", tone: "primary" },
        { label: "页面渲染", value: "微任务后按需重绘", tone: "success" },
        { label: "状态", value: "周而复始", tone: "default" },
      ],
      callout: {
        title: "一句话记住 Event Loop",
        body: "同步先跑 → 清空全部微任务 → 必要时渲染 UI → 取 1 个宏任务，这就是前端异步的底层心跳。",
      },
      narration: "直到微任务全部清零，事件循环才会从宏任务队列取出一个回调推入调用栈，如此周而复始，构成整个异步调度心跳。",
    },
  ],
  packaging: {
    enableIntro: true,
    introDuration: 2.5,
    enableOutro: true,
    outroDuration: 3.0,
    outroPoints: [
      "同步代码直接在 Call Stack 执行，异步回调交给 Web APIs",
      "主栈一空，Event Loop 必定先彻底清空 Microtask 微任务队列",
      "每轮 Tick 只取 1 个 Macrotask 宏任务，再循环清空微任务",
    ],
    outroCta: "点赞 · 收藏 · 关注，持续拆解硬核底层原理",
    bgmFile: "bgm-tech-01.wav",
    bgmLevel: "balanced",
  },
};
