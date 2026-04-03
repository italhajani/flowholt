import React, { useState, useRef, useEffect } from "react";
import { Plus, Sparkles, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreateFlowButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        id="create-flow-button"
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold bg-primary text-white hover:bg-[hsl(211,64%,28%)] transition-colors duration-150 active:scale-[0.98]"
      >
        <Plus size={15} strokeWidth={2.5} />
        Create Flow
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-lg shadow-lg border border-[hsl(210,14%,92%)] py-1 z-50" style={{ animation: "fade-in 0.12s ease-out" }}>
          <button
            onClick={() => { setOpen(false); navigate("/studio/new"); }}
            id="create-blank-workflow"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-[hsl(210,14%,97%)] transition-colors duration-150 text-left"
          >
            <FileText size={15} className="text-[hsl(215,10%,46%)]" />
            <div>
              <div className="text-[12px] font-medium text-[hsl(215,25%,15%)]">Blank Workflow</div>
              <div className="text-[10px] text-[hsl(215,10%,55%)]">Start from scratch</div>
            </div>
          </button>
          <div className="mx-2 h-px bg-[hsl(210,14%,92%)]" />
          <button
            onClick={() => { setOpen(false); navigate("/studio/ai-generate"); }}
            id="create-ai-workflow"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-[hsl(210,14%,97%)] transition-colors duration-150 text-left"
          >
            <Sparkles size={15} className="text-violet-500" />
            <div>
              <div className="text-[12px] font-medium text-[hsl(215,25%,15%)]">Generate with AI</div>
              <div className="text-[10px] text-[hsl(215,10%,55%)]">Describe in natural language</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateFlowButton;
