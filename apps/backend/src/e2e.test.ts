import express, { Request, Response } from "express";
import { EventEmitter } from "node:events";
import authRoutes from "./routes/auth.routes";
import residentsRoutes from "./routes/residents.routes";
import { errorHandler } from "./middleware/errorHandler";
import { JWT_SECRET } from "./middleware/auth";
import { pool } from "./legacy/postgresql/pool";

// In-memory demo data store matching seed.sql
const demoUsers = [
  {
    id: 1,
    username: "admin",
    password_hash: "$2b$10$PnUZwREExo/ixpjOWa/D7.SUdbp5/uEz8t8tiplZwGYDICEJbSMvu", // admin2025
    display_name: "Dr. Pedro Cruz",
    role: "admin",
    avatar: "P",
    title: "Barangay Health Officer",
  },
  {
    id: 2,
    username: "ana.reyes",
    password_hash: "$2b$10$0XKXLnTWkzyDtq7250i5W.ysgW6SZUYoCRO/ez5bT7G0cgQd81I6C", // health123
    display_name: "RN Ana Reyes",
    role: "worker",
    avatar: "A",
    title: "Registered Nurse",
  },
];

const demoResidents: any[] = [
  {
    id: "R001",
    name: "Maria Santos",
    age: 34,
    gender: "Female",
    birthdate: "1990-03-15T00:00:00.000Z",
    address: "123 Sampaguita St.",
    phone: "09171234567",
    purok: "Purok 1",
    status: "Fully Vaccinated",
    next_due: null,
  },
  {
    id: "R002",
    name: "Jose dela Cruz",
    age: 45,
    gender: "Male",
    birthdate: "1979-07-22T00:00:00.000Z",
    address: "45 Rizal Ave.",
    phone: "09282345678",
    purok: "Purok 2",
    status: "Partially Vaccinated",
    next_due: "2025-07-22",
  },
];

interface E2ETestResult {
  step: string;
  expected: string;
  actual: string;
  passed: boolean;
}

const e2eResults: E2ETestResult[] = [];

function record(step: string, expected: string, actual: string, passed: boolean) {
  e2eResults.push({ step, expected, actual, passed });
  const mark = passed ? "✓ PASS" : "✗ FAIL";
  console.log(`${mark} - [${step}]: Expected ${expected}, got ${actual}`);
}

async function runE2E() {
  console.log("\n=======================================================");
  console.log("  Running VaxCare End-to-End Live App Verification     ");
  console.log("=======================================================\n");

  const originalFetch = global.fetch;
  const originalPoolQuery = pool.query;

  // Intercept pool.query to simulate PostgreSQL database with seed data
  (pool as any).query = async (text: string, params: any[] = []) => {
    // Staff query
    if (text.includes("FROM users WHERE username = $1")) {
      const user = demoUsers.find((u) => u.username === params[0]);
      return { rows: user ? [user] : [] };
    }
    // Resident query by ID
    if (text.includes("FROM residents WHERE id = $1")) {
      const resident = demoResidents.find((r) => r.id === params[0]);
      return { rows: resident ? [resident] : [] };
    }
    // Resident registration query
    if (text.includes("INSERT INTO residents")) {
      const newResident = {
        id: params[0],
        name: params[1],
        age: params[2],
        gender: params[3],
        birthdate: params[4],
        address: params[5],
        phone: params[6],
        purok: params[7],
        status: "Unvaccinated",
      };
      demoResidents.push(newResident);
      return { rows: [newResident] };
    }
    return { rows: [] };
  };

  // Build the Express app
  const app = express();
  app.set("trust proxy", 1);
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.use("/api/residents", residentsRoutes);
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.use(errorHandler);

  try {
    // Configure mock Google siteverify API to validate tokens dynamically
    global.fetch = async (url: any, init: any) => {
      if (typeof url === "string" && url.includes("google.com/recaptcha/api/siteverify")) {
        const bodyStr = String(init?.body || "");
        const params = new URLSearchParams(bodyStr);
        const token = params.get("response") || "";

        if (token.startsWith("valid-login-")) {
          return new globalThis.Response(
            JSON.stringify({
              success: true,
              score: 0.9,
              action: "login",
              hostname: "localhost",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }

        if (token.startsWith("valid-resident-login-")) {
          return new globalThis.Response(
            JSON.stringify({
              success: true,
              score: 0.9,
              action: "resident_login",
              hostname: "localhost",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }

        if (token.startsWith("valid-register-")) {
          return new globalThis.Response(
            JSON.stringify({
              success: true,
              score: 0.85,
              action: "register",
              hostname: "localhost",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }

        return new globalThis.Response(
          JSON.stringify({
            success: false,
            "error-codes": ["invalid-input-response"],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      return originalFetch(url, init);
    };

    // In-memory request dispatcher that executes full Express middleware pipeline
    const callApi = (path: string, options: any = {}): Promise<{ status: number; data: any }> => {
      return new Promise((resolve) => {
        const req: any = new EventEmitter();
        req.method = options.method || "POST";
        req.url = path;
        req.originalUrl = path;
        req.path = path;
        req.headers = {
          "content-type": "application/json",
          "fly-client-ip": "203.0.113.88",
          ...(options.headers || {}),
        };
        req.body = options.body || {};
        req.socket = { remoteAddress: "127.0.0.1" };
        req.ip = "203.0.113.88";

        let responseStatus = 200;
        let responseData: any = null;

        const res: any = {
          status(code: number) {
            responseStatus = code;
            return this;
          },
          json(data: any) {
            responseData = data;
            resolve({ status: responseStatus, data: responseData });
            return this;
          },
          send(data: any) {
            responseData = data;
            resolve({ status: responseStatus, data: responseData });
            return this;
          },
          setHeader() { return this; },
          getHeader() { return ""; },
        };

        app(req, res, (err: any) => {
          if (err) {
            errorHandler(err, req, res, (() => {}) as any);
          }
        });
      });
    };

    // -------------------------------------------------------------
    // Test 1: Staff Login with Valid Credentials & Valid Token
    // -------------------------------------------------------------
    const rStaffSuccess = await callApi("/api/auth/login", {
      body: {
        username: "admin",
        password: "admin2025",
        recaptchaToken: "valid-login-token-1",
      },
    });
    const staffToken = rStaffSuccess.data?.token;
    record(
      "1. Staff Login - Valid Credentials",
      "HTTP 200 with JWT and user object",
      `HTTP ${rStaffSuccess.status} (username: ${rStaffSuccess.data?.user?.username}, role: ${rStaffSuccess.data?.user?.role})`,
      rStaffSuccess.status === 200 && !!staffToken && rStaffSuccess.data?.user?.username === "admin"
    );

    // -------------------------------------------------------------
    // Test 2: Staff Login with Wrong Password (Validation Error)
    // -------------------------------------------------------------
    const rStaffWrongPass = await callApi("/api/auth/login", {
      body: {
        username: "admin",
        password: "incorrect-password",
        recaptchaToken: "valid-login-token-2",
      },
    });
    record(
      "2. Staff Login - Wrong Password",
      "HTTP 401 (Invalid username or password)",
      `HTTP ${rStaffWrongPass.status}: "${rStaffWrongPass.data?.error}"`,
      rStaffWrongPass.status === 401 && rStaffWrongPass.data?.error === "Invalid username or password"
    );

    // -------------------------------------------------------------
    // Test 3: Staff Login with Missing Fields (Form Validation Error)
    // -------------------------------------------------------------
    const rStaffMissing = await callApi("/api/auth/login", {
      body: {
        username: "",
        password: "",
        recaptchaToken: "valid-login-token-3",
      },
    });
    record(
      "3. Staff Login - Missing Fields",
      "HTTP 400 (username and password are required)",
      `HTTP ${rStaffMissing.status}: "${rStaffMissing.data?.error}"`,
      rStaffMissing.status === 400 && rStaffMissing.data?.error === "username and password are required"
    );

    // -------------------------------------------------------------
    // Test 4: Resident Login with Valid ID & Birthdate & Valid Token
    // -------------------------------------------------------------
    const rResidentSuccess = await callApi("/api/auth/resident-login", {
      body: {
        residentId: "R001",
        birthdate: "1990-03-15",
        recaptchaToken: "valid-resident-login-token-1",
      },
    });
    const residentToken = rResidentSuccess.data?.token;
    record(
      "4. Resident Login - Valid Credentials",
      "HTTP 200 with JWT and resident info",
      `HTTP ${rResidentSuccess.status} (displayName: ${rResidentSuccess.data?.user?.displayName}, role: ${rResidentSuccess.data?.user?.role})`,
      rResidentSuccess.status === 200 &&
        !!residentToken &&
        rResidentSuccess.data?.user?.displayName === "Maria Santos"
    );

    // -------------------------------------------------------------
    // Test 5: Resident Login with Incorrect Birthdate
    // -------------------------------------------------------------
    const rResidentWrongDate = await callApi("/api/auth/resident-login", {
      body: {
        residentId: "R001",
        birthdate: "1995-12-31",
        recaptchaToken: "valid-resident-login-token-2",
      },
    });
    record(
      "5. Resident Login - Incorrect Birthdate",
      "HTTP 401 (Resident ID or birthdate not found)",
      `HTTP ${rResidentWrongDate.status}: "${rResidentWrongDate.data?.error}"`,
      rResidentWrongDate.status === 401 &&
        rResidentWrongDate.data?.error === "Resident ID or birthdate not found"
    );

    // -------------------------------------------------------------
    // Test 6: Resident Login with Missing Fields
    // -------------------------------------------------------------
    const rResidentMissing = await callApi("/api/auth/resident-login", {
      body: {
        residentId: "",
        birthdate: "",
        recaptchaToken: "valid-resident-login-token-3",
      },
    });
    record(
      "6. Resident Login - Missing Fields",
      "HTTP 400 (residentId and birthdate are required)",
      `HTTP ${rResidentMissing.status}: "${rResidentMissing.data?.error}"`,
      rResidentMissing.status === 400 &&
        rResidentMissing.data?.error === "residentId and birthdate are required"
    );

    // -------------------------------------------------------------
    // Test 7: Resident Registration - Staff with Valid Token & Fields
    // -------------------------------------------------------------
    const rRegisterSuccess = await callApi("/api/residents", {
      headers: { authorization: `Bearer ${staffToken}` },
      body: {
        id: "R011",
        name: "Antonio Luna",
        age: 30,
        gender: "Male",
        birthdate: "1994-06-20",
        address: "88 Katipunan Rd.",
        phone: "09181234567",
        purok: "Purok 3",
        recaptchaToken: "valid-register-token-1",
      },
    });
    record(
      "7. Resident Registration - Authenticated Staff with Valid Captcha",
      "HTTP 201 Created with resident record",
      `HTTP ${rRegisterSuccess.status} (id: ${rRegisterSuccess.data?.id}, name: ${rRegisterSuccess.data?.name})`,
      rRegisterSuccess.status === 201 && rRegisterSuccess.data?.name === "Antonio Luna"
    );

    // -------------------------------------------------------------
    // Test 8: Resident Registration - Missing Required Fields
    // -------------------------------------------------------------
    const rRegisterMissingFields = await callApi("/api/residents", {
      headers: { authorization: `Bearer ${staffToken}` },
      body: {
        id: "",
        name: "",
        birthdate: "",
        recaptchaToken: "valid-register-token-2",
      },
    });
    record(
      "8. Resident Registration - Missing Required Fields",
      "HTTP 400 (id, name, and birthdate are required)",
      `HTTP ${rRegisterMissingFields.status}: "${rRegisterMissingFields.data?.error}"`,
      rRegisterMissingFields.status === 400 &&
        rRegisterMissingFields.data?.error === "id, name, and birthdate are required"
    );

    // -------------------------------------------------------------
    // Test 9: Resident Registration - Missing reCAPTCHA Token
    // -------------------------------------------------------------
    const rRegisterMissingCaptcha = await callApi("/api/residents", {
      headers: { authorization: `Bearer ${staffToken}` },
      body: {
        id: "R012",
        name: "Clara Santos",
        birthdate: "2001-01-15",
      },
    });
    record(
      "9. Resident Registration - Missing Captcha Token",
      "HTTP 400 (reCAPTCHA verification token is missing.)",
      `HTTP ${rRegisterMissingCaptcha.status}: "${rRegisterMissingCaptcha.data?.error}"`,
      rRegisterMissingCaptcha.status === 400 &&
        rRegisterMissingCaptcha.data?.error === "reCAPTCHA verification token is missing."
    );

    // -------------------------------------------------------------
    // Test 10: Resident Registration - Unauthenticated Request
    // -------------------------------------------------------------
    const rRegisterUnauth = await callApi("/api/residents", {
      body: {
        id: "R013",
        name: "Anonymous User",
        birthdate: "1999-09-09",
        recaptchaToken: "valid-register-token-3",
      },
    });
    record(
      "10. Resident Registration - Unauthenticated (No JWT)",
      "HTTP 401 (Missing or malformed Authorization header)",
      `HTTP ${rRegisterUnauth.status}: "${rRegisterUnauth.data?.error}"`,
      rRegisterUnauth.status === 401
    );
  } finally {
    global.fetch = originalFetch;
    pool.query = originalPoolQuery;
  }

  console.log("\n=======================================================");
  const totalPassed = e2eResults.filter((r) => r.passed).length;
  console.log(`  E2E Tests complete: ${totalPassed} / ${e2eResults.length} PASSED`);
  console.log("=======================================================\n");

  if (totalPassed !== e2eResults.length) {
    process.exit(1);
  }
}

runE2E().catch((err) => {
  console.error("E2E Test execution failed:", err);
  process.exit(1);
});
