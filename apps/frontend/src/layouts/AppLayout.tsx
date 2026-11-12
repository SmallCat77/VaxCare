import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Users, Syringe, Calendar, Package, Bell, Home,
  GitCommitHorizontal, HeartPulse, Star, Award, Layers, ShieldCheck,
  BarChart2, LogOut, Menu, AlertTriangle, RefreshCw, Globe, MessageSquare
} from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import { AuthUser, Module, UserRole } from "../lib/types";

export const NAV_ITEMS: { id: Module; path: string; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", path: "/dashboard", label: "Dashboard", icon: <Home size={15} /> },
  { id: "residents", path: "/residents", label: "Residents", icon: <Users size={15} /> },
  { id: "vaccinations", path: "/vaccinations", label: "Vaccinations", icon: <Syringe size={15} /> },
  { id: "schedule", path: "/schedule", label: "Schedule", icon: <Calendar size={15} /> },
  { id: "inventory", path: "/inventory", label: "Inventory", icon: <Package size={15} /> },
  { id: "reports", path: "/reports", label: "Reports", icon: <BarChart2 size={15} /> },
  { id: "messaging", path: "/messaging", label: "SMS Messaging", icon: <MessageSquare size={15} /> },
  { id: "portal", path: "/portal", label: "Resident Portal", icon: <ShieldCheck size={15} /> },
  { id: "notifications", path: "/notifications", label: "Notifications", icon: <Bell size={15} /> },
  { id: "timeline", path: "/timeline", label: "Health Timeline", icon: <GitCommitHorizontal size={15} /> },
  { id: "family", path: "/family", label: "Family Dashboard", icon: <HeartPulse size={15} /> },
  { id: "priority", path: "/priority", label: "Priority Patients", icon: <Star size={15} /> },
  { id: "certificate", path: "/certificate", label: "Vax Certificate", icon: <Award size={15} /> },
  { id: "batches", path: "/batches", label: "Batch Tracking", icon: <Layers size={15} /> },
  { id: "users", path: "/users", label: "Staff Management", icon: <ShieldCheck size={15} /> },
];

export const ROLE_ACCESS: Record<UserRole, Module[]> = {
  admin: ["dashboard", "residents", "vaccinations", "schedule", "inventory", "reports", "messaging", "portal", "notifications", "timeline", "family", "priority", "certificate", "batches", "users"],
  worker: ["dashboard", "residents", "vaccinations", "schedule", "inventory", "reports", "messaging", "portal", "notifications", "timeline", "family", "priority", "certificate", "batches"],
  resident: ["portal"],
};

export const MODULE_TITLE: Record<Module, string> = {
  dashboard: "Dashboard", residents: "Residents", vaccinations: "Vaccinations",
  schedule: "Schedule", inventory: "Inventory", reports: "Reports",
  messaging: "SMS & Resident Messaging Center",
  portal: "Resident Portal", notifications: "Notifications",
  timeline: "Health History Timeline", family: "Family Health Dashboard",
  priority: "Priority Patient Identification", certificate: "Digital Vaccination Certificate",
  batches: "Vaccine Batch Tracking", users: "Staff Management"
};

export const ROLE_BADGE: Record<UserRole, string> = {
  admin: "bg-primary/20 text-primary",
  worker: "bg-blue-100 text-blue-700",
  resident: "bg-teal-100 text-teal-700",
};

interface AppLayoutProps {
  user: AuthUser;
  unreadCount: number;
  dataLoading: boolean;
  dataError: string;
  onLogout: () => void;
  onRetryLoad: () => void;
}

export function AppLayout({ user, unreadCount, dataLoading, dataError, onLogout, onRetryLoad }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const allowedModules = ROLE_ACCESS[user.role];
  const visibleNav = NAV_ITEMS.filter(item => allowedModules.includes(item.id));

  // Try to find the title based on the current path, fallback to empty
  const currentNav = NAV_ITEMS.find(item => item.path === location.pathname);
  const currentTitle = currentNav ? MODULE_TITLE[currentNav.id] : "VaxCare";

  const mgmtItems = visibleNav.filter(i => ["dashboard", "residents", "vaccinations", "schedule", "inventory", "reports"].includes(i.id));
  const serviceItems = visibleNav.filter(i => ["messaging", "portal", "notifications"].includes(i.id));
  const advancedItems = visibleNav.filter(i => ["timeline", "family", "priority", "certificate", "batches"].includes(i.id));

  return (
    <div className="flex h-screen bg-[#F4F7FA] overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />}

      {/* Hospital Clinical Sidebar */}
      <aside className={`fixed lg:relative z-30 h-full flex flex-col bg-[#0A1E2F] border-r border-[#163247] transition-transform duration-200 shadow-xl lg:shadow-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`} style={{ width: 235 }}>
        {/* Clinic Brand */}
        <div className="p-4 border-b border-[#163247]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0B7065] to-[#14B8A6] flex items-center justify-center shadow-md shadow-teal-950/40 text-white shrink-0">
              <Syringe size={17} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-extrabold text-white leading-tight tracking-tight">VaxCare</p>
                <span className="text-[9px] font-mono font-bold bg-[#112C40] text-[#38BDF8] border border-[#164E63] px-1.5 py-0.5 rounded tracking-wide">EHR</span>
              </div>
              <p className="text-[10px] text-[#7EA8C0] font-medium leading-tight truncate mt-0.5">Barangay Health Center</p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {mgmtItems.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-[#628A9F] uppercase tracking-wider px-3 py-1.5 flex items-center gap-1.5">
                Clinical Management
              </p>
              <div className="space-y-0.5">
                {mgmtItems.map(item => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-[#0B7065] to-[#0E8376] text-white font-semibold shadow-sm shadow-teal-950/40 relative before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-[#34D399] before:rounded-r"
                          : "text-[#8FAFC5] hover:text-white hover:bg-[#122A3C]"
                      }`
                    }
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {serviceItems.length > 0 && (
            <div className="pt-2">
              <p className="text-[10px] font-bold text-[#628A9F] uppercase tracking-wider px-3 py-1.5">
                Patient Services
              </p>
              <div className="space-y-0.5">
                {serviceItems.map(item => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-[#0B7065] to-[#0E8376] text-white font-semibold shadow-sm shadow-teal-950/40 relative before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-[#34D399] before:rounded-r"
                          : "text-[#8FAFC5] hover:text-white hover:bg-[#122A3C]"
                      }`
                    }
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                    {item.id === "notifications" && unreadCount > 0 && (
                      <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {advancedItems.length > 0 && (
            <div className="pt-2">
              <p className="text-[10px] font-bold text-[#628A9F] uppercase tracking-wider px-3 py-1.5">
                Registry & Analytics
              </p>
              <div className="space-y-0.5">
                {advancedItems.map(item => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-[#0B7065] to-[#0E8376] text-white font-semibold shadow-sm shadow-teal-950/40 relative before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-[#34D399] before:rounded-r"
                          : "text-[#8FAFC5] hover:text-white hover:bg-[#122A3C]"
                      }`
                    }
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Staff User Footer */}
        <div className="p-3 border-t border-[#163247] bg-[#071724]">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0B7065] to-[#14B8A6] flex items-center justify-center text-xs font-bold text-white shrink-0 ring-2 ring-teal-500/30">
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.displayName}</p>
              <p className="text-[10px] text-[#7EA8C0] truncate font-medium">{user.title}</p>
            </div>
            <button
              onClick={onLogout}
              title="Sign out of hospital terminal"
              className="p-1.5 text-[#7EA8C0] hover:text-rose-400 hover:bg-rose-500/10 transition-colors rounded-md shrink-0"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Clinical Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Hospital Header Bar */}
        <header className="bg-white dark:bg-[#0A1E2F] border-b border-slate-200/90 dark:border-[#163247] px-6 py-3 flex items-center justify-between shrink-0 shadow-2xs transition-colors">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">{currentTitle}</h1>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" /> Station Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#8FAEC5] hidden sm:block font-medium">
                Barangay Health Center A — {new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {dataLoading && <RefreshCw size={14} className="text-teal-600 animate-spin" />}
            
            {/* Theme Toggle Button */}
            <ThemeToggle />

            <NavLink
              to="/"
              title="Public Community Portal"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-[#1B364A] hover:bg-slate-50 dark:hover:bg-[#122A3C] rounded-lg transition-colors font-medium shadow-2xs"
            >
              <Globe size={13} className="text-teal-600 dark:text-teal-400" /> <span className="hidden md:inline">Public Website</span>
            </NavLink>

            {user.role !== "resident" && (
              <NavLink
                to="/notifications"
                className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-[#122A3C]"
                title="Notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#0A1E2F]" />}
              </NavLink>
            )}

            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border border-teal-200/80 dark:border-teal-400/30 ${ROLE_BADGE[user.role]}`}>
              <ShieldCheck size={12} />
              {user.role === "admin" ? "Health Officer (Admin)" : user.role === "worker" ? "Registered Nurse / Staff" : "Resident"}
            </div>

            <button
              onClick={onLogout}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors font-medium border border-transparent hover:border-rose-200 dark:hover:border-rose-900/40"
            >
              <LogOut size={12} /> Sign Out
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-[#F4F7FA] dark:bg-[#07131D] transition-colors">
          {dataError && (
            <div className="mb-5 flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-xs">
              <AlertTriangle size={18} className="text-rose-600 shrink-0" />
              <p className="text-xs font-semibold text-rose-900 flex-1">{dataError}</p>
              <button onClick={onRetryLoad} className="text-xs font-bold text-rose-800 hover:underline shrink-0">
                Retry Connection
              </button>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
