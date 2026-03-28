import { ReactNode } from "react";

type SurfaceCardProps = {
  title: string;
  description?: string;
  children?: ReactNode;
  tone?: "default" | "mint" | "sand";
};

const toneClasses = {
  default: "flowholt-surface--default",
  mint: "flowholt-surface--mint",
  sand: "flowholt-surface--sand",
};

export function SurfaceCard({
  title,
  description,
  children,
  tone = "default",
}: SurfaceCardProps) {
  return (
    <section className={`flowholt-surface p-5 sm:p-6 ${toneClasses[tone]}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
            FlowHolt
          </p>
          <h3 className="flowholt-display mt-3 text-[1.55rem] leading-none text-stone-950">{title}</h3>
          {description ? <p className="mt-3 text-sm leading-7 text-stone-600">{description}</p> : null}
        </div>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
