export default function MessageBubble({
  role,
  content,
  time,
  type = "text",
  fileName,
}: {
  role: "user" | "ai";
  content: React.ReactNode;
  time?: string;
  type?: "text" | "file";
  fileName?: string;
}) {
  const isUser = role === "user";

  return (
    <div
      className={`flex flex-col gap-3 max-w-[90%] ${
        isUser ? "items-end ml-auto" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        {isUser ? (
          <>
            <span className="text-[10px] text-on-surface-variant/50">
              {time || "12:43 PM"}
            </span>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
              创作者
            </span>
          </>
        ) : (
          <>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
              AI 助手
            </span>
            <span className="text-[10px] text-on-surface-variant/50">
              {time || "12:42 PM"}
            </span>
          </>
        )}
      </div>

      <div
        className={`p-4 rounded-xl text-sm leading-relaxed text-on-surface/90 ${
          isUser
            ? "rounded-tr-none bg-secondary/10 border border-secondary/20 text-right"
            : "rounded-tl-none bg-surface-container-high border border-outline-variant/10"
        }`}
      >
        {content}
      </div>

      {type === "file" && fileName && !isUser && (
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-highest rounded-lg border border-outline-variant/20 cursor-pointer hover:border-primary/50 transition-all">
            <span className="material-symbols-outlined text-sm text-tertiary">
              javascript
            </span>
            <span className="text-[10px] font-mono text-on-surface-variant">
              {fileName}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
