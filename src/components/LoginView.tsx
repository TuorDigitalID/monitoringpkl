import React, { useState } from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { dbStore } from '../data/dbStore';
import { getStoredSupabaseConfig } from '../lib/supabase';

interface LoginViewProps {
  onLoginSuccess: () => void;
  onOpenSupabaseModal: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onOpenSupabaseModal
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const supabaseConfig = getStoredSupabaseConfig();
  const isSupabaseConnected = !!(supabaseConfig.url && supabaseConfig.anonKey);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Harap masukkan NISN, Email, NIP, atau Kata Kunci Anda.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = dbStore.login(identifier, password);
      setIsLoading(false);

      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(res.message || 'Gagal masuk. Periksa kembali NISN/Email/NIP dan Kata Sandi.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 font-sans text-slate-900 flex flex-col antialiased">
      {/* 1. HEADER (DISAMAKAN DENGAN SISTEM) */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Name */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    SIM PKL SMK MA
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-orange-50 text-orange-700 uppercase tracking-wider border border-orange-200/60">
                    v1.2
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Sistem Informasi Manajemen Praktik Kerja Lapangan
                </p>
              </div>
            </div>

            {/* Right Action: Clean Badge */}
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-500">Sistem Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN LOGIN FORM SECTION */}
      <main className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-7 sm:p-9 max-w-md w-full space-y-6">
          {/* Card Title Header */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-base font-black text-slate-900 tracking-tight">
                SIM PKL SMK MA
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Selamat Datang
              </h1>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Silakan masuk menggunakan akun terdaftar Anda untuk mengelola bimbingan, jurnal, absensi, dan nilai PKL.
              </p>
            </div>
          </div>

          {/* Error Notification */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Credentials */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Input NISN / Email */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                NISN / EMAIL / NOMOR INDUK
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="NISN, Email, atau NIP"
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-slate-200/90 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                KATA SANDI
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan sandi Anda"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200/90 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              <span>{isLoading ? 'Memproses...' : 'Masuk Sekarang'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Card Bottom Footer */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold pt-2 border-t border-slate-100">
            <span>SIM PKL SMK MA</span>
            <span className="font-mono">v1.2</span>
          </div>
        </div>
      </main>

      {/* 3. FOOTER PAGE (DISAMAKAN DENGAN HEADER & BRANDING) */}
      <footer className="bg-white border-t border-slate-200/80 py-4 mt-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center text-xs text-slate-500 space-y-1">
          <p className="font-bold text-slate-700">
            SIM PKL SMK MA © 2026 • by{' '}
            <span className="text-orange-600 font-extrabold">tutordigital.id</span>
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            Sistem Manajemen Praktik Kerja Lapangan
          </p>
        </div>
      </footer>
    </div>
  );
};
