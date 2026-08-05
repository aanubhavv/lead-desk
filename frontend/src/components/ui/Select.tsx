"use client";

import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  id: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export default function Select({
  label,
  error,
  id,
  options,
  placeholder = "Select an option",
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-300"
      >
        {label}
      </label>
      <select
        id={id}
        className={`
          w-full rounded-xl bg-white/5 border px-4 py-2.5 text-sm text-white
          transition-all duration-200 appearance-none cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${
            error
              ? "border-red-500/50 focus:ring-red-500/40 focus:border-red-500/50"
              : "border-white/10 focus:ring-indigo-500/40 focus:border-indigo-500/50 hover:border-white/20"
          }
          ${className}
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: "right 0.75rem center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "1.25rem 1.25rem",
        }}
        {...props}
      >
        <option value="" className="bg-slate-900 text-slate-500">
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
