import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, Calendar, AlertTriangle, RefreshCw, ArrowLeft,
  ArrowRight, User, Phone, MapPin, CheckCircle2, UserPlus,
  LogIn, Building2, HelpCircle, Activity, Award, Lock, Mail
} from "lucide-react";
import { authApi, setToken, ApiClientError } from "../lib/api";
import { AuthUser } from "../lib/types";
import { getRecaptchaToken } from "../lib/recaptcha";
import { RecaptchaLegalNotice } from "../components/RecaptchaLegalNotice";
import { ThemeToggle } from "../components/ThemeToggle";

const AUTH_USER_KEY = "vaxcare_user";

export function ResidentLoginScreen({ onLogin }: { onLogin: (user: AuthUser) => void }) {
  const [mode, setMode] = useState<"signin" | "register">("signin");

  // Sign In State
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");

  // Register State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regBirthdate, setRegBirthdate] = useState("");
  const [regGender, setRegGender] = useState<"Male" | "Female">("Female");
  const [regPurok, setRegPurok] = useState("Purok 1");
  const [regPhone, setRegPhone] = useState("");
  const [regAddress, setRegAddress] = useState("");

  const [registeredId, setRegisteredId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Sign In Handler
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
      const { token: authToken, user } = await authApi.residentLogin(email.trim(), birthdate.trim(), token);
      setToken(authToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      onLogin(user as AuthUser);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Could not find a resident profile matching this Gmail account and birthdate. Please verify your details or register below."
      );
    } finally {
      setLoading(false);
    }
  }

  // Register Handler
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!regEmail.includes("@")) {
      setError("Please enter a valid Gmail address (e.g. yourname@gmail.com).");
      return;
    }

    setLoading(true);

    let token = "";
    try {
      token = await getRecaptchaToken("resident_register");
    } catch (captchaErr) {
      console.error("[reCAPTCHA v3] Token generation failed at submit time:", captchaErr);
      setError("Security check failed. Please refresh and try again.");
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.registerResident(
        {
          name: regName.trim(),
          email: regEmail.trim(),
          birthdate: regBirthdate.trim(),
          gender: regGender,
          purok: regPurok,
          phone: regPhone.trim(),
          address: regAddress.trim(),
        },
        token
      );

      setRegisteredId(res.residentId);
      setToken(res.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));

      // Quick visual feedback before entering portal
      setTimeout(() => {
        onLogin(res.user as AuthUser);
      }, 900);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Registration could not be completed. Please check your entries and try again."
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
      <div className="hidden lg:flex lg:w-5/12 xl:w-5/12 bg-gradient-to-br from-[#071F2C] via-[#0A263B] to-[#0B4F47] text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden border-r border-[#163247]">
        {/* Subtle hospital background glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B7065] to-[#14B8A6] flex items-center justify-center text-white shadow-md shadow-teal-950/40 group-hover:scale-105 transition-transform">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight">VaxCare</span>
                <span className="text-[10px] font-bold font-mono bg-[#112C40] text-[#38BDF8] border border-[#164E63] px-1.5 py-0.5 rounded tracking-wide">
                  EHR
                </span>
              </div>
              <p className="text-xs text-[#8FAEC5] font-semibold -mt-0.5">Barangay Health Center</p>
            </div>
          </Link>

          <div className="mt-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-800 text-teal-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Official Citizen Health Gateway</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight">
              Your Family's Immunization Records, <br />
              <span className="text-[#2DD4BF]">Accessible Anytime.</span>
            </h1>
            <p className="text-sm xl:text-base text-[#B8D0E4] leading-relaxed max-w-md font-normal">
              Direct and secure access to verified vaccine certificates, dose schedules, and health records for all barangay residents using your Gmail account.
            </p>
          </div>
        </div>

        {/* Center Clinical Features */}
        <div className="relative z-10 my-8 space-y-3.5">
          <div className="flex items-center gap-3 text-xs xl:text-sm text-[#D8E6F2]">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-[#2DD4BF] shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <span>Instant access with your Gmail account & birthdate</span>
          </div>
          <div className="flex items-center gap-3 text-xs xl:text-sm text-[#D8E6F2]">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-[#2DD4BF] shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <span>Digital immunization certificate with verifiable QR code</span>
          </div>
          <div className="flex items-center gap-3 text-xs xl:text-sm text-[#D8E6F2]">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-[#2DD4BF] shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <span>Compliant with Republic Act 10173 (Data Privacy Act of 2012)</span>
          </div>
        </div>

        {/* Bottom Station Desk Info */}
        <div className="relative z-10 pt-6 border-t border-[#163247]/80 text-xs text-[#8FAEC5] space-y-1.5">
          <p className="font-semibold text-white flex items-center gap-1.5">
            <Building2 size={14} className="text-teal-400" /> Barangay Health Center Building
          </p>
          <p>Municipal Complex, Purok 3 · Immunization Unit</p>
          <p className="font-mono text-teal-300 font-bold">Helpline: (02) 8123-4567 · Mon–Fri 8AM–5PM</p>
        </div>
      </div>

      {/* ─── Right Auth & Registration Workspace ─── */}
      <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-12 overflow-y-auto">
        {/* Top Navigation Row */}
        <div className="w-full max-w-lg mx-auto flex items-center justify-between text-xs text-slate-500 dark:text-[#8FAEC5] mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 hover:text-[#0B7065] dark:hover:text-teal-400 transition-colors font-medium px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#0C1F2E]"
          >
            <ArrowLeft size={14} /> Back to Homepage
          </Link>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <span className="bg-teal-50 dark:bg-teal-950/60 text-[#0B7065] dark:text-teal-300 border border-teal-200/60 dark:border-teal-800 font-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Citizen Portal
            </span>
          </div>
        </div>

        {/* Auth Card Container */}
        <div className="w-full max-w-lg mx-auto my-auto">
          <div className="bg-white dark:bg-[#0C1F2E] border border-slate-200 dark:border-[#1E3A4E] rounded-2xl shadow-sm p-6 sm:p-8 transition-colors">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-center mx-auto mb-3 text-[#0B7065] dark:text-teal-400 shadow-xs">
                <ShieldCheck size={26} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Resident Health Portal
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-normal">
                {mode === "signin"
                  ? "Enter your registered Gmail address & birthdate to view your records"
                  : "Register with your Gmail account to start your digital health record"}
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
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => { setMode("register"); setError(""); }}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  mode === "register"
                    ? "bg-[#0B7065] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <UserPlus size={15} />
                <span>Register New</span>
              </button>
            </div>

            {/* Success notification upon registration */}
            {registeredId && (
              <div className="mb-5 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-xl p-3.5 flex items-center gap-3">
                <CheckCircle2 size={18} className="text-[#0B7065] dark:text-teal-400 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-teal-900 dark:text-teal-200">Registration Successful!</p>
                  <p className="text-teal-700 dark:text-teal-300">
                    Your profile has been registered. Logging you into the portal…
                  </p>
                </div>
              </div>
            )}

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
                    <span>Gmail Address</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">e.g. name@gmail.com</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(""); }}
                      placeholder="e.g. juan.delacruz@gmail.com"
                      autoComplete="email"
                      required
                      className="w-full bg-slate-50 dark:bg-[#091B27] border border-slate-200 dark:border-[#193347] rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0B7065] focus:border-[#0B7065] transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Date of Birth</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">YYYY-MM-DD</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={birthdate}
                      onChange={e => { setBirthdate(e.target.value); setError(""); }}
                      required
                      className="w-full bg-slate-50 dark:bg-[#091B27] border border-slate-200 dark:border-[#193347] rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0B7065] focus:border-[#0B7065] transition-all font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email || !birthdate}
                  className="w-full mt-2 bg-[#0B7065] hover:bg-[#085a52] text-white font-bold text-sm py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow"
                >
                  {loading ? <RefreshCw size={15} className="animate-spin" /> : <ShieldCheck size={16} />}
                  <span>{loading ? "Verifying Records…" : "Access My Health Records"}</span>
                </button>

                <div className="pt-2 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Don't have a registered account yet?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("register")}
                      className="text-[#0B7065] dark:text-teal-400 font-bold hover:underline"
                    >
                      Register your Gmail account here
                    </button>
                  </p>
                </div>

                <RecaptchaLegalNotice className="pt-1" />
              </form>
            ) : (
              /* ─── Mode 2: Self-Registration Form ─── */
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    value={regName}
                    onChange={e => { setRegName(e.target.value); setError(""); }}
                    placeholder="e.g. Maria Cruz Santos"
                    required
                    className="w-full bg-slate-50 dark:bg-[#091B27] border border-slate-200 dark:border-[#193347] rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0B7065] focus:border-[#0B7065] transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Gmail Address *
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => { setRegEmail(e.target.value); setError(""); }}
                    placeholder="e.g. maria.santos@gmail.com"
                    autoComplete="email"
                    required
                    className="w-full bg-slate-50 dark:bg-[#091B27] border border-slate-200 dark:border-[#193347] rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0B7065] focus:border-[#0B7065] transition-all font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={regBirthdate}
                      onChange={e => { setRegBirthdate(e.target.value); setError(""); }}
                      required
                      className="w-full bg-slate-50 dark:bg-[#091B27] border border-slate-200 dark:border-[#193347] rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B7065] focus:border-[#0B7065] transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Gender *
                    </label>
                    <select
                      value={regGender}
                      onChange={e => setRegGender(e.target.value as "Male" | "Female")}
                      className="w-full bg-slate-50 dark:bg-[#091B27] border border-slate-200 dark:border-[#193347] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B7065] focus:border-[#0B7065] transition-all"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Purok Station *
                    </label>
                    <select
                      value={regPurok}
                      onChange={e => setRegPurok(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#091B27] border border-slate-200 dark:border-[#193347] rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B7065] focus:border-[#0B7065] transition-all"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(p => (
                        <option key={p} value={`Purok ${p}`}>{`Purok ${p}`}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Contact / Phone No.
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="e.g. 0917-123-4567"
                      className="w-full bg-slate-50 dark:bg-[#091B27] border border-slate-200 dark:border-[#193347] rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0B7065] focus:border-[#0B7065] transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Residential Address
                  </label>
                  <input
                    value={regAddress}
                    onChange={e => setRegAddress(e.target.value)}
                    placeholder="e.g. Block 4, Lot 12, Barangay Compound"
                    className="w-full bg-slate-50 dark:bg-[#091B27] border border-slate-200 dark:border-[#193347] rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0B7065] focus:border-[#0B7065] transition-all"
                  />
                </div>

                <div className="p-3 bg-teal-50 dark:bg-[#081724] border border-teal-100 dark:border-[#163247] rounded-xl text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                  <Award size={15} className="text-[#0B7065] dark:text-teal-400 shrink-0 mt-0.5" />
                  <p>
                    Your digital health profile will be registered with your Gmail account. You can log in anytime using your Gmail and Date of Birth.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !regName || !regEmail || !regBirthdate}
                  className="w-full mt-2 bg-[#0B7065] hover:bg-[#085a52] text-white font-bold text-sm py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow"
                >
                  {loading ? <RefreshCw size={15} className="animate-spin" /> : <UserPlus size={16} />}
                  <span>{loading ? "Registering Profile…" : "Register & Access Health Portal"}</span>
                </button>

                <div className="pt-2 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Already registered?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signin")}
                      className="text-[#0B7065] dark:text-teal-400 font-bold hover:underline"
                    >
                      Sign In with your Gmail account
                    </button>
                  </p>
                </div>

                <RecaptchaLegalNotice className="pt-1" />
              </form>
            )}
          </div>

          {/* Switch to Staff Workspace */}
          <div className="mt-5 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Barangay Health Personnel or Administrator?{" "}
              <Link
                to="/staff/login"
                className="font-bold text-slate-900 dark:text-white hover:text-[#0B7065] dark:hover:text-teal-300 transition-colors underline"
              >
                Go to Medical Portal →
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full max-w-lg mx-auto text-center text-[11px] text-slate-400 dark:text-slate-500 mt-6">
          <p>© {new Date().getFullYear()} VaxCare · Barangay Health Center. Compliant with Data Privacy Act of 2012.</p>
        </div>
      </div>
    </div>
  );
}
