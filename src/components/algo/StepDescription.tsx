export default function StepDescription() {
  return (
    <section className="bg-surface-container-low rounded-xl border border-outline-variant/15 p-5">
      <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
        算法逻辑追踪
      </h3>
      <div className="p-3 bg-surface-container-high rounded border-l-2 border-primary">
        <p className="text-sm font-medium leading-relaxed text-on-surface">
          步骤 3: 腐烂扩散至 <span className="text-primary">(1,0)</span> 和{" "}
          <span className="text-primary">(0,1)</span>。
        </p>
        <p className="text-[11px] text-on-surface-variant mt-2 font-light">
          所有相邻的新鲜橘子将被加入 BFS 队列并标记为已腐烂。
        </p>
      </div>
    </section>
  );
}
