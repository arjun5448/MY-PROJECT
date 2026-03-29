const FILTERS = ["all", "due", "upcoming", "overdue"];

function FilterTabs({ activeFilter, onChange }) {
  return (
    <div className="filter-tabs">
      {FILTERS.map((filter) => (
        <button
          key={filter}
          type="button"
          className={activeFilter === filter ? "active" : ""}
          onClick={() => onChange(filter)}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}

export default FilterTabs;
