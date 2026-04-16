"use client";

import { useState, useCallback } from "react";
import {
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { JAXTINA_CENTERS } from "@/lib/consultationConstants";

interface Booking {
  id: string;
  student_name: string;
  phone: string;
  email: string;
  center_name: string;
  preferred_date: string;
  preferred_time: string;
  source_context: string;
  user_id: string | null;
  status: "pending" | "contacted" | "completed" | "cancelled";
  staff_notes: string | null;
  assigned_staff_id: string | null;
  consent_contacted: boolean;
  created_at: string;
  updated_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  contacted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

const SOURCE_LABELS: Record<string, string> = {
  main_button: "Main",
  placement_results: "Placement",
  study_plan: "Study Plan",
  practice_submission: "Practice",
};

const SOURCE_COLORS: Record<string, string> = {
  main_button: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  placement_results: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  study_plan: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  practice_submission: "bg-teal-500/20 text-teal-400 border-teal-500/30",
};

const LIMIT = 50;

function Badge({
  label,
  colorClass,
}: {
  label: string;
  colorClass: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}
    >
      {label}
    </span>
  );
}

interface DetailPanelProps {
  booking: Booking;
  onClose: () => void;
  onUpdated: (updated: Booking) => void;
}

function DetailPanel({ booking, onClose, onUpdated }: DetailPanelProps) {
  const [status, setStatus] = useState<string>(booking.status);
  const [notes, setNotes] = useState(booking.staff_notes ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/consultations/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, staff_notes: notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Failed to update booking");
        return;
      }
      toast.success("Booking updated");
      onUpdated(data.booking as Booking);
    } catch (err) {
      console.error("[DetailPanel] save error:", err);
      toast.error("Unexpected error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-white/[0.08] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <h3 className="font-bold text-white text-lg">Booking Details</h3>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Info rows */}
          {[
            { label: "Name", value: booking.student_name },
            { label: "Phone", value: booking.phone },
            { label: "Email", value: booking.email },
            { label: "Center", value: booking.center_name },
            { label: "Date", value: booking.preferred_date },
            { label: "Time", value: booking.preferred_time },
            {
              label: "Source",
              value: SOURCE_LABELS[booking.source_context] ?? booking.source_context,
            },
            {
              label: "Created",
              value: new Date(booking.created_at).toLocaleString(),
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex gap-3">
              <span className="text-xs text-white/40 w-20 shrink-0 pt-0.5">{label}</span>
              <span className="text-sm text-white/90 flex-1">{value}</span>
            </div>
          ))}

          {/* Status */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">
              Staff Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add notes…"
              className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/90 focus:outline-none resize-none placeholder:text-white/20"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-jaxtina-blue text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-jaxtina-blue/80 transition-colors"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  initialBookings: Booking[];
  initialTotal: number;
}

export default function ConsultationsClient({
  initialBookings,
  initialTotal,
}: Props) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCenter, setFilterCenter] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterSource, setFilterSource] = useState("");

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const fetchBookings = useCallback(
    async (overridePage?: number) => {
      setLoading(true);
      const p = overridePage ?? page;
      const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
      if (filterStatus) params.set("status", filterStatus);
      if (filterCenter) params.set("center", filterCenter);
      if (filterFrom) params.set("from", filterFrom);
      if (filterTo) params.set("to", filterTo);
      if (filterSource) params.set("source", filterSource);

      try {
        const res = await fetch(`/api/admin/consultations?${params}`);
        const data = await res.json();
        if (res.ok) {
          setBookings(data.bookings ?? []);
          setTotal(data.total ?? 0);
        } else {
          toast.error(data?.error ?? "Failed to load bookings");
        }
      } catch {
        toast.error("Network error loading bookings");
      } finally {
        setLoading(false);
      }
    },
    [page, filterStatus, filterCenter, filterFrom, filterTo, filterSource]
  );

  const handleFilter = () => {
    setPage(1);
    fetchBookings(1);
  };

  const handleRefresh = () => {
    fetchBookings(page);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchBookings(newPage);
  };

  const handleBookingUpdated = (updated: Booking) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === updated.id ? updated : b))
    );
    setSelectedBooking(updated);
  };

  return (
    <div className="space-y-6">
      {selectedBooking && (
        <DetailPanel
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdated={handleBookingUpdated}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Consultation Bookings
          </h1>
          <p className="text-sm text-white/40 mt-1">
            {total} total booking{total !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-800 border border-white/10 rounded-xl text-sm text-white/60 hover:text-white transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-neutral-900 border border-white/[0.06] rounded-2xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Status */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-neutral-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Center */}
          <div className="space-y-1 col-span-2">
            <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
              Center
            </label>
            <select
              value={filterCenter}
              onChange={(e) => setFilterCenter(e.target.value)}
              className="w-full bg-neutral-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="">All Centers</option>
              {JAXTINA_CENTERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* From */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
              From Date
            </label>
            <input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="w-full bg-neutral-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
            />
          </div>

          {/* To */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
              To Date
            </label>
            <input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="w-full bg-neutral-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
            />
          </div>

          {/* Source */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
              Source
            </label>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="w-full bg-neutral-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="">All</option>
              <option value="main_button">Main</option>
              <option value="placement_results">Placement</option>
              <option value="study_plan">Study Plan</option>
              <option value="practice_submission">Practice</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-3">
          <button
            onClick={handleFilter}
            disabled={loading}
            className="px-4 py-1.5 bg-jaxtina-blue text-white text-xs font-bold rounded-lg hover:bg-jaxtina-blue/80 transition-colors disabled:opacity-60"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-900 border border-white/[0.06] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-white/30" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 text-white/30 italic text-sm">
            No bookings found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {[
                    "Name",
                    "Phone",
                    "Email",
                    "Center",
                    "Date",
                    "Time",
                    "Source",
                    "Status",
                    "Created",
                    "",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-[10px] font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-white/90 font-medium whitespace-nowrap">
                      {b.student_name}
                    </td>
                    <td className="px-4 py-3 text-white/70 whitespace-nowrap">
                      {b.phone}
                    </td>
                    <td className="px-4 py-3 text-white/70 max-w-[160px] truncate">
                      {b.email}
                    </td>
                    <td className="px-4 py-3 text-white/60 max-w-[180px] truncate text-xs">
                      {b.center_name}
                    </td>
                    <td className="px-4 py-3 text-white/70 whitespace-nowrap">
                      {b.preferred_date}
                    </td>
                    <td className="px-4 py-3 text-white/70 whitespace-nowrap text-xs">
                      {b.preferred_time}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge
                        label={SOURCE_LABELS[b.source_context] ?? b.source_context}
                        colorClass={SOURCE_COLORS[b.source_context] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30"}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge
                        label={b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        colorClass={STATUS_COLORS[b.status] ?? ""}
                      />
                    </td>
                    <td className="px-4 py-3 text-white/40 whitespace-nowrap text-xs">
                      {new Date(b.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white/70 hover:text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
            <span className="text-xs text-white/30">
              Page {page} of {totalPages} ({total} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1 || loading}
                className="p-1.5 rounded-lg bg-neutral-800 text-white/60 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages || loading}
                className="p-1.5 rounded-lg bg-neutral-800 text-white/60 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
