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
  FolderOpen,
  Award,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock
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
  activeMenuItem = 'monitoring',
  setActiveMenuItem
}) => {
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({
    aktivitas: true,
    master: true,
    laporan: true,
    keamanan: true,
    guru_utama: true,
    guru_supervisi: true,
    siswa_utama: true,
    dudi_utama: true,
  });

  const toggleGroup = (groupKey: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const handleSelectMenu = (menuId: string) => {
    if (setActiveMenuItem) {
      setActiveMenuItem(menuId);
    }
  };

  const role = currentUser.role;

  // -------------------------------------------------------------
  // 1. RENDER SIDEBAR FOR GURU PEMBIMBING
  // -------------------------------------------------------------
  if (role === 'guru') {
    return (
      <aside className="w-full lg:w-64 bg-white border border-slate-200/90 rounded-2xl p-4 space-y-4 shrink-0 h-fit shadow-xs">
        {/* Title */}
        <div className="px-1 border-b border-slate-100 pb-2 flex items-center justify-between">
          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider flex items-center space-x-1">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>MENU GURU PEMBIMBING</span>
          </p>
        </div>

        {/* Dashboard Ringkasan Guru */}
        <button
          onClick={() => handleSelectMenu('guru_dashboard')}
          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
            activeMenuItem === 'guru_dashboard' || !activeMenuItem.startsWith('guru_')
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs font-extrabold'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="flex items-center space-x-2">
            <LayoutDashboard className="w-4 h-4 text-emerald-600" />
            <span>Dashboard Bimbingan</span>
          </span>
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800">
            UTAMA
          </span>
        </button>

        {/* GROUP: BIMBINGAN & MONITOTING */}
        <div className="space-y-1">
          <button
            onClick={() => toggleGroup('guru_utama')}
            className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
          >
            <span className="flex items-center space-x-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>BIMBINGAN & LOGBOOK</span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                openGroups.guru_utama ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openGroups.guru_utama && (
            <div className="pl-1 pt-1 space-y-1">
              <button
                onClick={() => handleSelectMenu('guru_jurnal')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
                  activeMenuItem === 'guru_jurnal'
                    ? 'bg-emerald-600 text-white font-extrabold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-500" />
                <span>Verifikasi Jurnal Siswa</span>
              </button>

              <button
                onClick={() => handleSelectMenu('guru_presensi')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
                  activeMenuItem === 'guru_presensi'
                    ? 'bg-emerald-600 text-white font-extrabold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>Monitoring Presensi</span>
              </button>
            </div>
          )}
        </div>

        {/* GROUP: SUPERVISI & PENILAIAN */}
        <div className="space-y-1">
          <button
            onClick={() => toggleGroup('guru_supervisi')}
            className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
          >
            <span className="flex items-center space-x-1.5">
              <Award className="w-3.5 h-3.5 text-slate-400" />
              <span>SUPERVISI & PENILAIAN</span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                openGroups.guru_supervisi ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openGroups.guru_supervisi && (
            <div className="pl-1 pt-1 space-y-1">
              <button
                onClick={() => handleSelectMenu('guru_supervisi')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
                  activeMenuItem === 'guru_supervisi'
                    ? 'bg-emerald-600 text-white font-extrabold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>Catat Kunjungan DUDI</span>
              </button>

              <button
                onClick={() => handleSelectMenu('guru_nilai')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
                  activeMenuItem === 'guru_nilai'
                    ? 'bg-emerald-600 text-white font-extrabold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Award className="w-4 h-4 text-emerald-500" />
                <span>Input Nilai Sekolah (40%)</span>
              </button>
            </div>
          )}
        </div>

        {/* Tools */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <button
            onClick={() => exportGradesToExcel(dbStore.getGrades())}
            className="w-full text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs font-bold text-slate-700 hover:text-emerald-800 flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel Nilai Bimbingan</span>
          </button>
        </div>
      </aside>
    );
  }

  // -------------------------------------------------------------
  // 2. RENDER SIDEBAR FOR SISWA PKL
  // -------------------------------------------------------------
  if (role === 'siswa') {
    return (
      <aside className="w-full lg:w-64 bg-white border border-slate-200/90 rounded-2xl p-4 space-y-4 shrink-0 h-fit shadow-xs">
        {/* Title */}
        <div className="px-1 border-b border-slate-100 pb-2 flex items-center justify-between">
          <p className="text-[10px] font-black text-blue-700 uppercase tracking-wider flex items-center space-x-1">
            <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>MENU SISWA PKL</span>
          </p>
        </div>

        {/* Dashboard Ringkasan Siswa */}
        <button
          onClick={() => handleSelectMenu('siswa_dashboard')}
          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
            activeMenuItem === 'siswa_dashboard' || !activeMenuItem.startsWith('siswa_')
              ? 'bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs font-extrabold'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="flex items-center space-x-2">
            <LayoutDashboard className="w-4 h-4 text-blue-600" />
            <span>Dashboard PKL</span>
          </span>
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-100 text-blue-800">
            UTAMA
          </span>
        </button>

        {/* GROUP: AKTIVITAS HARIAN */}
        <div className="space-y-1">
          <button
            onClick={() => toggleGroup('siswa_utama')}
            className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
          >
            <span className="flex items-center space-x-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>AKTIVITAS HARIAN</span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                openGroups.siswa_utama ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openGroups.siswa_utama && (
            <div className="pl-1 pt-1 space-y-1">
              <button
                onClick={() => handleSelectMenu('siswa_jurnal')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
                  activeMenuItem === 'siswa_jurnal'
                    ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Jurnal Harian Logbook</span>
              </button>

              <button
                onClick={() => handleSelectMenu('siswa_presensi')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
                  activeMenuItem === 'siswa_presensi'
                    ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Presensi Harian (GPS)</span>
              </button>

              <button
                onClick={() => handleSelectMenu('siswa_sertifikat')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
                  activeMenuItem === 'siswa_sertifikat'
                    ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Award className="w-4 h-4 text-blue-500" />
                <span>Sertifikat & Nilai PKL</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    );
  }

  // -------------------------------------------------------------
  // 3. RENDER SIDEBAR FOR PEMBIMBING DUDI / INDUSTRI
  // -------------------------------------------------------------
  if (role === 'dudi') {
    return (
      <aside className="w-full lg:w-64 bg-white border border-slate-200/90 rounded-2xl p-4 space-y-4 shrink-0 h-fit shadow-xs">
        {/* Title */}
        <div className="px-1 border-b border-slate-100 pb-2 flex items-center justify-between">
          <p className="text-[10px] font-black text-purple-700 uppercase tracking-wider flex items-center space-x-1">
            <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>MENU PEMBIMBING DUDI</span>
          </p>
        </div>

        {/* Dashboard Ringkasan DUDI */}
        <button
          onClick={() => handleSelectMenu('dudi_dashboard')}
          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
            activeMenuItem === 'dudi_dashboard' || !activeMenuItem.startsWith('dudi_')
              ? 'bg-purple-50 text-purple-800 border border-purple-200 shadow-2xs font-extrabold'
              : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="flex items-center space-x-2">
            <LayoutDashboard className="w-4 h-4 text-purple-600" />
            <span>Dashboard Industri</span>
          </span>
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-purple-100 text-purple-800">
            UTAMA
          </span>
        </button>

        {/* GROUP: DUDI TASKS */}
        <div className="space-y-1">
          <button
            onClick={() => toggleGroup('dudi_utama')}
            className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
          >
            <span className="flex items-center space-x-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>TUGAS PEMBIMBING DUDI</span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                openGroups.dudi_utama ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openGroups.dudi_utama && (
            <div className="pl-1 pt-1 space-y-1">
              <button
                onClick={() => handleSelectMenu('dudi_presensi')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
                  activeMenuItem === 'dudi_presensi'
                    ? 'bg-purple-600 text-white font-extrabold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-purple-500" />
                <span>Validasi Presensi Siswa</span>
              </button>

              <button
                onClick={() => handleSelectMenu('dudi_jurnal')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
                  activeMenuItem === 'dudi_jurnal'
                    ? 'bg-purple-600 text-white font-extrabold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-purple-500" />
                <span>Verifikasi Jurnal Harian</span>
              </button>

              <button
                onClick={() => handleSelectMenu('dudi_nilai')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
                  activeMenuItem === 'dudi_nilai'
                    ? 'bg-purple-600 text-white font-extrabold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Award className="w-4 h-4 text-purple-500" />
                <span>Penilaian Kinerja (60%)</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    );
  }

  // -------------------------------------------------------------
  // 4. RENDER SIDEBAR FOR ADMINISTRATOR (SUPER ADMIN)
  // -------------------------------------------------------------
  return (
    <aside className="w-full lg:w-64 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-4 shrink-0 h-fit shadow-xs">
      {/* Title */}
      <div className="px-1 border-b border-slate-200/60 pb-2">
        <p className="text-[10px] font-black text-orange-700 uppercase tracking-wider flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-orange-600 shrink-0" />
          <span>MENU KONTROL ADMIN</span>
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
          className="w-full text-left px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center space-x-2 transition-colors shadow-2xs cursor-pointer"
        >
          <Database className="w-4 h-4 text-emerald-600" />
          <span>Integrasi Supabase</span>
        </button>

        <button
          onClick={() => exportGradesToExcel(dbStore.getGrades())}
          className="w-full text-left px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center space-x-2 transition-colors shadow-2xs cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          <span>Ekspor Excel Laporan</span>
        </button>
      </div>
    </aside>
  );
};
