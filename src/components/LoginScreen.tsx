/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, Shield, Key, Eye, EyeOff, BookOpen, AlertCircle } from "lucide-react";
import { Musyrif } from "../types";

interface LoginScreenProps {
  onLoginSuccess: (role: "admin" | "musyrif", user?: Musyrif) => void;
  musyrifs: Musyrif[];
  adminPass: string;
  sessionExpired?: boolean;
}

export default function LoginScreen({ onLoginSuccess, musyrifs, adminPass, sessionExpired }: LoginScreenProps) {
  const [role, setRole] = useState<"admin" | "musyrif">("musyrif");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate small latency for premium UI feeling
    setTimeout(() => {
      if (role === "admin") {
        if (username.trim() === "admin" && password === adminPass) {
          onLoginSuccess("admin");
        } else {
          setError("Username atau Password Admin salah.");
          setIsLoading(false);
        }
      } else {
        // Musyrif login can be by username or NIK
        const found = musyrifs.find(
          (m) =>
            (m.username.toLowerCase() === username.toLowerCase() || m.nik === username) &&
            m.passwordHash === password
        );

        if (found) {
          onLoginSuccess("musyrif", found);
        } else {
          setError("Username/NIK atau Password Musyrif salah.");
          setIsLoading(false);
        }
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative subtle emerald blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-50 rounded-full filter blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-100 rounded-full filter blur-3xl opacity-40 translate-x-1/2 translate-y-1/2"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <img
            src="https://www.alirsyad.or.id/wp-content/uploads/download/alirsyad-alislamiyyah.png"
            alt="Logo Al Irsyad"
            className="w-24 h-24 object-contain filter drop-shadow-md hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Sistem Capaian Tahfidz
        </h2>
        <p className="mt-2 text-center text-sm font-semibold text-brand-700 tracking-wide uppercase">
          SMP Al Irsyad Surakarta
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-100 sm:px-10">
          {/* Role selector tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl mb-6">
            <button
              onClick={() => {
                setRole("musyrif");
                setError("");
                setUsername("");
                setPassword("");
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                role === "musyrif"
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              id="tab-login-musyrif"
            >
              <User className="w-3.5 h-3.5" />
              MUSYRIF / GURU
            </button>
            <button
              onClick={() => {
                setRole("admin");
                setError("");
                setUsername("");
                setPassword("");
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                role === "admin"
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              id="tab-login-admin"
            >
              <Shield className="w-3.5 h-3.5" />
              ADMINISTRATOR
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2.5 text-rose-800 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {sessionExpired && !error && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2.5 text-amber-800 text-sm animate-pulse">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
              <span>Sesi Anda telah berakhir karena tidak ada aktivitas selama 15 menit. Silakan masuk kembali.</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {role === "admin" ? "Username" : "Username atau NIK"}
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition-all"
                  placeholder={role === "admin" ? "Contoh: admin" : "NIK atau nama pengguna"}
                  id="login-username-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition-all"
                  placeholder="••••••••"
                  id="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  id="btn-toggle-password"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-brand-700 hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-all transform active:scale-95"
                id="btn-login-submit"
              >
                {isLoading ? "Memproses..." : "Masuk ke Sistem"}
              </button>
            </div>
          </form>


        </div>
      </div>

      {/* Copyright Footer */}
      <div className="mt-8 text-center text-[11.5px] text-slate-400 relative z-10 font-medium tracking-wide">
        Copyright © 2026 HUMAS SMP AL IRSYAD SURAKARTA
      </div>
    </div>
  );
}
