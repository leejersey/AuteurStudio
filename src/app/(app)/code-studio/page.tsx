import CodeStudioClient from "@/components/code-studio/CodeStudioClient";
import { listStageProjects } from "@/lib/stage-projects";
import { readStudioSettings } from "@/lib/stage-settings";

export const dynamic = "force-dynamic";

export default async function CodeStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; theme?: string; mode?: string }>;
}) {
  const params = await searchParams;
  const initialProjects = listStageProjects();
  const settings = readStudioSettings();
  return (
    <CodeStudioClient
      initialProjects={initialProjects}
      initialSettings={settings}
      initialSlug={params.slug}
      initialTheme={params.theme}
      initialMode={params.mode}
    />
  );
}
