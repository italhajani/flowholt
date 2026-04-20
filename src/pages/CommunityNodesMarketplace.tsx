import { useState, useMemo } from "react";
import {
  Search, Download, Star, Package, ExternalLink, CheckCircle2, AlertTriangle,
  User, Globe, Code2, Zap, Shield, Filter, X, Play, FileText, GitBranch,
  Heart, TrendingUp, Clock, Tag, ChevronRight, ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shell/PageHeader";
import { useCommunityNodes, useInstallCommunityNode, useUninstallCommunityNode } from "@/hooks/useApi";

/* ── Types ── */
interface CommunityNode {
  id: string;
  name: string;
  displayName: string;
  author: string;
  authorAvatar: string;
  description: string;
  longDescription: string;
  downloads: number;
  rating: number;
  ratingCount: number;
  tags: string[];
  installed: boolean;
  verified: boolean;
  version: string;
  updatedAt: string;
  nodeCount: number;
  license: string;
  repoUrl: string;
}

/* ── Mock data ── */
const mockNodes: CommunityNode[] = [
  {
    id: "cn-1", name: "n8n-nodes-airtable-plus", displayName: "Airtable Plus", author: "community", authorAvatar: "CM",
    description: "Extended Airtable operations — bulk upsert, formula evaluation, linked records.",
    longDescription: "Adds advanced Airtable operations including bulk upsert with duplicate detection, formula field evaluation, linked record resolution, and attachment management. Supports webhooks for real-time sync.",
    downloads: 12400, rating: 4.8, ratingCount: 156, tags: ["Database", "Productivity"], installed: true, verified: true, version: "2.1.0", updatedAt: "3 days ago", nodeCount: 4, license: "MIT", repoUrl: "#",
  },
  {
    id: "cn-2", name: "n8n-nodes-notion-advanced", displayName: "Notion Advanced", author: "notiondev", authorAvatar: "ND",
    description: "Advanced Notion integration with database rollups, relations, and template creation.",
    longDescription: "Full Notion API v2 support: database rollups and relations, template instantiation, block-level CRUD, page property bulk updates, and inline database creation.",
    downloads: 8900, rating: 4.6, ratingCount: 89, tags: ["Productivity", "AI"], installed: false, verified: true, version: "1.4.2", updatedAt: "1 week ago", nodeCount: 3, license: "MIT", repoUrl: "#",
  },
  {
    id: "cn-3", name: "n8n-nodes-openai-assistants", displayName: "OpenAI Assistants", author: "aitools", authorAvatar: "AI",
    description: "OpenAI Assistants API with thread management, file uploads, and function calling.",
    longDescription: "Complete OpenAI Assistants v2 API wrapper: create/manage assistants, thread-based conversations, file search and code interpreter tools, function calling with structured outputs, and streaming responses.",
    downloads: 22100, rating: 4.9, ratingCount: 312, tags: ["AI", "LLM"], installed: true, verified: true, version: "3.0.1", updatedAt: "2 days ago", nodeCount: 6, license: "Apache-2.0", repoUrl: "#",
  },
  {
    id: "cn-4", name: "n8n-nodes-pdf-tools", displayName: "PDF Tools", author: "docutils", authorAvatar: "DU",
    description: "Generate, merge, split, and extract text from PDF documents.",
    longDescription: "Comprehensive PDF toolkit: generate PDFs from HTML templates, merge multiple documents, split by page range, extract text and images, fill form fields, and add watermarks.",
    downloads: 6300, rating: 4.3, ratingCount: 45, tags: ["Documents", "Utilities"], installed: false, verified: false, version: "1.1.0", updatedAt: "2 weeks ago", nodeCount: 5, license: "MIT", repoUrl: "#",
  },
  {
    id: "cn-5", name: "n8n-nodes-vector-store", displayName: "Vector Store", author: "vectorlabs", authorAvatar: "VL",
    description: "Connect to Pinecone, Weaviate, Qdrant, ChromaDB for RAG workflows.",
    longDescription: "Unified vector database interface supporting Pinecone, Weaviate, Qdrant, ChromaDB, and Milvus. Includes embedding generation, similarity search, metadata filtering, and batch operations for RAG pipelines.",
    downloads: 15800, rating: 4.7, ratingCount: 201, tags: ["AI", "Database", "RAG"], installed: false, verified: true, version: "2.3.0", updatedAt: "5 days ago", nodeCount: 8, license: "MIT", repoUrl: "#",
  },
  {
    id: "cn-6", name: "n8n-nodes-twilio-plus", displayName: "Twilio Plus", author: "twiliofan", authorAvatar: "TF",
    description: "Extended Twilio with call recordings, IVR flows, and WhatsApp templates.",
    longDescription: "Enhanced Twilio integration: programmable voice with call recordings and transcription, IVR flow builder, WhatsApp template messages, SMS conversation tracking, and call analytics.",
    downloads: 4100, rating: 4.1, ratingCount: 28, tags: ["Communication"], installed: false, verified: false, version: "0.9.3", updatedAt: "1 month ago", nodeCount: 3, license: "MIT", repoUrl: "#",
  },
  {
    id: "cn-7", name: "n8n-nodes-stripe-advanced", displayName: "Stripe Advanced", author: "paydev", authorAvatar: "PD",
    description: "Advanced Stripe operations: subscriptions, invoices, checkout sessions, webhooks.",
    longDescription: "Full Stripe API coverage beyond basic charges: subscription lifecycle management, invoice generation, checkout session creation, webhook verification, customer portal, and usage-based billing metering.",
    downloads: 19200, rating: 4.8, ratingCount: 178, tags: ["Payments", "E-commerce"], installed: false, verified: true, version: "2.0.4", updatedAt: "4 days ago", nodeCount: 7, license: "MIT", repoUrl: "#",
  },
  {
    id: "cn-8", name: "n8n-nodes-github-actions", displayName: "GitHub Actions", author: "devtools", authorAvatar: "DT",
    description: "Trigger and manage GitHub Actions workflows, read artifacts, and manage secrets.",
    longDescription: "GitHub Actions integration: trigger workflow dispatches, read run status and logs, download artifacts, manage repository secrets, list available workflows, and cancel/re-run jobs.",
    downloads: 11300, rating: 4.5, ratingCount: 92, tags: ["DevOps", "Utilities"], installed: true, verified: true, version: "1.8.0", updatedAt: "1 week ago", nodeCount: 4, license: "MIT", repoUrl: "#",
  },
];

const categories = ["All", "AI", "Database", "Productivity", "Documents", "Communication", "Payments", "DevOps", "Utilities"] as const;
const sortOptions = ["Popular", "Newest", "Rating", "Name"] as const;

function formatDownloads(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

/* ── Component ── */
export function CommunityNodesMarketplace() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("Popular");
  const [selectedNode, setSelectedNode] = useState<CommunityNode | null>(null);
  const [installing, setInstalling] = useState<string | null>(null);

  const { data: apiNodes } = useCommunityNodes();
  const installMut = useInstallCommunityNode();
  const uninstallMut = useUninstallCommunityNode();

  const allNodes: CommunityNode[] = useMemo(() => {
    if (apiNodes && apiNodes.length > 0) {
      return apiNodes.map((n) => ({
        ...n,
        displayName: n.displayName,
        authorAvatar: n.author.slice(0, 2).toUpperCase(),
        longDescription: n.description,
        ratingCount: 0,
        updatedAt: "",
        nodeCount: 1,
        license: "MIT",
        repoUrl: "#",
      }));
    }
    return mockNodes;
  }, [apiNodes]);

  const filtered = allNodes
    .filter(n => {
      if (activeCategory !== "All" && !n.tags.includes(activeCategory)) return false;
      if (search && !n.name.toLowerCase().includes(search.toLowerCase()) && !n.description.toLowerCase().includes(search.toLowerCase()) && !n.displayName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "Popular") return b.downloads - a.downloads;
      if (sortBy === "Rating") return b.rating - a.rating;
      if (sortBy === "Name") return a.displayName.localeCompare(b.displayName);
      return 0;
    });

  const handleInstall = (nodeId: string) => {
    setInstalling(nodeId);
    installMut.mutate(nodeId, { onSettled: () => setInstalling(null) });
  };

  return (
    <div>
      <PageHeader
        title="Community Nodes"
        description="Browse, install, and manage community-built nodes to extend your workflows."
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-[12px] text-zinc-500 hover:bg-zinc-50 transition-colors">
              <Package size={13} /> My Installed ({allNodes.filter(n => n.installed).length})
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-zinc-800 transition-colors">
              <Code2 size={14} /> Publish Node
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Available", value: allNodes.length, icon: Package, color: "text-violet-600" },
          { label: "Installed", value: allNodes.filter(n => n.installed).length, icon: CheckCircle2, color: "text-green-600" },
          { label: "Total Downloads", value: formatDownloads(allNodes.reduce((s, n) => s + n.downloads, 0)), icon: Download, color: "text-blue-600" },
          { label: "Verified", value: allNodes.filter(n => n.verified).length, icon: Shield, color: "text-amber-600" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-zinc-200 bg-white p-3">
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={13} className={s.color} />
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">{s.label}</span>
            </div>
            <span className="text-[20px] font-semibold text-zinc-900">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Search + Categories + Sort */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search community nodes…"
            className="h-9 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-[13px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium transition-all whitespace-nowrap",
                activeCategory === c ? "bg-zinc-900 text-white" : "text-zinc-400 hover:bg-zinc-100"
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[11px] text-zinc-600 focus:outline-none"
        >
          {sortOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      {/* Node cards grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map(node => (
          <button
            key={node.id}
            onClick={() => setSelectedNode(node)}
            className="rounded-xl border border-zinc-200 bg-white p-4 text-left hover:border-zinc-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-[11px] font-bold text-zinc-600 flex-shrink-0">
                {node.authorAvatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-zinc-800 truncate">{node.displayName}</span>
                  {node.verified && <Shield size={11} className="text-blue-500 flex-shrink-0" />}
                  {node.installed && <CheckCircle2 size={11} className="text-green-500 flex-shrink-0" />}
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5">by {node.author} · v{node.version}</p>
              </div>
              <ChevronRight size={14} className="text-zinc-300 group-hover:text-zinc-500 transition-colors flex-shrink-0 mt-1" />
            </div>
            <p className="text-[11px] text-zinc-500 mt-2 line-clamp-2">{node.description}</p>
            <div className="flex items-center gap-3 mt-3 pt-2 border-t border-zinc-50">
              <span className="flex items-center gap-1 text-[10px] text-zinc-400"><Star size={10} className="text-amber-400 fill-amber-400" />{node.rating}</span>
              <span className="flex items-center gap-1 text-[10px] text-zinc-400"><Download size={10} />{formatDownloads(node.downloads)}</span>
              <span className="flex items-center gap-1 text-[10px] text-zinc-400"><Package size={10} />{node.nodeCount} nodes</span>
              <div className="flex-1" />
              {node.tags.slice(0, 2).map(t => (
                <span key={t} className="rounded-full bg-zinc-50 px-1.5 py-0.5 text-[9px] text-zinc-400 font-medium">{t}</span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package size={32} className="text-zinc-200 mb-2" />
          <p className="text-[13px] text-zinc-400">No community nodes match your search</p>
        </div>
      )}

      {/* Detail modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setSelectedNode(null)}>
          <div className="w-[600px] max-h-[80vh] rounded-2xl bg-white shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-zinc-100 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-[11px] font-bold text-zinc-600">
                  {selectedNode.authorAvatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-semibold text-zinc-900">{selectedNode.displayName}</h3>
                    {selectedNode.verified && <span className="flex items-center gap-0.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-medium text-blue-600"><Shield size={8} />Verified</span>}
                  </div>
                  <p className="text-[11px] text-zinc-400">{selectedNode.name} · v{selectedNode.version}</p>
                </div>
              </div>
              <button onClick={() => setSelectedNode(null)} className="rounded-lg p-1.5 hover:bg-zinc-100 transition-colors">
                <X size={16} className="text-zinc-400" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Action bar */}
              <div className="flex items-center gap-3">
                {selectedNode.installed ? (
                  <button className="flex items-center gap-1.5 rounded-lg bg-green-50 border border-green-200 px-4 py-2 text-[12px] font-medium text-green-700">
                    <CheckCircle2 size={13} /> Installed
                  </button>
                ) : (
                  <button
                    onClick={() => handleInstall(selectedNode.id)}
                    disabled={installing === selectedNode.id}
                    className={cn("flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12px] font-medium transition-colors",
                      installing === selectedNode.id
                        ? "bg-zinc-100 text-zinc-400"
                        : "bg-zinc-900 text-white hover:bg-zinc-800"
                    )}
                  >
                    {installing === selectedNode.id ? (
                      <><Clock size={13} className="animate-spin" /> Installing…</>
                    ) : (
                      <><Download size={13} /> Install</>
                    )}
                  </button>
                )}
                <a href={selectedNode.repoUrl} className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-[12px] text-zinc-500 hover:bg-zinc-50 transition-colors">
                  <ExternalLink size={12} /> Repository
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Downloads", value: formatDownloads(selectedNode.downloads), icon: Download },
                  { label: "Rating", value: `${selectedNode.rating} (${selectedNode.ratingCount})`, icon: Star },
                  { label: "Nodes", value: selectedNode.nodeCount, icon: Package },
                  { label: "Updated", value: selectedNode.updatedAt, icon: Clock },
                ].map(s => (
                  <div key={s.label} className="rounded-lg bg-zinc-50 p-2.5 text-center">
                    <s.icon size={12} className="text-zinc-400 mx-auto mb-1" />
                    <p className="text-[12px] font-semibold text-zinc-700">{s.value}</p>
                    <p className="text-[9px] text-zinc-400">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Description</h4>
                <p className="text-[12px] text-zinc-600 leading-relaxed">{selectedNode.longDescription}</p>
              </div>

              {/* Tags */}
              <div>
                <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.tags.map(t => (
                    <span key={t} className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500 font-medium">
                      <Tag size={8} />{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-3 space-y-2">
                {[
                  { label: "Author", value: selectedNode.author },
                  { label: "License", value: selectedNode.license },
                  { label: "Version", value: selectedNode.version },
                  { label: "Last Updated", value: selectedNode.updatedAt },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 font-medium">{row.label}</span>
                    <span className="text-[10px] text-zinc-600 font-medium">{row.value}</span>
                  </div>
                ))}
              </div>

              {!selectedNode.verified && (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
                  <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />
                  <p className="text-[11px] text-amber-700">This node is not verified. Install at your own risk.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
