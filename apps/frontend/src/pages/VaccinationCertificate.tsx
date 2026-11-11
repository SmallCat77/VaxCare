import React, { useState } from "react";
import { PrinterIcon, ShieldCheck, Award } from "lucide-react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Badge } from "../components/ui/badge";
import { Resident } from "../lib/types";
import { statusColor } from "../lib/utils";

export function VaccinationCertificate({ residents }: { residents: Resident[] }) {
  const [selectedId, setSelectedId] = useState(residents[0]?.id ?? "");
  const resident = residents.find(r => r.id === selectedId);

  return (
    <div>
      <SectionHeader title="Digital Vaccination Certificate" subtitle="Generate official vaccination records for residents" action={
        <button onClick={() => window.print()} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors">
          <PrinterIcon size={14} /> Print Certificate
        </button>
      } />

      <div className="flex items-center gap-3 mb-6">
        <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Select Resident</label>
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 flex-1 max-w-xs">
          {residents.map(r => <option key={r.id} value={r.id}>{r.name} ({r.id})</option>)}
        </select>
      </div>

      {resident && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border-2 border-primary/30 rounded-xl overflow-hidden shadow-md">
            <div className="bg-gradient-to-r from-primary to-teal-500 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/70">Republic of the Philippines</p>
                    <p className="font-bold text-lg leading-tight">VaxCare</p>
                    <p className="text-[10px] text-white/70">Barangay Health Center</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/70 uppercase tracking-wider">Certificate No.</p>
                  <p className="font-mono font-bold text-lg">VC-{resident.id}-2025</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-[10px] uppercase tracking-widest text-white/70 mb-0.5">Official Vaccination Certificate</p>
                <p className="text-2xl font-bold">{resident.name}</p>
                <p className="text-sm text-white/80 mt-0.5">{resident.id} · {resident.gender} · Born {resident.birthdate} · {resident.purok}</p>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Vaccination Record</h3>
                <Badge className={statusColor[resident.status]}>{resident.status}</Badge>
              </div>

              {resident.vaccinations.length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center py-6">No vaccinations on record.</p>
              ) : (
                <table className="w-full text-sm mb-6">
                  <thead>
                    <tr className="border-b-2 border-primary/20">
                      {["#", "Vaccine", "Dose", "Date Administered", "Site", "Batch No.", "Health Worker"].map((h, i) => (
                        <th key={`cert-h-${i}`} className="pb-2 text-left text-xs font-bold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resident.vaccinations.map((v, i) => (
                      <tr key={v.id} className="border-b border-border">
                        <td className="py-2.5 font-mono text-xs text-muted-foreground">{i + 1}</td>
                        <td className="py-2.5 font-medium text-foreground">{v.vaccine}</td>
                        <td className="py-2.5 text-xs text-muted-foreground">{v.dose}</td>
                        <td className="py-2.5 font-mono text-xs text-foreground">{v.date}</td>
                        <td className="py-2.5 text-xs text-muted-foreground">{v.site}</td>
                        <td className="py-2.5 font-mono text-xs text-muted-foreground">{v.batchNo}</td>
                        <td className="py-2.5 text-xs text-muted-foreground">{v.worker}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div className="flex items-end justify-between pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Date Issued</p>
                  <p className="text-sm font-mono font-semibold text-foreground">{new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">Dr. Pedro Cruz</p>
                  <p className="text-xs font-semibold text-foreground">Barangay Health Officer</p>
                </div>
                <div className="w-16 h-16 rounded-full border-2 border-primary/40 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award size={20} className="text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
