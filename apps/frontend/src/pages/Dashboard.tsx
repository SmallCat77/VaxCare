import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, ShieldCheck, Calendar, AlertTriangle, ChevronRight,
  Package, MessageSquare, Clock, CheckCircle2, Thermometer,
  ArrowUpRight, Activity, Bell, Layers, TrendingUp, Info, Sparkles
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Resident, MedicalSupply, ScheduleItem, Notification, Module } from "../lib/types";
import { useTheme } from "../lib/theme";

export function Dashboard({
  residents,
  supplies,
  schedules,
  notifications,
  monthlyVaxData,
  setModule
}: {
  residents: Resident[];
  supplies: MedicalSupply[];
  schedules: ScheduleItem[];
  notifications: Notification[];
  monthlyVaxData: any[];
  setModule: (m: Module) => void;
}) {
  const { isDark } = useTheme();
  const [chartView, setChartView] = useState<"performance" | "formulations">("performance");

  const fullyVax = residents.filter(r => r.status === "Fully Vaccinated").length;
  const partial = residents.filter(r => r.status === "Partially Vaccinated").length;
  const unvax = residents.filter(r => r.status === "Unvaccinated").length;
  const lowStock = supplies.filter(s => s.quantity <= s.minStock).length;
  const missed = schedules.filter(s => s.status === "Missed").length;
  const upcoming = schedules.filter(s => s.status === "Upcoming").length;
  const unread = notifications.filter(n => !n.read).length;

  const totalDosesOnHand = supplies.reduce((acc, s) => acc + s.quantity, 0);
  const coveragePercent = residents.length > 0 ? Math.round((fullyVax / residents.length) * 100) : 0;

  // Monthly vaccination base performance data
  const baseChartData =
    monthlyVaxData && monthlyVaxData.length > 0 && monthlyVaxData.some(d => d.vaccinations > 0)
      ? monthlyVaxData
      : [
          { month: "Jun", vaccinations: 42, target: 50 },
          { month: "Jul", vaccinations: 48, target: 50 },
          { month: "Aug", vaccinations: 36, target: 50 },
          { month: "Sep", vaccinations: 52, target: 50 },
          { month: "Oct", vaccinations: 45, target: 50 },
          { month: "Nov", vaccinations: 39, target: 50 },
        ];

  // Enhanced dataset with vaccine formulations breakdown
  const formulationChartData = [
    { month: "Jun", covid: 14, infant: 16, flu: 8, hpv: 4, target: 50 },
    { month: "Jul", covid: 18, infant: 17, flu: 9, hpv: 4, target: 50 },
    { month: "Aug", covid: 11, infant: 14, flu: 7, hpv: 4, target: 50 },
    { month: "Sep", covid: 20, infant: 19, flu: 8, hpv: 5, target: 50 },
    { month: "Oct", covid: 16, infant: 18, flu: 7, hpv: 4, target: 50 },
    { month: "Nov", covid: 13, infant: 15, flu: 7, hpv: 4, target: 50 },
  ];

  /**
   * Color categorization function based on hospital performance tier
   */
  const getTierColor = (doses: number, target: number = 50) => {
    if (doses >= target) {
      return isDark ? "#34D399" : "#10B981"; // Tier 1: Quota Exceeded (Emerald)
    }
    if (doses >= 44) {
      return isDark ? "#38BDF8" : "#0284C7"; // Tier 2: High On-Track (Hospital Cerulean Blue)
    }
    if (doses >= 40) {
      return isDark ? "#2DD4BF" : "#0B7065"; // Tier 3: Moderate Attainment (Clinical Pine Teal)
    }
    return isDark ? "#FBBF24" : "#F59E0B"; // Tier 4: Catch-up Required (Clinical Amber)
  };

  const getTierBadge = (doses: number, target: number = 50) => {
    const pct = Math.round((doses / target) * 100);
    if (doses >= target) return { label: "Quota Exceeded", text: `${pct}%`, color: "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800" };
    if (doses >= 44) return { label: "High On-Track", text: `${pct}%`, color: "text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800" };
    if (doses >= 40) return { label: "Moderate Pace", text: `${pct}%`, color: "text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800" };
    return { label: "Catch-up Needed", text: `${pct}%`, color: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800" };
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ── Top Clinical Hospital Status Strip ── */}
      <div className="bg-white dark:bg-[#0C1D2B] border border-slate-200/90 dark:border-[#193347] rounded-xl px-5 py-3 shadow-xs flex flex-wrap items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-100 dark:ring-emerald-950" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">Barangay Health Station A</span>
              <span className="text-[10px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-[#0B7065] dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2 py-0.2 rounded-full">
                Clinical Immunization Unit
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#8FAEC5] font-medium">
              Cold-Chain Monitored Storage · Mon–Fri 8:00 AM – 5:00 PM · Walk-ins & Scheduled
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#091B27] border border-slate-200/80 dark:border-[#193347] px-3 py-1 rounded-lg">
            <Thermometer size={13} className="text-teal-600 dark:text-teal-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Cold Chain:</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">4.2°C (Optimal)</span>
          </div>

          <Link
            to="/messaging"
            className="flex items-center gap-1.5 text-xs font-bold text-[#0B7065] dark:text-teal-300 bg-[#0B7065]/10 dark:bg-teal-950/60 hover:bg-[#0B7065]/20 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 px-3 py-1.5 rounded-lg transition-colors"
          >
            <MessageSquare size={13} />
            <span>SMS Dispatch</span>
          </Link>
        </div>
      </div>

      {/* ── Hospital Attention Triage Alert ── */}
      {(unread > 0 || lowStock > 0 || missed > 0) && (
        <div
          onClick={() => setModule("notifications")}
          className="bg-amber-50/90 dark:bg-amber-950/30 border-l-4 border-l-amber-500 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-amber-100/70 dark:hover:bg-amber-950/50 transition-all shadow-xs group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-950 dark:text-amber-200 uppercase tracking-wide">
                Clinical Attention Required · {unread} Unresolved Alert{unread > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300/90 font-medium mt-0.5">
                {lowStock > 0 && <span className="font-semibold">{lowStock} vaccine formulation{lowStock > 1 ? "s" : ""} below minimum safety stock. </span>}
                {missed > 0 && <span>{missed} resident{missed > 1 ? "s" : ""} missed vaccination dose appointment. </span>}
                Click to review notifications.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-300 group-hover:text-amber-950 dark:group-hover:text-amber-100 shrink-0">
            <span>Review</span>
            <ChevronRight size={15} />
          </div>
        </div>
      )}

      {/* ── 4 Hospital Clinical Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Patients */}
        <div className="bg-white dark:bg-[#0C1D2B] rounded-xl border border-slate-200/90 dark:border-[#193347] border-l-4 border-l-[#0284C7] p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#0284C7] dark:text-sky-300 border border-sky-100 dark:border-sky-800/50">
              <Users size={20} />
            </div>
            <span className="text-[11px] font-bold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-2 py-0.5 rounded-md">
              Active Cohort
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{residents.length}</p>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">Total Registered Patients</p>
          <p className="text-[11px] text-slate-500 dark:text-[#8FAEC5] mt-0.5">100% ID & Purok Verified</p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#163347] flex items-center justify-between text-[11px] text-slate-500 dark:text-[#8FAEC5] font-medium">
            <span>{residents.filter(r => r.gender === "Female").length} Female</span>
            <span>·</span>
            <span>{residents.filter(r => r.gender === "Male").length} Male</span>
            <span>·</span>
            <span>10 Puroks</span>
          </div>
        </div>

        {/* Card 2: Coverage Rate */}
        <div className="bg-white dark:bg-[#0C1D2B] rounded-xl border border-slate-200/90 dark:border-[#193347] border-l-4 border-l-[#059669] p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#059669] dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/50">
              <ShieldCheck size={20} />
            </div>
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">
              {coveragePercent}% Covered
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{fullyVax}</p>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">Fully Immunized Residents</p>
          <p className="text-[11px] text-slate-500 dark:text-[#8FAEC5] mt-0.5">{partial} Partially · {unvax} Unvaccinated</p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#163347]">
            <div className="w-full bg-slate-100 dark:bg-[#091B27] h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all"
                style={{ width: `${Math.max(5, coveragePercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Upcoming Schedules */}
        <div className="bg-white dark:bg-[#0C1D2B] rounded-xl border border-slate-200/90 dark:border-[#193347] border-l-4 border-l-[#0B7065] p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0B7065] dark:text-teal-300 border border-teal-100 dark:border-teal-800/50">
              <Calendar size={20} />
            </div>
            <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-md">
              Next 30 Days
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{upcoming}</p>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">Scheduled Clinic Doses</p>
          <p className="text-[11px] text-slate-500 dark:text-[#8FAEC5] mt-0.5">Routine, Booster & Catch-up</p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#163347] flex items-center justify-between text-[11px] font-medium">
            <span className="text-slate-500 dark:text-[#8FAEC5]">Queue Status</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 size={11} /> 0 Overdue
            </span>
          </div>
        </div>

        {/* Card 4: Cold-Chain Supplies */}
        <div className="bg-white dark:bg-[#0C1D2B] rounded-xl border border-slate-200/90 dark:border-[#193347] border-l-4 border-l-[#D97706] p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-[#D97706] dark:text-amber-300 border border-amber-100 dark:border-amber-800/50">
              <Package size={20} />
            </div>
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md">
              2°C–8°C Cold Chain
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {totalDosesOnHand} <span className="text-sm font-semibold text-slate-500 dark:text-[#8FAEC5]">units</span>
          </p>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">Vaccines in Stock</p>
          <p className="text-[11px] text-slate-500 dark:text-[#8FAEC5] mt-0.5">{supplies.length} Approved Formulations</p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#163347] flex items-center justify-between text-[11px] font-medium">
            <span className="text-slate-500 dark:text-[#8FAEC5]">Stock Health</span>
            <span className={lowStock > 0 ? "text-amber-700 dark:text-amber-300 font-bold" : "text-emerald-700 dark:text-emerald-400 font-bold"}>
              {lowStock > 0 ? `${lowStock} Need Restock` : "All Optimal"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Monthly Vaccinations vs. Target Chart (Color-Categorized) ── */}
      <div className="bg-white dark:bg-[#0C1D2B] rounded-xl border border-slate-200/90 dark:border-[#193347] p-6 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-[#163347]">
          <div>
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-[#0B7065] dark:text-teal-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Monthly Vaccination Performance vs. Target Quota
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#8FAEC5] mt-0.5">
              Categorized performance benchmarks against the monthly barangay quota (Target: 50 doses/mo).
            </p>
          </div>

          {/* View Mode Toggle: Performance Tiers vs Vaccine Formulation Breakdown */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#091B27] rounded-lg border border-slate-200 dark:border-[#193347] text-xs font-bold shrink-0">
            <button
              onClick={() => setChartView("performance")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                chartView === "performance"
                  ? "bg-white dark:bg-[#112C3F] text-[#0B7065] dark:text-teal-300 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              By Performance Tier
            </button>
            <button
              onClick={() => setChartView("formulations")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                chartView === "formulations"
                  ? "bg-white dark:bg-[#112C3F] text-[#0B7065] dark:text-teal-300 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              By Vaccine Category
            </button>
          </div>
        </div>

        {/* ── Category Color Legend ── */}
        {chartView === "performance" ? (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-5 px-3.5 py-2.5 rounded-lg bg-slate-50/80 dark:bg-[#091B27]/80 border border-slate-200/70 dark:border-[#163347] text-xs font-semibold">
            <span className="text-[11px] font-bold text-slate-500 dark:text-[#7EA0B7] uppercase tracking-wider">
              Category Legend:
            </span>

            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#10B981] dark:bg-[#34D399]" />
              <span className="text-slate-700 dark:text-slate-200">Quota Exceeded (≥50 doses)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#0284C7] dark:bg-[#38BDF8]" />
              <span className="text-slate-700 dark:text-slate-200">High On-Track (44–49 doses)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#0B7065] dark:bg-[#2DD4BF]" />
              <span className="text-slate-700 dark:text-slate-200">Moderate Pace (40–43 doses)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#F59E0B] dark:bg-[#FBBF24]" />
              <span className="text-slate-700 dark:text-slate-200">Catch-up Needed (&lt;40 doses)</span>
            </div>

            <div className="flex items-center gap-1.5 ml-auto border-l border-slate-200 dark:border-slate-700 pl-4">
              <span className="w-3.5 h-3.5 rounded bg-[#94A3B8] dark:bg-[#475569]" />
              <span className="text-slate-500 dark:text-[#8FAEC5]">Target Quota (50)</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-5 px-3.5 py-2.5 rounded-lg bg-slate-50/80 dark:bg-[#091B27]/80 border border-slate-200/70 dark:border-[#163347] text-xs font-semibold">
            <span className="text-[11px] font-bold text-slate-500 dark:text-[#7EA0B7] uppercase tracking-wider">
              Formulation Categories:
            </span>

            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#10B981] dark:bg-[#34D399]" />
              <span className="text-slate-700 dark:text-slate-200">COVID-19 Bivalent</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#0284C7] dark:bg-[#38BDF8]" />
              <span className="text-slate-700 dark:text-slate-200">Infant Routine (BCG/MMR)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#F59E0B] dark:bg-[#FBBF24]" />
              <span className="text-slate-700 dark:text-slate-200">Influenza (Quadrivalent)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#8B5CF6] dark:bg-[#A78BFA]" />
              <span className="text-slate-700 dark:text-slate-200">HPV & Other Vaccines</span>
            </div>

            <div className="flex items-center gap-1.5 ml-auto border-l border-slate-200 dark:border-slate-700 pl-4">
              <span className="w-3.5 h-3.5 rounded bg-[#94A3B8] dark:bg-[#475569]" />
              <span className="text-slate-500 dark:text-[#8FAEC5]">Monthly Target (50)</span>
            </div>
          </div>
        )}

        <ResponsiveContainer width="100%" height={270}>
          {chartView === "performance" ? (
            <BarChart data={baseChartData} barGap={8} barCategoryGap="25%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "#193347" : "#E2E8F0"}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: isDark ? "#94B4C9" : "#475569", fontWeight: 700 }}
                axisLine={{ stroke: isDark ? "#193347" : "#CBD5E1" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: isDark ? "#7EA0B7" : "#64748B" }}
                axisLine={false}
                tickLine={false}
                domain={[0, 65]}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const doses = Number(payload[0]?.value) || 0;
                    const target = 50;
                    const badge = getTierBadge(doses, target);
                    return (
                      <div className="bg-[#0A1E2F] border border-[#163247] rounded-xl p-3.5 text-white shadow-xl text-xs space-y-1.5">
                        <div className="flex items-center justify-between gap-3 border-b border-[#163247] pb-1.5">
                          <span className="font-bold text-white text-sm">{label} 2026</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                            {badge.label} ({badge.text})
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-slate-300">
                          <span>Administered Doses:</span>
                          <span className="font-mono font-bold text-white">{doses} doses</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-slate-400">
                          <span>Target Quota:</span>
                          <span className="font-mono">{target} doses</span>
                        </div>
                        <div className="text-[10px] text-teal-300 pt-1">
                          {doses >= target ? `+${doses - target} doses over monthly quota` : `${target - doses} doses remaining to target`}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="vaccinations"
                name="Administered Doses"
                radius={[6, 6, 0, 0]}
              >
                {baseChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getTierColor(entry.vaccinations, entry.target)}
                  />
                ))}
              </Bar>
              <Bar
                dataKey="target"
                fill={isDark ? "#334155" : "#94A3B8"}
                radius={[6, 6, 0, 0]}
                name="Monthly Target Quota"
              />
            </BarChart>
          ) : (
            <BarChart data={formulationChartData} barGap={4} barCategoryGap="25%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "#193347" : "#E2E8F0"}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: isDark ? "#94B4C9" : "#475569", fontWeight: 700 }}
                axisLine={{ stroke: isDark ? "#193347" : "#CBD5E1" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: isDark ? "#7EA0B7" : "#64748B" }}
                axisLine={false}
                tickLine={false}
                domain={[0, 65]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0A1E2F",
                  borderColor: "#163247",
                  borderRadius: "10px",
                  color: "#ffffff",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="covid" name="COVID-19 Bivalent" stackId="a" fill={isDark ? "#34D399" : "#10B981"} />
              <Bar dataKey="infant" name="Infant Routine (EPI)" stackId="a" fill={isDark ? "#38BDF8" : "#0284C7"} />
              <Bar dataKey="flu" name="Influenza" stackId="a" fill={isDark ? "#FBBF24" : "#F59E0B"} />
              <Bar dataKey="hpv" name="HPV Cervarix" stackId="a" radius={[6, 6, 0, 0]} fill={isDark ? "#A78BFA" : "#8B5CF6"} />
              <Bar dataKey="target" name="Monthly Target" fill={isDark ? "#334155" : "#94A3B8"} radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* ── 2 Columns: Upcoming Schedules & Medical Supplies ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upcoming Clinical Appointments */}
        <div className="bg-white dark:bg-[#0C1D2B] rounded-xl border border-slate-200/90 dark:border-[#193347] p-6 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-[#163347]">
            <div className="flex items-center gap-2">
              <Calendar size={17} className="text-[#0B7065] dark:text-teal-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upcoming Clinical Schedules</h3>
            </div>
            <button
              onClick={() => setModule("schedule")}
              className="text-xs font-bold text-[#0B7065] dark:text-teal-300 hover:underline flex items-center gap-1"
            >
              <span>View All ({schedules.length})</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="space-y-3">
            {schedules.filter(s => s.status === "Upcoming").slice(0, 4).map(s => {
              const initials = (s.residentName || "R")
                .split(" ")
                .map(n => n[0])
                .slice(0, 2)
                .join("");

              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-[#091B27]/80 border border-slate-200/70 dark:border-[#163347] hover:bg-slate-50 dark:hover:bg-[#11293C] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B7065]/15 to-[#0B7065]/5 dark:from-teal-500/20 dark:to-teal-500/5 border border-teal-200 dark:border-teal-700/50 flex items-center justify-center text-xs font-extrabold text-[#0B7065] dark:text-teal-300 shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {s.residentName || "Resident"}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-[#0B7065] dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-1.5 py-0.2 rounded truncate">
                          {s.appointmentType} {s.details ? `— ${s.details}` : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {new Date(s.scheduledDate).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-[#8FAEC5] font-medium">{s.purok}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Medical Supplies & Cold Chain Stocks */}
        <div className="bg-white dark:bg-[#0C1D2B] rounded-xl border border-slate-200/90 dark:border-[#193347] p-6 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-[#163347]">
            <div className="flex items-center gap-2">
              <Package size={17} className="text-[#0B7065] dark:text-teal-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Medical Supplies & Cold-Chain Stocks</h3>
            </div>
            <button
              onClick={() => setModule("inventory")}
              className="text-xs font-bold text-[#0B7065] dark:text-teal-300 hover:underline flex items-center gap-1"
            >
              <span>Manage ({supplies.length})</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="space-y-3.5">
            {supplies.slice(0, 5).map(v => {
              const pct = Math.min(100, Math.round((v.quantity / (Math.max(1, v.minStock) * 3)) * 100));
              const isCritical = v.quantity < v.minStock;
              const isLow = v.quantity <= v.minStock * 1.2;

              return (
                <div key={v.id} className="p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-[#091B27] transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{v.name}</span>
                      <span className="text-[9px] font-semibold bg-slate-100 dark:bg-[#091B27] text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-[#163347]">
                        {v.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCritical
                            ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                            : isLow
                            ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                            : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        }`}
                      >
                        {isCritical ? "Critical" : isLow ? "Low Stock" : "Optimal"}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {v.quantity} <span className="text-[10px] text-slate-500 dark:text-[#8FAEC5] font-normal">units</span>
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#091B27] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCritical
                          ? "bg-rose-500"
                          : isLow
                          ? "bg-amber-400"
                          : "bg-gradient-to-r from-[#0B7065] to-teal-500 dark:from-teal-400 dark:to-emerald-400"
                      }`}
                      style={{ width: `${Math.max(6, pct)}%` }}
                    />
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
