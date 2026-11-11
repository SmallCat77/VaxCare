import React, { useState, useMemo } from "react";
import { Syringe, X, Clock } from "lucide-react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Badge } from "../components/ui/badge";
import { Resident, ScheduleItem } from "../lib/types";
import { statusColor } from "../lib/utils";

export function HealthHistoryTimeline({ residents, schedules }: { residents: Resident[]; schedules: ScheduleItem[] }) {
  const [selectedId, setSelectedId] = useState(residents[0]?.id ?? "");
  const resident = residents.find(r => r.id === selectedId);

  type TimelineEvent = { date: string; type: "vaccination" | "scheduled" | "missed"; label: string; sub: string };

  const events: TimelineEvent[] = useMemo(() => {
    if (!resident) return [];
    const vaxEvents: TimelineEvent[] = resident.vaccinations.map(v => ({
      date: v.date, type: "vaccination" as const,
      label: `${v.vaccine} — ${v.dose}`,
      sub: `${v.site} · Batch ${v.batchNo} · ${v.worker}`,
    }));
    const schedEvents: TimelineEvent[] = schedules
      .filter(s => s.residentId === resident.id)
      .map(s => ({
        date: s.scheduledDate,
        type: s.status === "Missed" ? "missed" as const : "scheduled" as const,
        label: `${s.vaccine} — ${s.dose}`,
        sub: `${s.status} · ${s.worker}`,
      }));
    return [...vaxEvents, ...schedEvents].sort((a, b) => a.date.localeCompare(b.date));
  }, [resident, schedules]);

  const dotColor: Record<TimelineEvent["type"], string> = {
    vaccination: "bg-primary border-primary",
    scheduled: "bg-blue-400 border-blue-400",
    missed: "bg-red-400 border-red-400",
  };
  const labelColor: Record<TimelineEvent["type"], string> = {
    vaccination: "text-primary",
    scheduled: "text-blue-600",
    missed: "text-red-600",
  };

  return (
    <div>
      <SectionHeader title="Resident Health History Timeline" subtitle="Chronological view of all health events per resident" />
      <div className="flex items-center gap-3 mb-6">
        <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Select Resident</label>
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 flex-1 max-w-xs">
          {residents.map(r => <option key={r.id} value={r.id}>{r.name} ({r.id})</option>)}
        </select>
      </div>

      {resident && (
        <div className="flex gap-6 flex-col lg:flex-row">
          <div className="lg:w-56 shrink-0 bg-card border border-border rounded-lg p-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary mb-3">{resident.name.charAt(0)}</div>
            <p className="font-bold text-foreground">{resident.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{resident.id} · {resident.purok}</p>
            <p className="text-xs text-muted-foreground">{resident.gender} · {resident.age} yrs</p>
            <Badge className={`mt-2 ${statusColor[resident.status]}`}>{resident.status}</Badge>
            <div className="mt-4 space-y-2 pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-xs"><div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" /><span className="text-muted-foreground">Vaccination given</span></div>
              <div className="flex items-center gap-2 text-xs"><div className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0" /><span className="text-muted-foreground">Scheduled</span></div>
              <div className="flex items-center gap-2 text-xs"><div className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0" /><span className="text-muted-foreground">Missed</span></div>
            </div>
          </div>

          <div className="flex-1">
            {events.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-10 text-center text-muted-foreground text-sm">No health events recorded for this resident.</div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-0">
                  {events.map((ev, i) => (
                    <div key={i} className="relative flex gap-5 pb-5">
                      <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 bg-card ${dotColor[ev.type]}`}>
                        {ev.type === "vaccination" ? <Syringe size={12} className="text-white" /> : ev.type === "missed" ? <X size={12} className="text-white" /> : <Clock size={12} className="text-white" />}
                      </div>
                      <div className="bg-card border border-border rounded-lg p-3.5 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <span className={`text-sm font-semibold ${labelColor[ev.type]}`}>{ev.label}</span>
                          <span className="font-mono text-xs text-muted-foreground shrink-0">{ev.date}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{ev.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
