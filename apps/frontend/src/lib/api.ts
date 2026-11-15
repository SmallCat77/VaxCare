// ─── VaxCare API client ─────────────────────────────────────────────────────
// Talks to the Express backend (apps/backend). Handles auth token storage,
// request/response plumbing, and mapping the API's snake_case rows onto the
// camelCase shapes the UI components expect.

const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000/api";

const TOKEN_KEY = "vaxcare_token";
const LOCAL_STORE_KEY = "vaxcare_local_fallback_store_v1";

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

// ─── Client-Side Fallback Store (when backend server is offline/unreachable) ──
interface FallbackStore {
  users: Array<{
    id: number;
    username: string;
    password: string;
    display_name: string;
    role: "admin" | "worker";
    avatar: string;
    title: string;
    created_at: string;
  }>;
  residents: Array<{
    id: string;
    name: string;
    age: number;
    gender: string;
    birthdate: string;
    address: string;
    phone: string;
    purok: string;
    status: string;
    next_due: string | null;
  }>;
  vaccinations: Array<{
    id: number;
    resident_id: string;
    vaccine: string;
    dose: string;
    date: string;
    worker: string;
    batch_no: string;
    site: string;
  }>;
  supplies: Array<{
    id: string;
    name: string;
    category: string;
    quantity: number;
    min_stock: number;
    expiry_date: string;
    manufacturer: string;
    last_restocked: string;
  }>;
  schedules: Array<{
    id: string;
    resident_id: string;
    appointment_type: string;
    details: string;
    scheduled_date: string;
    status: "Upcoming" | "Completed" | "Missed" | "Rescheduled";
    worker: string;
    purok: string;
  }>;
  notifications: Array<{
    id: number;
    type: string;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
  }>;
}

function getDefaultFallbackStore(): FallbackStore {
  const now = new Date().toISOString();
  return {
    users: [
      { id: 1, username: "admin", password: "admin2025", display_name: "Dr. Pedro Cruz", role: "admin", avatar: "P", title: "Barangay Health Officer", created_at: now },
      { id: 2, username: "ana.reyes", password: "health123", display_name: "RN Ana Reyes", role: "worker", avatar: "A", title: "Registered Nurse", created_at: now },
      { id: 3, username: "luz.garcia", password: "health123", display_name: "RN Luz Garcia", role: "worker", avatar: "L", title: "Registered Nurse", created_at: now },
    ],
    residents: [
      { id: "R001", name: "Maria Santos", age: 34, gender: "Female", birthdate: "1990-03-15", address: "123 Sampaguita St.", phone: "09171234567", purok: "Purok 1", status: "Fully Vaccinated", next_due: null },
      { id: "R002", name: "Jose dela Cruz", age: 45, gender: "Male", birthdate: "1979-07-22", address: "45 Rizal Ave.", phone: "09282345678", purok: "Purok 2", status: "Partially Vaccinated", next_due: "2025-07-22" },
      { id: "R003", name: "Ana Reyes", age: 28, gender: "Female", birthdate: "1996-11-08", address: "78 Mabini Blvd.", phone: "09393456789", purok: "Purok 1", status: "Fully Vaccinated", next_due: null },
      { id: "R004", name: "Carlos Mendoza", age: 62, gender: "Male", birthdate: "1962-05-30", address: "9 Aguinaldo Rd.", phone: "09504567890", purok: "Purok 3", status: "Partially Vaccinated", next_due: "2025-08-15" },
      { id: "R005", name: "Luisa Torres", age: 19, gender: "Female", birthdate: "2005-12-01", address: "56 Luna St.", phone: "09615678901", purok: "Purok 2", status: "Unvaccinated", next_due: "2025-07-10" },
      { id: "R006", name: "Ramon Villanueva", age: 55, gender: "Male", birthdate: "1969-08-14", address: "32 Bonifacio St.", phone: "09726789012", purok: "Purok 4", status: "Fully Vaccinated", next_due: null },
      { id: "R007", name: "Gloria Aquino", age: 41, gender: "Female", birthdate: "1983-04-17", address: "11 Magsaysay Blvd.", phone: "09837890123", purok: "Purok 3", status: "Partially Vaccinated", next_due: "2025-07-30" },
      { id: "R008", name: "Ernesto Lim", age: 70, gender: "Male", birthdate: "1954-01-23", address: "88 Quezon Ave.", phone: "09948901234", purok: "Purok 5", status: "Fully Vaccinated", next_due: null },
      { id: "R009", name: "Precy Abad", age: 25, gender: "Female", birthdate: "2000-06-11", address: "22 Pasig Rd.", phone: "09159012345", purok: "Purok 1", status: "Unvaccinated", next_due: "2025-07-15" },
      { id: "R010", name: "Roberto Castillo", age: 38, gender: "Male", birthdate: "1986-09-28", address: "67 Taft Ave.", phone: "09260123456", purok: "Purok 4", status: "Partially Vaccinated", next_due: "2025-08-01" },
    ],
    vaccinations: [
      { id: 1, resident_id: "R001", vaccine: "COVID-19 Bivalent", dose: "Booster", date: "2024-11-10", worker: "RN Ana Reyes", batch_no: "BV-2024-001", site: "Left Arm" },
      { id: 2, resident_id: "R001", vaccine: "Influenza", dose: "Annual", date: "2025-03-05", worker: "RN Ana Reyes", batch_no: "FLU-2025-01", site: "Right Arm" },
      { id: 3, resident_id: "R002", vaccine: "COVID-19 Bivalent", dose: "1st Dose", date: "2025-01-15", worker: "RN Luz Garcia", batch_no: "BV-2025-003", site: "Left Arm" },
      { id: 4, resident_id: "R003", vaccine: "HPV", dose: "1st Dose", date: "2024-09-20", worker: "Dr. Pedro Cruz", batch_no: "HPV-2024-05", site: "Right Arm" },
      { id: 5, resident_id: "R003", vaccine: "HPV", dose: "2nd Dose", date: "2024-12-20", worker: "Dr. Pedro Cruz", batch_no: "HPV-2024-08", site: "Right Arm" },
      { id: 6, resident_id: "R004", vaccine: "Pneumococcal", dose: "1st Dose", date: "2025-02-10", worker: "RN Luz Garcia", batch_no: "PNE-2025-02", site: "Left Arm" },
      { id: 7, resident_id: "R006", vaccine: "COVID-19 Bivalent", dose: "Booster", date: "2024-10-05", worker: "Dr. Pedro Cruz", batch_no: "BV-2024-002", site: "Left Arm" },
      { id: 8, resident_id: "R006", vaccine: "Influenza", dose: "Annual", date: "2025-02-28", worker: "Dr. Pedro Cruz", batch_no: "FLU-2025-02", site: "Right Arm" },
      { id: 9, resident_id: "R007", vaccine: "Hepatitis B", dose: "1st Dose", date: "2025-04-30", worker: "RN Ana Reyes", batch_no: "HB-2025-01", site: "Right Arm" },
      { id: 10, resident_id: "R008", vaccine: "COVID-19 Bivalent", dose: "Booster", date: "2025-01-08", worker: "RN Luz Garcia", batch_no: "BV-2025-001", site: "Left Arm" },
      { id: 11, resident_id: "R008", vaccine: "Pneumococcal", dose: "Annual", date: "2025-03-15", worker: "RN Luz Garcia", batch_no: "PNE-2025-04", site: "Right Arm" },
      { id: 12, resident_id: "R010", vaccine: "COVID-19 Bivalent", dose: "1st Dose", date: "2025-03-20", worker: "Dr. Pedro Cruz", batch_no: "BV-2025-005", site: "Left Arm" },
    ],
    supplies: [
      { id: "VS001", name: "COVID-19 Bivalent", category: "mRNA", quantity: 145, min_stock: 50, expiry_date: "2025-12-31", manufacturer: "Pfizer-BioNTech", last_restocked: "2025-05-10" },
      { id: "VS002", name: "Influenza (Quadrivalent)", category: "Inactivated", quantity: 38, min_stock: 40, expiry_date: "2025-10-15", manufacturer: "Sanofi Pasteur", last_restocked: "2025-04-20" },
      { id: "VS003", name: "HPV (Cervarix)", category: "VLP", quantity: 62, min_stock: 30, expiry_date: "2026-03-20", manufacturer: "GlaxoSmithKline", last_restocked: "2025-03-05" },
      { id: "VS004", name: "Hepatitis B", category: "Recombinant", quantity: 15, min_stock: 30, expiry_date: "2025-09-30", manufacturer: "Merck & Co.", last_restocked: "2025-02-15" },
      { id: "VS005", name: "Pneumococcal (PCV13)", category: "Conjugate", quantity: 89, min_stock: 25, expiry_date: "2026-01-10", manufacturer: "Pfizer", last_restocked: "2025-05-01" },
      { id: "VS006", name: "Measles-Mumps-Rubella", category: "Live Attenuated", quantity: 74, min_stock: 35, expiry_date: "2025-11-25", manufacturer: "Serum Institute", last_restocked: "2025-04-12" },
      { id: "VS007", name: "Varicella", category: "Live Attenuated", quantity: 22, min_stock: 20, expiry_date: "2025-08-14", manufacturer: "Merck & Co.", last_restocked: "2025-01-30" },
    ],
    schedules: [
      { id: "S001", resident_id: "R002", appointment_type: "Vaccination", details: "COVID-19 Bivalent - 2nd Dose", scheduled_date: "2025-07-22", status: "Upcoming", worker: "RN Ana Reyes", purok: "Purok 2" },
      { id: "S002", resident_id: "R005", appointment_type: "Vaccination", details: "COVID-19 Bivalent - 1st Dose", scheduled_date: "2025-07-10", status: "Upcoming", worker: "RN Luz Garcia", purok: "Purok 2" },
      { id: "S003", resident_id: "R009", appointment_type: "Vaccination", details: "HPV - 1st Dose", scheduled_date: "2025-07-15", status: "Upcoming", worker: "Dr. Pedro Cruz", purok: "Purok 1" },
      { id: "S004", resident_id: "R004", appointment_type: "Vaccination", details: "Pneumococcal - 2nd Dose", scheduled_date: "2025-08-15", status: "Upcoming", worker: "RN Ana Reyes", purok: "Purok 3" },
      { id: "S005", resident_id: "R010", appointment_type: "Vaccination", details: "COVID-19 Bivalent - 2nd Dose", scheduled_date: "2025-08-01", status: "Upcoming", worker: "Dr. Pedro Cruz", purok: "Purok 4" },
      { id: "S006", resident_id: "R007", appointment_type: "Vaccination", details: "Hepatitis B - 2nd Dose", scheduled_date: "2025-07-30", status: "Upcoming", worker: "RN Ana Reyes", purok: "Purok 3" },
      { id: "S007", resident_id: "R001", appointment_type: "Vaccination", details: "Influenza - Annual", scheduled_date: "2025-06-10", status: "Missed", worker: "RN Luz Garcia", purok: "Purok 1" },
      { id: "S008", resident_id: "R006", appointment_type: "Vaccination", details: "Influenza - Annual", scheduled_date: "2025-06-05", status: "Completed", worker: "Dr. Pedro Cruz", purok: "Purok 4" },
    ],
    notifications: [
      { id: 1, type: "alert", title: "Critical Stock Level", message: "Hepatitis B vaccine has fallen below minimum stock threshold (15 remaining, minimum 30).", read: false, created_at: now },
      { id: 2, type: "warning", title: "Low Inventory Warning", message: "Influenza (Quadrivalent) stock is below minimum (38 remaining, minimum 40).", read: false, created_at: now },
      { id: 3, type: "warning", title: "Missed Vaccination", message: "Maria Santos (R001) missed her scheduled Influenza vaccination on June 10, 2025.", read: false, created_at: now },
      { id: 4, type: "info", title: "Upcoming Schedule", message: "5 residents have vaccinations scheduled in the next 7 days.", read: true, created_at: now },
      { id: 5, type: "warning", title: "Near-Expiry Vaccine", message: "Varicella vaccine lot expires on August 14, 2025. Prioritize usage.", read: true, created_at: now },
      { id: 6, type: "success", title: "Stock Replenished", message: "COVID-19 Bivalent vaccines restocked: 145 doses available.", read: true, created_at: now },
    ],
  };
}

function loadFallbackStore(): FallbackStore {
  try {
    const raw = localStorage.getItem(LOCAL_STORE_KEY);
    if (raw) {
      return JSON.parse(raw) as FallbackStore;
    }
  } catch {
    // ignore storage errors
  }
  const initial = getDefaultFallbackStore();
  saveFallbackStore(initial);
  return initial;
}

function saveFallbackStore(store: FallbackStore): void {
  try {
    localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(store));
  } catch {
    // ignore storage errors
  }
}

function handleLocalFallbackRequest<T>(path: string, options: RequestInit = {}): T {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? JSON.parse(String(options.body)) : {};
  const store = loadFallbackStore();

  // 1. Staff Login: POST /auth/login
  if (path === "/auth/login" && method === "POST") {
    const { username, password } = body;
    if (!username || !password) {
      throw new ApiClientError(400, "username and password are required");
    }
    const u = store.users.find(
      (user) => user.username.toLowerCase() === String(username).toLowerCase() && user.password === password
    );
    if (!u) {
      throw new ApiClientError(401, "Invalid username or password");
    }
    return {
      token: `local-jwt-${u.id}-${Date.now()}`,
      user: {
        username: u.username,
        displayName: u.display_name,
        role: u.role,
        avatar: u.avatar,
        title: u.title,
      },
    } as unknown as T;
  }

  // 2. Resident Login: POST /auth/resident-login
  if (path === "/auth/resident-login" && method === "POST") {
    const { residentId, birthdate } = body;
    if (!residentId || !birthdate) {
      throw new ApiClientError(400, "residentId and birthdate are required");
    }
    const r = store.residents.find(
      (res) => res.id.toLowerCase() === String(residentId).toLowerCase() && res.birthdate.slice(0, 10) === String(birthdate).slice(0, 10)
    );
    if (!r) {
      throw new ApiClientError(401, "Resident ID or birthdate not found");
    }
    return {
      token: `local-jwt-${r.id}-${Date.now()}`,
      user: {
        username: r.id,
        displayName: r.name,
        role: "resident",
        residentId: r.id,
        avatar: r.name.charAt(0),
        title: "Resident",
      },
    } as unknown as T;
  }

  // 3. Residents: /residents & /residents/:id & /residents/:id/vaccinations
  const vaxMatch = path.match(/^\/residents\/([^/]+)\/vaccinations$/);
  if (vaxMatch) {
    const residentId = decodeURIComponent(vaxMatch[1]);
    if (method === "GET") {
      return store.vaccinations.filter((v) => v.resident_id.toLowerCase() === residentId.toLowerCase()) as unknown as T;
    }
    if (method === "POST") {
      const nextId = store.vaccinations.reduce((max, v) => Math.max(max, v.id), 0) + 1;
      const newVax = {
        id: nextId,
        resident_id: residentId,
        vaccine: body.vaccine,
        dose: body.dose,
        date: body.date,
        worker: body.worker,
        batch_no: body.batchNo || "",
        site: body.site || "",
      };
      store.vaccinations.push(newVax);
      const count = store.vaccinations.filter((v) => v.resident_id.toLowerCase() === residentId.toLowerCase()).length;
      const res = store.residents.find((r) => r.id.toLowerCase() === residentId.toLowerCase());
      if (res) {
        res.status = count === 0 ? "Unvaccinated" : count === 1 ? "Partially Vaccinated" : "Fully Vaccinated";
      }
      saveFallbackStore(store);
      return newVax as unknown as T;
    }
  }

  const residentMatch = path.match(/^\/residents\/([^/]+)$/);
  if (residentMatch) {
    const residentId = decodeURIComponent(residentMatch[1]);
    const res = store.residents.find((r) => r.id.toLowerCase() === residentId.toLowerCase());
    if (!res) throw new ApiClientError(404, "Resident not found");
    if (method === "GET") {
      const vaccinations = store.vaccinations.filter((v) => v.resident_id.toLowerCase() === residentId.toLowerCase());
      return { ...res, vaccinations } as unknown as T;
    }
    if (method === "PUT") {
      Object.assign(res, {
        name: body.name ?? res.name,
        age: body.age ?? res.age,
        gender: body.gender ?? res.gender,
        address: body.address ?? res.address,
        phone: body.phone ?? res.phone,
        purok: body.purok ?? res.purok,
      });
      saveFallbackStore(store);
      return res as unknown as T;
    }
  }

  if (path === "/residents") {
    if (method === "GET") {
      return store.residents as unknown as T;
    }
    if (method === "POST") {
      if (!body.id || !body.name || !body.birthdate) {
        throw new ApiClientError(400, "id, name, and birthdate are required");
      }
      const newRes = {
        id: body.id,
        name: body.name,
        age: Number(body.age) || 0,
        gender: body.gender || "Female",
        birthdate: body.birthdate,
        address: body.address || "",
        phone: body.phone || "",
        purok: body.purok || "Purok 1",
        status: "Unvaccinated",
        next_due: null,
      };
      store.residents.push(newRes);
      saveFallbackStore(store);
      return newRes as unknown as T;
    }
  }

  // 4. Stock: /stock & /stock/:id
  const stockMatch = path.match(/^\/stock\/([^/]+)$/);
  if (stockMatch && method === "PUT") {
    const id = decodeURIComponent(stockMatch[1]);
    const item = store.supplies.find((s) => s.id === id);
    if (!item) throw new ApiClientError(404, "Stock item not found");
    if (body.quantity !== undefined) item.quantity = Number(body.quantity);
    if (body.minStock !== undefined) item.min_stock = Number(body.minStock);
    if (body.expiryDate !== undefined) item.expiry_date = body.expiryDate;
    if (body.manufacturer !== undefined) item.manufacturer = body.manufacturer;
    if (body.lastRestocked !== undefined) item.last_restocked = body.lastRestocked;
    saveFallbackStore(store);
    return item as unknown as T;
  }
  if (path === "/stock" && method === "GET") {
    return store.supplies as unknown as T;
  }

  // 5. Schedules: /schedules & /schedules/:id
  const schedMatch = path.match(/^\/schedules\/([^/]+)$/);
  if (schedMatch && method === "PUT") {
    const id = decodeURIComponent(schedMatch[1]);
    const item = store.schedules.find((s) => s.id === id);
    if (!item) throw new ApiClientError(404, "Schedule not found");
    item.status = body.status;
    saveFallbackStore(store);
    const res = store.residents.find((r) => r.id === item.resident_id);
    return { ...item, resident_name: res?.name || "Resident" } as unknown as T;
  }
  if (path === "/schedules") {
    if (method === "GET") {
      return store.schedules.map((s) => {
        const res = store.residents.find((r) => r.id === s.resident_id);
        return { ...s, resident_name: res?.name || "Resident" };
      }) as unknown as T;
    }
    if (method === "POST") {
      const newSched = {
        id: body.id,
        resident_id: body.residentId,
        appointment_type: body.appointmentType,
        details: body.details,
        scheduled_date: body.scheduledDate,
        status: "Upcoming" as const,
        worker: body.worker,
        purok: body.purok,
      };
      store.schedules.push(newSched);
      saveFallbackStore(store);
      const res = store.residents.find((r) => r.id === newSched.resident_id);
      return { ...newSched, resident_name: res?.name || "Resident" } as unknown as T;
    }
  }

  // 6. Notifications: /notifications & /notifications/:id/read
  const notifMatch = path.match(/^\/notifications\/([^/]+)\/read$/);
  if (notifMatch && method === "PUT") {
    const id = Number(notifMatch[1]);
    const notif = store.notifications.find((n) => n.id === id);
    if (!notif) throw new ApiClientError(404, "Notification not found");
    notif.read = true;
    saveFallbackStore(store);
    return notif as unknown as T;
  }
  if (path === "/notifications" && method === "GET") {
    return store.notifications as unknown as T;
  }

  // 7. Analytics: /analytics/monthly-vaccinations
  if (path === "/analytics/monthly-vaccinations" && method === "GET") {
    return [
      { month: "Jun", vaccinations: 42, target: 50 },
      { month: "Jul", vaccinations: 48, target: 50 },
      { month: "Aug", vaccinations: 36, target: 50 },
      { month: "Sep", vaccinations: 52, target: 50 },
      { month: "Oct", vaccinations: 45, target: 50 },
      { month: "Nov", vaccinations: 39, target: 50 },
    ] as unknown as T;
  }

  // 8. Users: /users, /users/:id, /users/:id/password
  const userPassMatch = path.match(/^\/users\/([^/]+)\/password$/);
  if (userPassMatch && method === "PUT") {
    const id = Number(userPassMatch[1]);
    const u = store.users.find((user) => user.id === id);
    if (!u) throw new ApiClientError(404, "User not found");
    u.password = body.newPassword;
    saveFallbackStore(store);
    return { message: "Password updated successfully" } as unknown as T;
  }

  const userMatch = path.match(/^\/users\/([^/]+)$/);
  if (userMatch) {
    const id = Number(userMatch[1]);
    if (method === "PUT") {
      const u = store.users.find((user) => user.id === id);
      if (!u) throw new ApiClientError(404, "User not found");
      u.display_name = body.displayName ?? u.display_name;
      u.role = body.role ?? u.role;
      u.title = body.title ?? u.title;
      u.avatar = u.display_name.charAt(0).toUpperCase();
      saveFallbackStore(store);
      return {
        id: u.id,
        username: u.username,
        displayName: u.display_name,
        role: u.role,
        avatar: u.avatar,
        title: u.title,
        createdAt: u.created_at,
      } as unknown as T;
    }
    if (method === "DELETE") {
      const idx = store.users.findIndex((user) => user.id === id);
      if (idx === -1) throw new ApiClientError(404, "User not found");
      store.users.splice(idx, 1);
      saveFallbackStore(store);
      return { message: "User deleted successfully" } as unknown as T;
    }
  }

  if (path === "/users") {
    if (method === "GET") {
      return store.users.map((u) => ({
        id: u.id,
        username: u.username,
        displayName: u.display_name,
        role: u.role,
        avatar: u.avatar,
        title: u.title,
        createdAt: u.created_at,
      })) as unknown as T;
    }
    if (method === "POST") {
      if (store.users.some((u) => u.username.toLowerCase() === String(body.username).toLowerCase())) {
        throw new ApiClientError(409, "Username already exists");
      }
      const nextId = store.users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
      const newUser = {
        id: nextId,
        username: body.username,
        password: body.password,
        display_name: body.displayName,
        role: body.role || "worker",
        avatar: String(body.displayName || "U").charAt(0).toUpperCase(),
        title: body.title || "Staff",
        created_at: new Date().toISOString(),
      };
      store.users.push(newUser);
      saveFallbackStore(store);
      return {
        id: newUser.id,
        username: newUser.username,
        displayName: newUser.display_name,
        role: newUser.role,
        avatar: newUser.avatar,
        title: newUser.title,
        createdAt: newUser.created_at,
      } as unknown as T;
    }
  }

  return undefined as unknown as T;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    console.warn(`[VaxCare API] Backend at ${API_BASE} is unreachable. Using built-in local fallback store for ${path}.`);
    return handleLocalFallbackRequest<T>(path, options);
  }

  // No-content responses
  if (res.status === 204) return undefined as T;

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    // non-JSON response body; leave as null
  }

  if (!res.ok) {
    if (res.status >= 502 || (res.status === 500 && !body?.error)) {
      console.warn(`[VaxCare API] Backend returned ${res.status} with no API payload. Using built-in local fallback store for ${path}.`);
      return handleLocalFallbackRequest<T>(path, options);
    }
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
  staffLogin: (username: string, password: string, recaptchaToken?: string) =>
    request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
        "g-recaptcha-response": recaptchaToken,
        recaptchaToken,
      }),
    }),
  residentLogin: (residentId: string, birthdate: string, recaptchaToken?: string) =>
    request<{ token: string; user: any }>("/auth/resident-login", {
      method: "POST",
      body: JSON.stringify({
        residentId,
        birthdate,
        "g-recaptcha-response": recaptchaToken,
        recaptchaToken,
      }),
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
    recaptchaToken?: string;
  }) => {
    const row = await request<any>("/residents", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        recaptchaToken: data.recaptchaToken,
      }),
    });
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
