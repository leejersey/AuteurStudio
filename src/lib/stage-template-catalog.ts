export type TemplateId =
  | "code-3-step"
  | "code-before-after"
  | "algo-binary-search"
  | "algo-bubble-sort"
  | "algo-reverse-list"
  | "algo-dp-grid";

export interface TemplateFieldDef {
  key: string;
  label: string;
  placeholder: string;
  defaultValue: string;
}

export interface StageTemplateMeta {
  id: TemplateId;
  engine: "code-stage" | "algo-stage";
  name: string;
  badge: string;
  description: string;
  fields: TemplateFieldDef[];
}

export const STAGE_TEMPLATES: StageTemplateMeta[] = [
  {
    id: "code-3-step",
    engine: "code-stage",
    name: "语法 3 步演进模板",
    badge: "CODE · 3步",
    description: "痛点写法 → 核心抽象 → 优雅最佳实践，生成后可点击「微调步骤」替换任意代码",
    fields: [
      { key: "title", label: "视频标题", placeholder: "例如：3 步掌握 TypeScript 泛型", defaultValue: "3 步掌握 TypeScript 泛型" },
      { key: "language", label: "编程语言", placeholder: "typescript / python / go", defaultValue: "typescript" },
      { key: "filename", label: "文件名", placeholder: "generics.ts", defaultValue: "generics.ts" },
    ],
  },
  {
    id: "code-before-after",
    engine: "code-stage",
    name: "重构前后对比模板",
    badge: "CODE · 对比",
    description: "Bad Practice 痛点代码 → 重构优化版 + 终端运行验证，适合技巧类短视频",
    fields: [
      { key: "title", label: "视频标题", placeholder: "告别深层嵌套：卫语句重构", defaultValue: "告别深层 if 嵌套：卫语句重构" },
      { key: "language", label: "编程语言", placeholder: "typescript / python / javascript", defaultValue: "typescript" },
      { key: "filename", label: "文件名", placeholder: "refactor.ts", defaultValue: "refactor.ts" },
    ],
  },
  {
    id: "algo-binary-search",
    engine: "algo-stage",
    name: "二分查找（自定义数组）",
    badge: "ARRAY · 双指针",
    description: "输入任意有序数组与目标值，沙箱真实运行并生成 L / mid / R 指针动画",
    fields: [
      { key: "nums", label: "有序数组（逗号分隔）", placeholder: "2, 7, 11, 15, 23, 31, 42", defaultValue: "2, 7, 11, 15, 23, 31, 42" },
      { key: "target", label: "目标值 target", placeholder: "23", defaultValue: "23" },
    ],
  },
  {
    id: "algo-bubble-sort",
    engine: "algo-stage",
    name: "冒泡排序（带交换弧线）",
    badge: "ARRAY · SWAP",
    description: "输入任意待排序数组（4~7 个数），沙箱真实运行并触发元素弧线互换动效",
    fields: [
      { key: "nums", label: "待排序数组（逗号分隔）", placeholder: "9, 4, 7, 2, 5", defaultValue: "9, 4, 7, 2, 5" },
    ],
  },
  {
    id: "algo-reverse-list",
    engine: "algo-stage",
    name: "单链表反转（自定义节点）",
    badge: "LINKED LIST",
    description: "输入任意链表节点值（3~6 个），沙箱真实执行 prev/curr/next 三指针翻转",
    fields: [
      { key: "nodes", label: "节点值（逗号分隔）", placeholder: "10, 20, 30, 40", defaultValue: "10, 20, 30, 40" },
    ],
  },
  {
    id: "algo-dp-grid",
    engine: "algo-stage",
    name: "DP 网格路径填表",
    badge: "MATRIX · DP",
    description: "输入网格行列数（如 3 × 4），沙箱真实填表并绘制 dp[i-1][j] + dp[i][j-1] 转移箭头",
    fields: [
      { key: "rows", label: "网格行数 (2~4)", placeholder: "3", defaultValue: "3" },
      { key: "cols", label: "网格列数 (2~5)", placeholder: "4", defaultValue: "4" },
    ],
  },
];
