import React, { useState, useMemo } from "react";
import { UserPlus, X, Search, Eye } from "lucide-react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Badge } from "../components/ui/badge";
import { Resident, ScheduleItem } from "../lib/types";
import { statusColor } from "../lib/utils";
import { ApiClientError } from "../lib/api";

export function ResidentsModule({ residents, schedules, onAddResident }: { residents: Resident[]; schedules: ScheduleItem[]; onAddResident: (data: { id: string; name: string; age: number; gender: "Male" | "Female"; birthdate: string; address: string; phone: string; purok: string }) => Promise<void> }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("All");
  const [selected, setSelected] = useState<Resident | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", age: "", gender: "Female" as "Male" | "Female", birthdate: "", address: "", phone: "", purok: "Purok 1" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const filtered = useMemo(() =>
    residents.filter(r =>
      (filter === "All" || r.status === filter) &&
      (r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()))
    ), [residents, search, filter]);

  async function addResident() {
    if (!form.name || !form.birthdate) return;
    // Derive the next sequential ID from existing resident IDs (e.g. R010 → R011).
    const maxNum = residents.reduce((max, r) => {
      const n = parseInt(r.id.replace(/\D/g, ""), 10);
      return Number.isFinite(n) ? Math.max(max, n) : max;
    }, 0);
    const newId = `R${String(maxNum + 1).padStart(3, "0")}`;

    setSaving(true);
    setSaveError("");
    try {
      await onAddResident({ id: newId, name: form.name, age: Number(form.age) || 0, gender: form.gender, birthdate: form.birthdate, address: form.address, phone: form.phone, purok: form.purok });
      setShowAdd(false);
      setForm({ name: "", age: "", gender: "Female", birthdate: "", address: "", phone: "", purok: "Purok 1" });
    } catch (err) {
      setSaveError(err instanceof ApiClientError ? err.message : "Failed to register resident. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <SectionHeader title="Resident Health Profiles" subtitle={`${residents.length} registered residents`} action={
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors">
          <UserPlus size={14} /> Register Resident
        </button>
      } />

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">Register New Resident</h3>
              <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3">
              {[["Full Name", "name", "text"], ["Date of Birth", "birthdate", "date"], ["Age", "age", "number"], ["Address", "address", "text"], ["Phone", "phone", "tel"]].map(([label, key, type]) => (
                <div key={key}>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">{label}</label>
                  <input type={type} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Gender</label>
                  <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value as "Male" | "Female" }))} className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none">
                    <option>Female</option><option>Male</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Purok</label>
                  <select value={form.purok} onChange={e => setForm(f => ({ ...f, purok: e.target.value }))} className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none">
                    {["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5"].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              {saveError && <p className="text-xs text-red-600">{saveError}</p>}
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-border">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm rounded-md border border-border text-foreground hover:bg-muted transition-colors">Cancel</button>
              <button disabled={saving} onClick={addResident} className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">{saving ? "Registering…" : "Register"}</button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
              <div>
                <h3 className="font-semibold text-foreground">{selected.name}</h3>
                <p className="text-xs text-muted-foreground">{selected.id} · {selected.purok}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[["Age", selected.age + " years"], ["Gender", selected.gender], ["Birthdate", selected.birthdate], ["Phone", selected.phone], ["Address", selected.address, 2]].map(([k, v, span]) => (
                  <div key={k as string} className={span === 2 ? "col-span-2" : ""}>
                    <p className="text-xs text-muted-foreground">{k}</p>
                    <p className="text-sm font-medium text-foreground">{v}</p>
                  </div>
                ))}
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={statusColor[selected.status]}>{selected.status}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Vaccination History</h4>
                  {selected.vaccinations.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No vaccinations recorded.</p>
                  ) : (
                    <div className="space-y-2">
                      {selected.vaccinations.map(v => (
                        <div key={v.id} className="bg-muted rounded-md p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{v.vaccine}</span>
                            <span className="text-xs font-mono text-muted-foreground">{v.date}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{v.dose} · {v.site} · Batch: {v.batchNo}</p>
                          <p className="text-xs text-muted-foreground">Administered by: {v.worker}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Appointments</h4>
                  {(() => {
                    const residentSchedules = schedules.filter(s => s.residentId === selected.id);
                    if (residentSchedules.length === 0) {
                      return <p className="text-sm text-muted-foreground italic">No appointments scheduled.</p>;
                    }
                    return (
                      <div className="space-y-2">
                        {residentSchedules.map(s => (
                          <div key={s.id} className="bg-muted rounded-md p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground">{s.appointmentType}</span>
                              <span className="text-xs font-mono text-muted-foreground">{s.scheduledDate}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{s.details || s.dose || "Routine"} · By: {s.worker}</p>
                            <div className="mt-2">
                              <Badge className={statusColor[s.status]}>{s.status}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID…" className="w-full bg-card border border-border rounded-md pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Fully Vaccinated", "Partially Vaccinated", "Unvaccinated"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {["ID", "Name", "Age", "Gender", "Purok", "Contact", "Status", "Next Due", "Actions"].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">{h !== "Actions" ? h : ""}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{r.id}</td>
                <td className="px-4 py-2.5 font-medium text-foreground">{r.name}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{r.age}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.gender}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.purok}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{r.phone || "—"}</td>
                <td className="px-4 py-2.5"><Badge className={statusColor[r.status]}>{r.status}</Badge></td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{r.nextDue || "—"}</td>
                <td className="px-4 py-2.5">
                  <button onClick={() => setSelected(r)} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Eye size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
