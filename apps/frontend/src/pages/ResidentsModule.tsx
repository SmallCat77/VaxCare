import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { UserPlus, X, Search, Eye, MessageSquare, Shield, Check, Calendar, User, Activity } from "lucide-react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Badge } from "../components/ui/badge";
import { Resident, ScheduleItem } from "../lib/types";
import { statusColor } from "../lib/utils";
import { ApiClientError } from "../lib/api";
import { getRecaptchaToken } from "../lib/recaptcha";
import { RecaptchaLegalNotice } from "../components/RecaptchaLegalNotice";

export function ResidentsModule({ residents, schedules, onAddResident }: { residents: Resident[]; schedules: ScheduleItem[]; onAddResident: (data: { id: string; name: string; age: number; gender: "Male" | "Female"; birthdate: string; address: string; phone: string; purok: string; recaptchaToken?: string }) => Promise<void> }) {
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

    let token = "";
    try {
      // Generate reCAPTCHA v3 token dynamically for registration
      token = await getRecaptchaToken("register");
    } catch (captchaErr) {
      console.error("[reCAPTCHA v3] Registration token generation failed:", captchaErr);
      setSaveError("Security check failed. Please refresh and try again.");
      setSaving(false);
      return;
    }

    try {
      await onAddResident({
        id: newId,
        name: form.name,
        age: Number(form.age) || 0,
        gender: form.gender,
        birthdate: form.birthdate,
        address: form.address,
        phone: form.phone,
        purok: form.purok,
        recaptchaToken: token,
      });
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
        <div className="fixed inset-0 bg-[#0A1E2F]/65 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden ring-1 ring-slate-900/10" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Clinical Hospital Header */}
            <div className="bg-gradient-to-r from-[#0A1E2F] to-[#0E2E42] px-6 py-4 border-b border-[#163247] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0284C7] to-[#0EA5E9] flex items-center justify-center text-white shadow-md shadow-sky-950/40 shrink-0">
                  <UserPlus size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-white tracking-tight">Register New Resident</h3>
                    <span className="text-[9px] font-mono font-bold bg-[#112C40] text-[#38BDF8] border border-[#164E63] px-1.5 py-0.2 rounded uppercase">Intake</span>
                  </div>
                  <p className="text-[11px] text-[#8FAEC5] font-medium mt-0.5">Barangay Health Center · Official Resident Registry</p>
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
                  <span>Full Legal Name <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] font-normal text-slate-400">e.g. Juan dela Cruz</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Enter full legal name"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B7065]/20 focus:border-[#0B7065] focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                    Date of Birth <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.birthdate}
                    onChange={e => {
                      const bDate = e.target.value;
                      let calculatedAge = form.age;
                      if (bDate) {
                        const birthYear = new Date(bDate).getFullYear();
                        const currentYear = new Date().getFullYear();
                        if (birthYear > 1900 && birthYear <= currentYear) {
                          calculatedAge = String(currentYear - birthYear);
                        }
                      }
                      setForm(f => ({ ...f, birthdate: bDate, age: calculatedAge }));
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B7065]/20 focus:border-[#0B7065] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                    Age (Years) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    placeholder="e.g. 28"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B7065]/20 focus:border-[#0B7065] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                    Biological Gender <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.gender}
                    onChange={e => setForm(f => ({ ...f, gender: e.target.value as "Male" | "Female" }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B7065]/20 focus:border-[#0B7065] focus:bg-white transition-all"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                    Purok / Community Unit <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.purok}
                    onChange={e => setForm(f => ({ ...f, purok: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B7065]/20 focus:border-[#0B7065] focus:bg-white transition-all"
                  >
                    {["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5"].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                  Mobile Contact Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="e.g. 0917 123 4567"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B7065]/20 focus:border-[#0B7065] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                  Residential Street Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="e.g. 124 M. H. del Pilar Street"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B7065]/20 focus:border-[#0B7065] focus:bg-white transition-all"
                />
              </div>

              {saveError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold p-3 rounded-lg">
                  {saveError}
                </div>
              )}

              <div className="pt-1">
                <RecaptchaLegalNotice />
              </div>
            </div>

            {/* Clinical Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                <Shield size={12} className="text-[#0B7065]" />
                Confidential Health Profile
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
                  disabled={saving || !form.name || !form.birthdate}
                  onClick={addResident}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#0B7065] to-[#0E8376] hover:from-[#095C53] hover:to-[#0B7065] rounded-lg transition-all shadow-sm shadow-teal-950/20 disabled:opacity-50"
                >
                  <UserPlus size={13} />
                  <span>{saving ? "Registering..." : "Register Resident"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hospital Resident Profile Modal */}
      {selected && (
        <div className="fixed inset-0 bg-[#0A1E2F]/65 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden ring-1 ring-slate-900/10 max-h-[90vh] flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Clinical Header */}
            <div className="bg-gradient-to-r from-[#0A1E2F] to-[#0E2E42] px-6 py-4 border-b border-[#163247] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B7065] to-[#14B8A6] flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-teal-950/40 shrink-0">
                  {selected.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-white tracking-tight">{selected.name}</h3>
                    <span className="text-[10px] font-mono font-bold bg-[#112C40] text-[#38BDF8] border border-[#164E63] px-2 py-0.2 rounded">
                      {selected.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8FAEC5] font-medium mt-0.5">
                    {selected.purok} · Barangay Clinical Registry
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-[#8FAEC5] hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Demographics Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Age & Gender</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">{selected.age} yrs · {selected.gender}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Date of Birth</p>
                    <p className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">{selected.birthdate}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Vaccination Status</p>
                    <div className="mt-1">
                      <Badge className={statusColor[selected.status]}>{selected.status}</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Contact Phone</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-bold text-slate-900 font-mono">{selected.phone || "—"}</span>
                      {selected.phone && (
                        <Link
                          to={`/messaging?phone=${encodeURIComponent(selected.phone)}&residentId=${selected.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0B7065] bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md hover:bg-teal-100 transition-colors"
                        >
                          <MessageSquare size={11} /> SMS
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Residential Address</p>
                    <p className="text-sm font-medium text-slate-800 mt-0.5">{selected.address}, {selected.purok}</p>
                  </div>
                </div>
              </div>

              {/* History & Appointments 2-col */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vaccination History */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                    <Activity size={14} className="text-[#0B7065]" />
                    <span>Immunization History ({selected.vaccinations.length})</span>
                  </h4>
                  {selected.vaccinations.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center">
                      <p className="text-xs text-slate-500 italic">No immunization records logged yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {selected.vaccinations.map(v => (
                        <div key={v.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{v.vaccine}</span>
                            <span className="text-[11px] font-mono font-semibold text-slate-600 bg-white border border-slate-200 px-1.5 py-0.2 rounded">{v.date}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1">
                            <span className="font-semibold text-teal-800">{v.dose}</span> · {v.site} · Batch: <span className="font-mono">{v.batchNo}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Administered by: {v.worker}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Appointments */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#0B7065]" />
                    <span>Clinical Appointments</span>
                  </h4>
                  {(() => {
                    const residentSchedules = schedules.filter(s => s.residentId === selected.id);
                    if (residentSchedules.length === 0) {
                      return (
                        <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center">
                          <p className="text-xs text-slate-500 italic">No scheduled clinic visits queued.</p>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {residentSchedules.map(s => (
                          <div key={s.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">{s.appointmentType}</span>
                              <span className="text-[11px] font-mono font-semibold text-slate-600 bg-white border border-slate-200 px-1.5 py-0.2 rounded">{s.scheduledDate}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-1">{s.details || s.dose || "Routine"} · By: {s.worker}</p>
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

            {/* Clinical Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                <Shield size={12} className="text-[#0B7065]" />
                Barangay Clinical Patient Registry
              </span>

              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors shadow-2xs"
              >
                Close Profile
              </button>
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
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setSelected(r)} className="p-1 text-muted-foreground hover:text-primary transition-colors" title="View Profile">
                      <Eye size={14} />
                    </button>
                    {r.phone && (
                      <Link
                        to={`/messaging?phone=${encodeURIComponent(r.phone)}&residentId=${r.id}`}
                        className="p-1 text-muted-foreground hover:text-[#0B7065] transition-colors"
                        title={`Send SMS to ${r.name}`}
                      >
                        <MessageSquare size={14} />
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
