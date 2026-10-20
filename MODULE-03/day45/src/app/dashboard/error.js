"use client";

export default function DashboardError({ error, reset }) {
  return (
    <section>
      <h1 className="page-title">Dashboard</h1>
      <div className="error-box" role="alert">
        <h2>The dashboard could not load</h2>
        <p>
          Aggregating the orders failed upstream, so no numbers are shown
          rather than showing stale ones.{" "}
          {error?.message ? `The server said: ${error.message}` : ""}
        </p>
        <button type="button" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </section>
  );
}
