import { AppShell } from "@/components/app-shell";
import { SurfaceCard } from "@/components/surface-card";

export default function DataPage() {
  return (
    <AppShell
      eyebrow="Data"
      title="Knowledge and memory"
      description="This section is for uploaded files, knowledge sources, retrieval collections, and any memory assets connected to agents."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <SurfaceCard title="Knowledge base" description="Documents and structured reference material." />
        <SurfaceCard title="Uploads" description="Files stored in Supabase Storage." tone="mint" />
        <SurfaceCard title="Retrieval collections" description="Future vector and semantic search layers." tone="sand" />
      </div>
    </AppShell>
  );
}
