import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Stethoscope, Eye, EyeOff, AlertTriangle, RefreshCw, ShieldCheck,
  ArrowLeft, ArrowRight, Lock, KeyRound, User, UserPlus, LogIn,
  Building2, CheckCircle2, Award, Activity
} from "lucide-react";
import { authApi, setToken, ApiClientError } from "../lib/api";
import { AuthUser } from "../lib/types";
import { getRecaptchaToken } from "../lib/recaptcha";
import { RecaptchaLegalNotice } from "../components/RecaptchaLegalNotice";
import { ThemeToggle } from "../components/ThemeToggle";

const AUTH_USER_KEY = "vaxcare_user";

export function StaffLoginScreen({ onLogin }: { onLogin: (user: AuthUser) => void }) {
  const [mode, setMode] = useState<"signin" | "register">("signin");

  // Sign In State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Register State
  const [regFullName, setRegFullName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regRole, setRegRole] = useState<"worker" | "admin">("worker");
  const [regTitle, setRegTitle] = useState("Registered Nurse");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPass, setShowRegPass] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Sign In Handler
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    let token = "";
    try {
      token = await getRecaptchaToken("login");
    } catch (captchaErr) {
      console.error("[reCAPTCHA v3] Token generation failed at submit time:", captchaErr);
      setError("Security check failed. Please refresh and try again.");
      setLoading(false);
      return;
    }

    try {
      const { token: authToken, user } = await authApi.staffLogin(username.trim(), password, token);
      setToken(authToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      onLogin(user as AuthUser);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Could not reach the server. Please check your staff credentials or network connection."
      );
    } finally {
      setLoading(false);
    }
  }

  // Register Staff Handler
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match. Please verify both password entries.");
      return;
    }

    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    let token = "";
    try {
      token = await getRecaptchaToken("staff_register");
    } catch (captchaErr) {
      console.error("[reCAPTCHA v3] Token generation failed at submit time:", captchaErr);
      setError("Security check failed. Please refresh and try again.");
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.registerStaff(
        {
          username: regUsername.trim(),
          password: regPassword,
          displayName: regFullName.trim(),
          role: regRole,
          title: regTitle.trim(),
        },
        token
      );

      setToken(res.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
      onLogin(res.user as AuthUser);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Staff registration could not be completed. Please try a different username."
      );
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] dark:bg-[#07131D] text-slate-900 dark:text-white flex flex-col lg:flex-row transition-colors"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* ─── Left Hospital Branding Panel (Desktop lg+) ─── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-5/12 bg-gradient-to-br from-[#071F2C] via-[#091D2C] to-[#0A2E3D] text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden border-r border-[#163247]">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0284C7] to-[#0B7065] flex items-center justify-center text-white shadow-md shadow-slate-950/40 group-hover:scale-105 transition-transform">
              <Stethoscope size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight">VaxCare</span>
                <span className="text-[10px] font-bold font-mono bg-[#112C40] text-[#38BDF8] border border-[#164E63] px-1.5 py-0.5 rounded tracking-wide">
                  CLINICAL
                </span>
              </div>
              <p className="text-xs text-[#8FAEC5] font-semibold -mt-0.5">Barangay Health Center</p>
            </div>
          </Link>

          <div className="mt-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#112C40] border border-[#164E63] text-[#38BDF8] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
              <span>Authorized Clinical Workspace</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight">
              Barangay Health Personnel & <br />
              <span className="text-[#38BDF8]">Medical Officer Station.</span>
            </h1>
            <p className="text-sm xl:text-base text-[#B8D0E4] leading-relaxed max-w-md font-normal">
              Unified electronic health record management for Barangay Health Officers, Registered Nurses, Midwives, and BHW healthcare leaders.
            </p>
          </div>
        </div>

        {/* Center Clinical Features */}
        <div className="relative z-10 my-8 space-y-3.5">
          <div className="flex items-center gap-3 text-xs xl:text-sm text-[#D8E6F2]">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <span>Electronic Medical Records (EMR) & resident immunization history</span>
          </div>
          <div className="flex items-center gap-3 text-xs xl:text-sm text-[#D8E6F2]">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <span>Monitored cold-chain stock restock & lot expiry alerts</span>
          </div>
          <div className="flex items-center gap-3 text-xs xl:text-sm text-[#D8E6F2]">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <span>Automated DOH immunization reporting & coverage rate analytics</span>
          </div>
        </div>

        {/* Bottom Station Desk Info */}
        <div className="relative z-10 pt-6 border-t border-[#163247]/80 text-xs text-[#8FAEC5] space-y-1.5">
          <p className="font-semibold text-white flex items-center gap-1.5">
            <Building2 size={14} className="text-sky-400" /> Clinical Station Terminal 01
          </p>
          <p>Barangay Health Center A · Purok 1–10 Administration Unit</p>
          <p className="font-mono text-[#38BDF8] font-bold">Encrypted Hospital Network · Station Monitored</p>
        </div>
      </div>

      {/* ─── Right Auth & Registration Workspace ─── */}
      <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-12 overflow-y-auto">
        {/* Top Navigation Row */}
        <div className="w-full max-w-lg mx-auto flex items-center justify-between text-xs text-slate-500 dark:text-[#8FAEC5] mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors font-medium px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#0C1F2E]"
          >
            <ArrowLeft size={14} /> Back to Homepage
          </Link>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <span className="bg-slate-100 dark:bg-[#112C40] text-slate-700 dark:text-[#38BDF8] border border-slate-200 dark:border-[#164E63] font-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Staff Portal
            </span>
          </div>
        </div>

        {/* Auth Card Container */}
        <div className="w-full max-w-lg mx-auto my-auto">
          <div className="bg-white dark:bg-[#0C1F2E] border border-slate-200 dark:border-[#1E3A4E] rounded-2xl shadow-sm p-6 sm:p-8 transition-colors">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-center justify-center mx-auto mb-3 text-sky-600 dark:text-sky-400 shadow-xs">
                <Stethoscope size={26} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Staff & Medical Portal
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-normal">
                {mode === "signin"
                  ? "Enter authorized staff credentials to access the EHR workspace"
                  : "Register a healthcare staff or administrative account"}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-[#071724] border border-slate-200/80 dark:border-[#163247] rounded-xl mb-6">
              <button
                type="button"
                onClick={() => { setMode("signin"); setError(""); }}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  mode === "signin"
                    ? "bg-white dark:bg-[#0C1F2E] text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-[#1E3A4E]"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <LogIn size={15} />
                <span>Staff Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => { setMode("register"); setError(""); }}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  mode === "register"
                    ? "bg-slate-900 dark:bg-sky-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <UserPlus size={15} />
                <span>Register Staff</span>
              </button>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-5 flex items-center gap-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl p-3">
                <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
                <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">{error}</p>
              </div>
            )}

            {/* ─── Mode 1: Sign In Form ─── */}
            {mode === "signin" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Staff Username</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">Authorized ID</span>
                  </label>
                  <div className="relative">
                    <input
                      value={username}
                      onChange={e => { setUsername(e.target.value); setError(""); }}
                      placeholder="e.g. admin or ana.reyes"
                      autoComplete="username"
                      required
                      className="w-full bg-slate-50 dark:bg-[#091B27] border border-slate-200 dark:border-[#193347] rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-sky-400 focus:border-slate-900 dark:focus:border-sky-400 transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(""); }}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="w-full bg-slate-50 dark:bg-[#091B27] border border-slate-200 dark:border-[#193347] rounded-xl px-3.5 py-2.5 pr-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-sky-400 focus:border-slate-900 dark:focus:border-sky-400 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !username || !password}
                  className="w-full mt-2 bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-bold text-sm py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow"
                >
                  {loading ? <RefreshCw size={15} className="animate-spin" /> : <Lock size={16} />}
                  <span>{loading ? "Authenticating Staff…" : "Sign In to Staff Workspace"}</span>
                </button>

                <div className="pt-2 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    New staff member or health worker?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("register")}
                      className="text-[#0284C7] dark:text-[#38BDF8] font-bold hover:underline"
                    >
                      Register staff account
                    </button>
                  </p>
                </div>

                <RecaptchaLegalNotice className="pt-1" />
              </form>
            ) : (
              /* ─── Mode 2: Staff Registration Form ─── */
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Full Professional Name *
                  </label>
                  <input
                    value={regFullName}
                    onChange={e => { setRegFullName(e.target.value); setError(""); }}
                    placeholder="e.g. Dr. Pedro Cruz or RN Ana Reyes"
                    required
                    className="w-full bg-slate-50 dark:bg-[#091B27] border border-slate-200 dark:border-[#193347] rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-sky-400 focus:border-slate-900 dark:focus:border-sky-400 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Staff Username *
                    </label>
                    <input
                      value={regUsername}
                      onChange={e => { setRegUsername(e.target.value); setError(""); }}
                      placeholder="e.g. p.cruz"
                      required
                      className="w-full bg-slate-50 dark:bg-[#091B27] border border-slate-200 dark:border-[#193347] rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-sky-400 focus:border-slate-900 dark:focus:border-sky-400 transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Role Classification *
                    </label>
                    <select
                      value={regRole}
                      onChange={e => {
                        const r = e.target.value as "worker" | "admin";
                        setRegRole(r);
                        if (r === "admin") setRegTitle("Barangay Health Officer");
                        else setRegTitle("Registered Nurse");
                      }}
                      className="w-full bg-slate-50 dark:bg-[#091B27] border border-slate-200 dark:border-[#193347] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-sky-400 focus:border-slate-900 dark:focus:border-sky-400 transition-all"
                    >
                      <option value="worker">Registered Nurse / Staff</option>
                      <option value="admin">Barangay Health Officer (Admin)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Designation / Title *
                  </label>
                  <input
                    value={regTitle}
                    onChange={e => setRegTitle(e.target.value)}
                    placeholder="e.g. Registered Nurse, BHW Volunteer, Midwife"
                    required
                    className="w-full bg-slate-50 dark:bg-[#091B27] border border-slate-200 dark:border-[#193347] rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-sky-400 focus:border-slate-900 dark:focus:border-sky-400 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Password (min. 6 chars) *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPass ? "text" : "password"}
                        value={regPassword}
                        onChange={e => { setRegPassword(e.target.value); setError(""); }}
                        placeholder="••••••••"
                        required
                        className="w-full bg-slate-50 dark:bg-[#091B27] border border-slate-200 dark:border-[#193347] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-sky-400 focus:border-slate-900 dark:focus:border-sky-400 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPass ? "text" : "password"}
                        value={regConfirmPassword}
                        onChange={e => { setRegConfirmPassword(e.target.value); setError(""); }}
                        placeholder="••••••••"
                        required
                        className="w-full bg-slate-50 dark:bg-[#091B27] border border-slate-200 dark:border-[#193347] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-sky-400 focus:border-slate-900 dark:focus:border-sky-400 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showRegPass}
                      onChange={e => setShowRegPass(e.target.checked)}
                      className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span>Show Passwords</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || !regFullName || !regUsername || !regPassword || !regConfirmPassword}
                  className="w-full mt-2 bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-bold text-sm py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow"
                >
                  {loading ? <RefreshCw size={15} className="animate-spin" /> : <UserPlus size={16} />}
                  <span>{loading ? "Creating Account…" : "Create Staff Account & Sign In"}</span>
                </button>

                <div className="pt-2 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Already have a staff account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signin")}
                      className="text-[#0284C7] dark:text-[#38BDF8] font-bold hover:underline"
                    >
                      Sign In with your username
                    </button>
                  </p>
                </div>

                <RecaptchaLegalNotice className="pt-1" />
              </form>
            )}
          </div>

          {/* Switch to Resident Access */}
          <div className="mt-5 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you a barangay resident or patient?{" "}
              <Link
                to="/resident/login"
                className="font-bold text-[#0B7065] dark:text-teal-400 hover:underline transition-colors"
              >
                Access Resident Portal →
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full max-w-lg mx-auto text-center text-[11px] text-slate-400 dark:text-slate-500 mt-6">
          <p>© {new Date().getFullYear()} VaxCare · Barangay Health Center. Authorized personnel access only.</p>
        </div>
      </div>
    </div>
  );
}