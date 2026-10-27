import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Users, Syringe, Calendar, Package, Bell, Home,
  GitCommitHorizontal, HeartPulse, Star, Award, Layers, ShieldCheck,
  BarChart2, LogOut, Menu, AlertTriangle, RefreshCw
} from "lucide-react";
import { AuthUser, Module, UserRole } from "../lib/types";

export const NAV_ITEMS: { id: Module; path: string; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", path: "/dashboard", label: "Dashboard", icon: <Home size={15} /> },
  { id: "residents", path: "/residents", label: "Residents", icon: <Users size={15} /> },
  { id: "vaccinations", path: "/vaccinations", label: "Vaccinations", icon: <Syringe size={15} /> },
  { id: "schedule", path: "/schedule", label: "Schedule", icon: <Calendar size={15} /> },
  { id: "inventory", path: "/inventory", label: "Inventory", icon: <Package size={15} /> },
  { id: "reports", path: "/reports", label: "Reports", icon: <BarChart2 size={15} /> },
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
  admin: ["dashboard", "residents", "vaccinations", "schedule", "inventory", "reports", "portal", "notifications", "timeline", "family", "priority", "certificate", "batches", "users"],
  worker: ["dashboard", "residents", "vaccinations", "schedule", "inventory", "reports", "portal", "notifications", "timeline", "family", "priority", "certificate", "batches"],
  resident: ["portal"],
};

export const MODULE_TITLE: Record<Module, string> = {
  dashboard: "Dashboard", residents: "Residents", vaccinations: "Vaccinations",
  schedule: "Schedule", inventory: "Inventory", reports: "Reports",
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
  const serviceItems = visibleNav.filter(i => ["portal", "notifications"].includes(i.id));
  const advancedItems = visibleNav.filter(i => ["timeline", "family", "priority", "certificate", "batches"].includes(i.id));

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:relative z-30 h-full flex flex-col bg-card border-r border-border transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`} style={{ width: 220 }}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Syringe size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground leading-tight">VaxCare</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Brgy. Health Center</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {mgmtItems.length > 0 && <>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">Management</p>
            {mgmtItems.map(item => (
              <NavLink key={item.id} to={item.path} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}>
                {item.icon} {item.label}
              </NavLink>
            ))}
          </>}
          {serviceItems.length > 0 && <>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mt-2">Services</p>
            {serviceItems.map(item => (
              <NavLink key={item.id} to={item.path} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}>
                {item.icon} {item.label}
                {item.id === "notifications" && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{unreadCount}</span>
                )}
              </NavLink>
            ))}
          </>}
          {advancedItems.length > 0 && <>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mt-2">Advanced</p>
            {advancedItems.map(item => (
              <NavLink key={item.id} to={item.path} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}>
                {item.icon} {item.label}
              </NavLink>
            ))}
          </>}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">{user.avatar}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{user.displayName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.title}</p>
            </div>
            <button onClick={onLogout} title="Sign out" className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors rounded-md hover:bg-red-50 shrink-0">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-card border-b border-border px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(true)}><Menu size={18} /></button>
            <div>
              <h1 className="text-sm font-bold text-foreground">{currentTitle}</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Barangay Health Center A — {new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {dataLoading && <RefreshCw size={14} className="text-muted-foreground animate-spin" />}
            {user.role !== "resident" && (
              <NavLink to="/notifications" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                <Bell size={16} />
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />}
              </NavLink>
            )}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${ROLE_BADGE[user.role]}`}>
              {user.role === "admin" ? "Admin" : user.role === "worker" ? "Staff" : "Resident"}
            </div>
            <button onClick={onLogout} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium">
              <LogOut size={12} /> Sign Out
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5">
          {dataError && (
            <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-3.5">
              <AlertTriangle size={16} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700 flex-1">{dataError}</p>
              <button onClick={onRetryLoad} className="text-xs font-semibold text-red-700 hover:underline shrink-0">Retry</button>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
