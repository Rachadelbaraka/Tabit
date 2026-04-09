import type { ReactNode } from "react";

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <section className="panel empty-state">
      <div className="empty-gradient" />
      <strong>{title}</strong>
      <p>{body}</p>
      {action}
    </section>
  );
}
