import React, { useState, useRef } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, side = "bottom" }) => {
  const [visible, setVisible] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  const show = () => {
    timeout.current = setTimeout(() => setVisible(true), 400);
  };

  const hide = () => {
    clearTimeout(timeout.current);
    setVisible(false);
  };

  const positionClass = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
  };

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <div
          className={`absolute z-[100] px-2 py-1 text-[11px] font-medium text-white bg-[hsl(220,15%,18%)] rounded-md whitespace-nowrap pointer-events-none ${positionClass[side]}`}
          style={{ animation: "fade-in 0.12s ease-out" }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
