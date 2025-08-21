// Accordion.jsx
import { useId, useState } from 'react';

export default function Accordion({
  title,
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="border border-gray-300 rounded-md bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-2 hover:bg-gray-50"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(o => !o)}
      >
        {/* Tab-like label + badge */}
        <ul className="flex space-x-4 border-b border-gray-200">
          <li className="px-3 py-1 font-semibold text-gray-800 border-b-2 border-transparent hover:border-blue-500 cursor-pointer">
            {title}
            {typeof count === 'number' && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
               1
              </span>
            )}
          </li>
        </ul>

        {/* Arrow */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 410.8 322.9"
          className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path d="M248.1 295.5c-17.1 23.6-50 28.8-73.5 11.8-4.5-3.3-8.5-7.3-11.8-11.8l-84-116-66.2-91.4c-25.3-34.8-.4-83.6 42.6-83.6h300.3c43 0 67.9 48.7 42.7 83.5L332 179.5l-83.9 116z" />
        </svg>
      </button>

      {/* Panel */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={panelId}
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${open ? 'max-h-[1000px]' : 'max-h-0'}`}
      >
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
