import React, { useState, useMemo } from "react";
import { Download } from "lucide-react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, BarChart, Bar } from "recharts";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Resident, ScheduleItem, MedicalSupply } from "../lib/types";

export function ReportsModule({ residents, schedules, supplies, monthlyVaxData }: { residents: Resident[]; schedules: ScheduleItem[]; supplies: MedicalSupply[]; monthlyVaxData: any[] }) {
  const [activeReport, setActiveReport] = useState("coverage");

  const purokStats = useMemo(() => {
    const puroks = ["Purok 1", "Purok 2", "Purok 3", "Purok 4", "Purok 5"];
    return puroks.map(p => ({
      name: p.replace("Purok ", "P"),
      total: residents.filter(r => r.purok === p).length,
      vaccinated: residents.filter(r => r.purok === p && r.status === "Fully Vaccinated").length,
    }));
  }, [residents]);

  const vaccineTypeStats = useMemo(() => {
    const allVax = residents.flatMap(r => r.vaccinations);
    const counts: Record<string, number> = {};
    allVax.forEach(v => { counts[v.vaccine] = (counts[v.vaccine] || 0) + 1; });
    return Object.entries(counts).map(([name, count]) => ({ name: name.split(" ")[0], count }));
  }, [residents]);

  return (
    <div>
      <SectionHeader title="Reports & Analytics" subtitle="Vaccination coverage and operational insights" action={
        <button className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors">
          <Download size={14} /> Export PDF
        </button>
      } />

      <div className="flex gap-2 mb-5 flex-wrap">
        {[["coverage", "Coverage Report"], ["purok", "By Purok"], ["vaccine", "By Vaccine"], ["schedule", "Schedule Summary"]].map(([k, label]) => (
          <button key={k} onClick={() => setActiveReport(k)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeReport === k ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>{label}</button>
        ))}
      </div>

      {activeReport === "coverage" && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            {[["Fully Vaccinated", residents.filter(r => r.status === "Fully Vaccinated").length, "text-emerald-600", "bg-emerald-50"],
              ["Partially Vaccinated", residents.filter(r => r.status === "Partially Vaccinated").length, "text-amber-600", "bg-amber-50"],
              ["Unvaccinated", residents.filter(r => r.status === "Unvaccinated").length, "text-red-600", "bg-red-50"]].map(([label, count, tc, bg]) => (
              <div key={label as string} className={`rounded-lg p-4 ${bg}`}>
                <p className={`text-2xl font-bold ${tc}`}>{count as number}</p>
                <p className={`text-xs mt-0.5 ${tc}`}>{label}</p>
                <p className={`text-xs font-mono mt-1 ${tc}`}>{Math.round(count as number / residents.length * 100)}%</p>
              </div>
            ))}
          </div>
          <div className="bg-card rounded-lg border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Vaccination Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyVaxData.length > 0 ? monthlyVaxData : []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4EAED" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "DM Mono", fill: "#5E7A8A" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fontFamily: "DM Mono", fill: "#5E7A8A" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 6, fontSize: 12, border: "1px solid #E4EAED" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="vaccinations" stroke="#0B7065" strokeWidth={2} dot={{ r: 4, fill: "#0B7065" }} name="Administered" />
                <Line type="monotone" dataKey="target" stroke="#CBD5E1" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Target" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeReport === "purok" && (
        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Vaccination Coverage by Purok</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={purokStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4EAED" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "DM Mono", fill: "#5E7A8A" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: "DM Mono", fill: "#5E7A8A" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 6, fontSize: 12, border: "1px solid #E4EAED" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="total" fill="#E4F2F0" radius={[3, 3, 0, 0]} name="Total Residents" />
              <Bar dataKey="vaccinated" fill="#0B7065" radius={[3, 3, 0, 0]} name="Fully Vaccinated" />
            </BarChart>
          </ResponsiveContainer>
          <table className="w-full text-sm mt-4">
            <thead><tr className="border-b border-border">
              {["Purok", "Total", "Fully Vaccinated", "Coverage %"].map(h => <th key={h} className="py-2 text-left text-xs font-semibold text-muted-foreground">{h}</th>)}
            </tr></thead>
            <tbody>{purokStats.map(p => (
              <tr key={p.name} className="border-b border-border last:border-0">
                <td className="py-2 text-sm font-medium text-foreground">{p.name.replace("P", "Purok ")}</td>
                <td className="py-2 font-mono text-xs text-muted-foreground">{p.total}</td>
                <td className="py-2 font-mono text-xs text-emerald-600 font-semibold">{p.vaccinated}</td>
                <td className="py-2 font-mono text-xs text-foreground">{p.total > 0 ? Math.round(p.vaccinated / p.total * 100) : 0}%</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {activeReport === "vaccine" && (
        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Doses Administered by Vaccine Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={vaccineTypeStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4EAED" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "DM Mono", fill: "#5E7A8A" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: "DM Mono", fill: "#5E7A8A" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 6, fontSize: 12, border: "1px solid #E4EAED" }} />
              <Bar dataKey="count" fill="#3BADA0" radius={[3, 3, 0, 0]} name="Doses Administered" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeReport === "schedule" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[["Upcoming", schedules.filter(s => s.status === "Upcoming").length, "text-blue-600", "bg-blue-50"],
            ["Completed", schedules.filter(s => s.status === "Completed").length, "text-emerald-600", "bg-emerald-50"],
            ["Missed", schedules.filter(s => s.status === "Missed").length, "text-red-600", "bg-red-50"],
            ["Total Scheduled", schedules.length, "text-foreground", "bg-muted"]].map(([label, count, tc, bg]) => (
            <div key={label as string} className={`rounded-lg p-4 ${bg}`}>
              <p className={`text-2xl font-bold ${tc}`}>{count}</p>
              <p className={`text-xs mt-0.5 ${tc}`}>{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
