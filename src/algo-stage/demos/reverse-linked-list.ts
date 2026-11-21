import { runAlgorithmInSandbox } from "../sandbox";
import type { AlgoStageSpec } from "../schema";

const DISPLAY_CODE = `function reverseList(head) {
  let prev = null;
  let curr = head;

  while (curr !== null) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }

  return prev;
}`;

const RUNNER_CODE = `
const nodeIds = ["n1", "n2", "n3", "n4"];
const values = { n1: 1, n2: 2, n3: 3, n4: 4 };
const nextMap = { n1: "n2", n2: "n3", n3: "n4", n4: null };
const reversedSet = new Set();

function snapshotList(prevId, currId, nextId, activeEdge) {
  const edges = [];
  for (const id of nodeIds) {
    const target = nextMap[id];
    if (target) {
      const key = id + "->" + target;
      edges.push({
        from: id,
        to: target,
        state: key === activeEdge ? "active" : reversedSet.has(key) ? "reversed" : "default",
      });
    }
  }
  return {
    type: "linked-list",
    label: "Singly Linked List (1 → 2 → 3 → 4)",
    nodes: nodeIds.map((id) => ({
      id,
      value: values[id],
      state: id === currId ? "active" : id === prevId ? "sorted" : id === nextId ? "comparing" : "default",
    })),
    edges,
    pointers: [
      { name: "prev", nodeId: prevId, color: "#4ade80" },
      { name: "curr", nodeId: currId, color: "#38bdf8" },
      ...(nextId !== undefined ? [{ name: "next", nodeId: nextId, color: "#fbbf24" }] : []),
    ],
  };
}

let prev = null;
let curr = "n1";

tracer.step({
  line: 3,
  event: "init",
  note: "初始化 prev = null, curr = 节点 1",
  narration: "反转链表只需要三个指针。开始时 prev 指向空，curr 指向头节点 1。",
  vars: { prev: "null", curr: "Node(1)", next: "—" },
  structure: snapshotList(prev, curr, undefined, null),
});

while (curr !== null) {
  const next = nextMap[curr];

  tracer.step({
    line: 6,
    event: "update",
    note: "暂存 next = " + (next ? "Node(" + values[next] + ")" : "null") + "，防止断链",
    narration: "先用 next 记住当前节点的下一个节点，防止等会儿改指针把后面的链表弄丢。",
    vars: {
      prev: prev ? "Node(" + values[prev] + ")" : "null",
      curr: "Node(" + values[curr] + ")",
      next: next ? "Node(" + values[next] + ")" : "null",
    },
    structure: snapshotList(prev, curr, next, null),
  });

  nextMap[curr] = prev;
  const edgeKey = prev ? curr + "->" + prev : null;
  if (edgeKey) reversedSet.add(edgeKey);

  tracer.step({
    line: 7,
    event: "swap",
    note: "翻转指针：Node(" + values[curr] + ").next → " + (prev ? "Node(" + values[prev] + ")" : "null"),
    narration: "核心一步：把 curr 的 next 指针调头指向 prev，完成当前节点的原地反转。",
    vars: {
      prev: prev ? "Node(" + values[prev] + ")" : "null",
      curr: "Node(" + values[curr] + ")",
      next: next ? "Node(" + values[next] + ")" : "null",
    },
    structure: snapshotList(prev, curr, next, edgeKey),
  });

  prev = curr;
  curr = next;

  tracer.step({
    line: 9,
    event: "move",
    note: "双指针整体右移：prev = Node(" + values[prev] + "), curr = " + (curr ? "Node(" + values[curr] + ")" : "null"),
    narration: "接着 prev 和 curr 同步向前迈一步，准备反转下一个节点。",
    vars: {
      prev: "Node(" + values[prev] + ")",
      curr: curr ? "Node(" + values[curr] + ")" : "null",
      next: next ? "Node(" + values[next] + ")" : "null",
    },
    structure: snapshotList(prev, curr, undefined, null),
  });
}

tracer.step({
  line: 12,
  event: "done",
  note: "循环结束，返回新的头节点 prev = Node(" + values[prev] + ")",
  narration: "当 curr 走到空时循环结束，此时 prev 指向节点 4，就是反转后的新表头。",
  vars: { prev: "Node(" + values[prev] + ")", curr: "null", result: "Node(4)" },
  structure: snapshotList(prev, null, undefined, null),
});
`;

export function createReverseLinkedListSpec(): AlgoStageSpec {
  const exec = runAlgorithmInSandbox({ runnerCode: RUNNER_CODE });
  return {
    version: 1,
    meta: {
      id: "algo-reverse-linked-list",
      title: "三指针原地反转单链表",
      algorithm: "LINKED LIST",
      language: "javascript",
      filename: "reverseList.js",
      shikiTheme: "dracula",
      complexity: { time: "O(n)", space: "O(1)" },
      width: 1920,
      height: 1080,
      fps: 30,
    },
    code: DISPLAY_CODE,
    frames: exec.frames,
  };
}
