"use client";

import type { WorkflowStage } from "@/lib/types/workflow";

interface WorkflowStepperProps {
  currentStage: WorkflowStage;
  onStageClick?: (stage: WorkflowStage) => void;
}

const STEPS: { stage: WorkflowStage; label: string; icon: string }[] = [
  { stage: "topics", label: "选题", icon: "lightbulb" },
  { stage: "script", label: "文案", icon: "edit_note" },
  { stage: "video", label: "视频", icon: "movie" },
  { stage: "done", label: "完成", icon: "check_circle" },
];

const STAGE_ORDER: WorkflowStage[] = [
  "idle",
  "topics",
  "script",
  "video",
  "done",
];

export default function WorkflowStepper({
  currentStage,
}: WorkflowStepperProps) {
  const currentIdx = STAGE_ORDER.indexOf(currentStage);

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-lowest/50 border-b border-outline-variant/10">
      {STEPS.map((step, i) => {
        const stepIdx = STAGE_ORDER.indexOf(step.stage);
        const isActive = currentStage === step.stage;
        const isCompleted = currentIdx > stepIdx;
        const isPending = currentIdx < stepIdx;

        return (
          <div key={step.stage} className="flex items-center gap-2 flex-1">
            {/* Step Indicator */}
            <div
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all
                ${
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : isCompleted
                    ? "bg-primary/5 text-primary/60"
                    : "text-on-surface-variant/30"
                }
              `}
            >
              <span
                className={`material-symbols-outlined text-sm ${
                  isCompleted ? "text-primary/60" : ""
                }`}
                style={{
                  fontVariationSettings: isCompleted ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {isCompleted ? "check_circle" : step.icon}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </div>

            {/* Connector Line */}
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px relative">
                <div className="absolute inset-0 bg-outline-variant/15" />
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                    isCompleted
                      ? "bg-primary/40 w-full"
                      : isActive
                      ? "bg-primary/20 w-1/2"
                      : "w-0"
                  }`}
                  style={{
                    opacity: isPending ? 0 : 1,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
