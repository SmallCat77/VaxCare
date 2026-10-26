import React from "react";
import { Users, ShieldCheck, Calendar, AlertTriangle, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StatCard } from "../components/ui/StatCard";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Resident, MedicalSupply, ScheduleItem, Notification, Module } from "../lib/types";

export function Dashboard({ residents, supplies, schedules, notifications, monthlyVaxData, setModule }: {
  residents: Resident[]; supplies: MedicalSupply[]; schedules: ScheduleItem[]; notifications: Notification[]; monthlyVaxData: any[]; setModule: (m: Module) => void;
}) {
  const fullyVax = residents.filter(r => r.status === "Fully Vaccinated").length;
  const partial = residents.filter(r => r.status === "Partially Vaccinated").length;
  const unvax = residents.filter(r => r.status === "Unvaccinated").length;
  const lowStock = supplies.filter(s => s.quantity <= s.minStock).length;
  const missed = schedules.filter(s => s.status === "Missed").length;
  const upcoming = schedules.filter(s => s.status === "Upcoming").length;
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {unread > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:bg-amber-100 transition-colors" onClick={() => setModule("notifications")}>
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">{unread} alert{unread > 1 ? "s" : ""} need your attention — {lowStock} low-stock warning{lowStock !== 1 ? "s" : ""}, {missed} missed vaccination{missed !== 1 ? "s" : ""}</p>
          <ChevronRight size={16} className="text-amber-600 ml-auto shrink-0" />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<Users size={20} className="text-teal-700" />} label="Total Residents" value={residents.length} sub="Registered in system" color="bg-teal-50" />
        <StatCard icon={<ShieldCheck size={20} className="text-emerald-700" />} label="Fully Vaccinated" value={fullyVax} sub={`${Math.round(fullyVax / residents.length * 100)}% coverage rate`} color="bg-emerald-50" />
        <StatCard icon={<Calendar size={20} className="text-blue-700" />} label="Upcoming Schedules" value={upcoming} sub="Next 30 days" color="bg-blue-50" />
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-base font-semibold text-foreground mb-5">Monthly Vaccinations vs. Target</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyVaxData.length > 0 ? monthlyVaxData : []} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4EAED" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 13, fill: "#5E7A8A" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 13, fill: "#5E7A8A" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13, border: "1px solid #E4EAED" }} />
            <Bar dataKey="vaccinations" fill="#0B7065" radius={[4, 4, 0, 0]} name="Administered" />
            <Bar dataKey="target" fill="#E4F2F0" radius={[4, 4, 0, 0]} name="Target" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card rounded-lg border border-border p-6">
          <SectionHeader title="Upcoming Schedules" action={
            <button onClick={() => setModule("schedule")} className="text-sm text-primary font-medium hover:underline">View all</button>
          } />
          <div className="space-y-3">
            {schedules.filter(s => s.status === "Upcoming").slice(0, 4).map(s => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{s.residentName.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.residentName}</p>
                    <p className="text-sm text-muted-foreground">{s.appointmentType} {s.details ? `— ${s.details}` : ''}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground">{new Date(s.scheduledDate).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</p>
                  <p className="text-sm text-muted-foreground">{s.purok}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <SectionHeader title="Medical Supplies" action={
            <button onClick={() => setModule("inventory")} className="text-sm text-primary font-medium hover:underline">Manage</button>
          } />
          <div className="space-y-4">
            {supplies.map(v => {
              const pct = Math.min(100, Math.round(v.quantity / (Math.max(1, v.minStock) * 3) * 100));
              const isCritical = v.quantity < v.minStock;
              const isLow = v.quantity <= v.minStock * 1.2;
              return (
                <div key={v.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-foreground">{v.name} <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded ml-2">{v.category}</span></span>
                    <span className={`text-sm ${isCritical ? "text-red-600 font-semibold" : isLow ? "text-amber-600" : "text-muted-foreground"}`}>{v.quantity} units</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${isCritical ? "bg-red-500" : isLow ? "bg-amber-400" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
