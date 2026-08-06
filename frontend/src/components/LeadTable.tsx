"use client";

import { useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import StatusDropdown from "@/components/ui/StatusDropdown";
import { updateLeadStatus, ApiRequestError } from "@/lib/api";
import type { Lead, LeadStatus } from "@/lib/types";

interface LeadTableProps {
  leads: Lead[];
  loading: boolean;
  onStatusUpdated: () => void;
}

function formatDate(iso: string): string {
  // MongoDB/PyMongo often returns naive datetimes for UTC times. 
  // Append 'Z' if it's missing timezone information so the browser parses it as UTC.
  const dateStr = iso.endsWith('Z') || iso.match(/[+-]\d{2}:\d{2}$/) ? iso : `${iso}Z`;
  
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 bg-white/5 rounded-lg w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export default function LeadTable({
  leads,
  loading,
  onStatusUpdated,
}: LeadTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [messageModalLead, setMessageModalLead] = useState<Lead | null>(null);

  async function handleStatusChange(lead: Lead, newStatus: LeadStatus) {
    if (newStatus === lead.status) return;

    setUpdatingId(lead.id);
    setErrorId(null);

    try {
      await updateLeadStatus(lead.id, { status: newStatus });
      onStatusUpdated();
    } catch (err) {
      setErrorId(lead.id);
      console.error("Failed to update status:", err instanceof ApiRequestError ? err.data.message : err);
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Name</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Email</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Budget</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Message</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {[...Array(5)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/5 mb-4">
          <svg className="w-7 h-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-slate-400 text-sm">No leads found.</p>
        <p className="text-slate-500 text-xs mt-1">Leads will appear here when visitors submit the contact form.</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Name</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Email</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Budget</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Message</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {leads.map((lead, index) => (
              <tr
                key={lead.id}
                className="hover:bg-white/[0.02] transition-colors duration-150 relative"
                style={{ zIndex: leads.length - index }}
              >
                <td className="px-5 py-4 text-sm text-white font-medium whitespace-nowrap">
                  {lead.name}
                </td>
                <td className="px-5 py-4 text-sm text-slate-300 whitespace-nowrap">
                  {lead.email}
                </td>
                <td className="px-5 py-4 text-sm text-slate-400 whitespace-nowrap hidden md:table-cell">
                  {lead.budget_range}
                </td>
                <td className="px-5 py-4 text-sm text-slate-400 hidden lg:table-cell max-w-[250px]">
                  <div className="flex flex-col items-start gap-1">
                    <span className="line-clamp-2">{lead.message}</span>
                    {lead.message.length > 80 && (
                      <button 
                        onClick={() => setMessageModalLead(lead)}
                        className="text-indigo-400 hover:text-indigo-300 text-xs font-medium cursor-pointer transition-colors"
                      >
                        Read more
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <StatusDropdown
                      value={lead.status}
                      onChange={(newStatus) => handleStatusChange(lead, newStatus)}
                      disabled={updatingId === lead.id}
                    />
                    {updatingId === lead.id && (
                      <svg className="animate-spin h-3.5 w-3.5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    {errorId === lead.id && (
                      <span className="text-xs text-red-400">Failed</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                  {formatDate(lead.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3 p-4">
        {leads.map((lead, index) => (
          <div
            key={lead.id}
            className="rounded-xl bg-white/[0.03] border border-white/5 p-4 space-y-3 relative"
            style={{ zIndex: leads.length - index }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{lead.name}</p>
                <p className="text-xs text-slate-400 truncate">{lead.email}</p>
              </div>
              <StatusBadge status={lead.status} />
            </div>
            <div>
              <p className="text-xs text-slate-400 line-clamp-2">{lead.message}</p>
              {lead.message.length > 80 && (
                <button 
                  onClick={() => setMessageModalLead(lead)}
                  className="text-indigo-400 hover:text-indigo-300 text-xs font-medium cursor-pointer mt-1 transition-colors"
                >
                  Read more
                </button>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/5 mt-3">
              <span className="text-xs text-slate-500">{lead.budget_range}</span>
              <StatusDropdown
                value={lead.status}
                onChange={(newStatus) => handleStatusChange(lead, newStatus)}
                disabled={updatingId === lead.id}
              />
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!messageModalLead}
        onClose={() => setMessageModalLead(null)}
        title="Project Details"
      >
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">From</p>
            <p className="text-sm text-white">{messageModalLead?.name} <span className="text-slate-400">&lt;{messageModalLead?.email}&gt;</span></p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Message</p>
            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
              {messageModalLead?.message}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
