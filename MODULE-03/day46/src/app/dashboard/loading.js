export default function DashboardLoading() {
  return (
    <section aria-busy="true" aria-label="Loading the dashboard">
      <div className="skeleton-line short" style={{ height: 26, width: "28%" }} />
      <div className="skeleton-line" style={{ width: "52%" }} />

      <div className="stat-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="skeleton-card" style={{ minHeight: 108 }} key={index}>
            <div className="skeleton-line short" />
            <div className="skeleton-line" style={{ width: "70%", height: 22 }} />
          </div>
        ))}
      </div>

      <div className="skeleton-line" style={{ height: 340, borderRadius: 14 }} />
      <div className="skeleton-line" style={{ height: 300, borderRadius: 14 }} />

      <div className="skeleton-table">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="skeleton-row" key={index}>
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        ))}
      </div>
    </section>
  );
}
