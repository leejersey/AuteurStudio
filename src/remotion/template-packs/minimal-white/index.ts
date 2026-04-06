// template-packs/minimal-white/index.ts — 极简白色模板注册入口
import { registerTemplate } from "../../template-registry";
import type { VideoTemplate } from "../../template-registry";
import { MINIMAL_WHITE_THEME } from "../../default-themes";

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

const minimalWhiteTemplate: VideoTemplate = {
  info: {
    id: "minimal-white",
    name: "极简白色",
    description: "白色背景 + 衬线标题 + 卡片式排版，适合干净专业的内容呈现",
    thumbnail:
      "linear-gradient(135deg, #fafafa 0%, #f0f0f0 50%, #3b82f615 100%)",
    videoTypes: ["card", "algo", "knowledge", "markdown"],
  },
  theme: MINIMAL_WHITE_THEME,
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

registerTemplate(minimalWhiteTemplate);

export default minimalWhiteTemplate;
