import React, { useState, useMemo } from "react";
import { Plus, X, Search } from "lucide-react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Resident, MedicalSupply } from "../lib/types";
import { ApiClientError } from "../lib/api";

export function VaccinationsModule({ residents, supplies, onRecordVaccination }: {
  residents: Resident[]; supplies: MedicalSupply[];
  onRecordVaccination: (residentId: string, data: { vaccine: string; dose: string; date: string; worker: string; batchNo: string; site: string }) => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ residentId: "", vaccine: "", dose: "", date: new Date().toISOString().split("T")[0], worker: "RN Ana Reyes", batchNo: "", site: "Left Arm" });
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const allRecords = useMemo(() =>
    residents.flatMap(r => r.vaccinations.map(v => ({ ...v, residentName: r.name, residentId: r.id, residentPurok: r.purok }))),
    [residents]
  ).filter(r => r.residentName.toLowerCase().includes(search.toLowerCase()) || r.vaccine.toLowerCase().includes(search.toLowerCase()));

  async function recordVaccination() {
    if (!form.residentId || !form.vaccine || !form.dose) return;
    setSaving(true);
    setSaveError("");
    try {
      await onRecordVaccination(form.residentId, { vaccine: form.vaccine, dose: form.dose, date: form.date, worker: form.worker, batchNo: form.batchNo, site: form.site });
      setShowForm(false);
      setForm(f => ({ ...f, residentId: "", vaccine: "", dose: "", batchNo: "" }));
    } catch (err) {
      setSaveError(err instanceof ApiClientError ? err.message : "Failed to record vaccination. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <SectionHeader title="Vaccination Records" subtitle="Record and view all vaccination administrations" action={
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors">
          <Plus size={14} /> Record Vaccination
        </button>
      } />

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">Record Vaccination</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Resident</label>
                <select value={form.residentId} onChange={e => setForm(f => ({ ...f, residentId: e.target.value }))} className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none">
                  <option value="">Select resident…</option>
                  {residents.map(r => <option key={r.id} value={r.id}>{r.name} ({r.id})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Vaccine</label>
                <select value={form.vaccine} onChange={e => setForm(f => ({ ...f, vaccine: e.target.value }))} className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none">
                  <option value="">Select vaccine…</option>
                  {supplies.map(s => <option key={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Dose</label>
                  <select value={form.dose} onChange={e => setForm(f => ({ ...f, dose: e.target.value }))} className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none">
                    <option value="">Select…</option>
                    {["1st Dose", "2nd Dose", "3rd Dose", "Booster", "Annual"].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Site</label>
                  <select value={form.site} onChange={e => setForm(f => ({ ...f, site: e.target.value }))} className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none">
                    {["Left Arm", "Right Arm", "Left Thigh", "Right Thigh"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Batch No.</label>
                  <input value={form.batchNo} onChange={e => setForm(f => ({ ...f, batchNo: e.target.value }))} className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none" placeholder="e.g. BV-2025-001" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Health Worker</label>
                <select value={form.worker} onChange={e => setForm(f => ({ ...f, worker: e.target.value }))} className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none">
                  {["RN Ana Reyes", "RN Luz Garcia", "Dr. Pedro Cruz"].map(w => <option key={w}>{w}</option>)}
                </select>
              </div>
              {saveError && <p className="text-xs text-red-600">{saveError}</p>}
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-border">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded-md border border-border text-foreground hover:bg-muted">Cancel</button>
              <button disabled={saving} onClick={recordVaccination} className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{saving ? "Recording…" : "Record"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by resident or vaccine…" className="w-full bg-card border border-border rounded-md pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {["Resident", "Vaccine", "Dose", "Date", "Site", "Batch No.", "Administered By"].map((h, i) => (
                <th key={`vax-h-${i}`} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allRecords.slice(0, 20).map(r => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-2.5">
                  <p className="font-medium text-foreground">{r.residentName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{r.residentId}</p>
                </td>
                <td className="px-4 py-2.5 text-foreground">{r.vaccine}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.dose}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{r.date}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.site}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{r.batchNo}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.worker}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
