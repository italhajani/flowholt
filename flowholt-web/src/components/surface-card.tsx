import { ReactNode } from "react";

type SurfaceCardProps = {
  title: string;
  description?: string;
  children?: ReactNode;
  tone?: "default" | "mint" | "sand";
};

const toneClasses = {
  default: "bg-white",
  mint: "bg-[#edf5f0]",
  sand: "bg-[#f7ede1]",
};

export function SurfaceCard({
  title,
  description,
  children,
  tone = "default",
}: SurfaceCardProps) {
  return (
    <section
      className={`rounded-[1.75rem] border border-stone-900/10 p-5 shadow-[0_12px_40px_rgba(39,35,31,0.06)] ${toneClasses[tone]}`}
    >
      <h3 className="text-lg font-semibold text-stone-950">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
