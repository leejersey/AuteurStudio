"use client";

import { useState } from "react";
import SideNavBar from "@/components/layout/SideNavBar";
import LibraryHeader from "@/components/library/LibraryHeader";
import FeaturedProject from "@/components/library/FeaturedProject";
import FilterNavigation from "@/components/library/FilterNavigation";
import VideoGallery from "@/components/library/VideoGallery";
import { useProjects } from "@/hooks/useProjects";

export default function LibraryPage() {
  const [activeFilter, setActiveFilter] = useState<
    "all" | "card" | "algo" | "knowledge" | "markdown"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { projects, totalCount, isLoading, deleteProject, refetch } =
    useProjects({
      type: activeFilter === "all" ? undefined : activeFilter,
      search: searchQuery || undefined,
    });

  const featuredProject = projects.length > 0 ? projects[0] : null;

  const handleFilterChange = (
    filter: "all" | "card" | "algo" | "knowledge" | "markdown"
  ) => {
    setActiveFilter(filter);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="flex min-h-screen">
      <SideNavBar />

      <main className="flex-1 min-w-0 flex flex-col bg-background relative overflow-y-auto">
        {/* 1. Top Section: Project Details / Featured & Controls */}
        <section className="bg-surface-container-low/30 border-b border-outline-variant/10 pb-8 pt-6">
          <div className="px-8 md:px-12 flex flex-col space-y-8">
            <LibraryHeader
              totalCount={totalCount}
              onSearch={handleSearch}
            />
            {featuredProject && (
              <FeaturedProject project={featuredProject} />
            )}
            <FilterNavigation
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              projectCounts={{
                card: projects.filter((p) => p.videoType === "card").length,
                algo: projects.filter((p) => p.videoType === "algo").length,
                knowledge: projects.filter((p) => p.videoType === "knowledge").length,
                markdown: projects.filter((p) => p.videoType === "markdown").length,
              }}
            />
          </div>
        </section>

        {/* 2. Bottom Section: Video Content Gallery */}
        <section className="flex-1 p-8 md:p-12">
          <VideoGallery
            projects={projects}
            isLoading={isLoading}
            onDelete={deleteProject}
            onRefresh={refetch}
          />
        </section>

        {/* Background Decoration Gradients */}
        <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      </main>
    </div>
  );
}
