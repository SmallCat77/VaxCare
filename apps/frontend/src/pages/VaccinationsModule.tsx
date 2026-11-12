import React, { useState, useMemo } from "react";
import { Plus, X, Search, Syringe, Shield, Check } from "lucide-react";
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
        <div className="fixed inset-0 bg-[#0A1E2F]/65 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden ring-1 ring-slate-900/10" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Clinical Hospital Header */}
            <div className="bg-gradient-to-r from-[#0A1E2F] to-[#0E2E42] px-6 py-4 border-b border-[#163247] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0B7065] to-[#14B8A6] flex items-center justify-center text-white shadow-md shadow-teal-950/40 shrink-0">
                  <Syringe size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-white tracking-tight">Record Clinical Vaccination</h3>
                    <span className="text-[9px] font-mono font-bold bg-[#112C40] text-[#38BDF8] border border-[#164E63] px-1.5 py-0.2 rounded uppercase">EHR Form</span>
                  </div>
                  <p className="text-[11px] text-[#8FAEC5] font-medium mt-0.5">Barangay Health Station · Immunization Unit</p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(false)}
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

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between mb-1.5">
                  <span>Vaccine Formulation <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.2 rounded-full border border-teal-200">Cold Chain Verified</span>
                </label>
                <select
                  value={form.vaccine}
                  onChange={e => {
                    const sel = supplies.find(s => s.name === e.target.value);
                    setForm(f => ({
                      ...f,
                      vaccine: e.target.value,
                      batchNo: sel ? `BV-${sel.category.toUpperCase().slice(0, 3)}-001` : f.batchNo
                    }));
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B7065]/20 focus:border-[#0B7065] focus:bg-white transition-all"
                >
                  <option value="">Select vaccine from formulary…</option>
                  {supplies.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.category}) — {s.quantity} units on hand
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                    Dose Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.dose}
                    onChange={e => setForm(f => ({ ...f, dose: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B7065]/20 focus:border-[#0B7065] focus:bg-white transition-all"
                  >
                    <option value="">Select dose…</option>
                    {["1st Dose", "2nd Dose", "3rd Dose", "Booster", "Annual"].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                    Administration Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B7065]/20 focus:border-[#0B7065] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                    Anatomical Site <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.site}
                    onChange={e => setForm(f => ({ ...f, site: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B7065]/20 focus:border-[#0B7065] focus:bg-white transition-all"
                  >
                    {["Left Arm (Deltoid)", "Right Arm (Deltoid)", "Left Thigh (Anterolateral)", "Right Thigh (Anterolateral)"].map(s => (
                      <option key={s} value={s.split(" ")[0] + " " + s.split(" ")[1]}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                    Batch / Lot Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={form.batchNo}
                    onChange={e => setForm(f => ({ ...f, batchNo: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B7065]/20 focus:border-[#0B7065] focus:bg-white transition-all"
                    placeholder="e.g. BV-2025-001"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                  Administering Healthcare Worker <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.worker}
                  onChange={e => setForm(f => ({ ...f, worker: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B7065]/20 focus:border-[#0B7065] focus:bg-white transition-all"
                >
                  {["RN Ana Reyes", "RN Luz Garcia", "Dr. Pedro Cruz"].map(w => (
                    <option key={w} value={w}>{w} (Authorized Immunizer)</option>
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
                <Shield size={12} className="text-[#0B7065]" />
                Audited Clinical Record
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving || !form.residentId || !form.vaccine}
                  onClick={recordVaccination}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#0B7065] to-[#0E8376] hover:from-[#095C53] hover:to-[#0B7065] rounded-lg transition-all shadow-sm shadow-teal-950/20 disabled:opacity-50"
                >
                  <Check size={13} />
                  <span>{saving ? "Recording..." : "Record Immunization"}</span>
                </button>
              </div>
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
