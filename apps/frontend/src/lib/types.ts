export type UserRole = "admin" | "worker" | "resident";

export interface AuthUser {
  id?: number;
  username: string;
  displayName: string;
  role: UserRole;
  residentId?: string;
  avatar: string;
  title: string;
}

export interface User {
  id: number;
  username: string;
  displayName: string;
  role: "admin" | "worker";
  avatar: string;
  title: string;
  createdAt: string;
}

export type Module = "dashboard" | "residents" | "vaccinations" | "schedule" | "inventory" | "reports" | "portal" | "notifications" | "timeline" | "family" | "priority" | "certificate" | "batches" | "users";

export interface Resident {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female";
  birthdate: string;
  address: string;
  phone: string;
  purok: string;
  status: "Fully Vaccinated" | "Partially Vaccinated" | "Unvaccinated";
  vaccinations: VaccinationRecord[];
  nextDue: string | null;
}

export interface VaccinationRecord {
  id: string;
  vaccine: string;
  dose: string;
  date: string;
  worker: string;
  batchNo: string;
  site: string;
}

export interface MedicalSupply {
  id: string;
  name: string;
  category: "Medicine" | "Supply" | "Vaccine" | string;
  quantity: number;
  minStock: number;
  expiryDate: string;
  manufacturer: string;
  lastRestocked: string;
}

export interface ScheduleItem {
  id: string;
  residentId: string;
  residentName?: string;
  vaccine?: string; // keeping as optional for legacy data
  dose?: string; // keeping as optional for legacy data
  appointmentType: string;
  details: string;
  scheduledDate: string;
  status: "Upcoming" | "Completed" | "Missed" | "Rescheduled";
  worker: string;
  purok: string;
}

export interface Notification {
  id: string;
  type: "alert" | "info" | "warning" | "success";
  title: string;
  message: string;
  time: string;
  read: boolean;
}
