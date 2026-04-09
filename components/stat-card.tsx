import type { ReactNode } from "react";

export function StatCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon?: ReactNode }) {
  return (
    <article className="panel stat-card">
      <div className="stat-head">
        <span>{label}</span>
        {icon ? <div className="stat-icon">{icon}</div> : null}
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}
