const BAR_ITEMS = [
  { key: "due", label: "Due", color: "#f59e0b" },
  { key: "upcoming", label: "Upcoming", color: "#2563eb" },
  { key: "overdue", label: "Overdue", color: "#dc2626" }
];

function StatusBarChart({ stats }) {
  const maxValue = Math.max(stats.due, stats.upcoming, stats.overdue, 1);

  return (
    <div className="panel chart-panel">
      <div className="panel-header compact">
        <div>
          <span className="eyebrow">Bar graph</span>
          <h2>Policy status view</h2>
        </div>
      </div>

      <div className="bar-chart">
        {BAR_ITEMS.map((item) => {
          const value = stats[item.key];
          const height = `${Math.max((value / maxValue) * 100, value > 0 ? 18 : 6)}%`;

          return (
            <div className="bar-column" key={item.key}>
              <span className="bar-value">{value}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ height, background: item.color }} />
              </div>
              <p>{item.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StatusBarChart;
