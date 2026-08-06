"use client";

import { useState, useRef, useEffect } from "react";
import type { LeadStatus } from "@/lib/types";
import { LEAD_STATUSES } from "@/lib/types";

interface StatusDropdownProps {
  value: LeadStatus;
  onChange: (status: LeadStatus) => void;
  disabled?: boolean;
}

export default function StatusDropdown({
  value,
  onChange,
  disabled = false,
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (status: LeadStatus) => {
    onChange(status);
    setIsOpen(false);
  };

  const statusColors = {
    New: "text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/10",
    Contacted: "text-amber-400 border-amber-500/25 hover:bg-amber-500/10",
    Closed: "text-slate-400 border-slate-500/25 hover:bg-slate-500/10",
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center justify-between gap-2
          bg-transparent text-xs font-medium rounded-full px-3 py-1 border
          cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40
          ${disabled ? "opacity-50 cursor-wait" : ""}
          ${statusColors[value]}
        `}
      >
        {value}
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-32 rounded-lg bg-slate-900 border border-white/10 shadow-xl overflow-hidden animate-fade-in origin-top-left">
          <div className="py-1">
            {LEAD_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => handleSelect(status)}
                className={`
                  block w-full text-left px-4 py-2 text-xs font-medium transition-colors
                  hover:bg-white/5
                  ${value === status ? "bg-white/5 text-white" : "text-slate-400 hover:text-slate-200"}
                `}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
