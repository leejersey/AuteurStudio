export default function CodeHighlight() {
  return (
    <section className="bg-surface-container-low rounded-xl border border-outline-variant/15 p-5 flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">
          BFS 算法实现
        </h3>
        <span className="text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
          Python
        </span>
      </div>
      <div className="bg-surface-container-lowest rounded-lg p-4 font-mono text-[11px] leading-relaxed flex-1 overflow-y-auto">
        <div className="text-on-surface-variant flex">
          <span className="min-w-4 text-on-surface-variant/40">1</span>
          <div>
            <span className="text-tertiary">while</span> queue:
          </div>
        </div>
        <div className="text-on-surface-variant flex pl-4">
          <span className="min-w-4 -ml-4 mr-4 text-on-surface-variant/40">
            2
          </span>
          <div>
            <span className="text-primary">for</span> _{" "}
            <span className="text-tertiary">in</span>{" "}
            <span className="text-secondary">range</span>(len(queue)):
          </div>
        </div>
        <div className="text-on-surface-variant flex pl-8">
          <span className="min-w-4 -ml-8 mr-8 text-on-surface-variant/40">
            3
          </span>
          <div>r, c = queue.popleft()</div>
        </div>
        <div className="text-on-surface-variant flex pl-8">
          <span className="min-w-4 -ml-8 mr-8 text-on-surface-variant/40">
            4
          </span>
          <div>
            <span className="text-primary">for</span> dr, dc{" "}
            <span className="text-tertiary">in</span> directions:
          </div>
        </div>
        <div className="text-on-surface-variant flex pl-12">
          <span className="min-w-4 -ml-12 mr-12 text-on-surface-variant/40">
            5
          </span>
          <div>nr, nc = r + dr, c + dc</div>
        </div>
        <div className="text-on-surface-variant bg-primary/10 border-l border-primary -ml-4 pl-[47px] py-1 my-1 flex">
          <span className="min-w-4 -ml-12 mr-8 text-primary font-bold">6</span>
          <div>
            <span className="text-primary">if</span> valid(nr, nc){" "}
            <span className="text-tertiary">and</span> grid[nr][nc] == 1:
          </div>
        </div>
        <div className="text-primary font-bold flex pl-16">
          <span className="min-w-4 -ml-16 mr-16 text-on-surface-variant/40 font-normal">
            7
          </span>
          <div>grid[nr][nc] = 2</div>
        </div>
        <div className="text-primary font-bold flex pl-16">
          <span className="min-w-4 -ml-16 mr-16 text-on-surface-variant/40 font-normal">
            8
          </span>
          <div>queue.append((nr, nc))</div>
        </div>
        <div className="text-on-surface-variant flex pl-4">
          <span className="min-w-4 -ml-4 mr-4 text-on-surface-variant/40">
            9
          </span>
          <div>time += 1</div>
        </div>
      </div>
    </section>
  );
}
