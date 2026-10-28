export default function OrdersLoading() {
  return (
    <section aria-busy="true" aria-label="Loading your orders">
      <div className="skeleton-line short" style={{ height: 26, width: "30%" }} />
      <div className="skeleton-line" style={{ width: "48%" }} />

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
