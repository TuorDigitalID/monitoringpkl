import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  FileSpreadsheet,
  Plus,
  ShieldCheck,
  FileText,
  Sparkles,
  BarChart3,
  Search,
  CheckCircle,
  MapPin,
  GraduationCap,
  Clock,
  Calendar,
  Filter,
  UserCheck,
  ChevronDown,
  Edit2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Dudi, Student, Teacher } from '../types';
import { dbStore } from '../data/dbStore';
import { exportStudentsToExcel, exportDudisToExcel } from '../lib/exportExcel';
import { LetterGeneratorModal } from './LetterGeneratorModal';
import { MasterSiswaView } from './MasterSiswaView';
import { MasterKelasView } from './MasterKelasView';
import { MasterDudiView } from './MasterDudiView';
import { MasterGuruView } from './MasterGuruView';
import { PlottingSiswaView } from './PlottingSiswaView';
import { UserManagementView } from './UserManagementView';

interface AdminDashboardProps {
  activeMenuItem?: string;
  setActiveMenuItem?: (item: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeMenuItem = 'plotting' }) => {
  const [dudis, setDudis] = useState<Dudi[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('semua');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form Add DUDI
  const [newDudiName, setNewDudiName] = useState('');
  const [newDudiCategory, setNewDudiCategory] = useState('Teknologi Informasi & IT');
  const [newDudiCity, setNewDudiCity] = useState('Jakarta Pusat');
  const [newDudiQuota, setNewDudiQuota] = useState(5);
  const [newDudiCP, setNewDudiCP] = useState('');
  const [newDudiPhone, setNewDudiPhone] = useState('');

  const loadData = () => {
    setDudis(dbStore.getDudis());
    setStudents(dbStore.getStudents());
    setTeachers(dbStore.getTeachers());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dbStore.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  const handleAddDudi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDudiName) return;

    const newDudi: Dudi = {
      id: `dudi-${Date.now()}`,
      name: newDudiName,
      category: newDudiCategory,
      address: 'Jl. Merdeka No. 12',
      city: newDudiCity,
      contactPerson: newDudiCP || 'Bpk. Hendra',
      phone: newDudiPhone || '0812-3456-7890',
      email: 'hrd@mitra.co.id',
      quota: newDudiQuota,
      assignedCount: 0,
      acceptedMajors: ['RPL', 'TKJ', 'DKV'],
      rating: 5.0,
      status: 'aktif',
    };

    dbStore.addDudi(newDudi);
    setNewDudiName('');
    setNewDudiCP('');
    setNewDudiPhone('');
  };

  const handleAssignPlacement = (studentId: string, dudiId: string, teacherId: string) => {
    const student = students.find((s) => s.id === studentId);
    const dudi = dudis.find((d) => d.id === dudiId);
    const teacher = teachers.find((t) => t.id === teacherId);

    if (student) {
      dbStore.updateStudent({
        ...student,
        dudiId: dudiId || student.dudiId,
        dudiName: dudi?.name || student.dudiName,
        teacherId: teacherId || student.teacherId,
        teacherName: teacher?.name || student.teacherName,
        statusPKL: 'sedang_pkl',
      });
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery) ||
      s.classMajor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass =
      classFilter === 'semua' || s.classMajor.toLowerCase().includes(classFilter.toLowerCase());

    const matchesStatus =
      statusFilter === 'semua' ||
      (statusFilter === 'diplot' && s.dudiId) ||
      (statusFilter === 'belum' && !s.dudiId);

    return matchesSearch && matchesClass && matchesStatus;
  });

  if (activeMenuItem === 'master_siswa') {
    return <MasterSiswaView />;
  }

  if (activeMenuItem === 'master_guru') {
    return <MasterGuruView />;
  }

  if (activeMenuItem === 'master_kelas') {
    return <MasterKelasView />;
  }

  if (activeMenuItem === 'master_dudi' || activeMenuItem === 'master_instansi') {
    return <MasterDudiView />;
  }

  if (activeMenuItem === 'kelola_akun' || activeMenuItem === 'users' || activeMenuItem === 'master_pengguna') {
    return <UserManagementView />;
  }

  if (activeMenuItem === 'plotting' || activeMenuItem === 'pemetaan') {
    return <PlottingSiswaView />;
  }

  return (
    <div className="space-y-6">
      {/* 1. TOP SUMMARY METRIC CARDS GRID (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: TOTAL SISWA */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              TOTAL SISWA
            </p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">94</p>
          </div>
        </div>

        {/* Card 2: INSTANSI PKL */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              INSTANSI PKL
            </p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">6</p>
          </div>
        </div>

        {/* Card 3: PENGAJUAN PENDING */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              PENGAJUAN PENDING
            </p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">0</p>
          </div>
        </div>

        {/* Card 4: PENGUMUMAN */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              PENGUMUMAN
            </p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">1</p>
          </div>
        </div>
      </div>

      {/* Quick Action Bar for AI Letter & Excel */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-indigo-900 text-white p-4 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-800 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Generator AI Surat Pengantar PKL & Laporan Excel</h3>
            <p className="text-xs text-indigo-200">
              Buat surat permohonan resmi secara otomatis & unduh rekap data siswa.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowLetterModal(true)}
            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generator Surat (AI)</span>
          </button>

          <button
            onClick={() => exportStudentsToExcel(students)}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Siswa (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* 2. SECTION: Persetujuan Pengajuan Tempat PKL */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Persetujuan Pengajuan Tempat PKL</h3>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            0 perlu diproses
          </span>
        </div>

        <div className="space-y-3">
          {/* Card Item 1 */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-xs">ALIF KHAIRUL SABILILLAH</span>
                <span className="text-[11px] font-mono text-slate-400">NISN: 0088888728</span>
              </div>
              <p className="text-xs text-slate-600">Mengajukan ke: ()</p>
              <p className="text-xs text-slate-500">Durasi: 14 Jul - 16 Okt 2026</p>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 self-start sm:self-center">
              DISETUJUI
            </span>
          </div>

          {/* Card Item 2 */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-xs">WAHYU RAMADHAN</span>
                <span className="text-[11px] font-mono text-slate-400">NISN: 0084394725</span>
              </div>
              <p className="text-xs text-slate-600">Mengajukan ke: ()</p>
              <p className="text-xs text-slate-500">Durasi: 14 Jul - 16 Okt 2026</p>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 self-start sm:self-center">
              DISETUJUI
            </span>
          </div>

          {/* Card Item 3 */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-xs">MUHAMAD ANDREYANSYAH</span>
                <span className="text-[11px] font-mono text-slate-400">NISN: 3093916315</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Mengajukan ke: Bengkel ATA Motor (Gintung-Sukadiri)
              </p>
              <p className="text-xs text-slate-500">Durasi: 14 Jul - 16 Okt 2026</p>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 self-start sm:self-center">
              DISETUJUI
            </span>
          </div>
        </div>
      </div>

      {/* 3. SECTION: Pemetaan (Plotting) Instansi & Guru Pembimbing Siswa */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Pemetaan (Plotting) Instansi & Guru Pembimbing Siswa
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hubungkan setiap siswa magang dengan Instansi PKL dan Guru Pembimbing masing-masing.
            </p>
          </div>

          {/* Right Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau NISN..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 outline-none bg-white focus:border-indigo-500"
              />
            </div>

            {/* Class Dropdown */}
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none"
            >
              <option value="semua">Semua Kelas</option>
              <option value="TKR">XII TKR</option>
              <option value="RPL">XII RPL</option>
              <option value="TKJ">XII TKJ</option>
              <option value="DKV">XII DKV</option>
            </select>

            {/* Status Plotting Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none"
            >
              <option value="semua">Semua Status Plotting</option>
              <option value="diplot">Sudah Diplot</option>
              <option value="belum">Belum Diplot</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-400 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">NAMA SISWA</th>
                <th className="py-3 px-4">INSTANSI PKL</th>
                <th className="py-3 px-4">GURU PEMBIMBING</th>
                <th className="py-3 px-4">TANGGAL MULAI & AKHIR PKL</th>
                <th className="py-3 px-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Column 1: Student Name & Class */}
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 text-xs">{st.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      {st.classMajor} • NISN: {st.nisn}
                    </p>
                  </td>

                  {/* Column 2: Instansi PKL Select / Name */}
                  <td className="py-3.5 px-4">
                    <select
                      value={st.dudiId || ''}
                      onChange={(e) => handleAssignPlacement(st.id, e.target.value, st.teacherId || '')}
                      className={`text-xs px-2.5 py-1.5 rounded-xl border outline-none font-semibold ${
                        st.dudiId
                          ? 'border-indigo-200 text-indigo-900 bg-indigo-50/50'
                          : 'border-slate-200 text-slate-400 italic bg-white'
                      }`}
                    >
                      <option value="">Belum diplot</option>
                      {dudis.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Column 3: Teacher Name */}
                  <td className="py-3.5 px-4">
                    <select
                      value={st.teacherId || 'usr-g-nurcholis'}
                      onChange={(e) => handleAssignPlacement(st.id, st.dudiId || '', e.target.value)}
                      className="text-xs px-2.5 py-1.5 rounded-xl border border-indigo-100 text-indigo-600 font-bold bg-white outline-none"
                    >
                      <option value="usr-g-nurcholis">NURCHOLIS MAJID,S.Kom</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Column 4: Dates */}
                  <td className="py-3.5 px-4">
                    {st.startDate && st.endDate ? (
                      <span className="text-slate-700 font-medium">
                        14 Jul - 16 Okt 2026
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Belum Diatur</span>
                    )}
                  </td>

                  {/* Column 5: Action */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => setEditingStudent(st)}
                      className="text-indigo-600 hover:text-indigo-800 font-bold text-xs hover:underline inline-flex items-center space-x-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Plot Siswa</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Plotting Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Plotting Penempatan: {editingStudent.name}
            </h3>
            <p className="text-xs text-slate-500">
              Atur Instansi DUDI, Guru Pembimbing, dan Periode PKL
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instansi DUDI Mitra</label>
                <select
                  value={editingStudent.dudiId || ''}
                  onChange={(e) => {
                    const selectedDudi = dudis.find((d) => d.id === e.target.value);
                    setEditingStudent({
                      ...editingStudent,
                      dudiId: e.target.value,
                      dudiName: selectedDudi?.name || '',
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium outline-none"
                >
                  <option value="">-- Pilih Instansi DUDI --</option>
                  {dudis.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Guru Pembimbing Sekolah</label>
                <select
                  value={editingStudent.teacherId || ''}
                  onChange={(e) => {
                    const selectedTeacher = teachers.find((t) => t.id === e.target.value);
                    setEditingStudent({
                      ...editingStudent,
                      teacherId: e.target.value,
                      teacherName: selectedTeacher?.name || '',
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium outline-none"
                >
                  <option value="">-- Pilih Guru Pembimbing --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (editingStudent) {
                    handleAssignPlacement(
                      editingStudent.id,
                      editingStudent.dudiId || '',
                      editingStudent.teacherId || ''
                    );
                    setEditingStudent(null);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
              >
                Simpan Plotting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Letter Generator Modal */}
      <LetterGeneratorModal
        isOpen={showLetterModal}
        onClose={() => setShowLetterModal(false)}
      />
    </div>
  );
};

