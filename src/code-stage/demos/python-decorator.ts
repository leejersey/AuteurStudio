import type { CodeStageSpec } from "../schema";

/**
 * 样片：Python 装饰器（4 步代码演进 + 聚光灯聚焦 + 悬浮批注 + 模拟终端）
 */
export const pythonDecoratorDemoSpec: CodeStageSpec = {
  version: 1,
  meta: {
    id: "python-decorator-demo",
    title: "3 步彻底搞懂 Python 装饰器",
    subtitle: "从重复计时代码到优雅的 @timer 语法糖",
    language: "python",
    shikiTheme: "dracula",
    width: 1920,
    height: 1080,
    fps: 30,
  },
  steps: [
    {
      id: "step-1-pain",
      start: 0,
      duration: 8.5,
      badge: "01 · 重复痛点",
      headline: "每个函数都要手写计时逻辑？",
      filename: "metrics.py",
      code: `import time

def fetch_users():
    start = time.perf_counter()
    time.sleep(0.2)
    cost = time.perf_counter() - start
    print(f"fetch_users 耗时 {cost:.2f}s")

def sync_orders():
    start = time.perf_counter()
    time.sleep(0.35)
    cost = time.perf_counter() - start
    print(f"sync_orders 耗时 {cost:.2f}s")`,
      focusLines: [4, 6, 7, 10, 12, 13],
      callout: {
        line: 4,
        title: "样板代码四处重复",
        body: "业务逻辑只有一行 sleep，却混入了大量一模一样的计时与打印代码，极难维护。",
        tone: "warn",
      },
      narration: "平时写项目，如果想统计每个函数的耗时，最直观的做法是在函数首尾手写计时代码，但很快就会到处重复。",
    },
    {
      id: "step-2-wrapper",
      start: 8.5,
      duration: 9.5,
      badge: "02 · 高阶函数",
      headline: "把计时逻辑抽离成包装函数 timer",
      filename: "metrics.py",
      code: `import time

def timer(fn):
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = fn(*args, **kwargs)
        cost = time.perf_counter() - start
        print(f"{fn.__name__} 耗时 {cost:.2f}s")
        return result
    return wrapper

def fetch_users():
    time.sleep(0.2)`,
      focusLines: [3, 4, 6, 10],
      callout: {
        line: 6,
        title: "装饰器的本质",
        body: "接收原函数 fn，返回一个增强后的 wrapper 函数，在调用前后统一织入计时逻辑。",
        tone: "info",
      },
      narration: "其实装饰器的本质非常简单：写一个高阶函数 timer，接收原函数，在内部包装好计时逻辑再把新函数返回出去。",
    },
    {
      id: "step-3-sugar",
      start: 18.0,
      duration: 9.5,
      badge: "03 · @ 语法糖",
      headline: "用 @timer 一行无侵入接入",
      filename: "metrics.py",
      code: `import time

def timer(fn):
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = fn(*args, **kwargs)
        cost = time.perf_counter() - start
        print(f"{fn.__name__} 耗时 {cost:.2f}s")
        return result
    return wrapper

@timer
def fetch_users():
    time.sleep(0.2)

@timer
def sync_orders():
    time.sleep(0.35)

fetch_users()
sync_orders()`,
      focusLines: [12, 16, 20, 21],
      callout: {
        line: 12,
        title: "@timer 等价于赋值替换",
        body: "@timer 只是语法糖，Python 会在定义时自动执行 fetch_users = timer(fetch_users)。",
        tone: "success",
      },
      terminal: {
        title: "python3 metrics.py",
        command: "python3 metrics.py",
        lines: [
          { text: "fetch_users 耗时 0.20s", tone: "success" },
          { text: "sync_orders 耗时 0.35s", tone: "success" },
          { text: "Process finished with exit code 0", tone: "dim" },
        ],
      },
      narration: "加上 @timer 语法糖，业务函数瞬间恢复清爽。运行程序，两个函数都会自动输出精准的执行耗时。",
    },
    {
      id: "step-4-wraps",
      start: 27.5,
      duration: 8.5,
      badge: "04 · 生产级细节",
      headline: "别忘了 @wraps(fn) 保留函数元信息",
      filename: "metrics.py",
      code: `import time
from functools import wraps

def timer(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = fn(*args, **kwargs)
        cost = time.perf_counter() - start
        print(f"{fn.__name__} 耗时 {cost:.2f}s")
        return result
    return wrapper

@timer
def fetch_users():
    time.sleep(0.2)

print(fetch_users.__name__)`,
      focusLines: [2, 5, 18],
      callout: {
        line: 5,
        title: "为什么必须加 @wraps(fn)",
        body: "不加 wraps 时，fetch_users.__name__ 会变成 'wrapper'，容易影响日志、路由与文档生成。",
        tone: "info",
      },
      terminal: {
        title: "python3 metrics.py",
        command: "python3 -c 'import metrics'",
        lines: [
          { text: "fetch_users", tone: "success" },
          { text: "✓ 原函数名与 docstring 已完整保留", tone: "dim" },
        ],
      },
      narration: "最后一步生产级细节：给 wrapper 加上 functools.wraps，这样原函数的名字和文档注释才不会被覆盖。",
    },
  ],
};
