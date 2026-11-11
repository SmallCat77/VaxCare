import React, { useMemo } from "react";
import { HeartPulse } from "lucide-react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Badge } from "../components/ui/badge";
import { Resident } from "../lib/types";
import { statusColor } from "../lib/utils";

export function FamilyHealthDashboard({ residents }: { residents: Resident[] }) {
  const families = useMemo(() => {
    const byAddress: Record<string, Resident[]> = {};
    residents.forEach(r => {
      const key = r.address;
      if (!byAddress[key]) byAddress[key] = [];
      byAddress[key].push(r);
    });
    const byLastName: Record<string, Resident[]> = {};
    residents.forEach(r => {
      const lastName = r.name.split(" ").slice(-1)[0];
      if (!byLastName[lastName]) byLastName[lastName] = [];
      byLastName[lastName].push(r);
    });
    return Object.entries(byLastName).map(([name, members]) => {
      const fullyVax = members.filter(m => m.status === "Fully Vaccinated").length;
      const partial = members.filter(m => m.status === "Partially Vaccinated").length;
      const unvax = members.filter(m => m.status === "Unvaccinated").length;
      const coverage = Math.round(fullyVax / members.length * 100);
      const riskLevel = unvax > 0 ? "High Risk" : partial > 0 ? "Moderate" : "Protected";
      return { name, members, fullyVax, partial, unvax, coverage, riskLevel };
    }).sort((a, b) => a.coverage - b.coverage);
  }, [residents]);

  const riskStyle: Record<string, string> = {
    "High Risk": "bg-red-100 text-red-700",
    "Moderate": "bg-amber-100 text-amber-700",
    "Protected": "bg-emerald-100 text-emerald-700",
  };

  return (
    <div>
      <SectionHeader title="Family Health Dashboard" subtitle={`${families.length} family units tracked across all puroks`} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {families.map(fam => (
          <div key={fam.name} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <HeartPulse size={16} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{fam.name} Family</p>
                  <p className="text-xs text-muted-foreground">{fam.members.length} member{fam.members.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <Badge className={riskStyle[fam.riskLevel]}>{fam.riskLevel}</Badge>
            </div>

            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden mb-1.5">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${fam.coverage}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mb-3">{fam.coverage}% fully vaccinated coverage</p>

            <div className="flex gap-2 text-xs mb-3">
              <span className="flex items-center gap-1 text-emerald-600"><div className="w-2 h-2 rounded-full bg-emerald-400" />{fam.fullyVax} fully</span>
              <span className="flex items-center gap-1 text-amber-600"><div className="w-2 h-2 rounded-full bg-amber-400" />{fam.partial} partial</span>
              <span className="flex items-center gap-1 text-red-500"><div className="w-2 h-2 rounded-full bg-red-400" />{fam.unvax} none</span>
            </div>

            <div className="space-y-1 pt-2 border-t border-border">
              {fam.members.map(m => (
                <div key={m.id} className="flex items-center justify-between">
                  <span className="text-xs text-foreground">{m.name}</span>
                  <Badge className={`text-[10px] ${statusColor[m.status]}`}>{m.status.split(" ")[0]}</Badge>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
