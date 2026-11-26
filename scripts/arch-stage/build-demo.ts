import { resolve } from "node:path";
import { writeArchStageProject } from "../../src/arch-stage/agent";
import { buildArchStage } from "../../src/arch-stage/builder";
import { eventLoopDemoSpec } from "../../src/arch-stage/demos/event-loop";
import { ragAgentDemoSpec } from "../../src/arch-stage/demos/rag-agent";

async function main() {
  const argIdx = process.argv.indexOf("--demo");
  const demo = argIdx >= 0 ? process.argv[argIdx + 1] : "event-loop";
  const spec = demo === "rag-agent" ? ragAgentDemoSpec : eventLoopDemoSpec;
  const outDir = resolve(process.cwd(), "hyperframes", spec.meta.id);

  const bundle = await buildArchStage(spec);
  writeArchStageProject(outDir, spec, bundle);
  console.log(`Built ArchStage demo: ${spec.meta.id} (${bundle.duration}s) -> ${outDir}`);
}

void main();
