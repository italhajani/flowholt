import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, Download, Star, Package, ExternalLink, CheckCircle2,
  AlertTriangle, User, Globe, Code2, Zap, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommunityNodes } from "@/hooks/useApi";

/* Mock community nodes */
interface CommunityNode {
  id: string;
  name: string;
  author: string;
  description: string;
  downloads: number;
  rating: number;
  tags: string[];
  installed: boolean;
  verified: boolean;
  version: string;
}

const mockNodes: CommunityNode[] = [
  {
    id: "cn-1", name: "n8n-nodes-airtable-plus", author: "community",
    description: "Extended Airtable operations — bulk upsert, formula evaluation, linked records.",
    downloads: 12400, rating: 4.8, tags: ["Database", "Productivity"], installed: true, verified: true, version: "2.1.0",
  },
  {
    id: "cn-2", name: "n8n-nodes-notion-advanced", author: "notiondev",
    description: "Advanced Notion integration with database rollups, relations, and template creation.",
    downloads: 8900, rating: 4.6, tags: ["Productivity", "AI"], installed: false, verified: true, version: "1.4.2",
  },
  {
    id: "cn-3", name: "n8n-nodes-openai-assistants", author: "aitools",
    description: "OpenAI Assistants API with thread management, file uploads, and function calling.",
    downloads: 22100, rating: 4.9, tags: ["AI", "LLM"], installed: true, verified: true, version: "3.0.1",
  },
  {
    id: "cn-4", name: "n8n-nodes-pdf-tools", author: "docutils",
    description: "Generate, merge, split, and extract text from PDF documents.",
    downloads: 6300, rating: 4.3, tags: ["Documents", "Utilities"], installed: false, verified: false, version: "1.1.0",
  },
  {
    id: "cn-5", name: "n8n-nodes-vector-store", author: "vectorlabs",
    description: "Connect to Pinecone, Weaviate, Qdrant, ChromaDB for RAG workflows.",
    downloads: 15800, rating: 4.7, tags: ["AI", "Database", "RAG"], installed: false, verified: true, version: "2.3.0",
  },
  {
    id: "cn-6", name: "n8n-nodes-twilio-plus", author: "twiliofan",
    description: "Extended Twilio with call recordings, IVR flows, and WhatsApp templates.",
    downloads: 4100, rating: 4.1, tags: ["Communication"], installed: false, verified: false, version: "0.9.3",
  },
];

const categories = ["All", "AI", "Database", "Productivity", "Documents", "Communication", "Utilities"] as const;

export function CommunityNodesSettings() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [filter, setFilter] = useState<"all" | "installed">("all");

  const { data: apiNodes } = useCommunityNodes();
  const allNodes: CommunityNode[] = useMemo(() => {
    if (apiNodes && apiNodes.length > 0)
      return apiNodes.map((n) => ({ ...n, displayName: undefined } as unknown as CommunityNode));
    return mockNodes;
  }, [apiNodes]);

  const filtered = allNodes.filter((n) => {
    if (filter === "installed" && !n.installed) return false;
    if (activeCategory !== "All" && !n.tags.includes(activeCategory)) return false;
    if (search && !n.name.toLowerCase().includes(search.toLowerCase()) && !n.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[16px] font-semibold text-zinc-900">Community Nodes</h2>
        <p className="text-[13px] text-zinc-500 mt-1">Browse and install community-built nodes to extend your workflows.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase">Installed</p>
          <p className="text-[18px] font-semibold text-zinc-800">{allNodes.filter((n) => n.installed).length}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase">Available</p>
          <p className="text-[18px] font-semibold text-zinc-800">{allNodes.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase">Updates</p>
          <p className="text-[18px] font-semibold text-amber-600">1</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <Input
          prefix={<Search size={13} />}
          placeholder="Search community nodes…"
          className="w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilter("all")}
            className={cn("rounded-md px-2.5 py-1 text-[12px] font-medium transition-all", filter === "all" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:bg-zinc-50")}
          >
            All
          </button>
          <button
            onClick={() => setFilter("installed")}
            className={cn("rounded-md px-2.5 py-1 text-[12px] font-medium transition-all", filter === "installed" ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:bg-zinc-50")}
          >
            Installed
          </button>
        </div>
        <div className="flex items-center gap-1 ml-2 border-l border-zinc-200 pl-3">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium transition-all",
                activeCategory === c ? "bg-blue-50 text-blue-700" : "text-zinc-400 hover:bg-zinc-50"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Node cards */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((node) => (
          <div key={node.id} className="rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-300 transition-colors">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
                <Package size={18} className="text-zinc-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-zinc-800">{node.name}</span>
                  {node.verified && (
                    <span className="flex items-center gap-0.5 text-[9px] text-blue-600">
                      <Shield size={9} /> Verified
                    </span>
                  )}
                  <Badge variant="outline">{node.version}</Badge>
                </div>
                <p className="text-[12px] text-zinc-500 mt-0.5">{node.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <User size={9} /> {node.author}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <Download size={9} /> {(node.downloads / 1000).toFixed(1)}k
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-amber-500">
                    <Star size={9} /> {node.rating}
                  </span>
                  <div className="flex items-center gap-1">
                    {node.tags.map((t) => (
                      <span key={t} className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] text-zinc-500">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                {node.installed ? (
                  <Badge variant="neutral">
                    <CheckCircle2 size={10} /> Installed
                  </Badge>
                ) : (
                  <Button variant="secondary" size="sm">
                    <Download size={12} /> Install
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Risk notice */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-2">
        <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-[12px] font-medium text-amber-800">Community nodes run in your environment</p>
          <p className="text-[11px] text-amber-600 mt-0.5">
            Only install nodes from trusted authors. Verified nodes have been reviewed for security best practices.
          </p>
        </div>
      </div>
    </div>
  );
}
