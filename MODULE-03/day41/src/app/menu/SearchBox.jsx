"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import DishList from "@/components/DishList";

const DEBOUNCE_MS = 400;

export default function SearchBox({ initial, children }) {
  const [term, setTerm] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const restored = useRef(false);

  // The server always seeds page 1, so a deep link picks up ?page= here.
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const fromUrl = Number.parseInt(
      new URLSearchParams(window.location.search).get("page") ?? "1",
      10
    );
    if (fromUrl > 1) setPage(fromUrl);
  }, []);

  // Only the settled term becomes part of a query key.
  useEffect(() => {
    const settled = term.trim();
    const timer = setTimeout(() => {
      setQ(settled);
      if (settled) setPage(1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [term]);

  // The page number lives in the query string (shallow, no server round trip).
  useEffect(() => {
    const url = page > 1 ? `?page=${page}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [page]);

  const live = q !== "" || page !== 1;
  const key = live
    ? `/api/dishes?${new URLSearchParams({
        ...(q ? { q } : {}),
        page: String(page),
        pageSize: String(initial.pageSize),
      })}`
    : null;

  const { data, error, isValidating } = useSWR(key, fetcher, {
    fallbackData: initial,
    keepPreviousData: true,
    staleTime: 30000,
    revalidateOnFocus: false,
  });

  const view = key ? data ?? initial : initial;
  const dishes = view.data;
  const totalPages = view.totalPages;
  const count = view.total;

  const goTo = (next) => {
    setPage(Math.min(Math.max(1, next), totalPages));
  };

  const meta = q
    ? `${count} match${count === 1 ? "" : "es"} for “${q}” · page ${view.page} of ${totalPages}`
    : `${count} dishes · page ${view.page} of ${totalPages}`;

  return (
    <section className="menu-live" data-view={key ? "live" : "default"}>
      <div className="menu-tools">
        <input
          className="menu-search"
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search dishes — e.g. shiro"
          aria-label="Search dishes"
          autoComplete="off"
        />
        <span className="menu-count" aria-live="polite">
          {error ? "Search unavailable — showing the last loaded list." : meta}
          {!error && isValidating && key ? " · searching…" : ""}
        </span>
      </div>

      <noscript>
        <p className="no-results">
          Search and paging run in the browser — without JavaScript you get
          page 1 only.
        </p>
      </noscript>

      {key ? (
        dishes.length ? (
          <DishList dishes={dishes} />
        ) : (
          <p className="no-results">No dishes match “{q}”.</p>
        )
      ) : (
        children
      )}

      <nav className="menu-pager" aria-label="Menu pages">
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
        >
          ← Previous
        </button>
        <span className="page-of">
          Page {view.page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={page >= totalPages}
        >
          Next →
        </button>
      </nav>
    </section>
  );
}
