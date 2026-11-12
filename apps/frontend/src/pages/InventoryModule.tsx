import React, { useState, useMemo } from "react";
import { Download, AlertTriangle, RefreshCw, Package, X, Check, Shield } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { SectionHeader } from "../components/ui/SectionHeader";
import { MedicalSupply } from "../lib/types";
import { ApiClientError } from "../lib/api";

export function InventoryModule({ supplies, onRestock }: { supplies: MedicalSupply[]; onRestock: (id: string, addQty: number) => Promise<void> }) {
  const [showRestock, setShowRestock] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState("50");
  const [restocking, setRestocking] = useState(false);
  const [restockError, setRestockError] = useState("");

  const vaccineDistData = useMemo(
    () => supplies.map(s => ({ name: s.name.split(" ")[0], doses: s.quantity })),
    [supplies]
  );

  async function restock(id: string) {
    setRestocking(true);
    setRestockError("");
    try {
      await onRestock(id, Number(restockQty));
      setShowRestock(null);
      setRestockQty("50");
    } catch (err) {
      setRestockError(err instanceof ApiClientError ? err.message : "Failed to restock. Please try again.");
    } finally {
      setRestocking(false);
    }
  }

  const critical = supplies.filter(s => s.quantity < s.minStock);
  const low = supplies.filter(s => s.quantity >= s.minStock && s.quantity <= s.minStock * 1.3);

  return (
    <div>
      <SectionHeader title="Medical Supplies" subtitle="Monitor stock levels and manage replenishment" action={
        <button className="flex items-center gap-1.5 bg-card border border-border text-foreground text-sm font-medium px-3 py-1.5 rounded-md hover:bg-muted transition-colors">
          <Download size={14} /> Export Report
        </button>
      } />

      {(critical.length > 0 || low.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {critical.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle size={14} className="text-red-500" />
                <span className="text-sm font-semibold text-red-700">Critical Stock</span>
              </div>
              {critical.map(s => <p key={s.id} className="text-xs text-red-600">{s.name}: <span className="font-mono font-bold">{s.quantity}</span> / {s.minStock} min</p>)}
            </div>
          )}
          {low.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle size={14} className="text-amber-500" />
                <span className="text-sm font-semibold text-amber-700">Low Stock</span>
              </div>
              {low.map(s => <p key={s.id} className="text-xs text-amber-600">{s.name}: <span className="font-mono font-bold">{s.quantity}</span> / {s.minStock} min</p>)}
            </div>
          )}
        </div>
      )}

      {showRestock && (
        <div className="fixed inset-0 bg-[#0A1E2F]/65 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden ring-1 ring-slate-900/10" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Clinical Header */}
            <div className="bg-gradient-to-r from-[#0A1E2F] to-[#0E2E42] px-6 py-4 border-b border-[#163247] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D97706] to-[#F59E0B] flex items-center justify-center text-white shadow-md shadow-amber-950/40 shrink-0">
                  <Package size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-white tracking-tight">Restock Vaccine Lot</h3>
                    <span className="text-[9px] font-mono font-bold bg-[#112C40] text-[#38BDF8] border border-[#164E63] px-1.5 py-0.2 rounded uppercase">Supply</span>
                  </div>
                  <p className="text-[11px] text-[#8FAEC5] font-medium mt-0.5">Cold Chain Storage · Central Formulary</p>
                </div>
              </div>
              <button
                onClick={() => setShowRestock(null)}
                className="text-[#8FAEC5] hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Target Vaccine Item</p>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">{supplies.find(s => s.id === showRestock)?.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">Current Stock: <span className="font-mono font-bold text-slate-800">{supplies.find(s => s.id === showRestock)?.quantity} units</span></p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                  Vials / Units Received <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={e => setRestockQty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B7065]/20 focus:border-[#0B7065] focus:bg-white transition-all"
                />
              </div>

              {restockError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold p-3 rounded-lg">
                  {restockError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                <Shield size={12} className="text-[#0B7065]" />
                Inventory Logged
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRestock(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  disabled={restocking}
                  onClick={() => restock(showRestock)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#0B7065] to-[#0E8376] hover:from-[#095C53] hover:to-[#0B7065] rounded-lg transition-all shadow-sm shadow-teal-950/20 disabled:opacity-50"
                >
                  <Check size={13} />
                  <span>{restocking ? "Updating..." : "Confirm Restock"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Stock Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={vaccineDistData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E4EAED" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fontFamily: "DM Mono", fill: "#5E7A8A" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#5E7A8A" }} axisLine={false} tickLine={false} width={65} />
              <Tooltip contentStyle={{ borderRadius: 6, fontSize: 12, border: "1px solid #E4EAED" }} />
              <Bar dataKey="doses" fill="#0B7065" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-lg border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Stock Summary</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xl font-bold text-red-600">{critical.length}</p>
                <p className="text-xs text-red-600 mt-0.5">Critical</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3">
                <p className="text-xl font-bold text-amber-600">{low.length}</p>
                <p className="text-xs text-amber-600 mt-0.5">Low Stock</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3">
                <p className="text-xl font-bold text-emerald-600">{supplies.length - critical.length - low.length}</p>
                <p className="text-xs text-emerald-600 mt-0.5">Adequate</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2">
              <p className="text-xs font-medium text-muted-foreground">Expiring Soon (within 90 days)</p>
              {supplies.filter(s => {
                if (!s.expiryDate) return false;
                const exp = new Date(s.expiryDate);
                const now = new Date();
                const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                return diff < 90;
              }).map(s => (
                <div key={s.id} className="flex justify-between text-xs">
                  <span className="text-foreground truncate">{s.name}</span>
                  <span className="font-mono text-amber-600 shrink-0 ml-2">{s.expiryDate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {["Item Name", "Category", "In Stock", "Min. Stock", "Expiry Date", "Manufacturer", "Last Restocked", "Action"].map((h, i) => (
                <th key={`inv-h-${i}`} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{h !== "Action" ? h : ""}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {supplies.map(s => {
              const isCrit = s.quantity < s.minStock;
              const isLow = s.quantity >= s.minStock && s.quantity <= s.minStock * 1.3;
              
              let isExpiringSoon = false;
              let isExpired = false;
              if (s.expiryDate) {
                const exp = new Date(s.expiryDate);
                const diff = (exp.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
                isExpiringSoon = diff >= 0 && diff < 90;
                isExpired = diff < 0;
              }

              return (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{s.name}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`px-2 py-1 rounded-md bg-muted text-muted-foreground font-medium`}>{s.category}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`font-mono font-semibold text-sm ${isCrit ? "text-red-600" : isLow ? "text-amber-600" : "text-emerald-600"}`}>{s.quantity}</span>
                    {isCrit && <span className="ml-1.5 text-[10px] font-bold tracking-wider text-red-500 uppercase">Critical</span>}
                    {isLow && !isCrit && <span className="ml-1.5 text-[10px] font-bold tracking-wider text-amber-500 uppercase">Low</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.minStock}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    <span className={`${isExpired ? "text-red-600 font-bold" : isExpiringSoon ? "text-amber-600 font-semibold" : "text-muted-foreground"}`}>{s.expiryDate || "N/A"}</span>
                    {isExpired && <span className="ml-1.5 text-[10px] font-bold tracking-wider bg-red-100 text-red-700 px-1.5 py-0.5 rounded uppercase">Expired</span>}
                    {isExpiringSoon && <span className="ml-1.5 text-[10px] font-bold tracking-wider bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase">Soon</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{s.manufacturer || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.lastRestocked || "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button onClick={() => setShowRestock(s.id)} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium bg-primary/10 px-2.5 py-1.5 rounded-md transition-colors">
                      <RefreshCw size={13} /> Restock
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
