"use client";

import React from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  id: string;
}

export default function Textarea({
  label,
  error,
  id,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-300"
      >
        {label}
      </label>
      <textarea
        id={id}
        className={`
          w-full rounded-xl bg-white/5 border px-4 py-2.5 text-sm text-white
          placeholder:text-slate-500 transition-all duration-200 resize-y min-h-[100px]
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${
            error
              ? "border-red-500/50 focus:ring-red-500/40 focus:border-red-500/50"
              : "border-white/10 focus:ring-indigo-500/40 focus:border-indigo-500/50 hover:border-white/20"
          }
          ${className}
        `}
        {...props}
      />
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
