// Tiny hand-drawn icon set for the footer — kept local since no icon
// library is installed in this project (see package.json).

export function CoffeeIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 8h13v6a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z" />
      <path d="M16 9h2a2.5 2.5 0 0 1 0 5h-2" />
      <path d="M6 2.5c0 1-1 1-1 2s1 1 1 2M10 2.5c0 1-1 1-1 2s1 1 1 2" />
    </svg>
  );
}

export function DineIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 2v8a2 2 0 0 1-4 0V2" />
      <path d="M5 10v12" />
      <path d="M17 2c-1.7 0-3 2-3 5s1.3 5 3 5v10" />
    </svg>
  );
}

export function DeviceIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="13" rx="1.5" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

export function ShareIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.2 10.8 15.8 6.2M8.2 13.2l7.6 4.6" />
    </svg>
  );
}
