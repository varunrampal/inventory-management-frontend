// IconAccordionArrow.jsx
export default function IconAccordionArrow({ open, className = "" }) {
  return (
    <svg
      viewBox="0 0 410.8 322.9"
      aria-hidden="true"
      className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""} ${className}`}
    >
      {/* inherit text color */}
      <path
        d="M248.1 295.5c-17.1 23.6-50 28.8-73.5 11.8-4.5-3.3-8.5-7.3-11.8-11.8l-84-116-66.2-91.4c-25.3-34.8-.4-83.6 42.6-83.6h300.3c43 0 67.9 48.7 42.7 83.5L332 179.5l-83.9 116z"
        fill="currentColor"
      />
    </svg>
  );
}
