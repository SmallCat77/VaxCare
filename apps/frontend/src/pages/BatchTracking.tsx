import React, { useState, useMemo } from "react";
import { Layers } from "lucide-react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Resident, MedicalSupply } from "../lib/types";

export function BatchTracking({ residents, supplies }: { residents: Resident[]; supplies: MedicalSupply[] }) {
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);

  const batches = useMemo(() => {
    const map: Record<string, { batchNo: string; vaccine: string; recipients: { name: string; id: string; date: string; dose: string }[] }> = {};
    residents.forEach(r => {
      r.vaccinations.forEach(v => {
        if (!v.batchNo) return;
        if (!map[v.batchNo]) map[v.batchNo] = { batchNo: v.batchNo, vaccine: v.vaccine, recipients: [] };
        map[v.batchNo].recipients.push({ name: r.name, id: r.id, date: v.date, dose: v.dose });
      });
    });
    return Object.values(map).sort((a, b) => a.vaccine.localeCompare(b.vaccine));
  }, [residents]);

  const selected = batches.find(b => b.batchNo === selectedBatch);

  const suppliesByName = useMemo(() => {
    const m: Record<string, MedicalSupply> = {};
    supplies.forEach(s => { m[s.name] = s; });
    return m;
  }, [supplies]);

  return (
    <div>
      <SectionHeader title="Vaccine Batch Tracking" subtitle={`${batches.length} active batches across all vaccine types`} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">All Batches</p>
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            {batches.length === 0 && <p className="p-6 text-sm text-muted-foreground text-center">No batch records found.</p>}
            {batches.map(b => {
              const stockInfo = suppliesByName[b.vaccine];
              return (
                <div key={b.batchNo} onClick={() => setSelectedBatch(b.batchNo)} className={`p-4 cursor-pointer transition-colors ${selectedBatch === b.batchNo ? "bg-primary/5" : "hover:bg-muted/30"}`}>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-foreground text-sm">Batch {b.batchNo}</h4>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{b.recipients.length} Administered</span>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">{b.vaccine}</p>
                  <div className="flex items-center justify-between">
                    {stockInfo && <p className="text-xs text-muted-foreground">Exp: {stockInfo.expiryDate}</p>}
                    <p className="text-xs text-muted-foreground ml-auto">{b.recipients.length > 0 ? new Date(Math.max(...b.recipients.map(r => new Date(r.date).getTime()))).toLocaleDateString() : ""}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {selected ? `Batch ${selected.batchNo} — Recipients` : "Select a batch to see details"}
          </p>
          {selected ? (
            <div className="bg-card rounded-lg border border-border">
              <div className="p-6 border-b border-border">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Batch {selected.batchNo}</h3>
                    <p className="text-sm font-medium text-muted-foreground">{selected.vaccine}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{selected.recipients.length}</p>
                    <p className="text-xs text-muted-foreground">Total Doses Given</p>
                  </div>
                </div>
                {suppliesByName[selected.vaccine] && (
                  <div className="flex gap-4 pt-4 border-t border-border">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Mfr: {suppliesByName[selected.vaccine].manufacturer}</span>
                      <span className="text-xs text-muted-foreground">Exp: {suppliesByName[selected.vaccine].expiryDate}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="divide-y divide-border">
                {selected.recipients.map((rec, i) => (
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{rec.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{rec.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{rec.id} · {rec.dose}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{rec.date}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-10 text-center">
              <Layers size={32} className="text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Click a batch on the left to see which residents received doses from it.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
