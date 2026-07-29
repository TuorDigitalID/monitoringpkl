import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  BookOpen,
  FileText,
  Bell,
  Lock,
  ChevronDown,
  Database,
  FileSpreadsheet,
  UserCheck,
  ShieldCheck,
  FolderOpen
} from 'lucide-react';
import { User } from '../types';
import { dbStore } from '../data/dbStore';
import { exportGradesToExcel } from '../lib/exportExcel';

interface SidebarProps {
  currentUser: User;
  onOpenSupabaseModal: () => void;
  activeMenuItem?: string;
  setActiveMenuItem?: (menuId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  onOpenSupabaseModal,
  activeMenuItem = 'plotting',
  setActiveMenuItem
}) => {
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({
    aktivitas: true,
    master: true,
    laporan: true,
    keamanan: true,
  });

  const toggleGroup = (groupKey: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const handleSelectMenu = (menuId: string) => {
    if (setActiveMenuItem) {
      setActiveMenuItem(menuId);
    }
  };

  return (
    <aside className="w-full lg:w-64 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-4 shrink-0 h-fit">
      {/* Title */}
      <div className="px-1">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
          MENU KONTROL ADMIN
        </p>
      </div>

      {/* Top Single Item: Dashboard Monitoring */}
      <button
        onClick={() => handleSelectMenu('monitoring')}
        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
          activeMenuItem === 'monitoring'
            ? 'bg-orange-50 text-orange-700 border border-orange-200/80 shadow-2xs font-bold'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
      >
        <span className="flex items-center space-x-2">
          <LayoutDashboard className="w-4 h-4 text-orange-600" />
          <span>Dashboard Monitoring</span>
        </span>
        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-orange-100 text-orange-700">
          RINGKASAN
        </span>
      </button>

      {/* GROUP 1: AKTIVITAS & PLOTTING */}
      <div className="space-y-1">
        <button
          onClick={() => toggleGroup('aktivitas')}
          className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
        >
          <span className="flex items-center space-x-1.5">
            <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>AKTIVITAS & PLOTTING</span>
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
              openGroups.aktivitas ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openGroups.aktivitas && (
          <div className="pl-1 pt-1 space-y-1">
            <button
              onClick={() => handleSelectMenu('plotting')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center space-x-2 ${
                activeMenuItem === 'plotting'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 font-medium'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Plotting & Pengajuan PKL</span>
            </button>
          </div>
        )}
      </div>

      {/* GROUP 2: MASTER DATA */}
      <div className="space-y-1">
        <button
          onClick={() => toggleGroup('master')}
          className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
        >
          <span className="flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>MASTER DATA</span>
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
              openGroups.master ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openGroups.master && (
          <div className="pl-1 pt-1 space-y-1">
            <button
              onClick={() => handleSelectMenu('master_siswa')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center space-x-2 ${
                activeMenuItem === 'master_siswa'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-slate-500" />
              <span>Master Data Siswa</span>
            </button>

            <button
              onClick={() => handleSelectMenu('master_guru')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center space-x-2 ${
                activeMenuItem === 'master_guru'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-slate-500" />
              <span>Master Guru Pembimbing</span>
            </button>

            <button
              onClick={() => handleSelectMenu('master_dudi')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center space-x-2 ${
                activeMenuItem === 'master_dudi'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4 text-slate-500" />
              <span>Master Instansi PKL</span>
            </button>

            <button
              onClick={() => handleSelectMenu('master_kelas')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center space-x-2 ${
                activeMenuItem === 'master_kelas'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Master Kelas & Jurusan</span>
            </button>

            <button
              onClick={() => handleSelectMenu('kelola_akun')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center space-x-2 ${
                activeMenuItem === 'kelola_akun'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <span>Kelola Akun Login</span>
            </button>
          </div>
        )}
      </div>

      {/* GROUP 3: LAPORAN & INFORMASI */}
      <div className="space-y-1">
        <button
          onClick={() => toggleGroup('laporan')}
          className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
        >
          <span className="flex items-center space-x-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>LAPORAN & INFORMASI</span>
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
              openGroups.laporan ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openGroups.laporan && (
          <div className="pl-1 pt-1 space-y-1">
            <button
              onClick={() => handleSelectMenu('laporan_nilai')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center space-x-2 ${
                activeMenuItem === 'laporan_nilai'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-500" />
              <span>Laporan Rekap Nilai</span>
            </button>

            <button
              onClick={() => handleSelectMenu('pengumuman')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center space-x-2 ${
                activeMenuItem === 'pengumuman'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Bell className="w-4 h-4 text-slate-500" />
              <span>Kelola Pengumuman</span>
            </button>
          </div>
        )}
      </div>

      {/* GROUP 4: KEAMANAN & SISTEM */}
      <div className="space-y-1">
        <button
          onClick={() => toggleGroup('keamanan')}
          className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
        >
          <span className="flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>KEAMANAN & SISTEM</span>
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
              openGroups.keamanan ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openGroups.keamanan && (
          <div className="pl-1 pt-1 space-y-1">
            <button
              onClick={() => handleSelectMenu('hak_akses')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center space-x-2 ${
                activeMenuItem === 'hak_akses'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <span>Hak Akses Menu</span>
            </button>
          </div>
        )}
      </div>

      {/* Database Quick Tools */}
      <div className="pt-4 border-t border-slate-200/80 space-y-2">
        <button
          onClick={onOpenSupabaseModal}
          className="w-full text-left px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center space-x-2 transition-colors shadow-2xs"
        >
          <Database className="w-4 h-4 text-emerald-600" />
          <span>Integrasi Supabase</span>
        </button>

        <button
          onClick={() => exportGradesToExcel(dbStore.getGrades())}
          className="w-full text-left px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center space-x-2 transition-colors shadow-2xs"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          <span>Ekspor Excel Laporan</span>
        </button>
      </div>
    </aside>
  );
};

