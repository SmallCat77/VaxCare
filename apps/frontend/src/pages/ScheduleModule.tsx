import React, { useState } from "react";
import { Plus, X, AlertTriangle, CheckCircle, Calendar, Shield, Clock } from "lucide-react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Badge } from "../components/ui/badge";
import { Resident, ScheduleItem } from "../lib/types";
import { statusColor } from "../lib/utils";
import { ApiClientError } from "../lib/api";

export function ScheduleModule({ schedules, residents, onAddSchedule, onUpdateStatus }: {
  schedules: ScheduleItem[]; residents: Resident[];
  onAddSchedule: (data: { id: string; residentId: string; appointmentType: string; details: string; scheduledDate: string; worker: string; purok: string }) => Promise<void>;
  onUpdateStatus: (id: string, status: ScheduleItem["status"]) => Promise<void>;
}) {
  const [filter, setFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ residentId: "", appointmentType: "Vaccination", details: "", date: "", worker: "RN Ana Reyes" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = filter === "All" ? schedules : schedules.filter(s => s.status === filter);

  async function addSchedule() {
    if (!form.residentId || !form.appointmentType || !form.date) return;
    const resident = residents.find(r => r.id === form.residentId);
    if (!resident) return;
    // Derive the next sequential schedule ID (e.g. S008 -> S009).
    const maxNum = schedules.reduce((max, s) => {
      const n = parseInt(s.id.replace(/\D/g, ""), 10);
      return Number.isFinite(n) ? Math.max(max, n) : max;
    }, 0);
    const nextId = `S${String(maxNum + 1).padStart(3, "0")}`;

    setSaving(true);
    setSaveError("");
    try {
      await onAddSchedule({
        id: nextId,
        residentId: form.residentId,
        appointmentType: form.appointmentType,
        details: form.details,
        scheduledDate: form.date,
        worker: form.worker,
        purok: resident.purok,
      });
      setShowAdd(false);
      setForm(f => ({ ...f, residentId: "", appointmentType: "Vaccination", details: "", date: "" }));
    } catch (err) {
      setSaveError(err instanceof ApiClientError ? err.message : "Failed to create schedule. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function markMissed(id: string) {
    setUpdatingId(id);
    try { await onUpdateStatus(id, "Missed"); } finally { setUpdatingId(null); }
  }
  async function markCompleted(id: string) {
    setUpdatingId(id);
    try { await onUpdateStatus(id, "Completed"); } finally { setUpdatingId(null); }
  }

  const missed = schedules.filter(s => s.status === "Missed");

  return (
    <div>
      <SectionHeader title="Appointments & Scheduling" subtitle="Manage and track all medical appointments" action={
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors">
          <Plus size={14} /> New Schedule
        </button>
      } />

      {showAdd && (
        <div className="fixed inset-0 bg-[#0A1E2F]/65 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden ring-1 ring-slate-900/10" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Clinical Hospital Header */}
            <div className="bg-gradient-to-r from-[#0A1E2F] to-[#0E2E42] px-6 py-4 border-b border-[#163247] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0D9488] to-[#10B981] flex items-center justify-center text-white shadow-md shadow-teal-950/40 shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-white tracking-tight">Schedule Clinical Appointment</h3>
                    <span className="text-[9px] font-mono font-bold bg-[#112C40] text-[#38BDF8] border border-[#164E63] px-1.5 py-0.2 rounded uppercase">Queue</span>
                  </div>
                  <p className="text-[11px] text-[#8FAEC5] font-medium mt-0.5">Barangay Health Station · Immunization Division</p>
                </div>
              </div>
              <button
                onClick={() => setShowAdd(false)}
                className="text-[#8FAEC5] hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Clinical Form Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between mb-1.5">
                  <span>Patient / Resident <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] font-normal text-slate-400">Official Health Registry</span>
                </label>
                <select
                  value={form.residentId}
                  onChange={e => setForm(f => ({ ...f, residentId: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B7065]/20 focus:border-[#0B7065] focus:bg-white transition-all"
                >
                  <option value="">Select registered patient…</option>
                  {residents.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {r.id} ({r.purok})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                    Appointment Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.appointmentType}
                    onChange={e => setForm(f => ({ ...f, appointmentType: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B7065]/20 focus:border-[#0B7065] focus:bg-white transition-all"
                  >
                    {["Vaccination", "Checkup", "Pre-natal", "Consultation", "Follow-up"].map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                    Scheduled Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B7065]/20 focus:border-[#0B7065] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                  Dose Details & Clinical Notes
                </label>
                <input
                  type="text"
                  value={form.details}
                  onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
                  placeholder="e.g. COVID-19 1st Dose, Infant MMR Booster"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B7065]/20 focus:border-[#0B7065] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                  Assigned Healthcare Worker <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.worker}
                  onChange={e => setForm(f => ({ ...f, worker: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B7065]/20 focus:border-[#0B7065] focus:bg-white transition-all"
                >
                  {["RN Ana Reyes", "RN Luz Garcia", "Dr. Pedro Cruz"].map(w => (
                    <option key={w} value={w}>{w} (Station Provider)</option>
                  ))}
                </select>
              </div>

              {saveError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold p-3 rounded-lg">
                  {saveError}
                </div>
              )}
            </div>

            {/* Clinical Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                <Clock size={12} className="text-[#0B7065]" />
                Clinic Queue Update
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving || !form.residentId || !form.date}
                  onClick={addSchedule}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#0B7065] to-[#0E8376] hover:from-[#095C53] hover:to-[#0B7065] rounded-lg transition-all shadow-sm shadow-teal-950/20 disabled:opacity-50"
                >
                  <Calendar size={13} />
                  <span>{saving ? "Scheduling..." : "Confirm Schedule"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {missed.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-red-500" />
            <h4 className="text-sm font-semibold text-red-700">Missed Appointments ({missed.length})</h4>
          </div>
          <div className="space-y-1.5">
            {missed.map(s => (
              <div key={s.id} className="flex items-center justify-between text-xs text-red-700 bg-red-100/60 rounded px-3 py-2">
                <span>{s.residentName} — {s.appointmentType} {s.details ? `(${s.details})` : ''}</span>
                <span className="font-mono">{s.scheduledDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        {["All", "Upcoming", "Completed", "Missed", "Rescheduled"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>{f}</button>
        ))}
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {["Resident", "Type", "Details", "Scheduled Date", "Health Worker", "Purok", "Status", "Actions"].map((h, i) => (
                <th key={`sched-h-${i}`} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-2.5 font-medium text-foreground">{s.residentName}</td>
                <td className="px-4 py-2.5 text-foreground"><Badge variant="outline" className="text-xs bg-card">{s.appointmentType || s.vaccine}</Badge></td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{s.details || s.dose || "—"}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-foreground">{s.scheduledDate}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{s.worker}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{s.purok}</td>
                <td className="px-4 py-2.5"><Badge className={statusColor[s.status]}>{s.status}</Badge></td>
                <td className="px-4 py-2.5">
                  {s.status === "Upcoming" && (
                    <div className="flex gap-1">
                      <button disabled={updatingId === s.id} onClick={() => markCompleted(s.id)} className="p-1 text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-40" title="Mark completed"><CheckCircle size={14} /></button>
                      <button disabled={updatingId === s.id} onClick={() => markMissed(s.id)} className="p-1 text-red-500 hover:text-red-600 transition-colors disabled:opacity-40" title="Mark missed"><X size={14} /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
