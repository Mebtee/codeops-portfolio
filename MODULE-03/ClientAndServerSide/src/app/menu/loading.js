export default function MenuLoading() {
  return (
    <section aria-busy="true" aria-label="Loading dishes">
      <div className="skeleton-line short" style={{ height: 26, width: "35%" }} />
      <div className="skeleton-line" style={{ width: "55%" }} />
      <div className="skeleton-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="skeleton-card" key={index}>
            <div className="skeleton-line dot" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
          </div>
        ))}
      </div>
    </section>
  );
}
