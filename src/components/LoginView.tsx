import React, { useState } from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  Mail,
  Lock,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  ShieldCheck,
  Building2,
  Sparkles
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
      setErrorMessage('Harap masukkan NISN, Email, atau NIP Anda.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = dbStore.login(identifier, password);
      setIsLoading(false);

      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(res.message || 'Gagal masuk. Periksa kembali NISN/Email dan Kata Sandi.');
      }
    }, 400);
  };

  const handleQuickLogin = (role: 'siswa' | 'guru' | 'admin') => {
    setIsLoading(true);
    setTimeout(() => {
      dbStore.setCurrentRole(role);
      dbStore.login(role);
      setIsLoading(false);
      onLoginSuccess();
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 font-sans text-slate-900 flex flex-col antialiased">
      {/* 1. HEADER (DISAMAKAN DENGAN SISTEM) */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Name */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    SIM PKL SMK MA
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-indigo-50 text-indigo-700 uppercase tracking-wider border border-indigo-200/60">
                    v1.2
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Sistem Informasi Manajemen Praktik Kerja Lapangan
                </p>
              </div>
            </div>

            {/* Right Action: Dashboard PKL Button */}
            <button
              onClick={() => handleQuickLogin('admin')}
              className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 font-bold text-xs flex items-center space-x-2 shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-600" />
              <span>Dashboard PKL</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN LOGIN FORM SECTION */}
      <main className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-7 sm:p-9 max-w-md w-full space-y-6">
          {/* Card Title Header */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
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

          {/* Database Connection Pill Status */}
          <div
            onClick={onOpenSupabaseModal}
            className="bg-amber-50/90 hover:bg-amber-100/70 border border-amber-200/80 rounded-2xl p-3.5 space-y-1 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">
                KONEKSI DATABASE
              </span>
              <span className="font-extrabold text-amber-700 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block"></span>
                <span>
                  {isSupabaseConnected ? 'Terhubung Supabase Cloud' : 'Cloud Offline (Sinking Lokal)'}
                </span>
              </span>
            </div>
            <p className="font-mono text-[11px] text-slate-500 truncate group-hover:text-indigo-600 transition-colors">
              Host: {supabaseConfig.url || 'eppbwhvtezpcbukcshxu.supabase.co'}
            </p>
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
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-slate-200/90 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
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
                  className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200/90 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
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
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              <span>{isLoading ? 'Memproses...' : 'Masuk Sekarang'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Login Chips for Easy Demo Testing */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Akses Cepat Mode Demo:</span>
              <Sparkles className="w-3 h-3 text-amber-500" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('siswa')}
                className="p-2 rounded-xl bg-blue-50/80 hover:bg-blue-100 text-blue-700 border border-blue-200/60 font-bold text-[11px] flex items-center justify-center space-x-1.5 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">Siswa</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('guru')}
                className="p-2 rounded-xl bg-emerald-50/80 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 font-bold text-[11px] flex items-center justify-center space-x-1.5 transition-colors"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Guru</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2 rounded-xl bg-amber-50/80 hover:bg-amber-100 text-amber-800 border border-amber-200/60 font-bold text-[11px] flex items-center justify-center space-x-1.5 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">Admin</span>
              </button>
            </div>
          </div>

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
            <span className="text-indigo-600 font-extrabold">tutordigital.id</span>
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            Sistem Manajemen Praktik Kerja Lapangan
          </p>
        </div>
      </footer>
    </div>
  );
};
