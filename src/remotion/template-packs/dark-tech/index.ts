// template-packs/dark-tech/index.ts — 暗黑科技模板注册入口
// 将现有的 slide 组件注册为 "dark-tech" 模板

import { registerTemplate } from "../../template-registry";
import type { VideoTemplate } from "../../template-registry";

// ─── Card Slides (9:16) ───
import { TitleSlideComp } from "./card/TitleSlide";
import { NumberedListSlideComp } from "./card/NumberedListSlide";
import { ComparisonSlideComp } from "./card/ComparisonSlide";
import { StepsSlideComp } from "./card/StepsSlide";
import { QuoteSlideComp } from "./card/QuoteSlide";
import { EndingSlideComp } from "./card/EndingSlide";

// ─── Knowledge Slides (16:9) ───
import { LandscapeTitleSlide } from "./knowledge/LandscapeTitleSlide";
import { LandscapeContentSlide } from "./knowledge/LandscapeContentSlide";
import { LandscapeDiagramSlide } from "./knowledge/LandscapeDiagramSlide";
import { LandscapeEndingSlide } from "./knowledge/LandscapeEndingSlide";

// ─── Markdown Slides (16:9) ───
import { MarkdownTitleSlide } from "./markdown/MarkdownTitleSlide";
import { MarkdownContentSlide } from "./markdown/MarkdownContentSlide";
import { MarkdownCodeSlide } from "./markdown/MarkdownCodeSlide";
import { MarkdownEndingSlide } from "./markdown/MarkdownEndingSlide";

// ─── Algo Slides (16:9) ───
import { GridBoard } from "./algo/GridBoard";
import { StepIndicator } from "./algo/StepIndicator";
import { CodeHighlight } from "./algo/CodeHighlight";

const darkTechTemplate: VideoTemplate = {
  info: {
    id: "dark-tech",
    name: "暗黑科技",
    description: "深色背景 + 科技感光效 + 网格纹理，适合技术和 AI 相关内容",
    thumbnail:
      "linear-gradient(135deg, #0b0e14 0%, #161a21 40%, #00e2ee22 100%)",
    videoTypes: ["card", "algo", "knowledge", "markdown"],
  },
  card: {
    TitleSlide: TitleSlideComp,
    NumberedListSlide: NumberedListSlideComp,
    ComparisonSlide: ComparisonSlideComp,
    StepsSlide: StepsSlideComp,
    QuoteSlide: QuoteSlideComp,
    EndingSlide: EndingSlideComp,
  },
  knowledge: {
    LandscapeTitleSlide,
    LandscapeContentSlide,
    LandscapeDiagramSlide,
    LandscapeEndingSlide,
  },
  markdown: {
    MarkdownTitleSlide,
    MarkdownContentSlide,
    MarkdownCodeSlide,
    MarkdownEndingSlide,
  },
  algo: {
    GridBoard,
    StepIndicator,
    CodeHighlight,
  },
};

registerTemplate(darkTechTemplate);

export default darkTechTemplate;
