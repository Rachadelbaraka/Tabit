export function MiniChart({ data, tone = "indigo" }: { data: Array<{ label: string; value: number }>; tone?: "indigo" | "slate" }) {
  const points = data.map((item, index) => `${(index / Math.max(data.length - 1, 1)) * 100},${100 - item.value}`).join(" ");

  return (
    <div className="panel chart-card">
      <div className="chart-header">
        <strong>{tone === "indigo" ? "Progression" : "Régularité"}</strong>
        <span>{data.length} points</span>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={`chart-svg ${tone}`}>
        <polyline fill="none" strokeWidth="3" points={points} />
      </svg>
      <div className="chart-labels">
        {data.filter((_, index) => index % Math.max(Math.floor(data.length / 4), 1) === 0).map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}
