"use client";

import React, { useState, useRef, useEffect } from "react";

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label: string;
  error?: string;
  id: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
}

export default function Select({
  label,
  error,
  id,
  options,
  placeholder = "Select an option",
  className = "",
  value,
  onChange,
  name,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (val: string) => {
    onChange({ target: { name: name || "", value: val } });
    setIsOpen(false);
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between rounded-xl bg-white/5 border px-4 py-2.5 text-sm
            transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-0
            ${
              error
                ? "border-red-500/50 focus:ring-red-500/40 focus:border-red-500/50"
                : "border-white/10 focus:ring-indigo-500/40 focus:border-indigo-500/50 hover:border-white/20"
            }
            ${value ? "text-white" : "text-slate-500"}
            ${className}
          `}
        >
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          <svg
            className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-2 w-full rounded-xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden animate-fade-in origin-top">
            <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
              <button
                type="button"
                onClick={() => handleSelect("")}
                className="block w-full text-left px-4 py-2.5 text-sm text-slate-500 hover:bg-white/5 transition-colors"
              >
                {placeholder}
              </button>
              {options.map((opt) => (
                  <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`
                    block w-full text-left px-4 py-2.5 text-sm transition-colors
                    hover:bg-white/5
                    ${value === opt.value ? "bg-indigo-500/10 text-indigo-300 font-medium" : "text-white"}
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
