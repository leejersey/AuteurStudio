"use client";

import { useState, useEffect, useRef } from "react";

interface LibraryHeaderProps {
  totalCount: number;
  onSearch: (query: string) => void;
}

export default function LibraryHeader({
  totalCount,
  onSearch,
}: LibraryHeaderProps) {
  const [searchInput, setSearchInput] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(searchInput);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput, onSearch]);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-1">
        <div className="flex items-center space-x-3 text-xs font-bold text-primary tracking-widest uppercase">
          <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
            正在查看
          </span>
          <span>•</span>
          <span className="text-on-surface-variant">
            所有项目 ({totalCount})
          </span>
        </div>
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-on-surface tracking-tight mt-2">
          视频历史库
        </h1>
      </div>
      {/* Search & User Actions */}
      <div className="flex items-center space-x-4">
        <div className="relative group">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-sm"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            search
          </span>
          <input
            className="bg-surface-container-lowest border border-outline-variant/30 focus:ring-1 focus:ring-primary/50 focus:border-primary/50 rounded-lg pl-10 pr-4 py-2 text-sm w-full md:w-72 transition-all duration-300 outline-none"
            placeholder="搜索项目、标签或格式..."
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </div>
    </div>
  );
}
