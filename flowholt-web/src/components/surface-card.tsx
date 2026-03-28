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
    <section className={`flowholt-surface p-5 ${toneClasses[tone]}`}>
      <h3 className="text-lg font-semibold text-stone-950">{title}</h3>
      {description ? <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
