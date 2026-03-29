function StatCard({ label, value, accent }) {
  return (
    <div className="stat-card">
      <span className={`stat-accent ${accent}`} />
      <p>{label}</p>
      <h3>{value}</h3>
    </div>
  );
}

export default StatCard;
