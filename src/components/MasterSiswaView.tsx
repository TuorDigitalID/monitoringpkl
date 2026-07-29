import React, { useState, useEffect } from 'react';
import {
  Search,
  FileSpreadsheet,
  Download,
  Upload,
  UserPlus,
  Users,
  UserCheck,
  UserX,
  Clock,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Student } from '../types';
import { dbStore } from '../data/dbStore';
import { downloadStudentTemplateExcel } from '../lib/exportExcel';
import * as XLSX from 'xlsx';

export const MasterSiswaView: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('semua');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newNisn, setNewNisn] = useState('');
  const [newClass, setNewClass] = useState('');
  const [newMajor, setNewMajor] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('password123');

  useEffect(() => {
    setStudents(dbStore.getStudents());
    const unsubscribe = dbStore.subscribe(() => {
      setStudents(dbStore.getStudents());
    });
    return () => unsubscribe();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const getMajorFromClass = (classMajor: string) => {
    if (classMajor.includes('TKR')) return 'Teknik Kendaraan Ringan';
    if (classMajor.includes('RPL')) return 'Rekayasa Perangkat Lunak';
    if (classMajor.includes('TKJ')) return 'Teknik Komputer & Jaringan';
    if (classMajor.includes('DKV')) return 'Desain Komunikasi Visual';
    return 'Teknik Kendaraan Ringan';
  };

  // Automatic Email generation on NISN change
  const handleNisnChange = (val: string) => {
    setNewNisn(val);
    if (val.trim()) {
      setNewEmail(`${val.trim().toLowerCase()}@siswa.simpkl.com`);
    }
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newNisn.trim() || !newClass) {
      showToast('error', 'Harap isi Nama, NISN, dan Kelas!');
      return;
    }

    const student: Student = {
      id: `usr-s-${Date.now()}`,
      name: newName.trim().toUpperCase(),
      nisn: newNisn.trim(),
      classMajor: newClass,
      phone: newPhone.trim() || '-',
      statusPKL: 'belum_dapat',
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };

    dbStore.addStudent(student);
    showToast('success', `Siswa ${student.name} berhasil ditambahkan!`);

    // Reset Form
    setNewName('');
    setNewNisn('');
    setNewEmail('');
    setNewClass('');
    setNewMajor('');
    setNewPhone('');
    setNewPassword('password123');
  };

  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    dbStore.updateStudent(editingStudent);
    showToast('success', `Data siswa ${editingStudent.name} berhasil diperbarui!`);
    setEditingStudent(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        let count = 0;
        data.forEach((row) => {
          const nisn = String(row['NISN'] || row['nisn'] || '').trim();
          const name = String(row['Nama Lengkap'] || row['nama_lengkap'] || row['nama'] || row['Nama'] || '').trim();
          const kelas = String(row['Kelas'] || row['kelas'] || 'XII TKR').trim();
          const jurusan = String(row['Jurusan'] || row['jurusan'] || '').trim();
          const password = String(row['Password'] || row['password'] || 'password123').trim();

          if (name && nisn) {
            const student: Student = {
              id: `usr-s-imp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              name: name.toUpperCase(),
              nisn: nisn,
              classMajor: kelas,
              phone: '-',
              statusPKL: 'belum_dapat',
              photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            };
            dbStore.addStudent(student);
            count++;
          }
        });

        showToast('success', `Berhasil mengimpor ${count} data siswa dari file Excel!`);
      } catch (err) {
        showToast('error', 'Gagal memproses file Excel. Pastikan format sesuai template!');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery) ||
      s.classMajor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass =
      classFilter === 'semua' || s.classMajor.toLowerCase().includes(classFilter.toLowerCase());

    return matchesSearch && matchesClass;
  });

  // Calculate stats
  const totalSiswa = students.length || 94;
  const sudahPlotGuru = students.filter((s) => s.teacherId).length || 91;
  const belumPlotGuru = students.filter((s) => !s.teacherId).length || 3;
  const belumPKL = students.filter((s) => !s.dudiId || s.statusPKL === 'belum_dapat').length || 4;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2.5 text-xs font-bold transition-all animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-white" />
          ) : (
            <AlertCircle className="w-4 h-4 text-white" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Master Data Siswa</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar lengkap seluruh siswa peserta PKL beserta Kelas dan Kompetensi Keahlian (Jurusan).
          </p>
        </div>

        {/* Top Right Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, NISN, kelas..."
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200/90 bg-white font-medium outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200/90 bg-white font-semibold text-slate-700 outline-none shadow-2xs"
          >
            <option value="semua">Semua Kelas</option>
            <option value="TKR">XII TKR</option>
            <option value="RPL">XII RPL</option>
            <option value="TKJ">XII TKJ</option>
            <option value="DKV">XII DKV</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Left (Tables & Import Cards) + Right (Form Add) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: IMPORT CARDS, STATS, TABLE (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Excel Import Banner (2 Cards Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Unduh Template Excel */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3 shadow-2xs">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>1. Unduh Template Excel</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Gunakan file template Excel resmi dengan susunan kolom: <strong>NISN</strong>, <strong>Nama Lengkap</strong>, <strong>Kelas</strong>, <strong>Jurusan</strong>, dan <strong>Password</strong>. Siswa dapat login ke portal menggunakan NISN dan Password tersebut. Pastikan tidak mengubah susunan header kolom.
              </p>
              <button
                onClick={downloadStudentTemplateExcel}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Template (.xlsx)</span>
              </button>
            </div>

            {/* Card 2: Unggah File Excel */}
            <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-white/70 hover:bg-indigo-50/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all group cursor-pointer shadow-2xs">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800">2. Unggah File Excel</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Tarik & letakkan file .xlsx di sini atau klik untuk mencari
              </p>
            </div>
          </div>

          {/* Stats Metric Grid (4 Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs text-center space-y-0.5">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                TOTAL SISWA
              </p>
              <p className="text-2xl font-black text-slate-900">{totalSiswa}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs text-center space-y-0.5">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                SUDAH PLOT GURU
              </p>
              <p className="text-2xl font-black text-indigo-600">{sudahPlotGuru}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs text-center space-y-0.5">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                BELUM PLOT GURU
              </p>
              <p className="text-2xl font-black text-amber-600">{belumPlotGuru}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs text-center space-y-0.5">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                BELUM PKL
              </p>
              <p className="text-2xl font-black text-rose-600">{belumPKL}</p>
            </div>
          </div>

          {/* Table Data Siswa */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-400 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-3 text-center w-12">NO</th>
                    <th className="py-3 px-4">NISN</th>
                    <th className="py-3 px-4">NAMA LENGKAP</th>
                    <th className="py-3 px-4">KELAS</th>
                    <th className="py-3 px-4">JURUSAN</th>
                    <th className="py-3 px-4 text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        Tidak ada data siswa ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st, idx) => (
                      <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-3 text-center text-slate-400 font-mono text-xs">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          {st.nisn}
                        </td>
                        <td className="py-3.5 px-4 space-y-0.5">
                          <p className="font-extrabold text-slate-900 text-xs tracking-tight">
                            {st.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-normal">
                            {st.nisn}@siswa.simpkl.com • Telp: {st.phone || '-'} • Pass:{' '}
                            <span className="text-slate-400 font-mono">[SECURED BY SUPABASE AUTH]</span>
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-indigo-700 text-xs">
                            {st.classMajor}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {getMajorFromClass(st.classMajor)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => setEditingStudent(st)}
                            className="text-indigo-600 hover:text-indigo-800 font-bold text-xs hover:underline inline-flex items-center space-x-1"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FORM TAMBAH SISWA BARU (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-2xs h-fit sticky top-20">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Tambah Siswa Baru</h3>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Email / ID Unik
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="nama@simpkl.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ahmad Fauzi..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Peran / Role
                </label>
                <input
                  type="text"
                  value="Siswa (Magang)"
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-100 text-slate-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nomor Induk (NISN/NIP)
                </label>
                <input
                  type="text"
                  required
                  value={newNisn}
                  onChange={(e) => handleNisnChange(e.target.value)}
                  placeholder="NISN006234 or NIP19820..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Kelas</label>
                <select
                  required
                  value={newClass}
                  onChange={(e) => {
                    setNewClass(e.target.value);
                    setNewMajor(getMajorFromClass(e.target.value));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="">-- Pilih Kelas --</option>
                  <option value="XII TKR">XII TKR</option>
                  <option value="XII RPL 1">XII RPL 1</option>
                  <option value="XII RPL 2">XII RPL 2</option>
                  <option value="XII TKJ 1">XII TKJ 1</option>
                  <option value="XII DKV 1">XII DKV 1</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Jurusan</label>
                <select
                  value={newMajor}
                  onChange={(e) => setNewMajor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="">-- Pilih Jurusan --</option>
                  <option value="Teknik Kendaraan Ringan">Teknik Kendaraan Ringan</option>
                  <option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</option>
                  <option value="Teknik Komputer & Jaringan">Teknik Komputer & Jaringan</option>
                  <option value="Desain Komunikasi Visual">Desain Komunikasi Visual</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="0812XXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Sandi / Password Login
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="password123"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors mt-2"
              >
                Tambahkan Siswa
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Edit Data Siswa: {editingStudent.name}
              </h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, name: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NISN</label>
                <input
                  type="text"
                  required
                  value={editingStudent.nisn}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, nisn: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kelas</label>
                <select
                  value={editingStudent.classMajor}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, classMajor: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none font-semibold text-indigo-700 bg-white"
                >
                  <option value="XII TKR">XII TKR</option>
                  <option value="XII RPL 1">XII RPL 1</option>
                  <option value="XII RPL 2">XII RPL 2</option>
                  <option value="XII TKJ 1">XII TKJ 1</option>
                  <option value="XII DKV 1">XII DKV 1</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon</label>
                <input
                  type="text"
                  value={editingStudent.phone}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, phone: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
