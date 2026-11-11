import React, { useMemo } from "react";
import { CheckCircle } from "lucide-react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Badge } from "../components/ui/badge";
import { Resident, ScheduleItem } from "../lib/types";

export function PriorityPatients({ residents, schedules }: { residents: Resident[]; schedules: ScheduleItem[] }) {
  const prioritized = useMemo(() => {
    return residents.map(r => {
      let score = 0;
      const reasons: string[] = [];
      if (r.status === "Unvaccinated") { score += 40; reasons.push("Unvaccinated"); }
      if (r.status === "Partially Vaccinated") { score += 20; reasons.push("Incomplete series"); }
      if (r.age >= 60) { score += 20; reasons.push("Senior citizen (60+)"); }
      if (r.age <= 5) { score += 15; reasons.push("Young child (≤5 yrs)"); }
      const missedCount = schedules.filter(s => s.residentId === r.id && s.status === "Missed").length;
      if (missedCount > 0) { score += missedCount * 15; reasons.push(`${missedCount} missed appointment${missedCount > 1 ? "s" : ""}`); }
      if (r.nextDue) {
        const daysUntil = (new Date(r.nextDue).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        if (daysUntil <= 7) { score += 15; reasons.push("Due within 7 days"); }
      }
      const level = score >= 60 ? "Critical" : score >= 35 ? "High" : score >= 15 ? "Medium" : "Low";
      return { ...r, score, reasons, level };
    }).filter(r => r.score > 0).sort((a, b) => b.score - a.score);
  }, [residents, schedules]);

  const levelStyle: Record<string, { badge: string; bar: string; border: string }> = {
    Critical: { badge: "bg-red-100 text-red-700", bar: "bg-red-500", border: "border-l-red-400" },
    High: { badge: "bg-orange-100 text-orange-700", bar: "bg-orange-400", border: "border-l-orange-400" },
    Medium: { badge: "bg-amber-100 text-amber-700", bar: "bg-amber-400", border: "border-l-amber-400" },
    Low: { badge: "bg-blue-100 text-blue-700", bar: "bg-blue-400", border: "border-l-blue-400" },
  };

  const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  prioritized.forEach(p => { counts[p.level as keyof typeof counts]++; });

  return (
    <div>
      <SectionHeader title="Priority Patient Identification" subtitle="Residents flagged for urgent vaccination follow-up" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(["Critical", "High", "Medium", "Low"] as const).map(lv => (
          <div key={lv} className={`rounded-lg p-3.5 border-l-4 bg-card border border-border ${levelStyle[lv].border}`}>
            <p className={`text-2xl font-bold ${levelStyle[lv].badge.split(" ")[1]}`}>{counts[lv]}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{lv} Priority</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {prioritized.map((r, i) => (
          <div key={r.id} className={`bg-card border border-border rounded-lg p-4 border-l-4 ${levelStyle[r.level].border}`}>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">{r.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">{r.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={levelStyle[r.level].badge}>{r.level} Priority</Badge>
                    <span className="font-mono text-xs font-bold text-foreground">Score: {r.score}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {r.reasons.map(reason => (
                    <span key={reason} className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded">{reason}</span>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{r.purok}</span>
                  <span>·</span>
                  <span>{r.age} yrs · {r.gender}</span>
                  {r.nextDue && <><span>·</span><span className="text-amber-600 font-medium">Due: {r.nextDue}</span></>}
                </div>
              </div>
              <div className="w-20 shrink-0">
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${levelStyle[r.level].bar}`} style={{ width: `${Math.min(100, r.score)}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
        {prioritized.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-10 text-center">
            <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-foreground">All residents are up to date!</p>
            <p className="text-sm text-muted-foreground mt-1">No priority follow-ups required at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
