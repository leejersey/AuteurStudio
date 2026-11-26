import type { ArchValidationIssue } from "./schema";

export const ARCH_STAGE_SYSTEM_PROMPT = `你是顶尖的计算机系统架构师与技术短视频导演。
你的任务是将任意系统原理、网络协议、分布式架构或框架机制，编排成一份结构化的「ArchStage」确定性拓扑动画脚本（JSON）。

必须严格遵守以下视觉与拓扑规范：
1. 节点网格布局（col: 0..3, row: 0..2）：
   - 全片节点数 4~7 个（太多会拥挤），任意两个节点的 (col, row) 坐标绝对不能相同；
   - 按数据流主方向从左到右（col 递增）或分层排布（row 0 上层，row 1 下层），保证连线清爽少交叉。
2. 连线（edges）：
   - 5~9 条，from/to 必须严格引用已定义的 node.id，不能自环；
   - 每条连线 label 简短清晰（<= 16 字符）。
3. 分步演绎（steps）：
   - 3~5 步，每步 duration 5~7 秒，start 从 0 开始严格连续衔接；
   - 每步必须指定 activeNodes、activeEdges，并至少包含 1~2 个 packets（数据包沿连线流动，支持 reverse: true 表示响应返回）；
   - 每步提供简洁有力的 callout（标题 + 40~75 字核心原理解释）、2~3 个实时 metrics 指标、以及适合口播的中文 narration（30~65 字，自然流畅）。
4. 字段约束：
   - 仅输出合法 JSON，严禁额外字段，必须完全符合 ArchStageSpec Schema。`;

export function buildArchStageUserPrompt(params: {
  topic: string;
  domain?: string;
  theme?: string;
  targetSteps?: number;
  referenceNotes?: string;
}): string {
  const stepHint = params.targetSteps ? `建议编排为 ${params.targetSteps} 步。` : "建议编排为 4 步。";
  const refBlock = params.referenceNotes?.trim()
    ? `\n参考笔记/源码上下文（请结合其中关键组件与流程拆解）：\n\`\`\`\n${params.referenceNotes.trim().slice(0, 3500)}\n\`\`\``
    : "";
  return `请为主题「${params.topic}」设计一套高质量的系统原理动画视频脚本（ArchStageSpec JSON）。
- 领域标签（meta.domain）：${params.domain || "SYSTEM ARCH"}
- 配色主题（meta.theme）：${params.theme || "dracula"}
- 画幅：1920x1080，30fps
- ${stepHint}
- 请同时配置 packaging（enableIntro: true, enableOutro: true, bgmFile: "bgm-tech-01.wav", outroPoints 提炼 3 条核心收获）。${refBlock}`;
}

export function buildArchStageRepairPrompt(
  previousJson: string,
  issues: ArchValidationIssue[],
): string {
  const list = issues.map((i, idx) => `${idx + 1}. [${i.gate}] ${i.message}`).join("\n");
  return `上一版 ArchStageSpec JSON 未通过校验门禁，请仅针对以下问题定点修复并输出完整的新 JSON：
${list}

上一版 JSON：
\`\`\`json
${previousJson}
\`\`\``;
}
