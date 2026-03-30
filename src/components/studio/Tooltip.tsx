import React, { useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = "top", delay = 400 }) => {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const ref = useRef<HTMLDivElement>(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  };
  const hide = () => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
  };

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide} ref={ref}>
      {children}
      {visible && content && (
        <div
          className={`absolute z-[100] px-2 py-1 text-[11px] font-medium rounded-md whitespace-nowrap pointer-events-none animate-fade-in ${positionClasses[position]}`}
          style={{
            backgroundColor: "hsl(var(--tooltip-bg))",
            color: "hsl(var(--tooltip-fg))",
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
