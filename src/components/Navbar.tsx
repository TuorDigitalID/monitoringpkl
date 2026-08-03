import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Database,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  ShieldCheck,
  ChevronDown,
  BarChart3,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { User, UserRole } from '../types';
import { dbStore } from '../data/dbStore';
import { getStoredSupabaseConfig } from '../lib/supabase';

interface NavbarProps {
  currentUser: User;
  onOpenSupabaseModal: () => void;
  activeNavTab?: string;
  setActiveNavTab?: (tab: string) => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenSupabaseModal,
  activeNavTab = 'dashboard',
  setActiveNavTab,
  onLogout
}) => {
  const [activeRole, setActiveRole] = useState<UserRole>(currentUser.role);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  useEffect(() => {
    setActiveRole(currentUser.role);
    const config = getStoredSupabaseConfig();
    setSupabaseConnected(!!(config.url && config.anonKey));
  }, [currentUser]);

  const handleRoleChange = (role: UserRole) => {
    dbStore.setCurrentRole(role);
    setShowRoleDropdown(false);
  };

  return (
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
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  currentUser.role === 'admin'
                    ? 'bg-orange-100 text-orange-700'
                    : currentUser.role === 'guru'
                    ? 'bg-emerald-100 text-emerald-700'
                    : currentUser.role === 'dudi'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {currentUser.role === 'admin' ? 'SUPER ADMIN' : currentUser.role === 'guru' ? 'GURU' : currentUser.role === 'dudi' ? 'INDUSTRI DUDI' : 'SISWA'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Sistem Informasi Manajemen Praktik Kerja Lapangan
              </p>
            </div>
          </div>

          {/* Center / Right Header Navigation Elements */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Nav Tabs */}
            <div className="hidden lg:flex items-center space-x-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-200/70">
              <button
                onClick={() => setActiveNavTab && setActiveNavTab('dashboard')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeNavTab === 'dashboard'
                    ? 'bg-orange-50 text-orange-700 border border-orange-200/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard PKL</span>
              </button>

              <button
                onClick={() => setActiveNavTab && setActiveNavTab('stats')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeNavTab === 'stats'
                    ? 'bg-orange-50 text-orange-700 border border-orange-200/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Statistik & Hasil</span>
              </button>
            </div>

            {/* Active Session Badge */}
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Sesi Aktif (Auto Logout 10m)</span>
            </div>

            {/* Supabase Database Connection Pill */}
            <button
              onClick={onOpenSupabaseModal}
              className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                supabaseConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
              title="Kelola Koneksi Database Supabase"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Supabase</span>
              {supabaseConnected ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* User Role Quick Switch Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center space-x-1.5 text-right px-2.5 py-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-[11px] font-black text-slate-900 leading-tight uppercase truncate max-w-[140px]">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] font-bold text-orange-600 leading-tight uppercase">
                    {activeRole === 'admin' ? 'SUPER ADMIN' : activeRole === 'guru' ? 'GURU' : activeRole === 'dudi' ? 'INDUSTRI DUDI' : 'SISWA'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-1 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Pilih Peran Akun:
                  </div>
                  <button
                    onClick={() => handleRoleChange('admin')}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2 hover:bg-orange-50 transition-colors cursor-pointer ${
                      activeRole === 'admin' ? 'bg-orange-50 font-bold text-orange-700' : 'text-slate-700'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-orange-600" />
                    <div>
                      <div>Super Admin / Koordinator</div>
                      <div className="text-[10px] text-slate-400 font-normal">Plotting & Kelola Akun</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleChange('guru')}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2 hover:bg-emerald-50 transition-colors cursor-pointer ${
                      activeRole === 'guru' ? 'bg-emerald-50 font-bold text-emerald-700' : 'text-slate-700'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div>Guru Pembimbing</div>
                      <div className="text-[10px] text-slate-400 font-normal">Validasi Jurnal & Bimbingan</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleChange('dudi')}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2 hover:bg-purple-50 transition-colors cursor-pointer ${
                      activeRole === 'dudi' ? 'bg-purple-50 font-bold text-purple-700' : 'text-slate-700'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-purple-600" />
                    <div>
                      <div>Pembimbing DUDI</div>
                      <div className="text-[10px] text-slate-400 font-normal">Validasi Presensi & Nilai Industri</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleChange('siswa')}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2 hover:bg-blue-50 transition-colors cursor-pointer ${
                      activeRole === 'siswa' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-700'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <div>
                      <div>Siswa PKL</div>
                      <div className="text-[10px] text-slate-400 font-normal">Input Jurnal & Presensi GPS</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Exit / Keluar Button */}
            <button
              onClick={() => {
                dbStore.logout();
                if (onLogout) onLogout();
              }}
              className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/80 text-rose-600 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Keluar dari Akun"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

