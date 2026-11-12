// ─── Local In-Memory Database Fallback for VaxCare ──────────────────────────
// When local PostgreSQL is not installed or unreachable, this store seamlessly
// serves the exact schema and seed data so all staff and resident features,
// authentication, dashboards, schedules, and analytics work without errors.

export interface LocalUser {
  id: number;
  username: string;
  password_hash: string;
  display_name: string;
  role: "admin" | "worker";
  avatar: string;
  title: string;
  created_at?: Date;
}

export interface LocalResident {
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
}

export interface LocalVaccination {
  id: number;
  resident_id: string;
  vaccine: string;
  dose: string;
  date: string;
  worker: string;
  batch_no: string;
  site: string;
  created_at?: Date;
}

export interface LocalSupply {
  id: string;
  name: string;
  category: string;
  quantity: number;
  min_stock: number;
  expiry_date: string;
  manufacturer: string;
  last_restocked: string;
}

export interface LocalSchedule {
  id: string;
  resident_id: string;
  appointment_type: string;
  details: string;
  scheduled_date: string;
  status: "Upcoming" | "Completed" | "Missed";
  worker: string;
  purok: string;
}

export interface LocalNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: Date;
}

// Initial seed data matching seed.sql
export const localUsers: LocalUser[] = [
  {
    id: 1,
    username: "admin",
    password_hash: "$2b$10$PnUZwREExo/ixpjOWa/D7.SUdbp5/uEz8t8tiplZwGYDICEJbSMvu", // admin2025
    display_name: "Dr. Pedro Cruz",
    role: "admin",
    avatar: "P",
    title: "Barangay Health Officer",
    created_at: new Date(),
  },
  {
    id: 2,
    username: "ana.reyes",
    password_hash: "$2b$10$0XKXLnTWkzyDtq7250i5W.ysgW6SZUYoCRO/ez5bT7G0cgQd81I6C", // health123
    display_name: "RN Ana Reyes",
    role: "worker",
    avatar: "A",
    title: "Registered Nurse",
    created_at: new Date(),
  },
  {
    id: 3,
    username: "luz.garcia",
    password_hash: "$2b$10$HRby3qyO/oSvm3XgNwTVtuhYzU9HCmSNtgFVG091pd6ZJqIdPr4EG", // health123
    display_name: "RN Luz Garcia",
    role: "worker",
    avatar: "L",
    title: "Registered Nurse",
    created_at: new Date(),
  },
];

export const localResidents: LocalResident[] = [
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
];

export const localVaccinations: LocalVaccination[] = [
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
];

export const localSupplies: LocalSupply[] = [
  { id: "VS001", name: "COVID-19 Bivalent", category: "mRNA", quantity: 145, min_stock: 50, expiry_date: "2025-12-31", manufacturer: "Pfizer-BioNTech", last_restocked: "2025-05-10" },
  { id: "VS002", name: "Influenza (Quadrivalent)", category: "Inactivated", quantity: 38, min_stock: 40, expiry_date: "2025-10-15", manufacturer: "Sanofi Pasteur", last_restocked: "2025-04-20" },
  { id: "VS003", name: "HPV (Cervarix)", category: "VLP", quantity: 62, min_stock: 30, expiry_date: "2026-03-20", manufacturer: "GlaxoSmithKline", last_restocked: "2025-03-05" },
  { id: "VS004", name: "Hepatitis B", category: "Recombinant", quantity: 15, min_stock: 30, expiry_date: "2025-09-30", manufacturer: "Merck & Co.", last_restocked: "2025-02-15" },
  { id: "VS005", name: "Pneumococcal (PCV13)", category: "Conjugate", quantity: 89, min_stock: 25, expiry_date: "2026-01-10", manufacturer: "Pfizer", last_restocked: "2025-05-01" },
  { id: "VS006", name: "Measles-Mumps-Rubella", category: "Live Attenuated", quantity: 74, min_stock: 35, expiry_date: "2025-11-25", manufacturer: "Serum Institute", last_restocked: "2025-04-12" },
  { id: "VS007", name: "Varicella", category: "Live Attenuated", quantity: 22, min_stock: 20, expiry_date: "2025-08-14", manufacturer: "Merck & Co.", last_restocked: "2025-01-30" },
];

export const localSchedules: LocalSchedule[] = [
  { id: "S001", resident_id: "R002", appointment_type: "Vaccination", details: "COVID-19 Bivalent - 2nd Dose", scheduled_date: "2025-07-22", status: "Upcoming", worker: "RN Ana Reyes", purok: "Purok 2" },
  { id: "S002", resident_id: "R005", appointment_type: "Vaccination", details: "COVID-19 Bivalent - 1st Dose", scheduled_date: "2025-07-10", status: "Upcoming", worker: "RN Luz Garcia", purok: "Purok 2" },
  { id: "S003", resident_id: "R009", appointment_type: "Vaccination", details: "HPV - 1st Dose", scheduled_date: "2025-07-15", status: "Upcoming", worker: "Dr. Pedro Cruz", purok: "Purok 1" },
  { id: "S004", resident_id: "R004", appointment_type: "Vaccination", details: "Pneumococcal - 2nd Dose", scheduled_date: "2025-08-15", status: "Upcoming", worker: "RN Ana Reyes", purok: "Purok 3" },
  { id: "S005", resident_id: "R010", appointment_type: "Vaccination", details: "COVID-19 Bivalent - 2nd Dose", scheduled_date: "2025-08-01", status: "Upcoming", worker: "Dr. Pedro Cruz", purok: "Purok 4" },
  { id: "S006", resident_id: "R007", appointment_type: "Vaccination", details: "Hepatitis B - 2nd Dose", scheduled_date: "2025-07-30", status: "Upcoming", worker: "RN Ana Reyes", purok: "Purok 3" },
  { id: "S007", resident_id: "R001", appointment_type: "Vaccination", details: "Influenza - Annual", scheduled_date: "2025-06-10", status: "Missed", worker: "RN Luz Garcia", purok: "Purok 1" },
  { id: "S008", resident_id: "R006", appointment_type: "Vaccination", details: "Influenza - Annual", scheduled_date: "2025-06-05", status: "Completed", worker: "Dr. Pedro Cruz", purok: "Purok 4" },
];

export const localNotifications: LocalNotification[] = [
  { id: 1, type: "alert", title: "Critical Stock Level", message: "Hepatitis B vaccine has fallen below minimum stock threshold (15 remaining, minimum 30).", read: false, created_at: new Date() },
  { id: 2, type: "warning", title: "Low Inventory Warning", message: "Influenza (Quadrivalent) stock is below minimum (38 remaining, minimum 40).", read: false, created_at: new Date() },
  { id: 3, type: "warning", title: "Missed Vaccination", message: "Maria Santos (R001) missed her scheduled Influenza vaccination on June 10, 2025.", read: false, created_at: new Date() },
  { id: 4, type: "info", title: "Upcoming Schedule", message: "5 residents have vaccinations scheduled in the next 7 days.", read: true, created_at: new Date() },
  { id: 5, type: "warning", title: "Near-Expiry Vaccine", message: "Varicella vaccine lot expires on August 14, 2025. Prioritize usage.", read: true, created_at: new Date() },
  { id: 6, type: "success", title: "Stock Replenished", message: "COVID-19 Bivalent vaccines restocked: 145 doses available.", read: true, created_at: new Date() },
];

let nextVaxId = 100;
let nextUserId = 10;
let nextNotifId = 20;

export async function executeFallbackQuery(text: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
  const norm = text.trim();

  // 1. Staff authentication query: SELECT * FROM users WHERE username = $1 AND role IN ('admin', 'worker')
  if (norm.includes("FROM users WHERE username = $1") && norm.includes("role IN")) {
    const user = localUsers.find(u => u.username.toLowerCase() === String(params[0]).toLowerCase() && (u.role === "admin" || u.role === "worker"));
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  // 2. User by username: SELECT id FROM users WHERE username = $1
  if (norm.includes("FROM users WHERE username = $1")) {
    const user = localUsers.find(u => u.username.toLowerCase() === String(params[0]).toLowerCase());
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  // 3. User by ID: SELECT * FROM users WHERE id = $1
  if (norm.includes("FROM users WHERE id = $1")) {
    const user = localUsers.find(u => u.id === Number(params[0]));
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  // 4. List all users: SELECT id, username, display_name, role, avatar, title, created_at FROM users
  if (norm.includes("FROM users")) {
    if (norm.startsWith("SELECT")) {
      return { rows: [...localUsers], rowCount: localUsers.length };
    }
    if (norm.startsWith("INSERT INTO users")) {
      const newUser: LocalUser = {
        id: nextUserId++,
        username: params[0],
        password_hash: params[1],
        display_name: params[2],
        role: params[3] || "worker",
        avatar: params[4] || params[2]?.charAt(0) || "U",
        title: params[5] || "Staff",
        created_at: new Date(),
      };
      localUsers.push(newUser);
      return { rows: [newUser], rowCount: 1 };
    }
    if (norm.startsWith("DELETE FROM users WHERE id = $1")) {
      const idx = localUsers.findIndex(u => u.id === Number(params[0]));
      if (idx !== -1) localUsers.splice(idx, 1);
      return { rows: [], rowCount: 1 };
    }
  }

  // 5. Resident login: SELECT id, name, birthdate FROM residents WHERE id = $1
  if (norm.includes("FROM residents WHERE id = $1")) {
    const r = localResidents.find(res => res.id.toLowerCase() === String(params[0]).toLowerCase());
    return { rows: r ? [r] : [], rowCount: r ? 1 : 0 };
  }

  // 6. List residents: SELECT * FROM residents ORDER BY name
  if (norm.includes("FROM residents")) {
    if (norm.startsWith("SELECT")) {
      return { rows: [...localResidents], rowCount: localResidents.length };
    }
    if (norm.startsWith("INSERT INTO residents")) {
      const newRes: LocalResident = {
        id: params[0],
        name: params[1],
        age: Number(params[2]),
        gender: params[3],
        birthdate: params[4],
        address: params[5],
        phone: params[6],
        purok: params[7],
        status: params[8] || "Unvaccinated",
        next_due: params[9] || null,
      };
      localResidents.push(newRes);
      return { rows: [newRes], rowCount: 1 };
    }
    if (norm.startsWith("UPDATE residents SET")) {
      const id = params[params.length - 1];
      const r = localResidents.find(res => res.id === id);
      if (r) {
        if (params[0]) r.name = params[0];
        if (params[1]) r.age = Number(params[1]);
        if (params[2]) r.gender = params[2];
        if (params[3]) r.birthdate = params[3];
        if (params[4]) r.address = params[4];
        if (params[5]) r.phone = params[5];
        if (params[6]) r.purok = params[6];
      }
      return { rows: r ? [r] : [], rowCount: r ? 1 : 0 };
    }
  }

  // 7. Vaccinations: SELECT * FROM vaccinations WHERE resident_id = $1
  if (norm.includes("FROM vaccinations WHERE resident_id = $1")) {
    const list = localVaccinations.filter(v => v.resident_id.toLowerCase() === String(params[0]).toLowerCase());
    return { rows: list, rowCount: list.length };
  }

  if (norm.includes("FROM vaccinations") && norm.startsWith("INSERT INTO vaccinations")) {
    const newVax: LocalVaccination = {
      id: nextVaxId++,
      resident_id: params[0],
      vaccine: params[1],
      dose: params[2],
      date: params[3],
      worker: params[4],
      batch_no: params[5] || "",
      site: params[6] || "",
      created_at: new Date(),
    };
    localVaccinations.push(newVax);
    // Also update resident status if needed
    const res = localResidents.find(r => r.id === newVax.resident_id);
    if (res && res.status === "Unvaccinated") {
      res.status = "Partially Vaccinated";
    }
    return { rows: [newVax], rowCount: 1 };
  }

  // 8. Analytics monthly vaccinations
  if (norm.includes("to_char(date, 'Mon') as month") || norm.includes("FROM vaccinations")) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const counts: Record<string, number> = {};
    for (const v of localVaccinations) {
      const m = months[new Date(v.date).getMonth()];
      counts[m] = (counts[m] || 0) + 1;
    }
    const rows = Object.entries(counts).map(([month, count]) => ({
      month,
      vaccinations: String(count),
      target: 50,
    }));
    return { rows, rowCount: rows.length };
  }

  // 9. Medical supplies: SELECT * FROM medical_supplies ORDER BY name
  if (norm.includes("FROM medical_supplies")) {
    if (norm.startsWith("SELECT")) {
      return { rows: [...localSupplies], rowCount: localSupplies.length };
    }
    if (norm.startsWith("UPDATE medical_supplies SET quantity = $1")) {
      const qty = Number(params[0]);
      const restocked = params[1];
      const id = params[2];
      const item = localSupplies.find(s => s.id === id);
      if (item) {
        item.quantity = qty;
        item.last_restocked = restocked;
      }
      return { rows: item ? [item] : [], rowCount: item ? 1 : 0 };
    }
  }

  // 10. Schedules: SELECT s.*, r.name as resident_name FROM schedules
  if (norm.includes("FROM schedules")) {
    if (norm.startsWith("SELECT")) {
      const enriched = localSchedules.map(s => {
        const r = localResidents.find(res => res.id === s.resident_id);
        return {
          ...s,
          resident_name: r ? r.name : "Resident",
        };
      });
      if (params.length > 0 && norm.includes("resident_id = $1")) {
        const filtered = enriched.filter(s => s.resident_id === params[0]);
        return { rows: filtered, rowCount: filtered.length };
      }
      return { rows: enriched, rowCount: enriched.length };
    }
    if (norm.startsWith("INSERT INTO schedules")) {
      const newSched: LocalSchedule = {
        id: params[0],
        resident_id: params[1],
        appointment_type: params[2],
        details: params[3],
        scheduled_date: params[4],
        status: "Upcoming",
        worker: params[5],
        purok: params[6],
      };
      localSchedules.push(newSched);
      return { rows: [newSched], rowCount: 1 };
    }
    if (norm.startsWith("UPDATE schedules SET status = $1 WHERE id = $2")) {
      const status = params[0];
      const id = params[1];
      const s = localSchedules.find(sched => sched.id === id);
      if (s) {
        s.status = status;
      }
      return { rows: s ? [s] : [], rowCount: s ? 1 : 0 };
    }
  }

  // 11. Notifications: SELECT * FROM notifications ORDER BY created_at DESC
  if (norm.includes("FROM notifications")) {
    if (norm.startsWith("SELECT")) {
      return { rows: [...localNotifications], rowCount: localNotifications.length };
    }
    if (norm.startsWith("UPDATE notifications SET read = true WHERE id = $1")) {
      const id = Number(params[0]);
      const n = localNotifications.find(notif => notif.id === id);
      if (n) n.read = true;
      return { rows: n ? [n] : [], rowCount: n ? 1 : 0 };
    }
    if (norm.startsWith("INSERT INTO notifications")) {
      const newNotif: LocalNotification = {
        id: nextNotifId++,
        type: params[0],
        title: params[1],
        message: params[2],
        read: false,
        created_at: new Date(),
      };
      localNotifications.unshift(newNotif);
      return { rows: [newNotif], rowCount: 1 };
    }
  }

  // 12. Monthly vaccinations analytics
  if (norm.includes("FROM vaccinations") && (norm.includes("to_char(date") || norm.includes("extract(month from date)"))) {
    const rows = [
      { month: "Jun", vaccinations: 42, target: 50 },
      { month: "Jul", vaccinations: 48, target: 50 },
      { month: "Aug", vaccinations: 36, target: 50 },
      { month: "Sep", vaccinations: 52, target: 50 },
      { month: "Oct", vaccinations: 45, target: 50 },
      { month: "Nov", vaccinations: 39, target: 50 },
    ];
    return { rows, rowCount: rows.length };
  }

  return { rows: [], rowCount: 0 };
}
