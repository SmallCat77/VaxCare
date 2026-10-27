import React, { useState } from "react";
import { ShieldCheck, CheckCircle, X, Clock, Syringe } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Resident, ScheduleItem, MedicalSupply } from "../lib/types";
import { statusColor } from "../lib/utils";

export function ResidentPortal({ residents, schedules, supplies, defaultResidentId }: { residents: Resident[]; schedules: ScheduleItem[]; supplies: MedicalSupply[]; defaultResidentId?: string }) {
  const [residentId, setResidentId] = useState(defaultResidentId ?? "");
  const [found, setFound] = useState<Resident | null>(() =>
    defaultResidentId ? (residents.find(r => r.id === defaultResidentId) ?? null) : null
  );
  const [activeTab, setActiveTab] = useState("schedule");
  const [notFound, setNotFound] = useState(false);

  function lookup() {
    const r = residents.find(res => res.id.toLowerCase() === residentId.toLowerCase() || res.name.toLowerCase().includes(residentId.toLowerCase()));
    if (r) { setFound(r); setNotFound(false); }
    else { setFound(null); setNotFound(true); }
  }

  const mySchedules = found ? schedules.filter(s => s.residentId === found.id) : [];

  return (
    <div>
      <div className="bg-gradient-to-br from-primary to-teal-600 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center gap-3 mb-1">
          <ShieldCheck size={20} />
          <h2 className="text-lg font-bold">Resident Health Portal</h2>
        </div>
        <p className="text-sm text-white/80">View your vaccination records, upcoming schedules, and reminders.</p>
        <div className="mt-4 flex gap-2">
          <input value={residentId} onChange={e => setResidentId(e.target.value)} onKeyDown={e => e.key === "Enter" && lookup()} placeholder="Enter your name or Resident ID…" className="flex-1 bg-white/20 border border-white/30 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/60 focus:outline-none focus:bg-white/30" />
          <button onClick={lookup} className="bg-white text-primary font-semibold text-sm px-4 py-2 rounded-md hover:bg-white/90 transition-colors">Look Up</button>
        </div>
        {notFound && <p className="text-xs text-red-200 mt-2">No resident found. Try your full name or ID (e.g. R001).</p>}
        {!found && !notFound && (
          <p className="text-xs text-white/60 mt-2">Try: "Maria Santos", "R001", or any resident name from the system.</p>
        )}
      </div>

      {found && (
        <div className="space-y-5">
          <div className="bg-card rounded-lg border border-border p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">{found.name.charAt(0)}</div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">{found.name}</h3>
              <p className="text-xs text-muted-foreground">{found.id} · {found.gender} · {found.age} years old · {found.purok}</p>
              <Badge className={`mt-1 ${statusColor[found.status]}`}>{found.status}</Badge>
            </div>
            {found.nextDue && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Next Due</p>
                <p className="text-sm font-mono font-semibold text-primary">{found.nextDue}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {["schedule", "history", "supplies"].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-md text-xs font-medium capitalize transition-colors ${activeTab === t ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>{t === "supplies" ? "Medical Supplies" : t === "schedule" ? "My Appointments" : "Health History"}</button>
            ))}
          </div>

          {activeTab === "schedule" && (
            <div className="bg-card rounded-lg border border-border divide-y divide-border">
              {mySchedules.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">No scheduled appointments on record.</div>
              ) : mySchedules.map(s => (
                <div key={s.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${s.status === "Upcoming" ? "bg-blue-100" : s.status === "Completed" ? "bg-emerald-100" : "bg-red-100"}`}>
                      {s.status === "Completed" ? <CheckCircle size={14} className="text-emerald-600" /> : s.status === "Missed" ? <X size={14} className="text-red-500" /> : <Clock size={14} className="text-blue-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.appointmentType}</p>
                      <p className="text-xs text-muted-foreground">{s.details || s.dose || "Routine"} · {s.worker}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-foreground">{s.scheduledDate}</p>
                    <Badge className={statusColor[s.status]}>{s.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "history" && (
            <div className="bg-card rounded-lg border border-border divide-y divide-border">
              {found.vaccinations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">No vaccination history recorded yet.</div>
              ) : found.vaccinations.map(v => (
                <div key={v.id} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Syringe size={14} className="text-primary" />
                      <span className="text-sm font-medium text-foreground">{v.vaccine}</span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{v.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-5">{v.dose} · {v.site} · Batch {v.batchNo}</p>
                  <p className="text-xs text-muted-foreground pl-5">Administered by {v.worker}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "supplies" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {supplies.map(v => (
                <div key={v.id} className="bg-card rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{v.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{v.category} · {v.manufacturer}</p>
                    </div>
                    <Badge className={v.quantity > v.minStock ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}>
                      {v.quantity > v.minStock ? "Available" : "Limited"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Expiry: <span className="font-mono">{v.expiryDate}</span></p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!found && !notFound && (
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <ShieldCheck size={36} className="text-primary/30 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">Your Health. Our Priority.</h3>
          <p className="text-sm text-muted-foreground">Enter your name or Resident ID above to access your vaccination records, upcoming schedules, and health reminders.</p>
        </div>
      )}
    </div>
  );
}
