"use client";

import { useEffect, useState, useCallback } from "react";
import SearchBar from "@/components/SearchBar";
import LeadTable from "@/components/LeadTable";
import Pagination from "@/components/Pagination";
import { fetchLeads, ApiRequestError } from "@/lib/api";
import type { Lead } from "@/lib/types";

export default function AdminDashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 15;

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchLeads({
        search: search || undefined,
        page,
        page_size: pageSize,
        sort_by: "created_at",
        sort_order: "desc",
      });
      setLeads(data.leads);
      setTotalPages(data.total_pages);
      setTotal(data.total);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.data.message || "Failed to load leads.");
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  function handleSearch(query: string) {
    setSearch(query);
    setPage(1); // Reset to first page on new search
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Leads</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? "Loading..." : `${total} lead${total !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <div className="w-full sm:w-96">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-5 py-4 mb-6 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={loadLeads}
              className="text-xs text-red-400/70 hover:text-red-400 underline mt-1 cursor-pointer"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Leads table */}
      <div className="glass rounded-2xl overflow-hidden">
        <LeadTable
          leads={leads}
          loading={loading}
          onStatusUpdated={loadLeads}
        />
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
