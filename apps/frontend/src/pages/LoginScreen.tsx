import React, { useState } from "react";
import { Syringe, Eye, AlertTriangle, RefreshCw, ShieldCheck } from "lucide-react";
import { authApi, setToken, ApiClientError } from "../lib/api";
import { AuthUser } from "../lib/types";

const AUTH_USER_KEY = "vaxcare_user";

export function LoginScreen({ onLogin }: { onLogin: (user: AuthUser) => void }) {
  const [tab, setTab] = useState<"staff" | "resident">("staff");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } =
        tab === "staff"
          ? await authApi.staffLogin(username.trim(), password)
          : await authApi.residentLogin(username.trim(), password);
      setToken(token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      onLogin(user as AuthUser);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Could not reach the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Syringe size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">VaxCare</h1>
          <p className="text-sm text-muted-foreground mt-1">Barangay Health Center Management System</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button onClick={() => { setTab("staff"); setError(""); setUsername(""); setPassword(""); }} className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === "staff" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"}`}>
              Staff Login
            </button>
            <button onClick={() => { setTab("resident"); setError(""); setUsername(""); setPassword(""); }} className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === "resident" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"}`}>
              Resident Login
            </button>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                {tab === "staff" ? "Username" : "Resident ID"}
              </label>
              <input
                value={username}
                onChange={e => { setUsername(e.target.value); setError(""); }}
                placeholder={tab === "staff" ? "e.g. admin" : "e.g. R001"}
                autoComplete="username"
                className="w-full bg-input-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                {tab === "staff" ? "Password" : "Date of Birth (YYYY-MM-DD)"}
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder={tab === "staff" ? "••••••••" : "e.g. 1990-03-15"}
                  autoComplete="current-password"
                  className="w-full bg-input-background border border-border rounded-lg px-3.5 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <Eye size={14} />
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <AlertTriangle size={13} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full bg-primary text-primary-foreground font-semibold text-sm py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          VaxCare v1.0 · Barangay Health Center · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
