import React from "react";

export function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; trend?: number; color: string }) {
  return (
    <div className="bg-card rounded-lg border border-border p-6 flex items-center gap-4">
      <div className={`p-3 rounded-full ${color} shrink-0`}>{icon}</div>
      <div>
        <p className="text-3xl font-bold text-foreground leading-none">{value}</p>
        <p className="text-sm font-medium text-foreground mt-1.5">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
