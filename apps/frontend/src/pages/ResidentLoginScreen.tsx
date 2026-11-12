import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Calendar, AlertTriangle, RefreshCw, ArrowLeft, ArrowRight, User, HelpCircle, Sparkles } from "lucide-react";
import { authApi, setToken, ApiClientError } from "../lib/api";
import { AuthUser } from "../lib/types";
import { getRecaptchaToken } from "../lib/recaptcha";
import { RecaptchaLegalNotice } from "../components/RecaptchaLegalNotice";
import { ThemeToggle } from "../components/ThemeToggle";

const AUTH_USER_KEY = "vaxcare_user";

export function ResidentLoginScreen({ onLogin }: { onLogin: (user: AuthUser) => void }) {
  const [residentId, setResidentId] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    let token = "";
    try {
      token = await getRecaptchaToken("resident_login");
    } catch (captchaErr) {
      console.error("[reCAPTCHA v3] Token generation failed at submit time:", captchaErr);
      setError("Security check failed. Please refresh and try again.");
      setLoading(false);
      return;
    }

    try {
      const { token: authToken, user } = await authApi.residentLogin(residentId.trim(), birthdate.trim(), token);
      setToken(authToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      onLogin(user as AuthUser);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Could not find a resident matching this ID and birthdate. Please verify your details."
      );
    } finally {
      setLoading(false);
    }
  }

  // Quick fill demo helper
  function fillDemoResident(id: string, bday: string) {
    setResidentId(id);
    setBirthdate(bday);
    setError("");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07131D] text-slate-900 dark:text-white flex flex-col items-center justify-center p-4 relative transition-colors" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Back to Home Link & Theme Toggle */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between text-xs text-slate-500 dark:text-[#8FAEC5]">
        <Link to="/" className="inline-flex items-center gap-1.5 hover:text-[#0B7065] dark:hover:text-teal-400 transition-colors font-medium">
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="bg-teal-50 dark:bg-teal-950/60 text-[#0B7065] dark:text-teal-300 border border-teal-200/60 dark:border-teal-800 font-mono text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
            Resident Portal
          </span>
        </div>
      </div>

      <div className="w-full max-w-md">
        {/* Header Card */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto mb-3 text-[#0B7065] shadow-2xs">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Resident Health Portal</h1>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Access your personal vaccination records, appointments, & digital certificates
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-[#0C1D2B] border border-slate-200 dark:border-[#193347] rounded-xl shadow-xs overflow-hidden p-6 sm:p-7 transition-colors">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center justify-between">
                <span>Resident ID</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">Format: R001, R002...</span>
              </label>
              <div className="relative">
                <input
                  value={residentId}
                  onChange={e => { setResidentId(e.target.value); setError(""); }}
                  placeholder="Enter your Resident ID (e.g. R001)"
                  autoComplete="username"
                  required
                  className="w-full bg-slate-50 dark:bg-[#091B27] border border-slate-200 dark:border-[#193347] rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#0B7065] focus:border-[#0B7065] transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center justify-between">
                <span>Date of Birth</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">YYYY-MM-DD</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={birthdate}
                  onChange={e => { setBirthdate(e.target.value); setError(""); }}
                  placeholder="YYYY-MM-DD (e.g. 1990-03-15)"
                  autoComplete="bday"
                  required
                  className="w-full bg-slate-50 dark:bg-[#091B27] border border-slate-200 dark:border-[#193347] rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#0B7065] focus:border-[#0B7065] transition-all font-mono"
                />
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
              disabled={loading || !residentId || !birthdate}
              className="w-full bg-[#0B7065] hover:bg-[#095c53] text-white font-semibold text-xs py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-2xs"
            >
              {loading ? <RefreshCw size={13} className="animate-spin" /> : <ShieldCheck size={14} />}
              {loading ? "Verifying Records…" : "Access My Health Records"}
            </button>

            {/* Google reCAPTCHA Notice */}
            <RecaptchaLegalNotice className="pt-1" />
          </form>

          {/* Demo Profiles Quick Fill */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
              Demo Resident Profiles:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoResident("R001", "1990-03-15")}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-xs"
              >
                <p className="font-semibold text-slate-900">Maria Santos</p>
                <p className="text-[10px] text-slate-500 font-mono">R001 · 1990-03-15</p>
              </button>
              <button
                type="button"
                onClick={() => fillDemoResident("R002", "1979-07-22")}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-xs"
              >
                <p className="font-semibold text-slate-900">Jose dela Cruz</p>
                <p className="text-[10px] text-slate-500 font-mono">R002 · 1979-07-22</p>
              </button>
            </div>
          </div>

          {/* Help box */}
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-start gap-2 text-[11px] text-slate-500">
            <HelpCircle size={14} className="text-slate-400 shrink-0 mt-0.5" />
            <p>
              Don't know your Resident ID? Visit the health center or ask your Purok Leader to look it up.
            </p>
          </div>
        </div>

        {/* Switch to Staff Access */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500">
            Healthcare worker or administrator?{" "}
            <Link to="/staff/login" className="font-semibold text-slate-900 hover:text-[#0B7065] transition-colors">
              Go to Staff Login →
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
