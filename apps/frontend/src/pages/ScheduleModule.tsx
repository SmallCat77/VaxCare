import React, { useState } from "react";
import { Plus, X, AlertTriangle, CheckCircle } from "lucide-react";
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">Schedule Appointment</h3>
              <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3">
              {[["Resident", "residentId", "select-resident"], ["Type", "appointmentType", "select-type"], ["Details", "details", "text"], ["Date", "date", "date"], ["Health Worker", "worker", "select-worker"]].map(([label, key, type]) => (
                <div key={key}>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">{label}</label>
                  {type === "select-resident" ? (
                    <select value={form.residentId} onChange={e => setForm(f => ({ ...f, residentId: e.target.value }))} className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none">
                      <option value="">Select?</option>{residents.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  ) : type === "select-type" ? (
                    <select value={form.appointmentType} onChange={e => setForm(f => ({ ...f, appointmentType: e.target.value }))} className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none">
                      {["Vaccination", "Checkup", "Pre-natal", "Consultation", "Follow-up"].map(v => <option key={v}>{v}</option>)}
                    </select>
                  ) : type === "text" ? (
                    <input type="text" value={form.details} onChange={e => setForm(f => ({ ...f, details: e.target.value }))} placeholder="e.g. COVID-19 1st Dose" className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none" />
                  ) : type === "select-worker" ? (
                    <select value={form.worker} onChange={e => setForm(f => ({ ...f, worker: e.target.value }))} className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none">
                      {["RN Ana Reyes", "RN Luz Garcia", "Dr. Pedro Cruz"].map(w => <option key={w}>{w}</option>)}
                    </select>
                  ) : (
                    <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none" />
                  )}
                </div>
              ))}
              {saveError && <p className="text-xs text-red-600">{saveError}</p>}
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-border">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm rounded-md border border-border text-foreground hover:bg-muted">Cancel</button>
              <button disabled={saving} onClick={addSchedule} className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{saving ? "Scheduling…" : "Schedule"}</button>
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
