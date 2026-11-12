import React from "react";

export function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; trend?: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 flex items-center gap-4 shadow-xs hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl ${color} shrink-0 border border-slate-200/50`}>{icon}</div>
      <div>
        <p className="text-3xl font-extrabold text-slate-900 leading-none tracking-tight">{value}</p>
        <p className="text-xs font-bold text-slate-700 mt-1.5">{label}</p>
        {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
