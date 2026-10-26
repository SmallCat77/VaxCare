// ─── VaxCare API client ─────────────────────────────────────────────────────
// Talks to the Express backend (apps/backend). Handles auth token storage,
// request/response plumbing, and mapping the API's snake_case rows onto the
// camelCase shapes the UI components expect.

const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000/api";

const TOKEN_KEY = "vaxcare_token";

export class ApiClientError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // No-content responses
  if (res.status === 204) return undefined as T;

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    // non-JSON response body; leave as null
  }

  if (!res.ok) {
    const message = body?.error || res.statusText || "Request failed";
    throw new ApiClientError(res.status, message);
  }

  return body as T;
}

// ─── Row → UI shape normalizers ─────────────────────────────────────────────
// The Postgres-backed API returns snake_case columns; the UI (ported from the
// original mock-data prototype) expects camelCase. These functions bridge that.

export function normalizeVaccination(v: any) {
  return {
    id: String(v.id),
    vaccine: v.vaccine,
    dose: v.dose,
    date: typeof v.date === "string" ? v.date.slice(0, 10) : v.date,
    worker: v.worker,
    batchNo: v.batch_no ?? v.batchNo ?? "",
    site: v.site,
  };
}

export function normalizeResident(r: any) {
  return {
    id: r.id,
    name: r.name,
    age: r.age,
    gender: r.gender,
    birthdate: typeof r.birthdate === "string" ? r.birthdate.slice(0, 10) : r.birthdate,
    address: r.address ?? "",
    phone: r.phone ?? "",
    purok: r.purok ?? "",
    status: r.status,
    nextDue: r.next_due ? String(r.next_due).slice(0, 10) : (r.nextDue ?? null),
    vaccinations: Array.isArray(r.vaccinations) ? r.vaccinations.map(normalizeVaccination) : [],
  };
}

export function normalizeStock(s: any) {
  return {
    id: s.id,
    name: s.name,
    category: s.category ?? "",
    quantity: s.quantity,
    minStock: s.min_stock ?? s.minStock,
    expiryDate: s.expiry_date ? String(s.expiry_date).slice(0, 10) : (s.expiryDate ?? ""),
    manufacturer: s.manufacturer ?? "",
    lastRestocked: s.last_restocked ? String(s.last_restocked).slice(0, 10) : (s.lastRestocked ?? ""),
  };
}

export function normalizeSchedule(s: any) {
  return {
    id: s.id,
    residentId: s.resident_id ?? s.residentId,
    residentName: s.resident_name ?? s.residentName ?? "",
    vaccine: s.vaccine ?? "",
    dose: s.dose ?? "",
    appointmentType: s.appointment_type ?? s.appointmentType ?? "",
    details: s.details ?? "",
    scheduledDate: s.scheduled_date ? String(s.scheduled_date).slice(0, 10) : s.scheduledDate,
    status: s.status,
    worker: s.worker ?? "",
    purok: s.purok ?? "",
  };
}

function timeAgo(dateStr: string): string {
  const then = new Date(dateStr).getTime();
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return "just now";
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export function normalizeNotification(n: any) {
  return {
    id: String(n.id),
    type: n.type,
    title: n.title,
    message: n.message,
    time: n.created_at ? timeAgo(n.created_at) : (n.time ?? ""),
    read: !!n.read,
  };
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  staffLogin: (username: string, password: string) =>
    request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  residentLogin: (residentId: string, birthdate: string) =>
    request<{ token: string; user: any }>("/auth/resident-login", {
      method: "POST",
      body: JSON.stringify({ residentId, birthdate }),
    }),
};

// ─── Residents ───────────────────────────────────────────────────────────────
export const residentsApi = {
  list: async () => {
    const rows = await request<any[]>("/residents");
    return rows.map(normalizeResident);
  },
  get: async (id: string) => {
    const row = await request<any>(`/residents/${id}`);
    return normalizeResident(row);
  },
  create: async (data: {
    id: string; name: string; age: number; gender: string; birthdate: string;
    address: string; phone: string; purok: string;
  }) => {
    const row = await request<any>("/residents", { method: "POST", body: JSON.stringify(data) });
    return normalizeResident(row);
  },
  update: async (id: string, data: Partial<{ name: string; age: number; gender: string; address: string; phone: string; purok: string }>) => {
    const row = await request<any>(`/residents/${id}`, { method: "PUT", body: JSON.stringify(data) });
    return normalizeResident(row);
  },
};

// ─── Vaccinations ────────────────────────────────────────────────────────────
export const vaccinationsApi = {
  listForResident: async (residentId: string) => {
    const rows = await request<any[]>(`/residents/${residentId}/vaccinations`);
    return rows.map(normalizeVaccination);
  },
  add: async (residentId: string, data: { vaccine: string; dose: string; date: string; worker: string; batchNo: string; site: string }) => {
    const row = await request<any>(`/residents/${residentId}/vaccinations`, {
      method: "POST",
      body: JSON.stringify({ vaccine: data.vaccine, dose: data.dose, date: data.date, worker: data.worker, batchNo: data.batchNo, site: data.site }),
    });
    return normalizeVaccination(row);
  },
};

// ─── Stock (Medical Supplies) ───────────────────────────────────────────────
export const suppliesApi = {
  list: async () => {
    const rows = await request<any[]>("/stock");
    return rows.map(normalizeStock);
  },
  update: async (id: string, data: Partial<{ quantity: number; minStock: number; expiryDate: string; manufacturer: string; lastRestocked: string }>) => {
    const row = await request<any>(`/stock/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        quantity: data.quantity, minStock: data.minStock, expiryDate: data.expiryDate,
        manufacturer: data.manufacturer, lastRestocked: data.lastRestocked,
      }),
    });
    return normalizeStock(row);
  },
};

// ─── Schedules ───────────────────────────────────────────────────────────────
export const schedulesApi = {
  list: async () => {
    const rows = await request<any[]>("/schedules");
    return rows.map(normalizeSchedule);
  },
  create: async (data: { id: string; residentId: string; appointmentType: string; details: string; scheduledDate: string; worker: string; purok: string }) => {
    const row = await request<any>("/schedules", { method: "POST", body: JSON.stringify(data) });
    return normalizeSchedule(row);
  },
  updateStatus: async (id: string, status: "Upcoming" | "Completed" | "Missed" | "Rescheduled") => {
    const row = await request<any>(`/schedules/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
    return normalizeSchedule(row);
  },
};

// ─── Notifications ───────────────────────────────────────────────────────────
export const notificationsApi = {
  list: async () => {
    const rows = await request<any[]>("/notifications");
    return rows.map(normalizeNotification);
  },
  markRead: async (id: string) => {
    const row = await request<any>(`/notifications/${id}/read`, { method: "PUT" });
    return normalizeNotification(row);
  },
};

// ─── Analytics ─────────────────────────────────────────────────────────────
export const analyticsApi = {
  getMonthlyVaccinations: async () => {
    return await request<any[]>("/analytics/monthly-vaccinations");
  },
};

export const usersApi = {
  list: async () => request<any[]>("/users"),
  create: async (data: any) => request<any>("/users", { method: "POST", body: JSON.stringify(data) }),
  update: async (id: number | string, data: any) => request<any>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: async (id: number | string) => request<any>(`/users/${id}`, { method: "DELETE" }),
  updatePassword: async (id: number | string, newPassword: string) => request<any>(`/users/${id}/password`, { method: "PUT", body: JSON.stringify({ newPassword }) }),
};
