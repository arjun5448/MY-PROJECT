const COLORS = ["#0f766e", "#2563eb", "#f59e0b", "#dc2626"];

function CyclePieChart({ clients }) {
  const cycleCounts = clients.reduce((accumulator, client) => {
    accumulator[client.premiumCycle] = (accumulator[client.premiumCycle] || 0) + 1;
    return accumulator;
  }, {});

  const entries = Object.entries(cycleCounts);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  if (total === 0) {
    return (
      <div className="panel chart-panel">
        <div className="panel-header compact">
          <div>
            <span className="eyebrow">Pie chart</span>
            <h2>Premium cycle split</h2>
          </div>
        </div>
        <div className="empty-state">
          <h3>No data yet</h3>
          <p>Add clients to visualize premium-cycle distribution.</p>
        </div>
      </div>
    );
  }

  let cumulative = 0;
  const radius = 72;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="panel chart-panel">
      <div className="panel-header compact">
        <div>
          <span className="eyebrow">Pie chart</span>
          <h2>Premium cycle split</h2>
        </div>
      </div>

      <div className="pie-layout">
        <svg viewBox="0 0 180 180" className="pie-chart" aria-label="Premium cycle pie chart">
          <g transform="translate(90,90) rotate(-90)">
            {entries.map(([cycle, value], index) => {
              const fraction = value / total;
              const segmentLength = fraction * circumference;
              const segment = (
                <circle
                  key={cycle}
                  r={radius}
                  cx="0"
                  cy="0"
                  fill="transparent"
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth="26"
                  strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                  strokeDashoffset={-cumulative}
                />
              );
              cumulative += segmentLength;
              return segment;
            })}
          </g>
          <text x="50%" y="48%" textAnchor="middle" className="pie-total">
            {total}
          </text>
          <text x="50%" y="58%" textAnchor="middle" className="pie-subtext">
            policies
          </text>
        </svg>

        <div className="pie-legend">
          {entries.map(([cycle, value], index) => (
            <div key={cycle} className="legend-item">
              <span className="legend-dot" style={{ background: COLORS[index % COLORS.length] }} />
              <span>{cycle.replaceAll("_", " ")}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CyclePieChart;
