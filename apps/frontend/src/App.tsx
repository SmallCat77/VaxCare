import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {
  authApi, residentsApi, vaccinationsApi, suppliesApi, schedulesApi, notificationsApi, analyticsApi, usersApi,
  getToken, clearToken, ApiClientError,
} from "./lib/api";

const AUTH_USER_KEY = "vaxcare_user";

import { LoginScreen } from "./pages/LoginScreen";

import {
  AuthUser, Resident, MedicalSupply, ScheduleItem, Notification, User
} from "./lib/types";

import { Dashboard } from "./pages/Dashboard";
import { ResidentsModule } from "./pages/ResidentsModule";
import { VaccinationsModule } from "./pages/VaccinationsModule";
import { ScheduleModule } from "./pages/ScheduleModule";
import { InventoryModule } from "./pages/InventoryModule";
import { ReportsModule } from "./pages/ReportsModule";
import { NotificationsModule } from "./pages/NotificationsModule";
import { ResidentPortal } from "./pages/ResidentPortal";
import { HealthHistoryTimeline } from "./pages/HealthHistoryTimeline";
import { FamilyHealthDashboard } from "./pages/FamilyHealthDashboard";
import { PriorityPatients } from "./pages/PriorityPatients";
import { VaccinationCertificate } from "./pages/VaccinationCertificate";
import { BatchTracking } from "./pages/BatchTracking";
import { UsersModule } from "./pages/UsersModule";
import { AppLayout } from "./layouts/AppLayout";

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      return stored && getToken() ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const [residents, setResidents] = useState<Resident[]>([]);
  const [supplies, setSupplies] = useState<MedicalSupply[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [monthlyVaxData, setMonthlyVaxData] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  const navigate = useNavigate();

  // Load (or reload) everything the current role is allowed to see.
  async function loadData(currentUser: AuthUser) {
    setDataLoading(true);
    setDataError("");
    try {
      if (currentUser.role === "resident" && currentUser.residentId) {
        const [me, scheduleRows, supplyRows] = await Promise.all([
          residentsApi.get(currentUser.residentId),
          schedulesApi.list(),
          suppliesApi.list(),
        ]);
        setResidents([me]);
        setSchedules(scheduleRows);
        setSupplies(supplyRows);
        setNotifications([]);
      } else {
        const residentRows = await residentsApi.list();
        const withVax = await Promise.all(
          residentRows.map(async (r) => ({
            ...r,
            vaccinations: await vaccinationsApi.listForResident(r.id),
          }))
        );
        const [supplyRows, scheduleRows, notificationRows, analyticsRows] = await Promise.all([
          suppliesApi.list(),
          schedulesApi.list(),
          notificationsApi.list(),
          analyticsApi.getMonthlyVaccinations(),
        ]);
        
        let userRows: User[] = [];
        if (currentUser.role === "admin") {
          userRows = await usersApi.list();
        }
        
        setResidents(withVax);
        setSupplies(supplyRows);
        setSchedules(scheduleRows);
        setNotifications(notificationRows);
        setMonthlyVaxData(analyticsRows);
        setUsers(userRows);
      }
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 401) {
        handleLogout();
        return;
      }
      setDataError(err instanceof ApiClientError ? err.message : "Could not load data from the server.");
    } finally {
      setDataLoading(false);
    }
  }

  useEffect(() => {
    if (user) loadData(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.username]);

  // When a resident logs in, send them straight to the portal pre-filled
  function handleLogin(u: AuthUser) {
    setUser(u);
    navigate(u.role === "resident" ? "/portal" : "/dashboard");
  }

  function handleLogout() {
    clearToken();
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
    setResidents([]);
    setSupplies([]);
    setSchedules([]);
    setNotifications([]);
    setUsers([]);
    navigate("/");
  }

  async function handleAddResident(data: { id: string; name: string; age: number; gender: "Male" | "Female"; birthdate: string; address: string; phone: string; purok: string }) {
    const created = await residentsApi.create(data);
    setResidents(prev => [...prev, created]);
  }

  async function handleRecordVaccination(residentId: string, data: { vaccine: string; dose: string; date: string; worker: string; batchNo: string; site: string }) {
    const record = await vaccinationsApi.add(residentId, data);
    const refreshed = await residentsApi.get(residentId);
    setResidents(prev => prev.map(r => (r.id === residentId ? refreshed : r)));
    void record;
  }

  async function handleAddSchedule(data: { id: string; residentId: string; appointmentType: string; details: string; scheduledDate: string; worker: string; purok: string }) {
    const created = await schedulesApi.create(data);
    setSchedules(prev => [...prev, created]);
  }

  async function handleUpdateScheduleStatus(id: string, status: ScheduleItem["status"]) {
    const updated = await schedulesApi.updateStatus(id, status);
    setSchedules(prev => prev.map(s => (s.id === id ? updated : s)));
  }

  async function handleRestock(id: string, addQty: number) {
    const current = supplies.find(s => s.id === id);
    const newQuantity = (current?.quantity ?? 0) + addQty;
    const updated = await suppliesApi.update(id, { quantity: newQuantity, lastRestocked: new Date().toISOString().split("T")[0] });
    setSupplies(prev => prev.map(s => (s.id === id ? updated : s)));
    if (user && user.role !== "resident") {
      try { setNotifications(await notificationsApi.list()); } catch { /* non-fatal */ }
    }
  }

  async function handleMarkNotificationRead(id: string) {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    try {
      await notificationsApi.markRead(id);
    } catch {
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: false } : n)));
    }
  }

  async function handleMarkAllRead() {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await Promise.all(unreadIds.map(id => notificationsApi.markRead(id)));
    } catch {
      setDataError("Some notifications could not be marked as read.");
    }
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginScreen onLogin={handleLogin} />} />
      </Routes>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Routes>
      <Route 
        element={
          <AppLayout 
            user={user} 
            unreadCount={unreadCount} 
            dataLoading={dataLoading} 
            dataError={dataError} 
            onLogout={handleLogout} 
            onRetryLoad={() => loadData(user)} 
          />
        }
      >
        <Route path="/" element={<Navigate to={user.role === "resident" ? "/portal" : "/dashboard"} replace />} />
        
        <Route path="/dashboard" element={
          <Dashboard 
            residents={residents} 
            supplies={supplies} 
            schedules={schedules} 
            notifications={notifications} 
            monthlyVaxData={monthlyVaxData} 
            setModule={(mod) => navigate(`/${mod}`)} 
          />
        } />
        <Route path="/residents" element={<ResidentsModule residents={residents} schedules={schedules} onAddResident={handleAddResident} />} />
        <Route path="/vaccinations" element={<VaccinationsModule residents={residents} supplies={supplies} onRecordVaccination={handleRecordVaccination} />} />
        <Route path="/schedule" element={<ScheduleModule schedules={schedules} residents={residents} onAddSchedule={handleAddSchedule} onUpdateStatus={handleUpdateScheduleStatus} />} />
        <Route path="/inventory" element={<InventoryModule supplies={supplies} onRestock={handleRestock} />} />
        <Route path="/reports" element={<ReportsModule residents={residents} schedules={schedules} supplies={supplies} monthlyVaxData={monthlyVaxData} />} />
        <Route path="/portal" element={<ResidentPortal residents={residents} schedules={schedules} supplies={supplies} defaultResidentId={user.role === "resident" ? user.residentId : undefined} />} />
        <Route path="/notifications" element={<NotificationsModule notifications={notifications} onMarkRead={handleMarkNotificationRead} onMarkAllRead={handleMarkAllRead} />} />
        <Route path="/timeline" element={<HealthHistoryTimeline residents={residents} schedules={schedules} />} />
        <Route path="/family" element={<FamilyHealthDashboard residents={residents} />} />
        <Route path="/priority" element={<PriorityPatients residents={residents} schedules={schedules} />} />
        <Route path="/certificate" element={<VaccinationCertificate residents={residents} />} />
        <Route path="/batches" element={<BatchTracking residents={residents} supplies={supplies} />} />
        {user.role === "admin" && (
          <Route path="/users" element={<UsersModule users={users} onUsersChange={() => { if (user?.role === 'admin') usersApi.list().then(setUsers); }} currentUser={user} />} />
        )}
        
        <Route path="*" element={<Navigate to={user.role === "resident" ? "/portal" : "/dashboard"} replace />} />
      </Route>
    </Routes>
  );
}
