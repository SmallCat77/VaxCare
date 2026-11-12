import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Stethoscope, Eye, AlertTriangle, RefreshCw, ShieldCheck, ArrowLeft, ArrowRight, Lock, KeyRound } from "lucide-react";
import { authApi, setToken, ApiClientError } from "../lib/api";
import { AuthUser } from "../lib/types";
import { getRecaptchaToken } from "../lib/recaptcha";
import { RecaptchaLegalNotice } from "../components/RecaptchaLegalNotice";
import { ThemeToggle } from "../components/ThemeToggle";

const AUTH_USER_KEY = "vaxcare_user";

export function StaffLoginScreen({ onLogin }: { onLogin: (user: AuthUser) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
          : "Could not reach the server. Please check your backend connection."
      );
    } finally {
      setLoading(false);
    }
  }

  // Quick fill demo helper
  function fillDemoStaff(u: string, p: string) {
    setUsername(u);
    setPassword(p);
    setError("");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07131D] text-slate-900 dark:text-white flex flex-col items-center justify-center p-4 relative transition-colors" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Back to Home Link & Theme Toggle */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between text-xs text-slate-500 dark:text-[#8FAEC5]">
        <Link to="/" className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors font-medium">
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="bg-slate-100 dark:bg-[#112C3F] text-slate-700 dark:text-[#38BDF8] border border-slate-200 dark:border-[#164E63] font-mono text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
            Staff Portal
          </span>
        </div>
      </div>

      <div className="w-full max-w-md">
        {/* Header Card */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-[#0C1D2B] border border-slate-200 dark:border-[#193347] flex items-center justify-center mx-auto mb-3 text-slate-800 dark:text-teal-400 shadow-2xs">
            <Stethoscope size={22} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Staff & Medical Login</h1>
          <p className="text-xs text-slate-500 dark:text-[#8FAEC5] mt-1 font-normal">
            Barangay Health Officers, Registered Nurses, & Administrative Staff
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-[#0C1D2B] border border-slate-200 dark:border-[#193347] rounded-xl shadow-xs overflow-hidden p-6 sm:p-7 transition-colors">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center justify-between">
                <span>Staff Username</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">e.g. admin, ana.reyes</span>
              </label>
              <div className="relative">
                <input
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(""); }}
                  placeholder="Enter staff username"
                  autoComplete="username"
                  required
                  className="w-full bg-slate-50 dark:bg-[#091B27] border border-slate-200 dark:border-[#193347] rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-teal-400 focus:border-slate-900 dark:focus:border-teal-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter staff password"
                  autoComplete="current-password"
                  required
                  className="w-full bg-slate-50 dark:bg-[#091B27] border border-slate-200 dark:border-[#193347] rounded-lg px-3 py-2 pr-9 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-teal-400 focus:border-slate-900 dark:focus:border-teal-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <Eye size={14} />
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900/60 rounded-lg px-3 py-2">
                <AlertTriangle size={14} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-600 dark:text-rose-400 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-2xs"
            >
              {loading ? <RefreshCw size={13} className="animate-spin" /> : <Lock size={14} />}
              {loading ? "Authenticating Staff…" : "Sign In to Staff Workspace"}
            </button>

            {/* Google reCAPTCHA Notice */}
            <RecaptchaLegalNotice className="pt-1" />
          </form>

          {/* Demo Credentials Quick Fill */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
              <KeyRound size={12} /> Demo Staff Credentials:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoStaff("admin", "admin2025")}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-xs"
              >
                <p className="font-semibold text-slate-900">admin</p>
                <p className="text-[10px] text-slate-500 font-mono">admin2025 · BHO Officer</p>
              </button>
              <button
                type="button"
                onClick={() => fillDemoStaff("ana.reyes", "health123")}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-xs"
              >
                <p className="font-semibold text-slate-900">ana.reyes</p>
                <p className="text-[10px] text-slate-500 font-mono">health123 · RN Staff</p>
              </button>
            </div>
          </div>
        </div>

        {/* Switch to Resident Access */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500">
            Are you a barangay resident or patient?{" "}
            <Link to="/resident/login" className="font-semibold text-[#0B7065] hover:underline">
              Access Resident Portal →
            </Link>
          </p>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-5">
          VaxCare Healthcare System · Barangay Health Center · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
