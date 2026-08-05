"use client";

import type { LeadStatus } from "@/lib/types";

const STATUS_STYLES: Record<LeadStatus, string> = {
  New: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  Contacted: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  Closed: "bg-slate-500/15 text-slate-400 border-slate-500/25",
};

interface StatusBadgeProps {
  status: LeadStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        border transition-colors duration-200
        ${STATUS_STYLES[status] ?? STATUS_STYLES.New}
      `}
    >
      {status}
    </span>
  );
}
