"use client";

interface FilterNavigationProps {
  activeFilter: "all" | "card" | "algo" | "knowledge" | "markdown";
  onFilterChange: (filter: "all" | "card" | "algo" | "knowledge" | "markdown") => void;
  projectCounts: {
    card: number;
    algo: number;
    knowledge: number;
    markdown: number;
  };
}

const filters: {
  key: "all" | "card" | "algo" | "knowledge" | "markdown";
  label: string;
  suffix?: string;
}[] = [
  { key: "all", label: "全部项目" },
  { key: "card", label: "图文视频", suffix: "(9:16)" },
  { key: "algo", label: "算法动画", suffix: "(16:9)" },
  { key: "knowledge", label: "知识讲解", suffix: "(16:9)" },
  { key: "markdown", label: "Markdown", suffix: "(16:9)" },
];

export default function FilterNavigation({
  activeFilter,
  onFilterChange,
  projectCounts,
}: FilterNavigationProps) {
  const getCount = (key: string) => {
    if (key === "all")
      return projectCounts.card + projectCounts.algo + projectCounts.knowledge + projectCounts.markdown;
    return projectCounts[key as keyof typeof projectCounts] || 0;
  };

  return (
    <div className="flex items-center justify-between pt-6 border-t border-outline-variant/10">
      <nav className="flex items-center space-x-8 text-sm font-label uppercase tracking-widest overflow-x-auto scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className={`pb-3 whitespace-nowrap transition-colors ${
              activeFilter === f.key
                ? "text-primary border-b-2 border-primary font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {f.label}
            {f.suffix ? ` ${f.suffix}` : ""}
            {" "}
            <span className="text-[10px] opacity-60">
              {getCount(f.key)}
            </span>
          </button>
        ))}
      </nav>
      <div className="flex items-center space-x-3 text-on-surface-variant shrink-0">
        <button
          className="p-2 hover:bg-surface-container rounded transition-colors"
          title="列表视图"
        >
          <span className="material-symbols-outlined">view_list</span>
        </button>
        <button
          className="p-2 bg-surface-container text-primary rounded transition-colors"
          title="网格视图"
        >
          <span className="material-symbols-outlined">grid_view</span>
        </button>
      </div>
    </div>
  );
}
